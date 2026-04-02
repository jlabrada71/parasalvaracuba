-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS problems_email_idx      ON problems (email);
CREATE INDEX IF NOT EXISTS problems_created_at_idx ON problems (created_at DESC);

-- Problem votes table
CREATE TABLE IF NOT EXISTS problem_votes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id   UUID NOT NULL REFERENCES problems (id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  vote_value   SMALLINT NOT NULL CHECK (vote_value IN (-1, 0, 1)),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (problem_id, email)
);

CREATE INDEX IF NOT EXISTS problem_votes_problem_id_idx ON problem_votes (problem_id);
CREATE INDEX IF NOT EXISTS problem_votes_email_idx      ON problem_votes (email);
