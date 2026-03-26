import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../app/stores/authStore'

// Mock localStorage
const storageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
vi.stubGlobal('localStorage', storageMock)

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    storageMock.clear()
  })

  it('starts with null email', () => {
    const auth = useAuthStore()
    expect(auth.email).toBeNull()
    expect(auth.isIdentified).toBe(false)
  })

  it('setEmail stores value and marks isIdentified', () => {
    const auth = useAuthStore()
    auth.setEmail('user@example.com')
    expect(auth.email).toBe('user@example.com')
    expect(auth.isIdentified).toBe(true)
  })

  it('setEmail persists to localStorage', () => {
    const auth = useAuthStore()
    auth.setEmail('user@example.com')
    expect(storageMock.getItem('ideahub:email')).toBe('user@example.com')
  })

  it('clearEmail resets state and removes from localStorage', () => {
    const auth = useAuthStore()
    auth.setEmail('user@example.com')
    auth.clearEmail()
    expect(auth.email).toBeNull()
    expect(auth.isIdentified).toBe(false)
    expect(storageMock.getItem('ideahub:email')).toBeNull()
  })

  it('init hydrates from localStorage', () => {
    storageMock.setItem('ideahub:email', 'stored@example.com')
    const auth = useAuthStore()
    auth.init()
    expect(auth.email).toBe('stored@example.com')
  })
})
