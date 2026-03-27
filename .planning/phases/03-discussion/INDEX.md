# Phase 3: Discussion — Planning Index

**Date:** 2026-03-26  
**Phase Goal:** Enable deliberation by letting users comment on ideas, reply to each other in threads, and vote on the best contributions.

---

## Files in This Directory

| File | Purpose | Size | Status |
|------|---------|------|--------|
| `03-RESEARCH.md` | Research findings: database schema, API patterns, component architecture | 37 KB | ✓ Complete |
| `03-PLAN-01-database.md` | Database migration and schema extension | 8.2 KB | ✓ Complete |
| `03-PLAN-02-api-routes.md` | Comment CRUD and voting API routes | 17 KB | ✓ Complete |
| `03-PLAN-03-frontend-tests.md` | Frontend components and integration tests | 39 KB | ✓ Complete |

---

## Planning Summary

### Requirements Covered

- **COMMENT-01:** User can post a top-level comment on an idea
- **COMMENT-02:** User can reply to an existing comment (threaded discussion)
- **COMMENT-03:** Comments are displayed in a clearly nested, threaded layout
- **VOTE-02:** User can vote (up/down) on individual comments

### Execution Plan

**Wave 1 (Parallel):**
- Plan 01: Database & Migration (autonomous)
- Plan 02: API Routes (autonomous)

**Wave 2 (Sequential):**
- Plan 03: Frontend Components & Tests (depends on Plan 02 API)

### Statistics

| Metric | Count |
|--------|-------|
| Total Plans | 3 |
| Total Tasks | 12 |
| Total Plan Lines | 2,144 |
| Database Tables Modified | 2 (comments table created, votes extended) |
| API Routes Created | 4 |
| Vue Components Created | 2 |
| Vue Components Modified | 2 |
| Test Files Created | 2 |
| Total Test Assertions | 22+ |

---

## Key Design Decisions

### Database
- **Single migration file:** 002_add_comments_and_extend_votes.sql (atomic transaction)
- **parent_comment_id:** Nullable FK for threading; NULL = top-level comment
- **Vote deduplication:** UNIQUE(idea_id, comment_id, email) + CHECK (one entity per vote)
- **Indexes:** 5 new indexes for comment queries (idea_id, parent_comment_id, email, created_at, votes on comment_id)

### API
- **Endpoint pattern:** /api/ideas/:id/comments/* for comment CRUD; /api/comments/:id/votes for voting
- **Flat list return:** GET comments returns flat array; client builds tree
- **Depth limit:** 10 levels max (enforced by recursive query in API)
- **Upsert voting:** Same pattern as Phase 2 (ON CONFLICT DO UPDATE)

### Frontend
- **Self-recursive components:** CommentItem renders itself for replies (Vue recursion)
- **Client-side tree building:** O(n) traversal of flat comment array
- **Email gating:** All interactive actions (post, reply, vote) require identity
- **Relative dates:** "just now", "5m ago", "2h ago", "3d ago", etc.

---

## Success Criteria

✓ User can post a comment on any idea and see it appear on the idea's detail page  
✓ User can reply to an existing comment; the reply is indented beneath its parent  
✓ A thread with 3+ levels of nesting renders clearly without layout breakage  
✓ User can vote on a comment; comment vote count updates on next load  

---

## Next Steps

1. **Execute Plan 01:** Run database migration
2. **Execute Plan 02:** Implement API routes (can be parallel with Plan 01)
3. **Execute Plan 03:** Build frontend after Plan 02 API is callable

All plans include acceptance criteria, must-haves, and verification checklists.

---

## Technology Stack (Locked)

- Frontend: Nuxt 3, Vue 3, Pinia (state management)
- Backend: Nitro (H3), Node.js
- Database: PostgreSQL with UUID primary keys
- Testing: Vitest for unit/integration tests
- API Client: `apiRequest()` helper injecting X-User-Email header
- Email Gating: `useEmailGate()` composable for modal flow

---

## Phase Boundaries

**In Scope (Phase 3 v1):**
- Threaded comments (unlimited nesting, but UI plateaus at 10 levels)
- Comment voting (upvote/downvote)
- Basic comment display (no editing, deletion, or moderation)

**Out of Scope (Phase 4+):**
- Comment editing or deletion
- Moderation (spam flagging, admin controls)
- Comment search or filtering
- Email notifications for replies
- Multi-language support
- Pagination (currently unlimited)

