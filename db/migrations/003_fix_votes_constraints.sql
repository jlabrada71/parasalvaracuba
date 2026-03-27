-- Fix votes table - remove all constraints and use app-level uniqueness handling
-- The mixed idea_id/comment_id design with NULL values doesn't work well with database constraints

BEGIN;

-- Drop all vote-related constraints
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_idea_id_comment_id_email_key CASCADE;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_idea_id_email_key CASCADE;

-- Create helpful indexes for fast lookups (but no uniqueness constraints)
-- These help the application check for existing votes before insert/update
CREATE INDEX IF NOT EXISTS votes_idea_id_email_idx ON votes (idea_id, email) WHERE comment_id IS NULL;
CREATE INDEX IF NOT EXISTS votes_comment_id_email_idx ON votes (comment_id, email) WHERE comment_id IS NOT NULL;

-- The application now handles uniqueness:
-- - For idea votes: check if (idea_id, email) exists before insert
-- - For comment votes: check if (idea_id, comment_id, email) exists before insert

COMMIT;
