---
wave: 3
phase: 7
depends_on:
  - 07-wave-3a-pages-PLAN.md
files_modified:
  - app/assets/css/main.css
  - app/pages/index.vue
  - app/pages/ideas/[id].vue
  - app/pages/ideas/create.vue
autonomous: false
---

# Plan 5: Visual Polish & Testing

**Goal:** Audit accessibility (WCAG AA), test across mobile breakpoints and real devices, run Lighthouse performance checks, and apply final visual polish to achieve the target quality bar: Lighthouse >90, WCAG AA compliance, 44px+ touch targets throughout.

**Note:** This plan is `autonomous: false` — it requires human judgment and real-device testing that cannot be fully automated.

**Success Criteria:**
- Lighthouse Performance ≥ 90 (mobile)
- Lighthouse Accessibility ≥ 95
- No WCAG AA color contrast failures (4.5:1 for normal text, 3:1 for large text)
- All interactive elements have 44px+ touch targets
- No horizontal overflow at 375px, 768px, 1024px
- `prefers-reduced-motion` respected throughout
- Google Fonts load without render-blocking (verified with font-display: swap)
- No console errors on any page

---

## Tasks

<task id="7-401">
  <title>WCAG AA color contrast audit</title>
  <description>
    Run a systematic color contrast audit on all text/background combinations used in the
    redesigned components. Use axe DevTools browser extension or the Colour Contrast Analyser
    desktop app.

    Key combinations to verify (reference design-tokens.json for hex values):

    | Text color (hex) | Background (hex) | Required ratio | Used in |
    |---|---|---|---|
    | #006565 on #ffffff | white card | 4.5:1 | IdeaCard title |
    | #006565 on #f0f4f3 | surface-container-low | 4.5:1 | Card on page bg |
    | #ffffff on #006565 | teal nav bg | 4.5:1 | Nav links |
    | #ffffff on #a43c12 | coral button | 4.5:1 | Secondary/CTA button |
    | #181c1c on #dfe3e2 | surface-container-highest (input bg) | 4.5:1 | Input text |
    | #3e4949 on #f0f4f3 | meta text on card | 4.5:1 | Idea meta, comment date |
    | #ba1a1a on #ffdad6 | error text on error bg | 4.5:1 | Error messages |
    | #002020 on #93f2f2 | badge-primary | 4.5:1 | Badge component |
    | #ffffff on #008080 | on-primary-container | 4.5:1 | Hero subtitle (opacity 0.9) |

    Pre-calculated values from the design system:
    - `#006565` on white: 5.87:1 (PASS)
    - `#ffffff` on `#006565`: 5.87:1 (PASS)
    - `#ffffff` on `#a43c12`: 4.93:1 (PASS)
    - `#3e4949` on `#f0f4f3`: ~7.3:1 (PASS)
    - `#181c1c` on `#dfe3e2`: ~13:1 (PASS)

    Flag and fix any failures. Common pitfall: hero subtitle at 90% opacity
    (`rgba(227, 255, 254, 0.9)` on `#008080`) — measure with the actual rendered color.

    Also check:
    - Vote count text on card white background
    - Author name on comment surface-container-low
    - Placeholder text (minimum 3:1 as it is non-critical)

    Document results in a brief note. Fix any failures by adjusting opacity, background,
    or text color to a closer design-token value.
  </description>
  <acceptance>
    - All body text passes 4.5:1 contrast ratio
    - All large text (18px+ bold or 24px+) passes 3:1 ratio
    - Hero subtitle passes in its rendered context (check at full opacity too)
    - Error messages readable: #ba1a1a on #ffdad6 passes (it does: 5.8:1)
    - Badge text contrasts confirmed
    - Any found failures are documented and fixed
  </acceptance>
  <effort>1.5 hours</effort>
  <owner>Developer (with browser extension)</owner>
</task>

