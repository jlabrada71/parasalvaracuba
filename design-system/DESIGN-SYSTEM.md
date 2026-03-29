# Para Salvar A Cuba - Design System

**Version:** 1.0.0
**Last Updated:** 2026-03-29
**Created By:** Stitch Design System + Claude Code

---

## 🎯 Design Vision

**"The Empowered Editorial"** — A premium, modern civic engagement experience that treats democratic participation as a high-end editorial experience, not bureaucratic forms.

This is the platform for **YOUR voice**. Every design decision reinforces that citizens matter, ideas matter, and collective action creates change.

---

## 🎨 Color System

### Primary Palette

| Token | Hex | Usage | Emotion |
|-------|-----|-------|---------|
| **Primary** | #006565 | Democracy, voting, trust | Hope, unity, inclusiveness |
| **Primary Container** | #008080 | Active states, gradients | Engaged participation |
| **Secondary** | #a43c12 | CTAs, success, voting | Energy, urgency, action |
| **Secondary Container** | #fe7e4f | Hover states, accents | Call to contribute |
| **Tertiary** | #495b70 | Data, supporting info | Wisdom, sophistication |
| **Error** | #ba1a1a | Validation, alerts | Clear feedback |

### Surface Hierarchy

The design uses **layered surfaces** instead of borders to create visual separation:

```
Base Surface (#f6faf9)
  ↓ (subtle color shift)
Surface Container Low (#f0f4f3)
  ↓ (subtle color shift)
Surface Container (#ebefee)
  ↓ (subtle color shift)
Surface Container High (#e5e9e8)
  ↓ (subtle color shift)
Surface Container Highest (#dfe3e2)
  ↓ (subtle color shift)
Surface Container Lowest (#ffffff) — Cards, elevated content
```

**Key Rule:** Never use 1px solid borders. Boundaries are defined through background color shifts. This creates a premium, modern aesthetic.

### Accessibility

- **Contrast Ratio (WCAG AA):** All text meets 4.5:1 minimum
- **Teal + White:** 9.8:1 contrast
- **Coral + White:** 5.2:1 contrast
- **Navy + White:** 7.8:1 contrast

---

## 🔤 Typography System

### Font Stack

```css
/* Headlines - Modern, Authoritative */
font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Body - Highly Readable, Professional */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale

| Level | Size | Font | Weight | Usage |
|-------|------|------|--------|-------|
| **Display Large** | 3.5rem | Manrope | 700 | Hero headlines |
| **Display Medium** | 2.75rem | Manrope | 700 | Major sections |
| **Display Small** | 2.25rem | Manrope | 700 | Section titles |
| **Headline Large** | 2rem | Manrope | 700 | Page titles |
| **Headline Medium** | 1.75rem | Manrope | 600 | Subsections |
| **Headline Small** | 1.5rem | Manrope | 600 | Card titles |
| **Title Large** | 1.375rem | Manrope | 600 | Emphasis |
| **Title Medium** | 1.25rem | Manrope | 500 | Idea titles |
| **Title Small** | 1.125rem | Manrope | 500 | Labels |
| **Body Large** | 1rem | Inter | 400 | Main content |
| **Body Medium** | 0.875rem | Inter | 400 | Secondary content |
| **Body Small** | 0.8125rem | Inter | 400 | Metadata |
| **Label Large** | 0.875rem | Inter | 600 | Button labels |
| **Label Medium** | 0.75rem | Inter | 500 | Badges, tags |
| **Label Small** | 0.6875rem | Inter | 500 | Small labels |

### Typography Rules

✅ **Do:**
- Use Manrope (Headline) for all display and headline text
- Use Inter (Body) for all body, label, and UI text
- Pair large type (Display, Headline) with generous line-height (1.5)
- Use letter-spacing on category labels (+0.05em) for refinement

❌ **Don't:**
- Mix fonts within the same hierarchy level
- Use Manrope for body text (too geometric)
- Use Inter Display weight for headlines (lacks presence)
- Forget line-height in responsive design

---

## 📏 Spacing System

8px base unit grid for harmony and accessibility:

```
0 (0px)
1 (4px)   — Tight spacing for icon-text pairs
2 (8px)   — Default padding
3 (12px)  — Small containers
4 (16px)  — Standard padding/margin
5 (20px)  — Comfortable spacing
6 (24px)  — Card padding
7 (28px)  — Section spacing
8 (32px)  — Large spacing
12 (48px) — Component spacing
16 (64px) — Section spacing
20 (80px) — Large section spacing
24 (96px) — Hero section spacing
```

### Active Whitespace

**Never use horizontal dividers.** Instead, use generous spacing (spacing-6 or spacing-8) to create natural visual separation. The white space *is* the divider.

```
[Idea Title]
{spacing-6}           ← Creates natural separation
[Idea Description]
```

---

## 🎯 Component Specifications

### Buttons

#### Primary Button
```css
background: linear-gradient(135deg, #006565, #008080);
color: #ffffff;
padding: 1rem 2rem;
border-radius: 1rem;
font-size: var(--font-size-label-lg);
font-weight: 600;
box-shadow: 0 15px 30px rgba(0, 101, 101, 0.15);
transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);

