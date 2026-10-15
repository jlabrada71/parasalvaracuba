import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { i18nMocks } from '../helpers/i18n'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

import LoginForm from '../../app/components/LoginForm.vue'

function setup() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return render(LoginForm, { global: { plugins: [pinia], mocks: i18nMocks } })
}

describe('LoginForm', () => {
  beforeEach(() => { fetchMock.mockReset() })

  it('exposes labelled fields and a submit button (accessibility)', () => {
    setup()
    expect(screen.getByLabelText('auth.login.email')).toBeTruthy()
    expect(screen.getByLabelText('auth.login.password')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'auth.login.submit' })).toBeTruthy()
  })

  it('shows validation errors as alerts and does not call the API', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'auth.login.submit' }))
    const alerts = await screen.findAllByRole('alert')
    expect(alerts.map(a => a.textContent)).toEqual(expect.arrayContaining(['auth.errors.emailRequired', 'auth.errors.passwordRequired']))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('submits credentials and emits success with the user', async () => {
    fetchMock.mockResolvedValue({ user: { id: '1', email: 'a@b.co', role: 'admin' } })
    const { emitted } = setup()
    await userEvent.type(screen.getByLabelText('auth.login.email'), 'a@b.co')
    await userEvent.type(screen.getByLabelText('auth.login.password'), 'some-password-1')
    await userEvent.click(screen.getByRole('button', { name: 'auth.login.submit' }))
    await waitFor(() => expect(emitted().success).toBeTruthy())
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', { method: 'POST', body: { email: 'a@b.co', password: 'some-password-1' } })
  })

  it('shows a generic alert on 401', async () => {
    fetchMock.mockRejectedValue({ statusCode: 401 })
    setup()
    await userEvent.type(screen.getByLabelText('auth.login.email'), 'a@b.co')
    await userEvent.type(screen.getByLabelText('auth.login.password'), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: 'auth.login.submit' }))
    expect((await screen.findByRole('alert')).textContent).toBe('auth.login.failed')
  })

  it('shows the rate-limit message on 429', async () => {
    fetchMock.mockRejectedValue({ statusCode: 429 })
    setup()
    await userEvent.type(screen.getByLabelText('auth.login.email'), 'a@b.co')
    await userEvent.type(screen.getByLabelText('auth.login.password'), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: 'auth.login.submit' }))
    expect((await screen.findByRole('alert')).textContent).toBe('auth.login.tooMany')
  })
})
