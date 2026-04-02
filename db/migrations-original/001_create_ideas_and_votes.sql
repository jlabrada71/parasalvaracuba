-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ideas_email_idx      ON ideas (email);
CREATE INDEX IF NOT EXISTS ideas_created_at_idx ON ideas (created_at DESC);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id     UUID NOT NULL REFERENCES ideas (id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  vote_value  SMALLINT NOT NULL CHECK (vote_value IN (-1, 0, 1)),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (idea_id, email)
);

CREATE INDEX IF NOT EXISTS votes_idea_id_idx ON votes (idea_id);
CREATE INDEX IF NOT EXISTS votes_email_idx   ON votes (email);
