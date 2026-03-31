# Phase 4 Research Index

**Project:** ParaSalvaraCuba Platform  
**Phase:** 4 - Markdown & Stability Foundation  
**Research Complete:** March 27, 2026  

## Files in This Directory

### Main Research Document
- **04-RESEARCH.md** (1350 lines, 41 KB)
  - Comprehensive Phase 4 research with 11 major sections
  - Includes code examples, implementation patterns, and detailed specifications
  - Full citations to official documentation and security references
  - **START HERE** for complete Phase 4 planning information

### Quick Reference
- **RESEARCH_SUMMARY.txt** (109 lines, 4.7 KB)
  - One-page executive summary
  - Key findings, confidence levels, constraints
  - Quick lookup for main takeaways
  - **READ THIS** for fast understanding of Phase 4

### Status
- **STATUS.md** (103 lines, 3.8 KB)
  - Research completion status
  - Deliverables checklist
  - Confidence assessment
  - Next steps for roadmap creation

## Research Sections (04-RESEARCH.md)

1. **Executive Summary** - Key findings and high-level overview
2. **Markdown Editor Integration** - Tiptap 3 setup, component architecture, storage strategy
3. **Security-First XSS Prevention** - DOMPurify integration, MarkdownRenderer component, backward compatibility
4. **Vote Race Condition Fix** - Root cause analysis, PostgreSQL upsert solution, data cleanup
5. **Comment Deletion Edge Cases** - Cascade delete handling, missing endpoints, testing
6. **Component Architecture** - MarkdownEditor and MarkdownRenderer specs, integration points
7. **Testing Strategy** - Unit tests, XSS security tests, integration tests, regression tests
8. **Implementation Dependencies** - New packages, database changes, API changes, component files
9. **Build Order** - 10-step sequential implementation plan
10. **Known Constraints & Assumptions** - Critical requirements and open questions
11. **Confidence Assessment** - Confidence levels for each research area with justification

## Key Findings Summary

### Technology Stack
```
@tiptap/vue-3 ^3.20.5       ✓ Official Nuxt 4 support, SSR-safe
@tiptap/pm ^3.20.5          ✓ ProseMirror dependency
@tiptap/starter-kit ^3.20.5 ✓ Common extensions
dompurify ^3.0.0            ✓ XSS sanitization
marked ^11.0.0              ✓ Markdown parsing
```

### Components to Build
1. **MarkdownEditor.vue** - Rich editor with toolbar, preview, character count
2. **MarkdownRenderer.vue** - Safe Markdown display with DOMPurify

### Database Changes
1. **Migration 004_vote_race_fix.sql** - Add UNIQUE constraints for vote deduplication

### API Changes
1. **New:** DELETE `/api/ideas/[id]/comments/[commentId]`
2. **Modified:** POST `/api/ideas/[id]/votes` (use upsert)
3. **Modified:** POST `/api/comments/[commentId]/votes` (use upsert)

### Security Testing
- 20+ OWASP XSS payloads
- Covers: script tags, event handlers, data URIs, encoding bypasses
- Test file: `tests/unit/MarkdownXSS.spec.ts`

### Build Order (10 Steps)
1. Database migration (vote race fix)
2. MarkdownRenderer + XSS tests
3. MarkdownEditor + unit tests
4. Integrate into Create form
5. Integrate into Idea detail
6. Integrate into Comments
7. Fix vote race condition
8. Add comment deletion endpoint
9. E2E regression tests
10. Performance review

## How to Use This Research

### For Phase Planning
- Start with **04-RESEARCH.md** sections 2-5 for feature/stability work
- Use **Build Order** (section 9) to structure the phase timeline
- Reference **Implementation Dependencies** (section 8) for task breakdown

### For Component Development
- See **Component Architecture** (section 6) for MarkdownEditor and MarkdownRenderer specs
- Include code examples from sections 2-3 in your component templates

### For Testing
- Use **Testing Strategy** (section 7) for test structure and examples
- Copy XSS payloads from MarkdownXSS.spec.ts section
- Follow integration test patterns for vote concurrency and cascade delete

### For Database Work
- Reference vote race condition fix in section 4 for SQL pattern
- Use migration example from section 4 for database changes
- See data cleanup section 4 for handling existing duplicates

## Confidence Levels

| Area | Level | Details |
|------|-------|---------|
| Tiptap | HIGH | Official docs match requirements, versions stable |
| Security | HIGH | DOMPurify verified, OWASP patterns documented |
| Database | HIGH | PostgreSQL upsert documented, cascade tested |
| Testing | MEDIUM | Framework works but some race conditions hard to simulate |

## Sources Verified

- [Tiptap Official Documentation](https://tiptap.dev)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/current/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [PortSwigger Web Security Academy](https://portswigger.net/)
- [marked.js Documentation](https://marked.js.org/)

## Next Steps

1. **Review** this research with the team
2. **Validate** Markdown feature scope (basic vs. GFM)
3. **Estimate** effort for each build step
4. **Create** detailed roadmap based on research
5. **Begin** Phase 4 implementation

## Contact

Research conducted by: Claude Code (GSD Project Researcher)  
Questions? Refer to specific sections in 04-RESEARCH.md for detailed explanations.

---

**Status:** ✓ Complete and ready for Phase 4 planning
