# Para Salvar A Cuba - Design System Assets

**Complete design system for the civic engagement platform that inspires democratic participation.**

---

## 📦 What's Included

```
design-system/
├── README.md                    (this file)
├── DESIGN-SYSTEM.md            (philosophy, guidelines, and specifications)
├── COMPONENT-SPECS.md          (component implementation patterns)
├── design-tokens.css           (CSS variables for colors, spacing, typography)
├── design-tokens.json          (machine-readable token definitions)
├── tailwind-para-salvar.js     (Tailwind CSS theme extension)
└── (logo assets - from Stitch project)
```

---

## 🚀 Quick Start for Developers

### 1. Import Design Tokens

**Option A: Using CSS Variables**
```html
<link rel="stylesheet" href="./design-system/design-tokens.css">
```

Then use tokens throughout your CSS:
```css
.button {
  background: var(--color-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}
```

**Option B: Using Tailwind CSS**
```javascript
// tailwind.config.js
const paraSalvarTheme = require('./design-system/tailwind-para-salvar.js');

module.exports = {
  theme: {
    extend: paraSalvarTheme.extend,
  },
  plugins: [...paraSalvarTheme.plugins],
};
```

Then use Tailwind classes:
```html
<button class="bg-primary text-white px-8 py-4 rounded-lg shadow-cta-primary">
  Share Your Idea
</button>
```

### 2. Build Components

Follow component patterns in `COMPONENT-SPECS.md`:
- Button (primary, secondary, tertiary)
- Card
- Input Field
- Badge/Tag
- Typography (Heading, Body Text)
- Container/Layout

Example:
```vue
<template>
  <button class="btn-primary">
    Share Your Idea
  </button>
</template>

<style scoped>
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  color: var(--color-on-primary);
  padding: var(--spacing-4) var(--spacing-8);
  border-radius: var(--radius-lg);
}
</style>
```

### 3. Test Accessibility

