# Research: Phase 2 — Ideas & Voting

**Date:** 2026-03-26
**Phase Goal:** Deliver the primary civic value loop—citizens can submit ideas, browse a ranked feed, view idea details, and vote, making the best ideas surface to the top.

**Requirements to Deliver:**
- IDEAS-01: User can browse a feed of recent and trending ideas
- IDEAS-02: User can create a new idea (title + description)
- IDEAS-03: User can view an idea in detail with all its metadata
- IDEAS-04: User can edit their own ideas after creation
- VOTE-01: User can vote (up/down) on ideas
- VOTE-03: Ideas are ranked in the feed by net vote count (trending first)

---

## 1. Database Schema

### Overview
PostgreSQL will store two primary entities: **ideas** (user-submitted content) and **votes** (user preferences on ideas). The schema is normalized to prevent data duplication and enable efficient querying for feed ranking.

### `ideas` Table

```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  email VARCHAR(254) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ideas_email ON ideas(email);
CREATE INDEX idx_ideas_created_at ON ideas(created_at DESC);
```

**Columns:**
- `id` (UUID, primary key) — Globally unique, non-sequential, safe for distributed systems
- `title` (varchar 255, required) — Idea headline; constrained length prevents abuse
- `description` (text, required) — Full idea body; unconstrained allows detailed proposals
- `email` (varchar 254, required) — User email; matches RFC 5321 max length
- `created_at` (timestamp) — Immutable creation time; used for secondary sort in feed
- `updated_at` (timestamp) — Last modification time; future use (e.g., showing "edited 2h ago")

**Indexes:**
- `idx_ideas_email` — Fast lookup of user's own ideas for edit/delete operations
- `idx_ideas_created_at` — Fast sorting by creation date for secondary ranking

**Why UUID over serial?**
- Non-sequential IDs hide total idea count from URL enumeration
- Safe for client-side ID handling without leaking platform scale
- Supported natively by PostgreSQL (no extension required in modern versions)

### `votes` Table

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  email VARCHAR(254) NOT NULL,
  vote_value SMALLINT NOT NULL CHECK (vote_value IN (-1, 0, 1)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(idea_id, email)
);

CREATE INDEX idx_votes_idea_id ON votes(idea_id);
CREATE INDEX idx_votes_email ON votes(email);
```

**Columns:**
- `id` (UUID, primary key) — Unique vote record identifier
- `idea_id` (UUID, foreign key) — Links vote to idea; CASCADE delete removes votes if idea deleted
- `email` (varchar 254) — User email; enables vote attribution and deduplication
- `vote_value` (smallint) — One of: -1 (downvote), 0 (clear vote), +1 (upvote)
- `created_at` (timestamp) — When vote was first cast
- `updated_at` (timestamp) — When vote was last modified; enables "changed mind" tracking
- `UNIQUE(idea_id, email)` — Enforces one vote per user per idea at database level

**Indexes:**
- `idx_votes_idea_id` — Fast retrieval of all votes for an idea (for vote count calculation)
- `idx_votes_email` — Fast retrieval of user's own votes (for UI: "you voted on this")

**Why UNIQUE constraint at database level?**
- Prevents race conditions; database enforces deduplication atomically
- Simplifies backend logic (no need for SELECT before INSERT/UPDATE)
- PostgreSQL supports `INSERT ... ON CONFLICT DO UPDATE` for upsert pattern

**Why vote_value = 0?**
- Allows users to clear their vote without deleting the record
- Preserves audit trail of vote changes (useful for moderation v2+)
- Simplifies aggregation queries: `SUM(vote_value)` naturally ignores zero votes

### Vote Count Query Pattern

To fetch ideas with vote counts:

```sql
SELECT
  i.id,
  i.title,
  i.description,
  i.email,
  i.created_at,
  i.updated_at,
  COALESCE(SUM(CASE WHEN v.vote_value = 1 THEN 1 ELSE 0 END), 0) as upvotes,
  COALESCE(SUM(CASE WHEN v.vote_value = -1 THEN 1 ELSE 0 END), 0) as downvotes,
  COALESCE(SUM(v.vote_value), 0) as net_votes
