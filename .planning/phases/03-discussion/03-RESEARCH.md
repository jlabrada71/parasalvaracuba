# Research: Phase 3 — Discussion

**Date:** 2026-03-26
**Phase Goal:** Enable deliberation by letting users comment on ideas, reply to each other in threads, and vote on the best contributions — turning isolated ideas into conversations.

**Requirements to Deliver:**
- COMMENT-01: User can post a top-level comment on an idea
- COMMENT-02: User can reply to an existing comment (threaded discussion)
- COMMENT-03: Comments are displayed in a clearly nested, threaded layout
- VOTE-02: User can vote (up/down) on individual comments

**Success Criteria:**
1. User can post a comment on any idea and see it appear on the idea's detail page
2. User can reply to an existing comment; the reply is indented beneath its parent
3. A thread with 3+ levels of nesting renders clearly without layout breakage
4. User can vote on a comment; comment vote count updates on next load

---

## 1. Database Schema

### Overview

PostgreSQL will extend Phase 2's schema with a **comments** table to store threaded discussions, and will extend the **votes** table to handle both ideas and comments. The schema uses a **parent_comment_id** foreign key for threading and maintains normalization to prevent duplication.

### `comments` Table

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  email VARCHAR(254) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_idea_id ON comments(idea_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_email ON comments(email);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

**Columns:**
- `id` (UUID, primary key) — Unique comment identifier; matches ideas/votes pattern
- `idea_id` (UUID, foreign key) — Links comment to the idea being discussed
- `parent_comment_id` (UUID, foreign key, nullable) — Links to parent comment if this is a reply; NULL for top-level comments
- `email` (varchar 254, required) — Author's email; matches ideas.email pattern
- `body` (text, required) — Comment text; unconstrained allows detailed discussion
- `created_at`, `updated_at` (timestamptz) — Timestamps; immutable and mutable respectively

**Indexes:**
- `idx_comments_idea_id` — Fast retrieval of all comments on an idea (for the detail page)
- `idx_comments_parent_comment_id` — Fast lookup of replies to a specific comment (for threading)
- `idx_comments_email` — Fast lookup of user's own comments (for attribution, future edit/delete)
- `idx_comments_created_at` — Fast sort by creation date (for reverse chronological ordering)

**Design Rationale:**
- **Hierarchical structure via parent_comment_id:** This is the standard pattern for threaded comments. It's simple, denormalizes the tree naturally, and allows recursive queries (WITH RECURSIVE) to fetch full threads.
- **No status column in v1:** Unlike ideas, comments do NOT have draft/published status in v1 because moderation is deferred to v2. All comments post immediately.
- **ON DELETE CASCADE:** If a parent comment is deleted (v2 feature), its replies are cascade-deleted. This prevents orphaned reply chains. Alternative: soft deletes (add `status` enum) — deferred to v2.

### Extended `votes` Table

The existing Phase 2 votes table is modified to support both idea and comment voting:

```sql
-- ALTER existing Phase 2 table to add comment voting
ALTER TABLE votes
  ADD COLUMN comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Remove the unique constraint on (idea_id, email)
ALTER TABLE votes DROP CONSTRAINT votes_idea_id_email_key;

-- Add new unique constraint: exactly one of idea_id or comment_id must be set
ALTER TABLE votes
  ADD CONSTRAINT votes_entity_unique UNIQUE (idea_id, comment_id, email),
  ADD CONSTRAINT votes_has_exactly_one_entity
    CHECK ((idea_id IS NOT NULL AND comment_id IS NULL) OR (idea_id IS NULL AND comment_id IS NOT NULL));

-- Add index for comment votes
CREATE INDEX idx_votes_comment_id ON votes(comment_id);
```

**Modified Columns:**
- `comment_id` (UUID, foreign key, nullable) — Links vote to comment; NULL if voting on idea
- **UNIQUE constraint:** `(idea_id, comment_id, email)` — Enforces one vote per user per entity (idea or comment); works because only one of idea_id/comment_id can be non-NULL
- **CHECK constraint:** Ensures exactly one of idea_id or comment_id is set (application also validates)

**Query Pattern for Comment Vote Counts:**

```sql
SELECT
  c.id,
  c.body,
  c.email,
  c.created_at,
  COALESCE(SUM(CASE WHEN v.vote_value = 1 THEN 1 ELSE 0 END), 0) as upvotes,
  COALESCE(SUM(CASE WHEN v.vote_value = -1 THEN 1 ELSE 0 END), 0) as downvotes,
  COALESCE(SUM(v.vote_value), 0) as net_votes
FROM comments c
LEFT JOIN votes v ON c.id = v.comment_id AND v.vote_value != 0
WHERE c.idea_id = $1
GROUP BY c.id
ORDER BY c.created_at ASC;
```

**Why separate columns instead of entity_type enum?**
- **Pro:** Nullable columns + CHECK constraint enforces at DB level that exactly one entity is set; simpler queries (no CASE statements for entity_type)
- **Con:** Slightly awkward schema design (two nullable FKs); requires CHECK constraint
- **Chosen:** Nullable columns. Reasoning: Phase 2 is already live; adding a CHECK constraint is safer than backfilling an entity_type column on existing votes.

### Migration Strategy

Use raw SQL migrations (consistency with Phase 2):

```sql
-- Migration: 002_add_comments_and_extend_votes.sql

BEGIN;

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  email VARCHAR(254) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_idea_id ON comments(idea_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_email ON comments(email);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Extend votes for comments
ALTER TABLE votes
  ADD COLUMN comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Migrate UNIQUE constraint (existing data has comment_id = NULL, so unique on (idea_id, NULL, email) is fine)
ALTER TABLE votes DROP CONSTRAINT votes_idea_id_email_key;
ALTER TABLE votes ADD CONSTRAINT votes_entity_unique UNIQUE (idea_id, comment_id, email);
ALTER TABLE votes ADD CONSTRAINT votes_has_exactly_one_entity
  CHECK ((idea_id IS NOT NULL AND comment_id IS NULL) OR (idea_id IS NULL AND comment_id IS NOT NULL));

CREATE INDEX idx_votes_comment_id ON votes(comment_id);

-- Record migration
INSERT INTO migrations_applied (name) VALUES ('002_add_comments_and_extend_votes');

COMMIT;
```

**Why a single migration instead of two?**
- Both changes are tightly coupled (comments need votes, votes need comments reference)
- Single atomic transaction prevents partial application
- Simpler rollback if needed

---

## 2. Comment Rendering Patterns

### Client-Side Recursive Component Pattern

Vue component architecture for nested comments uses **self-recursive components** — a component that renders itself for each reply. This is the cleanest approach for threaded comments.

#### CommentThread.vue (Parent Container)

```vue
<template>
  <section class="comment-thread">
    <h3>Comments ({{ totalComments }})</h3>

    <form class="new-comment-form" @submit.prevent="submitTopLevel">
      <textarea
        v-model="newCommentBody"
        placeholder="Share your thoughts…"
        maxlength="2000"
        rows="3"
      ></textarea>
      <button type="submit" :disabled="submitting">Post comment</button>
    </form>

    <div class="comments-list">
      <CommentItem
        v-for="comment in topLevelComments"
        :key="comment.id"
        :comment="comment"
        :idea-id="ideaId"
        @replied="onCommentReplied"
        @voted="onCommentVoted"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CommentItem from './CommentItem.vue'
import { apiRequest } from '~/utils/apiClient'

interface CommentData {
  id: string
  body: string
  email: string
  created_at: string
  parent_comment_id: string | null
  net_votes: number
}

const props = defineProps<{ ideaId: string; comments: CommentData[] }>()
const emit = defineEmits<{
  replied: []
  voted: []
}>()

const newCommentBody = ref('')
const submitting = ref(false)

const topLevelComments = computed(() =>
  props.comments.filter(c => c.parent_comment_id === null)
)

const totalComments = computed(() => props.comments.length)

async function submitTopLevel() {
  if (!newCommentBody.value.trim()) return

  submitting.value = true
  try {
    await apiRequest(`/api/ideas/${props.ideaId}/comments`, {
      method: 'POST',
      body: { body: newCommentBody.value },
    })
    newCommentBody.value = ''
    emit('replied')
  } finally {
    submitting.value = false
  }
}

function onCommentReplied() {
  emit('replied')
}

function onCommentVoted() {
  emit('voted')
}
</script>

<style scoped>
.comment-thread {
  border-top: 1px solid #e5e7eb;
  padding: 1.5rem 0;
}

.new-comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.new-comment-form textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: inherit;
}

.new-comment-form button {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.new-comment-form button:hover {
  background: #1d4ed8;
}

.new-comment-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
```

#### CommentItem.vue (Self-Recursive Comment Component)

```vue
<template>
  <div class="comment-item" :style="{ marginLeft: nestingLevel * 1.5 + 'rem' }">
    <div class="comment-header">
      <span class="comment-author">{{ comment.email }}</span>
      <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
    </div>

    <p class="comment-body">{{ comment.body }}</p>

    <div class="comment-footer">
      <button class="reply-btn" @click="toggleReplyForm">Reply</button>
      <VoteButton
        :comment-id="comment.id"
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
      ></textarea>
      <div class="reply-actions">
        <button type="submit" :disabled="submitting">Reply</button>
        <button type="button" @click="showReplyForm = false">Cancel</button>
      </div>
    </form>

    <!-- Recursive: render replies to this comment -->
    <div v-if="replies.length > 0" class="replies-container">
      <CommentItem
        v-for="reply in replies"
        :key="reply.id"
        :comment="reply"
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
  net_votes: number
}

const props = defineProps<{
  comment: CommentData
  ideaId: string
  allComments?: CommentData[]
  nestingLevel?: number
}>()

const emit = defineEmits<{
  replied: []
  voted: []
}>()

const { requireEmail } = useEmailGate()

const showReplyForm = ref(false)
const replyBody = ref('')
const submitting = ref(false)

const nestingLevel = computed(() => props.nestingLevel ?? 0)

// Compute replies: filter all comments to those with this comment as parent
const replies = computed(() => {
  if (!props.allComments) return []
  return props.allComments.filter(c => c.parent_comment_id === props.comment.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
})

function toggleReplyForm() {
  requireEmail(() => {
    showReplyForm.value = !showReplyForm.value
  })
}

async function submitReply() {
  if (!replyBody.value.trim()) return

  submitting.value = true
  try {
    await apiRequest(`/api/ideas/${props.ideaId}/comments`, {
      method: 'POST',
      body: {
        body: replyBody.value,
        parent_comment_id: props.comment.id,
      },
    })
    replyBody.value = ''
    showReplyForm.value = false
    emit('replied')
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

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago'
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago'
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago'
  return date.toLocaleDateString()
}
</script>

<style scoped>
.comment-item {
  border-left: 2px solid #e5e7eb;
  padding-left: 1rem;
  padding-bottom: 1rem;
}

.comment-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 600;
  color: #1f2937;
}

.comment-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.comment-body {
  margin: 0.5rem 0;
  line-height: 1.5;
  color: #374151;
  word-wrap: break-word;
}

.comment-footer {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.5rem;
}

.reply-btn {
  padding: 0.25rem 0.75rem;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  color: #4b5563;
  font-size: 0.875rem;
}

.reply-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.reply-form {
  margin-top: 0.75rem;
  padding: 0.75rem;
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
}

.reply-actions {
  display: flex;
  gap: 0.5rem;
}

.reply-actions button {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.reply-actions button[type="submit"] {
  background: #2563eb;
  color: white;
}

.reply-actions button[type="submit"]:hover {
  background: #1d4ed8;
}

.reply-actions button[type="button"] {
  background: #e5e7eb;
  color: #1f2937;
}

.reply-actions button[type="button"]:hover {
  background: #d1d5db;
}

.replies-container {
  margin-top: 1rem;
}
</style>
```

#### VoteButton.vue (Extended for Comments)

Extend the Phase 2 VoteButton to handle both ideas and comments:

```vue
<template>
  <div class="vote-controls">
    <button
      class="vote-btn"
      :class="{ active: currentVote === 1 }"
      :disabled="loading"
      aria-label="Vote up"
      @click="castVote(1)"
    >▲</button>
    <span class="vote-count">{{ localNetVotes }}</span>
    <button
      class="vote-btn"
      :class="{ active: currentVote === -1 }"
      :disabled="loading"
      aria-label="Vote down"
      @click="castVote(-1)"
    >▼</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEmailGate } from '~/composables/useEmailGate'
import { apiRequest } from '~/utils/apiClient'

const props = defineProps<{
  ideaId?: string
  commentId?: string
  netVotes: number
}>()

const emit = defineEmits<{ voted: [payload: { netVotes: number }] }>()

if (!props.ideaId && !props.commentId) {
  throw new Error('VoteButton requires either ideaId or commentId')
}

const { requireEmail } = useEmailGate()
const localNetVotes = ref(props.netVotes)
const currentVote = ref<1 | -1 | 0>(0)
const loading = ref(false)

async function castVote(value: 1 | -1) {
  requireEmail(async () => {
    const newValue = currentVote.value === value ? 0 : value
    loading.value = true

    const endpoint = props.ideaId
      ? `/api/ideas/${props.ideaId}/votes`
      : `/api/comments/${props.commentId}/votes`

    try {
      const result = await apiRequest<{ net_votes: number }>(endpoint, {
        method: 'POST',
        body: { vote_value: newValue },
      })
      currentVote.value = newValue
      localNetVotes.value = result.net_votes
      emit('voted', { netVotes: result.net_votes })
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
/* Same as Phase 2 VoteButton */
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
```

### Rendering Strategy for Deep Nesting (3+ Levels)

**Problem:** Deeply nested comments can break layouts due to cumulative left-margin.

**Solution:** Cap visual indentation at 3 levels while preserving semantic depth in data:

```typescript
// In CommentItem.vue
const MAX_VISUAL_NESTING = 3

const visualNestingLevel = computed(() =>
  Math.min(props.nestingLevel ?? 0, MAX_VISUAL_NESTING)
)

// In template:
<div class="comment-item" :style="{ marginLeft: visualNestingLevel * 1.5 + 'rem' }">
```

This ensures that deeply nested replies (4+, 5+, etc.) don't shift the entire component off-screen. Visual indentation plateaus at level 3, but replies still render correctly and maintain parent-child semantic relationships.

**Alternative for very deep threads:** Add a visual "expand" link for collapsed descendants:

```vue
<!-- If nestingLevel >= 4 and replies.length > 0 -->
<div v-if="nestingLevel >= 4 && replies.length > 0" class="collapsed-indicator">
  <button @click="showReplies = !showReplies">
    {{ showReplies ? '▼' : '▶' }} {{ replies.length }} {{ replies.length === 1 ? 'reply' : 'replies' }}
  </button>
</div>
<div v-if="nestingLevel < 4 || showReplies" class="replies-container">
  <!-- render CommentItem for each reply -->
</div>
```

**Recommended limit:** Enforce **max 10 levels of nesting** in the database to prevent pathological trees. In practice:
- Levels 1-2: Most discussion happens here (OP comments, direct replies)
- Levels 3-4: Secondary discussions (rare to get here)
- Levels 5+: Highly unlikely; cap to prevent performance issues and UX confusion

Check on comment creation:

```typescript
async function submitReply() {
  // Calculate depth of this reply by traversing parent chain
  let depth = 1
  let parentId = props.comment.id
  const visited = new Set()

  while (parentId && visited.size < 100) {
    visited.add(parentId)
    const parent = allComments.find(c => c.id === parentId)
    if (!parent) break
    depth++
    parentId = parent.parent_comment_id
  }

  if (depth >= 10) {
    alert('Comment threads are limited to 10 levels of nesting for readability.')
    return
  }

  // ... proceed with submission
}
```

### Performance Considerations

**Loading strategy:**
- Fetch all comments for an idea in **one query** (not recursively). This is O(n) where n = comment count on idea
- Build the tree client-side (recursive filtering by parent_comment_id in JS memory)
- Rationale: Comments are typically <100 per idea; client-side tree build is negligible cost

**Pagination:**
- **v1:** Load all comments. Rationale: MVP scoped to core interactions; pagination adds complexity
- **v2:** Implement lazy-load or pagination (e.g., top 50 comments initially, "load more" button)

**Rendering optimization:**
- Use `v-for :key="comment.id"` to ensure Vue tracks instances correctly
- Avoid re-rendering entire thread on single comment change; emit events to parent for refresh

---

## 3. API Design for Comments

### Route Structure

Following Phase 2's pattern (nested under ideas), comment routes are:

```
POST   /api/ideas/:ideaId/comments          Create top-level or nested comment
GET    /api/ideas/:ideaId/comments          Fetch all comments for an idea
POST   /api/comments/:commentId/votes       Vote on a comment
```

**Why nested under /ideas/:ideaId?**
- Comments have no meaning without an idea; nesting makes this explicit
- All comment operations require idea context (for permission checks, pagination context)
- Mirrors platform UX: user navigates to idea, then interacts with its comments

### Request/Response Shapes

#### POST /api/ideas/:ideaId/comments (Create Comment)

**Request:**
```json
{
  "body": "This is a thoughtful comment on the idea...",
  "parent_comment_id": "uuid-of-parent-or-null-for-top-level"
}
```

**Validation:**
- `body`: Required, min 1 char, max 2000 chars (not empty string)
- `parent_comment_id`: Optional; if provided, must exist and must be a comment on the same idea

**Response (201 Created):**
```json
{
  "id": "uuid",
  "idea_id": "uuid",
  "parent_comment_id": "uuid-or-null",
  "email": "user@example.com",
  "body": "This is a thoughtful comment...",
  "created_at": "2026-03-26T14:30:00Z",
  "updated_at": "2026-03-26T14:30:00Z",
  "net_votes": 0
}
```

**Error Responses:**
- `400 Bad Request`: Missing/invalid body, parent_comment_id not found
- `401 Unauthorized`: Email required (no X-User-Email header)
- `404 Not Found`: Idea doesn't exist
- `500 Internal Server Error`: DB error

#### GET /api/ideas/:ideaId/comments (Fetch Comments)

**Query Parameters:**
- None in v1 (all comments returned)
- Future v2: `?limit=50&offset=0` for pagination

**Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "idea_id": "uuid-idea",
    "parent_comment_id": null,
    "email": "user1@example.com",
    "body": "Great idea!",
    "created_at": "2026-03-26T14:30:00Z",
    "updated_at": "2026-03-26T14:30:00Z",
    "net_votes": 2
  },
  {
    "id": "uuid-2",
    "idea_id": "uuid-idea",
    "parent_comment_id": "uuid-1",
    "email": "user2@example.com",
    "body": "I agree, but here's a concern...",
    "created_at": "2026-03-26T14:35:00Z",
    "updated_at": "2026-03-26T14:35:00Z",
    "net_votes": 1
  }
]
```

**Note:** Returned as flat list with parent_comment_id field; client builds tree structure.

#### POST /api/comments/:commentId/votes (Vote on Comment)

**Request:**
```json
{
  "vote_value": 1
}
```

**Validation:**
- `vote_value`: Required, one of -1 (downvote), 0 (clear), 1 (upvote)

**Response (201 Created or 200 OK):**
```json
{
  "id": "uuid",
  "comment_id": "uuid",
  "idea_id": "uuid",
  "email": "user@example.com",
  "vote_value": 1,
  "created_at": "2026-03-26T14:40:00Z",
  "updated_at": "2026-03-26T14:40:00Z",
  "net_votes": 3
}
```

**Behavior:**
- If user has not voted on this comment: INSERT new vote
- If user has already voted: UPDATE existing vote (ON CONFLICT DO UPDATE)
- Returns `net_votes` (sum of all votes on the comment) for UI feedback

**Error Responses:**
- `400 Bad Request`: Invalid vote_value
- `401 Unauthorized`: Email required
- `404 Not Found`: Comment doesn't exist
- `500 Internal Server Error`: DB error

### Vote Deduplication Strategy

Use database UNIQUE constraint + ON CONFLICT clause (same as Phase 2):

**SQL Pattern (in route handler):**
```sql
INSERT INTO votes (comment_id, email, vote_value)
VALUES ($1, $2, $3)
ON CONFLICT (idea_id, comment_id, email) DO UPDATE
  SET vote_value = EXCLUDED.vote_value, updated_at = NOW()
