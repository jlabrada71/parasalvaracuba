import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { i18nMocks } from '../helpers/i18n'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

import AdminInviteForm from '../../app/components/AdminInviteForm.vue'

const setup = () => render(AdminInviteForm, { global: { mocks: i18nMocks } })

describe('AdminInviteForm', () => {
  beforeEach(() => { fetchMock.mockReset() })

  it('has a labelled email input, a role select defaulting to author, and a submit button', () => {
    setup()
    expect(screen.getByLabelText('admin.invite.email')).toBeTruthy()
    expect((screen.getByLabelText('admin.invite.role') as HTMLSelectElement).value).toBe('author')
    expect(screen.getByRole('button', { name: 'admin.invite.submit' })).toBeTruthy()
  })

  it('validates the email before calling the API', async () => {
    setup()
    await userEvent.type(screen.getByLabelText('admin.invite.email'), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: 'admin.invite.submit' }))
    expect((await screen.findByRole('alert')).textContent).toBe('auth.errors.emailInvalid')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('creates the invitation, shows the link once and emits created', async () => {
    const inv = { id: 'i1', email: 'new@example.com', role: 'admin', link: 'http://x/invite/abc', expiresAt: '2026-10-22T00:00:00Z' }
    fetchMock.mockResolvedValue(inv)
    const { emitted } = setup()
    await userEvent.type(screen.getByLabelText('admin.invite.email'), 'new@example.com')
    await userEvent.selectOptions(screen.getByLabelText('admin.invite.role'), 'admin')
    await userEvent.click(screen.getByRole('button', { name: 'admin.invite.submit' }))
    await waitFor(() => expect(emitted().created).toBeTruthy())
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/invitations', { method: 'POST', body: { email: 'new@example.com', role: 'admin' } })
    expect((screen.getByLabelText('admin.invite.linkReady') as HTMLInputElement).value).toBe('http://x/invite/abc')
  })

  it('shows the already-exists message on 409', async () => {
    fetchMock.mockRejectedValue({ statusCode: 409 })
    setup()
    await userEvent.type(screen.getByLabelText('admin.invite.email'), 'dup@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'admin.invite.submit' }))
    expect((await screen.findByRole('alert')).textContent).toBe('admin.invite.exists')
  })
})