FROM ideas i
LEFT JOIN votes v ON i.id = v.idea_id AND v.vote_value != 0
GROUP BY i.id
ORDER BY net_votes DESC, i.created_at DESC
LIMIT 20 OFFSET 0;
```

**Why LEFT JOIN?**
- Ideas with zero votes still appear in results
- Prevents query returning different row counts on empty votes

**Why `WHERE vote_value != 0` in JOIN?**
- Excludes cleared votes from aggregation (though they still exist in audit trail)
- Improves query performance by reducing rows processed

### Migration Strategy

For Phase 2, use **raw SQL migrations** (not an ORM) to keep setup lightweight:

1. **File:** `server/db/migrations/001_initial_schema.sql`
2. **Execution:** Run manually on first deploy, then version-controlled
3. **Pattern:** Store migration metadata in `migrations_applied` table:

```sql
CREATE TABLE IF NOT EXISTS migrations_applied (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Then in migration script:
BEGIN;
  -- Create tables
  CREATE TABLE ideas (...);
  CREATE TABLE votes (...);
  -- Record completion
  INSERT INTO migrations_applied (name) VALUES ('001_initial_schema');
COMMIT;
```

**Why raw SQL over ORM (Prisma/Sequelize)?**
- Solo dev: fewer dependencies to learn/debug
- Simple schema (2 tables): ORM overhead not justified
- Phase 2 can migrate to ORM in v2 if complexity grows
- Raw SQL gives full control over indexes and constraints

---

## 2. Backend API Routes

### Architecture
All routes use **Nitro (H3)** server framework (built into Nuxt), running on Node.js/Express. Each route accesses `event.context.userEmail` (set by middleware in Phase 1).

### GET `/api/ideas` — Fetch Feed

**Purpose:** Return paginated, ranked list of ideas with vote counts.

**Query Parameters:**
- `page` (optional, default: 1) — Page number (1-indexed)
- `limit` (optional, default: 20, max: 100) — Ideas per page
- `sort` (optional, default: "trending") — "trending" (net votes DESC) or "recent" (created_at DESC)

**Response (200 OK):**
```json
{
  "ideas": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Better public transit",
      "description": "Expand bus routes to underserved neighborhoods...",
      "email": "citizen@example.com",
      "created_at": "2026-03-26T10:00:00Z",
      "updated_at": "2026-03-26T10:00:00Z",
      "net_votes": 12,
      "upvotes": 15,
      "downvotes": 3,
      "user_vote": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

**Implementation Notes:**
- `user_vote` field indicates user's own vote on each idea (null if not voted, 1 if upvote, -1 if downvote)
  - Requires joining votes table with filter `WHERE email = event.context.userEmail`
- Pagination uses offset/limit (simple, not cursor-based) for v1
- Sorting logic:
  - "trending": `ORDER BY net_votes DESC, created_at DESC`
  - "recent": `ORDER BY created_at DESC`

**Error Cases:**
- 400 Bad Request — Invalid `page` or `limit` values
- 500 Internal Server Error — Database connection failure

---

### POST `/api/ideas` — Create Idea

**Purpose:** Create a new idea attributed to user's email.

**Required Headers:**
- `X-User-Email` — User's email (extracted and validated by Phase 1 middleware)

**Request Body:**
```json
{
  "title": "Idea title here",
  "description": "Full description of the idea..."
}
```

**Validation:**
- `title`: Required, non-empty, min 5 chars, max 255 chars
- `description`: Required, non-empty, min 20 chars, max 5000 chars
- Email already available from `event.context.userEmail`

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Idea title here",
  "description": "Full description of the idea...",
  "email": "user@example.com",
  "created_at": "2026-03-26T10:15:23Z",
  "updated_at": "2026-03-26T10:15:23Z",
  "net_votes": 0
}
```

**Error Cases:**
- 400 Bad Request — Missing or invalid title/description
- 401 Unauthorized — Missing X-User-Email header or email validation failed
- 422 Unprocessable Entity — Content validation failure (e.g., spam keywords, too short)
- 500 Internal Server Error — Database write failure

**Implementation Notes:**
- Do not require email confirmation in Phase 2 (Phase 3 may add moderation)
- Return created idea immediately (user can see it in feed)
- Set `created_at` and `updated_at` to same timestamp

---

### PATCH `/api/ideas/:id` — Edit Idea

**Purpose:** Update title or description (author-only).

**Required Headers:**
- `X-User-Email` — User's email

**Path Parameter:**
- `id` — Idea UUID

**Request Body (all optional, but at least one required):**
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated title",
  "description": "Updated description",
  "email": "user@example.com",
  "created_at": "2026-03-26T10:15:23Z",
  "updated_at": "2026-03-26T10:30:45Z",
  "net_votes": 5
}
```

**Error Cases:**
- 400 Bad Request — Invalid `id` format or no fields provided
- 401 Unauthorized — Missing/invalid email header
- 403 Forbidden — User is not the idea author
- 404 Not Found — Idea does not exist
- 422 Unprocessable Entity — Validation failure on updated fields

**Implementation Notes:**
- Only author (matching email) can edit
- Check: `SELECT email FROM ideas WHERE id = ? — if email != event.context.userEmail, return 403`
- Update both title and description if provided, or just one
- Update `updated_at` to current timestamp

**Priority:** IDEAS-04 (edit) is **low priority** within Phase 2. Can be deferred post-launch if timeline pressure forces cuts. Core create/vote/browse loop is higher priority.

---

### GET `/api/ideas/:id` — Fetch Idea Detail

**Purpose:** Return full idea with metadata and user's own vote state.

**Path Parameter:**
- `id` — Idea UUID

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Better public transit",
  "description": "Expand bus routes to underserved neighborhoods because many residents lack reliable transportation. This would reduce car dependency and improve air quality.",
  "email": "citizen@example.com",
  "created_at": "2026-03-26T10:00:00Z",
  "updated_at": "2026-03-26T10:00:00Z",
  "net_votes": 12,
  "upvotes": 15,
  "downvotes": 3,
  "user_vote": null,
  "user_is_author": false
}
```

**Additional Fields (compared to feed):**
- `user_is_author` (boolean) — True if current user authored the idea (enables "Edit" button in UI)

**Error Cases:**
- 400 Bad Request — Invalid `id` format
- 404 Not Found — Idea does not exist
- 500 Internal Server Error — Database query failure

**Implementation Notes:**
- Single SELECT from ideas with LEFT JOIN on votes (filtered by user email and idea_id)
- Calculate vote counts same as feed endpoint

---

### POST `/api/ideas/:id/votes` — Vote on Idea

**Purpose:** Cast or update a vote on an idea. Upserts if vote already exists.

**Required Headers:**
- `X-User-Email` — User's email

**Path Parameter:**
- `id` — Idea UUID

**Request Body:**
```json
{
  "vote_value": 1
}
```

**Valid Values:**
- `1` — Upvote
- `-1` — Downvote
- `0` — Clear existing vote

**Response (200 OK / 201 Created):**
```json
{
  "idea_id": "550e8400-e29b-41d4-a716-446655440000",
  "vote_value": 1,
  "created_at": "2026-03-26T10:20:00Z",
  "updated_at": "2026-03-26T10:20:00Z"
}
```

**Status Codes:**
- `201 Created` — New vote record created
- `200 OK` — Existing vote updated

**Error Cases:**
- 400 Bad Request — Invalid `vote_value` (not -1, 0, or 1)
- 401 Unauthorized — Missing/invalid email header
- 404 Not Found — Idea does not exist
- 500 Internal Server Error — Database write failure

**Implementation Notes:**
- Use PostgreSQL upsert pattern: `INSERT ... ON CONFLICT (idea_id, email) DO UPDATE`
- Do NOT allow voting on own ideas (optional in v1, enforced in v2)
- Update `updated_at` on every vote change (tracks when user last changed their vote)

---

### GET `/api/ideas/:id/votes` — Get Vote Counts (Optional)

**Purpose:** Return aggregated vote statistics for an idea (alternative to embedding in idea detail).

**Path Parameter:**
- `id` — Idea UUID

**Response (200 OK):**
```json
{
  "idea_id": "550e8400-e29b-41d4-a716-446655440000",
  "net_votes": 12,
  "upvotes": 15,
  "downvotes": 3,
  "user_vote": 1
}
```

**Error Cases:**
- 400 Bad Request — Invalid `id` format
- 404 Not Found — Idea does not exist

**Implementation Notes:**
- **Optional endpoint** — Can embed vote counts in GET /ideas/:id instead (simpler)
- Useful if frontend wants to poll vote counts separately (not planned for v1)

---

## 3. Vote Logic Decision

### Vote Model: Upsert

**Pattern:** One record per (idea_id, email) pair; updating vote_value represents vote changes.

**Scenarios:**

| Scenario | Action | Result |
|----------|--------|--------|
| User votes +1 on idea | `INSERT vote_value=1` | Record created, vote_count increases by 1 |
| User already voted +1, votes -1 | `UPDATE vote_value=-1` | vote_value flips, net_votes decreases by 2 |
| User already voted +1, votes +1 again | `UPDATE vote_value=1` | No change (idempotent) |
| User already voted +1, clears vote | `UPDATE vote_value=0` | Vote neutralized, net_votes decreases by 1 |
| User votes after clearing | `UPDATE vote_value=1` | Re-vote same as original |

**Why Upsert?**
- Simpler UX: user clicks vote button, system handles deduplication transparently
- No need for separate "check if vote exists, then INSERT or UPDATE" logic
- Atomic at database level (no race conditions)

**Why vote_value = 0 instead of DELETE?**
- Preserves audit trail (can see user voted then cleared)
- Simplifies vote count aggregation (SUM() naturally treats 0 as neutral)
- Future moderation features can review vote patterns

### Vote Count Calculation

**Display Format:** Net votes

- Upvotes: `SUM(CASE WHEN vote_value = 1 THEN 1 ELSE 0 END)`
- Downvotes: `SUM(CASE WHEN vote_value = -1 THEN 1 ELSE 0 END)`
- Net: `SUM(vote_value)` (equivalent to upvotes - downvotes)

**Why Net over Separate Counts?**
- Simpler sort key for feed ranking (`ORDER BY net_votes DESC`)
- Matches civic voting mental model: "how many more support than oppose"
- Can still return upvotes/downvotes in response for UI display (e.g., thumbs up count)

**Aggregation in SQL:**
```sql
SELECT
  COALESCE(SUM(CASE WHEN vote_value = 1 THEN 1 ELSE 0 END), 0) as upvotes,
  COALESCE(SUM(CASE WHEN vote_value = -1 THEN 1 ELSE 0 END), 0) as downvotes,
  COALESCE(SUM(vote_value), 0) as net_votes
