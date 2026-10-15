<template>
  <div class="auth-page">
    <main class="auth-card">
      <h1>{{ $t('auth.invite.title') }}</h1>
      <template v-if="invitation">
        <p class="subtitle">{{ $t('auth.invite.subtitle', { email: invitation.email }) }}</p>
        <InviteAcceptForm :token="token" :email="invitation.email" @success="onSuccess" />
      </template>
      <p v-else class="error" role="alert">{{ $t('auth.invite.invalid') }}</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import InviteAcceptForm from '~/components/InviteAcceptForm.vue'

useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const localePath = useLocalePath()
const token = String(route.params.token)

const { data: invitation } = await useFetch<{ email: string; role: string }>(
  `/api/invitations/${encodeURIComponent(token)}`,
  { default: () => null }
)

async function onSuccess() {
  await navigateTo(localePath('/'))
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
.error { color: var(--color-error); }
</style>
