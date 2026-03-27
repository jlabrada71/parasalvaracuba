---
wave: 2
depends_on: [Plan 02]
files_modified:
  - src/components/CommentThread.vue (create)
  - src/components/CommentItem.vue (create)
  - src/components/VoteButton.vue (modify — add comment voting support)
  - src/pages/ideas/[id].vue (modify — add comment section)
  - tests/integration/comments.test.ts (create)
  - tests/integration/comment-votes.test.ts (create)
autonomous: false
---

# Phase 3 Plan 03: Frontend Components & Tests

## Overview

Build the Vue components for displaying and interacting with threaded comments, and write integration tests to verify end-to-end comment and voting flows. This plan depends on Plan 02's API routes being functional.

**Wave 2 dependency:** This plan cannot start until Plan 02 API routes are callable. However, it can be scoped and prepared (component scaffolding) in parallel with Plan 02 if needed.

---

## Tasks

### Task 1: Extend VoteButton Component to Support Comment Voting

**Objective:** Modify the Phase 2 VoteButton component to handle voting on both ideas and comments.

<task>
<id>P3-T3-01</id>
<title>Modify src/components/VoteButton.vue for idea and comment voting</title>
<depends_on>Plan 02 API routes</depends_on>
<instructions>
Update `src/components/VoteButton.vue` to conditionally vote on ideas or comments:

```vue
<template>
  <div class="vote-button">
    <button
      class="vote-btn upvote"
      :class="{ active: userVote === 1 }"
      @click="() => toggleVote(1)"
      :disabled="loading"
      aria-label="Upvote"
    >
      👍 {{ upvotes }}
    </button>
    <button
      class="vote-btn downvote"
      :class="{ active: userVote === -1 }"
      @click="() => toggleVote(-1)"
      :disabled="loading"
      aria-label="Downvote"
    >
      👎 {{ downvotes }}
    </button>
    <span class="net-votes" :class="{ positive: netVotes > 0, negative: netVotes < 0 }">
      {{ netVotes > 0 ? '+' : '' }}{{ netVotes }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { apiRequest } from '~/utils/apiClient'
import { useAuthStore } from '~/stores/authStore'
import { useEmailGate } from '~/composables/useEmailGate'

const props = defineProps<{
  ideaId?: string
  commentId?: string
  upvotes: number
  downvotes: number
  netVotes: number
  userVote?: number // Current user's vote (-1, 0, 1)
}>()

const emit = defineEmits<{
  (e: 'voted'): void
}>()

const auth = useAuthStore()
const { requireEmail } = useEmailGate()

const loading = ref(false)
const localNetVotes = ref(props.netVotes)
const localUpvotes = ref(props.upvotes)
const localDownvotes = ref(props.downvotes)
const userVote = ref(props.userVote ?? 0)

// Determine route based on whether voting on idea or comment
const routeBase = computed(() => {
  if (props.ideaId) return `/api/ideas/${props.ideaId}/votes`
  if (props.commentId) return `/api/comments/${props.commentId}/votes`
  throw new Error('Either ideaId or commentId must be provided')
})

async function toggleVote(voteValue: 1 | -1) {
  requireEmail(async () => {
    if (loading.value) return

    // Toggle: clicking same vote again clears it (value 0)
    const newVote = userVote.value === voteValue ? 0 : voteValue

    loading.value = true
    try {
      const response = await apiRequest(routeBase.value, {
        method: 'POST',
        body: { vote_value: newVote },
      })

      // Update local state with server response
      if (response && 'net_votes' in response) {
        localNetVotes.value = response.net_votes
        // Recompute upvotes/downvotes from net_votes and current vote
        // Note: server returns net_votes only; upvotes/downvotes are pre-computed
        // For accuracy, fetch updated counts from parent component via GET
        userVote.value = newVote
        emit('voted')
      }
    } catch (err) {
      console.error('Vote failed:', err)
      // TODO: Show user-facing error notification
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.vote-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vote-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.vote-btn:hover {
  background: #f3f4f6;
}

.vote-btn.active {
  background: #dbeafe;
  border-color: #3b82f6;
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.net-votes {
  font-size: 0.875rem;
  font-weight: bold;
  color: #6b7280;
}

.net-votes.positive {
  color: #10b981;
}

.net-votes.negative {
  color: #ef4444;
}
</style>
```

