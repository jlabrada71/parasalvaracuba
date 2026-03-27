---
wave: 1
depends_on: []
files_modified:
  - db/migrations/002_add_comments_and_extend_votes.sql (create)
autonomous: true
---

# Phase 3 Plan 01: Database & Migration

## Overview

Extend the PostgreSQL schema to support threaded comments and comment voting. This includes:
1. Creating the `comments` table with parent_comment_id for threading
2. Extending the `votes` table to support both ideas and comments
3. Adding indexes for query performance
4. Running the migration atomically in a single transaction

This plan is **autonomous** and has no dependencies. It can execute in **Wave 1** in parallel with Plan 02.

---

## Tasks

### Task 1: Create Comments and Votes Extension Migration

**Objective:** Create and apply the database migration that adds comment support while maintaining backward compatibility with Phase 2's idea voting.

<task>
<id>P3-T1</id>
<title>Create and run migration: 002_add_comments_and_extend_votes.sql</title>
<instructions>
Create the file `db/migrations/002_add_comments_and_extend_votes.sql`:

```sql
-- Migration: 002_add_comments_and_extend_votes.sql
-- Objective: Add comments table and extend votes for comment voting

BEGIN;

-- Create comments table for threaded discussion
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  email VARCHAR(254) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for comment queries
CREATE INDEX idx_comments_idea_id ON comments(idea_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_email ON comments(email);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Extend votes table to support both idea and comment voting
ALTER TABLE votes
  ADD COLUMN comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Migrate UNIQUE constraint to allow both idea_id and comment_id
-- Old constraint: UNIQUE (idea_id, email)
-- New constraint: exactly one of idea_id or comment_id must be set, per user
ALTER TABLE votes DROP CONSTRAINT votes_idea_id_email_key;

ALTER TABLE votes
  ADD CONSTRAINT votes_entity_unique UNIQUE (idea_id, comment_id, email),
  ADD CONSTRAINT votes_has_exactly_one_entity
    CHECK ((idea_id IS NOT NULL AND comment_id IS NULL) OR (idea_id IS NULL AND comment_id IS NOT NULL));

-- Index for comment votes
CREATE INDEX idx_votes_comment_id ON votes(comment_id);

COMMIT;
```

**Steps:**
- [ ] Create the directory `db/migrations/` if it does not exist
- [ ] Create file `db/migrations/002_add_comments_and_extend_votes.sql` with the SQL above
- [ ] Connect to the database (ensure `DATABASE_URL` is set):
      ```bash
      psql "$DATABASE_URL" -f db/migrations/002_add_comments_and_extend_votes.sql
      ```
- [ ] Verify the migration ran without errors:
      ```bash
      psql "$DATABASE_URL" -c "\\dt comments; \\d comments; \\d votes;"
      ```
      Expected output: tables exist, columns include id, idea_id, parent_comment_id, email, body, created_at, updated_at for comments; votes has comment_id column
- [ ] Verify indexes exist:
      ```bash
      psql "$DATABASE_URL" -c "SELECT indexname FROM pg_indexes WHERE tablename = 'comments' OR tablename = 'votes' ORDER BY indexname;"
      ```
      Expected: idx_comments_idea_id, idx_comments_parent_comment_id, idx_comments_email, idx_comments_created_at, idx_votes_comment_id

**Acceptance Criteria:**
- [ ] `psql` connection succeeds; no errors during migration execution
- [ ] `comments` table exists with all columns (id, idea_id, parent_comment_id, email, body, created_at, updated_at)
- [ ] `votes` table has new `comment_id` column (nullable, FK to comments)
- [ ] All four indexes on comments table exist
- [ ] `idx_votes_comment_id` exists on votes table
- [ ] Constraint `votes_has_exactly_one_entity` ensures only idea_id OR comment_id is non-NULL
- [ ] Constraint `votes_entity_unique` prevents duplicate votes on the same entity by the same email
- [ ] Inserting a comment into comments table succeeds
- [ ] Inserting a vote on a comment (with comment_id set, idea_id NULL) succeeds
- [ ] Inserting a vote with both comment_id and idea_id non-NULL fails (CHECK constraint violated)

</instructions>
<must_have>true</must_have>
</task>

---

