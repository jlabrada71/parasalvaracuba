import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'ideahub:email'

export const useAuthStore = defineStore('auth', () => {
  // State
  const email = ref<string | null>(null)

  // Getters
  const isIdentified = computed(() => email.value !== null && email.value.length > 0)

  // Actions
  function init() {
    if (import.meta.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) email.value = stored
    }
  }

  function setEmail(newEmail: string) {
    email.value = newEmail.trim().toLowerCase()
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, email.value)
    }
  }

  function clearEmail() {
    email.value = null
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return { email, isIdentified, init, setEmail, clearEmail }
})