RETURNING
  id, comment_id, email, vote_value, created_at, updated_at,
  (SELECT COALESCE(SUM(vote_value), 0)::int FROM votes WHERE comment_id = $1) AS net_votes
```

**Rationale:**
- Database enforces constraint; no race conditions
- INSERT ... ON CONFLICT is atomic in PostgreSQL
- Application doesn't need to SELECT-then-INSERT; simpler logic

---

## 4. Component Architecture

### State Management (Pinia Store)

Create a new **commentsStore** to manage comment state across the app:

```typescript
// app/stores/commentsStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiRequest } from '~/utils/apiClient'

interface Comment {
  id: string
  idea_id: string
  parent_comment_id: string | null
  email: string
  body: string
  created_at: string
  updated_at: string
  net_votes: number
}

export const useCommentsStore = defineStore('comments', () => {
  // State: map of idea_id -> comments
  const commentsByIdea = ref<Record<string, Comment[]>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getCommentsForIdea = computed(() => (ideaId: string) => {
    return commentsByIdea.value[ideaId] ?? []
  })

  const getCommentById = computed(() => (commentId: string) => {
    for (const comments of Object.values(commentsByIdea.value)) {
      const found = comments.find(c => c.id === commentId)
      if (found) return found
    }
    return null
  })

  // Actions
  async function fetchCommentsForIdea(ideaId: string) {
    loading.value = true
    error.value = null
    try {
      const comments = await apiRequest<Comment[]>(
        `/api/ideas/${ideaId}/comments`
      )
      commentsByIdea.value[ideaId] = comments
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load comments'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createComment(ideaId: string, body: string, parentCommentId?: string) {
    error.value = null
    try {
      const newComment = await apiRequest<Comment>(
        `/api/ideas/${ideaId}/comments`,
        {
          method: 'POST',
          body: { body, parent_comment_id: parentCommentId },
        }
      )

      // Optimistic update: add to store immediately
      if (!commentsByIdea.value[ideaId]) {
        commentsByIdea.value[ideaId] = []
      }
      commentsByIdea.value[ideaId].push(newComment)
      return newComment
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create comment'
      throw err
    }
  }

  async function voteOnComment(commentId: string, voteValue: 1 | -1 | 0) {
    error.value = null
    try {
      const result = await apiRequest<{ net_votes: number }>(
        `/api/comments/${commentId}/votes`,
        {
          method: 'POST',
          body: { vote_value: voteValue },
        }
      )

      // Update vote count in comment
      const comment = getCommentById.value(commentId)
      if (comment) {
        comment.net_votes = result.net_votes
      }
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to vote'
      throw err
    }
  }

  function clearComments(ideaId: string) {
    delete commentsByIdea.value[ideaId]
  }

  return {
    commentsByIdea,
    loading,
    error,
    getCommentsForIdea,
    getCommentById,
    fetchCommentsForIdea,
    createComment,
    voteOnComment,
    clearComments,
  }
})
```

**Usage in components:**
```typescript
// In IdeaDetail.vue
const comments = useCommentsStore()
const ideaComments = computed(() => comments.getCommentsForIdea(props.ideaId))

onMounted(async () => {
  await comments.fetchCommentsForIdea(props.ideaId)
})
```

### Optimistic Updates

For better UX, update state immediately before server confirms:

**In CommentItem.vue submitReply():**
```typescript
async function submitReply() {
  const optimisticComment: Comment = {
    id: `temp-${Date.now()}`, // Temporary ID
    idea_id: props.ideaId,
    parent_comment_id: props.comment.id,
    email: auth.email!,
    body: replyBody.value,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    net_votes: 0,
  }

  // Add optimistic comment to store
  const store = useCommentsStore()
  if (!store.commentsByIdea[props.ideaId]) {
    store.commentsByIdea[props.ideaId] = []
  }
  store.commentsByIdea[props.ideaId].push(optimisticComment)

  try {
    const actual = await store.createComment(
      props.ideaId,
      replyBody.value,
      props.comment.id
    )
    // Replace temporary with actual
    const idx = store.commentsByIdea[props.ideaId].findIndex(c => c.id === optimisticComment.id)
    if (idx >= 0) {
      store.commentsByIdea[props.ideaId][idx] = actual
    }
  } catch {
    // Remove optimistic comment on error
    const idx = store.commentsByIdea[props.ideaId].findIndex(c => c.id === optimisticComment.id)
    if (idx >= 0) {
      store.commentsByIdea[props.ideaId].splice(idx, 1)
    }
    throw
  }
}
```

### Reusable Component Pattern Summary

| Component | Role | Reusable? | Notes |
|-----------|------|-----------|-------|
| **CommentThread** | Container for all comments on an idea | Per-idea | Fetches comments, handles new top-level comments |
| **CommentItem** | Single comment + replies (recursive) | Yes | Self-recursive; renders child replies |
| **VoteButton** | Vote up/down on idea or comment | Yes | Extended from Phase 2; works for both entity types |

---

## 5. Nesting Depth Strategy

### Recommended Depth Limit: 10 Levels

**Rationale:**
- **Levels 1-2 (OP + direct replies):** Primary discussion; where 95% of value lives
- **Levels 3-4 (secondary discussions):** Occasional deep dives; still readable
- **Levels 5-9:** Rare; typically indicates off-topic sub-threads; visual fatigue sets in
- **Level 10+:** Pathological; indicates thread has become unhelpful; should be pruned

**Why not infinite?**
- UX: Deeply nested comments become hard to read (left margin grows, threading loses clarity)
- DB: Recursive queries (WITH RECURSIVE) degrade with depth; risk of full table scans
- Moderation: Deep threads are hard to moderate (context is lost)

### Visual Indicators

Communicate nesting to users:

**Option 1: Flat visual indentation (recommended for v1)**
- Indent up to 3 visual levels
- Level 4+ appears at same level as level 3 (no further indent)
- Simple, prevents layout breakage

**Option 2: Collapsed threads (deferred to v2)**
```
Comment 1
  └─ Comment 2 (reply to 1)
    └─ Comment 3 (reply to 2) [3 more replies in this thread]
      └─ [expand to see 3 replies]
```

### Database Enforcement

Add a CHECK constraint to prevent insertions beyond depth 10:

```sql
ALTER TABLE comments
ADD CONSTRAINT comment_depth_limit CHECK (
  -- Prevent inserting comments at depth > 10
  -- This is a simple check; depth is calculated at insert time
  TRUE -- Actual check logic lives in application
);
```

**Application-level depth check (in API route):**
```typescript
// server/api/ideas/[ideaId]/comments.post.ts
async function checkCommentDepth(parentCommentId: string, maxDepth = 10): Promise<boolean> {
  let depth = 0
  let currentId = parentCommentId
  const visited = new Set()

  while (currentId && depth < maxDepth) {
    if (visited.has(currentId)) break // Cycle detection
    visited.add(currentId)

    const [parent] = await query(
      'SELECT parent_comment_id FROM comments WHERE id = $1',
      [currentId]
    )
    if (!parent) break

    depth++
    currentId = parent.parent_comment_id
  }

  return depth < maxDepth
}

// In POST handler:
if (parentCommentId) {
  const withinLimit = await checkCommentDepth(parentCommentId)
  if (!withinLimit) {
    throw createError({
      statusCode: 400,
      message: 'Comment threads are limited to 10 levels of nesting.',
    })
  }
}
```

---

## 6. Gotchas & Mitigations

### Gotcha 1: Orphaned Replies After Comment Deletion (v2 Risk)

**Problem:** If a comment is deleted (v2 feature), its replies become orphaned (parent_comment_id points to null/deleted).

**Mitigation in v1:**
- No deletion in v1 scope; deferred to v2
- When v2 adds deletion, use `ON DELETE CASCADE` to delete replies with parent (recommended) or soft deletes

**Recommendation for v2:**
```sql
ALTER TABLE comments
  ADD COLUMN status ENUM('published', 'hidden') DEFAULT 'published';

-- Instead of hard delete, soft delete:
UPDATE comments SET status = 'hidden' WHERE id = $1;

-- On display, filter:
WHERE status = 'published'
```

### Gotcha 2: Thread Tree Inconsistency (Race Condition)

**Problem:** Between fetching the comment tree and posting a reply, a reply could be posted to a comment that's about to be deleted (v2). Or parent comment itself is removed from view before reply submits.

**Mitigation:**
- **Fetch timestamps:** Include `updated_at` on each comment; if mismatch on server, reject
- **Optimistic update:** Show reply in UI immediately; if server rejects, remove it and show error
- **Database FK constraint:** Existing `ON DELETE CASCADE` prevents orphan inserts

### Gotcha 3: Vote Count Consistency

**Problem:** Vote count in UI goes out of sync with database if:
1. User votes, sees update, then page refreshes → old count displayed
2. Multiple tabs voting simultaneously

**Mitigation:**
- Always fetch fresh data from server on page load/refresh
- Use pessimistic updates: don't update UI until server confirms (already implemented in Phase 2)
- OR: implement server-sent events (SSE) for real-time updates (out of scope v1)

### Gotcha 4: Deep Recursion in Large Threads

**Problem:** If a comment has 100 replies and each reply has 10 replies, rendering CommentItem recursively becomes O(n^2) in worst case.

**Mitigation:**
- **Depth limit (enforced):** Max 10 levels — eliminates pathological cases
- **Lazy load replies:** Don't fetch all 1000 descendants; fetch top-level and fetch-on-expand (v2)
- **Pagination:** Limit replies shown initially (v2)

**v1 mitigation:** Enforce depth limit + assume <100 comments per idea on average

### Gotcha 5: Email Visibility

**Problem:** Phase 1 requirements say email is public (visible on ideas, comments). This could be a privacy concern.

**Mitigation (v1):**
- Accept email visibility as given (aligned with civic participation norms: attribution required)
- v2: Offer option for anonymous comments (pseudonym instead of email)

### Gotcha 6: Infinite Comment Threading (Users Post Same Thread)

**Problem:** Unlikely but possible: User A comments "A", User B replies "B", User A replies "You're wrong, B", User B replies to that, etc. Turns into a back-and-forth that's not valuable discussion.

**Mitigation (v1):**
- Depth limit prevents >10-level threads
- v2: Add moderation flag "off-topic" or merge threads

### Gotcha 7: Comment Editing (Deferred)

**Problem:** User posts typo or wants to change comment. In v1, no edit endpoint.

**Mitigation:**
- Accept as v1 limitation; defer to v2
- v2: Add PATCH /api/comments/:id endpoint (author-only)
- Add "edited X ago" timestamp to show edit history

### Gotcha 8: Pagination & Comment Count Staleness

**Problem:** Ideas table has `comment_count` field (from Phase 2 schema). This could become stale if comments are added/deleted asynchronously.

**Mitigation (v1):**
- Update `comment_count` on every comment INSERT/DELETE (add trigger or application logic)
- Acceptable lag: refreshing the idea detail page recalculates

```sql
-- Trigger to auto-update comment_count
CREATE OR REPLACE FUNCTION update_idea_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ideas
  SET comment_count = (SELECT COUNT(*) FROM comments WHERE idea_id = NEW.idea_id)
  WHERE id = NEW.idea_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_count_trigger
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION update_idea_comment_count();
```

---

## Summary Table: Phase 3 Implementation Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Nesting model** | parent_comment_id FK | Standard, simple, supports recursive queries |
| **Votes schema** | Extended votes table (comment_id + CHECK) | Consistent with Phase 2; minimal schema change |
| **Rendering** | Self-recursive Vue component | Clean, reusable, natural for trees |
| **Nesting depth limit** | 10 levels | Prevents pathological cases; acceptable UX |
| **Visual indentation** | Capped at 3 levels | Prevents layout breakage; semantic depth preserved |
| **Comment moderation** | None in v1 (deferred to v2) | MVP scope; manual review not implemented |
| **Comment editing** | Not supported in v1 | Deferred to v2; audit trail preferred |
| **Pagination** | All comments loaded (v1) | <100 per idea typical; defer pagination to v2 if needed |
| **Vote deduplication** | DB UNIQUE + ON CONFLICT | Atomic, prevents race conditions |
| **Optimistic updates** | Yes, with rollback on error | Better perceived performance |
| **State management** | Pinia store per-idea | Consistent with Phase 2 auth patterns |

---

**Last updated: 2026-03-26 after architecture and best-practice research**