### Task 2: Verify Migration Safety and Backward Compatibility

**Objective:** Confirm the migration does not break Phase 2 functionality (idea voting, idea creation).

<task>
<id>P3-T2</id>
<title>Verify Phase 2 backward compatibility after migration</title>
<instructions>
After the migration is applied:

- [ ] Query existing ideas:
      ```bash
      psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM ideas;"
      ```
      Expected: returns row count (0 if fresh database, > 0 if Phase 2 data exists)

- [ ] Query existing votes on ideas:
      ```bash
      psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM votes WHERE idea_id IS NOT NULL AND comment_id IS NULL;"
      ```
      Expected: returns vote count on ideas; all have comment_id = NULL

- [ ] Insert a test idea (simulate Phase 2 create idea):
      ```sql
      INSERT INTO ideas (title, description, email)
      VALUES ('Test Idea', 'Test Description', 'test@example.com')
      RETURNING id;
      ```

- [ ] Insert a vote on the test idea (simulate Phase 2 vote):
      ```sql
      -- Replace $IDEA_ID with the returned idea id
      INSERT INTO votes (idea_id, email, vote_value)
      VALUES ('$IDEA_ID', 'test@example.com', 1)
      ON CONFLICT (idea_id, comment_id, email) DO UPDATE
        SET vote_value = EXCLUDED.vote_value
      RETURNING *;
      ```
      Expected: succeeds, vote_value = 1, comment_id = NULL

- [ ] Verify the vote upsert works (update vote to -1):
      ```sql
      INSERT INTO votes (idea_id, email, vote_value)
      VALUES ('$IDEA_ID', 'test@example.com', -1)
      ON CONFLICT (idea_id, comment_id, email) DO UPDATE
        SET vote_value = EXCLUDED.vote_value
      RETURNING vote_value;
      ```
      Expected: vote_value = -1 (updated, not duplicated)

**Acceptance Criteria:**
- [ ] Phase 2 idea queries return correct row count
- [ ] Phase 2 votes on ideas have comment_id = NULL
- [ ] New test idea inserts successfully
- [ ] Vote on idea inserts successfully with comment_id = NULL
- [ ] Vote upsert works: second insert with different vote_value updates the existing vote
- [ ] No constraint violations when voting on ideas

</instructions>
<must_have>true</must_have>
</task>

---

## Verification

### Database Schema Checklist
- [ ] `comments` table exists
- [ ] `comments.id` is UUID primary key
- [ ] `comments.idea_id` is NOT NULL, FK to ideas(id) with ON DELETE CASCADE
- [ ] `comments.parent_comment_id` is nullable, FK to comments(id) with ON DELETE CASCADE
- [ ] `comments.email` is varchar(254), NOT NULL
- [ ] `comments.body` is TEXT, NOT NULL
- [ ] `comments.created_at` and `comments.updated_at` are TIMESTAMPTZ with defaults
- [ ] All four comments indexes exist
- [ ] `votes.comment_id` column exists, nullable, FK to comments(id) with ON DELETE CASCADE
- [ ] `votes_has_exactly_one_entity` CHECK constraint enforces one of idea_id/comment_id
- [ ] `votes_entity_unique` UNIQUE constraint prevents duplicate votes
- [ ] `idx_votes_comment_id` index exists on votes(comment_id)

### Backward Compatibility Checklist
- [ ] Existing ideas are not affected
- [ ] Existing votes on ideas remain valid (comment_id = NULL)
- [ ] Inserting new ideas still works
- [ ] Voting on ideas via upsert still works (respects new UNIQUE constraint structure)
- [ ] No migration errors or constraint violations

---

## Must-Haves

These items must be verified before moving to Plan 02.

- [ ] `db/migrations/002_add_comments_and_extend_votes.sql` exists and is correct
- [ ] Migration executed successfully (no psql errors)
- [ ] `comments` table exists with correct schema
- [ ] `votes.comment_id` column exists
- [ ] All indexes created
- [ ] Constraints enforced (CHECK and UNIQUE)
- [ ] Phase 2 backward compatibility verified (ideas and votes still work)
- [ ] Test insert/upsert operations succeed for both ideas and comments

Anything not in this list is deferred to Phase 4 or later.
