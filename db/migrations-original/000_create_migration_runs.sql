CREATE TABLE IF NOT EXISTS migration_runs (
  id         SERIAL PRIMARY KEY,
  filename   TEXT NOT NULL UNIQUE,
  ran_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO "migration_runs" ("id", "filename", "ran_at") VALUES
(1,	'000_create_migration_runs.sql',	'2026-04-02 15:17:37.479513+00'),
(2,	'001_create_ideas_and_votes.sql',	'2026-04-02 15:17:37.489139+00'),
(3,	'002_add_comments_and_extend_votes.sql',	'2026-04-02 15:18:26.325982+00'),
(4,	'003_fix_votes_constraints.sql',	'2026-04-02 15:18:26.341943+00'),
(5,	'004_create_problems.sql',	'2026-04-02 15:18:26.350249+00'),
(6,	'005_create_problem_comments.sql',	'2026-04-02 15:19:00.05101+00'),
(7,	'006_add_problem_id_to_ideas.sql',	'2026-04-02 15:19:00.074599+00');
