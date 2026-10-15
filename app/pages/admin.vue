<template>
  <div class="admin-page">
    <h1>{{ $t('admin.title') }}</h1>
    <AdminInviteForm @created="refreshInvitations" />
    <AdminInvitationsList :invitations="invitations ?? []" @revoke="revoke" />
    <AdminUsersList :users="users ?? []" />
  </div>
</template>

<script setup lang="ts">
import AdminInviteForm from '~/components/AdminInviteForm.vue'
import AdminInvitationsList, { type Invitation } from '~/components/AdminInvitationsList.vue'
import AdminUsersList, { type AdminUser } from '~/components/AdminUsersList.vue'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { data: invitations, refresh: refreshInvitations } = await useFetch<Invitation[]>('/api/admin/invitations')
const { data: users } = await useFetch<AdminUser[]>('/api/admin/users')

async function revoke(id: string) {
  await $fetch(`/api/admin/invitations/${id}`, { method: 'DELETE' })
  await refreshInvitations()
}
</script>

<style scoped>
.admin-page { max-width: 960px; margin: 0 auto; padding: var(--spacing-6) var(--spacing-4); display: flex; flex-direction: column; gap: var(--spacing-8); }
</style>
