-- Fix votes table constraints to support both idea and comment voting

BEGIN;

-- Drop the problematic constraint that tried to enforce uniqueness across both idea and comment votes
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_idea_id_comment_id_email_key CASCADE;

-- For idea votes: unique on (idea_id, email) when comment_id is NULL
-- This uses a simple table constraint since these rows have comment_id = NULL
ALTER TABLE votes ADD CONSTRAINT votes_idea_id_email_key UNIQUE (idea_id, email);

-- For comment votes: add an index that allows upserts to work
-- We'll use a different approach - the upsert will work via the primary key conflict detection
-- Create an index to help identify comment vote duplicates
CREATE INDEX IF NOT EXISTS votes_comment_id_email_idx ON votes (comment_id, email) WHERE comment_id IS NOT NULL;

COMMIT;