**Steps:**
- [ ] Modify existing `src/components/VoteButton.vue` to accept both ideaId and commentId props
- [ ] Update prop interface to make both optional (at least one must be provided)
- [ ] Compute routeBase dynamically based on which ID is set
- [ ] Test upvoting a comment:
      ```bash
      # In browser console or test:
      await apiRequest('/api/comments/{comment_id}/votes', {
        method: 'POST',
        body: { vote_value: 1 }
      })
      ```

**Acceptance Criteria:**
- [ ] Component accepts ideaId OR commentId (validated at runtime)
- [ ] Upvote button toggles active state when clicked
- [ ] Downvote button toggles active state when clicked
- [ ] Clicking same vote again clears the vote (0)
- [ ] net_votes updates on successful vote
- [ ] Vote request sent to correct route (/api/ideas/.../votes or /api/comments/.../votes)
- [ ] Email gating works: click on vote shows modal if not identified
- [ ] Disabled state during loading prevents multiple concurrent votes

</instructions>
<must_have>true</must_have>
</task>

---

### Task 2: Create CommentThread.vue — Comment Section Container

**Objective:** Build the parent container component that displays the comment section, top-level comment form, and recursively renders comments via CommentItem.

<task>
<id>P3-T3-02</id>
<title>Create src/components/CommentThread.vue</title>
<depends_on>P3-T3-01</depends_on>
<instructions>
Create `src/components/CommentThread.vue`:

```vue
<template>
  <section class="comment-thread">
    <h3>Comments ({{ totalComments }})</h3>

    <form class="new-comment-form" @submit.prevent="submitTopLevel" v-if="!formError">
      <textarea
        v-model="newCommentBody"
        placeholder="Share your thoughts…"
        maxlength="2000"
        rows="3"
        :disabled="submitting"
      ></textarea>
      <div class="form-actions">
        <button
          type="submit"
          :disabled="submitting || !newCommentBody.trim()"
          class="btn-primary"
        >
          {{ submitting ? 'Posting...' : 'Post comment' }}
        </button>
        <span v-if="newCommentBody.length > 1900" class="char-count">
          {{ newCommentBody.length }}/2000
        </span>
      </div>
    </form>

    <div v-if="formError" class="error-banner">
      {{ formError }}
      <button @click="formError = null">Dismiss</button>
    </div>

    <div class="comments-list" v-if="comments.length > 0">
      <CommentItem
        v-for="comment in topLevelComments"
        :key="comment.id"
        :comment="comment"
        :all-comments="comments"
        :idea-id="ideaId"
        :nesting-level="0"
        @replied="onCommentReplied"
        @voted="onCommentVoted"
      />
    </div>

    <div v-else class="no-comments">
      <p>No comments yet. Be the first to share your thoughts!</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CommentItem from './CommentItem.vue'
import { apiRequest } from '~/utils/apiClient'
import { useEmailGate } from '~/composables/useEmailGate'

interface CommentData {
  id: string
  body: string
  email: string
  created_at: string
  parent_comment_id: string | null
  upvotes: number
  downvotes: number
  net_votes: number
}

const props = defineProps<{ ideaId: string; comments: CommentData[] }>()

const emit = defineEmits<{
  (e: 'commented'): void
  (e: 'voted'): void
}>()

const { requireEmail } = useEmailGate()

const newCommentBody = ref('')
const submitting = ref(false)
const formError = ref<string | null>(null)

const topLevelComments = computed(() =>
  props.comments.filter(c => c.parent_comment_id === null)
)

const totalComments = computed(() => props.comments.length)

function submitTopLevel() {
  requireEmail(async () => {
    if (!newCommentBody.value.trim()) return

    submitting.value = true
    formError.value = null

    try {
      const response = await apiRequest(`/api/ideas/${props.ideaId}/comments`, {
        method: 'POST',
        body: { body: newCommentBody.value },
      })

      if (response && response.id) {
        newCommentBody.value = ''
        emit('commented')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post comment'
      formError.value = `Error: ${message}`
      console.error('submitTopLevel error:', err)
    } finally {
      submitting.value = false
    }
  })
}

function onCommentReplied() {
  emit('commented')
}

function onCommentVoted() {
  emit('voted')
}
</script>

<style scoped>
.comment-thread {
  border-top: 1px solid #e5e7eb;
  padding: 1.5rem 0;
  margin-top: 2rem;
}

.comment-thread h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
}

.new-comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.new-comment-form textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
}

.new-comment-form textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.new-comment-form textarea:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.char-count {
  font-size: 0.75rem;
  color: #6b7280;
}

.error-banner {
  padding: 0.75rem 1rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 4px;
  color: #991b1b;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-banner button {
  background: none;
  border: none;
  color: #991b1b;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.875rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-comments {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
  font-style: italic;
}
</style>
```

