# Requirements: IdeaHub v1.1 (Polish & Design)

## v1.1 Requirements (Markdown, Design, Stability)

All v1.1 requirements build on the v1.0 MVP and focus on richness (Markdown editing), polish (design consistency), and stability (bug fixes).

### Markdown Editing

- [ ] **MARK-01**: User can write Markdown in idea descriptions with live preview
- [ ] **MARK-02**: User can write Markdown in comment text with live preview
- [ ] **MARK-03**: Markdown renders safely without XSS risk (DOMPurify sanitization)
- [ ] **MARK-04**: Existing plaintext ideas remain compatible (backward compatibility)
- [ ] **MARK-05**: User sees Markdown toolbar with common formatting options (bold, italic, links, lists, code)

### Design System & Consistency

- [ ] **DESN-01**: Color tokens defined (primary, secondary, error, success, neutral)
- [ ] **DESN-02**: Typography tokens defined (headline, body, label sizes and weights)
- [ ] **DESN-03**: Spacing tokens applied to IdeaCard, VoteButton, CommentItem
- [ ] **DESN-04**: Dark mode theme works with design tokens (automatic via CSS variables)
- [ ] **DESN-05**: Visual consistency across all components (no hardcoded colors)

### Bug Fixes & Stability

- [ ] **STAB-01**: Fix vote race condition (prevent concurrent duplicate votes)
- [ ] **STAB-02**: Mobile forms meet accessibility standards (44px tap targets, WCAG AA)
- [ ] **STAB-03**: Dark mode text contrast meets WCAG AA (4.5:1 minimum)
- [ ] **STAB-04**: Comment deletion edge cases handled (nested replies, vote cleanup)
- [ ] **STAB-05**: Large comment threads render without performance degradation

### Testing & Quality

- [ ] **TEST-01**: XSS security tests for Markdown (payloads from OWASP)
- [ ] **TEST-02**: Unit tests for MarkdownEditor and MarkdownRenderer components
- [ ] **TEST-03**: E2E tests for create idea/comment with Markdown
- [ ] **TEST-04**: Regression tests for all v1.0 features (no breaking changes)
- [ ] **TEST-05**: Dark mode contrast audit (all components WCAG AA)

**Total v1.1 Requirements: 20**

---

## v2 Requirements (Deferred)

These features improve the platform but are deferred to v2 (later milestone):

- **SEARCH-01**: Search ideas by full-text query
- **CATEGORY-01**: Browse/filter ideas by category or topic
- **STATUS-01**: Track idea status (Open, Under Review, Approved, Rejected, Implemented)
- **NOTIF-01**: Email notifications when someone replies to user's idea
- **MOBILE-01**: Mobile app (native iOS/Android)
- **POLARIS-01**: Migrate to Shopify Polaris component library (full design system refactor)
- **IMPLEMENT-01**: Implementation tracking from idea to decision/deployment

---

## Out of Scope (v1.1 & v2)

These are intentionally deferred:

- Government/stakeholder integration (partnership-dependent)
- User profiles or reputation systems (could gamify platform)
- OAuth or social login (email keeps friction low)
- Analytics dashboards (observe behavior directly)
- AI-assisted writing or moderation (liability in civic context)
- File uploads or attachments (moderation overhead)

---

## Requirement Traceability

| Requirement | Category | Status | Phase | Priority |
|-------------|----------|--------|-------|----------|
| MARK-01 | Markdown | new | 4 | High |
| MARK-02 | Markdown | new | 4 | High |
| MARK-03 | Markdown | new | 4 | Critical |
| MARK-04 | Markdown | new | 4 | High |
| MARK-05 | Markdown | new | 4 | Medium |
| DESN-01 | Design | new | 5 | High |
| DESN-02 | Design | new | 5 | High |
| DESN-03 | Design | new | 5 | High |
| DESN-04 | Design | new | 5 | Medium |
| DESN-05 | Design | new | 5 | High |
| STAB-01 | Stability | bug-fix | 4 | Critical |
| STAB-02 | Stability | bug-fix | 5 | High |
| STAB-03 | Stability | bug-fix | 5 | High |
| STAB-04 | Stability | bug-fix | 4 | Medium |
| STAB-05 | Stability | bug-fix | 6 | Medium |
| TEST-01 | Testing | new | 4 | Critical |
| TEST-02 | Testing | new | 4 | High |
| TEST-03 | Testing | new | 6 | High |
| TEST-04 | Testing | new | 6 | High |
| TEST-05 | Testing | new | 6 | High |

**Success Criteria for v1.1:**
1. All Markdown features work end-to-end (create, edit, display, safety)
2. Design tokens applied to 100% of core components
3. Dark mode works without contrast failures
4. All v1.0 features continue to work (no regressions)
5. XSS security tests passing
6. Mobile accessibility meets WCAG AA

---

*Last updated: 2026-03-27 — v1.1 scope defined with 20 requirements*
