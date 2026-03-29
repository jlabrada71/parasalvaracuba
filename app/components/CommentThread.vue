<template>
  <section class="comment-thread">
    <h3>{{ $t('comments.title', { count: comments.length }) }}</h3>

    <!-- Comment form for new top-level comments -->
    <form class="comment-form" @submit.prevent="submitTopLevel">
      <textarea
        v-model="newCommentBody"
        :placeholder="$t('comments.placeholder')"
        maxlength="2000"
        required
        rows="4"
      ></textarea>
      <div class="form-actions">
        <button type="submit" :disabled="submittingTopLevel">{{ $t('comments.post') }}</button>
        <span v-if="formError" class="error">{{ formError }}</span>
      </div>
    </form>

    <!-- Comments list -->
    <div class="comments-list">
      <div v-if="comments.length === 0" class="no-comments">{{ $t('comments.empty') }}</div>
      <CommentItem
        v-for="comment in topLevelComments"
        :key="comment.id"
        :comment="comment"
        :idea-id="ideaId"
        :all-comments="comments"
        @replied="onCommentReplied"
        @voted="onCommentVoted"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiRequest } from '~/utils/apiClient'
import { useEmailGate } from '~/composables/useEmailGate'
import CommentItem from './CommentItem.vue'

interface Comment {
  id: string
  idea_id: string
  parent_comment_id: string | null
  email: string
  content: string
  created_at: string
  updated_at: string
  upvotes: number
  downvotes: number
  net_votes: number
}

const props = defineProps<{ ideaId: string }>()
const { requireEmail } = useEmailGate()
const i18n = useI18n()
const comments = ref<Comment[]>([])
const newCommentBody = ref('')
const submittingTopLevel = ref(false)
const formError = ref('')
const loaded = ref(false)

const topLevelComments = computed(() =>
  comments.value.filter((c) => c.parent_comment_id === null)
)

async function fetchComments() {
  try {
    comments.value = await $fetch<Comment[]>(`/api/ideas/${props.ideaId}/comments`)
    loaded.value = true
  } catch (e) {
    console.error('Failed to fetch comments:', e)
    comments.value = []
  }
}

async function submitTopLevel() {
  if (!newCommentBody.value.trim()) {
    formError.value = i18n.t('comments.errors.empty')
    return
  }

  requireEmail(async () => {
    submittingTopLevel.value = true
    formError.value = ''
    try {
      const newComment = await apiRequest<Comment>(
        `/api/ideas/${props.ideaId}/comments`,
        {
          method: 'POST',
          body: { body: newCommentBody.value }, // API expects 'body' in request, but stores as 'content'
        }
      )
      comments.value.push(newComment)
      newCommentBody.value = ''
    } catch (e) {
      formError.value = (e as { data?: { message?: string } })?.data?.message ?? i18n.t('comments.errors.failed')
    } finally {
      submittingTopLevel.value = false
    }
  })
}

function onCommentReplied(newReply: Comment) {
  comments.value.push(newReply)
}

async function onCommentVoted(payload: { commentId?: string; netVotes: number }) {
  // Update the specific comment's vote count immediately
  if (payload.commentId) {
    const comment = comments.value.find((c) => c.id === payload.commentId)
    if (comment) {
      comment.net_votes = payload.netVotes
    }
  }
  // Refetch comments to ensure consistency with server state
  await fetchComments()
}

fetchComments()
</script>

<style scoped>
.comment-thread {
  margin-top: var(--spacing-8);
  padding: var(--spacing-6) 0;
}

.comment-thread h3 {
  margin: 0 0 var(--spacing-5);
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4);
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-elevation-1);
}

.comment-form textarea {
  background-color: var(--color-surface-container-highest);
  border: none;
  border-bottom: 2px solid var(--color-outline-variant);
  border-radius: 0;
  padding: var(--spacing-3) var(--spacing-2);
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface);
  resize: vertical;
  transition: border-color var(--transition-fast);
  width: 100%;
}

.comment-form textarea:focus {
  outline: none;
  border-bottom-color: var(--color-secondary-container);
  border-bottom-width: 3px;
}

.comment-form textarea::placeholder {
  color: var(--color-on-surface-variant);
}

.form-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.form-actions button {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: var(--spacing-3) var(--spacing-6);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: var(--font-label);
  font-size: var(--font-size-label-lg);
  font-weight: var(--font-weight-semi-bold);
  transition: all var(--transition-normal);
  box-shadow: 0 8px 20px rgba(0, 101, 101, 0.15);
}

.form-actions button:hover:not(:disabled) {
  box-shadow: 0 12px 28px rgba(0, 101, 101, 0.25);
  transform: translateY(-1px);
}

.form-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-actions button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.error {
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  color: var(--color-error);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.no-comments {
  padding: var(--spacing-4);
  color: var(--color-on-surface-variant);
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
}
</style>
