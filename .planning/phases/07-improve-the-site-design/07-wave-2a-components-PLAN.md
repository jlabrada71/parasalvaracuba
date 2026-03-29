---
wave: 2
phase: 7
depends_on:
  - 07-wave-1-foundation-PLAN.md
files_modified:
  - app/components/IdeaCard.vue
  - app/components/LanguageSwitcher.vue
  - app/pages/index.vue
  - app/pages/ideas/create.vue
  - app/pages/ideas/[id].vue
autonomous: true
---

# Plan 2: Core Components Refactoring

**Wave 2 Execution Note:**

This wave has 9 tasks split across 2 plans (2a and 2b). While within limits, use this
sequence to reduce risk:

1. Execute `07-wave-2a-components` fully (5 tasks, 3–4 hours):
   - Button → Badge → Input → Card → Navigation (in order)
   - Verify each component works in isolation before moving to the next

2. Smoke test: Apply a few refactored components to `index.vue`, verify rendering in the browser

3. Execute `07-wave-2b-interactions` (4 tasks, 2–3 hours):
   - VoteButton, CommentItem, Modal — these depend on Button/Card styles from 2a

This sequence prevents a broken component in 2a from blocking the 2b refactors.

---

**Goal:** Refactor Button, Badge, Input, Card, and Navigation components to use the Para Salvar design tokens and achieve visual consistency across the application.

**Success Criteria:**
- All interactive elements meet the 44px minimum touch target requirement
- Color tokens from `design-tokens.css` replace all hardcoded hex values in refactored components
- Navigation uses teal primary color (`#006565`) instead of navy (`#1e3a5f`)
- IdeaCard uses card elevation and design-system typography
- All buttons have focus-visible outlines for keyboard navigation
- No hardcoded `#2563eb` (blue) remains in any refactored component
- WCAG AA contrast maintained: primary text on white background ≥ 4.5:1

---

## Tasks