/* Hover */
box-shadow: 0 20px 40px rgba(0, 101, 101, 0.25);
transform: translateY(-2px);
```

**Usage:** "Share Your Idea", "Create Idea", primary CTAs

#### Secondary Button
```css
background: #a43c12;
color: #ffffff;
padding: 1rem 2rem;
border-radius: 1rem;
font-weight: 600;
```

**Usage:** "Vote", "Comment", secondary CTAs

#### Tertiary Button (Ghost)
```css
background: transparent;
color: #006565;
border: 1px solid #bdc9c8;
padding: 0.75rem 1.5rem;
border-radius: 1rem;
```

**Usage:** "Learn More", "Cancel", low-emphasis actions

### Cards

```css
background: #ffffff;
border-radius: 1.5rem;
padding: 1.5rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);

/* Hover */
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
transform: translateY(-2px);
```

**Usage:** Idea cards, comment containers, content blocks

### Input Fields

```css
background: #dfe3e2;
border: none;
border-bottom: 2px solid #bdc9c8;
border-radius: 0;
padding: 0.75rem 0;

/* Focus */
border-bottom: 3px solid #ff7f50;
outline: none;
```

**Usage:** Form inputs, search fields

### Category Badges/Tags

```css
background: #93f2f2;
color: #002020;
padding: 0.375rem 0.75rem;
border-radius: 0.5rem;
font-size: var(--font-size-label-md);
font-weight: 600;
letter-spacing: 0.05em;
text-transform: uppercase;
```

---

## 🌊 Advanced Effects

### Gradient CTA
```css
background: linear-gradient(135deg, #006565, #008080);
/* Creates depth and "soul" in primary actions */
```

### Glassmorphism
```css
background: rgba(246, 250, 249, 0.8);
backdrop-filter: blur(12px);
border: 1px solid rgba(189, 201, 200, 0.2);
/* Use for floating navigation, modals */
```

### Overlay on Photography
```css
/* 40% primary color overlay for text legibility */
background: rgba(0, 101, 101, 0.4);
mix-blend-mode: multiply;
```

### Elevation Shadow (Floating Elements)
```css
box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
/* Use for prominent CTAs or floating components */
```

---

## 🎬 Transitions & Motion

```css
--transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow:   350ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Usage:**
- **Fast:** Hover states, small interactions
- **Normal:** Button fills, card elevation, color transitions
- **Slow:** Large layout shifts, modals, page transitions

---

## ♿ Accessibility Guidelines

✅ **Must Have:**
- 44px+ touch targets on all interactive elements
- 4.5:1 contrast ratio for body text
- 3:1 contrast ratio for UI components
- Proper heading hierarchy (h1 → h2 → h3)
- Semantic HTML (use `<button>`, `<a>`, `<form>`)
- `aria-label` on icon-only buttons
- Focus visible on keyboard navigation

❌ **Never:**
- Use color alone to convey information
- Hide form labels
- Disable focus visible on buttons
- Use very small text (< 12px) without zoom support
- Create timed transitions > 3 seconds

---

## 🚀 Implementation Checklist

### For Frontend Developers

- [ ] Import `design-tokens.css` in your main stylesheet
- [ ] Replace hardcoded colors with CSS variables (e.g., `var(--color-primary)`)
- [ ] Use spacing scale: `padding: var(--spacing-4);`
- [ ] Test focus states on all buttons and inputs
- [ ] Verify 44px+ touch targets on mobile
- [ ] Test with WAVE accessibility checker
- [ ] Check color contrast with WebAIM contrast checker
- [ ] Use semantic HTML (buttons, links, forms)
- [ ] Add `transition` class to interactive elements
- [ ] Test on actual devices (not just browser DevTools)

### For Component Library

- [ ] Create Button component with variants (primary, secondary, tertiary)
- [ ] Create Card component with default padding & shadow
- [ ] Create Input component with focus states
- [ ] Create Badge/Tag component with uppercase text
- [ ] Create spacing utilities (p-4, m-6, etc.)
- [ ] Export all color tokens as component props
- [ ] Document component props and usage
- [ ] Test components in light mode (dark mode ready in v1.1)

### For Design Iterations

- [ ] Always use the color tokens (don't create new colors)
- [ ] Respect spacing scale (don't use arbitrary values)
- [ ] Use Manrope for headlines, Inter for body
- [ ] Apply glassmorphism only to floating elements
- [ ] Use elevation shadows for floating content
- [ ] Never use 1px borders (use spacing or color shifts)
- [ ] Test accessibility before finalizing designs

---

## 📱 Responsive Design

### Breakpoints

```css
Mobile First Approach:
- XS: 0px (mobile)
- SM: 640px (small devices)
- MD: 768px (tablets)
- LG: 1024px (desktops)
- XL: 1280px (large screens)
```

### Scaling Rules

- **Typography:** Base size at XS, +1 size at MD, +1 size at LG
- **Spacing:** Halve spacing on XS, use full scale on MD+
- **Cards:** Stack vertically on XS, grid at SM, wide cards at LG+
- **Buttons:** Full width on XS, auto width at SM+

---

## 🔗 Related Resources

- **Design Tokens JSON:** `design-tokens.json` (for tooling)
- **Tailwind Config Extension:** `tailwind-para-salvar.js`
- **Component Specs:** See individual component documentation
- **Brand Guidelines:** See separate brand document

---

## 📝 Design System Maintenance

This design system is a living document. As components are built:

1. Document all new component patterns
2. Update color usage if new colors are added
3. Test accessibility of all new components
4. Keep design tokens in sync across platforms
5. Review and iterate with team feedback

**Questions?** Reach out to the design/frontend team for clarification.