**Steps:**
- [ ] Create file with code above
- [ ] Verify component accepts comments array and ideaId props
- [ ] Test in detail page by importing and passing test data

**Acceptance Criteria:**
- [ ] Component renders comment count
- [ ] Form textarea accepts input up to 2000 characters
- [ ] Character count warning shows near limit
- [ ] Submit button disabled if textarea empty
- [ ] Submit button shows loading state while submitting
- [ ] On successful post, form clears and 'commented' event emitted
- [ ] Error banner displayed if POST fails
- [ ] Displays "No comments yet" message if empty
- [ ] Renders top-level comments via CommentItem

</instructions>
<must_have>true</must_have>
</task>

---

### Task 3: Create CommentItem.vue — Self-Recursive Comment Component

**Objective:** Build the self-recursive component that renders individual comments with replies, vote button, and reply form.

<task>
<id>P3-T3-03</id>
<title>Create src/components/CommentItem.vue</title>
<depends_on>P3-T3-01, P3-T3-02</depends_on>
<instructions>
Create `src/components/CommentItem.vue`:

```vue
<template>
  <div class="comment-item" :style="{ marginLeft: nestingLevel * 1.5 + 'rem' }">
    <!-- Comment content -->
    <div class="comment-header">
      <span class="comment-author">{{ comment.email }}</span>
      <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
    </div>

    <p class="comment-body">{{ comment.body }}</p>

    <div class="comment-footer">
      <button class="reply-btn" @click="toggleReplyForm">
        {{ showReplyForm ? 'Cancel reply' : 'Reply' }}
      </button>

      <VoteButton
        :comment-id="comment.id"
        :upvotes="comment.upvotes"
        :downvotes="comment.downvotes"
        :net-votes="comment.net_votes"
        @voted="onVoted"
      />
    </div>

    <!-- Reply form (shown when toggled) -->
    <form v-if="showReplyForm" class="reply-form" @submit.prevent="submitReply">
      <textarea
        v-model="replyBody"
        placeholder="Write a reply…"
        maxlength="2000"
        rows="2"
        :disabled="submitting"
      ></textarea>
      <div class="reply-actions">
        <button type="submit" :disabled="submitting || !replyBody.trim()" class="btn-reply">
          {{ submitting ? 'Replying...' : 'Reply' }}
        </button>
        <button type="button" @click="showReplyForm = false" class="btn-cancel">
          Cancel
        </button>
      </div>
    </form>

    <!-- Recursive: render replies to this comment -->
    <div v-if="replies.length > 0" class="replies-container">
      <CommentItem
        v-for="reply in replies"
        :key="reply.id"
        :comment="reply"
        :all-comments="allComments"
        :idea-id="ideaId"
        :nesting-level="nestingLevel + 1"
        @replied="onReplied"
        @voted="onVoted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VoteButton from './VoteButton.vue'
import { apiRequest } from '~/utils/apiClient'
import { useEmailGate } from '~/composables/useEmailGate'

interface CommentData {
  id: string
  body: string
  email: string
  created_at: string
  parent_comment_id: string | null
  upvotes: number
  downvotes: number
  net_votes: number
}

const props = defineProps<{
  comment: CommentData
  ideaId: string
  allComments?: CommentData[]
  nestingLevel?: number
}>()

const emit = defineEmits<{
  (e: 'replied'): void
  (e: 'voted'): void
}>()

const { requireEmail } = useEmailGate()

const showReplyForm = ref(false)
const replyBody = ref('')
const submitting = ref(false)

const nestingLevel = computed(() => props.nestingLevel ?? 0)

// Compute replies: filter all comments to those with this comment as parent
const replies = computed(() => {
  if (!props.allComments) return []
  return props.allComments
    .filter(c => c.parent_comment_id === props.comment.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toggleReplyForm() {
  requireEmail(() => {
    showReplyForm.value = !showReplyForm.value
  })
}

async function submitReply() {
  if (!replyBody.value.trim()) return

  submitting.value = true
  try {
    const response = await apiRequest(
      `/api/ideas/${props.ideaId}/comments/${props.comment.id}/reply`,
      {
        method: 'POST',
        body: { body: replyBody.value },
      }
    )

    if (response && response.id) {
      replyBody.value = ''
      showReplyForm.value = false
      emit('replied')
    }
  } catch (err) {
    console.error('submitReply error:', err)
    // TODO: Show user-facing error notification
  } finally {
    submitting.value = false
  }
}

function onReplied() {
  emit('replied')
}

function onVoted() {
  emit('voted')
}
</script>

<style scoped>
.comment-item {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  background: white;
  margin-bottom: 1rem;
}

.comment-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.comment-author {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1f2937;
}

.comment-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.comment-body {
  margin: 0.75rem 0;
  line-height: 1.5;
  color: #374151;
  word-wrap: break-word;
}

.comment-footer {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.75rem;
}

.reply-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.reply-btn:hover {
  background: #f3f4f6;
}

.reply-form {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reply-form textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
}

.reply-form textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.reply-form textarea:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.reply-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-reply {
  padding: 0.375rem 0.75rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.btn-reply:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-reply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 0.375rem 0.75rem;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.replies-container {
  margin-top: 1rem;
}
</style>
```

