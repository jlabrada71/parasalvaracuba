# Roadmap: IdeaHub v1.1 (Polish & Design)

## Overview

4 phases | 20+ requirements mapped | Comprehensive design & polish | All v1.1+ requirements covered ✓

**Phases continue from v1.0:** Phase 4-7 (v1.0 was phases 1-3)

## Phases

| Phase | Name | Goal | Requirements | Success Criteria | Duration |
|-------|------|------|--------------|------------------|----------|
| 4 | Markdown & Stability | Add rich text editing with Markdown and fix critical bugs | MARK-01, MARK-02, MARK-03, MARK-04, STAB-01, STAB-04, TEST-01, TEST-02 | 8 | 1-2 weeks |
| 5 | Design System | Apply design tokens for consistency and accessibility | DESN-01, DESN-02, DESN-03, DESN-04, DESN-05, STAB-02, STAB-03 | 7 | 1 week |
| 6 | Polish & Testing | Comprehensive testing, performance tuning, and launch readiness | MARK-05, STAB-05, TEST-03, TEST-04, TEST-05 | 5 | 1 week |
| 7 | Improve the Site Design | Enhance visual design with Stitch-generated components and refined UX | DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04 | TBD | 1-2 weeks |

---

## Phase Details

### Phase 4: Markdown & Stability Foundation

**Goal:** Deliver Markdown editing with security-first approach; fix critical bugs (vote race condition, edge cases); establish security baseline.

**Delivers:**
- MARK-01: User can write Markdown in idea descriptions with live preview
- MARK-02: User can write Markdown in comment text with live preview
- MARK-03: Markdown renders safely without XSS risk (DOMPurify sanitization)
- MARK-04: Existing plaintext ideas remain compatible (backward compatibility)
- STAB-01: Fix vote race condition (prevent concurrent duplicate votes)
- STAB-04: Comment deletion edge cases handled (nested replies, vote cleanup)
- TEST-01: XSS security tests for Markdown (payloads from OWASP)
- TEST-02: Unit tests for MarkdownEditor and MarkdownRenderer components

**Success Criteria:**
1. User can create idea with Markdown formatting (bold, italic, links, lists, code)
2. Live preview shows formatted result in real-time
3. Rendered Markdown is safe (XSS payloads blocked by DOMPurify)
4. Existing plaintext ideas display without errors or formatting changes
5. Concurrent vote requests don't create duplicate votes (race condition fixed)
6. Deleting a comment with nested replies cleans up votes correctly
7. XSS test suite passes (20+ OWASP payloads tested)
8. Unit test coverage >90% for Markdown components

**Why this phase first:** Markdown editing is the primary feature for v1.1. Vote race condition is a critical stability bug that must be fixed before more features are added. Security testing foundation ensures all future Markdown work is safe.

**Dependencies:** @tiptap/vue-3, @tiptap/pm, @tiptap/starter-kit, @tiptap/extension-markdown, dompurify, marked.js

**Tech debt addressed:**
- PostgreSQL race condition in vote logic (application-level upsert)
- Missing XSS test coverage for user input
- Edge case handling for comment deletion

---

### Phase 5: Design System & Accessibility

**Goal:** Establish design consistency through CSS tokens; ensure accessibility compliance; improve visual coherence.

**Delivers:**
- DESN-01: Color tokens defined (primary, secondary, error, success, neutral)
- DESN-02: Typography tokens defined (headline, body, label sizes and weights)
- DESN-03: Spacing tokens applied to IdeaCard, VoteButton, CommentItem
- DESN-04: Dark mode theme works with design tokens (automatic via CSS variables)
- DESN-05: Visual consistency across all components (no hardcoded colors)
- STAB-02: Mobile forms meet accessibility standards (44px tap targets, WCAG AA)
- STAB-03: Dark mode text contrast meets WCAG AA (4.5:1 minimum)

**Success Criteria:**
1. Color tokens defined in CSS variables (:root with light/dark variants)
2. Typography tokens applied to all text components (headlines, body, labels)
3. Spacing tokens used for gaps, padding, margins across IdeaCard, VoteButton, CommentThread
4. Dark mode theme activates via @media (prefers-color-scheme: dark)
5. All interactive elements have >44px touch targets (mobile accessibility)
6. Text contrast meets WCAG AA 4.5:1 in both light and dark modes
7. No hardcoded color values in component CSS (all use tokens)
8. Design system documentation updated for developers

**Why this phase after Markdown:** Token system foundation ensures Markdown components (editor, renderer) inherit design consistency. Accessibility fixes prevent user issues discovered during Phase 4 testing.

**Dependencies:** CSS variables (native), @nuxt/ui@^4.0.0, tailwindcss@^4.0.0

**Tech debt addressed:**
- Visual inconsistency (no design tokens before)
- Mobile accessibility gaps (sub-44px buttons)
- Dark mode contrast issues (needs systematic token approach)

---

### Phase 6: Polish & Comprehensive Testing

**Goal:** Complete v1.1 with comprehensive testing, performance tuning, and launch readiness.

**Delivers:**
- MARK-05: User sees Markdown toolbar with common formatting options (bold, italic, links, lists, code)
- STAB-05: Large comment threads render without performance degradation
- TEST-03: E2E tests for create idea/comment with Markdown
- TEST-04: Regression tests for all v1.0 features (no breaking changes)
- TEST-05: Dark mode contrast audit (all components WCAG AA)

