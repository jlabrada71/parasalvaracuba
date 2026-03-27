---
wave: 1
depends_on: []
files_modified:
  - db/migrations/001_create_ideas_and_votes.sql (create)
  - server/utils/db.ts (create)
  - server/routes/ideas/index.ts (create — GET /api/ideas, POST /api/ideas)
  - server/routes/ideas/[id].ts (create — GET /api/ideas/:id, PATCH /api/ideas/:id)
  - server/routes/ideas/[id]/votes.ts (create — POST /api/ideas/:id/votes)
  - app/pages/index.vue (modify — replace stub with live feed)
  - app/pages/ideas/[id].vue (create)
  - app/pages/ideas/create.vue (create)
  - app/components/IdeaCard.vue (create)
  - app/components/VoteButton.vue (create)
  - tests/integration/ideas.test.ts (create)
  - tests/integration/votes.test.ts (create)
  - nuxt.config.ts (modify — expose DATABASE_URL to runtime config)
  - package.json (modify — add pg dependency)
autonomous: true
---

# Phase 2 Plan: Ideas & Voting

**Goal:** Deliver the primary civic value loop — citizens can submit ideas, browse a ranked feed, view idea details, and vote, making the best ideas surface to the top.

**Requirements:** IDEAS-01, IDEAS-02, IDEAS-03, IDEAS-04, VOTE-01, VOTE-03

**Execution order:** T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 (optional) → T9 → T10 → T11

---

## Tasks

### Task 1: Install pg dependency and add DATABASE_URL to runtime config
**Objective:** Wire up the PostgreSQL client library and expose the connection string to server code.

<task>
<id>P2-T1</id>
<title>Add pg dependency and configure DATABASE_URL</title>
<instructions>
1. Install the PostgreSQL client:

```bash
npm install pg
npm install --save-dev @types/pg
```

2. Open `nuxt.config.ts` and add a `runtimeConfig` block so the database URL is available in server-side code:

```ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
  },
})
```

3. Ensure `DATABASE_URL` is set in your local environment (e.g. in a `.env` file at the project root — this file must NOT be committed):

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/parasalvaracuba
```

- [ ] `npm install pg @types/pg` runs without error
- [ ] `nuxt.config.ts` updated with runtimeConfig
- [ ] `.env` created locally with a valid DATABASE_URL (gitignored)

Acceptance: `process.env.DATABASE_URL` resolves at server startup without crashing.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 2: Database Migration — ideas and votes schema
**Objective:** Create the PostgreSQL schema for ideas and votes with all required constraints and indexes.

<task>
<id>P2-T2</id>
<title>Create and run db/migrations/001_create_ideas_and_votes.sql</title>
<instructions>
Create the directory and file `db/migrations/001_create_ideas_and_votes.sql`:

```sql
-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ideas_email_idx      ON ideas (email);
CREATE INDEX IF NOT EXISTS ideas_created_at_idx ON ideas (created_at DESC);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id     UUID NOT NULL REFERENCES ideas (id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  vote_value  SMALLINT NOT NULL CHECK (vote_value IN (-1, 0, 1)),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (idea_id, email)
);

CREATE INDEX IF NOT EXISTS votes_idea_id_idx ON votes (idea_id);
CREATE INDEX IF NOT EXISTS votes_email_idx   ON votes (email);
```

Run the migration:

```bash
psql $DATABASE_URL < db/migrations/001_create_ideas_and_votes.sql
```

Verify the tables were created:

```bash
psql $DATABASE_URL -c "\dt"
psql $DATABASE_URL -c "\d ideas"
psql $DATABASE_URL -c "\d votes"
```

- [ ] Migration file created at `db/migrations/001_create_ideas_and_votes.sql`
- [ ] Migration runs without error
- [ ] `\dt` shows both `ideas` and `votes` tables
- [ ] UNIQUE constraint on `(idea_id, email)` confirmed in `\d votes`

Acceptance: Both tables exist with correct columns, indexes, and the UNIQUE constraint on (idea_id, email).
</instructions>
<must_have>true</must_have>
</task>

---

### Task 3: Database connection utility
**Objective:** Create a shared PostgreSQL pool used by all server routes.

<task>
<id>P2-T3</id>
<title>server/utils/db.ts — connection pool and query helper</title>
<instructions>
Create `server/utils/db.ts`:

```ts
import pg from 'pg'

const { Pool } = pg

let _pool: pg.Pool | null = null

function getPool(): pg.Pool {
  if (!_pool) {
    const config = useRuntimeConfig()
    _pool = new Pool({ connectionString: config.databaseUrl })
  }
  return _pool
}

/**
 * Execute a parameterised query and return all rows.
 * Usage: await query('SELECT * FROM ideas WHERE id = $1', [id])
 */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query<T>(sql, params)
  return result.rows
}

/**
 * Execute a query and return the first row only (or null).
 */
