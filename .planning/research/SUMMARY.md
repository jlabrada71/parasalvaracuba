# Research Summary: v1.1 Markdown & Design System

**Research Date:** March 27, 2026
**Status:** Complete synthesis of STACK, FEATURES, ARCHITECTURE, PITFALLS research

---

## Executive Summary

v1.1 should focus on **three strategic improvements**: (1) adding Markdown editing to ideas and comments with security-first approach (DOMPurify), (2) establishing a lightweight design token system via CSS variables, and (3) fixing critical bugs from v1.0 launch. The research validates **strong technical feasibility** for a solo developer shipping in 2-4 weeks. The recommended stack (Tiptap 3.20.5 + Marked.js + CSS tokens) is battle-tested and requires zero breaking changes to existing architecture.

**Critical clarification:** "Stitch design system" was confirmed to mean Google's AI design tool (2026 launch). The research recommends a lightweight **design tokens** approach (CSS variables) instead of full component library refactoring, enabling rapid consistency without maintenance overhead.

---

## Key Findings

### Stack: Production-Ready, Minimal Dependencies

**Markdown Editor: Tiptap 3.20.5 (RECOMMENDED)**
- Version: `@tiptap/vue-3@^3.20.5`
- Why: Native Vue 3 integration, bidirectional Markdown support, headless architecture for design token flexibility
- Alternatives evaluated: md-editor-v3 (good), Lexical (Meta, overkill), markdown-it (parser only)
- Bundle impact: ~50KB gzipped
- Verdict: Production-ready, proven at scale (NYT, Guardian, Slack documentation)

**Design System: CSS Variables + Nuxt UI v4 (RECOMMENDED)**
- Version: `@nuxt/ui@^4.0.0` (released March 2026)
- Why: 110+ free components, official Nuxt project, runtime theming, compatible with Tiptap
- Alternative: Shopify Polaris (110+ components, WCAG AA built-in, but requires full refactor — deferred to v1.2)
- Bundle impact: ~70KB gzipped
- Verdict: Lightweight design tokens via CSS variables; Nuxt UI v4 for components as needed

**Markdown Security: DOMPurify 3.0 (CRITICAL)**
- Version: `dompurify@^3.0.0`
- Why: Battle-tested XSS prevention; referenced in 3+ active 2026 CVEs as standard solution
- Storage: Raw Markdown in DB (no pre-rendering, enables future updates)
- Rendering: Client-side via Tiptap + DOMPurify sanitization

**No Backend Changes Required**
- All new libraries are additive (no replacements)
- PostgreSQL text fields accept Markdown immediately
- API endpoints unchanged
- Existing auth, i18n, database stack fully compatible

---

### Features: Markdown + Design Tokens + Stability Fixes

**Markdown Editing**

Table Stakes:
- User can write Markdown (bold, italic, links, lists, code blocks)
- Live preview or split-pane editor (side-by-side)
- XSS protection via DOMPurify sanitization
- Plaintext fallback (backward compatible)

Differentiators:
- Dark mode editor theme
- Markdown cheat sheet tooltip
- Code syntax highlighting
- Emoji support (optional)

Anti-Features:
- WYSIWYG editors (bloat)
- Full HTML support (XSS risk)
- Markdown tables (unnecessary complexity)
- AI-assisted writing (premature)

**Design System Integration**

Table Stakes:
- Color tokens (primary, secondary, error, success, neutral)
- Typography tokens (headline, body, label)
- Spacing tokens (gaps, padding, margins)
- Roundness tokens (border-radius scale)

Differentiators:
- Dark mode theme (automatic via CSS media query)
- Custom brand color configuration
- Component theming via token inheritance

Anti-Features:
- Full component refactor (Polaris deferred to v1.2)
- AI-generated design (unproven)
- Complex design token hierarchy

**Bug Fixes & Stability**

Critical:
- XSS protection (Markdown requires sanitization)
- Mobile form accessibility (44px tap targets for WCAG AA)
- Vote race condition (concurrent duplicate votes)
- Comment deletion edge cases