FROM votes
WHERE idea_id = ? AND vote_value != 0;
```

**Note:** Filter `vote_value != 0` to exclude cleared votes from aggregation. Record still exists in database (audit trail preserved).

---

## 4. Feed Ranking & Pagination

### Ranking Strategy

**Primary Sort:** Net votes descending (highest voted ideas first)
**Secondary Sort:** Creation date descending (newest ideas when tied)

```sql
ORDER BY net_votes DESC, created_at DESC
```

**Why This Pattern?**
- Trending ideas naturally float to top (aligns with civic value: "best ideas surface")
- Tiebreaker (recent first) prevents stale ideas from sticking at top
- Simple to calculate (no ML, no complexity)
- Deterministic (no randomness or algorithmic drift)

### Alternative: Recency Weight (Deferred)

For v2, could implement **time-decay ranking** to prevent old highly-voted ideas from permanently dominating:

```
weighted_score = net_votes + ln(hours_since_creation) * decay_factor
```

**Why defer?**
- Adds complexity (logging, tuning decay_factor)
- v1 goal is simple civic value loop, not algorithmic diversity
- Can assess if stale ideas are actual problem before adding complexity

### Pagination

**Strategy:** Offset/Limit (simple, not cursor-based)

**Query Parameters:**
- `page` (default: 1) — Which page (1-indexed for user friendliness)
- `limit` (default: 20, max: 100) — Ideas per page

**Backend Conversion:**
```javascript
const offset = (page - 1) * limit;
// SELECT ... LIMIT limit OFFSET offset
```

**Why Offset/Limit?**
- Simple to understand and implement
- Works with sorted feeds
- No need for cursor tracking

**Why Not Cursor-Based?**
- More complex (need stable cursor column)
- Overkill for v1 (don't expect millions of ideas per country)
- Can migrate to cursor in v2 if performance becomes issue

### Infinite Scroll vs. Pagination

**v1 Implementation:** Page-based (traditional pagination)

**Why?**
- Simpler for solo dev (no scroll event tracking)
- Works on all devices (including slow networks)
- Clear visual "pages" help users understand feed position

**v2 Option:** Infinite scroll + lazy loading

---

## 5. Frontend Architecture

### Pages & Components

#### `pages/index.vue` — Feed Page

**Purpose:** Browse ideas, vote, navigate to detail view.

**Structure:**
```vue
<template>
  <div class="feed-page">
    <!-- Header -->
    <header>
      <h1>Ideas</h1>
      <button @click="showCreateForm = true">+ New Idea</button>
    </header>

    <!-- Create Form Modal -->
    <CreateIdeaModal
      v-if="showCreateForm"
      @submit="handleCreateIdea"
      @close="showCreateForm = false"
    />

    <!-- Sort/Filter Options -->
    <div class="feed-controls">
      <select v-model="sort">
        <option value="trending">Trending</option>
        <option value="recent">Recent</option>
      </select>
    </div>

    <!-- Ideas List -->
    <div v-if="ideas.length > 0" class="ideas-list">
      <IdeaCard
        v-for="idea in ideas"
        :key="idea.id"
        :idea="idea"
        @vote="handleVote"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>No ideas yet. Be the first to share one!</p>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">Previous</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { Idea } from '~/types'

