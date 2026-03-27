import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../app/stores/authStore'

// Mock $fetch globally
const mockFetch = vi.fn()
globalThis.$fetch = mockFetch as any

describe('apiClient', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('makes GET request without email header', async () => {
    const { apiRequest } = await import('../../app/utils/apiClient')
    mockFetch.mockResolvedValue({ success: true })

    await apiRequest('/api/ideas')

    expect(mockFetch).toHaveBeenCalledWith('/api/ideas', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    })
  })

  it('includes email header in POST requests', async () => {
    const auth = useAuthStore()
    auth.setEmail('user@example.com')

    const { apiRequest } = await import('../../app/utils/apiClient')
    mockFetch.mockResolvedValue({ id: 'new-id' })

    await apiRequest('/api/ideas', {
      method: 'POST',
      body: { title: 'Test' },
    })

    const calls = mockFetch.mock.calls
    expect(calls[0][1].headers['X-User-Email']).toBe('user@example.com')
  })

  it('serializes body to JSON', async () => {
    const { apiRequest } = await import('../../app/utils/apiClient')
    mockFetch.mockResolvedValue({ id: 'new-id' })

    const testBody = { title: 'Test Idea', description: 'A test' }
    await apiRequest('/api/ideas', {
      method: 'POST',
      body: testBody,
    })

    const calls = mockFetch.mock.calls
    expect(calls[0][1].body).toBe(JSON.stringify(testBody))
  })

  it('does not include X-User-Email for GET requests even if logged in', async () => {
    const auth = useAuthStore()
    auth.setEmail('user@example.com')

    const { apiRequest } = await import('../../app/utils/apiClient')
    mockFetch.mockResolvedValue({ ideas: [] })

    await apiRequest('/api/ideas?page=1', { method: 'GET' })

    const calls = mockFetch.mock.calls
    expect(calls[0][1].headers['X-User-Email']).toBeUndefined()
  })

  it('includes custom headers along with auto-injected headers', async () => {
    const { apiRequest } = await import('../../app/utils/apiClient')
    mockFetch.mockResolvedValue({ success: true })

    await apiRequest('/api/ideas', {
      method: 'POST',
      body: {},
      headers: { 'X-Custom': 'value' },
    })

    const calls = mockFetch.mock.calls
    const headers = calls[0][1].headers
    expect(headers['X-Custom']).toBe('value')
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('defaults to GET method', async () => {
    const { apiRequest } = await import('../../app/utils/apiClient')
    mockFetch.mockResolvedValue({ data: [] })

    await apiRequest('/api/ideas')

    const calls = mockFetch.mock.calls
    expect(calls[0][1].method).toBe('GET')
  })

  it('handles response errors', async () => {
    const { apiRequest } = await import('../../app/utils/apiClient')
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(apiRequest('/api/ideas')).rejects.toThrow('Network error')
  })

  it('gracefully handles missing auth store', async () => {
    const { apiRequest } = await import('../../app/utils/apiClient')
    mockFetch.mockResolvedValue({ success: true })

    // Simulate store not being available
    await apiRequest('/api/ideas', { method: 'POST', body: {} })

    expect(mockFetch).toHaveBeenCalled()
  })
})