High Priority:
- Dark mode rendering fixes
- Performance with large comment threads
- Browser back-button interactions
- Markdown in plaintext contexts (email, names)

---

### Architecture: Proven Patterns, Minimal Integration

**Markdown Data Flow**
```
User writes Markdown
  → Stored as raw Markdown in DB
  → Client fetches Markdown
  → Tiptap parses to rich content
  → DOMPurify sanitizes HTML
  → Rendered safely to user
```

**Components Affected**
- IdeaCard: Render Markdown summary (truncated)
- CreateIdea form: Add Tiptap editor
- IdeaDetail: Render full Markdown
- CommentItem: Add Tiptap editor, render Markdown
- CommentThread: Render Markdown comments

**Design Token Application**
- Define tokens in `tokens.css` (CSS variables)
- Import in Nuxt layout components
- Apply to IdeaCard, VoteButton, CommentItem, etc.
- Dark mode via `@media (prefers-color-scheme: dark)`

**Risk & Mitigation**
- **XSS injection (HIGH):** Mitigated by DOMPurify whitelist + server validation
- **Performance (LOW):** Client-side parsing is fast for comment-sized text
- **Database (NONE):** No schema changes; Markdown is valid text
- **Backward compatibility (NONE):** Plaintext continues to work as valid Markdown

---

### Pitfalls: Security & Consistency Risks Identified

**Critical Pitfall 1: Markdown XSS (CRITICAL)**
- **Risk:** Unsanitized Markdown enables session hijacking (3+ active 2026 CVEs documented)
- **Warning signs:** Ideas contain HTML tags that render as code
- **Prevention:**
  - Use DOMPurify post-render sanitization (industry standard)
  - Server-side validation of Markdown syntax
  - Security tests for XSS payloads (test suite provided in architecture research)
- **Phase:** Phase 4 — implement DOMPurify day-one with editor

**Critical Pitfall 2: Plaintext Breaking Changes (HIGH)**
- **Risk:** Existing ideas stored as plaintext render differently as Markdown
- **Warning signs:** User confusion, unexpected formatting changes
- **Prevention:**
  - Two-phase migration with `is_plaintext` flag
  - Old content stays plaintext-wrapped, new content uses Markdown
  - Migration script with rollback capability
- **Phase:** Phase 4 — execute migration before Markdown launch

**Critical Pitfall 3: Design System Drift (HIGH)**
- **Risk:** Partial token adoption without clear ownership → visual inconsistency
- **Warning signs:** Some components use tokens, others use hardcoded colors
- **Prevention:**
  - Clear scope: which components in v1.1, which deferred to v1.2
  - Establish ownership (who updates tokens? who reviews component changes?)
  - Adoption metrics (track % of components using tokens)
  - Feature flags for gradual rollout
- **Phase:** Phase 4 & 5 — scoped rollout with metrics tracking

**Moderate Pitfall 4: Vote Race Condition (HIGH)**
- **Risk:** Concurrent requests create duplicate votes
- **Warning signs:** Vote counts inconsistent, duplicate entries in votes table
- **Prevention:**
  - PostgreSQL `ON CONFLICT ... DO UPDATE` upsert syntax
  - UNIQUE constraint on (idea_id, email) and (comment_id, email)
  - Query for existing duplicates: `SELECT COUNT(*) FROM votes GROUP BY idea_id, email HAVING COUNT(*) > 1`
- **Phase:** Phase 3 (before Markdown) — fix now or data cleanup required later

**Moderate Pitfall 5: Dark Mode Regression (HIGH)**
- **Risk:** New tokens might break dark mode contrast
- **Warning signs:** Text disappears, low contrast (< 4.5:1 WCAG AA)
- **Prevention:**
  - Explicit light/dark token definitions
  - Contrast audit for all tokens
  - Dark mode testing on all components
- **Phase:** Phase 5 — comprehensive dark mode testing

---

## Technology Stack Recommendation

