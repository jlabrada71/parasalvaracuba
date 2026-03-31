# All Ideas Page - Quick Reference Guide

## At a Glance

| Aspect | Specification |
|--------|---------------|
| **Page Name** | All Ideas / Browse Ideas |
| **URL Pattern** | `/ideas` or `/ideas/all` |
| **Device Type** | Desktop (responsive to mobile) |
| **Grid Layout** | 3 cols (desktop) / 2 cols (tablet) / 1 col (mobile) |
| **Items per Page** | 12-16 |
| **Primary Color** | Teal #008080 / #006565 |
| **Secondary Color** | Coral #FF7F50 |
| **Background** | Light #f6faf9 |
| **Card Background** | White #ffffff |
| **Headline Font** | Manrope |
| **Body Font** | Inter |
| **Border Radius** | md (0.75rem) |
| **Spacing Base** | 8px unit |

---

## Color Quick Reference

### Use Teal (#008080, #006565) For:
- Header background
- Category badges
- Primary buttons
- Active pagination
- Logo/branding
- Navigation focus

### Use Coral (#FF7F50) For:
- Active vote buttons
- Form focus states
- Hover accents
- Action moments
- Success feedback

### Use Light Gray (#3e4949) For:
- Secondary text
- Metadata (dates, authors)
- Inactive states
- Helper text

### Use White (#ffffff) For:
- Card backgrounds
- Text on teal (contrast)
- Primary surface

---

## Component Sizing

### Header
- Height: ~64px
- Logo: ~48px width
- Font size: body-md
- Padding: spacing-3 to spacing-4

### Hero Section
- Title: display-md/lg (2.8-3.5rem)
- Subtitle: body-lg (1rem)
- Margins: 8.5rem left, 5.5rem right (desktop)
- Gap below search: spacing-3

### Cards
- Width: responsive (1/3 desktop, 1/2 tablet, 1 mobile)
- Height: auto (content-based)
- Padding: spacing-4 (1.4rem)
- Corner radius: md (0.75rem)
- Min height: ~280px (typical)
- Max height: flexible

### Search Bar
- Height: ~44px
- Padding: spacing-3
- Corner radius: md (0.75rem)
- Font size: body-md

### Buttons
- Min height: 44px (mobile accessible)
- Padding: spacing-2 to spacing-3
- Corner radius: md (0.75rem)
- Font size: body-sm

---

## Typography Mapping

### Page Title
```
Font: Manrope
Size: Display-md (2.8rem) to Display-lg (3.5rem)
Weight: Bold (700)
Color: #181c1c
Line height: 1.2
```

### Card Title
```
Font: Manrope
Size: Title-md (1.1rem)
Weight: Bold (700)
Color: #181c1c
Lines: max 2 (clamp)
```

### Body Text
```
Font: Inter
Size: Body-sm (0.8rem)
Weight: Regular (400)
Color: #181c1c
Line height: 1.5
```

### Metadata
```
Font: Inter
Size: Label-sm (0.7rem)
Weight: Regular (400)
Color: #3e4949
Letter-spacing: +0.05em (if all-caps)
```

---

## Spacing Reference

| Variable | Size | Use Case |
|----------|------|----------|
| spacing-1 | 4px | Small gaps between icons |
| spacing-2 | 8px | Icon/text gaps, chip padding |
| spacing-3 | 12px | Section padding, author info |
| spacing-4 | 16px / 1.4rem | Card padding, grid gaps |
| spacing-5 | 22px | Major section spacing |
| spacing-6 | 32px | Between major sections |

**No borders between items** - use spacing-4 or spacing-5 for visual separation.

---

## State Colors

### Vote Button
- Default: Gray text #3e4949, outline icon
- Hover: Coral text #FF7F50
- Active: Coral text #FF7F50, filled icon, bold text

### Filter Chip
- Inactive: Teal text #006565, transparent background
- Hover: Teal text, surface-low background #f0f4f3
- Active: Teal text on primary-fixed background #93f2f2

