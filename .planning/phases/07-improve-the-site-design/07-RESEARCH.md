# Phase 7 Research: Improve the Site Design

**Project:** ParaSalvaraCuba Platform (v1.1)
**Phase Goal:** Enhance visual design with Stitch-generated components and refined UX
**Research Date:** March 29, 2026
**Overall Confidence:** HIGH

---

## Executive Summary

Phase 7 focuses on applying the newly created Stitch design system to transform the existing MVP's visual design. The research confirms:

1. **Design System Assets Ready:** Complete design tokens (CSS variables), component specifications, and Tailwind config created in Phase 5-6
2. **No Tailwind Currently Integrated:** Project uses inline scoped styles; needs Tailwind integration for scalability
3. **Existing Components Need Refactoring:** IdeaCard, VoteButton, CommentItem, EmailCaptureModal all have hardcoded styles that conflict with design system
4. **Quick Wins Available:** Homepage and create form are high-impact; can be redesigned in parallel
5. **Logo/Branding Assets Missing:** Design system generated specs but visual assets (logo, colors) need integration
6. **Mobile-First Approach Essential:** Touch targets (44px+), responsive typography already specified in design system
7. **Design Token Integration Path Clear:** Can be done incrementally without breaking existing functionality

**Key Finding:** Phase 7 success depends less on new development and more on **systematic refactoring** of existing components to use design tokens instead of hardcoded values.

---

## 1. Stitch Integration Strategy

### Current State Analysis

**What Exists:**
- `/design-system/design-tokens.css` - Complete CSS variables (colors, spacing, typography, shadows)
- `/design-system/design-tokens.json` - Machine-readable token definitions
- `/design-system/tailwind-para-salvar.js` - Tailwind theme extension with all tokens
- `/design-system/IMPLEMENTATION-GUIDE.md` - Step-by-step integration instructions
- `/design-system/COMPONENT-SPECS.md` - Detailed component patterns (Button, Card, Input, Badge)

**What's Missing:**
- Tailwind CSS integration in `nuxt.config.ts` (module not installed)
- Tailwind module in `package.json` dependencies
- Global CSS file importing design tokens
- PostCSS/CSS processing configuration
- Logo assets (referenced in design system but not present)

### Integration Approach: Phase-Based Rollout

**Phase 7a: Foundation (Days 1-2)**
1. Install Tailwind CSS module (`@nuxtjs/tailwindcss`)
2. Create `/app/assets/css/main.css` with design tokens import
3. Update `nuxt.config.ts` to:
   - Load design tokens CSS globally
   - Extend Tailwind theme with `tailwind-para-salvar.js`
   - Configure Google Fonts (Manrope, Inter)
4. Verify tokens are accessible via CSS variables and Tailwind classes

**Phase 7b: Component Refactoring (Days 3-7)**
1. Refactor existing components one-by-one to use design tokens
2. Order: Button → Card → Input → VoteButton → IdeaCard → CommentItem
3. Each component refactor includes scoped style updates + Tailwind class additions
4. Use **design tokens ONLY**, no hardcoded hex values

**Phase 7c: Page Redesigns (Days 8-14)**
1. Homepage hero section - implement "Share Your Idea" prominence
2. Create Idea page - refined form styling with input components
3. Detail page - enhanced card layout with design system spacing
4. Settings page - cleaner typography hierarchy

### Design Tokens Integration Checklist