```
Frontend Additions:
  @tiptap/vue-3@^3.20.5          (Markdown editor)
  @tiptap/pm@^3.20.5             (Prosemirror core)
  @tiptap/starter-kit@^3.20.5    (Core extensions)
  @tiptap/extension-markdown@^3.20.5 (Markdown support)
  dompurify@^3.0.0               (XSS sanitization)
  @nuxt/ui@^4.0.0                (Component library)

No Backend Changes Required
  PostgreSQL: Accept Markdown in text fields immediately
  Express: API endpoints unchanged
  Auth: Email sessions unchanged
  Database: No schema modifications

Total Bundle Impact: ~150KB gzipped (Tiptap ~50KB, Nuxt UI ~70KB, DOMPurify ~30KB)
```

---

## Roadmap Implications: v1.1 Phase Structure

**Phase 4: Markdown Foundation + Bug Fixes (Weeks 1-2)**
- Add Tiptap editor dependencies
- Create MarkdownEditor and MarkdownRenderer components
- Implement DOMPurify sanitization pipeline
- Fix vote race condition (critical blocker for stability)
- Create migration script for plaintext ideas
- Unit tests for Markdown parsing, XSS prevention

**Phase 5: Component Integration + Design Tokens (Weeks 2-3)**
- Update CreateIdea form with Tiptap editor
- Update CommentItem with Tiptap editor
- Create `tokens.css` with color, typography, spacing tokens
- Apply tokens to IdeaCard, VoteButton, CommentThread
- Implement dark mode token variations
- Integration tests for editor + comments

**Phase 6: Design System + Stability (Week 4)**
- Apply design tokens to Settings page
- Complete mobile accessibility fixes (44px tap targets)
- Markdown rendering in all contexts (ideas, comments, detail pages)
- Dark mode contrast audit (WCAG AA 4.5:1 minimum)
- E2E tests: vote, comment, create idea with Markdown
- Performance testing with large comment threads

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|-----------|-----------|
| **Stack** | HIGH | Tiptap 3.20, DOMPurify 3.0, CSS variables all production-proven; zero breaking changes |
| **Features** | HIGH | Markdown editing and design tokens are industry standard; security patterns well-documented |
| **Architecture** | HIGH | Client-side parsing with DOMPurify is standard Vue practice; integration with existing components straightforward |
| **Pitfalls** | HIGH | Derived from 3+ active 2026 CVEs and design systems research; prevention strategies validated |
| **Implementation** | HIGH | 2-4 week timeline feasible for solo dev; all dependencies are actively maintained |
| **Design System** | MEDIUM | Clarification pending on Google Stitch usage; research recommends lightweight CSS token approach |

---

## Outstanding Clarifications

1. **Google Stitch vs Design Tokens:** Research confirms "Stitch" = Google AI design tool (2026). Should v1.1 use Stitch for AI-assisted design, or stick with manual design tokens (recommended)?
2. **Markdown Feature Scope:** Beyond CommonMark basics (bold, italic, links, lists, code blocks), should support:
   - [ ] Syntax highlighting for code blocks?
   - [ ] Mermaid diagrams?
   - [ ] Math equations?
   - [ ] Custom civic markup (@mentions, #categories)?
3. **Design Token Color Palette:** Which colors for primary, secondary, error, success, neutral? (CSS variable framework provided; specific values needed)
4. **Component Adoption Timeline:** Should all components use design tokens in v1.1, or defer some to v1.2? (Research recommends scoped rollout)

---

## Next Steps

1. **Clarify outstanding questions** (above)
2. **Run `/gsd:plan-phase 4`** to create detailed execution plan
3. **Start with Phase 4:** Markdown + bug fixes (foundational for v1.1)

---

**Research completed:** 2026-03-27
**Synthesized by:** GSD Research Synthesizer (4 parallel agents)
**Ready for:** Phase planning and roadmap creation

Files in `.planning/research/`:
- `STACK.md` — Technology choices with rationale
- `FEATURES.md` — Feature landscape and categorization
- `ARCHITECTURE.md` — Integration strategy and data flows
- `PITFALLS.md` — Risk assessment and prevention strategies
- `SUMMARY.md` (this file) — Synthesis across all dimensions
