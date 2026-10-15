<template>
  <div class="auth-page">
    <main class="auth-card">
      <h1>{{ $t('auth.login.title') }}</h1>
      <p class="subtitle">{{ $t('auth.login.subtitle') }}</p>
      <LoginForm @success="onSuccess" />
    </main>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '~/components/LoginForm.vue'
import { useUserStore, type SessionUser } from '~/stores/userStore'

useSeoMeta({ robots: 'noindex, nofollow' })

const localePath = useLocalePath()
const store = useUserStore()

if (store.isAdmin) await navigateTo(localePath('/admin'))

async function onSuccess(user: SessionUser) {
  await navigateTo(localePath(user.role === 'admin' ? '/admin' : '/'))
}
</script>

<style scoped>
.auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: var(--spacing-6) var(--spacing-4); }
.auth-card {
  width: 100%; max-width: 420px; background: var(--color-surface-container-low);
  border-radius: var(--radius-lg); padding: var(--spacing-8);
  display: flex; flex-direction: column; gap: var(--spacing-4);
}
.subtitle { color: var(--color-on-surface-variant); }
</style>