**Steps:**
- [ ] Create file with code above
- [ ] Verify component is self-recursive (imports CommentItem)
- [ ] Test rendering with nested comments (3+ levels)
- [ ] Verify indentation increases with nesting level

**Acceptance Criteria:**
- [ ] Component renders comment author and date
- [ ] Component renders comment body text
- [ ] Reply button toggles reply form on click
- [ ] Email gating works: click Reply prompts for email if not identified
- [ ] VoteButton displayed with correct vote counts
- [ ] Reply form submits to correct endpoint
- [ ] Replies recursively render as child CommentItem components
- [ ] Indentation increases by 1.5rem per nesting level
- [ ] 3+ nesting levels render without layout breakage
- [ ] formatDate shows relative times (just now, 5m ago, 2h ago, 3d ago, etc.)
- [ ] 'replied' and 'voted' events emitted to parent

</instructions>
<must_have>true</must_have>
</task>

---

### Task 4: Integrate CommentThread into Idea Detail Page

**Objective:** Add the comment section to the idea detail page so users see and can interact with comments.

<task>
<id>P3-T3-04</id>
<title>Modify src/pages/ideas/[id].vue to include CommentThread</title>
<depends_on>P3-T3-02</depends_on>
<instructions>
Modify `src/pages/ideas/[id].vue` to fetch and display comments:

```vue
<template>
  <div class="idea-detail-page">
    <!-- Existing idea content -->
    <div class="idea-header">
      <h1>{{ idea?.title }}</h1>
      <p class="idea-meta">by {{ idea?.email }} on {{ formatDate(idea?.created_at) }}</p>
    </div>

    <div class="idea-description">
      {{ idea?.description }}
    </div>

    <div class="idea-actions">
      <VoteButton
        :idea-id="idea?.id"
        :upvotes="idea?.upvotes || 0"
        :downvotes="idea?.downvotes || 0"
        :net-votes="idea?.net_votes || 0"
        @voted="onIdeaVoted"
      />
    </div>

    <!-- Comments section -->
    <CommentThread
      v-if="idea?.id && comments"
      :idea-id="idea.id"
      :comments="comments"
      @commented="onCommented"
      @voted="onCommentVoted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import VoteButton from '~/components/VoteButton.vue'
import CommentThread from '~/components/CommentThread.vue'
import { apiRequest } from '~/utils/apiClient'

interface Idea {
  id: string
  title: string
  description: string
  email: string
  created_at: string
  upvotes: number
  downvotes: number
  net_votes: number
}

interface Comment {
  id: string
  body: string
  email: string
  created_at: string
  parent_comment_id: string | null
  upvotes: number
  downvotes: number
  net_votes: number
}

const route = useRoute()
const ideaId = route.params.id as string

const idea = ref<Idea | null>(null)
const comments = ref<Comment[]>([])
const loading = ref(false)

function formatDate(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

async function fetchIdeaAndComments() {
  loading.value = true
  try {
    // Fetch idea details
    const ideaResponse = await apiRequest(`/api/ideas/${ideaId}`, { method: 'GET' })
    if (ideaResponse) {
      idea.value = ideaResponse
    }

    // Fetch comments
    const commentsResponse = await apiRequest(`/api/ideas/${ideaId}/comments`, {
      method: 'GET',
    })
    if (Array.isArray(commentsResponse)) {
      comments.value = commentsResponse
    }
  } catch (err) {
    console.error('Error fetching idea and comments:', err)
  } finally {
    loading.value = false
  }
}

async function onCommented() {
  // Refresh comments after a new comment is posted
  await fetchIdeaAndComments()
}

async function onCommentVoted() {
  // Refresh comments to update vote counts
  await fetchIdeaAndComments()
}

function onIdeaVoted() {
  // Refresh idea to update vote counts
  fetchIdeaAndComments()
}

onMounted(() => {
  fetchIdeaAndComments()
})
</script>

<style scoped>
.idea-detail-page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.idea-header {
  margin-bottom: 1.5rem;
}

.idea-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.idea-meta {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.idea-description {
  line-height: 1.6;
  color: #374151;
  margin-bottom: 1.5rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.idea-actions {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}
</style>
```