export async function queryOne<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
```

Notes:
- `useRuntimeConfig()` is a Nitro/H3 global — no import needed inside server routes/utils.
- The pool is lazily initialised once and reused across requests.
- `pg` uses CommonJS; the default import handles both ESM and CJS interop via the `pg` package.

- [ ] File created at `server/utils/db.ts`
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)

Acceptance: `query` and `queryOne` can be imported in server routes and execute SQL against the database.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 4: Ideas routes (GET feed, POST create, GET detail, PATCH edit)
**Objective:** Implement all four ideas endpoints.

<task>
<id>P2-T4</id>
<title>server/routes/ideas/ — idea CRUD endpoints</title>
<instructions>
Nuxt/Nitro file-based routing maps filenames to URL paths. Create two files:

#### server/routes/ideas/index.ts — GET /api/ideas and POST /api/ideas

```ts
import { defineEventHandler, readBody, createError } from 'h3'
import { query, queryOne } from '../../utils/db'

export default defineEventHandler(async (event) => {
  // GET /api/ideas?page=1
  if (event.method === 'GET') {
    const qs = getQuery(event)
    const page = Math.max(1, parseInt(String(qs.page ?? '1'), 10))
    const limit = 20
    const offset = (page - 1) * limit

    const rows = await query(`
      SELECT
        i.id,
        i.title,
        i.description,
        i.email,
        i.created_at,
        i.updated_at,
        COALESCE(SUM(v.vote_value), 0)::int AS net_votes
      FROM ideas i
      LEFT JOIN votes v ON v.idea_id = i.id
      GROUP BY i.id
      ORDER BY net_votes DESC, i.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])

    return { ideas: rows, page, limit }
  }

  // POST /api/ideas
  if (event.method === 'POST') {
    const userEmail = event.context.userEmail
    if (!userEmail) {
      throw createError({ statusCode: 401, message: 'Email required' })
    }

    const body = await readBody(event)
    const title = (body?.title ?? '').trim()
    const description = (body?.description ?? '').trim()

    if (!title) throw createError({ statusCode: 400, message: 'title is required' })
    if (!description) throw createError({ statusCode: 400, message: 'description is required' })
    if (title.length > 200) throw createError({ statusCode: 400, message: 'title must be 200 characters or fewer' })

    const [idea] = await query(`
      INSERT INTO ideas (title, description, email)
      VALUES ($1, $2, $3)
      RETURNING id, title, description, email, created_at, updated_at
    `, [title, description, userEmail])

    setResponseStatus(event, 201)
    return idea
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
```

#### server/routes/ideas/[id].ts — GET /api/ideas/:id and PATCH /api/ideas/:id

```ts
import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { query, queryOne } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id is required' })

  // GET /api/ideas/:id
  if (event.method === 'GET') {
    const idea = await queryOne(`
      SELECT
        i.id,
        i.title,
        i.description,
        i.email,
        i.created_at,
        i.updated_at,
        COALESCE(SUM(v.vote_value), 0)::int AS net_votes
      FROM ideas i
      LEFT JOIN votes v ON v.idea_id = i.id
      WHERE i.id = $1
      GROUP BY i.id
    `, [id])

    if (!idea) throw createError({ statusCode: 404, message: 'Idea not found' })
    return idea
  }

  // PATCH /api/ideas/:id
  if (event.method === 'PATCH') {
    const userEmail = event.context.userEmail
    if (!userEmail) throw createError({ statusCode: 401, message: 'Email required' })

    const existing = await queryOne('SELECT id, email FROM ideas WHERE id = $1', [id])
    if (!existing) throw createError({ statusCode: 404, message: 'Idea not found' })
    if (existing.email !== userEmail) throw createError({ statusCode: 403, message: 'Forbidden' })

    const body = await readBody(event)
    const title = (body?.title ?? '').trim()
    const description = (body?.description ?? '').trim()

    if (!title) throw createError({ statusCode: 400, message: 'title is required' })
    if (!description) throw createError({ statusCode: 400, message: 'description is required' })
    if (title.length > 200) throw createError({ statusCode: 400, message: 'title must be 200 characters or fewer' })

    const [updated] = await query(`
      UPDATE ideas
      SET title = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, title, description, email, created_at, updated_at
    `, [title, description, id])

    return updated
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
```

Checklist:
- [ ] `server/routes/ideas/index.ts` created
- [ ] `server/routes/ideas/[id].ts` created
- [ ] `getQuery` and `setResponseStatus` are Nitro globals — no import needed (same as `useRuntimeConfig`)
- [ ] Restart dev server; verify routes resolve at `/api/ideas` and `/api/ideas/:id`

Acceptance: `curl http://localhost:3000/api/ideas` returns `{"ideas":[],"page":1,"limit":20}` on an empty DB. POST with valid body and X-User-Email header returns 201 with the new idea.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 5: Votes route (POST upsert)
**Objective:** Implement the vote upsert endpoint with deduplication via ON CONFLICT.

<task>
<id>P2-T5</id>
<title>server/routes/ideas/[id]/votes.ts — vote upsert</title>
<instructions>
Create `server/routes/ideas/[id]/votes.ts`:

```ts
import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { query, queryOne } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Method not allowed' })
  }

  const userEmail = event.context.userEmail
  if (!userEmail) throw createError({ statusCode: 401, message: 'Email required' })

  const ideaId = getRouterParam(event, 'id')
  if (!ideaId) throw createError({ statusCode: 400, message: 'idea id is required' })

  // Verify idea exists
  const idea = await queryOne('SELECT id FROM ideas WHERE id = $1', [ideaId])
  if (!idea) throw createError({ statusCode: 404, message: 'Idea not found' })

  const body = await readBody(event)
  const voteValue = body?.vote_value

  if (voteValue === undefined || voteValue === null) {
    throw createError({ statusCode: 400, message: 'vote_value is required' })
  }
  if (![1, 0, -1].includes(Number(voteValue))) {
    throw createError({ statusCode: 400, message: 'vote_value must be -1, 0, or 1' })
  }

  // Upsert: insert or update on duplicate (idea_id, email)
  await query(`
    INSERT INTO votes (idea_id, email, vote_value)
    VALUES ($1, $2, $3)
    ON CONFLICT (idea_id, email)
    DO UPDATE SET vote_value = EXCLUDED.vote_value, updated_at = NOW()
  `, [ideaId, userEmail, Number(voteValue)])

  // Return updated net vote count for this idea
  const result = await queryOne<{ net_votes: number }>(`
    SELECT COALESCE(SUM(vote_value), 0)::int AS net_votes
    FROM votes
    WHERE idea_id = $1
  `, [ideaId])

  return { idea_id: ideaId, net_votes: result?.net_votes ?? 0 }
})
```

- [ ] `server/routes/ideas/[id]/votes.ts` created
- [ ] Restart dev server; `POST /api/ideas/:id/votes` returns net_votes
- [ ] Voting twice with the same email and vote_value does not create a duplicate row (check `SELECT COUNT(*) FROM votes WHERE idea_id = $1`)
- [ ] Voting with vote_value 0 effectively clears the vote (net count changes correctly)

Acceptance: Upsert works. Duplicate vote updates instead of inserting. Returned net_votes reflects all votes.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 6: IdeaCard and VoteButton components
**Objective:** Reusable components consumed by the feed and detail pages.

<task>
<id>P2-T6</id>
<title>app/components/IdeaCard.vue and app/components/VoteButton.vue</title>
<instructions>
#### app/components/IdeaCard.vue

Displays a single idea in the feed list. Receives the idea as a prop; emits vote events upward.

```vue
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
```

#### app/components/VoteButton.vue

Renders the up/down vote controls. Calls the vote API directly and emits the updated net_votes back to the parent.

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

const props = defineProps<{ ideaId: string; netVotes: number }>()
const emit = defineEmits<{ voted: [payload: { ideaId: string; netVotes: number }] }>()

const { requireEmail } = useEmailGate()
const localNetVotes = ref(props.netVotes)
const currentVote = ref<1 | -1 | 0>(0)
const loading = ref(false)

async function castVote(value: 1 | -1) {
  requireEmail(async () => {
    // Toggle off if clicking the same direction
    const newValue = currentVote.value === value ? 0 : value
    loading.value = true
    try {
      const result = await apiRequest<{ net_votes: number }>(`/api/ideas/${props.ideaId}/votes`, {
        method: 'POST',
        body: { vote_value: newValue },
      })
      currentVote.value = newValue
      localNetVotes.value = result.net_votes
      emit('voted', { ideaId: props.ideaId, netVotes: result.net_votes })
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
```

- [ ] `app/components/IdeaCard.vue` created
- [ ] `app/components/VoteButton.vue` created
- [ ] No TypeScript errors

Acceptance: Components render without errors. VoteButton calls the API and emits the updated count. Email gate triggers for unauthenticated users.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 7: Feed page (index.vue)
**Objective:** Replace the Phase 1 stub with a live, ranked idea feed.

<task>
<id>P2-T7</id>
<title>app/pages/index.vue — live ranked idea feed</title>
<instructions>
Replace the contents of `app/pages/index.vue` entirely:

```vue
<template>
  <div class="home-page">
    <nav class="nav">
      <span class="nav-brand">ParaSalvaraCuba</span>
      <div class="nav-actions">
        <NuxtLink to="/ideas/create" class="btn-primary">+ New Idea</NuxtLink>
        <NuxtLink to="/settings" class="nav-link">Settings</NuxtLink>
      </div>
    </nav>

    <main>
      <h1>Ideas for Cuba</h1>
      <p class="subtitle">Submit and vote on ideas. The best rise to the top.</p>

      <div v-if="pending" class="loading">Loading ideas…</div>
      <div v-else-if="error" class="error">Failed to load ideas. Please refresh.</div>
      <div v-else-if="ideas.length === 0" class="empty">No ideas yet. Be the first!</div>

      <div v-else class="ideas-list">
        <IdeaCard
          v-for="idea in ideas"
          :key="idea.id"
          :idea="idea"
          @voted="onVoted"
        />
      </div>

      <div v-if="hasMore" class="pagination">
        <button :disabled="pending" @click="loadMore">Load more</button>
      </div>
    </main>

    <EmailCaptureModal
      :visible="modalVisible"
      @saved="onModalSaved"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IdeaCard from '~/components/IdeaCard.vue'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'
import { useEmailGate } from '~/composables/useEmailGate'

interface Idea {
  id: string
  title: string
  email: string
  created_at: string
  net_votes: number
}

const { modalVisible, onModalSaved, onModalClose } = useEmailGate()

const page = ref(1)
const ideas = ref<Idea[]>([])
const hasMore = ref(false)
const pending = ref(false)
const error = ref(false)

async function fetchIdeas(p: number) {
  pending.value = true
  error.value = false
  try {
    const data = await $fetch<{ ideas: Idea[]; page: number; limit: number }>(`/api/ideas?page=${p}`)
    if (p === 1) {
      ideas.value = data.ideas
    } else {
      ideas.value.push(...data.ideas)
    }
    hasMore.value = data.ideas.length === data.limit
  } catch {
    error.value = true
  } finally {
    pending.value = false
  }
}

function loadMore() {
  page.value += 1
  fetchIdeas(page.value)
}

function onVoted(payload: { ideaId: string; netVotes: number }) {
  const idea = ideas.value.find(i => i.id === payload.ideaId)
  if (idea) idea.net_votes = payload.netVotes
}

// Initial load
fetchIdeas(1)
</script>

<style scoped>
.home-page { font-family: system-ui, sans-serif; }
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1e3a5f;
  color: white;
}
.nav-brand { font-weight: 700; font-size: 1.1rem; }
.nav-actions { display: flex; align-items: center; gap: 1rem; }
.nav-link { color: white; text-decoration: none; font-size: 0.9rem; }
.btn-primary {
  padding: 0.45rem 1rem;
  background: #2563eb;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
}
main { max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
.subtitle { color: #6b7280; margin-bottom: 1.5rem; }
.ideas-list { margin-top: 1rem; }
.loading, .empty, .error { padding: 2rem 0; color: #6b7280; }
.error { color: #dc2626; }
.pagination { margin: 1.5rem 0; text-align: center; }
.pagination button {
  padding: 0.6rem 1.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

- [ ] `app/pages/index.vue` updated
- [ ] Dev server running — feed loads (empty state or with data)
- [ ] "+ New Idea" links to `/ideas/create`

Acceptance: Feed renders with ideas sorted by net_votes DESC. Empty state shown when no ideas exist. Pagination loads more.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 8: Idea detail page
**Objective:** Full idea view with vote controls and edit button for the author.

<task>
<id>P2-T8</id>
<title>app/pages/ideas/[id].vue — idea detail page</title>
<instructions>
Create `app/pages/ideas/[id].vue`:

```vue
<template>
  <div class="detail-page">
    <nav class="nav">
      <NuxtLink to="/" class="nav-back">← Back to feed</NuxtLink>
      <span class="nav-brand">ParaSalvaraCuba</span>
    </nav>

    <main>
      <div v-if="pending" class="loading">Loading…</div>
      <div v-else-if="error" class="error">Idea not found.</div>

      <article v-else-if="idea">
        <div class="idea-header">
          <VoteButton :idea-id="idea.id" :net-votes="idea.net_votes" @voted="onVoted" />
          <div class="idea-title-block">
            <h1>{{ idea.title }}</h1>
            <p class="idea-meta">by {{ idea.email }} &middot; {{ formatDate(idea.created_at) }}</p>
          </div>
        </div>

        <div class="idea-description">{{ idea.description }}</div>

        <div v-if="isAuthor" class="idea-actions">
          <button @click="openEdit">Edit idea</button>
        </div>

        <!-- Inline edit form (shown when editing) -->
        <form v-if="editing" class="edit-form" @submit.prevent="submitEdit">
          <label>
            Title
            <input v-model="editTitle" maxlength="200" required />
          </label>
          <label>
            Description
            <textarea v-model="editDescription" rows="6" required />
          </label>
          <div class="edit-actions">
            <button type="submit" :disabled="saving">Save changes</button>
            <button type="button" @click="editing = false">Cancel</button>
          </div>
          <p v-if="editError" class="error">{{ editError }}</p>
        </form>
      </article>
    </main>

    <EmailCaptureModal
      :visible="modalVisible"
      @saved="onModalSaved"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import VoteButton from '~/components/VoteButton.vue'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'
import { useAuthStore } from '~/stores/authStore'
import { useEmailGate } from '~/composables/useEmailGate'
import { apiRequest } from '~/utils/apiClient'

interface Idea {
  id: string
  title: string
  description: string
  email: string
  created_at: string
  updated_at: string
  net_votes: number
}

const route = useRoute()
const auth = useAuthStore()
const { modalVisible, onModalSaved, onModalClose } = useEmailGate()

const idea = ref<Idea | null>(null)
const pending = ref(true)
const error = ref(false)

const editing = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const saving = ref(false)
const editError = ref('')

const isAuthor = computed(() => !!auth.email && idea.value?.email === auth.email)

async function fetchIdea() {
  pending.value = true
  error.value = false
  try {
    idea.value = await $fetch<Idea>(`/api/ideas/${route.params.id}`)
  } catch {
    error.value = true
  } finally {
    pending.value = false
  }
}

function onVoted(payload: { ideaId: string; netVotes: number }) {
  if (idea.value) idea.value.net_votes = payload.netVotes
}

function openEdit() {
  if (!idea.value) return
  editTitle.value = idea.value.title
  editDescription.value = idea.value.description
  editError.value = ''
  editing.value = true
}

async function submitEdit() {
  if (!idea.value) return
  saving.value = true
  editError.value = ''
  try {
    const updated = await apiRequest<Idea>(`/api/ideas/${idea.value.id}`, {
      method: 'PATCH',
      body: { title: editTitle.value, description: editDescription.value },
    })
    idea.value = { ...idea.value, ...updated }
    editing.value = false
  } catch (e: unknown) {
    editError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to save.'
  } finally {
    saving.value = false
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CU', { year: 'numeric', month: 'short', day: 'numeric' })
}

auth.init()
fetchIdea()
</script>

<style scoped>
.detail-page { font-family: system-ui, sans-serif; }
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1e3a5f;
  color: white;
}
.nav-back { color: white; text-decoration: none; font-size: 0.9rem; }
.nav-brand { font-weight: 700; font-size: 1.1rem; }
main { max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
.idea-header { display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1rem; }
.idea-title-block h1 { margin: 0 0 0.25rem; font-size: 1.5rem; color: #1e3a5f; }
.idea-meta { font-size: 0.8rem; color: #6b7280; margin: 0; }
.idea-description { line-height: 1.7; color: #374151; white-space: pre-wrap; margin-bottom: 1.5rem; }
.idea-actions { margin-bottom: 1rem; }
.idea-actions button {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}
.edit-form { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
.edit-form label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.9rem; font-weight: 600; }
.edit-form input, .edit-form textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}
.edit-actions { display: flex; gap: 0.75rem; }
.edit-actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #d1d5db;
}
.edit-actions button[type="submit"] { background: #2563eb; color: white; border-color: #2563eb; }
.loading, .error { padding: 2rem 0; color: #6b7280; }
.error { color: #dc2626; }
</style>
```

- [ ] `app/pages/ideas/[id].vue` created
- [ ] Navigating to `/ideas/<valid-id>` renders the idea
- [ ] Edit button visible only when `auth.email === idea.email`

Acceptance: Detail page shows full title, description, vote count. Edit form appears for authors and saves correctly. Non-authors do not see the edit button.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 9: Create idea page
**Objective:** Form to create a new idea, gated behind email identity.

<task>
<id>P2-T9</id>
<title>app/pages/ideas/create.vue — create idea form</title>
<instructions>
Create `app/pages/ideas/create.vue`:

```vue
<template>
  <div class="create-page">
    <nav class="nav">
      <NuxtLink to="/" class="nav-back">← Back to feed</NuxtLink>
      <span class="nav-brand">ParaSalvaraCuba</span>
    </nav>

    <main>
      <h1>Submit a new idea</h1>
      <p class="subtitle">Share what you think would help Cuba.</p>

      <form class="create-form" @submit.prevent="handleSubmit">
        <label>
          Title <span class="required">*</span>
          <input
            v-model="title"
            maxlength="200"
            placeholder="Short, clear title (max 200 characters)"
            required
          />
          <span class="char-count">{{ title.length }}/200</span>
        </label>

        <label>
          Description <span class="required">*</span>
          <textarea
            v-model="description"
            rows="8"
            placeholder="Describe the idea in detail…"
            required
          />
        </label>

        <p v-if="formError" class="error">{{ formError }}</p>

        <div class="form-actions">
          <button type="submit" :disabled="submitting">
            {{ submitting ? 'Submitting…' : 'Submit idea' }}
          </button>
          <NuxtLink to="/" class="cancel-link">Cancel</NuxtLink>
        </div>
      </form>
    </main>

    <EmailCaptureModal
      :visible="modalVisible"
      @saved="onModalSaved"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'
import { useEmailGate } from '~/composables/useEmailGate'
import { apiRequest } from '~/utils/apiClient'

const router = useRouter()
const { modalVisible, requireEmail, onModalSaved, onModalClose } = useEmailGate()

const title = ref('')
const description = ref('')
const submitting = ref(false)
const formError = ref('')

function handleSubmit() {
  requireEmail(submitIdea)
}

async function submitIdea() {
  if (!title.value.trim()) { formError.value = 'Title is required.'; return }
  if (!description.value.trim()) { formError.value = 'Description is required.'; return }

  submitting.value = true
  formError.value = ''

  try {
    const idea = await apiRequest<{ id: string }>('/api/ideas', {
      method: 'POST',
      body: { title: title.value.trim(), description: description.value.trim() },
    })
    router.push(`/ideas/${idea.id}`)
  } catch (e: unknown) {
    formError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to submit. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-page { font-family: system-ui, sans-serif; }
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1e3a5f;
  color: white;
}
.nav-back { color: white; text-decoration: none; font-size: 0.9rem; }
.nav-brand { font-weight: 700; font-size: 1.1rem; }
main { max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
.subtitle { color: #6b7280; margin-bottom: 1.5rem; }
.create-form { display: flex; flex-direction: column; gap: 1rem; }
.create-form label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.9rem; font-weight: 600; }
.create-form input, .create-form textarea {
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}
.char-count { font-size: 0.75rem; color: #9ca3af; font-weight: 400; }
.required { color: #dc2626; }
.form-actions { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; }
.form-actions button {
  padding: 0.65rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
.form-actions button:disabled { opacity: 0.6; cursor: not-allowed; }
.cancel-link { color: #6b7280; font-size: 0.9rem; text-decoration: none; }
.error { color: #dc2626; font-size: 0.9rem; }
</style>
```

- [ ] `app/pages/ideas/create.vue` created
- [ ] Unauthenticated user is prompted for email before submit fires
- [ ] On success, user is redirected to the new idea's detail page

Acceptance: Form validates title and description. Authenticated user can submit and is redirected. Unauthenticated user sees email modal before form submits.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 10: Edit idea functionality (IDEAS-04) — lowest priority
**Objective:** Author-only edit is already embedded in the detail page (Task 8). This task is the acceptance gate for IDEAS-04 specifically.

<task>
<id>P2-T10</id>
<title>Verify edit idea works end-to-end (IDEAS-04)</title>
<instructions>
Edit functionality is implemented inside `app/pages/ideas/[id].vue` (Task 8). This task is verification only.

Manual checks:
1. Log in with email A, create an idea.
2. Navigate to the idea's detail page — "Edit idea" button is visible.
3. Click "Edit idea" — inline form appears with current title/description.
4. Change the title; click "Save changes".
5. Title updates on the page without reload.
6. Open the same idea URL in a private window (no email) — "Edit idea" button is NOT visible.
7. Use a different email (log in as email B via Settings) — "Edit idea" button is NOT visible.

PATCH endpoint checks (can do with curl):
```bash
# Should return 403
curl -X PATCH http://localhost:3000/api/ideas/<id> \
  -H "Content-Type: application/json" \
  -H "X-User-Email: wrongemail@example.com" \
  -d '{"title":"Hacked","description":"..."}'

# Should return 200
curl -X PATCH http://localhost:3000/api/ideas/<id> \
  -H "Content-Type: application/json" \
  -H "X-User-Email: author@example.com" \
  -d '{"title":"Updated title","description":"Updated description"}'
```

- [ ] Author sees and can use Edit form
- [ ] Non-author does not see Edit button
- [ ] PATCH returns 403 for wrong email
- [ ] PATCH returns 200 and updated idea for author

Acceptance: Author can edit title/description. Non-authors cannot see or trigger edit. Server enforces authorship.

NOTE: If timeline pressure is real, the inline edit in the detail page is already the full implementation — this task is just the checklist. It is the safest item to skip in a crunch.
</instructions>
<must_have>false</must_have>
</task>

---

### Task 11: Integration tests — ideas CRUD
**Objective:** Test all four idea endpoints with real HTTP calls against the running server.

<task>
<id>P2-T11</id>
<title>tests/integration/ideas.test.ts — idea endpoint tests</title>
<instructions>
Create `tests/integration/ideas.test.ts`. These tests hit the Nitro dev server directly using `$fetch` or `node-fetch`; they require the server to be running and the database to be seeded/cleaned between runs.

Use a test email constant and clean up after each test to avoid state bleed.

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { validateEmail } from '../../server/utils/emailValidation'

// ─── Lightweight unit tests (no running server required) ──────────────────
// Full HTTP integration tests require a running dev server + DB.
// Run those manually with: npm run dev  (then npx vitest run tests/integration)
// Or add a separate test:integration script that spins up the server.

describe('Ideas: email validation (unit smoke)', () => {
  it('accepts a valid email', () => {
    expect(validateEmail('idea-author@example.com').valid).toBe(true)
  })

  it('rejects empty string', () => {
    expect(validateEmail('').valid).toBe(false)
  })
})

// ─── HTTP integration tests ───────────────────────────────────────────────
// These are skipped in the default vitest run (no server).
// To run: start the dev server, then `INTEGRATION=true npx vitest run tests/integration`

const RUN_HTTP = process.env.INTEGRATION === 'true'
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_EMAIL = 'integration-test@example.com'

describe.skipIf(!RUN_HTTP)('Ideas API (HTTP)', () => {
  let createdId: string

  it('GET /api/ideas returns a paginated list', async () => {
    const res = await fetch(`${BASE}/api/ideas`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('ideas')
    expect(Array.isArray(body.ideas)).toBe(true)
    expect(body).toHaveProperty('page', 1)
    expect(body).toHaveProperty('limit', 20)
  })

  it('POST /api/ideas creates an idea (authenticated)', async () => {
    const res = await fetch(`${BASE}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ title: 'Integration test idea', description: 'Created by automated test.' }),
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toHaveProperty('id')
    expect(body.title).toBe('Integration test idea')
    expect(body.email).toBe(TEST_EMAIL)
    createdId = body.id
  })

  it('POST /api/ideas returns 401 without email header', async () => {
    const res = await fetch(`${BASE}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Ghost idea', description: 'No auth.' }),
    })
    expect(res.status).toBe(401)
  })

  it('POST /api/ideas returns 400 for missing title', async () => {
    const res = await fetch(`${BASE}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ description: 'No title.' }),
    })
    expect(res.status).toBe(400)
  })

  it('GET /api/ideas/:id returns the idea', async () => {
    const res = await fetch(`${BASE}/api/ideas/${createdId}`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe(createdId)
    expect(body).toHaveProperty('net_votes')
  })

  it('GET /api/ideas/:id returns 404 for unknown id', async () => {
    const res = await fetch(`${BASE}/api/ideas/00000000-0000-0000-0000-000000000000`)
    expect(res.status).toBe(404)
  })

  it('PATCH /api/ideas/:id updates the idea (author)', async () => {
    const res = await fetch(`${BASE}/api/ideas/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ title: 'Updated title', description: 'Updated description.' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('Updated title')
  })

  it('PATCH /api/ideas/:id returns 403 for non-author', async () => {
    const res = await fetch(`${BASE}/api/ideas/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': 'attacker@example.com' },
      body: JSON.stringify({ title: 'Hacked', description: 'Should not work.' }),
    })
    expect(res.status).toBe(403)
  })
})
```

- [ ] `tests/integration/ideas.test.ts` created
- [ ] Unit smoke tests pass: `npm test`
- [ ] HTTP tests pass when server is running: `INTEGRATION=true npm test`

Acceptance: All unit tests pass in CI (no server needed). HTTP tests pass against a running dev server with a real DB.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 12: Integration tests — votes
**Objective:** Test vote upsert, deduplication, and net_votes calculation.

<task>
<id>P2-T12</id>
<title>tests/integration/votes.test.ts — vote endpoint tests</title>
<instructions>
Create `tests/integration/votes.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

const RUN_HTTP = process.env.INTEGRATION === 'true'
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'
const TEST_EMAIL = 'voter-test@example.com'
const OTHER_EMAIL = 'voter-other@example.com'

describe.skipIf(!RUN_HTTP)('Votes API (HTTP)', () => {
  let ideaId: string

  // Create a fresh idea before vote tests
  async function createIdea(email = TEST_EMAIL): Promise<string> {
    const res = await fetch(`${BASE}/api/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': email },
      body: JSON.stringify({ title: 'Vote test idea', description: 'Testing voting.' }),
    })
    const body = await res.json()
    return body.id
  }

  it('setup: create a test idea', async () => {
    ideaId = await createIdea()
    expect(ideaId).toBeTruthy()
  })

  it('POST /api/ideas/:id/votes casts an upvote', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: 1 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.net_votes).toBe(1)
  })

  it('duplicate upvote from same user returns net_votes unchanged (upsert, no duplicate row)', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: 1 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    // Same user voting same value — net_votes stays at 1, no duplicate
    expect(body.net_votes).toBe(1)
  })

  it('second user upvote increases net_votes to 2', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': OTHER_EMAIL },
      body: JSON.stringify({ vote_value: 1 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.net_votes).toBe(2)
  })

  it('first user changes vote to -1 — net_votes drops to 0', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: -1 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.net_votes).toBe(0)
  })

  it('first user clears vote (vote_value 0) — net_votes returns to 1', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: 0 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.net_votes).toBe(1)
  })

  it('returns 401 when no email header', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote_value: 1 }),
    })
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid vote_value', async () => {
    const res = await fetch(`${BASE}/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: 99 }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown idea', async () => {
    const res = await fetch(`${BASE}/api/ideas/00000000-0000-0000-0000-000000000000/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': TEST_EMAIL },
      body: JSON.stringify({ vote_value: 1 }),
    })
    expect(res.status).toBe(404)
  })
})
```

- [ ] `tests/integration/votes.test.ts` created
- [ ] `npm test` passes (HTTP tests are skipped without INTEGRATION=true)
- [ ] `INTEGRATION=true npm test` passes against running dev server

Acceptance: All HTTP vote tests pass. Vote deduplication confirmed by sequential voting tests.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 13: Manual smoke test
**Objective:** End-to-end walkthrough confirming the full civic loop works in a browser.

<task>
<id>P2-T13</id>
<title>Manual E2E smoke test — create, vote, verify ranking</title>
<instructions>
Run `npm run dev` and walk through the following in a browser. Check off each step.

**Setup:**
- [ ] Dev server starts without errors
- [ ] No TypeScript compile errors in the terminal

**Feed (IDEAS-01, VOTE-03):**
- [ ] `http://localhost:3000/` loads the feed page
- [ ] Empty state message shows if no ideas exist
- [ ] Feed shows ideas sorted by net_votes DESC once ideas exist
- [ ] "+ New Idea" button is in the nav

