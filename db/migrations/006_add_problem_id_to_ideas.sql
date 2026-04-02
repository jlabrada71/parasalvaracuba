-- Link ideas to the problem they address (optional)
ALTER TABLE ideas
  ADD COLUMN problem_id UUID REFERENCES problems(id) ON DELETE SET NULL;