<task id="7-101">
  <title>Refactor the Navigation bar on index.vue to use design tokens</title>
  <description>
    The navigation on `app/pages/index.vue` currently uses `background: #1e3a5f` (hardcoded navy).
    Replace with the design system teal primary and glassmorphism pattern.

    Current nav styles (lines 100–118 in index.vue):
    ```css
    .home-page { font-family: system-ui, sans-serif; }
    .nav {
      background: #1e3a5f;
      color: white;
      ...
    }
    .btn-primary { background: #2563eb; ... }
    ```

    Replace `<style scoped>` nav section with:
    ```css
    .home-page {
      font-family: var(--font-body);
      background-color: var(--color-background);
      color: var(--color-on-surface);
      min-height: 100vh;
    }
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-4) var(--spacing-8);
      background: var(--color-primary);
      color: var(--color-on-primary);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-elevation-2);
    }
    .nav-brand {
      font-family: var(--font-display);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-title-md);
      letter-spacing: var(--letter-spacing-xs);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
    }
    .nav-link {
      color: var(--color-on-primary);
      text-decoration: none;
      font-size: var(--font-size-body-md);
      opacity: 0.85;
      transition: opacity var(--transition-fast);
    }
    .nav-link:hover { opacity: 1; }
    /* Primary CTA button in nav - uses secondary coral for contrast on teal bg */
    .btn-nav-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: var(--spacing-3) var(--spacing-6);
      background-color: var(--color-secondary);
      color: var(--color-on-secondary);
      border-radius: var(--radius-lg);
      text-decoration: none;
      font-size: var(--font-size-label-lg);
      font-weight: var(--font-weight-semi-bold);
      transition: all var(--transition-normal);
      border: none;
    }
    .btn-nav-cta:hover {
      background-color: #925d39;
      transform: translateY(-1px);
    }
    .btn-nav-cta:focus-visible {
      outline: 2px solid var(--color-on-primary);
      outline-offset: 2px;
    }
    ```

    Also update the NuxtLink in the template from `class="btn-primary"` to `class="btn-nav-cta"`.

    Apply the same nav styles to `app/pages/ideas/create.vue` and `app/pages/ideas/[id].vue`
    which share an identical nav structure. Extract nav-back link styling:
    ```css
    .nav-back {
      color: var(--color-on-primary);
      text-decoration: none;
      font-size: var(--font-size-body-md);
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2);
      opacity: 0.85;
      transition: opacity var(--transition-fast);
    }
    .nav-back:hover { opacity: 1; }
    ```
  </description>
  <acceptance>
    - Nav background is teal (#006565), not navy (#1e3a5f)
    - Nav brand uses Manrope font (verify in DevTools)
    - "New Idea" button in nav is coral (#a43c12) and has 44px+ height
    - Sticky nav stays fixed on scroll
    - No hardcoded #1e3a5f or #2563eb in nav styles
    - Focus ring visible on keyboard navigation (Tab key)
    - Nav consistent across index.vue, create.vue, [id].vue
  </acceptance>
  <effort>1.5 hours</effort>
  <owner>Developer</owner>
</task>

<task id="7-102">
  <title>Refactor IdeaCard component to use card design tokens</title>
  <description>
    The current `app/components/IdeaCard.vue` uses a flat list-item style (border-bottom, no
    elevation, hardcoded colors). Replace with the card design from the design system.

    Current styles use: `border-bottom: 1px solid #e5e7eb`, `color: #1e3a5f`, `color: #6b7280`.

    Replace the entire `<style scoped>` block with:
    ```css
    .idea-card {
      display: flex;
      gap: var(--spacing-4);
      padding: var(--spacing-5) var(--spacing-6);
      background-color: var(--color-surface-container-lowest);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-elevation-1);
      transition: box-shadow var(--transition-normal), transform var(--transition-normal);
      align-items: flex-start;
    }
    .idea-card:hover {
      box-shadow: var(--shadow-elevation-3);
      transform: translateY(-2px);
    }
    .idea-votes {
      flex-shrink: 0;
    }
    .idea-body {
      flex: 1;
      min-width: 0;
    }
    .idea-title {
      font-family: var(--font-headline);
      font-size: var(--font-size-title-sm);
      font-weight: var(--font-weight-semi-bold);
      color: var(--color-primary);
      text-decoration: none;
      line-height: var(--line-height-tight);
      display: block;
      transition: color var(--transition-fast);
    }
    .idea-title:hover {
      color: var(--color-primary-container);
      text-decoration: underline;
    }
    .idea-title:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      border-radius: var(--radius-xs);
    }
    .idea-meta {
      font-size: var(--font-size-body-sm);
      color: var(--color-on-surface-variant);
      margin: var(--spacing-2) 0 0;
      font-family: var(--font-body);
    }
    ```

    Also update the ideas list container in `app/pages/index.vue` to use a flex column with gap
    instead of individual border-bottoms:
    ```css
    .ideas-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
      margin-top: var(--spacing-6);
    }
    ```
  </description>
  <acceptance>
    - IdeaCard renders as a white card with rounded corners (1.5rem radius)
    - Card lifts on hover (translateY(-2px) + shadow increase)
    - Title is teal (#006565) instead of navy (#1e3a5f)
    - Meta text is on-surface-variant (#3e4949) instead of gray (#6b7280)
    - No border-bottom visible between cards; spacing comes from gap
    - Title link has visible focus ring on keyboard nav
    - Card is readable at 375px mobile width (no overflow)
  </acceptance>
  <effort>1 hour</effort>
  <owner>Developer</owner>
</task>

<task id="7-103">
  <title>Refactor LanguageSwitcher to use design tokens</title>
  <description>
    The current `app/components/LanguageSwitcher.vue` uses hardcoded rgba white borders and
    opacity tricks. Refactor to use design tokens and ensure 44px touch targets.

    Replace the entire `<style scoped>` block with:
    ```css
    .lang-switcher {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }
    .lang-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;
      min-width: 44px;
      padding: var(--spacing-1) var(--spacing-3);
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: var(--color-on-primary);
      border-radius: var(--radius-sm);
      font-family: var(--font-label);
      font-size: var(--font-size-label-md);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      cursor: pointer;
      opacity: 0.75;
      transition: opacity var(--transition-fast), border-color var(--transition-fast),
                  background-color var(--transition-fast);
    }
    .lang-btn:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }
    .lang-btn:focus-visible {
      outline: 2px solid var(--color-on-primary);
      outline-offset: 2px;
      opacity: 1;
    }
    .lang-btn.active {
      opacity: 1;
      border-color: rgba(255, 255, 255, 0.8);
      font-weight: var(--font-weight-semi-bold);
      background: rgba(255, 255, 255, 0.15);
    }
    ```

    Note: The combined nav (padding) + lang-btn height should still result in an effective touch
    target — verify that the button is at least 32px tall and the nav provides sufficient padding
    so the total tappable zone for this area is 44px+.
  </description>
  <acceptance>
    - Language buttons visible and readable against teal nav background
    - Active language has distinct visual style (higher opacity + border)
    - Hover state changes background subtly
    - Focus ring visible on keyboard navigation
    - Buttons work correctly for all three languages (ES, EN, PT)
    - No FOUC (flash of unstyled content) on language switch
  </acceptance>
  <effort>30 minutes</effort>
  <owner>Developer</owner>
</task>

<task id="7-104">
  <title>Add reusable Button classes to main.css for use across pages</title>
  <description>
    Rather than defining button styles repeatedly in each `.vue` scoped block, add shared
    component classes to `app/assets/css/main.css` after the design token import. These will
    be available globally via CSS (not Tailwind utilities, to avoid the scoped-style conflict).

    Append to `app/assets/css/main.css`:

    ```css
    /* ============================================
       SHARED BUTTON COMPONENT CLASSES
       Used across multiple pages and components
       ============================================ */

    .ds-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      border: none;
      border-radius: var(--radius-lg);
      font-family: var(--font-label);
      font-size: var(--font-size-label-lg);
      font-weight: var(--font-weight-semi-bold);
      cursor: pointer;
      text-decoration: none;
      transition: all var(--transition-normal);
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    .ds-btn:focus-visible {
      outline-color: var(--color-primary);
    }

    .ds-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ds-btn-primary {
      padding: var(--spacing-4) var(--spacing-8);
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
      color: var(--color-on-primary);
      box-shadow: 0 15px 30px rgba(0, 101, 101, 0.15);
    }

    .ds-btn-primary:hover:not(:disabled) {
      box-shadow: 0 20px 40px rgba(0, 101, 101, 0.25);
      transform: translateY(-2px);
    }

    .ds-btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .ds-btn-secondary {
      padding: var(--spacing-4) var(--spacing-8);
      background-color: var(--color-secondary);
      color: var(--color-on-secondary);
    }

    .ds-btn-secondary:hover:not(:disabled) {
      background-color: #925d39;
    }

    .ds-btn-tertiary {
      padding: var(--spacing-3) var(--spacing-6);
      background-color: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-outline-variant);
    }

    .ds-btn-tertiary:hover:not(:disabled) {
      background-color: var(--color-surface-container-low);
    }

    .ds-btn-sm {
      min-height: 36px;
      padding: var(--spacing-2) var(--spacing-4);
      font-size: var(--font-size-label-md);
    }
    ```

    The `ds-` prefix avoids collisions with Tailwind's own `btn-*` utilities defined in the
    Tailwind config plugins. Use these classes in form submit buttons on create.vue and [id].vue.
  </description>
  <acceptance>
    - Classes `ds-btn`, `ds-btn-primary`, `ds-btn-secondary`, `ds-btn-tertiary`, `ds-btn-sm`
      are available globally in the browser
    - Applying `class="ds-btn ds-btn-primary"` to any button renders the teal gradient button
    - Minimum height 44px confirmed in DevTools box model panel
    - Focus ring appears on keyboard navigation
    - Disabled state renders with 50% opacity
  </acceptance>
  <effort>45 minutes</effort>
  <owner>Developer</owner>
</task>

<task id="7-105">
  <title>Refactor create.vue form and buttons to use design tokens</title>
  <description>
    The create idea form at `app/pages/ideas/create.vue` uses hardcoded styles and system fonts.
    Refactor the scoped styles to use CSS variables.

    Replace the `<style scoped>` block with:
    ```css
    .create-page {
      font-family: var(--font-body);
      background-color: var(--color-background);
      color: var(--color-on-surface);
      min-height: 100vh;
    }
    /* Nav styles — same as index.vue task 7-101 */
    .nav { ... } /* copy from task 7-101 */

    main {
      max-width: 640px;
      margin: var(--spacing-8) auto;
      padding: 0 var(--spacing-4);
    }
    h1 {
      font-family: var(--font-headline);
      font-size: var(--font-size-headline-md);
      font-weight: var(--font-weight-bold);
      color: var(--color-on-surface);
      margin-bottom: var(--spacing-2);
    }
    .subtitle {
      color: var(--color-on-surface-variant);
      font-size: var(--font-size-body-lg);
      margin-bottom: var(--spacing-6);
    }
    .create-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }
    .form-label {
      font-family: var(--font-label);
      font-size: var(--font-size-label-lg);
      font-weight: var(--font-weight-semi-bold);
      color: var(--color-on-surface);
    }
    .required { color: var(--color-error); }
    .form-input,
    .form-textarea {
      background-color: var(--color-surface-container-highest);
      border: none;
      border-bottom: 2px solid var(--color-outline-variant);
      border-radius: 0;
      padding: var(--spacing-3) var(--spacing-2);
      font-size: var(--font-size-body-lg);
      font-family: var(--font-body);
      color: var(--color-on-surface);
      transition: border-color var(--transition-fast);
      width: 100%;
    }
    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-bottom-color: var(--color-secondary-container);
      border-bottom-width: 3px;
    }
    .form-input::placeholder,
    .form-textarea::placeholder {
      color: var(--color-on-surface-variant);
    }
    .char-count {
      font-size: var(--font-size-label-sm);
      color: var(--color-on-surface-variant);
      text-align: right;
      font-family: var(--font-label);
    }
    .form-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      margin-top: var(--spacing-2);
    }
    .cancel-link {
      color: var(--color-on-surface-variant);
      font-size: var(--font-size-body-md);
      text-decoration: none;
    }
    .cancel-link:hover {
      color: var(--color-on-surface);
      text-decoration: underline;
    }
    .form-error {
      font-size: var(--font-size-body-sm);
      color: var(--color-error);
      padding: var(--spacing-2) var(--spacing-3);
      background-color: var(--color-error-container);
      border-radius: var(--radius-sm);
    }
    ```

    Update the template's `<label>` tags to use `<div class="form-field">` + explicit
    `<label class="form-label">` and `<input class="form-input">` / `<textarea class="form-textarea">`.
    Change the submit button from a plain `<button>` to use `class="ds-btn ds-btn-primary"`.
  </description>
  <acceptance>
    - Form background is light teal-tinted surface (#f6faf9)
    - Inputs use the bottom-border style (no box border)
    - Focus state on inputs shows coral (#fe7e4f) bottom border, 3px wide
    - Submit button uses teal gradient from ds-btn-primary
    - Cancel link is muted on-surface-variant color
    - Error messages render with red text on light red background
    - All form elements legible at 375px mobile width
    - Char count visible for title field
  </acceptance>
  <effort>1.5 hours</effort>
  <owner>Developer</owner>
</task>

---

## Verification

After all tasks in this plan complete, perform a visual review:

1. Open http://localhost:3000 — verify:
   - Teal navigation (not navy)
   - Idea cards render with card elevation, rounded corners
   - No hardcoded blue (#2563eb) anywhere in the page

2. Open http://localhost:3000/ideas/create — verify:
   - Form inputs have bottom-border style
   - Submit button is teal gradient
   - Nav matches homepage nav

3. Use Tab key to navigate the homepage — verify:
   - Focus rings visible on all interactive elements
   - Language switcher buttons focusable
   - Idea card titles focusable

4. Run an accessibility check (browser extension or DevTools Accessibility panel):
   - No missing labels on form fields
   - No color contrast failures for text elements

5. Test at 375px viewport width — verify no horizontal overflow