const authStore = useAuthStore()
const ideas = ref<Idea[]>([])
const page = ref(1)
const limit = 20
const sort = ref('trending')
const showCreateForm = ref(false)
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / limit))

onMounted(() => fetchIdeas())

const fetchIdeas = async () => {
  const response = await $fetch('/api/ideas', {
    query: {
      page: page.value,
      limit,
      sort: sort.value
    }
  })
  ideas.value = response.ideas
  total.value = response.pagination.total
}

const handleCreateIdea = async (data: { title: string; description: string }) => {
  await $fetch('/api/ideas', {
    method: 'POST',
    body: data,
    headers: {
      'X-User-Email': authStore.email
    }
  })
  showCreateForm.value = false
  page.value = 1
  await fetchIdeas()
}

const handleVote = async (ideaId: string, voteValue: number) => {
  await $fetch(`/api/ideas/${ideaId}/votes`, {
    method: 'POST',
    body: { vote_value: voteValue },
    headers: {
      'X-User-Email': authStore.email
    }
  })
  await fetchIdeas()
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchIdeas()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    fetchIdeas()
  }
}
</script>

<style scoped>
.feed-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.feed-controls {
  margin-bottom: 2rem;
}

.ideas-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>
```

#### `components/IdeaCard.vue` — Idea List Item

**Purpose:** Compact idea display with vote buttons.

```vue
<template>
  <article class="idea-card">
    <h3>
      <NuxtLink :to="`/ideas/${idea.id}`">{{ idea.title }}</NuxtLink>
    </h3>
    <p class="snippet">{{ truncate(idea.description, 150) }}</p>
    <footer class="card-footer">
      <span class="meta">
        by {{ idea.email }} • {{ formatDate(idea.created_at) }}
      </span>
      <div class="vote-buttons">
        <button
          class="vote-btn upvote"
          :class="{ active: idea.user_vote === 1 }"
          @click="$emit('vote', idea.id, 1)"
        >
          👍 {{ idea.upvotes }}
        </button>
        <button
          class="vote-btn downvote"
          :class="{ active: idea.user_vote === -1 }"
          @click="$emit('vote', idea.id, -1)"
        >
          👎 {{ idea.downvotes }}
        </button>
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { Idea } from '~/types'

