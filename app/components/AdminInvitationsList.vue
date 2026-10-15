<template>
  <section>
    <h2>{{ $t('admin.pending.title') }}</h2>
    <p v-if="invitations.length === 0">{{ $t('admin.pending.empty') }}</p>
    <table v-else>
      <thead>
        <tr>
          <th scope="col">{{ $t('admin.pending.email') }}</th>
          <th scope="col">{{ $t('admin.pending.role') }}</th>
          <th scope="col">{{ $t('admin.pending.expires') }}</th>
          <th scope="col"><span class="sr-only">{{ $t('admin.pending.revoke') }}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inv in invitations" :key="inv.id">
          <td>{{ inv.email }}</td>
          <td>{{ inv.role }}</td>
          <td>{{ new Date(inv.expires_at).toLocaleDateString() }}</td>
          <td>
            <Button variant="tertiary" size="sm" :aria-label="`${$t('admin.pending.revoke')} ${inv.email}`" @click="$emit('revoke', inv.id)">
              {{ $t('admin.pending.revoke') }}
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/components/design-system'

export interface Invitation { id: string; email: string; role: string; created_at: string; expires_at: string }

defineProps<{ invitations: Invitation[] }>()
defineEmits<{ (e: 'revoke', id: string): void }>()
</script>

<style scoped>
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: var(--spacing-3); border-bottom: 1px solid var(--color-outline-variant); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
