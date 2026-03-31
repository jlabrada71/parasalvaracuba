# All Ideas Page Design - Complete Documentation Index

**Project:** Para Salvar A Cuba - Civic Ideas Platform
**Date Created:** March 31, 2026
**Design Tool:** Stitch AI Design System
**Status:** Ready for Implementation

---

## Overview

This directory contains complete design specifications and implementation guidance for the "All Ideas" listing page of the Para Salvar A Cuba civic platform. The design was created using Stitch AI design tool and is based on the "Empowered Editorial" creative north star with teal primary colors (#008080), coral accents (#FF7F50), and a clean, editorial aesthetic.

---

## Documentation Files

### 1. **DESIGN-SUMMARY.txt** ⭐ START HERE
   - **Purpose:** Quick overview and executive summary
   - **Best for:** Understanding the big picture at a glance
   - **Contents:**
     - Page structure overview
     - Component descriptions
     - Color palette reference
     - Design system principles
     - Implementation timeline estimate
   - **Read time:** 5-10 minutes

### 2. **ALL-IDEAS-DESIGN.md** 📐 DETAILED SPECS
   - **Purpose:** Complete design specifications with pixel-perfect details
   - **Best for:** Designers and developers needing exact measurements
   - **Contents:**
     - Layout structure (header, hero, grid, pagination, footer)
     - Idea card component structure and styling
     - Typography scale with usage
     - Color palette with all token values
     - Responsive behavior specifications
     - Implementation considerations
     - Accessibility requirements
   - **Read time:** 20-30 minutes
   - **Use while:** Building components, validating designs

### 3. **IMPLEMENTATION-GUIDE.md** 💻 CODE READY
   - **Purpose:** Ready-to-use Vue 3 components and implementation patterns
   - **Best for:** Developers starting the implementation
   - **Contents:**
     - File structure recommendations
     - CSS design tokens setup
     - Complete Vue component code:
       - AllIdeasPage (main page)
       - IdeaCard (card component)
       - SearchBar
       - FilterChips
       - IdeasPagination
     - Responsive CSS grid setup
     - API integration examples
     - i18n configuration
   - **Read time:** 15-20 minutes
   - **Use for:** Copy/paste code foundation, understanding architecture

### 4. **INTERACTION-PATTERNS.md** 🎯 UX FLOWS
   - **Purpose:** Detailed interaction states and user flows
   - **Best for:** Understanding how components behave and feel
   - **Contents:**
     - Visual hierarchy breakdown
     - State flows for all interactive elements
     - Hover/active/focus states
     - Responsive behavior changes
     - Loading and transition states
     - Accessibility interactions
     - Animation timings and easing
   - **Read time:** 15-20 minutes
   - **Use while:** Building animations, testing interactions

### 5. **QUICK-REFERENCE.md** ⚡ CHEAT SHEET
   - **Purpose:** Fast lookup for values and common patterns
   - **Best for:** Quick lookups while coding
   - **Contents:**
     - At-a-glance specifications
     - Color quick reference
     - Component sizing
     - Typography mapping
     - Spacing reference
     - State colors
     - Animation timings
     - Responsive breakpoints
     - CSS variable usage
     - Common implementation patterns
     - Testing checklist
   - **Read time:** 2-5 minutes per section
   - **Keep open:** During development

---

## Getting Started

### For Designers
1. Start with **DESIGN-SUMMARY.txt** for overview
2. Review **ALL-IDEAS-DESIGN.md** for detailed specifications
3. Check **INTERACTION-PATTERNS.md** for interaction details
4. Use **QUICK-REFERENCE.md** as a checklist

### For Developers
1. Start with **DESIGN-SUMMARY.txt** for context
2. Read **IMPLEMENTATION-GUIDE.md** for code structure
3. Keep **QUICK-REFERENCE.md** open during coding
4. Refer to **ALL-IDEAS-DESIGN.md** for measurements/specifications
5. Use **INTERACTION-PATTERNS.md** for animation/interaction details

### For Project Managers
1. Review **DESIGN-SUMMARY.txt** for project scope
2. Check "Estimated Implementation Time" section
3. Use **QUICK-REFERENCE.md** Testing Checklist for QA validation

---

## Key Design Elements

### Layout Structure
```
Header (Sticky) - Teal background (#008080)
    ↓
Hero Section - Light background with search & filters
    ↓
Ideas Grid - Responsive 3/2/1 columns
    ├─ IdeaCard (white background, no borders)
    ├─ IdeaCard
    ├─ IdeaCard
    ... (12-16 cards)
    ↓
Pagination - Centered button controls
    ↓
Footer - Light background with links
```

### Color System
- **Primary (Teal):** #008080, #006565
- **Secondary (Coral):** #FF7F50
- **Surface:** #f6faf9 (base), #ffffff (cards)
- **Text:** #181c1c (primary), #3e4949 (secondary)

### Typography
- **Headlines:** Manrope (bold, geometric)
- **Body:** Inter (readable, accessible)
- **Sizes:** Display, Title, Body, Label scales

### Key Principle
**No 1px borders** - All boundaries defined by background color shifts and surface layering.

---

## File Structure for Implementation

```
app/
├── pages/
│   └── ideas/
│       └── index.vue                    # Main page
│
├── components/
│   └── ideas/
│       ├── AllIdeasHeader.vue
│       ├── AllIdeasHero.vue
│       ├── IdeasGrid.vue
│       ├── IdeaCard.vue
│       ├── IdeasPagination.vue
│       ├── SearchBar.vue
│       └── FilterChips.vue
│
├── composables/
│   └── useIdeas.ts                      # Data fetching
│
└── styles/
    └── ideas.css                        # Layout CSS
```

---

## Design System Connection

**System Name:** "The Civic Pulse"
**Creative North Star:** "The Empowered Editorial"

**Key Principles:**
1. Editorial layout with intentional whitespace
2. Surface hierarchy through layering (no borders)
3. Gradient CTAs for "soul" and depth
4. Ambient shadows (sparse usage)
5. High-contrast typography
6. Generous spacing scale
7. Glassmorphism for floating elements

**Design Tokens Applied:**
- Spacing scale 3 (8px base unit)
- Roundness: ROUND_EIGHT (0.75rem default)
- Color variant: FIDELITY (accurate colors)

---

## Responsive Design Summary

| Device | Grid | Margins | Features |
|--------|------|---------|----------|
| **Desktop** (1200px+) | 3 cols | 8.5rem L / 5.5rem R | Full pagination |
| **Tablet** (768-1199px) | 2 cols | 4rem L / 3rem R | Simplified pagination |
| **Mobile** (<768px) | 1 col | 1rem padding | Dots or Load More |

---

## Component Inventory

### Layout Components
- Header (sticky, navigation, language selector)
- Hero Section (title, subtitle, search, filters)
- Ideas Grid (responsive container)
- Pagination (numbered buttons + prev/next)
- Footer (links, copyright)

### Interactive Components
- Search Input (ghost border style)
- Filter Chips (selectable, toggle style)
- Vote Buttons (upvote/downvote with counts)
- Comment Button (click to navigate)

### Display Components
- Idea Card (12-item grid unit)
  - Category Badge
  - Title
  - Author Info (avatar + name + date)
  - Excerpt
  - Engagement Footer

---

## Design Tokens Quick Reference

### Colors
```css
--color-primary: #008080
--color-coral: #FF7F50
--color-surface: #f6faf9
--color-text-primary: #181c1c
--color-text-secondary: #3e4949
```

### Typography
```css
--font-family-headline: "Manrope"
--font-family-body: "Inter"
--font-size-display-lg: 3.5rem
--font-size-title-md: 1.1rem
--font-size-body-sm: 0.8rem
```

### Spacing
```css
--spacing-2: 0.5rem    /* 8px */
--spacing-4: 1.4rem    /* 22px - grid gap */
--spacing-6: 2rem      /* 32px - sections */
```

### Effects
```css
--shadow-ambient: 0 24px 24px rgba(24, 28, 28, 0.06)
--transition-normal: 200ms ease-out
--radius-md: 0.75rem   /* Card corners */
```

---

## Common Questions

### Q: Why no borders on cards?
**A:** Following the "No-Line Rule" from the design system. Boundaries are defined through background color shifts and surface hierarchy layering, creating a more sophisticated, premium feel.

### Q: What makes this "Empowered Editorial"?
**A:** The layout uses asymmetric margins, generous whitespace, high-contrast typography, and visual hierarchy that treats the platform like a curated publication rather than a form or database.

### Q: Can we use different colors?
**A:** The design system specifically requires teal (#008080) and coral (#FF7F50). Deviating from these colors would require updating the entire design system. Contact design lead before making changes.

### Q: What about infinite scroll vs pagination?
**A:** Design specifies pagination. However, mobile can be adapted to "Load More" button or infinite scroll if needed (see INTERACTION-PATTERNS.md).

### Q: Do we need all the filters?
**A:** Yes - Recent, Most Voted, Most Discussed, and All Categories are part of the design. All are important for discoverability.

---

## Implementation Timeline

**Estimated Total:** 11-17 hours

| Task | Hours | Notes |
|------|-------|-------|
| Page structure & layout | 2-3 | Header, hero, grid container |
| Card component | 1-2 | Including metadata and engagement |
| Header & footer | 1-2 | Navigation and sticky behavior |
| Search & filters | 1-2 | Input, chip selection, API calls |
| Pagination | 1 | Button logic and state management |
| Responsive CSS | 1-2 | Breakpoints and mobile adaptation |
| API integration | 1-2 | Data fetching and state management |
| Testing & refinement | 2-3 | Visual, functional, accessibility |

---

## QA/Testing Checklist

### Visual
- [ ] Colors match specifications
- [ ] Typography scales correctly
- [ ] Spacing is consistent
- [ ] No visible borders (only backgrounds)
- [ ] Shadows appear only on hover/elevation
- [ ] Responsive at all breakpoints

### Functional
- [ ] Search filters ideas
- [ ] Filter chips work
- [ ] Vote buttons update counts
- [ ] Pagination navigates pages
- [ ] Card clicks navigate to detail

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] ARIA labels present
- [ ] Touch targets 44px minimum

### Performance
- [ ] Grid renders smoothly
- [ ] No lag on interactions
- [ ] Animations are smooth (60fps)

---

## Design Assets

**Stitch Project:**
- **Name:** Para Salvar A Cuba - Civic Ideas Platform
- **Project ID:** 5452549322734083535
- **URL:** https://www.stitchdesignstudio.com/projects/5452549322734083535

**Design System:** "The Civic Pulse"
- Primary: Teal (#008080)
- Secondary: Coral (#FF7F50)
- Fonts: Manrope + Inter
- Roundness: 0.75rem (md)

---

## Related Pages

- **Homepage:** Already designed (use as reference for header/footer)
- **Idea Detail Page:** Exists at `/ideas/[id].vue` (link destination)
- **User Profile:** May link from author names

---

## Support & Questions

For clarifications on:
- **Design specifications:** See ALL-IDEAS-DESIGN.md
- **Implementation code:** See IMPLEMENTATION-GUIDE.md
- **Interaction details:** See INTERACTION-PATTERNS.md
- **Quick lookups:** See QUICK-REFERENCE.md
- **Design system:** Refer to "The Civic Pulse" documentation

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-31 | Initial design and documentation |

---

## Sign-Off

**Design Created:** Stitch AI Design System
**Documentation:** Complete
**Status:** Ready for Development
**Last Updated:** March 31, 2026

All specifications are final and production-ready.

---

*For the Para Salvar A Cuba team*
*Supporting democratic engagement through civic innovation*
