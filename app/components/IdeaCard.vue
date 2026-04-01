<template>
  <Card interactive>
    <template #default>
      <div class="idea-content">
        <div class="idea-votes">
          <VoteButton :idea-id="idea.id" :net-votes="idea.net_votes" @voted="$emit('voted', $event)" />
        </div>
        <div class="idea-body">
          <NuxtLink :to="localePath(`/ideas/${idea.id}`)" class="idea-title">{{ idea.title }}</NuxtLink>
          <Text size="body-sm" secondary>{{ $t('idea.by') }} {{ maskEmail(idea.email) }} &middot; {{ formatDate(idea.created_at) }}</Text>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import VoteButton from './VoteButton.vue'
import { Card, Text } from '@/components/design-system'
import { maskEmail } from '~/utils/emailValidation'
const localePath = useLocalePath()

interface Idea {
  id: string
  title: string
  email: string
  created_at: string
  net_votes: number
}

defineProps<{ idea: Idea }>()
defineEmits<{ voted: [payload: { ideaId: string; netVotes: number }] }>()

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CU', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.idea-content {
  display: flex;
  gap: var(--spacing-4);
  align-items: flex-start;
}
.idea-votes {
  flex-shrink: 0;
}
.idea-body {
  flex: 1;
  min-width: 0;
}
.idea-title {
  font-family: var(--font-headline);
  font-size: var(--font-size-title-sm);
  font-weight: var(--font-weight-semi-bold);
  color: var(--color-primary);
  text-decoration: none;
  line-height: var(--line-height-tight);
  display: block;
  transition: color var(--transition-fast);
  margin-bottom: var(--spacing-2);
}
.idea-title:hover {
  color: var(--color-primary-container);
  text-decoration: underline;
}
.idea-title:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}
</style>