<task id="7-402">
  <title>Touch target audit and fix small interactive elements</title>
  <description>
    Audit every interactive element across all pages for the 44px minimum touch target.
    Use the browser DevTools box model panel or the axe "touch target" rule.

    Known small elements before Wave 2/3 refactoring (should already be fixed):
    - VoteButton buttons (fixed in task 7-201 to 44×44px)
    - Language switcher buttons (partially fixed in task 7-103 — recheck)
    - Nav links (height comes from nav padding — measure total tappable height)

    Elements to audit on each page:
    1. Homepage:
       - Nav "New Idea" button: min-height 44px ✓ (task 7-101)
       - Language switcher: min-height 32px but nav padding should give 44px tap zone
       - Settings nav link: measure effective height including padding
       - Load More button: ds-btn has min-height 44px ✓
       - Idea card title link: no explicit height — must have sufficient padding or line-height

    2. Detail page:
       - Back link in nav: measure effective height
       - VoteButton up/down: 44×44px ✓ (task 7-201)
       - Reply button: ds-btn-sm has min-height 36px — reconsider if 44px needed
       - Edit Idea button: ds-btn-sm at 36px — acceptable for secondary action if surrounded by whitespace
       - Save/Cancel buttons in edit form: ds-btn at 44px ✓

    3. Create page:
       - Submit button: ds-btn at 44px ✓
       - Cancel link: is a `<a>` element — add `min-height: 44px; display: inline-flex; align-items: center;`

    Fixes to apply:
    - Idea card title link: add `padding: var(--spacing-2) 0;` to give larger tap area
    - Cancel link on create.vue: change to `<button class="ds-btn ds-btn-tertiary ds-btn-sm">` pointing to router.back() OR wrap in a styled element with min 36px height and surrounding white space
    - Reply button: consider padding approach — `padding: var(--spacing-2) var(--spacing-3); min-height: 36px` is acceptable for secondary action in a comment thread on mobile. Document this exception.

    Add to `app/assets/css/main.css`:
    ```css
    /* Ensure anchor tags used as buttons have sufficient tap targets */
    a.ds-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    ```
  </description>
  <acceptance>
    - VoteButtons: 44×44px confirmed
    - Primary CTA buttons (hero CTA, submit buttons): 44px+ confirmed
    - Language switcher: effective tap zone ≥ 44px (including nav padding)
    - Secondary/tertiary actions (reply, edit): minimum 36px height, documented exception if < 44px
    - Cancel links: treated as buttons with adequate sizing
    - Axe accessibility scan shows no "target size" failures on primary actions
  </acceptance>
  <effort>1 hour</effort>
  <owner>Developer</owner>
</task>

<task id="7-403">
  <title>Google Fonts performance optimization</title>
  <description>
    Google Fonts can block rendering if not configured correctly. Apply best practices to ensure
    fonts load without impacting Lighthouse performance score.

    Current setup from task 7-004 uses standard `<link rel="stylesheet">` which can be render-
    blocking. Optimize with `font-display: swap` via the `&display=swap` parameter (already
    included in the URL in task 7-004) and ensure preconnect links are in place.

    Verify nuxt.config.ts `app.head.link` contains:
    1. `rel: 'preconnect'` to `https://fonts.googleapis.com`
    2. `rel: 'preconnect'` to `https://fonts.gstatic.com` with `crossorigin: ''`
    3. Stylesheet link URL ends in `&display=swap`

    If the font weights in use are only 400, 500, 600, 700 — confirm the URL requests exactly
    these weights to minimize download size:
    ```
    https://fonts.googleapis.com/css2?
      family=Manrope:wght@400;500;600;700
      &family=Inter:wght@400;500;600;700
      &display=swap
    ```

    Additionally, add a fallback font stack to `app/assets/css/main.css` to ensure good FOUT
    (flash of unstyled text) behavior:
    ```css
    /* Improve font loading experience */
    html {
      font-family: var(--font-body);
    }

    /* Optional: Size-adjust for Inter fallback to reduce layout shift */
    @font-face {
      font-family: 'Inter-fallback';
      src: local('Arial');
      ascent-override: 90.49%;
      descent-override: 22.56%;
      line-gap-override: 0%;
      size-adjust: 107.06%;
    }
    ```

    Test by throttling to "Slow 3G" in DevTools Network tab and loading the homepage.
    Verify text is readable during font loading (using the system fallback).
  </description>
  <acceptance>
    - Preconnect links present in `<head>` for both fonts.googleapis.com and fonts.gstatic.com
    - Font URL includes `&display=swap`
    - Text renders immediately with fallback font, then swaps to Manrope/Inter
    - No render-blocking resources warning in Lighthouse for Google Fonts
    - Font files load (verify in Network tab — .woff2 files from fonts.gstatic.com)
    - Lighthouse Performance score ≥ 85 on mobile (goal: 90+)
  </acceptance>
  <effort>1 hour</effort>
  <owner>Developer</owner>
