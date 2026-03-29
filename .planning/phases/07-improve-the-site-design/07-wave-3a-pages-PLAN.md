---
wave: 3
phase: 7
depends_on:
  - 07-wave-2a-components-PLAN.md
  - 07-wave-2b-interactions-PLAN.md
files_modified:
  - app/pages/index.vue
  - app/pages/ideas/[id].vue
  - app/pages/ideas/create.vue
  - app/assets/images/logo.svg
  - app/public/favicon.svg
  - nuxt.config.ts
  - locales/es.json
  - locales/en.json
  - locales/pt.json
autonomous: true
---

# Plan 4: Homepage Hero & Pages Redesign

**Goal:** Redesign the homepage with an inspirational hero section, improve the idea detail page layout, refine the create form UX, and tune mobile responsiveness across all pages.

**Success Criteria:**
- Homepage has a hero section with gradient background, compelling headline (Manrope display font), and a primary CTA
- IdeaCard list integrates naturally below the hero with a distinct section header
- Idea detail page has a full-width header block with the idea title prominent
- Edit form on detail page matches the create form style (bottom-border inputs)
- All pages are fully responsive at 375px, 768px, and 1024px+ breakpoints
- No horizontal overflow at any breakpoint
- Page layout uses the surface hierarchy (page bg → section bg → card bg)
- Load more button uses design system button style

---

## Tasks

<task id="7-300">
  <title>Add i18n key home.ideasHeading to all locale files</title>
  <description>
    Task 7-301 introduces a new i18n key `home.ideasHeading` for the feed section header.
    Add this key to all three locale files **before** implementing the hero, so the key is
    always present when the template is first rendered.

    File: `locales/es.json` — add inside the `"home"` object:
    ```json
    "ideasHeading": "Ideas de la comunidad"
    ```

    File: `locales/en.json` — add inside the `"home"` object:
    ```json
    "ideasHeading": "Community Ideas"
    ```

    File: `locales/pt.json` — add inside the `"home"` object:
    ```json
    "ideasHeading": "Ideias da comunidade"
    ```

    Verify the keys exist in the correct nesting level — the existing keys use `home.title`,
    `home.subtitle`, etc., so add `ideasHeading` at the same level.
  </description>
  <acceptance>
    - `home.ideasHeading` key exists in es.json, en.json, and pt.json
    - Switching language on the homepage updates the feed section heading
    - No "missing i18n key" warnings in the dev console
  </acceptance>
  <effort>15 minutes</effort>
  <owner>Developer</owner>
</task>

<task id="7-303a">
  <title>Integrate logo and favicon assets</title>
  <description>
    Add logo and favicon assets to the site header and meta tags. This task satisfies
    DESIGN-03: Logo and brand identity assets integrated.

    1. Create or place logo files:
       - `app/assets/images/logo.svg` (main logo, ~200x40px)
       - `app/public/favicon.svg` or `app/public/favicon.ico`

       If Stitch-generated logo files are not yet available, create a minimal placeholder SVG
       for development:
       ```svg
       <!-- app/assets/images/logo.svg — placeholder -->
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40">
         <text y="32" font-family="sans-serif" font-weight="700"
               font-size="24" fill="#006565">Para Salvar A Cuba</text>
       </svg>
       ```

    2. Update `app.vue` or the layout component to include the logo in navigation:
       ```html
       <img src="/logo.svg" alt="Para Salvar A Cuba" class="h-10 w-auto" />
       ```
       If no shared layout exists, add it to the `.nav-brand` slot in each page's nav
       (index.vue, create.vue, [id].vue).

    3. Update `nuxt.config.ts` `app.head.link` to include favicon and OG meta tags:
       ```ts
       { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
       { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
       ```

    4. Test in browser:
       - Favicon appears in the browser tab
       - Logo renders in navigation on all pages
       - Logo is readable on both light and dark backgrounds
  </description>
  <acceptance>
    - Logo file exists at `app/assets/images/logo.svg`
    - Favicon file exists at `app/public/favicon.svg` or `app/public/favicon.ico`
    - `app.vue` or page layouts display logo in the navigation header
    - `nuxt.config.ts` includes favicon link in `app.head.link`
    - Browser tab shows favicon (F5 refresh to clear cache if needed)
    - Logo text/image is crisp and legible at 40px height
    - Logo renders correctly on the teal nav background (on-primary color or white text)
  </acceptance>
  <effort>1 hour</effort>
  <owner>Developer</owner>
</task>

