-- Phase 3: Add comments table and extend votes for comment voting

BEGIN;

-- Comments table for threaded discussions
CREATE TABLE IF NOT EXISTS comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id           UUID NOT NULL REFERENCES ideas (id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments (id) ON DELETE CASCADE,
  email             TEXT NOT NULL,
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS comments_idea_id_idx ON comments (idea_id);
CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx ON comments (parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_email_idx ON comments (email);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments (created_at DESC);

-- Extend votes table to support both ideas and comments
ALTER TABLE votes ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES comments (id) ON DELETE CASCADE;

-- Update unique constraint to include comment_id
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_idea_id_email_key CASCADE;
ALTER TABLE votes ADD CONSTRAINT votes_idea_id_comment_id_email_key UNIQUE (idea_id, comment_id, email);

-- Create indexes for the extended votes table
CREATE INDEX IF NOT EXISTS votes_comment_id_idx ON votes (comment_id);

COMMIT;