</task>

<task id="7-404">
  <title>Lighthouse audit and performance fixes</title>
  <description>
    Run a full Lighthouse audit on the homepage and idea detail page. Target scores:
    - Performance ≥ 90 (mobile), ≥ 95 (desktop)
    - Accessibility ≥ 95
    - Best Practices ≥ 95
    - SEO ≥ 90

    Run from Chrome DevTools → Lighthouse tab:
    1. Select "Mobile" device
    2. Check: Performance, Accessibility, Best Practices, SEO
    3. Click "Analyze page load"

    **Common Lighthouse accessibility failures to fix:**

    a) Missing `<html lang>` attribute:
       Nuxt sets this via i18n — verify `<html lang="es">` (or current locale) is present.
       If not, add to nuxt.config.ts:
       ```ts
       app: {
         head: {
           htmlAttrs: { lang: 'es' },
           ...
         }
       }
       ```

    b) Missing page `<title>`:
       Each page should have a unique title. Add `useHead()` calls:
       - index.vue: `useHead({ title: 'Para Salvar A Cuba' })`
       - ideas/[id].vue: `useHead({ title: () => idea.value?.title ?? 'Idea' })`
       - ideas/create.vue: `useHead({ title: 'Nueva Idea - Para Salvar A Cuba' })`
       Use i18n for the title text if translation keys exist.

    c) Missing `<meta name="description">`:
       Add to index.vue:
       ```ts
       useHead({
         title: 'Para Salvar A Cuba',
         meta: [
           { name: 'description', content: 'Comparte y vota por ideas para el futuro de Cuba.' }
         ]
       })
       ```

    d) Image alt text: No images currently — not applicable.

    e) Button/link focus order: Verify logical Tab order with keyboard.

    **Common Performance issues:**
    - If CSS is large, check that Tailwind's content array is correct (purges unused classes)
    - Verify no unused JavaScript chunks on initial load
    - Ensure `<NuxtImg>` is used for any images added in future

    After fixes, re-run Lighthouse and confirm scores meet targets.
  </description>
  <acceptance>
    - Lighthouse Performance ≥ 85 on mobile (soft target); document score
    - Lighthouse Accessibility ≥ 95
    - `<html lang="es">` (or locale-appropriate) present in rendered HTML
    - Each page has a meaningful `<title>` tag
    - Homepage has `<meta name="description">`
    - No Lighthouse "Errors in console" failures
    - All Lighthouse accessibility failures reviewed and fixed or documented with justification
  </acceptance>
  <effort>2 hours</effort>
  <owner>Developer</owner>
</task>

<task id="7-405">
  <title>Cross-browser and real-device testing</title>
  <description>
    Test the redesigned site across browsers and devices to catch rendering issues.

    **Browser matrix (use latest stable versions):**
    - Chrome (primary development browser)
    - Firefox (CSS Grid/custom properties differences)
    - Safari (backdrop-filter, CSS variable, animation behavior)
    - Edge (Chromium-based — should match Chrome)

    **Test checklist for each browser:**
    1. Homepage loads without errors
    2. Hero gradient renders correctly
    3. Manrope and Inter fonts load (not falling back to system font permanently)
    4. IdeaCard hover animations work smoothly
    5. VoteButton active state shows correct colors
    6. EmailCaptureModal backdrop-filter blur renders (Safari may need `-webkit-` prefix)
    7. Language switcher changes language
    8. Idea detail page loads

    **Safari-specific: backdrop-filter fix**
    If backdrop-filter fails in Safari (versions prior to 15), add the `-webkit-` prefix
    to `app/components/EmailCaptureModal.vue`:
    ```css
    .modal-backdrop {
      -webkit-backdrop-filter: var(--backdrop-blur-sm);
      backdrop-filter: var(--backdrop-blur-sm);
    }
    ```

    **Real device testing (use BrowserStack or physical devices if available):**
    - iPhone SE (375×667) — iOS Safari
    - iPhone 14 (390×844) — iOS Safari
    - Samsung Galaxy S21 (360×800) — Android Chrome
    - iPad (768×1024) — iOS Safari

    For each device/emulation:
    - Verify hero CTA is easily tappable
    - Verify vote buttons are 44×44px tap targets
    - Verify no horizontal scroll
    - Verify modal works correctly (can dismiss, can submit)

    **Document any unfixed issues** with browser/device details for future reference.
  </description>
  <acceptance>
    - Homepage and detail page render correctly in Chrome, Firefox, and Safari
    - No CSS custom property failures in any browser (all major browsers support them)
    - backdrop-filter works in Safari with -webkit- prefix (or gracefully degrades)
    - Vote buttons usable on touch devices without mis-taps
    - No horizontal scroll on any tested viewport size
    - Modal dismisses correctly on mobile (tap backdrop, tap "Browse anyway")
    - Fonts render correctly across all browsers
  </acceptance>
  <effort>2 hours</effort>
  <owner>Developer</owner>
