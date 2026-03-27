-- Fix votes table constraints to support both idea and comment voting

BEGIN;

-- Drop the overly broad constraint
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_idea_id_comment_id_email_key CASCADE;

-- Add partial unique constraint for idea votes (comment_id IS NULL)
ALTER TABLE votes ADD CONSTRAINT votes_idea_id_email_key_idea UNIQUE (idea_id, email) WHERE comment_id IS NULL;

-- Add partial unique constraint for comment votes (comment_id IS NOT NULL)
ALTER TABLE votes ADD CONSTRAINT votes_idea_id_comment_id_email_key_comment UNIQUE (idea_id, comment_id, email) WHERE comment_id IS NOT NULL;

COMMIT;
