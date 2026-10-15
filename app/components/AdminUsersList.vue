<template>
  <section>
    <h2>{{ $t('admin.users.title') }}</h2>
    <table>
      <thead>
        <tr>
          <th scope="col">{{ $t('admin.users.email') }}</th>
          <th scope="col">{{ $t('admin.users.role') }}</th>
          <th scope="col">{{ $t('admin.users.created') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ new Date(u.created_at).toLocaleDateString() }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
export interface AdminUser { id: string; email: string; role: string; is_active: boolean; created_at: string }

defineProps<{ users: AdminUser[] }>()
</script>

<style scoped>
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: var(--spacing-3); border-bottom: 1px solid var(--color-outline-variant); }
</style>
