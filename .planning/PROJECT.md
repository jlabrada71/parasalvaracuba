# Project Brief: IdeaHub

## What This Is

A civic engagement platform that enables citizens of any country to propose, discuss, and vote on improvement ideas, giving people a voice in identifying what matters most to their community.

## Why

Citizens often have ideas for improving their countries—better policies, infrastructure, services—but lack a structured way to share these ideas, gather feedback, and see what the community thinks is most important. Existing feedback channels are fragmented, invisible, or one-way. This platform creates a visible, democratic space for civic crowdsourcing.

## Who

- **Primary users:** Citizens of any country who want to contribute improvement ideas
- **Secondary users:** Government agencies, NGOs, or civic organizations who might monitor ideas (v2+)
- **Scale:** Starting with single countries, global platform capable of serving any nation

## Core Value

**Enable collective problem-solving through transparency and consensus-building.**

The platform succeeds when:
1. Citizens feel heard (their ideas are visible, not lost)
2. Community consensus emerges (best ideas rise through voting)
3. Ideas get discussed and refined (threaded comments improve thinking)
4. The loudest voice isn't the only voice (votes level the playing field)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt.js / Vue.js |
| Backend | Node.js / Express |
| Database | PostgreSQL |
| Auth | Email-based (lightweight, localStorage session) |

## Constraints

- **Solo project:** All work by one person
- **Timeline:** Launch ASAP (minimum viable product focus)
- **Identity:** No signup flow—email collection on first action, lightweight sessions
- **Scope:** v1 focuses on idea sharing, voting, and discussion; implementation tracking deferred

## Scope: v1 Requirements (Hypotheses)

All requirements below are hypotheses to be validated by shipping and user behavior.

### Core Interactions

- [ ] **IDEAS-01**: User can browse trending/recent ideas after selecting a country
- [ ] **IDEAS-02**: User can create a new idea (title + description) with email on first post
- [ ] **IDEAS-03**: User can vote on ideas (up/down or like/dislike)
- [ ] **IDEAS-04**: User can view threaded comments on an idea
- [ ] **IDEAS-05**: User can comment on an idea with email persisted to session
- [ ] **IDEAS-06**: User can vote on comments (up/down or like/dislike)
- [ ] **IDEAS-07**: User can edit their own ideas after creation

### Multi-Country Support

- [ ] **COUNTRY-01**: User selects a country on landing; all ideas are scoped to that country
- [ ] **COUNTRY-02**: Ideas are isolated per country (no cross-country pollution)

### Identity & Session

- [ ] **AUTH-01**: First action (idea/comment/vote) requires email entry, persisted to localStorage
- [ ] **AUTH-02**: Subsequent actions in same session automatically attributed to stored email
- [ ] **AUTH-03**: Email can be updated/cleared if user chooses

### Moderation

- [ ] **MOD-01**: Basic spam/abuse detection on idea/comment submission
- [ ] **MOD-02**: Manual review queue for first posts/comments from new emails
- [ ] **MOD-03**: Manual review queue for content flagged as spam/abuse by community
- [ ] **MOD-04**: Admins can hide/delete ideas or comments

### Out of Scope (v1)

- Implementation tracking ("idea was actually built")
- User profiles / reputation systems
- OAuth or social login
- Notifications/email alerts
- Analytics dashboards
- Mobile app (responsive web only)
- Internationalization (English first)
- Search/filters by topic (basic sorting only for v1)

**Rationale for out-of-scope items:**
- Implementation tracking requires government/org partnerships not yet in place
- Reputation systems can wait until community dynamics are understood
- Email/notifications add infrastructure complexity; in-app discovery sufficient for v1
- Solo dev + ASAP timeline requires ruthless scope control

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Email-only identity (no signup) | Minimize friction, lower barrier to participate | Lightweight but requires moderation |
| Manual review on first posts | Prevent spam at scale without heavy automation | Small moderation overhead initially |
| Defer implementation tracking | Multi-country + implementation verification too complex for v1 | Core value (voice + consensus) still achievable |
| Country-first UX | Prevent idea collision across nations, simpler mental model | Requires country selector upfront |
| Nuxt/Vue/Node/Postgres | Modern, single-language stack (JavaScript), PostgreSQL proven for civic projects | Dev velocity, maintainability |

## Success Criteria (v1)

- Platform launches and is accessible
- Users can create ideas and see them appear
- Voting/ranking works; trending ideas surface
- Comments/threading work; discussions are readable
- Manual moderation queue prevents spam landing on platform
- Solo dev can operate platform with ~30 min/week moderation effort

## Non-Goals

- Profitable (civic platform)
- Enterprise-ready (single-country focus initially)
- Zero moderation (accept that moderation is necessary cost of openness)

---

*Last updated: 2026-03-26 after initialization*
