import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SessionUser {
  id: string
  email: string
  role: 'admin' | 'author'
}

export const useUserStore = defineStore('user', () => {
  const user = ref<SessionUser | null>(null)
  const loaded = ref(false)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function fetchMe() {
    try {
      // On the server, forward the incoming request's cookies.
      const fetcher = import.meta.server ? useRequestFetch() : $fetch
      const res = await fetcher<{ user: SessionUser | null }>('/api/auth/me')
      user.value = res.user ?? null
    } catch {
      user.value = null
    } finally {
      loaded.value = true
    }
  }

  async function login(email: string, password: string): Promise<SessionUser> {
    const res = await $fetch<{ user: SessionUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = res.user
    loaded.value = true
    return res.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, loaded, isAdmin, fetchMe, login, logout }
})