<task id="7-301">
  <title>Implement homepage hero section with gradient and primary CTA</title>
  <description>
    The current homepage (`app/pages/index.vue`) has a plain `<h1>` and subtitle below the nav.
    Replace the `<main>` content with a hero section followed by the ideas feed section.

    Update the template's `<main>` block:
    ```html
    <main>
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-headline">{{ $t('home.title') }}</h1>
          <p class="hero-subtitle">{{ $t('home.subtitle') }}</p>
          <NuxtLink :to="localePath('/ideas/create')" class="hero-cta">
            {{ $t('nav.newIdea') }}
          </NuxtLink>
        </div>
      </section>

      <!-- Ideas Feed Section -->
      <section class="feed-section">
        <div class="feed-container">
          <h2 class="feed-heading">{{ $t('home.ideasHeading') }}</h2>

          <div v-if="pending" class="state-message">{{ $t('home.loading') }}</div>
          <div v-else-if="error" class="state-message state-error">{{ $t('home.error') }}</div>
          <div v-else-if="ideas.length === 0" class="state-message">{{ $t('home.empty') }}</div>

          <div v-else class="ideas-list">
            <IdeaCard
              v-for="idea in ideas"
              :key="idea.id"
              :idea="idea"
              @voted="onVoted"
            />
          </div>

          <div v-if="hasMore" class="pagination">
            <button class="ds-btn ds-btn-tertiary" :disabled="pending" @click="loadMore">
              {{ $t('home.loadMore') }}
            </button>
          </div>
        </div>
      </section>
    </main>
    ```

    Note: `home.ideasHeading` is a new i18n key added by task 7-300 (which runs first).
    The key will already be present in all locale files before this task executes.

    Replace the `<style scoped>` section's `main`, `h1`, `.subtitle` styles with:
    ```css
    /* Hero Section */
    .hero {
      background: linear-gradient(
        135deg,
        var(--color-primary) 0%,
        var(--color-primary-container) 50%,
        var(--color-tertiary-container) 100%
      );
      padding: var(--spacing-20) var(--spacing-8) var(--spacing-16);
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    /* Subtle decorative ring behind hero text */
    .hero::before {
      content: '';
      position: absolute;
      top: -40%;
      right: -20%;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.04);
      pointer-events: none;
    }

    .hero-content {
      position: relative;
      max-width: 720px;
      margin: 0 auto;
    }

    .hero-headline {
      font-family: var(--font-display);
      font-size: var(--font-size-display-md);
      font-weight: var(--font-weight-bold);
      color: var(--color-on-primary);
      line-height: var(--line-height-tight);
      margin: 0 0 var(--spacing-5);
      letter-spacing: var(--letter-spacing-xs);
    }

    .hero-subtitle {
      font-family: var(--font-body);
      font-size: var(--font-size-body-lg);
      color: var(--color-on-primary-container);
      line-height: var(--line-height-relaxed);
      max-width: 520px;
      margin: 0 auto var(--spacing-8);
      opacity: 0.9;
    }

    .hero-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 52px;
      padding: var(--spacing-4) var(--spacing-10);
      background-color: var(--color-secondary);
      color: var(--color-on-secondary);
      border-radius: var(--radius-xl);
      text-decoration: none;
      font-family: var(--font-label);
      font-size: var(--font-size-title-sm);
      font-weight: var(--font-weight-bold);
      transition: all var(--transition-normal);
      box-shadow: 0 8px 24px rgba(164, 60, 18, 0.3);
      letter-spacing: var(--letter-spacing-xs);
    }

    .hero-cta:hover {
      background-color: #925d39;
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(164, 60, 18, 0.4);
    }

    .hero-cta:focus-visible {
      outline: 3px solid var(--color-on-primary);
      outline-offset: 3px;
    }

    /* Feed Section */
    .feed-section {
      background-color: var(--color-surface);
      padding: var(--spacing-12) var(--spacing-4);
    }

    .feed-container {
      max-width: 720px;
      margin: 0 auto;
    }

    .feed-heading {
      font-family: var(--font-headline);
      font-size: var(--font-size-headline-sm);
      font-weight: var(--font-weight-bold);
      color: var(--color-on-surface);
      margin: 0 0 var(--spacing-6);
    }

    .ideas-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .state-message {
      padding: var(--spacing-8) 0;
      font-family: var(--font-body);
      font-size: var(--font-size-body-lg);
      color: var(--color-on-surface-variant);
      text-align: center;
    }

    .state-error {
      color: var(--color-error);
    }

    .pagination {
      margin: var(--spacing-8) 0;
      text-align: center;
    }
    ```

    Mobile responsive overrides (add inside the `<style scoped>`):
    ```css
    @media (max-width: 640px) {
      .hero {
        padding: var(--spacing-12) var(--spacing-4) var(--spacing-10);
      }
      .hero-headline {
        font-size: var(--font-size-display-sm);
      }
      .hero-cta {
        width: 100%;
        max-width: 320px;
      }
    }
    ```
  </description>
  <acceptance>
    - Hero section renders with teal-to-teal-container-to-navy gradient
    - Headline uses Manrope display-md (2.75rem) or display-sm on mobile
    - Subtitle is legible: white/on-primary-container color on dark teal background
    - CTA button is coral, large (52px height), with hover lift
    - Feed section has a clear section heading "Ideas de la comunidad" (or translated)
    - Idea cards render below with correct spacing
    - At 375px: headline drops to display-sm (2.25rem), CTA is full width
    - At 768px: hero is balanced, no overflow
    - Hero CTA and nav "New Idea" button both lead to /ideas/create
  </acceptance>
  <effort>2.5 hours</effort>
  <owner>Developer</owner>