defineProps<{
  idea: Idea
}>()

defineEmits<{
  vote: [ideaId: string, voteValue: number]
}>()

const truncate = (text: string, length: number) => {
  return text.length > length ? text.slice(0, length) + '...' : text
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.idea-card {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
  background: #f9f9f9;
}

.idea-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.idea-card h3 a {
  color: #0066cc;
  text-decoration: none;
}

.idea-card h3 a:hover {
  text-decoration: underline;
}

.snippet {
  color: #555;
  margin-bottom: 1rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.meta {
  color: #999;
}

.vote-buttons {
  display: flex;
  gap: 0.5rem;
}

.vote-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.vote-btn:hover {
  background: #f0f0f0;
}

.vote-btn.active {
  background: #0066cc;
  color: white;
}
</style>
```

#### `pages/ideas/[id].vue` — Idea Detail Page

**Purpose:** Full idea view, vote, edit button if author.

```vue
<template>
  <div v-if="idea" class="idea-detail">
    <header>
      <h1>{{ idea.title }}</h1>
      <p class="meta">
        by {{ idea.email }} • {{ formatDate(idea.created_at) }}
        <span v-if="idea.updated_at !== idea.created_at">
          (edited {{ formatDate(idea.updated_at) }})
        </span>
      </p>
    </header>

    <div class="content">
      <p>{{ idea.description }}</p>
    </div>

    <div class="vote-section">
      <button
        class="vote-btn upvote"
        :class="{ active: idea.user_vote === 1 }"
        @click="handleVote(1)"
      >
        👍 Upvote ({{ idea.upvotes }})
      </button>
      <button
        class="vote-btn downvote"
        :class="{ active: idea.user_vote === -1 }"
        @click="handleVote(-1)"
      >
        👎 Downvote ({{ idea.downvotes }})
      </button>
      <div class="net-votes">Net: {{ idea.net_votes }}</div>
    </div>

    <div v-if="idea.user_is_author" class="author-actions">
      <button @click="showEditForm = true">Edit</button>
      <button @click="deleteIdea">Delete</button>
    </div>

    <EditIdeaModal
      v-if="showEditForm"
      :idea="idea"
      @submit="handleEditIdea"
      @close="showEditForm = false"
    />

    <NuxtLink to="/">← Back to Feed</NuxtLink>
  </div>
  <div v-else class="loading">Loading...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import type { Idea } from '~/types'

const route = useRoute()
const authStore = useAuthStore()
const idea = ref<Idea | null>(null)
const showEditForm = ref(false)

onMounted(() => fetchIdea())

const fetchIdea = async () => {
  const id = route.params.id as string
  idea.value = await $fetch(`/api/ideas/${id}`)
}

const handleVote = async (voteValue: number) => {
  const id = route.params.id as string
  await $fetch(`/api/ideas/${id}/votes`, {
    method: 'POST',
    body: { vote_value: voteValue },
    headers: {
      'X-User-Email': authStore.email
    }
  })
  await fetchIdea()
}

const handleEditIdea = async (data: { title: string; description: string }) => {
  const id = route.params.id as string
  await $fetch(`/api/ideas/${id}`, {
    method: 'PATCH',
    body: data,
    headers: {
      'X-User-Email': authStore.email
    }
  })
  showEditForm.value = false
  await fetchIdea()
}

const deleteIdea = async () => {
  if (!confirm('Delete this idea? This cannot be undone.')) return
  const id = route.params.id as string
  await $fetch(`/api/ideas/${id}`, {
    method: 'DELETE',
    headers: {
      'X-User-Email': authStore.email
    }
  })
  await navigateTo('/')
}

const formatDate = (date: string) => new Date(date).toLocaleDateString()
</script>

<style scoped>
.idea-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  margin-bottom: 2rem;
}

header h1 {
  margin-bottom: 0.5rem;
}

.meta {
  color: #999;
  font-size: 0.9rem;
}

.content {
  margin-bottom: 2rem;
  line-height: 1.6;
}

.vote-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.vote-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.vote-btn.active {
  background: #0066cc;
  color: white;
}

.net-votes {
  font-size: 1.2rem;
  font-weight: bold;
  color: #0066cc;
}

.author-actions {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #ddd;
}

.author-actions button {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.author-actions button:hover {
  background: #e0e0e0;
}
</style>
```

#### `components/CreateIdeaModal.vue` — Create Idea Form

**Purpose:** Capture new idea submission.

```vue
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Share a New Idea</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="title">Idea Title *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="e.g., Better public transit"
            required
            minlength="5"
            maxlength="255"
          />
          <span class="help">5–255 characters</span>
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Explain your idea in detail..."
            required
            minlength="20"
            maxlength="5000"
            rows="8"
          ></textarea>
          <span class="help">20–5000 characters ({{ formData.description.length }}/5000)</span>
        </div>

        <div v-if="error" class="error">{{ error }}</div>

        <div class="form-actions">
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Submitting...' : 'Submit Idea' }}
          </button>
          <button type="button" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  title: '',
  description: ''
})
const error = ref('')
const isLoading = ref(false)