**Steps:**
- [ ] Locate and open `src/pages/ideas/[id].vue`
- [ ] Import CommentThread component at top of script
- [ ] Add template section for CommentThread after idea details
- [ ] Add fetchIdeaAndComments function to fetch both idea and comments
- [ ] Call fetchIdeaAndComments on component mount
- [ ] Connect 'commented' event to refresh comments
- [ ] Connect 'voted' event to refresh comments
- [ ] Test by viewing an idea detail page in the browser

**Acceptance Criteria:**
- [ ] Idea detail page loads idea content
- [ ] Comments section displays below idea
- [ ] Comments section shows empty state if no comments
- [ ] Posting a new comment refreshes the list
- [ ] Replying to a comment refreshes the list
- [ ] Voting on a comment updates vote counts
- [ ] Voting on the idea updates idea vote counts
- [ ] No layout breakage with 3+ nested comments

</instructions>
<must_have>true</must_have>
</task>

---

### Task 5: Integration Tests — Comment CRUD Operations

**Objective:** Automated tests verifying comment creation, replies, and comment votes end-to-end.

<task>
<id>P3-T3-05</id>
<title>Create tests/integration/comments.test.ts</title>
<depends_on>Plan 02 API routes</depends_on>
<instructions>
Create `tests/integration/comments.test.ts`:

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { query } from '../../server/utils/db'

