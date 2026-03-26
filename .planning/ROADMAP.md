# Roadmap: IdeaHub

## Overview
3 phases | 12 requirements mapped | 12 success criteria | All v1 requirements covered ✓

## Phases

| Phase | Name | Goal | Requirements | Success Criteria | Status |
|-------|------|------|--------------|------------------|--------|
| 1 | Identity Foundation | Establish email-based session layer that all interactions depend on | AUTH-01, AUTH-02, AUTH-03 | 3 | ✓ Complete |
| 2 | Ideas & Voting | Core civic loop: submit ideas, browse the feed, vote, and surface trending | IDEAS-01, IDEAS-02, IDEAS-03, IDEAS-04, VOTE-01, VOTE-03 | 5 | ✓ Complete |
| 3 | Discussion | Full deliberation: threaded comments, comment replies, comment voting | COMMENT-01, COMMENT-02, COMMENT-03, VOTE-02 | 4 |

---

## Phase Details

### Phase 1: Identity Foundation
**Goal:** Capture and persist a user's email on first action so every subsequent interaction is attributed without requiring a sign-up flow.

**Delivers:**
- AUTH-01: First action (idea/comment/vote) prompts for email entry
- AUTH-02: Email is persisted to localStorage so future actions within the session are seamless
- AUTH-03: User can update or clear their stored email at any time

**Success Criteria:**
1. A user who has never visited the site is prompted for their email before submitting any action
2. A user who previously entered their email is not prompted again on the same device/browser
3. A user can open session settings and successfully change or clear their stored email

**Why this phase first:** Every other interaction — creating ideas, voting, commenting — must be attributed to an identity. Building auth first means Phases 2 and 3 can call a stable session layer rather than building ad-hoc email collection into each feature.

**Dependencies:** localStorage session utility, email validation, Express auth middleware stub

---

### Phase 2: Ideas & Voting
**Goal:** Deliver the primary civic value loop: citizens can submit ideas, browse a ranked feed, view idea details, and vote — making the best ideas surface to the top.

**Delivers:**
- IDEAS-01: User can browse a feed of recent and trending ideas
- IDEAS-02: User can create a new idea (title + description)
- IDEAS-03: User can view an idea in detail with all its metadata
- IDEAS-04: User can edit their own ideas after creation
- VOTE-01: User can vote (up or down) on ideas
- VOTE-03: Ideas are ranked in the feed by net vote count (trending first)

**Success Criteria:**
1. User lands on the site and sees a feed of existing ideas sorted by vote count (most-voted first)
2. User can submit a new idea (title + description) and it appears in the feed after creation
3. User can click an idea to view its full detail page
4. User can edit an idea they authored; edits are reflected immediately
5. User can vote up or down on any idea; the vote count and feed ranking update on next load

**Why this phase second:** Auth exists; now the core product can be built. Ideas and voting are co-dependent — ranking (VOTE-03) has no meaning without votable ideas (VOTE-01), and the feed (IDEAS-01) is hollow without a way to submit content (IDEAS-02).

**Dependencies:** Phase 1 complete; PostgreSQL schema (ideas, votes tables); Express routes for ideas and votes; Nuxt feed and detail pages

---

### Phase 3: Discussion
**Goal:** Enable deliberation by letting users comment on ideas, reply to each other in threads, and vote on the best contributions — turning isolated ideas into conversations.

**Delivers:**
- COMMENT-01: User can post a top-level comment on an idea
- COMMENT-02: User can reply to an existing comment (threaded discussion)
- COMMENT-03: Comments are displayed in a clearly nested, threaded layout
- VOTE-02: User can vote (up or down) on individual comments

**Success Criteria:**
1. User can post a comment on any idea and see it appear on the idea's detail page
2. User can reply to an existing comment; the reply is indented beneath its parent
3. A thread with 3+ levels of nesting renders clearly without layout breakage
4. User can vote on a comment; comment vote count updates on next load

**Why this phase third:** Comments require ideas to exist (Phase 2) and a session to attribute authorship (Phase 1). Comment voting (VOTE-02) is grouped here rather than Phase 2 because it only makes sense once comments exist and adds no user value before that.

**Dependencies:** Phase 2 complete; comments table with parent_comment_id; votes table extended for comment entity type; Nuxt threaded comment component

---

## Requirement Map (Complete)

| Requirement | Phase | Description |
|-------------|-------|-------------|
| AUTH-01 | 1 | First-action email prompt |
| AUTH-02 | 1 | Email persisted to localStorage |
| AUTH-03 | 1 | Email changeable/clearable |
| IDEAS-01 | 2 | Browse trending/recent feed |
| IDEAS-02 | 2 | Create idea |
| IDEAS-03 | 2 | View idea detail |
| IDEAS-04 | 2 | Edit own idea |
| VOTE-01 | 2 | Vote on ideas |
| VOTE-03 | 2 | Ideas ranked by votes |
| COMMENT-01 | 3 | Comment on idea |
| COMMENT-02 | 3 | Reply to comment |
| COMMENT-03 | 3 | Threaded comment display |
| VOTE-02 | 3 | Vote on comments |

All 12 v1 requirements mapped. No requirement unmapped. No requirement in multiple phases.

---

*Last updated: 2026-03-26 — roadmap created*