const emit = defineEmits<{
  submit: [data: typeof formData.value]
  close: []
}>()

const handleSubmit = async () => {
  error.value = ''
  isLoading.value = true

  try {
    emit('submit', formData.value)
    formData.value = { title: '', description: '' }
  } catch (e) {
    error.value = (e as Error).message || 'Failed to create idea'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  padding: 2rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.help {
  display: block;
  font-size: 0.85rem;
  color: #999;
  margin-top: 0.25rem;
}

.error {
  color: #d9534f;
  background: #f2dede;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.form-actions button {
  padding: 0.6rem 1.2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.form-actions button[type='submit'] {
  background: #0066cc;
  color: white;
  border-color: #0066cc;
}

.form-actions button[type='submit']:hover {
  background: #0052a3;
}

.form-actions button[type='submit']:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.form-actions button[type='button'] {
  background: white;
  color: #333;
}

.form-actions button[type='button']:hover {
  background: #f0f0f0;
}
</style>
```

#### `components/EditIdeaModal.vue` — Edit Idea Form

**Purpose:** Update existing idea (author-only). Similar to CreateIdeaModal but with pre-filled data.

### Types File

**File:** `src/types/index.ts`

```typescript
export interface Idea {
  id: string
  title: string
  description: string
  email: string
  created_at: string
  updated_at: string
  upvotes: number
  downvotes: number
  net_votes: number
  user_vote: number | null // 1, -1, 0, or null (not voted)
  user_is_author?: boolean
}

export interface Vote {
  id: string
  idea_id: string
  email: string
  vote_value: number
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

### Real-Time Updates Strategy

**v1 Approach:** No real-time updates; user actions trigger immediate fetch.

**Rationale:**
- Simplest to implement (no WebSocket, no polling)
- Works offline-friendly (refetch on network restore)
- Sufficient for v1 (expect low concurrency initially)

**Polling Pattern (if needed in v2):**
```javascript
// Refetch ideas every 30 seconds in background
const poll = setInterval(() => fetchIdeas(), 30000)
onUnmounted(() => clearInterval(poll))
```

---

## 6. Testing Strategy

### Unit Tests

**Vote Deduplication Logic**

```typescript
// test/server/routes/votes.test.ts
describe('POST /api/ideas/:id/votes', () => {
  it('creates new vote', async () => {
    const ideaId = await createTestIdea()
    const response = await request(app)
      .post(`/api/ideas/${ideaId}/votes`)
      .set('X-User-Email', 'user@example.com')
      .send({ vote_value: 1 })
      .expect(201)

    expect(response.body.vote_value).toBe(1)
  })

  it('updates existing vote', async () => {
    const ideaId = await createTestIdea()
    const email = 'user@example.com'

    // First vote
    await request(app)
      .post(`/api/ideas/${ideaId}/votes`)
      .set('X-User-Email', email)
      .send({ vote_value: 1 })

    // Change vote
    const response = await request(app)
      .post(`/api/ideas/${ideaId}/votes`)
      .set('X-User-Email', email)
      .send({ vote_value: -1 })
      .expect(200)

    expect(response.body.vote_value).toBe(-1)
  })

  it('clears vote with value 0', async () => {
    // Similar pattern
  })

  it('enforces one vote per user per idea', async () => {
    // Verify database constraint
  })
})
```

**Ranking Calculation**

```typescript
// test/server/utils/ranking.test.ts
describe('idea ranking', () => {
  it('sorts by net votes DESC', async () => {
    const idea1 = await createTestIdea('Idea 1')
    const idea2 = await createTestIdea('Idea 2')

    // Vote idea1 up 5 times, idea2 up 3 times
    // Fetch feed and verify idea1 comes first
  })

  it('uses creation date as tiebreaker', async () => {
    const idea1 = await createTestIdea('Idea 1')
    const idea2 = await createTestIdea('Idea 2')

    // Both have same vote count, idea2 is newer
    // Verify idea2 comes first
  })
})
```

### Integration Tests

**Create Idea → Vote → Verify Feed**

```typescript
// test/integration.test.ts
describe('civic loop: create → vote → feed', () => {
  it('user creates idea, votes appear in feed ranked', async () => {
    const user1 = 'alice@example.com'
    const user2 = 'bob@example.com'

    // User 1 creates idea
    const createRes = await request(app)
      .post('/api/ideas')
      .set('X-User-Email', user1)
      .send({
        title: 'Better buses',
        description: 'Expand transit to underserved areas'
      })
      .expect(201)
    const ideaId = createRes.body.id

    // User 2 upvotes
    await request(app)
      .post(`/api/ideas/${ideaId}/votes`)
      .set('X-User-Email', user2)
      .send({ vote_value: 1 })
      .expect(201)

    // Fetch feed and verify vote count
    const feedRes = await request(app)
      .get('/api/ideas')
      .expect(200)

    const ideaInFeed = feedRes.body.ideas.find(i => i.id === ideaId)
    expect(ideaInFeed.net_votes).toBe(1)
    expect(ideaInFeed.upvotes).toBe(1)
  })

  it('vote changes update feed ranking', async () => {
    // Create 2 ideas
    // Vote them to different positions
    // Verify ranking order
  })
})
```

### E2E Tests (Playwright/Cypress)

**User Flow: Create → Vote → See Ranking**

```javascript
// e2e/civic-loop.spec.ts
test('user creates idea, votes on it, sees it ranked', async ({ page }) => {
  await page.goto('/')

  // Click "New Idea"
  await page.click('button:has-text("New Idea")')

  // Fill form
  await page.fill('input[placeholder="e.g., Better public transit"]', 'Idea title')
  await page.fill('textarea', 'Full idea description here')

  // Email capture modal (Phase 1)
  await page.fill('input[type="email"]', 'test@example.com')
  await page.click('button:has-text("Save")')

  // Submit idea
  await page.click('button:has-text("Submit Idea")')

  // Wait for redirect to feed
  await page.waitForURL('/')

  // Verify idea appears in feed
  await expect(page.locator('text=Idea title')).toBeVisible()

  // Vote on it
  await page.click('button:has-text("👍 Upvote")')

  // Verify vote count updates
  await expect(page.locator('text=👍 1')).toBeVisible()
})
```

### Test Infrastructure

**Database Seeding:**
```typescript
// test/setup.ts
beforeEach(async () => {
  await db.exec('TRUNCATE ideas, votes CASCADE')
})
```

**Test Utilities:**
```typescript
const createTestIdea = async (title = 'Test Idea', email = 'test@example.com') => {
  const result = await db.query(
    'INSERT INTO ideas (title, description, email) VALUES (?, ?, ?) RETURNING id',
    [title, 'Test description', email]
  )
  return result.rows[0].id
}

const createTestVote = async (ideaId, email, voteValue) => {
  return db.query(
    'INSERT INTO votes (idea_id, email, vote_value) VALUES (?, ?, ?) ON CONFLICT (idea_id, email) DO UPDATE SET vote_value = ? RETURNING *',
    [ideaId, email, voteValue, voteValue]
  )
}
```

---

## 7. Implementation Timeline

### Phase 2A: Database & Backend (Days 1–2)

**Day 1:**
- Install PostgreSQL driver (`npm install pg`)
- Write migration: `001_initial_schema.sql` (ideas, votes tables + indexes)
- Run migration on test database
- Write database utility functions (connect, query, seed)

**Day 2:**
- Implement `/api/ideas` GET (fetch + ranking logic)
- Implement `/api/ideas` POST (create idea)
- Implement `/api/ideas/:id` GET (detail)
- Implement `/api/ideas/:id/votes` POST (vote + upsert)
- Write integration tests for backend

### Phase 2B: Frontend (Days 3–4)

**Day 3:**
- Create `pages/index.vue` (feed page with IdeaCard component)
- Create `components/IdeaCard.vue`
- Create `components/CreateIdeaModal.vue`
- Test: browse feed, click details, see vote counts

**Day 4:**
- Create `pages/ideas/[id].vue` (detail page)
- Create `components/EditIdeaModal.vue`
- Implement edit flow (PATCH endpoint if timeline allows)
- Test: detail page load, vote buttons, edit

### Phase 2C: Polish & Testing (Day 5)

**Day 5:**
- Fix UI bugs (loading states, error messages, empty states)
- Add E2E test: create idea, vote, verify feed
- Seed test data (10–15 realistic ideas)
- Manual testing: full user flow
- Prepare migration script for production

### Total Timeline: 5–7 days (solo dev)

**If timeline pressure forces cuts:**
1. Defer IDEAS-04 (edit) to post-launch
2. Defer DELETE endpoint (can be admin-only initially)
3. Ship minimal validation (min length checks, required fields only)

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database schema design issues | Slow queries, hard-to-implement features later | Review schema with peer before migration; use indexes aggressively |
| N+1 vote count queries | Feed page slow with many ideas | Use SQL JOIN + GROUP BY from day one; avoid fetching votes separately |
| Vote race conditions | Duplicate votes possible | Rely on database UNIQUE constraint; test concurrent votes |
| Frontend state management | Vote state out of sync with server | Refetch ideas after each vote; don't assume optimistic updates work |
| Email validation on backend | Invalid emails cause errors | Reuse Phase 1 email validation utility; test edge cases (+aliases, domains) |
| Empty feed at launch | Users discouraged by ghost town | Seed 10–20 realistic ideas manually before public launch |
| Spam/abuse ideas | Feed quality degrades | Implement manual review queue in Phase 3; accept moderation burden for v1 |

---

## 9. Architecture Decisions Summary

| Decision | Alternative | Rationale |
|----------|-------------|-----------|
| UUID for idea IDs | Serial integers | Non-sequential, safe from enumeration |
| Vote upsert pattern | Separate INSERT/UPDATE logic | Atomic, simpler, no race conditions |
| Offset/limit pagination | Cursor-based | Simpler for v1; sufficient for expected scale |
| Raw SQL migrations | ORM (Prisma/Sequelize) | Solo dev, simple schema, full control |
| Feed ranking: net votes DESC | Time decay, ML scoring | Simple, deterministic, no tuning needed |
| No real-time updates | WebSocket polling | Simpler, works offline, sufficient for v1 |
| One vote per email per idea | Allow vote per IP or session | Email ties to identity; consistent with Phase 1 auth model |
| Display net + up/down votes | Display only net votes | Users understand both "consensus" and "disagreement volume" |

---

## 10. Confidence & Next Steps

**What's Clear:**
- Schema is straightforward (no complex relationships)
- API routes map directly to requirement; no edge cases
- Vote upsert pattern is simple SQL (`ON CONFLICT DO UPDATE`)
- Frontend pages are standard CRUD UI

**What Needs Validation:**
- Database performance with 1000+ ideas (test with larger seed data)
- Email-only identity sustainability (will spam become problem?)
- Voting UI clarity (do users understand up/down votes?)

**Next Phase Planning:**
- Day 0 before starting Phase 2: pair with senior dev to review database schema
- Set up test database locally
- Write database utility functions first (ensure queries work)
- Then build backend routes, then frontend
- Run full E2E test before marking Phase 2 complete

---

**Author:** Phase 2 Research
**Last Updated:** 2026-03-26
**Status:** Ready for implementation planning