**Create idea (IDEAS-02):**
- [ ] Click "+ New Idea" — navigates to `/ideas/create`
- [ ] Without email: submitting the form shows the email capture modal
- [ ] Enter email in modal, click save — form submission proceeds
- [ ] Submit a valid title + description — redirected to the new idea's detail page
- [ ] New idea now appears in the feed at `/`

**Idea detail (IDEAS-03):**
- [ ] Click an idea title in the feed — navigates to `/ideas/<id>`
- [ ] Full title and description visible
- [ ] Vote count visible
- [ ] "Edit idea" button visible for the idea you created

**Voting (VOTE-01, VOTE-03):**
- [ ] Click the ▲ (upvote) button on an idea in the feed — vote count increases immediately
- [ ] Clicking ▲ again on the same idea — vote removed (count decreases)
- [ ] Click ▼ (downvote) — count decreases
- [ ] Create two ideas; upvote one several times; verify it appears above the other in the feed

**Edit idea (IDEAS-04):**
- [ ] On the detail page for your idea, click "Edit idea"
- [ ] Inline edit form appears with current title/description
- [ ] Change the title, click "Save changes" — title updates on the page
- [ ] Open the same idea in an incognito window — "Edit idea" button is NOT visible

**Error states:**
- [ ] Navigating to `/ideas/00000000-0000-0000-0000-000000000000` shows "Idea not found"