</task>

<task id="7-302">
  <title>Redesign idea detail page layout and edit form</title>
  <description>
    The current `app/pages/ideas/[id].vue` has a basic layout. Redesign for editorial clarity.

    Update the template structure for the `<article>` block:
    ```html
    <article>
      <!-- Idea header card -->
      <div class="idea-header-card">
        <div class="idea-vote-col">
          <VoteButton :idea-id="idea.id" :net-votes="idea.net_votes" @voted="onVoted" />
        </div>
        <div class="idea-title-col">
          <h1 class="idea-title">{{ idea.title }}</h1>
          <p class="idea-meta">
            {{ $t('idea.by') }} <strong>{{ idea.email }}</strong>
            &middot; {{ formatDate(idea.created_at) }}
          </p>
        </div>
      </div>

      <!-- Idea description -->
      <div class="idea-description-card">
        <MarkdownRenderer :markdown="idea.description" />
      </div>

      <!-- Author edit action -->
      <div v-if="isAuthor && !editing" class="idea-actions">
        <button class="ds-btn ds-btn-tertiary ds-btn-sm" @click="openEdit">
          {{ $t('idea.editIdea') }}
        </button>
      </div>

      <!-- Inline edit form -->
      <form v-if="editing" class="edit-form" @submit.prevent="submitEdit">
        <div class="form-field">
          <label class="form-label" for="edit-title">{{ $t('idea.titleLabel') }}</label>
          <input
            id="edit-title"
            v-model="editTitle"
            class="form-input"
            maxlength="200"
            required
          />
        </div>
        <div class="form-field">
          <label class="form-label" for="edit-description">{{ $t('idea.descriptionLabel') }}</label>
          <textarea
            id="edit-description"
            v-model="editDescription"
            class="form-textarea"
            rows="8"
            required
          />
        </div>
        <div class="edit-actions">
          <button type="submit" class="ds-btn ds-btn-primary" :disabled="saving">
            {{ $t('idea.saveChanges') }}
          </button>
          <button type="button" class="ds-btn ds-btn-tertiary" @click="editing = false">
            {{ $t('idea.cancel') }}
          </button>
        </div>
        <p v-if="editError" class="form-error">{{ editError }}</p>
      </form>

      <!-- Comments section -->
      <CommentThread v-if="idea" :idea-id="idea.id" />
    </article>
    ```

    Replace the `<style scoped>` with:
    ```css
    .detail-page {
      font-family: var(--font-body);
      background-color: var(--color-surface);
      color: var(--color-on-surface);
      min-height: 100vh;
    }
    /* nav styles — copy from task 7-101 */

    main {
      max-width: 760px;
      margin: 0 auto;
      padding: var(--spacing-8) var(--spacing-4) var(--spacing-16);
    }

    .idea-header-card {
      display: flex;
      gap: var(--spacing-5);
      align-items: flex-start;
      background-color: var(--color-surface-container-lowest);
      border-radius: var(--radius-xl);
      padding: var(--spacing-6);
      box-shadow: var(--shadow-elevation-2);
      margin-bottom: var(--spacing-5);
    }

    .idea-vote-col {
      flex-shrink: 0;
      padding-top: var(--spacing-1);
    }

    .idea-title-col {
      flex: 1;
      min-width: 0;
    }

    .idea-title {
      font-family: var(--font-headline);
      font-size: var(--font-size-headline-md);
      font-weight: var(--font-weight-bold);
      color: var(--color-on-surface);
      margin: 0 0 var(--spacing-3);
      line-height: var(--line-height-tight);
    }

    .idea-meta {
      font-family: var(--font-body);
      font-size: var(--font-size-body-sm);
      color: var(--color-on-surface-variant);
      margin: 0;
    }

    .idea-meta strong {
      color: var(--color-primary);
      font-weight: var(--font-weight-semi-bold);
    }

    .idea-description-card {
      background-color: var(--color-surface-container-lowest);
      border-radius: var(--radius-xl);
      padding: var(--spacing-6);
      box-shadow: var(--shadow-elevation-1);
      margin-bottom: var(--spacing-5);
      line-height: var(--line-height-relaxed);
    }

    .idea-actions {
      margin-bottom: var(--spacing-5);
    }

    /* Edit form */
    .edit-form {
      background-color: var(--color-surface-container-lowest);
      border-radius: var(--radius-xl);
      padding: var(--spacing-6);
      box-shadow: var(--shadow-elevation-1);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-5);
      margin-bottom: var(--spacing-5);
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

    .form-input,
    .form-textarea {
      background-color: var(--color-surface-container-highest);
      border: none;
      border-bottom: 2px solid var(--color-outline-variant);
      border-radius: 0;
      padding: var(--spacing-3) var(--spacing-2);
      font-family: var(--font-body);
      font-size: var(--font-size-body-lg);
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

    .edit-actions {
      display: flex;
      gap: var(--spacing-3);
      flex-wrap: wrap;
    }

    .form-error {
      font-size: var(--font-size-body-sm);
      color: var(--color-error);
      padding: var(--spacing-2) var(--spacing-3);
      background-color: var(--color-error-container);
      border-radius: var(--radius-sm);
    }

    .loading,
    .error {
      padding: var(--spacing-8) 0;
      font-family: var(--font-body);
      color: var(--color-on-surface-variant);
      text-align: center;
    }

    .error { color: var(--color-error); }

    @media (max-width: 640px) {
      .idea-header-card {
        flex-direction: column;
        gap: var(--spacing-4);
      }
      .idea-title {
        font-size: var(--font-size-headline-sm);
      }
    }
    ```
  </description>
  <acceptance>
    - Idea header renders as a card with VoteButton and title side by side
    - Title uses Manrope headline-md (1.75rem) — prominent and readable
    - Author name is teal, meta text is on-surface-variant
    - Description renders in a separate card below the header
    - Edit form uses bottom-border inputs (not box border)
    - Save button is teal gradient (ds-btn-primary)
    - Cancel button is tertiary ghost
    - At 375px: header stacks vertically (vote above title)
    - At 768px+: two-column header layout
    - Edit error message renders with light red background
  </acceptance>
  <effort>2 hours</effort>
  <owner>Developer</owner>
