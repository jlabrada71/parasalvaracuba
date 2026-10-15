import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../../app/stores/userStore'

const navigateTo = vi.fn((p: string) => p)
vi.stubGlobal('defineNuxtRouteMiddleware', (fn: unknown) => fn)
vi.stubGlobal('useLocalePath', () => (p: string) => p)
vi.stubGlobal('navigateTo', navigateTo)
vi.stubGlobal('useUserStore', useUserStore)

describe('admin route middleware', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    navigateTo.mockClear()
  })

  it('redirects anonymous visitors to /login (fetching the session first if needed)', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ user: null }))
    const mw = (await import('../../app/middleware/admin')).default as () => Promise<unknown>
    await mw()
    expect(navigateTo).toHaveBeenCalledWith('/login')
  })

  it('redirects non-admin users', async () => {
    const s = useUserStore()
    s.user = { id: '1', email: 'a@b.co', role: 'author' }
    s.loaded = true
    const mw = (await import('../../app/middleware/admin')).default as () => Promise<unknown>
    await mw()
    expect(navigateTo).toHaveBeenCalledWith('/login')
  })

  it('lets admins through', async () => {
    const s = useUserStore()
    s.user = { id: '1', email: 'a@b.co', role: 'admin' }
    s.loaded = true
    const mw = (await import('../../app/middleware/admin')).default as () => Promise<unknown>
    expect(await mw()).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
  })
})