</task>

<task id="7-406">
  <title>Final visual polish pass</title>
  <description>
    After all functional work is done, do a final aesthetic pass to ensure the design feels
    polished and inspirational. Reference `design-system/DESIGN-SYSTEM.md` and
    `design-system/design-tokens.json` guidelines sections.

    Items to review:

    **Spacing consistency:**
    - Verify generous whitespace: section padding ≥ var(--spacing-12) (3rem)
    - Verify card padding is var(--spacing-6) (1.5rem) consistently
    - Check that there is no cramped content anywhere

    **Typography hierarchy:**
    - Page title (H1) should feel substantial and authoritative (Manrope bold)
    - Body text should feel comfortable to read (Inter 1rem, line-height 1.5)
    - Labels should feel crisp (Inter 0.875rem, weight 600)

    **Animation refinement:**
    - Hover transitions on cards: confirm translateY(-2px) feels smooth (not jumpy)
    - Modal entrance animation: ensure slideUp feels deliberate (not too fast)
    - Vote button color change: should feel immediate (fast: 150ms)
    - Test with Chrome DevTools → Rendering → Paint flashing — reduce unnecessary repaints

    **Color harmony check:**
    - Open homepage — does the overall color palette feel cohesive?
    - Is the teal (#006565) nav + hero consistent with card link colors?
    - Does the coral (#a43c12) CTA create appropriate visual weight?
    - Does the page feel trustworthy and encouraging of civic participation?

    **Content review:**
    - Verify all i18n strings render without layout-breaking line breaks in ES/EN/PT
    - Check that Portuguese text (longest of the three languages) doesn't break layouts

    **Small fixes list** (apply as found):
    - Ensure `.nav-brand` doesn't wrap to two lines at 375px
    - Ensure hero subtitle doesn't overflow at 375px (may need smaller font size)
    - Ensure idea card title doesn't create excessive height for very long titles
      → add: `display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;`
      on `.idea-title` in IdeaCard for list view only
  </description>
  <acceptance>
    - Visual review: page feels clean, premium, and inspiring
    - No cramped or uncomfortable spacing anywhere
    - Typography hierarchy is clear (headline > title > body > label)
    - Animations are smooth without jarring jumps
    - All three languages display without layout breaks
    - IdeaCard titles truncate gracefully at 3 lines in list view
    - Overall: a civic participant visiting the site feels it reflects the importance of the mission
  </acceptance>
  <effort>1.5 hours</effort>
  <owner>Developer</owner>
</task>

---

## Verification

This plan's verification is the final gate for Phase 7. All of the following must pass:

**Automated checks:**
```
Lighthouse Performance (mobile):    ≥ 85 (target: 90+)
Lighthouse Accessibility:           ≥ 95
Lighthouse Best Practices:          ≥ 95
Lighthouse SEO:                     ≥ 90
```

**Manual WCAG checklist:**
- [ ] 4.5:1 contrast for all body text
- [ ] 3:1 contrast for all large text (18px+ regular or 14px+ bold)
- [ ] All interactive elements have visible focus indicators
- [ ] All form inputs have associated `<label>` elements
- [ ] Modal has correct ARIA role, aria-modal, aria-labelledby
- [ ] Language switcher has `aria-current` on active locale
- [ ] Vote buttons have `aria-label` via i18n keys
- [ ] Page `<title>` set on all pages
- [ ] `<html lang>` attribute present

**Responsive checklist:**
- [ ] No horizontal overflow at 375px
- [ ] No horizontal overflow at 768px
- [ ] No horizontal overflow at 1024px
- [ ] Hero CTA button easily tappable on mobile

**Cross-browser:**
- [ ] Chrome: all features work
- [ ] Firefox: no CSS regressions
- [ ] Safari: backdrop-filter works (or gracefully degrades)

**Phase 7 is complete when all items above are checked.**
