# Design System Component Library Integration

## Overview

The Para Salvar A Cuba website now fully integrates a comprehensive design system with reusable Vue 3 components. All pages and components have been updated to use the design system's Button, Card, Hero, Text, and other components, ensuring consistent visual identity and improved accessibility across the platform.

## Integration Summary

### Components Created and Deployed

Seven reusable Vue 3 components were created in `app/components/design-system/`:

1. **Button.vue** - Primary interactive element with variants (primary, secondary, tertiary) and sizes (sm, md, lg)
2. **Card.vue** - Container component with optional interactive and elevated states
3. **Input.vue** - Text input component with validation states (error, hint)
4. **Badge.vue** - Status indicator with multiple variants (primary, secondary, success, warning, error)
5. **Hero.vue** - Full-width section for page introductions with title, subtitle, and action slots
6. **Heading.vue** - Semantic heading component with configurable levels and sizes
7. **Text.vue** - Flexible text component with semantic HTML and style variants

All components:
- Use CSS custom properties (design tokens) for colors, typography, spacing
- Include accessibility features (44px minimum touch targets, focus-visible states, WCAG AA contrast)
- Support responsive design with mobile-first approach
- Respect `prefers-reduced-motion` for animations

### Design Tokens

All components reference the design token system defined in:
- `design-system/design-tokens.css` - 30+ CSS custom properties
- `design-system/design-tokens.json` - Machine-readable token definitions
- `design-system/tailwind-para-salvar.js` - Tailwind CSS theme extension

**Key Color Tokens:**
- Primary: #006565 (teal) - Primary actions and branding
- Primary Container: #008080 - Secondary teal for depth
- Secondary: #fe7e4f (coral) - Secondary actions and highlights
- Secondary Container: #a43c12 - Darker coral for hover states
- Tertiary: #495b70 (navy) - Accents and supporting elements
- Error: #ba1a1a - Error states and destructive actions
- Surface: #f6faf9 - Background
- On Surface: #181c1c - Text on light backgrounds

**Typography:**
- Headline Font: Manrope (bold, display/headline sizes)
- Body Font: Inter (regular/medium weights, body sizes)
- Label Font: Inter (semibold/medium weights, compact sizes)

**Spacing:** 8px grid system
**Border Radius:** 4px, 8px, 12px, 20px, 28px
**Shadows:** 5-level elevation system

## Site Integration Points

### Pages Updated

#### 1. `app/pages/index.vue` (Homepage)
- **Hero Component**: Displays page title "Ideas for Cuba" and subtitle with full-width gradient background
- **Button Component**:
  - Secondary variant for "New Idea" CTA in navigation
  - Tertiary variant for "Load More" pagination
- **Card + Text Components**: Used indirectly through IdeaCard component
- **Benefits**: Professional hero section, consistent button styling, better visual hierarchy

#### 2. `app/pages/ideas/create.vue` (Idea Creation)
- **Button Component**: Primary variant for form submission
- **Existing Form Styling**: Maintains bottom-border input pattern from design tokens
- **Benefits**: Consistent button styling with site branding

#### 3. `app/pages/ideas/[id].vue` (Idea Detail)
- **Button Component**:
  - Tertiary variant for "Edit Idea" action (when user is author)
  - Primary variant for "Save Changes" in inline edit form
  - Tertiary variant for "Cancel" action
- **Benefits**: Clear visual hierarchy for actions, consistent styling

#### 4. `app/pages/settings.vue` (Settings Page)
- **Button Component**:
  - Primary variant for "Change Email" and "Set Email"
  - Secondary variant for "Clear Email (sign out)"
- **Updated Page Styling**: Integrated design tokens for background, typography, borders
- **Benefits**: Settings page now matches design system aesthetic

### Components Updated

#### 1. `app/components/IdeaCard.vue` (Idea List Item)
- **Card Component**: Replaces hardcoded div with Card's interactive state
- **Text Component**: Secondary text for metadata (author, date)
- **Benefits**: Elegant hover state with lift effect, consistent card styling

#### 2. `app/components/CommentItem.vue` (Comment Thread Item)
- **Button Component**:
  - Tertiary variant for "Reply" button
  - Primary variant for "Post Reply" in reply form
- **Benefits**: Consistent button styling for comment interactions

#### 3. `app/components/CommentThread.vue` (Comment Section)
- **Button Component**: Primary variant for "Post comment" form submission
- **Benefits**: Consistent styling for comment submission

#### 4. `app/components/EmailCaptureModal.vue` (Email Gate Modal)
- **Button Component**:
  - Primary variant for "Continue" submission
  - Tertiary variant for "Browse without saving"
- **Updated Modal Styling**: Simplified by delegating button styles to design system
- **Benefits**: Cleaner component code, consistent button styling

### Design System Showcase Page

A comprehensive showcase page (`app/pages/design-system.vue`) demonstrates all components:
- Typography system (Display, Headline, Title, Body, Label sizes)
- Button variants (primary, secondary, tertiary) with all sizes and states
- Form controls (Input component)
- Badge variants with examples
- Color palette display
- Card variations (basic, interactive, elevated)

Access at `/design-system` route (useful for developers and designers).

## Accessibility Features

All integrated components maintain or exceed WCAG AA standards:

- **Touch Targets**: All interactive elements maintain 44px minimum height
- **Color Contrast**:
  - Text on surface: 4.5:1+ ratio
  - Button text: 4.5:1+ ratio across variants
