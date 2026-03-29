<template>
  <div class="idea-card">
    <div class="idea-votes">
      <VoteButton :idea-id="idea.id" :net-votes="idea.net_votes" @voted="$emit('voted', $event)" />
    </div>
    <div class="idea-body">
      <NuxtLink :to="localePath(`/ideas/${idea.id}`)" class="idea-title">{{ idea.title }}</NuxtLink>
      <p class="idea-meta">by {{ idea.email }} &middot; {{ formatDate(idea.created_at) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import VoteButton from './VoteButton.vue'
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
.idea-card {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-5) var(--spacing-6);
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-elevation-1);
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
  align-items: flex-start;
}
.idea-card:hover {
  box-shadow: var(--shadow-elevation-3);
  transform: translateY(-2px);
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
.idea-meta {
  font-size: var(--font-size-body-sm);
  color: var(--color-on-surface-variant);
  margin: var(--spacing-2) 0 0;
  font-family: var(--font-body);
}
</style>
