import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEmailGate } from '../../app/composables/useEmailGate'
import { useAuthStore } from '../../app/stores/authStore'

describe('useEmailGate', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with modal hidden', () => {
    const { modalVisible } = useEmailGate()
    expect(modalVisible.value).toBe(false)
  })

  it('executes action immediately if user is identified', () => {
    const auth = useAuthStore()
    auth.setEmail('user@example.com')

    const { requireEmail } = useEmailGate()
    const mockAction = vi.fn()
    requireEmail(mockAction)

    expect(mockAction).toHaveBeenCalledOnce()
  })

  it('shows modal if user is not identified', () => {
    const { requireEmail, modalVisible } = useEmailGate()
    const mockAction = vi.fn()
    requireEmail(mockAction)

    expect(modalVisible.value).toBe(true)
    expect(mockAction).not.toHaveBeenCalled()
  })

  it('executes pending action when modal is saved', () => {
    const { requireEmail, modalVisible, onModalSaved } = useEmailGate()
    const mockAction = vi.fn()
    requireEmail(mockAction)

    expect(mockAction).not.toHaveBeenCalled()
    onModalSaved()

    expect(mockAction).toHaveBeenCalledOnce()
    expect(modalVisible.value).toBe(false)
  })

  it('cancels pending action when modal is closed', () => {
    const { requireEmail, onModalClose } = useEmailGate()
    const mockAction = vi.fn()
    requireEmail(mockAction)

    onModalClose()
    expect(mockAction).not.toHaveBeenCalled()
  })

  it('clears pending callback after execution', () => {
    const { requireEmail, onModalSaved } = useEmailGate()
    const mockAction = vi.fn()
    requireEmail(mockAction)
    onModalSaved()

    // Calling onModalSaved again should not execute the same callback
    onModalSaved()
    expect(mockAction).toHaveBeenCalledOnce()
  })

  it('handles multiple sequential requireEmail calls', () => {
    const { requireEmail, modalVisible, onModalSaved } = useEmailGate()
    const mockAction1 = vi.fn()
    const mockAction2 = vi.fn()

    requireEmail(mockAction1)
    expect(modalVisible.value).toBe(true)

    onModalSaved()
    expect(mockAction1).toHaveBeenCalledOnce()

    requireEmail(mockAction2)
    expect(modalVisible.value).toBe(true)

    onModalSaved()
    expect(mockAction2).toHaveBeenCalledOnce()
  })

  it('does not show modal if user becomes identified between call and modal show', () => {
    const auth = useAuthStore()
    const { requireEmail, modalVisible } = useEmailGate()
    const mockAction = vi.fn()

    requireEmail(mockAction)
    expect(modalVisible.value).toBe(true)

    // Simulate user being identified elsewhere
    auth.setEmail('late@example.com')

    // The modal should still be visible (it was already shown)
    // but new calls should not show it
    const { requireEmail: requireEmail2 } = useEmailGate()
    const mockAction2 = vi.fn()
    requireEmail2(mockAction2)
    expect(mockAction2).toHaveBeenCalledOnce()
  })
})