**Console:**
- [ ] No JavaScript errors in the browser console throughout the walkthrough

Acceptance: All checkboxes pass. No console errors. Core civic loop (create → browse → vote → rank) works end-to-end.
</instructions>
<must_have>true</must_have>
</task>

---

## Verification

### IDEAS-01: User can browse a feed of trending ideas
- [ ] Feed page at `/` displays up to 20 ideas per page sorted by net vote count (highest first)
- [ ] Pagination: "Load more" button fetches the next 20 ideas
- [ ] Ideas with zero votes appear below positively-voted ideas

### IDEAS-02: User can create a new idea
- [ ] `/ideas/create` form accepts title (max 200 chars) and description
- [ ] Title and description are both required — form blocks empty submit
- [ ] Unauthenticated user is prompted for email before submit fires
- [ ] On success, user is redirected to the new idea's detail page
- [ ] New idea appears in the feed

### IDEAS-03: User can view an idea in detail
- [ ] Clicking an idea title in the feed navigates to `/ideas/<id>`
- [ ] Full title, full description, author email, date, and vote count all displayed
- [ ] Direct URL access to `/ideas/<id>` works (SSR-compatible fetch)

### IDEAS-04: User can edit their own idea
- [ ] Author sees "Edit idea" button on the detail page
- [ ] Clicking opens the inline edit form pre-filled with current values
- [ ] Saving updates the title/description in the UI immediately
- [ ] Non-authors (different email or no email) do not see the edit button
- [ ] PATCH endpoint returns 403 for non-author requests

