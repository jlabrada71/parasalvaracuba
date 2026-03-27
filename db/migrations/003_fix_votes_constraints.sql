-- Fix votes table constraints to support both idea and comment voting

BEGIN;

-- Drop the problematic constraint that tried to enforce uniqueness across both idea and comment votes
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_idea_id_comment_id_email_key CASCADE;

-- Clean up duplicate idea votes: keep only the most recent vote for each (idea_id, email)
-- Delete older duplicates for idea votes (where comment_id IS NULL)
DELETE FROM votes v1
WHERE comment_id IS NULL
AND id NOT IN (
  SELECT DISTINCT ON (idea_id, email) id
  FROM votes
  WHERE comment_id IS NULL
  ORDER BY idea_id, email, created_at DESC
);

-- For idea votes: unique on (idea_id, email) when comment_id is NULL
ALTER TABLE votes ADD CONSTRAINT votes_idea_id_email_key UNIQUE (idea_id, email);

-- For comment votes: add an index that allows upserts to work
-- Create an index to help identify comment vote duplicates
CREATE INDEX IF NOT EXISTS votes_comment_id_email_idx ON votes (comment_id, email) WHERE comment_id IS NOT NULL;

COMMIT;
