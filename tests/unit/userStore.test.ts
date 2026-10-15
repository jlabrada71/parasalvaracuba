import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { loadEnv } from 'vite'
import { useUserStore } from '../../app/stores/userStore'

// Test credential comes from the git-ignored .env.test (TEST_PASSWORD), never from source.
const testPassword = loadEnv('test', process.cwd(), '').TEST_PASSWORD
if (!testPassword) throw new Error('TEST_PASSWORD is not set in .env.test')

const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchMock.mockReset()
  })

  it('starts logged out and not loaded', () => {
    const s = useUserStore()
    expect(s.user).toBeNull()
    expect(s.loaded).toBe(false)
    expect(s.isAdmin).toBe(false)
  })

  it('fetchMe stores the session user and marks loaded', async () => {
    fetchMock.mockResolvedValue({ email: null, user: { id: '1', email: 'a@b.co', role: 'admin' } })
    const s = useUserStore()
    await s.fetchMe()
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me')
    expect(s.user?.email).toBe('a@b.co')
    expect(s.isAdmin).toBe(true)
    expect(s.loaded).toBe(true)
  })

  it('fetchMe marks loaded even when the request fails', async () => {
    fetchMock.mockRejectedValue(new Error('boom'))
    const s = useUserStore()
    await s.fetchMe()
    expect(s.user).toBeNull()
    expect(s.loaded).toBe(true)
  })

  it('login posts credentials and stores the user', async () => {
    fetchMock.mockResolvedValue({ user: { id: '2', email: 'x@y.co', role: 'author' } })
    const s = useUserStore()
    const u = await s.login('x@y.co', testPassword)
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', { method: 'POST', body: { email: 'x@y.co', password: testPassword } })
    expect(u.role).toBe('author')
    expect(s.isAdmin).toBe(false)
  })

  it('login propagates failure and leaves the user null', async () => {
    fetchMock.mockRejectedValue({ statusCode: 401 })
    const s = useUserStore()
    await expect(s.login('x@y.co', 'bad')).rejects.toBeTruthy()
    expect(s.user).toBeNull()
  })

  it('logout clears the user', async () => {
    fetchMock.mockResolvedValueOnce({ user: { id: '1', email: 'a@b.co', role: 'admin' } }).mockResolvedValueOnce({ ok: true })
    const s = useUserStore()
    await s.login('a@b.co', testPassword)
    await s.logout()
    expect(fetchMock).toHaveBeenLastCalledWith('/api/auth/logout', { method: 'POST' })
    expect(s.user).toBeNull()
  })
})