- **Keyboard Navigation**:
  - All buttons accessible via Tab
  - Focus-visible states clearly indicate focus
- **Focus Indicators**: 2px outline with 2px offset on all interactive elements
- **Semantic HTML**: Proper heading hierarchy (h1-h6), label associations, button types
- **Reduced Motion**: All animations respect `prefers-reduced-motion` media query
- **Form Accessibility**:
  - Input labels properly associated via `for` attribute
  - Error messages role="alert" for screen readers
  - Required fields marked with asterisk and aria-required

## Responsive Design

Components are optimized for three breakpoints:

- **Mobile (375px)**: Single-column layouts, stacked buttons
- **Tablet (768px)**: Two-column layouts, optimized spacing
- **Desktop (1024px+)**: Multi-column layouts, full spacing

All pages adapt seamlessly across these breakpoints.

## Color System Integration

The site uses a consistent color system:

| Color | Usage | Value |
|-------|-------|-------|
| Primary Teal | Main branding, primary actions | #006565 |
| Secondary Coral | Secondary actions, highlights | #fe7e4f |
| Tertiary Navy | Accents, supporting elements | #495b70 |
| Error Red | Error states, destructive actions | #ba1a1a |
| Surface | Page background | #f6faf9 |
| On Surface | Primary text | #181c1c |

Navigation uses primary teal background with on-primary white text.
Call-to-action buttons use secondary coral for contrast against teal backgrounds.

## Code Organization

```
app/
├── components/
│   ├── design-system/           # Design system components
│   │   ├── Button.vue          # Interactive button component
│   │   ├── Card.vue            # Container component
│   │   ├── Input.vue           # Form input component
│   │   ├── Badge.vue           # Status badge
│   │   ├── Hero.vue            # Page hero section
│   │   ├── Heading.vue         # Semantic headings
│   │   ├── Text.vue            # Text component
│   │   └── index.ts            # Barrel export
│   ├── IdeaCard.vue            # Uses Card + Text
│   ├── CommentItem.vue         # Uses Button
│   ├── CommentThread.vue       # Uses Button
│   ├── EmailCaptureModal.vue   # Uses Button
│   └── ...
├── pages/
│   ├── index.vue               # Uses Hero + Button
│   ├── ideas/create.vue        # Uses Button
│   ├── ideas/[id].vue          # Uses Button
│   ├── settings.vue            # Uses Button
│   └── design-system.vue       # Component showcase
└── ...

design-system/
├── design-tokens.css           # CSS custom properties
├── design-tokens.json          # Token definitions
├── tailwind-para-salvar.js     # Tailwind config
├── DESIGN-SYSTEM.md            # Design philosophy
├── COMPONENT-SPECS.md          # Component specifications
├── IMPLEMENTATION-GUIDE.md     # Integration guide
├── README.md                   # Quick start
└── COMPONENT-LIBRARY-INTEGRATION.md  # This file
```

## Development Guidelines

### Using Design System Components

Import from barrel export:
```typescript
import { Button, Card, Hero, Text } from '@/components/design-system'
```

### Button Variants
- `primary`: Main call-to-action (gradient teal background)
- `secondary`: Secondary action (coral background)
- `tertiary`: Tertiary/text action (transparent, outline only)

### Button Sizes
- `sm`: 36px height, compact padding
- `md`: 44px height, standard padding
- `lg`: 48px height, spacious padding

### Spacing and Layout
Use CSS custom properties for consistent spacing:
```css
/* 8px grid: spacing-1 through spacing-12+ */
padding: var(--spacing-4);  /* 32px */
gap: var(--spacing-3);      /* 24px */
```

### Typography
Use semantic components with size variants:
```vue
<Heading level="h1" size="display-lg">Large Title</Heading>
<Heading level="h2" size="headline-lg">Section Title</Heading>
<Text size="body-lg">Body text</Text>
<Text size="body-sm" secondary>Secondary text</Text>
```

## Benefits of Integration

1. **Consistency**: All pages and components use the same design system
2. **Maintainability**: Design changes update all components automatically
3. **Accessibility**: Built-in WCAG AA compliance across the site
4. **Performance**: Shared styles reduce CSS duplication
5. **Developer Experience**: Clear component API, well-documented patterns
6. **User Experience**: Professional, cohesive visual design
7. **Responsive**: Mobile-first responsive design works across all devices
8. **Branding**: Strong visual identity with teal/coral color scheme

## Future Enhancements

Potential improvements for future phases:

1. **Dark Mode**: Add dark theme variant to design system
2. **More Components**: Modal, Dropdown, Tabs, Toast notifications
3. **Animation Library**: Shared animation utilities and transitions
4. **Icon System**: SVG icon component with design system integration
5. **Form Validation**: Enhanced Input component with built-in validation
6. **Documentation Generator**: Auto-generate component docs from code
7. **Storybook Integration**: Interactive component documentation
8. **Design Tokens Export**: Generate tokens for other platforms (iOS, Android)

## Related Files

- Design System Documentation: `design-system/README.md`
- Component Specifications: `design-system/COMPONENT-SPECS.md`
- Implementation Guide: `design-system/IMPLEMENTATION-GUIDE.md`
- Design Tokens: `design-system/design-tokens.css`
- Component Showcase: `/design-system` route in app