### Pagination Button
- Inactive: Teal text, transparent background
- Hover: Teal text, surface-low background
- Active: White text on teal gradient background
- Disabled: Teal text at 50% opacity

---

## Icon Reference

| Element | Icon | Size | Color |
|---------|------|------|-------|
| Search | 🔍 (magnifying glass) | 20px | #3e4949 |
| Vote Up | 👍 or ⬆️ | 18px | #3e4949 (gray) / #FF7F50 (active) |
| Vote Down | 👎 or ⬇️ | 18px | #3e4949 (gray) / #FF7F50 (active) |
| Comment | 💬 or message | 18px | #3e4949 |
| Author Avatar | Profile circle | 32px | N/A (image) |
| Previous | ← arrow | 18px | #006565 |
| Next | → arrow | 18px | #006565 |
| Language | 🌐 or globe | 18px | White |
| Menu (mobile) | ≡ hamburger | 24px | White |

---

## Animation Timings

| Action | Duration | Easing |
|--------|----------|--------|
| Hover effects | 150ms | ease-out |
| Button click | 200ms | ease-out |
| Filter change | 200ms | ease-out |
| Vote interaction | 200ms | ease-out |
| Page load | 300ms | ease-out |
| Page navigation | 300ms | ease-out |
| Pagination transition | 300ms | ease-out |

**No animations for accessibility-sensitive users** (respects prefers-reduced-motion)

---

## Responsive Breakpoints

```
DESKTOP:
- Width: 1200px and above
- Grid: 3 columns
- Hero margins: 8.5rem left, 5.5rem right
- Font sizes: full
- Pagination: all numbers shown

TABLET:
- Width: 768px to 1199px
- Grid: 2 columns
- Hero margins: 4rem left, 3rem right
- Font sizes: 95-100%
- Pagination: simplified (fewer numbers)

MOBILE:
- Width: below 768px
- Grid: 1 column
- Hero margins: spacing-4 padding
- Font sizes: 90-95%
- Pagination: dots or Load More
- Filter chips: horizontal scroll
```

---

## CSS Variables (Token) Usage

```css
/* Colors */
--color-primary: #006565
--color-primary-container: #008080
--color-coral: #FF7F50
--color-surface: #f6faf9
--color-surface-lowest: #ffffff
--color-text-primary: #181c1c
--color-text-secondary: #3e4949

/* Typography */
--font-family-headline: "Manrope"
--font-family-body: "Inter"
--font-size-display-lg: 3.5rem
--font-size-title-md: 1.1rem
--font-size-body-sm: 0.8rem

/* Spacing */
--spacing-2: 0.5rem
--spacing-3: 0.75rem
--spacing-4: 1.4rem
--spacing-6: 2rem

/* Border Radius */
--radius-md: 0.75rem
--radius-full: 9999px

/* Shadows */
--shadow-ambient: 0 24px 24px rgba(24, 28, 28, 0.06)

/* Transitions */
--transition-normal: 200ms ease-out
```

---

## Common Patterns

### Card Container
```css
background-color: var(--color-surface-lowest);
border-radius: var(--radius-md);
padding: var(--spacing-4);
box-shadow: none;
```

### Ghost Border Input
```css
background-color: var(--color-surface-highest);
border: none;
border-bottom: 1px solid var(--color-outline-variant);
transition: border-color var(--transition-normal);
```

### Primary Button
```css
background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
color: white;
border: none;
border-radius: var(--radius-md);
padding: var(--spacing-2) var(--spacing-3);
```

### Tertiary (Ghost) Button
```css
background: transparent;
color: var(--color-primary);
border: 1px solid var(--color-outline-variant);
border-radius: var(--radius-md);
padding: var(--spacing-2) var(--spacing-3);
```

---

## Accessibility Checklist

