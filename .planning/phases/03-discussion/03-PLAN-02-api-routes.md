---
wave: 1
depends_on: []
files_modified:
  - server/api/ideas/[id]/comments/index.get.ts (create)
  - server/api/ideas/[id]/comments/index.post.ts (create)
  - server/api/ideas/[id]/comments/[commentId]/reply.post.ts (create)
  - server/api/comments/[commentId]/votes.post.ts (create)
autonomous: true
---

# Phase 3 Plan 02: API Routes

## Overview

Implement the comment and comment-voting API routes following Nitro/H3 conventions established in Phase 2. These routes support:
- Posting top-level comments on ideas (COMMENT-01)
- Replying to existing comments in threads (COMMENT-02)
- Fetching all comments for an idea (for display on detail page)
- Voting on comments with upsert deduplication (VOTE-02)

This plan is **autonomous** and can execute in **Wave 1** in parallel with Plan 01. It depends on the database schema being ready (from Plan 01).

---

## Tasks

### Task 1: GET /api/ideas/:id/comments — Fetch All Comments for an Idea

**Objective:** Return a flat list of all comments (top-level and replies) for an idea so the frontend can build the tree client-side.

<task>
<id>P3-T2-01</id>
<title>Create GET /api/ideas/:id/comments route</title>
<instructions>
Create the file `server/api/ideas/[id]/comments/index.get.ts`:

```ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { query } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const ideaId = getRouterParam(event, 'id')

    if (!ideaId) {
      throw createError({ statusCode: 400, message: 'Idea ID is required' })
    }

    // Fetch all comments for the idea (flat list)
    // Include upvote/downvote counts for each comment
    const comments = await query(`
      SELECT
        c.id,
        c.idea_id,
        c.parent_comment_id,
        c.email,
        c.body,
        c.created_at,
        c.updated_at,
        COALESCE(SUM(CASE WHEN v.vote_value = 1 THEN 1 ELSE 0 END), 0)::int as upvotes,
        COALESCE(SUM(CASE WHEN v.vote_value = -1 THEN 1 ELSE 0 END), 0)::int as downvotes,
        COALESCE(SUM(v.vote_value), 0)::int as net_votes
      FROM comments c
      LEFT JOIN votes v ON c.id = v.comment_id AND v.vote_value != 0
      WHERE c.idea_id = $1
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `, [ideaId])

    return comments
  } catch (err) {
    console.error('GET /api/ideas/:id/comments error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
```

**Steps:**
- [ ] Create directory structure: `server/api/ideas/[id]/comments/`
- [ ] Create file with code above
- [ ] Test with curl (requires database with test idea and comments):
      ```bash
      curl http://localhost:3000/api/ideas/{idea_id}/comments \
        -H "X-User-Email: test@example.com"
      ```
      Expected: JSON array of comment objects, empty if no comments yet

**Acceptance Criteria:**
- [ ] Route returns 200 with empty array [] if idea exists but has no comments
- [ ] Route returns 400 if idea_id is missing
- [ ] Route returns comments sorted by created_at ASC
- [ ] Each comment object has: id, idea_id, parent_comment_id, email, body, created_at, updated_at, upvotes, downvotes, net_votes
- [ ] Comment vote counts are accurate (sum of votes with vote_value = 1/-1)
- [ ] parent_comment_id is null for top-level comments, set for replies

</instructions>
<must_have>true</must_have>
</task>

---

### Task 2: POST /api/ideas/:id/comments — Create Top-Level Comment

**Objective:** Allow a user to post a new top-level comment on an idea.

<task>
<id>P3-T2-02</id>
<title>Create POST /api/ideas/:id/comments route</title>
<instructions>
Create the file `server/api/ideas/[id]/comments/index.post.ts`:

