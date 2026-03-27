-- Fix votes table constraints to support both idea and comment voting
-- Drop problematic constraints and rely on application-level uniqueness handling

BEGIN;

-- Drop the problematic constraint that tried to enforce uniqueness across both idea and comment votes
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_idea_id_comment_id_email_key CASCADE;

-- Drop the original idea vote constraint if it exists (we'll handle uniqueness in the app)
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_idea_id_email_key CASCADE;

-- Create helpful indexes for lookups and deduplication checking
CREATE INDEX IF NOT EXISTS votes_idea_id_email_idx ON votes (idea_id, email) WHERE comment_id IS NULL;
CREATE INDEX IF NOT EXISTS votes_comment_id_email_idx ON votes (comment_id, email) WHERE comment_id IS NOT NULL;

COMMIT;
