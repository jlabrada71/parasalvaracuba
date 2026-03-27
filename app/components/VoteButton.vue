<template>
  <div class="vote-controls">
    <button
      class="vote-btn"
      :class="{ active: currentVote === 1 }"
      :disabled="loading"
      :aria-label="$t('vote.up')"
      @click="castVote(1)"
    >▲</button>
    <span class="vote-count">{{ localNetVotes }}</span>
    <button
      class="vote-btn"
      :class="{ active: currentVote === -1 }"
      :disabled="loading"
      :aria-label="$t('vote.down')"
      @click="castVote(-1)"
    >▼</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEmailGate } from '~/composables/useEmailGate'
import { apiRequest } from '~/utils/apiClient'

interface VotePayload {
  ideaId?: string
  commentId?: string
  netVotes: number
}

const props = defineProps<{
  ideaId?: string
  commentId?: string
  netVotes: number
}>()
const emit = defineEmits<{ voted: [payload: VotePayload] }>()

const { requireEmail } = useEmailGate()
const localNetVotes = ref(props.netVotes)
const currentVote = ref<1 | -1 | 0>(0)
const loading = ref(false)

const routeBase = computed(() => {
  if (props.ideaId) return `/api/ideas/${props.ideaId}/votes`
  if (props.commentId) return `/api/comments/${props.commentId}/votes`
  throw new Error('VoteButton requires either ideaId or commentId')
})

async function castVote(value: 1 | -1) {
  requireEmail(async () => {
    // Toggle off if clicking the same direction
    const newValue = currentVote.value === value ? 0 : value
    loading.value = true
    try {
      const result = await apiRequest<{ net_votes: number }>(routeBase.value, {
        method: 'POST',
        body: { vote_value: newValue },
      })
      currentVote.value = newValue
      localNetVotes.value = result.net_votes
      const payload: VotePayload = { netVotes: result.net_votes }
      if (props.ideaId) payload.ideaId = props.ideaId
      if (props.commentId) payload.commentId = props.commentId
      emit('voted', payload)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.vote-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  min-width: 2.5rem;
}
.vote-btn {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
  color: #6b7280;
}
.vote-btn:hover { border-color: #2563eb; color: #2563eb; }
.vote-btn.active { background: #2563eb; border-color: #2563eb; color: white; }
.vote-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.vote-count {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e3a5f;
}
</style>