```ts
import { defineEventHandler, readBody, createError, getRouterParam, setResponseStatus } from 'h3'
import { query } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const ideaId = getRouterParam(event, 'id')
    const userEmail = event.context.userEmail

    if (!ideaId) {
      throw createError({ statusCode: 400, message: 'Idea ID is required' })
    }
    if (!userEmail) {
      throw createError({ statusCode: 401, message: 'Email required' })
    }

    const body = await readBody(event)
    const commentBody = (body?.body ?? '').trim()

    if (!commentBody) {
      throw createError({ statusCode: 400, message: 'Comment body is required' })
    }
    if (commentBody.length > 2000) {
      throw createError({ statusCode: 400, message: 'Comment must be 2000 characters or fewer' })
    }

    // Verify idea exists
    const [ideaExists] = await query('SELECT id FROM ideas WHERE id = $1', [ideaId])
    if (!ideaExists) {
      throw createError({ statusCode: 404, message: 'Idea not found' })
    }

    // Create top-level comment (parent_comment_id = NULL)
    const [comment] = await query(`
      INSERT INTO comments (idea_id, email, body)
      VALUES ($1, $2, $3)
      RETURNING id, idea_id, parent_comment_id, email, body, created_at, updated_at
    `, [ideaId, userEmail, commentBody])

    setResponseStatus(event, 201)
    return comment
  } catch (err) {
    console.error('POST /api/ideas/:id/comments error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
```

**Steps:**
- [ ] Create file with code above
- [ ] Test with curl:
      ```bash
      curl -X POST http://localhost:3000/api/ideas/{idea_id}/comments \
        -H "X-User-Email: test@example.com" \
        -H "Content-Type: application/json" \
        -d '{"body":"Great idea!"}'
      ```
      Expected: 201 response with comment object

**Acceptance Criteria:**
- [ ] Returns 401 if X-User-Email header is missing
- [ ] Returns 400 if body is empty or missing
- [ ] Returns 400 if body exceeds 2000 characters
- [ ] Returns 404 if idea_id does not exist
- [ ] Returns 201 with created comment object
- [ ] Comment has parent_comment_id = null (top-level)
- [ ] Comment email matches user's email from header
- [ ] Comment created_at is recent (within seconds of request)
- [ ] Subsequent GET /api/ideas/:id/comments includes the new comment

</instructions>
<must_have>true</must_have>
</task>

---

### Task 3: POST /api/ideas/:id/comments/:commentId/reply — Reply to a Comment

**Objective:** Allow a user to reply to an existing comment, creating a nested child comment.

<task>
<id>P3-T2-03</id>
<title>Create POST /api/ideas/:id/comments/:commentId/reply route</title>
<instructions>
Create the file `server/api/ideas/[id]/comments/[commentId]/reply.post.ts`:

```ts
import { defineEventHandler, readBody, createError, getRouterParam, setResponseStatus } from 'h3'
import { query } from '../../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const ideaId = getRouterParam(event, 'id')
    const parentCommentId = getRouterParam(event, 'commentId')
    const userEmail = event.context.userEmail

    if (!ideaId) {
      throw createError({ statusCode: 400, message: 'Idea ID is required' })
    }
    if (!parentCommentId) {
      throw createError({ statusCode: 400, message: 'Parent comment ID is required' })
    }
    if (!userEmail) {
      throw createError({ statusCode: 401, message: 'Email required' })
    }

    const body = await readBody(event)
    const replyBody = (body?.body ?? '').trim()

    if (!replyBody) {
      throw createError({ statusCode: 400, message: 'Reply body is required' })
    }
    if (replyBody.length > 2000) {
      throw createError({ statusCode: 400, message: 'Reply must be 2000 characters or fewer' })
    }

    // Verify parent comment exists and belongs to the idea
    const [parentExists] = await query(
      'SELECT id FROM comments WHERE id = $1 AND idea_id = $2',
      [parentCommentId, ideaId]
    )
    if (!parentExists) {
      throw createError({ statusCode: 404, message: 'Parent comment not found' })
    }

    // Check nesting depth to prevent infinite threads (max 10 levels)
    const [depthResult] = await query(`
      WITH RECURSIVE depth_cte AS (
        SELECT parent_comment_id, 1 as depth FROM comments WHERE id = $1
        UNION ALL
        SELECT c.parent_comment_id, depth + 1
        FROM depth_cte
        JOIN comments c ON c.id = depth_cte.parent_comment_id
        WHERE depth < 10
      )
      SELECT MAX(depth) as max_depth FROM depth_cte
    `, [parentCommentId])

    const currentDepth = depthResult?.max_depth ?? 0
    if (currentDepth >= 10) {
      throw createError({
        statusCode: 400,
        message: 'Reply nesting depth exceeds maximum (10 levels)'
      })
    }

    // Create reply comment with parent_comment_id set
    const [reply] = await query(`
      INSERT INTO comments (idea_id, parent_comment_id, email, body)
      VALUES ($1, $2, $3, $4)
      RETURNING id, idea_id, parent_comment_id, email, body, created_at, updated_at
    `, [ideaId, parentCommentId, userEmail, replyBody])

    setResponseStatus(event, 201)
    return reply
  } catch (err) {
    console.error('POST /api/ideas/:id/comments/:commentId/reply error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
```