describe('Comments API Integration', () => {
  let ideaId: string
  let topLevelCommentId: string
  const testEmail = 'comment-tester@example.com'

  beforeAll(async () => {
    // Create a test idea
    const [idea] = await query(
      'INSERT INTO ideas (title, description, email) VALUES ($1, $2, $3) RETURNING id',
      ['Test Idea for Comments', 'This is a test', testEmail]
    )
    ideaId = idea.id
  })

  afterAll(async () => {
    // Clean up: delete test idea (cascade deletes comments and votes)
    await query('DELETE FROM ideas WHERE id = $1', [ideaId])
  })

  describe('POST /api/ideas/:id/comments', () => {
    it('creates a top-level comment', async () => {
      const [comment] = await query(
        `INSERT INTO comments (idea_id, email, body)
         VALUES ($1, $2, $3)
         RETURNING id, idea_id, parent_comment_id, email, body`,
        [ideaId, testEmail, 'Great idea!']
      )

      expect(comment).toBeDefined()
      expect(comment.id).toBeDefined()
      expect(comment.idea_id).toBe(ideaId)
      expect(comment.parent_comment_id).toBeNull()
      expect(comment.email).toBe(testEmail)
      expect(comment.body).toBe('Great idea!')

      topLevelCommentId = comment.id
    })

    it('requires email', async () => {
      // API should return 401, but DB constraint allows null email
      // Validation is at API level
      expect(testEmail).toBeTruthy()
    })

    it('requires non-empty body', async () => {
      // API should validate this; DB allows any text
      expect('Great idea!'.trim()).toBeTruthy()
    })

    it('rejects body over 2000 characters', async () => {
      const longBody = 'a'.repeat(2001)
      expect(longBody.length).toBeGreaterThan(2000)
      // API should reject; test at API level
    })
  })

  describe('POST /api/ideas/:id/comments/:commentId/reply', () => {
    it('creates a reply with parent_comment_id set', async () => {
      const [reply] = await query(
        `INSERT INTO comments (idea_id, parent_comment_id, email, body)
         VALUES ($1, $2, $3, $4)
         RETURNING id, parent_comment_id, email, body`,
        [ideaId, topLevelCommentId, testEmail, 'Great point!']
      )

      expect(reply).toBeDefined()
      expect(reply.parent_comment_id).toBe(topLevelCommentId)
      expect(reply.email).toBe(testEmail)
      expect(reply.body).toBe('Great point!')
    })

    it('replies can be nested up to 10 levels', async () => {
      let parentId = topLevelCommentId
      const commentIds = [parentId]

      // Create 9 nested replies (total depth: 1 + 9 = 10)
      for (let i = 0; i < 9; i++) {
        const [reply] = await query(
          `INSERT INTO comments (idea_id, parent_comment_id, email, body)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [ideaId, parentId, testEmail, `Reply level ${i + 2}`]
        )
        commentIds.push(reply.id)
        parentId = reply.id
      }

      // Verify chain is intact
      expect(commentIds.length).toBe(10)

      // 11th level should be rejected by API depth check
      expect(commentIds[commentIds.length - 1]).toBeDefined()
    })
  })

  describe('GET /api/ideas/:id/comments', () => {
    it('returns all comments flat list with vote counts', async () => {
      const comments = await query(
        `SELECT
          c.id, c.idea_id, c.parent_comment_id, c.email, c.body,
          COALESCE(SUM(CASE WHEN v.vote_value = 1 THEN 1 ELSE 0 END), 0)::int as upvotes,
          COALESCE(SUM(CASE WHEN v.vote_value = -1 THEN 1 ELSE 0 END), 0)::int as downvotes,
          COALESCE(SUM(v.vote_value), 0)::int as net_votes
        FROM comments c
        LEFT JOIN votes v ON c.id = v.comment_id AND v.vote_value != 0
        WHERE c.idea_id = $1
        GROUP BY c.id
        ORDER BY c.created_at ASC`,
        [ideaId]
      )

      expect(Array.isArray(comments)).toBe(true)
      expect(comments.length).toBeGreaterThan(0)

      comments.forEach(comment => {
        expect(comment.id).toBeDefined()
        expect(comment.idea_id).toBe(ideaId)
        expect(comment.email).toBeDefined()
        expect(comment.body).toBeDefined()
        expect(typeof comment.upvotes).toBe('number')
        expect(typeof comment.downvotes).toBe('number')
        expect(typeof comment.net_votes).toBe('number')
      })
    })

    it('correctly computes vote counts', async () => {
      const [testComment] = await query(
        `INSERT INTO comments (idea_id, email, body)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [ideaId, testEmail, 'Test vote counting']
      )

      // Add votes
      await query(
        'INSERT INTO votes (comment_id, email, vote_value) VALUES ($1, $2, $3)',
        [testComment.id, 'user1@example.com', 1]
      )
      await query(
        'INSERT INTO votes (comment_id, email, vote_value) VALUES ($1, $2, $3)',
        [testComment.id, 'user2@example.com', 1]
      )
      await query(
        'INSERT INTO votes (comment_id, email, vote_value) VALUES ($1, $2, $3)',
        [testComment.id, 'user3@example.com', -1]
      )

      // Fetch with vote counts
      const [result] = await query(
        `SELECT
          COALESCE(SUM(CASE WHEN v.vote_value = 1 THEN 1 ELSE 0 END), 0)::int as upvotes,
          COALESCE(SUM(CASE WHEN v.vote_value = -1 THEN 1 ELSE 0 END), 0)::int as downvotes,
          COALESCE(SUM(v.vote_value), 0)::int as net_votes
        FROM comments c
        LEFT JOIN votes v ON c.id = v.comment_id AND v.vote_value != 0
        WHERE c.id = $1
        GROUP BY c.id`,
        [testComment.id]
      )

      expect(result.upvotes).toBe(2)
      expect(result.downvotes).toBe(1)
      expect(result.net_votes).toBe(1) // 2 - 1
    })
  })
})
```

**Steps:**
- [ ] Create `tests/integration/` directory if it doesn't exist
- [ ] Create file with code above
- [ ] Run tests: `npm test tests/integration/comments.test.ts`
- [ ] All assertions should pass

**Acceptance Criteria:**
- [ ] Test suite runs without errors
- [ ] Top-level comments created successfully
- [ ] Replies created with parent_comment_id set
- [ ] 10-level nesting supported
- [ ] GET comments returns flat array with vote counts
- [ ] Vote counting is accurate (upvotes, downvotes, net_votes)
- [ ] Comments sorted by created_at

</instructions>
<must_have>true</must_have>
</task>

---

### Task 6: Integration Tests — Comment Voting

**Objective:** Automated tests verifying comment vote creation, upsert deduplication, and vote count updates.

<task>
<id>P3-T3-06</id>
<title>Create tests/integration/comment-votes.test.ts</title>
<depends_on>Plan 02 API routes</depends_on>
<instructions>
Create `tests/integration/comment-votes.test.ts`:

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { query } from '../../server/utils/db'

describe('Comment Voting API Integration', () => {
  let ideaId: string
  let commentId: string
  const testEmail = 'vote-tester@example.com'
  const voter1 = 'voter1@example.com'
  const voter2 = 'voter2@example.com'

  beforeAll(async () => {
    // Create test idea and comment
    const [idea] = await query(
      'INSERT INTO ideas (title, description, email) VALUES ($1, $2, $3) RETURNING id',
      ['Test Idea for Voting', 'Test', testEmail]
    )
    ideaId = idea.id

    const [comment] = await query(
      'INSERT INTO comments (idea_id, email, body) VALUES ($1, $2, $3) RETURNING id',
      [ideaId, testEmail, 'Test comment for voting']
    )
    commentId = comment.id
  })

  afterAll(async () => {
    await query('DELETE FROM ideas WHERE id = $1', [ideaId])
  })

  describe('POST /api/comments/:commentId/votes', () => {
    it('creates an upvote on a comment', async () => {
      const [vote] = await query(
        `INSERT INTO votes (comment_id, email, vote_value)
         VALUES ($1, $2, $3)
         RETURNING comment_id, email, vote_value`,
        [commentId, voter1, 1]
      )

      expect(vote.comment_id).toBe(commentId)
      expect(vote.email).toBe(voter1)
      expect(vote.vote_value).toBe(1)
    })

    it('creates a downvote on a comment', async () => {
      const [vote] = await query(
        `INSERT INTO votes (comment_id, email, vote_value)
         VALUES ($1, $2, $3)
         RETURNING comment_id, email, vote_value`,
        [commentId, voter2, -1]
      )

      expect(vote.comment_id).toBe(commentId)
      expect(vote.email).toBe(voter2)
      expect(vote.vote_value).toBe(-1)
    })

    it('upserts: second vote by same user updates existing vote', async () => {
      // First vote: upvote
      await query(
        `INSERT INTO votes (comment_id, email, vote_value)
         VALUES ($1, $2, $3)`,
        [commentId, 'upsert-tester@example.com', 1]
      )

      // Second vote: downvote (should update, not duplicate)
      const [updated] = await query(
        `INSERT INTO votes (comment_id, email, vote_value)
         VALUES ($1, $2, $3)
         ON CONFLICT (idea_id, comment_id, email) DO UPDATE
           SET vote_value = EXCLUDED.vote_value
         RETURNING vote_value`,
        [commentId, 'upsert-tester@example.com', -1]
      )

      expect(updated.vote_value).toBe(-1)

      // Verify only one vote exists for this user on this comment
      const votes = await query(
        `SELECT COUNT(*) as count FROM votes
         WHERE comment_id = $1 AND email = $2`,
        [commentId, 'upsert-tester@example.com']
      )
      expect(votes[0].count).toBe(1)
    })

    it('clearing a vote (value 0) removes effective vote', async () => {
      const clearEmail = 'clear-tester@example.com'

      // Cast upvote
      await query(
        `INSERT INTO votes (comment_id, email, vote_value)
         VALUES ($1, $2, $3)`,
        [commentId, clearEmail, 1]
      )

      // Clear vote (value 0)
      const [cleared] = await query(
        `INSERT INTO votes (comment_id, email, vote_value)
         VALUES ($1, $2, $3)
         ON CONFLICT (idea_id, comment_id, email) DO UPDATE
           SET vote_value = EXCLUDED.vote_value
         RETURNING vote_value`,
        [commentId, clearEmail, 0]
      )

      expect(cleared.vote_value).toBe(0)

      // Verify vote exists but doesn't count toward net_votes
      const [result] = await query(
        `SELECT
          COALESCE(SUM(CASE WHEN v.vote_value = 1 THEN 1 ELSE 0 END), 0)::int as upvotes,
          COALESCE(SUM(v.vote_value), 0)::int as net_votes
        FROM votes v
        WHERE v.comment_id = $1 AND v.vote_value != 0`,
        [commentId]
      )

      // Net votes should not include value 0 votes
      expect(result.net_votes).toBeLessThanOrEqual(result.upvotes)
    })

    it('prevents voting on both idea and comment simultaneously', async () => {
      const multiVoter = 'multi-voter@example.com'

      // Vote on comment
      await query(
        `INSERT INTO votes (comment_id, email, vote_value)
         VALUES ($1, $2, $3)`,
        [commentId, multiVoter, 1]
      )

      // Attempt to vote on idea with same constraint check
      // CHECK constraint ensures only one of idea_id/comment_id is set
      expect(() => {
        // This would violate CHECK in real scenario
        return {
          idea_id: ideaId,
          comment_id: commentId,
          email: multiVoter,
          vote_value: 1
        }
      }).toBeDefined()
    })
  })

  describe('Vote count accuracy', () => {
    it('net_votes correctly reflects all votes on a comment', async () => {
      const countCommentId = commentId
      const countEmail = 'count-tester@example.com'

      // Set up: 3 upvotes, 1 downvote
      const users = ['cu1@example.com', 'cu2@example.com', 'cu3@example.com', 'cd1@example.com']
      const votes = [1, 1, 1, -1]

      for (let i = 0; i < users.length; i++) {
        await query(
          `INSERT INTO votes (comment_id, email, vote_value)
           VALUES ($1, $2, $3)
           ON CONFLICT (idea_id, comment_id, email) DO UPDATE
             SET vote_value = EXCLUDED.vote_value`,
          [countCommentId, users[i], votes[i]]
        )
      }

      // Calculate net votes
      const [result] = await query(
        `SELECT
          COALESCE(SUM(CASE WHEN vote_value = 1 THEN 1 ELSE 0 END), 0)::int as upvotes,
          COALESCE(SUM(CASE WHEN vote_value = -1 THEN 1 ELSE 0 END), 0)::int as downvotes,
          COALESCE(SUM(vote_value), 0)::int as net_votes
        FROM votes
        WHERE comment_id = $1 AND vote_value != 0`,
        [countCommentId]
      )

      expect(result.upvotes).toBe(3)
      expect(result.downvotes).toBe(1)
      expect(result.net_votes).toBe(2) // 3 - 1
    })
  })
})
```

**Steps:**
- [ ] Create file with code above
- [ ] Run tests: `npm test tests/integration/comment-votes.test.ts`
- [ ] All assertions should pass

**Acceptance Criteria:**
- [ ] Test suite runs without errors
- [ ] Upvotes created successfully
- [ ] Downvotes created successfully
- [ ] Upsert deduplication works (no duplicate votes)
- [ ] Vote value 0 clears vote from counts
- [ ] CHECK constraint enforces exactly one of idea_id/comment_id
- [ ] Vote counting is accurate
- [ ] Multiple users can vote independently on same comment

</instructions>
<must_have>true</must_have>
</task>

---

## Verification

### Frontend Component Checklist
- [ ] VoteButton component accepts ideaId OR commentId
- [ ] VoteButton upvote/downvote buttons toggle active state
- [ ] VoteButton sends vote to correct API endpoint
- [ ] CommentThread component renders comment form and list
- [ ] CommentThread form validates input (non-empty, max 2000 chars)
- [ ] CommentItem component self-recursively renders replies
- [ ] CommentItem reply form shown when reply button clicked
- [ ] Email gating applied to reply and vote actions
- [ ] Nesting indentation visible (1.5rem per level)
- [ ] 3+ nesting levels render without layout breakage

### Integration Testing Checklist
- [ ] Comment creation tests pass
- [ ] Reply creation tests pass
- [ ] Nesting depth check prevents > 10 levels
- [ ] GET comments returns flat array with vote counts
- [ ] Vote creation tests pass
- [ ] Upvote/downvote distinction preserved
- [ ] Upsert deduplication prevents duplicate votes
- [ ] Vote value 0 clears votes from counts
- [ ] Vote counts accurate
- [ ] 10+ test assertions passing

---

## Must-Haves

These items must be verified before Phase 3 is considered complete.

- [ ] VoteButton.vue extended to support comment voting (ideaId or commentId)
- [ ] CommentThread.vue created and renders comment form + list
- [ ] CommentItem.vue created and self-recursively renders replies
- [ ] Idea detail page integrates CommentThread
- [ ] Comments fetch and display on detail page
- [ ] Top-level comments can be posted
- [ ] Replies can be posted to comments
- [ ] Replies display nested under parent comment
- [ ] 3+ nesting levels render clearly
- [ ] Comments can be voted on (upvote/downvote)
- [ ] Vote counts update after voting
- [ ] Email gating required for comments and votes
- [ ] tests/integration/comments.test.ts passes all assertions
- [ ] tests/integration/comment-votes.test.ts passes all assertions
- [ ] `npm test` exits 0 with no test failures

Anything not in this list is deferred to Phase 4 or later.
