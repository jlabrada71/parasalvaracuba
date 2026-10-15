import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { i18nMocks } from '../helpers/i18n'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

import InviteAcceptForm from '../../app/components/InviteAcceptForm.vue'
import { useUserStore } from '../../app/stores/userStore'

function setup() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return render(InviteAcceptForm, { props: { token: 'tok123', email: 'new@example.com' }, global: { plugins: [pinia], mocks: i18nMocks } })
}

async function fill(password: string, confirm: string) {
  await userEvent.type(screen.getByLabelText('auth.invite.password'), password)
  await userEvent.type(screen.getByLabelText('auth.invite.confirm'), confirm)
  await userEvent.click(screen.getByRole('button', { name: 'auth.invite.submit' }))
}

describe('InviteAcceptForm', () => {
  beforeEach(() => { fetchMock.mockReset() })

  it('has labelled password fields and a submit button', () => {
    setup()
    expect(screen.getByLabelText('auth.invite.password')).toBeTruthy()
    expect(screen.getByLabelText('auth.invite.confirm')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'auth.invite.submit' })).toBeTruthy()
  })

  it('blocks submit when passwords differ', async () => {
    setup()
    await fill('a-long-enough-password', 'a-different-password')
    expect((await screen.findByRole('alert')).textContent).toBe('auth.errors.passwordMismatch')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts the password to the token endpoint, stores the user and emits success', async () => {
    fetchMock.mockResolvedValue({ user: { id: '9', email: 'new@example.com', role: 'author' } })
    const { emitted } = setup()
    await fill('a-long-enough-password', 'a-long-enough-password')
    await waitFor(() => expect(emitted().success).toBeTruthy())
    expect(fetchMock).toHaveBeenCalledWith('/api/invitations/tok123/accept', { method: 'POST', body: { password: 'a-long-enough-password' } })
    expect(useUserStore().user?.email).toBe('new@example.com')
  })

  it('shows the invalid-invitation message on 404', async () => {
    fetchMock.mockRejectedValue({ statusCode: 404 })
    setup()
    await fill('a-long-enough-password', 'a-long-enough-password')
    expect((await screen.findByRole('alert')).textContent).toBe('auth.invite.invalid')
  })

  it('shows the account-exists message on 409', async () => {
    fetchMock.mockRejectedValue({ statusCode: 409 })
    setup()
    await fill('a-long-enough-password', 'a-long-enough-password')
    expect((await screen.findByRole('alert')).textContent).toBe('auth.invite.exists')
  })
})