**Steps:**
- [ ] Create directory structure: `server/api/ideas/[id]/comments/[commentId]/`
- [ ] Create file with code above
- [ ] Test with curl (requires existing parent comment):
      ```bash
      curl -X POST http://localhost:3000/api/ideas/{idea_id}/comments/{parent_comment_id}/reply \
        -H "X-User-Email: test@example.com" \
        -H "Content-Type: application/json" \
        -d '{"body":"Great point!"}'
      ```
      Expected: 201 response with reply comment object

**Acceptance Criteria:**
- [ ] Returns 401 if X-User-Email header is missing
- [ ] Returns 400 if body is empty or missing
- [ ] Returns 400 if body exceeds 2000 characters
- [ ] Returns 404 if parent_comment_id does not exist or belongs to different idea
- [ ] Returns 400 if nesting depth would exceed 10 levels
- [ ] Returns 201 with created reply comment object
- [ ] Reply has parent_comment_id = parent comment's id
- [ ] Reply email matches user's email from header
- [ ] Reply created_at is recent
- [ ] Subsequent GET /api/ideas/:id/comments includes the new reply with parent_comment_id set

</instructions>
<must_have>true</must_have>
</task>

---

### Task 4: POST /api/comments/:commentId/votes — Vote on a Comment

**Objective:** Allow a user to vote (upvote +1, neutral 0, downvote -1) on a comment, with upsert deduplication matching Phase 2 idea voting.

<task>
<id>P3-T2-04</id>
<title>Create POST /api/comments/:commentId/votes route</title>
<instructions>
Create the file `server/api/comments/[commentId]/votes.post.ts`:

```ts
import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { query } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const commentId = getRouterParam(event, 'commentId')
    const userEmail = event.context.userEmail

    if (!commentId) {
      throw createError({ statusCode: 400, message: 'Comment ID is required' })
    }
    if (!userEmail) {
      throw createError({ statusCode: 401, message: 'Email required' })
    }

    const body = await readBody(event)
    const voteValue = body?.vote_value ?? 0

    if (![1, 0, -1].includes(voteValue)) {
      throw createError({ statusCode: 400, message: 'vote_value must be -1, 0, or 1' })
    }

    // Verify comment exists
    const [commentExists] = await query('SELECT id FROM comments WHERE id = $1', [commentId])
    if (!commentExists) {
      throw createError({ statusCode: 404, message: 'Comment not found' })
    }

    // Upsert vote: insert or update if exists (matching Phase 2 pattern)
    // NEW unique constraint: (idea_id, comment_id, email) with CHECK ensuring only one is set
    const [result] = await query(`
      INSERT INTO votes (comment_id, email, vote_value)
      VALUES ($1, $2, $3)
      ON CONFLICT (idea_id, comment_id, email) DO UPDATE
        SET vote_value = EXCLUDED.vote_value, updated_at = NOW()
      RETURNING (SELECT COALESCE(SUM(vote_value), 0)::int FROM votes WHERE comment_id = $1) AS net_votes
    `, [commentId, userEmail, voteValue])

    if (!result) {
      throw createError({ statusCode: 500, message: 'Failed to cast vote' })
    }

    return result
  } catch (err) {
    console.error('POST /api/comments/:commentId/votes error:', err)
    if (err instanceof Error && 'statusCode' in err) {
      throw err
    }
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
```