### VOTE-01: User can vote on ideas
- [ ] Feed and detail pages both show ▲/▼ vote buttons with a net vote count
- [ ] Unauthenticated user is prompted for email before vote is cast
- [ ] Vote count updates immediately in the UI after casting a vote
- [ ] Clicking the same direction a second time removes the vote (toggle-off)

### VOTE-03: Ideas are ranked by vote count
- [ ] Feed always queries `ORDER BY net_votes DESC, created_at DESC`
- [ ] Voting on an idea changes its relative position in the feed (visible after reload)
- [ ] Net vote count formula: `SUM(vote_value)` — counts -1 votes correctly

---

## Must-Haves

These are non-deferrable in Phase 2. Do not mark Phase 2 complete until all are checked:

- [ ] `pg` installed; `DATABASE_URL` configured in `.env` and `nuxt.config.ts`
- [ ] Migration applied: `ideas` and `votes` tables exist with correct schema
- [ ] `server/utils/db.ts` pool and query helpers working
- [ ] `GET /api/ideas` returns paginated feed sorted by net votes
- [ ] `POST /api/ideas` creates an idea (requires email header)
- [ ] `GET /api/ideas/:id` returns a single idea with net_votes
- [ ] `PATCH /api/ideas/:id` updates idea (author-only, 403 for others)
- [ ] `POST /api/ideas/:id/votes` upserts vote (ON CONFLICT DO UPDATE)
- [ ] Vote deduplication works — same email + same idea = one row
- [ ] Feed page (`/`) renders ideas sorted by votes; empty state shown when empty
- [ ] Create page (`/ideas/create`) validates and submits; email gate works
- [ ] Detail page (`/ideas/:id`) shows full idea; vote controls work
- [ ] Edit form visible to author only; saves correctly
- [ ] `tests/integration/ideas.test.ts` passes
- [ ] `tests/integration/votes.test.ts` passes
- [ ] Manual smoke test passes with zero console errors

**Deferrable (do not block Phase 2 ship):** animations, loading skeletons, optimistic UI beyond the vote count update, categories, search.