Before deploying:
- [ ] Run [WAVE browser extension](https://wave.webaim.org/extension/)
- [ ] Check [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ ] Test keyboard navigation (Tab, Enter, Space)
- [ ] Test on actual mobile devices
- [ ] Verify 44px+ touch targets

---

## 🎨 Key Design Principles

### 1. Color Hierarchy
```
Primary Teal (#006565)     → Trust, democracy, participation
Secondary Coral (#a43c12)  → Energy, action, call to contribute
Tertiary Navy (#495b70)    → Wisdom, sophistication
```

### 2. No Harsh Borders
Never use 1px solid borders. Instead:
- Use color shifts (surface containers)
- Use whitespace (generous spacing)
- Use shadows (elevation, not lines)

### 3. Generous Whitespace
Create "breathing room" for ideas:
```css
/* Instead of dividers, use spacing */
section {
  margin-bottom: var(--spacing-12); /* 48px */
}

/* Not: border-bottom: 1px solid #ccc; */
```

### 4. Touch-First Design
All interactive elements must be **44px minimum**:
```css
button {
  min-height: 44px;  /* Mobile-friendly */
  min-width: 44px;
}
```

### 5. Premium Typography
- **Manrope (Headlines):** Modern, authoritative, friendly
- **Inter (Body):** Highly readable, professional, accessible

---

## 📐 Spacing Scale

Build everything on the 8px grid:

```
spacing-0     0px
spacing-1     4px    ← Tight
spacing-2     8px    ← Default
spacing-3     12px
spacing-4     16px   ← Standard
spacing-6     24px   ← Card padding
spacing-8     32px   ← Large sections
spacing-12    48px   ← Hero sections
spacing-24    96px   ← Page margins
```

**Rule:** Never use arbitrary values. Always pick from the scale.

---

## 🎯 Color Tokens Usage

### For Text
```css
color: var(--color-text-primary);           /* #181c1c on light bg */
color: var(--color-text-secondary);         /* #3e4949 subtle text */
color: var(--color-on-primary);             /* #ffffff on primary */
color: var(--color-on-secondary);           /* #ffffff on secondary */
```

### For Backgrounds
```css
background: var(--color-surface);           /* Page background */
background: var(--color-surface-container-low);     /* Subtle sections */
background: var(--color-surface-container-lowest);  /* Cards */
```

### For Actions
```css
background: var(--color-primary);           /* Trust actions */
background: var(--color-secondary);         /* Urgent actions */
color: var(--color-error);                  /* Errors, alerts */
```

---

## 🔤 Typography Tokens

### Font Sizes
```
display-lg:   3.5rem  (hero)
headline-lg:  2rem    (page title)
title-lg:     1.375rem (section)
body-lg:      1rem    (main content)
label-lg:     0.875rem (button text)
```

### Font Weights
```
Regular:      400
Medium:       500
Semibold:     600
Bold:         700
```

### Line Heights
```
Tight:        1.2    (headlines)
Normal:       1.5    (body, ui)
Relaxed:      1.75   (long text)
```

---

## ⚡ Motion & Transitions

```css
/* Smooth, natural transitions */
transition: all var(--transition-normal);  /* 250ms */

/* Fast for micro-interactions */
transition: color var(--transition-fast);  /* 150ms */

/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🔍 Testing Checklist

### Visual Testing
- [ ] Colors match design tokens exactly
- [ ] Spacing follows 8px grid
- [ ] Typography follows type scale
- [ ] Shadows match specifications
- [ ] Border radius consistent
- [ ] Hover states work smoothly

### Accessibility Testing
- [ ] WCAG AA contrast (4.5:1 for text)
- [ ] Touch targets 44px+
- [ ] Keyboard navigation works
- [ ] Focus visible on all buttons/inputs
- [ ] Form labels associated
- [ ] No color-only information
- [ ] Motion respects preferences

### Responsive Testing
- [ ] Mobile (375px): stacked layout
- [ ] Tablet (768px): 2-column
- [ ] Desktop (1024px+): full layout
- [ ] Fonts scale appropriately
- [ ] Spacing scales appropriately

### Component Testing
- [ ] Normal state
- [ ] Hover state
- [ ] Focus state
- [ ] Active state
- [ ] Disabled state
- [ ] Loading state
- [ ] Error state

---

## 📄 File Reference

### `design-tokens.css`
CSS custom properties (variables) for all design tokens. Import this first.
```css
@import './design-tokens.css';

button {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
```

### `design-tokens.json`
Machine-readable JSON format for design tokens. Use for:
- Design tool integrations
- Code generation
- Documentation

### `tailwind-para-salvar.js`
Tailwind CSS theme extension. Install in `tailwind.config.js`:
```javascript
const paraSalvarTheme = require('./design-system/tailwind-para-salvar.js');
module.exports = {
  theme: { extend: paraSalvarTheme.extend },
  plugins: paraSalvarTheme.plugins,
};
```

### `DESIGN-SYSTEM.md`
Full design system documentation including:
- Color philosophy
- Typography rules
- Spacing guidelines
- Component specifications
- Accessibility standards
- Implementation checklist

### `COMPONENT-SPECS.md`
Detailed component implementation patterns:
- Button (primary, secondary, tertiary)
- Card component
- Input field component
- Badge/tag component
- Typography components
- Layout components
- Accessibility checklist

---

## 🎯 Design System Goals

✅ **Inspire Contribution:** Every visual element reinforces "Your voice matters"
✅ **Build Trust:** Clear, accessible, professional design
✅ **Enable Democracy:** Simple, transparent, fair participation
✅ **Delight Users:** Smooth interactions, beautiful polish
✅ **Scale Easily:** Consistent tokens and components
✅ **Stay Accessible:** WCAG AA standard throughout

---

## 🔗 Related Resources

- **Stitch Design Project:** See `/projects/5452549322734083535`
- **Component Examples:** Check `app/components/` directory
- **Current Implementation:** See `nuxt.config.ts`, `app.vue`

---

## 🆘 Common Questions

**Q: Should I use hardcoded colors or CSS variables?**
A: Always use CSS variables. Hardcoded values break consistency and make theming impossible.

**Q: Can I modify spacing/colors?**
A: Try to stick to the scale first. If you need something custom, add it to the design tokens and document why.

**Q: How do I handle dark mode?**
A: Coming in v1.1! Design system is already prepared with variable names that support mode switching.

**Q: My button doesn't look right. What's wrong?**
A: Check:
1. Are you using `var(--color-primary)` not `#006565`?
2. Is padding `var(--spacing-4) var(--spacing-8)` not hardcoded?
3. Is border-radius `var(--radius-lg)` not `8px`?

**Q: What's the font delivery strategy?**
A: Import Manrope and Inter from Google Fonts in your `nuxt.config.ts`:
```typescript
googleFonts: {
  families: {
    Manrope: [400, 600, 700],
    Inter: [400, 500, 600, 700],
  }
}
```

---

## 📞 Support

- **Design Questions:** See `DESIGN-SYSTEM.md`
- **Component Questions:** See `COMPONENT-SPECS.md`
- **Token Questions:** See `design-tokens.json`
- **General Questions:** Check this README

---

## 📝 Version History

**v1.0.0** — Initial design system release
- Complete color system with accessibility compliance
- Full typography scale (Manrope + Inter)
- 8px spacing scale
- Component specifications
- Tailwind CSS integration
- Accessibility guidelines

**Planned:**
- **v1.1:** Dark mode support, design tokens for theme switching
- **v1.2:** Additional component patterns (tabs, modals, dropdowns)
- **v2.0:** Animation library, advanced interactions

---

**Last Updated:** 2026-03-29
**Maintainers:** Design System Team
**License:** Shared with development team for Para Salvar A Cuba project
