# Requirements: IdeaHub MVP

## v1 Requirements (MVP — Core Interactions Only)

All v1 requirements are validated hypotheses. Ship and iterate based on user feedback.

### Ideas
- [ ] **IDEAS-01**: User can browse a feed of recent/trending ideas
- [ ] **IDEAS-02**: User can create a new idea (title + description)
- [ ] **IDEAS-03**: User can view an idea in detail with all its comments
- [ ] **IDEAS-04**: User can edit their own ideas after creation

### Voting
- [ ] **VOTE-01**: User can vote (up/down) on ideas
- [ ] **VOTE-02**: User can vote (up/down) on comments
- [ ] **VOTE-03**: Ideas are ranked by vote count (trending)

### Comments & Discussion
- [ ] **COMMENT-01**: User can comment on an idea
- [ ] **COMMENT-02**: User can reply to comments (threaded discussion)
- [ ] **COMMENT-03**: Comments are threaded and nested clearly

### Identity & Session
- [ ] **AUTH-01**: First action (idea/comment/vote) requires email
- [ ] **AUTH-02**: Email is persisted to localStorage for session continuity
- [ ] **AUTH-03**: User can change/clear their email during session

**Total v1 Requirements: 12**

---

## v2 Requirements (Deferred)

These are validated by v1 learning and can be prioritized in the next milestone.

- **COUNTRY-01**: Multi-country support (country selector, data isolation)
- **MOD-01**: Basic spam/abuse detection
- **MOD-02**: Manual moderation queue for flagged content
- **SEARCH-01**: Search ideas by text
- **CATEGORY-01**: Browse/filter ideas by category/topic
- **MOBILE-01**: Mobile device optimization
- **NOTIF-01**: Email notifications when someone replies to user's idea
- **TRACK-01**: Implement tracking from idea to decision/implementation

---

## Out of Scope (Explicitly)

These are intentionally deferred and not in roadmap scope:

- **Government/stakeholder integration** — Requires partnerships beyond v1 scope
- **User profiles or reputation systems** — Could gamify/toxify platform
- **OAuth or social login** — Email-only keeps friction low for v1
- **Analytics dashboards** — Can observe user behavior directly for v1
- **Mobile app** — Web-responsive sufficient

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| IDEAS-01 | 2 | planned |
| IDEAS-02 | 2 | planned |
| IDEAS-03 | 2 | planned |
| IDEAS-04 | 2 | planned |
| VOTE-01 | 2 | planned |
| VOTE-02 | 3 | planned |
| VOTE-03 | 2 | planned |
| COMMENT-01 | 3 | planned |
| COMMENT-02 | 3 | planned |
| COMMENT-03 | 3 | planned |
| AUTH-01 | 1 | planned |
| AUTH-02 | 1 | planned |
| AUTH-03 | 1 | planned |

*(Updated 2026-03-26 — all 12 requirements mapped across 3 phases)*

---

*Last updated: 2026-03-26 — v1 MVP scope defined*
