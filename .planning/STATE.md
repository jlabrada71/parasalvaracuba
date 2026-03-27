# Project State

## Milestone: MVP (v1)

**Status:** Phase 3 (Discussion) complete ✓ — MVP v1.0 DELIVERED

**Total Requirements:** 12 (all v1)
**Phases:** 3
**Estimated Timeline:** ASAP (solo dev, Quick depth — target 3-4 weeks total)

---

## Key Decisions Made

| Decision | Rationale | Locked |
|----------|-----------|--------|
| Email-only identity (no signup) | Minimize friction; lower barrier to participate | Yes |
| localStorage session (no server-side sessions) | Solo dev, no Redis dependency in v1 | Yes |
| Phase 1 = Auth only | Every other feature depends on session attribution; build it first and build it right | Yes |
| Comment voting (VOTE-02) in Phase 3 | Vote-on-comment has zero value before comments exist; grouping with discussion is natural | Yes |
| 3 phases, not 4-5 | ASAP solo launch; phases map to real dependency tiers, not arbitrary grouping | Yes |
| IDEAS-04 (edit) in Phase 2 | Edit belongs with create/view — same domain, same data layer, low incremental cost | Yes |
| Nuxt/Vue/Node/Postgres | Production-proven, single-language stack, optimized for solo dev velocity | Yes |
| v1 scoped to core interactions only | Multi-country, moderation, search, categories all deferred to v2 | Yes |

---

## Execution Order

**Phase 1 — Identity Foundation**
Build first. Everything else calls into this layer.
- localStorage session utility (read/write/clear email)
- Email capture modal/prompt (triggered on first gated action)
- Express auth middleware (extracts email from request context)
- AUTH-01, AUTH-02, AUTH-03

**Phase 2 — Ideas & Voting**
Build second. Requires Phase 1 auth middleware to be stable.
- PostgreSQL schema: `ideas`, `votes` tables
- Express routes: GET /ideas, POST /ideas, PATCH /ideas/:id, POST /ideas/:id/votes
- Vote deduplication logic (one vote per email per idea)
- Trending/ranking calculation (net votes, recency weight acceptable for v1)
- Nuxt pages: feed (index), idea detail, create idea form
- IDEAS-01, IDEAS-02, IDEAS-03, IDEAS-04, VOTE-01, VOTE-03

**Phase 3 — Discussion**
Build third. Requires Phase 2 ideas to exist as comment targets.
- PostgreSQL schema: `comments` table (with parent_comment_id), extend `votes` for comment entity
- Express routes: GET /ideas/:id/comments, POST /ideas/:id/comments, POST /comments/:id/votes
- Threaded rendering logic (recursive or iterative tree traversal)
- Nuxt comment thread component (nested indentation, reply forms)
- COMMENT-01, COMMENT-02, COMMENT-03, VOTE-02

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Ghost town at launch (no seed content) | New users see empty feed and leave | Seed 10-20 realistic ideas manually before public launch |
| Government apathy (ideas ignored) | Civic credibility collapse after weeks | Confirm government commitment to respond before coding starts |
| Civility collapse (toxic comments) | Good-faith users disengage | Code of Conduct visible from day one; moderation queue in v2 |
| Spam via email-only auth | Feed polluted; trust eroded | Accept in v1; moderation queue is v2 first priority |
| Solo dev bottleneck on Phase 2 scope | Timeline slips | IDEAS-04 (edit) is lowest priority within Phase 2; can defer to post-launch if needed |
| Threaded comment complexity | Phase 3 drags | Cap nesting depth at 3 levels for v1; unlimited threading deferred |

---

## Deferral Notes

If timeline pressure forces cuts, these are the safest items to push post-launch (in order of deferral preference):

1. **IDEAS-04** (edit own idea) — Nice-to-have; does not block the core create/browse/vote loop
2. **VOTE-02** (vote on comments) — Comment discussion works without comment voting
3. **AUTH-03** (change/clear email) — Edge case; most users won't need this on day one

All three are still v1 requirements and should ship before considering the product "launched."

---

*Last updated: 2026-03-26 — Phase 3 executed, all 3 plans complete, 26 tasks delivered, 78 unit tests + 49 integration tests passing*
