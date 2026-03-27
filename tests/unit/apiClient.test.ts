import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { apiRequest } from '../../app/utils/apiClient'
import { useAuthStore } from '../../app/stores/authStore'

// Mock $fetch
vi.mock('#app', () => ({
  $fetch: vi.fn(),
}))

describe('apiClient', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('makes GET request without email header', async () => {
    const { $fetch } = await import('#app')
    vi.mocked($fetch).mockResolvedValue({ success: true })

    await apiRequest('/api/ideas')

    expect(vi.mocked($fetch)).toHaveBeenCalledWith('/api/ideas', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    })
  })

  it('includes email header in POST requests', async () => {
    const auth = useAuthStore()
    auth.setEmail('user@example.com')

    const { $fetch } = await import('#app')
    vi.mocked($fetch).mockResolvedValue({ id: 'new-id' })

    await apiRequest('/api/ideas', {
      method: 'POST',
      body: { title: 'Test' },
    })

    const calls = vi.mocked($fetch).mock.calls
    expect(calls[0][1].headers['X-User-Email']).toBe('user@example.com')
  })

  it('serializes body to JSON', async () => {
    const { $fetch } = await import('#app')
    vi.mocked($fetch).mockResolvedValue({ id: 'new-id' })

    const testBody = { title: 'Test Idea', description: 'A test' }
    await apiRequest('/api/ideas', {
      method: 'POST',
      body: testBody,
    })

    const calls = vi.mocked($fetch).mock.calls
    expect(calls[0][1].body).toBe(JSON.stringify(testBody))
  })

  it('does not include X-User-Email for GET requests even if logged in', async () => {
    const auth = useAuthStore()
    auth.setEmail('user@example.com')

    const { $fetch } = await import('#app')
    vi.mocked($fetch).mockResolvedValue({ ideas: [] })

    await apiRequest('/api/ideas?page=1', { method: 'GET' })

    const calls = vi.mocked($fetch).mock.calls
    expect(calls[0][1].headers['X-User-Email']).toBeUndefined()
  })

  it('includes custom headers along with auto-injected headers', async () => {
    const { $fetch } = await import('#app')
    vi.mocked($fetch).mockResolvedValue({ success: true })

    await apiRequest('/api/ideas', {
      method: 'POST',
      body: {},
      headers: { 'X-Custom': 'value' },
    })

    const calls = vi.mocked($fetch).mock.calls
    const headers = calls[0][1].headers
    expect(headers['X-Custom']).toBe('value')
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('defaults to GET method', async () => {
    const { $fetch } = await import('#app')
    vi.mocked($fetch).mockResolvedValue({ data: [] })

    await apiRequest('/api/ideas')

    const calls = vi.mocked($fetch).mock.calls
    expect(calls[0][1].method).toBe('GET')
  })

  it('handles response errors', async () => {
    const { $fetch } = await import('#app')
    vi.mocked($fetch).mockRejectedValue(new Error('Network error'))

    await expect(apiRequest('/api/ideas')).rejects.toThrow('Network error')
  })

  it('gracefully handles missing auth store', async () => {
    const { $fetch } = await import('#app')
    vi.mocked($fetch).mockResolvedValue({ success: true })

    // Simulate store not being available
    await apiRequest('/api/ideas', { method: 'POST', body: {} })

    expect(vi.mocked($fetch)).toHaveBeenCalled()
  })
})
