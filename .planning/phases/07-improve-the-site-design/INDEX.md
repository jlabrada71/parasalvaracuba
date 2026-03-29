# Phase 7: Improve the Site Design

**Status:** RESEARCH COMPLETE ✅

**Goal:** Enhance visual design with Stitch-generated components and refined UX

**Phase Type:** Design-Focused Refactoring

---

## Key Findings (TL;DR)

### What We Know
- ✅ Complete Stitch design system available (tokens, components, Tailwind config)
- ✅ Design tokens created with 30+ CSS variables (colors, spacing, typography, shadows)
- ✅ Component specs detailed (Button, Card, Input, Badge patterns)
- ✅ Tailwind config ready (`tailwind-para-salvar.js`)
- ✅ i18n integrated (3 languages: EN, ES, PT)
- ❌ Tailwind NOT installed in Nuxt (no `@nuxtjs/tailwindcss` module)
- ❌ Design tokens NOT imported globally
- ❌ Existing components use hardcoded hex colors, not design tokens
- ❌ Logo/brand assets not rendered on site

### Quick Wins (High Impact, 2-3 Days)
1. Install Tailwind CSS + configure design system
2. Refactor Button component (powers "Share Your Idea" CTA everywhere)
3. Update Navigation bar with design system colors
4. Create Badge component for vote counts
5. Test responsive on mobile (375px, 768px, 1024px)

### Medium Effort (4-7 Days)
1. Refactor IdeaCard with design tokens
2. Create/refactor Input, Card, Form components
3. Redesign homepage hero section with gradient
4. Implement "Share Your Idea" prominence (3 placements: nav, hero, mobile FAB)
5. Mobile-optimize touch targets (44px+)

### High Effort (Strategic - 1-2 Weeks)
1. Redesign all pages (home, create, detail, settings)
2. Implement responsive typography scaling
3. Add accessibility features (WCAG AA color contrast, keyboard nav)
4. Visual regression testing (before/after screenshots)
5. Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## Critical Path

**Week 1 (Foundation):**
- Install Tailwind, import tokens, configure fonts
- Implement Button, Badge, Navigation
- Mobile responsiveness baseline

**Week 2 (Components):**
- Refactor IdeaCard, Input, Card, VoteButton
- Update existing modals and forms
- Component testing + accessibility audit

**Week 3 (Pages):**
- Homepage hero redesign
- Form page polish
- Detail page improvements
- Full QA and launch prep

---

## Dependencies & Prerequisites

### Phase 5/6 Outputs ✅
All design system files present in `/design-system/`:
- `design-tokens.css` (30+ CSS variables)
- `design-tokens.json` (machine-readable)
- `tailwind-para-salvar.js` (Tailwind theme)
- `DESIGN-SYSTEM.md` (philosophy + specs)
- `COMPONENT-SPECS.md` (implementation patterns)
- `IMPLEMENTATION-GUIDE.md` (step-by-step)

### To Install
- `@nuxtjs/tailwindcss` (Tailwind CSS module)
- `@nuxtjs/google-fonts` (Manrope, Inter fonts)

### Existing Stack ✅
- Nuxt 4.4.2 (Vue 3)
- TypeScript
- Pinia (state)
- @nuxtjs/i18n (3 languages)
- DOMPurify + Marked (security + Markdown)
- Vitest (testing)

---

## Research Sections (Full Details in 07-RESEARCH.md)

| Section | Key Takeaway | Pages |
|---------|--------------|-------|
| **1. Stitch Integration** | Phase-based rollout (foundation → components → pages) | 4-5 |
| **2. Component Priority** | Button (P0) → Card → Input → Badge → complex components | 3-4 |
| **3. Visual Design** | Hero section gradient, color token mapping, logo strategy | 5-6 |
| **4. UX Improvements** | "Share Your Idea" in 3 placements, engagement patterns, mobile | 4-5 |
| **5. Migration** | Incremental refactoring (safer than parallel design) | 3-4 |
| **6. Risk & Mitigation** | 6 major risks with concrete mitigation strategies | 3-4 |
| **7. Dependencies** | Nuxt config changes, new packages, existing tech | 2-3 |
| **8. Success Criteria** | Design, components, pages, testing, mobile, docs checklist | 2-3 |
| **9. File Structure** | New files, modifications, what to keep unchanged | 2 |
| **10. Quick Reference** | Design token values, colors, typography, spacing | 2 |

---

## Next Steps

1. **Read Full Research:** `/planning/phases/07-improve-the-site-design/07-RESEARCH.md`
2. **Create Execution Plan:** `07-PLAN.md` (waves of work, task breakdown)
3. **Execute Phase 7:** Install Tailwind → refactor components → redesign pages
4. **Verify Success:** Lighthouse >90, WCAG AA, responsive, <3s load time

---

## Confidence Levels

| Item | Confidence | Notes |
|------|-----------|-------|
| Design system assets complete | ✅ HIGH | All files present, documented |
| Tailwind integration feasible | ✅ HIGH | Standard Nuxt + Tailwind pattern |
| Component refactoring approach | ✅ HIGH | Clear incremental path, no breaking changes |
| Timeline estimate (10-14 days) | 🟡 MEDIUM | Depends on QA + accessibility testing |
| Mobile optimization possible | ✅ HIGH | Design tokens already include responsive specs |
| Risk mitigation coverage | ✅ HIGH | 6 major risks identified + solutions |

---

**Research Status:** COMPLETE ✅
**Date:** March 29, 2026
**Next Phase:** Execution Planning (07-PLAN.md)