</task>

<task id="7-304">
  <title>Responsive layout audit and overflow fixes</title>
  <description>
    After implementing tasks 7-301 and 7-302, perform a cross-breakpoint layout audit.
    Test at three viewport widths using browser DevTools device emulation:

    **375px (iPhone SE / small mobile):**
    - Hero headline should be `display-sm` (2.25rem)
    - Hero CTA should be full-width with max-width: 320px
    - Idea cards should stack without side-by-side elements overflowing
    - Nav brand text should truncate if needed (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`)
    - Language switcher should remain visible (may need to wrap or abbreviate to 2-letter codes)

    **768px (tablet):**
    - Hero headline at `display-sm` or `display-md`
    - Cards use full container width up to 720px max
    - Idea detail header two columns side by side

    **1024px+ (desktop):**
    - Full `display-md` (2.75rem) headline in hero
    - Max-width containers respected
    - Comfortable whitespace

    Common fixes to apply:
    ```css
    /* Prevent horizontal overflow globally */
    body {
      overflow-x: hidden;
    }

    /* Nav brand truncation */
    .nav-brand {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 160px;
    }

    /* Ensure images and media don't overflow */
    img, video, iframe {
      max-width: 100%;
      height: auto;
    }
    ```

    Add the `body { overflow-x: hidden; }` rule to `app/assets/css/main.css`.
    Add nav-brand truncation to the `.nav-brand` rule in each page that has a nav.

    Document any remaining overflow issues that require further design decisions.
  </description>
  <acceptance>
    - No horizontal scrollbar at 375px on any page
    - No horizontal scrollbar at 768px on any page
    - Nav brand text does not push language switcher off-screen on small viewports
    - All text remains readable (no text-overflow hidden without fallback)
    - Cards do not overflow their container
    - Hero CTA button is comfortably tappable on mobile (full-width or 320px+ wide)
  </acceptance>
  <effort>1.5 hours</effort>
  <owner>Developer</owner>
</task>

---

## Verification

After all tasks in this plan complete:

1. Open http://localhost:3000 — full visual review:
   - Browser tab shows favicon (check tab icon)
   - Navigation displays logo at ~40px height on teal background
   - Hero section: gradient background, large Manrope headline, coral CTA button
   - Feed section: section heading, cards with elevation
   - Load More button uses tertiary ghost style

2. Resize browser from 375px to 1440px — no horizontal scrollbar at any width

3. Navigate to /ideas/[id]:
   - Header card with VoteButton + prominent title
   - Description in separate card
   - Edit button (if author) uses tertiary ghost style

4. Language switching on homepage — feed heading changes language

5. Check browser console for i18n missing key warnings — should be zero

6. Lighthouse performance quick check (DevTools → Lighthouse → Mobile):
   - Performance score should not regress below 70 (fonts are the main risk)
   - Accessibility score should be 85+