**Success Criteria:**
1. Markdown editor toolbar visible and functional (bold, italic, links, lists, code blocks)
2. Comment threads with 100+ nested comments render in <2 seconds
3. E2E tests verify: create idea with Markdown → vote → comment with Markdown → vote on comment
4. All v1.0 features still work (voting, commenting, editing, browsing)
5. Dark mode passes automated contrast audit (0 violations)
6. Performance metrics: page load <3s, editor response <100ms
7. All 20 requirements have passing tests
8. Documentation complete (API changes, design token guide, Markdown editor usage)

**Why this phase last:** Comprehensive testing ensures no regressions from earlier phases. Performance tuning validates large-scale usage. Launch readiness checklist confirms platform is production-ready.

**Dependencies:** Vitest, Supertest, axe (accessibility testing), Lighthouse (performance)

**Tech debt addressed:**
- Missing E2E test coverage
- No regression test suite
- Performance baselines not established
- Accessibility compliance not audited

---

### Phase 7: Improve the Site Design

**Goal:** Enhance visual design with Stitch-generated components and refined UX to inspire user contribution and increase platform appeal.

**Delivers:**
- DESIGN-01: Stitch-designed homepage with hero section inspiring civic participation
- DESIGN-02: Refined color palette applied to all pages (teal, coral, navy)
- DESIGN-03: Logo and brand identity assets integrated
- DESIGN-04: UX improvements to idea browsing and contribution flow

**Success Criteria:**
1. Homepage hero section implemented with inspiring messaging
2. Color tokens from Stitch design system applied to all components
3. Logo and brand assets visible on all pages
4. User engagement metrics improve (CTR on "Share Your Idea" button)
5. Design consistency across all pages (no mismatched colors/spacing)
6. Mobile design responsive and visually appealing
7. All design assets from Stitch project integrated

**Why this phase after Testing:** Phase 6 ensures core functionality is solid before design enhancements. Phase 7 builds on stable foundation to create a visually compelling platform that inspires contribution.

**Dependencies:** Stitch design system tokens, Vue 3 components, design asset library

**Tech debt addressed:**
- Visual design not optimized for engagement
- Missing cohesive branding
- No professional logo/identity assets

---

## Requirement Map (Complete)

| Requirement | Phase | Category | Description |
|-------------|-------|----------|-------------|
| MARK-01 | 4 | Markdown | User can write Markdown in idea descriptions with live preview |
| MARK-02 | 4 | Markdown | User can write Markdown in comment text with live preview |
| MARK-03 | 4 | Markdown | Markdown renders safely without XSS risk |
| MARK-04 | 4 | Markdown | Existing plaintext ideas remain compatible |
| MARK-05 | 6 | Markdown | User sees Markdown toolbar with formatting options |
| DESN-01 | 5 | Design | Color tokens defined (primary, secondary, error, success, neutral) |
| DESN-02 | 5 | Design | Typography tokens defined (headline, body, label) |
| DESN-03 | 5 | Design | Spacing tokens applied to core components |
| DESN-04 | 5 | Design | Dark mode theme works with design tokens |
| DESN-05 | 5 | Design | Visual consistency across all components |
| STAB-01 | 4 | Stability | Fix vote race condition (prevent concurrent duplicates) |
| STAB-02 | 5 | Stability | Mobile forms meet accessibility standards (44px targets) |
| STAB-03 | 5 | Stability | Dark mode contrast meets WCAG AA (4.5:1 minimum) |
| STAB-04 | 4 | Stability | Comment deletion edge cases handled |
| STAB-05 | 6 | Stability | Large comment threads render without degradation |
| TEST-01 | 4 | Testing | XSS security tests for Markdown |
| TEST-02 | 4 | Testing | Unit tests for MarkdownEditor and MarkdownRenderer |
| TEST-03 | 6 | Testing | E2E tests for create idea/comment with Markdown |
| TEST-04 | 6 | Testing | Regression tests for all v1.0 features |
| TEST-05 | 6 | Testing | Dark mode contrast audit |

**All 20 v1.1 requirements mapped to phases 4-6. No requirement unmapped. Complete coverage ✓**

---

## Timeline & Milestones

| Phase | Start | Duration | Key Milestone |
|-------|-------|----------|---------------|
| 4 | Week 1 | 1-2 weeks | Markdown editor working, vote race condition fixed |
| 5 | Week 2-3 | 1 week | Design tokens applied, dark mode working, accessibility passes |
| 6 | Week 4 | 1 week | Comprehensive tests passing, performance validated |
| 7 | Week 5 | 1-2 weeks | Visual design complete, branding integrated, engagement optimized |

**Total v1.1 timeline: 3-5 weeks**

---

## Risk & Mitigation

| Risk | Impact | Mitigation | Phase |
|------|--------|-----------|-------|
| Markdown XSS vulnerabilities | CRITICAL | DOMPurify sanitization + XSS test suite | 4 |
| Plaintext breaking changes | HIGH | Two-phase migration with `is_plaintext` flag | 4 |
| Design token drift | HIGH | Scoped rollout, clear ownership, metrics tracking | 5 |
| Dark mode regression | MEDIUM | Explicit token definitions for light/dark | 5 |
| Performance degradation | MEDIUM | Load testing with 100+ comments | 6 |

---

*Last updated: 2026-03-29 — Phase 7 added for design enhancement (4 phases, design focus)*