**CSS Variables (Already Available):**
- ✅ Color palette (primary: #006565, secondary: #a43c12, tertiary: #495b70, error, surface layers)
- ✅ Typography (Manrope for headlines, Inter for body; sizes from display-lg to label-sm)
- ✅ Spacing (8px grid: --spacing-1 through --spacing-20)
- ✅ Shadows (elevation-1 through elevation-5, cta-primary, cta-hover)
- ✅ Border radius (--radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full)
- ✅ Transitions (--transition-fast, --transition-normal, --transition-slow)
- ✅ Z-index scale

**Tailwind Extension (Already Available):**
```javascript
// From design-system/tailwind-para-salvar.js
extend: {
  colors: {
    primary, secondary, tertiary, error, surface (all variants),
    outline, inverse
  },
  spacing: { ... },
  fontSize: { ... },
  fontFamily: { headline: 'Manrope', body: 'Inter' },
  borderRadius: { ... },
  boxShadow: { ... },
  transitionDuration: { ... }
}
```

**Files to Create/Modify:**
```
/app/assets/css/main.css          ← NEW: Import tokens, global styles
/nuxt.config.ts                   ← MODIFY: Add Tailwind, load fonts
/package.json                      ← MODIFY: Add @nuxtjs/tailwindcss
/app/components/Button.vue        ← REFACTOR: Use design tokens
/app/components/Card.vue          ← REFACTOR: (if exists) or CREATE
/app/components/Input.vue         ← REFACTOR: (if exists) or CREATE
/app/components/Badge.vue         ← NEW: Small component for votes/tags
/app/pages/index.vue              ← REFACTOR: Hero section, IdeaCard grid
/app/pages/ideas/create.vue       ← REFACTOR: Form styling
/app/pages/ideas/[id].vue         ← REFACTOR: Detail page layout
```

---

## 2. Component Implementation Priority Matrix

### Quick Wins (High Impact, Low Effort)

| Component | Current State | Effort | Impact | Priority | Notes |
|-----------|---------------|--------|--------|----------|-------|
| **Button (Primary)** | Hardcoded styles | 2hrs | HIGH | 🔴 P0 | Powers "Share Your Idea" CTA; used everywhere |
| **Badge/Vote Count** | Plain text spans | 3hrs | HIGH | 🔴 P0 | Visual polish on vote numbers; improves scannability |
| **IdeaCard** | Basic styling | 4hrs | HIGH | 🔴 P0 | Homepage component; highest visibility |
| **Input Field** | Generic styling | 2hrs | MEDIUM | 🟡 P1 | Create/edit forms; currently unstyled |
| **VoteButton** | Inline styles | 2hrs | MEDIUM | 🟡 P1 | Affects idea detail page |

### Medium Effort (Moderate Impact)

| Component | Current State | Effort | Impact | Priority | Notes |
|-----------|---------------|--------|--------|----------|-------|
| **CommentItem** | Basic div structure | 4hrs | MEDIUM | 🟡 P1 | Detail page; nested replies |
| **Form Wrapper** | No component | 3hrs | MEDIUM | 🟡 P1 | Used in create/edit flows |
| **Modal (EmailCapture)** | Custom styling | 3hrs | MEDIUM | 🟡 P1 | First-time user flow; improved UX |
| **Card Container** | No design system card | 2hrs | MEDIUM | 🟡 P1 | Can improve multiple layouts |

### High Effort (Strategic)

| Component | Current State | Effort | Impact | Priority | Notes |
|-----------|---------------|--------|--------|----------|-------|
| **Navigation** | Hardcoded #1e3a5f | 3hrs | HIGH | 🔴 P0 | Sticky header; brand presence |
| **Typography System** | Mixed sizes | 4hrs | MEDIUM | 🟡 P1 | Improve hierarchy across pages |
| **Hero Section** | None exists | 6hrs | HIGH | 🔴 P0 | Homepage redesign; engage visitors |
| **Responsive Layout** | Minimal breakpoints | 5hrs | MEDIUM | 🟡 P1 | Mobile experience critical |

### Recommended Sequence (Phase 7 Execution Order)

**Week 1 (Foundation):**
1. Install Tailwind, import design tokens
2. Implement Button (primary, secondary, tertiary)
3. Implement Badge component
4. Update Navigation bar styling
5. Test responsive on mobile

**Week 2 (Core Components):**
1. Refactor IdeaCard with design tokens
2. Create/refactor Input component
3. Create/refactor Card wrapper
4. Refactor VoteButton with design tokens
5. Update EmailCaptureModal

**Week 3 (Page Redesigns):**
1. Redesign homepage with hero section + IdeaCard grid
2. Enhance create/edit forms with new Input styling
3. Detail page layout improvements
4. Settings page polish
5. Mobile testing on actual devices

---

## 3. Visual Design Implementation Path

### 3.1 Homepage Hero Section

**Current State:**
```vue
<!-- app/pages/index.vue - Current simple layout -->
<h1>{{ $t('home.title') }}</h1>
<p class="subtitle">{{ $t('home.subtitle') }}</p>
<div class="ideas-list"><!-- IdeaCards --></div>
```

**Design System Hero Pattern:**
- **Background:** Gradient from primary (#006565) to primary-container (#008080)
- **Heading:** Display-lg (3.5rem, Manrope, bold)
- **Subheading:** Title-lg (1.375rem, Inter, regular)
- **CTA Button:** Primary button (gradient shadow, hover lift effect)
- **Spacing:** spacing-24 (96px) top/bottom for breathing room
- **Mobile:** Stack vertically, scale heading to headline-lg (2rem)

**Stitch-Recommended Pattern:**
```vue
<section class="hero">
  <div class="hero-content">
    <h1 class="text-display-lg font-bold text-white">
      {{ $t('home.title') }}
    </h1>
    <p class="text-title-lg text-on-primary mt-6">
      {{ $t('home.subtitle') }}
    </p>
    <div class="mt-12 flex gap-4">
      <Button variant="primary" size="lg">
        {{ $t('nav.newIdea') }}
      </Button>
      <Button variant="secondary" size="lg">
        {{ $t('home.learnMore') }}
      </Button>
    </div>
  </div>
</section>

<section class="ideas-grid">
  <!-- IdeaCard x N -->
</section>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  padding: var(--spacing-24) var(--spacing-4);
  text-align: center;
  color: var(--color-on-primary);
}

@media (max-width: 768px) {
  .hero { padding: var(--spacing-16) var(--spacing-4); }
  h1 { font-size: var(--font-size-headline-lg); }
}

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-6);
  padding: var(--spacing-12) var(--spacing-4);
}
</style>
```

**Success Criteria:**
- Hero section visually distinct from content
- "Share Your Idea" button highly prominent and accessible (44px+ tap target)
- Gradient background matches brand colors exactly
- Typography hierarchy clear on desktop (Display-lg → Title-lg)
- Mobile layout responsive without horizontal scroll
- Load time <3s (no hero image bloat)

### 3.2 Color Palette Application

**Implementation Strategy: Gradual Rollout**

**Stage 1 - Navigation & CTAs (Immediate Impact)**
```vue
<!-- Old -->
<nav style="background: #1e3a5f;">
  <button style="background: #2563eb;">Share Your Idea</button>
</nav>

<!-- New -->
<nav :style="{ background: 'var(--color-surface-container)' }">
  <Button variant="primary">Share Your Idea</Button>
</nav>
```

**Stage 2 - Cards & Containers (Content Areas)**
```vue
<!-- Old IdeaCard -->
<div style="border-bottom: 1px solid #e5e7eb;">
  <h3 style="color: #1e3a5f;">{{ idea.title }}</h3>
  <p style="color: #6b7280;">{{ idea.meta }}</p>
</div>

<!-- New IdeaCard with design system -->
<Card interactive>
  <h3 class="text-title-md font-semibold text-on-surface">
    {{ idea.title }}
  </h3>
  <p class="text-body-md text-on-surface-variant">
    {{ idea.meta }}
  </p>
</Card>
```

**Stage 3 - Forms & Inputs (User Engagement)**
- Replace all `<input>` with `<Input>` component
- Apply focus states with primary color
- Error states with error color (#ba1a1a)
- Success states with appropriate feedback color

**Stage 4 - Text & Typography (Hierarchy)**
- Replace hardcoded font-sizes with design tokens
- Apply line-height tokens (tight: 1.2, normal: 1.5, relaxed: 1.75)
- Use Manrope (#font-display) for headlines, Inter (#font-body) for body

**Color Token Mapping (No More Hardcoded Hex):**
```
OLD               →  NEW (Design Token)
#1e3a5f           →  var(--color-tertiary)
#006565           →  var(--color-primary)
#a43c12           →  var(--color-secondary)
#2563eb           →  N/A - primary gradient
#6b7280           →  var(--color-on-surface-variant)
#e5e7eb           →  var(--color-outline-variant)
#dc2626           →  var(--color-error)
#ffffff           →  var(--color-surface-container-lowest)
#f3f4f6           →  var(--color-surface-container-low)
```

**Key Rule:** Never use hardcoded hex values. Use CSS variables exclusively.

### 3.3 Logo & Brand Asset Integration

**Current State:**
- No logo currently rendered on site
- Brand name "ParaSalvaraCuba" in text only
- Design system created logo specs but assets not present

**Implementation Plan:**

**Option A: Text Logo (Recommended for MVP)**
```vue
<!-- app/components/Logo.vue -->
<template>
  <div class="logo">
    <h1 class="text-headline-lg font-bold">
      Para Salvar <span class="text-primary">A Cuba</span>
    </h1>
  </div>
</template>

<style scoped>
.logo {
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}
.text-primary {
  color: var(--color-primary);
}
</style>
```

**Option B: Icon + Text (Future)**
- Design system references icon (from Stitch)
- Placeholder: Use `<Icon name="heart-cuba" />` if Nuxt Icon module installed
- Install `@nuxt/icon` for runtime SVG support

**Option C: Full Logo Graphic (Phase 8+)**
- Stitch can generate SVG logo
- Add `/public/logo.svg`
- Import in navigation component

**Recommended for Phase 7: Option A (Text Logo)**
- Fast to implement
- Matches design system typography
- Works on all devices without image loading concerns
- Easy to test/iterate

**Brand Consistency Rules:**
- Logo always uses primary color (#006565) accent
- Never scale logo below 40px height (mobile)
- Always maintain padding around logo (spacing-4 minimum)
- Use logo on homepage hero section prominently

---

## 4. UX Flow Improvements

### 4.1 "Share Your Idea" Button Prominence

**Current Implementation:**
```vue
<!-- Scattered across pages -->
<nav-link>+ Nueva idea</nav-link>  <!-- Small, text only -->
```

**Design System Strategy:**

**Placement 1: Navigation Bar (Always Visible)**
```vue
<!-- app/components/Navigation.vue - NEW -->
<nav class="nav-sticky">
  <Logo />
  <div class="nav-actions">
    <Button
      variant="primary"
      size="md"
      icon="plus"
      @click="navigateTo('/ideas/create')"
    >
      {{ $t('nav.newIdea') }}
    </Button>
    <LanguageSwitcher />
  </div>
</nav>

<style scoped>
.nav-sticky {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-elevation-1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
}

@media (max-width: 768px) {
  /* On mobile, make button full width or place as floating action button */
  .nav-actions { width: 100%; }
}
</style>
```

**Placement 2: Homepage Hero (Primary CTA)**
```vue
<!-- Already shown in hero section above -->
<Button variant="primary" size="lg">
  {{ $t('nav.newIdea') }}
</Button>
```

**Placement 3: Floating Action Button (Mobile)**
```vue
<!-- app/components/FloatingActionButton.vue - NEW (Mobile Only) -->
<template>
  <button
    v-if="isMobile"
    class="fab"
    @click="navigateTo('/ideas/create')"
    aria-label="Share your idea"
  >
    <Icon name="plus" class="w-6 h-6" />
  </button>
</template>

<style scoped>
.fab {
  position: fixed;
  bottom: var(--spacing-6);
  right: var(--spacing-6);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  color: var(--color-on-primary);
  box-shadow: var(--shadow-elevation-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  z-index: 40;
}

.fab:hover {
  box-shadow: var(--shadow-elevation-4);
  transform: scale(1.1);
}

.fab:active {
  transform: scale(0.95);
}

@media (min-width: 768px) {
  .fab { display: none; }
}
</style>
```

**Implementation Checklist:**
- ✅ Navigation button: Always visible, primary color, icon + text
- ✅ Hero button: Large, prominent, in gradient hero section
- ✅ Mobile FAB: Floating action button at bottom-right (56px+ touch target)
- ✅ All buttons: Accessible (aria-label, min 44px, focus-visible states)
- ✅ Hover/active states: Smooth transitions, visual feedback

### 4.2 Contribution Encouragement Patterns

**Design Patterns for Engagement:**

**Pattern 1: Empty State Hero**
```vue
<!-- When ideas.length === 0 -->
<section class="empty-state">
  <Icon name="lightbulb" class="w-20 h-20 text-primary" />
  <h2>{{ $t('home.empty') }}</h2>
  <p>{{ $t('home.emptySubtext') }}</p>
  <Button variant="primary" size="lg">
    {{ $t('nav.newIdea') }}
  </Button>
</section>

<style scoped>
.empty-state {
  text-align: center;
  padding: var(--spacing-24) var(--spacing-4);
  background: var(--color-surface-container-low);
  border-radius: var(--radius-xl);
}
</style>
```

**Pattern 2: Comment Encouragement**
```vue
<!-- On detail page, after comments section -->
<section class="comment-cta">
  <h3>{{ $t('comments.addYours') }}</h3>
  <p>{{ $t('comments.yourVoiceMatters') }}</p>
  <Button variant="secondary">
    {{ $t('comments.post') }}
  </Button>
</section>
```

**Pattern 3: Vote Prominence**
```vue
<!-- IdeaCard - make votes more visually prominent -->
<div class="idea-meta">
  <Badge icon="arrow-up" variant="positive">
    {{ idea.net_votes }}
  </Badge>
  <Badge icon="message-circle">
    {{ idea.comment_count }}
  </Badge>
</div>

<style scoped>
.idea-meta {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}
</style>
```

**Pattern 4: Success Feedback After Action**
```vue
<!-- After idea/comment submission -->
<Toast
  type="success"
  :message="$t('create.successMessage')"
  icon="check-circle"
/>
```

**UX Flow Improvements Summary:**
- Larger, more visible CTAs throughout
- Emotional messaging ("Your voice matters")
- Visual hierarchy emphasizes participation
- Quick win feedback (toast notifications)
- Mobile-optimized touch targets

### 4.3 Mobile Experience Design

**Current State:**
- Mobile viewport tag missing
- No responsive images
- Form fields not optimized for touch
- Navigation collapses but poorly

**Mobile-First Improvements:**

**Viewport & Touch:**
```html
<!-- Add to app.vue or nuxt.config -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="var(--color-primary)" />
```

**Typography Scaling:**
```css
/* Mobile-first scaling */
h1 {
  font-size: var(--font-size-headline-md); /* 1.75rem on mobile */
}

@media (min-width: 768px) {
  h1 {
    font-size: var(--font-size-display-sm); /* 2.25rem on tablet+ */
  }
}
```

**Touch Target Standards:**
- All buttons: Min 44×44px (from design tokens: spacing-11)
- Form inputs: Min 44px height
- Vote buttons: Larger hit area (56px×56px)
- Links: Min 44px height with padding

**Mobile Navigation Pattern:**
```vue
<!-- Option 1: Hamburger Menu (if needed) -->
<nav class="nav-mobile">
  <Logo />
  <button @click="toggleMenu" aria-label="Toggle menu">
    <Icon name="menu" />
  </button>
  <div v-if="menuOpen" class="nav-menu">
    <Button variant="primary" full-width>
      {{ $t('nav.newIdea') }}
    </Button>
    <LanguageSwitcher />
  </div>
</nav>

<!-- Option 2: Bottom Navigation (Recommended for single-page feel) -->
<nav class="nav-bottom">
  <NavItem icon="home" label="Feed" active />
  <NavItem icon="plus" label="Share" />
  <NavItem icon="settings" label="Settings" />
</nav>
```

**Mobile Form Optimization:**
```vue
<!-- app/components/Input.vue mobile adaptation -->
<template>
  <input
    class="input-field"
    @focus="focused = true"
    @blur="focused = false"
    :style="{
      fontSize: 'max(16px, 1rem)', /* Prevents iOS zoom */
      paddingTop: 'var(--spacing-4)', /* Larger for touch */
    }"
  />
</template>
```

**Mobile Screen Breakpoints:**
```css
/* Design system responsive sizes */
@media (max-width: 640px) {
  /* iPhone SE, small phones: Single column, large touch targets */
}

@media (min-width: 641px) and (max-width: 768px) {
  /* Tablets in portrait: Two columns, optimized spacing */
}

@media (min-width: 769px) {
  /* Desktop+: Full grid layouts */
}
```

---

## 5. Migration Strategy

### 5.1 Refactoring vs. Parallel Design

**Recommended Approach: Incremental Refactoring**

**Why NOT parallel design:**
- Creates duplicate maintenance burden
- Confuses users if they switch between versions
- Harder to manage translations (UI text changes)
- More complex testing

**Why incremental refactoring:**
- Users see gradual polish (better perception)
- Easy to rollback individual components
- Less risk of breaking existing functionality
- Can ship improvements weekly

**Refactoring Process (Per Component):**

1. **Document Current Behavior**
   - Screenshot current state
   - List props, events, slots
   - Note any edge cases (empty state, error, loading)

2. **Create New Version**
   - Copy existing component
   - Update inline styles → design tokens
   - Add/remove class attributes for Tailwind
   - Keep props/events identical

3. **Test in Isolation**
   - Vitest unit tests for props
   - Visual regression tests (screenshot)
   - Responsive tests (mobile, tablet, desktop)

4. **Integrate Incrementally**
   - Update one page/section at a time
   - Run smoke tests after each page
   - Monitor for console warnings

5. **Clean Up**
   - Remove old inline styles
   - Update documentation
   - Add component to style guide

**Example: Refactoring IdeaCard**

```vue
<!-- OLD - /app/components/IdeaCard.vue (Current) -->
<template>
  <div class="idea-card">
    <div class="idea-votes">
      <VoteButton ... />
    </div>
    <div class="idea-body">
      <h3 class="idea-title">{{ idea.title }}</h3>
      <p class="idea-meta">{{ idea.email }} · {{ date }}</p>
    </div>
  </div>
</template>

<style scoped>
.idea-card {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.idea-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e3a5f;
}

.idea-meta {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0.25rem 0 0;
}
</style>

<!-- NEW - /app/components/IdeaCard.vue (Refactored) -->
<template>
  <Card interactive @click="navigateTo">
    <div class="flex items-start gap-4">
      <!-- Vote button on left -->
      <VoteButton :idea-id="idea.id" @voted="onVoted" />

      <!-- Content on right -->
      <div class="flex-1">
        <h3 class="text-title-md font-semibold text-on-surface">
          {{ idea.title }}
        </h3>
        <p class="text-body-sm text-on-surface-variant mt-2">
          {{ idea.email }} · {{ formatDate(idea.created_at) }}
        </p>

        <!-- Meta stats -->
        <div class="mt-4 flex gap-4 text-body-sm text-on-surface-variant">
          <Badge icon="arrow-up" :count="idea.net_votes" />
          <Badge icon="message-circle" :count="idea.comment_count" />
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
/* No scoped styles needed - uses design tokens via Tailwind classes */
</style>
```

### 5.2 Feature Parity Maintenance

**Tracking Changes During Migration:**

```markdown
## Component Migration Checklist

### IdeaCard
- [x] Props preserved (idea, @voted)
- [x] Visual appearance matches design system
- [x] Mobile responsive (44px tap target)
- [x] Hover effects work (elevation lift)
- [x] Accessibility: Keyboard nav, screen reader friendly
- [x] Tests pass (unit + visual regression)
- [x] Performance: No layout shift
- [ ] Deployed to production
- [ ] Monitored for errors (1 week)

### VoteButton
- [ ] Props preserved
- [ ] ...
```

**Integration Testing Checklist (Per Page):**

```markdown
## Homepage Integration Test

### Visual
- [x] Hero section renders correctly
- [x] IdeaCard grid displays all items
- [x] Load more button works
- [x] Responsive: 375px, 768px, 1024px

### Functional
- [x] Click "Share Your Idea" → creates idea
- [x] Vote works on ideas
- [x] Click idea → navigates to detail
- [x] Language switcher works

### Accessibility
- [x] Tab order makes sense
- [x] All buttons have aria-labels
- [x] Color contrast passes (4.5:1)
- [x] No keyboard traps

### Performance
- [x] First Contentful Paint < 2s
- [x] Lighthouse score > 90
- [x] No console errors
```

### 5.3 Testing Strategy for Visual Changes

**Visual Regression Testing:**

1. **Screenshot Comparison (Before/After)**
   ```bash
   # Use Playwright or similar
   npx playwright test --update-snapshots
   ```

2. **Responsive Testing Breakpoints**
   - 375px (iPhone SE)
   - 540px (Small Android)
   - 768px (iPad)
   - 1024px (Tablet/Small Desktop)
   - 1440px (Desktop)

3. **Browser Compatibility**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (iOS + macOS)
   - Edge (latest)

4. **Performance Monitoring**
   - Lighthouse CI (target: >90)
   - Core Web Vitals (LCP, FID, CLS)
   - Bundle size tracking

5. **Accessibility Tests**
   - WAVE browser extension
   - axe DevTools
   - Manual keyboard navigation
   - Screen reader (VoiceOver, NVDA)

**Test File Structure:**
```
/tests
├── visual
│   ├── pages.spec.ts        # Page-level screenshots
│   └── components.spec.ts    # Component screenshots
├── a11y
│   ├── accessibility.spec.ts  # Color contrast, WCAG AA
│   └── keyboard.spec.ts       # Tab order, focus states
└── integration
    └── flows.spec.ts          # User journeys (create → vote → comment)
```

---

## 6. Risk & Mitigation

### Risk 1: Breaking Existing Functionality

**Risk:** Refactoring components introduces bugs that break user flows

**Mitigation:**
- Each component change isolated to a feature branch
- Smoke tests run before each integration
- Existing tests remain passing (no regression)
- Feature flags if needed (e.g., `useNewDesign()`)
- Rollback plan: Keep old components in `/legacy` folder temporarily

### Risk 2: Design Token Values Conflict

**Risk:** CSS variable names or values clash with existing inline styles

**Mitigation:**
- CSS scoping: Use `:deep()` only for third-party component styles
- Audit all hardcoded colors BEFORE integration
- Document any overrides needed
- Test in browser DevTools (inspect computed styles)

### Risk 3: Tailwind Size & Performance

**Risk:** Tailwind CSS adds bloat; site becomes slower

**Mitigation:**
- PurgeCSS enabled by default in Nuxt
- Monitor bundle size: `npm run build --analyze`
- Use `tree-shaking` for unused tokens
- Goal: < 50KB gzipped for CSS
- Lazy-load non-critical CSS if needed

### Risk 4: Mobile Responsiveness Issues

**Risk:** Design looks good on desktop but breaks on mobile

**Mitigation:**
- Mobile-first development (code mobile styles first)
- Test on actual devices (not just DevTools)
- Use responsive typography tokens
- Validate touch targets (44px+)
- Monitor mobile Lighthouse score

### Risk 5: i18n Complexity

**Risk:** Design changes require new translation strings

**Mitigation:**
- Minimize new UI text in Phase 7
- Reuse existing translations where possible
- Document any new keys needed
- Test all 3 languages (EN, ES, PT)
- Use `$t()` keys consistently

### Risk 6: Accessibility Regression

**Risk:** New design introduces accessibility issues

**Mitigation:**
- WAVE testing on all pages
- axe DevTools audit before deployment
- Keyboard navigation manual testing
- Screen reader testing (VoiceOver)
- Maintain WCAG AA contrast (4.5:1 for text)
- Color contrast checker for all color combinations

**Risk Mitigation Summary Table:**

| Risk | Severity | Mitigation | Owner | Timeline |
|------|----------|-----------|-------|----------|
| Breaking functionality | HIGH | Feature branches + smoke tests | Dev | Ongoing |
| CSS conflicts | MEDIUM | Scoping audit + DevTools | Dev | Day 1 |
| Performance bloat | MEDIUM | Bundle analysis + purging | Dev | Day 2 |
| Mobile issues | HIGH | Device testing + Lighthouse | QA | Ongoing |
| i18n problems | LOW | Reuse strings + test all langs | Dev | Ongoing |
| A11y regression | HIGH | WAVE + axe + manual testing | QA | Weekly |

---

## 7. Dependencies & Prerequisites

### Phase 5/6 Outputs (Must Be Complete)

- ✅ `design-system/design-tokens.css` (present)
- ✅ `design-system/design-tokens.json` (present)
- ✅ `design-system/tailwind-para-salvar.js` (present)
- ✅ `design-system/IMPLEMENTATION-GUIDE.md` (present)
- ✅ `design-system/COMPONENT-SPECS.md` (present)
- ✅ `design-system/DESIGN-SYSTEM.md` (present)

### New Dependencies to Install

```json
{
  "dependencies": {
    "@nuxtjs/tailwindcss": "^6.10.0",
    "@nuxtjs/google-fonts": "^3.0.0"
  }
}
```

### Nuxt Configuration Changes

**`nuxt.config.ts` Updates:**
```typescript
export default defineNuxtConfig({
  // Existing config...

  // ADD:
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',      // NEW
    '@nuxtjs/google-fonts',     // NEW
  ],

  css: [
    '~/design-system/design-tokens.css',  // NEW: Global tokens
  ],

  tailwindcss: {
    config: {
      theme: {
        extend: require('./design-system/tailwind-para-salvar.js').extend,
      },
      plugins: require('./design-system/tailwind-para-salvar.js').plugins,
    },
  },

  googleFonts: {
    families: {
      Manrope: [400, 600, 700],  // Headlines
      Inter: [400, 500, 600, 700], // Body
    },
    display: 'swap',  // System fonts while loading
  },
})
```

### Existing Technologies in Use

- ✅ Nuxt 4.4.2 (Vue 3)
- ✅ TypeScript
- ✅ Pinia (state)
- ✅ @nuxtjs/i18n (translations)
- ✅ DOMPurify (XSS protection)
- ✅ Marked.js (Markdown)
- ✅ Vitest (testing)

---

## 8. Success Criteria & Definition of Done

### Phase 7 Completion Checklist

**Design System Integration:**
- [ ] Tailwind CSS installed and configured
- [ ] Design tokens CSS loaded globally
- [ ] Google Fonts (Manrope, Inter) loading successfully
- [ ] No console errors related to tokens/fonts

**Component Library:**
- [ ] Button component (primary, secondary, tertiary) - 100% tests passing
- [ ] Card component - created and tested
- [ ] Input component - created and tested
- [ ] Badge component - created and tested
- [ ] All components use design tokens ONLY (no hardcoded colors)

**Page Redesigns:**
- [ ] Homepage hero section implemented (gradient, typography, CTA)
- [ ] IdeaCard refactored and tested
- [ ] Create/edit forms styled with Input components
- [ ] Detail page layout improved with Cards
- [ ] Navigation bar using design system colors

**Visual Design Quality:**
- [ ] Lighthouse score > 90 (desktop + mobile)
- [ ] Color contrast passes WCAG AA (4.5:1 minimum)
- [ ] All buttons/interactive elements 44×44px minimum
- [ ] Typography hierarchy consistent across pages
- [ ] Responsive on 375px, 768px, 1024px breakpoints

**Testing:**
- [ ] All existing tests still passing (no regression)
- [ ] New components have >80% test coverage
- [ ] Visual regression tests created (before/after)
- [ ] Accessibility audit (WAVE, axe) passes
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

**Mobile Experience:**
- [ ] FAB or prominent mobile CTA present
- [ ] Forms optimized for touch (no iOS zoom issues)
- [ ] Navigation responsive and accessible on small screens
- [ ] Performance good on 4G networks (Lighthouse mobile > 85)

**Documentation:**
- [ ] Component usage guide created
- [ ] Design system integration guide updated
- [ ] New component props documented
- [ ] Deployment checklist completed

**User Acceptance:**
- [ ] Internal review (visual quality, usability)
- [ ] Stakeholder approval (design, product)
- [ ] Ready for public launch

---

## 9. Implementation Files & Locations

### New Files to Create

```
/app/assets/css/
├── main.css                 ← Global styles + token imports
└── variables.css            ← (Optional) Additional CSS variables

/app/components/
├── Button.vue               ← New design system button
├── Card.vue                 ← New card container
├── Input.vue                ← New form input
├── Badge.vue                ← New vote/count badge
├── Logo.vue                 ← NEW brand logo component
├── Navigation.vue           ← NEW sticky header
└── FloatingActionButton.vue ← NEW mobile FAB

/app/pages/
├── index.vue                ← REFACTOR: Hero + grid layout
├── ideas/create.vue         ← REFACTOR: Form styling
├── ideas/[id].vue           ← REFACTOR: Detail page
└── settings.vue             ← REFACTOR: Typography
```

### Files to Modify

```
/nuxt.config.ts             ← Add Tailwind, fonts, CSS import
/package.json               ← Add @nuxtjs/tailwindcss
/design-system/             ← (No changes needed - already complete)
```

### Files to Keep (No Changes)

```
/design-system/design-tokens.css
/design-system/design-tokens.json
/design-system/tailwind-para-salvar.js
/design-system/*.md
/app/stores/
/app/composables/
/server/api/
/server/middleware/
/tests/
```

---

## 10. Quick Reference: Key Design System Values

### Colors (CSS Variables)
```css
--color-primary: #006565           /* Teal - Trust */
--color-secondary: #a43c12         /* Coral - Action */
--color-tertiary: #495b70          /* Navy - Wisdom */
--color-error: #ba1a1a             /* Red - Errors */
--color-surface: #f6faf9           /* Base background */
--color-on-surface: #181c1c        /* Dark text */
--color-on-surface-variant: #3e4949 /* Lighter text */
```

### Typography (CSS Variables)
```css
--font-headline: 'Manrope'          /* Headlines */
--font-body: 'Inter'                /* Body text */
--font-size-headline-lg: 2rem       /* Page titles */
--font-size-title-md: 1.25rem       /* Card titles */
--font-size-body-lg: 1rem           /* Main content */
--font-weight-semi-bold: 600        /* Medium text */
--font-weight-bold: 700             /* Bold headings */
--line-height-normal: 1.5           /* Default line height */
```

### Spacing (8px Grid - CSS Variables)
```css
--spacing-2: 0.5rem (8px)           /* Small padding */
--spacing-4: 1rem (16px)            /* Standard padding */
--spacing-6: 1.5rem (24px)          /* Card padding */
--spacing-8: 2rem (32px)            /* Large spacing */
--spacing-12: 3rem (48px)           /* Sections */
--spacing-24: 6rem (96px)           /* Hero section */
```

### Shadows (Elevation - CSS Variables)
```css
--shadow-elevation-1: 0 1px 3px rgba(0,0,0,0.12)
--shadow-cta-primary: 0 15px 30px rgba(0,101,101,0.15)
--shadow-cta-primary-hover: 0 20px 40px rgba(0,101,101,0.25)
```

### Border Radius (CSS Variables)
```css
--radius-md: 0.5rem                 /* 8px - form fields */
--radius-lg: 1rem                   /* 16px - buttons */
--radius-xl: 1.5rem                 /* 24px - cards */
--radius-full: 9999px               /* Circles */
```

---

## Conclusion

Phase 7 is a **design-focused refactoring phase** that transforms the MVP's visual appearance using the comprehensive Stitch design system created in Phases 5-6. The research confirms:

1. **Foundation Ready:** All design tokens, components specs, and Tailwind config complete
2. **Integration Path Clear:** Incremental approach minimizes risk
3. **High Impact:** Homepage hero, navigation, and component styling have immediate visual payoff
4. **Mobile-First:** Design system built with mobile accessibility (44px+ targets, responsive)
5. **Maintainable:** CSS variables eliminate technical debt of hardcoded colors

**Timeline Estimate:** 10-14 days for full implementation (foundation + components + pages)

**Success Indicator:** Site appears modern, cohesive, and accessible; Lighthouse score >90; WCAG AA compliance; responsive across all devices.

---

**Research Completed:** 2026-03-29
**Next Step:** Planning phase (Phase 7 PLAN.md)