- [ ] Focus indicators visible (2px teal outline)
- [ ] Color contrast WCAG AA (4.5:1 for text)
- [ ] Keyboard navigation working (Tab order correct)
- [ ] Form labels associated (for search input)
- [ ] ARIA labels on buttons
- [ ] aria-current="page" on active pagination
- [ ] aria-pressed on vote/filter buttons
- [ ] Images have alt text (avatars)
- [ ] Page has proper h1 (page title)
- [ ] Mobile touch targets 44px minimum

---

## Common Implementation Mistakes to Avoid

1. **❌ Using 1px solid borders** - Use background color shifts instead
2. **❌ Pure black text (#000000)** - Use #181c1c instead
3. **❌ Drop shadows everywhere** - Use ambient shadows sparingly
4. **❌ Undersized touch targets** - Buttons should be at least 44px
5. **❌ Skipping hover states** - All interactive elements need feedback
6. **❌ Ignoring keyboard navigation** - Tab order and focus indicators required
7. **❌ Too many transitions** - Stick to 150-300ms ease-out
8. **❌ Color-only information** - Combine color with icons/text
9. **❌ No mobile consideration** - Test all breakpoints
10. **❌ Hardcoding colors** - Use CSS variables/design tokens

---

## Testing Checklist

### Visual Testing
- [ ] Colors match design system
- [ ] Typography scales correctly
- [ ] Spacing is consistent
- [ ] Cards display properly (all viewports)
- [ ] No visual glitches on hover/click
- [ ] Shadows match specification
- [ ] Focus indicators visible

### Functional Testing
- [ ] Search filters results
- [ ] Filter chips work correctly
- [ ] Vote buttons update counts
- [ ] Pagination navigates pages
- [ ] Cards navigate to detail page
- [ ] Responsive grid adjusts at breakpoints
- [ ] Animations smooth

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus order is logical
- [ ] Color contrast passes WCAG AA
- [ ] Screen reader announces content
- [ ] ARIA labels present
- [ ] Touch targets adequate

### Performance Testing
- [ ] Grid renders with 100+ cards smoothly
- [ ] Pagination loads quickly
- [ ] Search doesn't cause lag
- [ ] Transitions smooth (60fps)
- [ ] No memory leaks on repeated actions

---

## File References

- **Design Specs**: `/app/.planning/ALL-IDEAS-DESIGN.md`
- **Implementation Code**: `/app/.planning/IMPLEMENTATION-GUIDE.md`
- **Interaction Patterns**: `/app/.planning/INTERACTION-PATTERNS.md`
- **Full Summary**: `/app/.planning/DESIGN-SUMMARY.txt`
- **This Guide**: `/app/.planning/QUICK-REFERENCE.md`

---

## Support Links

- **Design System**: "The Civic Pulse" documentation
- **Stitch Project**: https://www.stitchdesignstudio.com/projects/5452549322734083535
- **Design Tokens**: See CSS Variables section above
- **Component Library**: Check IMPLEMENTATION-GUIDE.md

---

## Quick Copy-Paste Values

### Color Values
```
Teal Primary: #006565
Teal Container: #008080
Coral Accent: #FF7F50
Text Primary: #181c1c
Text Secondary: #3e4949
Surface Base: #f6faf9
Surface Card: #ffffff
Surface Low: #f0f4f3
```

### Font Values
```
Headline: 'Manrope', sans-serif
Body: 'Inter', sans-serif
Size Large: 1.1rem
Size Medium: 0.9rem
Size Small: 0.8rem
Weight Bold: 700
```

### Spacing Values
```
Compact: 0.75rem (12px)
Standard: 1.4rem (22px)
Generous: 2rem (32px)
Asymmetric Left: 8.5rem
Asymmetric Right: 5.5rem
```

---

*Last Updated: March 31, 2026*
*Design System: Para Salvar A Cuba - "The Civic Pulse"*
*Status: Ready for Implementation*
