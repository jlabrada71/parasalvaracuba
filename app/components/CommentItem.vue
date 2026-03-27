<template>
  <div class="comment-item">
    <!-- Comment header -->
    <div class="comment-header">
      <span class="author">{{ comment.email }}</span>
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
      <button class="reply-btn" @click="showReplyForm = !showReplyForm">
        {{ showReplyForm ? 'Cancel' : 'Reply' }}
      </button>
    </div>

    <!-- Reply form (nested, indented) -->
    <form v-if="showReplyForm" class="reply-form" @submit.prevent="submitReply">
      <textarea
        v-model="replyBody"
        placeholder="Write a reply..."
        maxlength="2000"
        required
        rows="3"
      ></textarea>
      <div class="reply-actions">
        <button type="submit" :disabled="submittingReply">Post reply</button>
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
import { apiRequest } from '~/utils/apiClient'
import { useEmailGate } from '~/composables/useEmailGate'
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
const showReplyForm = ref(false)
const replyBody = ref('')
const submittingReply = ref(false)
const replyError = ref('')

const replies = computed(() =>
  props.allComments.filter((c) => c.parent_comment_id === props.comment.id)
)

async function submitReply() {
  if (!replyBody.value.trim()) {
    replyError.value = 'Reply cannot be empty'
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
      replyError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to post reply'
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
  padding: 1rem;
  background: #f9fafb;
  border-left: 2px solid #d1d5db;
  border-radius: 0 4px 4px 0;
}

.comment-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.author {
  font-weight: 600;
  color: #1e3a5f;
  font-size: 0.95rem;
}

.date {
  font-size: 0.8rem;
  color: #9ca3af;
}

.comment-body {
  line-height: 1.5;
  color: #374151;
  margin-bottom: 0.75rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.comment-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.reply-btn {
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #374151;
}

.reply-btn:hover {
  background: #e5e7eb;
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.reply-form textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
}

.reply-form textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reply-actions button {
  padding: 0.35rem 0.75rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}

.reply-actions button:hover {
  background: #1d4ed8;
}

.reply-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  font-size: 0.8rem;
}

.comment-replies {
  margin-left: 2rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