**Steps:**
- [ ] Create directory structure: `server/api/comments/[commentId]/`
- [ ] Create file with code above
- [ ] Test upvote with curl (requires existing comment):
      ```bash
      curl -X POST http://localhost:3000/api/comments/{comment_id}/votes \
        -H "X-User-Email: test@example.com" \
        -H "Content-Type: application/json" \
        -d '{"vote_value":1}'
      ```
      Expected: 200 response with net_votes count

- [ ] Test upsert (change vote to downvote):
      ```bash
      curl -X POST http://localhost:3000/api/comments/{comment_id}/votes \
        -H "X-User-Email: test@example.com" \
        -H "Content-Type: application/json" \
        -d '{"vote_value":-1}'
      ```
      Expected: net_votes updated to -1 (not duplicated)

**Acceptance Criteria:**
- [ ] Returns 401 if X-User-Email header is missing
- [ ] Returns 400 if vote_value is not in [-1, 0, 1]
- [ ] Returns 404 if comment_id does not exist
- [ ] Returns 200 with net_votes after successful upvote
- [ ] Upsert works: second vote with different value updates existing vote (no duplicate)
- [ ] Vote with value 0 clears the user's vote (net_votes decreased by previous vote value)
- [ ] net_votes correctly reflects SUM of all vote_value for the comment (excluding 0-valued votes)
- [ ] Multiple users can vote on the same comment independently

</instructions>
<must_have>true</must_have>
</task>

---

## Verification

### API Route Checklist
- [ ] GET /api/ideas/:id/comments route exists and returns flat array of comments
- [ ] Comments include upvotes, downvotes, net_votes
- [ ] Comments include parent_comment_id (null for top-level, set for replies)
- [ ] POST /api/ideas/:id/comments creates top-level comments
- [ ] POST /api/ideas/:id/comments/:commentId/reply creates replies with parent_comment_id set
- [ ] Depth check prevents nesting beyond 10 levels
- [ ] POST /api/comments/:commentId/votes handles upsert voting
- [ ] All routes require X-User-Email header (401 if missing)
- [ ] All routes validate input (400 for invalid data)
- [ ] All routes handle errors gracefully (500 for database errors)
- [ ] All routes set correct HTTP status codes (201 for create, 200 for updates, 4xx for errors)

### Integration Checklist
- [ ] Creating a comment includes email header injection from frontend (apiRequest helper)
- [ ] Voting on a comment works via upsert (no duplicates)
- [ ] GET comments returns accurate vote counts (tested with multiple votes)
- [ ] DELETE cascade works: deleting a parent comment cascades to replies
- [ ] DELETE cascade works: deleting a comment removes its votes

---

## Must-Haves

These items must be verified before moving to Plan 03.

- [ ] `server/api/ideas/[id]/comments/index.get.ts` exists and returns comments flat list
- [ ] `server/api/ideas/[id]/comments/index.post.ts` exists and creates top-level comments
- [ ] `server/api/ideas/[id]/comments/[commentId]/reply.post.ts` exists and creates replies
- [ ] `server/api/comments/[commentId]/votes.post.ts` exists and votes on comments
- [ ] All four routes tested with curl and return correct responses
- [ ] Email validation enforced (401 if missing)
- [ ] Input validation enforced (400 for invalid data)
- [ ] Upsert voting prevents duplicates
- [ ] Depth check limits nesting to 10 levels
- [ ] Vote counts accurate in GET comments response

Anything not in this list is deferred to Phase 4 or later.
