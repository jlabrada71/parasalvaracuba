<template>
  <div class="vote-controls">
    <button
      class="vote-btn"
      :class="{ 'active-up': currentVote === 1 }"
      :disabled="loading"
      :aria-label="$t('vote.up')"
      @click="castVote(1)"
    >▲</button>
    <span class="vote-count">{{ localNetVotes }}</span>
    <button
      class="vote-btn"
      :class="{ 'active-down': currentVote === -1 }"
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
  gap: var(--spacing-1);
  min-width: var(--spacing-11);
}

.vote-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface-variant);
  transition: all var(--transition-fast);
  padding: 0;
  line-height: 1;
}

.vote-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-surface-container-low);
}

.vote-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Up-vote active: teal (primary) */
.vote-btn.active-up {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

/* Down-vote active: coral (secondary) */
.vote-btn.active-down {
  background-color: var(--color-secondary);
  border-color: var(--color-secondary);
  color: var(--color-on-secondary);
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vote-count {
  font-family: var(--font-label);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-label-lg);
  color: var(--color-on-surface);
  min-width: var(--spacing-6);
  text-align: center;
  line-height: 1;
}
</style>
