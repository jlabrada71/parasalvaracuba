<template>
  <section class="comment-thread">
    <h3>Comments ({{ comments.length }})</h3>

    <!-- Comment form for new top-level comments -->
    <form class="comment-form" @submit.prevent="submitTopLevel">
      <textarea
        v-model="newCommentBody"
        placeholder="Write a comment..."
        maxlength="2000"
        required
        rows="4"
      ></textarea>
      <div class="form-actions">
        <button type="submit" :disabled="submittingTopLevel">Post comment</button>
        <span v-if="formError" class="error">{{ formError }}</span>
      </div>
    </form>

    <!-- Comments list -->
    <div class="comments-list">
      <div v-if="comments.length === 0" class="no-comments">No comments yet.</div>
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
    formError.value = 'Comment cannot be empty'
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
      formError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to post comment'
    } finally {
      submittingTopLevel.value = false
    }
  })
}

function onCommentReplied(newReply: Comment) {
  comments.value.push(newReply)
}

function onCommentVoted() {
  // Re-fetch comments to get updated vote counts
  fetchComments()
}

fetchComments()
</script>

<style scoped>
.comment-thread {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.comment-thread h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #1e3a5f;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.comment-form textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
}

.comment-form textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-actions button {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
}

.form-actions button:hover {
  background: #1d4ed8;
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  font-size: 0.85rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-comments {
  padding: 1rem;
  color: #9ca3af;
  font-size: 0.9rem;
}
</style>
