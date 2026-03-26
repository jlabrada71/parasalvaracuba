<template>
  <div class="idea-card">
    <div class="idea-votes">
      <VoteButton :idea-id="idea.id" :net-votes="idea.net_votes" @voted="$emit('voted', $event)" />
    </div>
    <div class="idea-body">
      <NuxtLink :to="`/ideas/${idea.id}`" class="idea-title">{{ idea.title }}</NuxtLink>
      <p class="idea-meta">by {{ idea.email }} &middot; {{ formatDate(idea.created_at) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import VoteButton from './VoteButton.vue'

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
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}
.idea-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e3a5f;
  text-decoration: none;
}
.idea-title:hover { text-decoration: underline; }
.idea-meta {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0.25rem 0 0;
}
</style>
