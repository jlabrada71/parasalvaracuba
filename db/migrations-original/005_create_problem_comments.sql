-- Problem comments table
CREATE TABLE IF NOT EXISTS problem_comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id        UUID NOT NULL REFERENCES problems (id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES problem_comments (id) ON DELETE CASCADE,
  email             TEXT NOT NULL,
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS problem_comments_problem_id_idx        ON problem_comments (problem_id);
CREATE INDEX IF NOT EXISTS problem_comments_parent_comment_id_idx ON problem_comments (parent_comment_id);
CREATE INDEX IF NOT EXISTS problem_comments_email_idx             ON problem_comments (email);
CREATE INDEX IF NOT EXISTS problem_comments_created_at_idx        ON problem_comments (created_at ASC);

-- Problem comment votes table
CREATE TABLE IF NOT EXISTS problem_comment_votes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES problem_comments (id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  vote_value SMALLINT NOT NULL CHECK (vote_value IN (-1, 0, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (comment_id, email)
);

CREATE INDEX IF NOT EXISTS problem_comment_votes_comment_id_idx ON problem_comment_votes (comment_id);
CREATE INDEX IF NOT EXISTS problem_comment_votes_email_idx      ON problem_comment_votes (email);
