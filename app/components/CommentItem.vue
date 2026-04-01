<template>
  <div class="comment-item">
    <!-- Comment header -->
    <div class="comment-header">
      <span class="author">{{ maskEmail(comment.email) }}</span>
      <span class="date">{{ formatDate(comment.created_at) }}</span>
    </div>

    <!-- Comment body -->
    <div class="comment-body">{{ comment.content }}</div>

    <!-- Comment footer with voting and reply button -->
    <div class="comment-footer">
      <VoteButton
        :comment-id="comment.id"
        :net-votes="comment.net_votes"
        @voted="(payload) => $emit('voted', payload)"
      />
      <Button variant="tertiary" size="sm" @click="showReplyForm = !showReplyForm">
        {{ showReplyForm ? $t('comments.replyCancel') : $t('comments.reply') }}
      </Button>
    </div>

    <!-- Reply form (nested, indented) -->
    <form v-if="showReplyForm" class="reply-form" @submit.prevent="submitReply">
      <textarea
        v-model="replyBody"
        :placeholder="$t('comments.replyPlaceholder')"
        maxlength="2000"
        required
        rows="3"
      ></textarea>
      <div class="reply-actions">
        <Button type="submit" variant="primary" size="sm" :disabled="submittingReply">{{ $t('comments.postReply') }}</Button>
        <span v-if="replyError" class="error">{{ replyError }}</span>
      </div>
    </form>

    <!-- Recursive replies (indented) -->
    <div v-if="replies.length > 0" class="comment-replies">
      <CommentItem
        v-for="reply in replies"
        :key="reply.id"
        :comment="reply"
        :idea-id="ideaId"
        :all-comments="allComments"
        @replied="$emit('replied', $event)"
        @voted="$emit('voted', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiRequest } from '~/utils/apiClient'
import { maskEmail } from '~/utils/emailValidation'
import { useEmailGate } from '~/composables/useEmailGate'
import { Button } from '@/components/design-system'
import VoteButton from './VoteButton.vue'

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

const props = defineProps<{
  comment: Comment
  ideaId: string
  allComments: Comment[]
}>()

const emit = defineEmits<{
  replied: [comment: Comment]
  voted: [payload: { commentId?: string; netVotes: number }]
}>()

const { requireEmail } = useEmailGate()
const i18n = useI18n()
const showReplyForm = ref(false)
const replyBody = ref('')
const submittingReply = ref(false)
const replyError = ref('')

const replies = computed(() =>
  props.allComments.filter((c) => c.parent_comment_id === props.comment.id)
)

async function submitReply() {
  if (!replyBody.value.trim()) {
    replyError.value = i18n.t('comments.errors_reply.empty')
    return
  }

  requireEmail(async () => {
    submittingReply.value = true
    replyError.value = ''
    try {
      const newReply = await apiRequest<Comment>(
        `/api/ideas/${props.ideaId}/comments/${props.comment.id}/reply`,
        {
          method: 'POST',
          body: { body: replyBody.value },
        }
      )
      replyBody.value = ''
      showReplyForm.value = false
      emit('replied', newReply)
    } catch (e) {
      replyError.value = (e as { data?: { message?: string } })?.data?.message ?? i18n.t('comments.errors_reply.failed')
    } finally {
      submittingReply.value = false
    }
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CU', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.comment-item {
  padding: var(--spacing-4) var(--spacing-5);
  background-color: var(--color-surface-container-low);
  border-left: 3px solid var(--color-primary-fixed-dim);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  transition: border-color var(--transition-fast);
}

.comment-item:hover {
  border-left-color: var(--color-primary);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.author {
  font-family: var(--font-label);
  font-weight: var(--font-weight-semi-bold);
  color: var(--color-primary);
  font-size: var(--font-size-label-lg);
}

.date {
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  color: var(--color-on-surface-variant);
}

.comment-body {
  font-family: var(--font-body);
  font-size: var(--font-size-body-lg);
  line-height: var(--line-height-relaxed);
  color: var(--color-on-surface);
  margin-bottom: var(--spacing-3);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.comment-footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-3);
}

.reply-btn {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: var(--spacing-1) var(--spacing-3);
  background: transparent;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: var(--font-label);
  font-size: var(--font-size-label-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-on-surface-variant);
  transition: all var(--transition-fast);
}

.reply-btn:hover {
  background-color: var(--color-surface-container-high);
  border-color: var(--color-outline);
  color: var(--color-on-surface);
}

.reply-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin: var(--spacing-3) 0;
  padding: var(--spacing-4);
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-elevation-1);
}

.reply-form textarea {
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

.reply-form textarea:focus {
  outline: none;
  border-bottom-color: var(--color-secondary-container);
  border-bottom-width: 3px;
}

.reply-form textarea::placeholder {
  color: var(--color-on-surface-variant);
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.reply-actions button[type="submit"] {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: var(--spacing-2) var(--spacing-5);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: var(--font-label);
  font-size: var(--font-size-label-md);
  font-weight: var(--font-weight-semi-bold);
  transition: all var(--transition-normal);
}

.reply-actions button[type="submit"]:hover:not(:disabled) {
  box-shadow: 0 8px 16px rgba(0, 101, 101, 0.2);
  transform: translateY(-1px);
}

.reply-actions button[type="submit"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reply-actions button[type="submit"]:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.error {
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  color: var(--color-error);
}

.comment-replies {
  margin-left: var(--spacing-8);
  margin-top: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
</style>
