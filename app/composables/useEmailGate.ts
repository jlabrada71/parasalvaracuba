import { ref } from 'vue'
import { useAuthStore } from '~/stores/authStore'

export function useEmailGate() {
  const auth = useAuthStore()
  const modalVisible = ref(false)
  let pendingCallback: (() => void) | null = null

  /**
   * Call this before any action that requires identity.
   * If the user is already identified, runs `action` immediately.
   * Otherwise shows the modal; runs `action` after email is saved.
   */
  function requireEmail(action: () => void) {
    if (auth.isIdentified) {
      action()
      return
    }
    pendingCallback = action
    modalVisible.value = true
  }

  function onModalSaved() {
    modalVisible.value = false
    if (pendingCallback) {
      pendingCallback()
      pendingCallback = null
    }
  }

  function onModalClose() {
    modalVisible.value = false
    pendingCallback = null
  }

  return { modalVisible, requireEmail, onModalSaved, onModalClose }
}
