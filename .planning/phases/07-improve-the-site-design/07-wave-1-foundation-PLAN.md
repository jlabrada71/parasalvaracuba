---
wave: 1
phase: 7
depends_on: []
files_modified:
  - package.json
  - pnpm-lock.yaml
  - nuxt.config.ts
  - app/assets/css/main.css
  - tailwind.config.js
autonomous: true
---

# Plan 1: Design System Foundation

**Goal:** Install Tailwind CSS, import the design tokens globally, configure Google Fonts (Manrope and Inter), and verify that CSS custom properties and Tailwind utility classes are accessible throughout the application.

**Success Criteria:**
- `@nuxtjs/tailwindcss` is listed in `package.json` dependencies
- `tailwind.config.js` at project root extends the Para Salvar theme from `design-system/tailwind-para-salvar.js`
- `app/assets/css/main.css` is created and imports `design-system/design-tokens.css`
- `nuxt.config.ts` registers the CSS file and loads Manrope + Inter from Google Fonts
- Running `pnpm dev` serves a page where `--color-primary` resolves to `#006565` in DevTools
- A Tailwind class such as `bg-primary` applied to any element renders with color `#006565`
- No console errors related to CSS or font loading

---

## Tasks

<task id="7-001">
  <title>Install @nuxtjs/tailwindcss</title>
  <description>
    Add the @nuxtjs/tailwindcss module to the project. This module integrates Tailwind CSS with
    Nuxt's build pipeline and handles PostCSS configuration automatically.

    Run:
      pnpm add -D @nuxtjs/tailwindcss

    Verify the package appears in package.json under devDependencies.
  </description>
  <acceptance>
    - `@nuxtjs/tailwindcss` appears in `package.json` devDependencies
    - `pnpm-lock.yaml` is updated
    - Running `pnpm dev` does not throw module-not-found errors for tailwindcss
  </acceptance>
  <effort>15 minutes</effort>
  <owner>Developer</owner>
</task>

<task id="7-002">
  <title>Create tailwind.config.js extending the Para Salvar theme</title>
  <description>
    Create `tailwind.config.js` at the project root (next to `nuxt.config.ts`). Import the
    design-system preset from `design-system/tailwind-para-salvar.js` and merge it in.

    File: `tailwind.config.js`

    ```js
    const paraSalvarTheme = require('./design-system/tailwind-para-salvar.js')

    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        './app/**/*.{vue,js,ts,jsx,tsx}',
        './components/**/*.{vue,js,ts}',
        './pages/**/*.vue',
        './layouts/**/*.vue',
      ],
      theme: {
        extend: paraSalvarTheme.extend,
      },
      plugins: [
        ...paraSalvarTheme.plugins,
      ],
    }
    ```

    The `content` array tells Tailwind which files to scan so unused classes are purged in
    production. The Nuxt `app/` directory structure must be included.
  </description>
  <acceptance>
    - `tailwind.config.js` exists at project root
    - Running `npx tailwindcss --dry-run` (or verifying via dev server) shows no config errors
    - Custom color `primary.DEFAULT` resolves to `#006565`
    - Custom shadow `elevation-1` is present in generated CSS
  </acceptance>
  <effort>30 minutes</effort>
  <owner>Developer</owner>
</task>

<task id="7-003">
  <title>Create app/assets/css/main.css importing design tokens</title>
  <description>
    Create the file `app/assets/css/main.css`. This is the single entry point for global styles.
    It imports the Tailwind directives first, then the design token CSS custom properties.

    No `app/assets/` directory currently exists — create it.

    File: `app/assets/css/main.css`

    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    /* Para Salvar A Cuba Design System Tokens */
    @import '../../design-system/design-tokens.css';

    /* Base typography defaults */
    html {
      font-family: var(--font-body);
      color: var(--color-on-surface);
      background-color: var(--color-background);
    }

    /* Respect reduced motion preferences */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    ```

    Note: The relative path `../../design-system/design-tokens.css` is correct because
    `main.css` lives at `app/assets/css/` and the design system is at the project root.
  </description>
  <acceptance>
    - `app/assets/css/main.css` exists with the above content
    - The import path resolves correctly (no 404 in network tab)
    - CSS custom properties defined in `design-tokens.css` (e.g., `--color-primary`) are visible
      in the browser's DevTools `:root` computed styles
  </acceptance>
  <effort>20 minutes</effort>
  <owner>Developer</owner>
</task>

<task id="7-004">
  <title>Update nuxt.config.ts to register CSS, Tailwind module, and Google Fonts</title>
  <description>
    Update `nuxt.config.ts` to:
    1. Register `@nuxtjs/tailwindcss` in the `modules` array
    2. Point to `tailwind.config.js` via the tailwindcss module config
    3. Add `app/assets/css/main.css` to the global `css` array
    4. Load Manrope and Inter from Google Fonts via `app.head.link`

    Current file is at `nuxt.config.ts`. Replace its contents with:

    ```ts
    // https://nuxt.com/docs/api/configuration/nuxt-config
    export default defineNuxtConfig({
      modules: ['@pinia/nuxt', '@nuxtjs/i18n', '@nuxtjs/tailwindcss'],
      compatibilityDate: '2025-07-15',
      devtools: { enabled: true },

      css: ['~/assets/css/main.css'],

      tailwindcss: {
        configPath: '../tailwind.config.js',
      },

      app: {
        head: {
          link: [
            {
              rel: 'preconnect',
              href: 'https://fonts.googleapis.com',
            },
            {
              rel: 'preconnect',
              href: 'https://fonts.gstatic.com',
              crossorigin: '',
            },
            {
              rel: 'stylesheet',
              href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap',
            },
          ],
        },
      },

      runtimeConfig: {
        databaseUrl: process.env.DATABASE_URL || '',
      },

      i18n: {
        defaultLocale: 'es',
        langDir: 'locales',
        locales: [
          { code: 'en', name: 'English', file: 'en.json' },
          { code: 'es', name: 'Spanish', file: 'es.json' },
          { code: 'pt', name: 'Portuguese', file: 'pt.json' },
        ],
      },
    })
    ```

    Note on `tailwindcss.configPath`: `nuxt.config.ts` lives at the project root (not inside
    `app/`), so the path `'../tailwind.config.js'` is relative to the project root and resolves
    correctly one level up from wherever Nuxt's module resolver looks. Test that `pnpm dev` does
    not throw a config-not-found error. If the path still fails in some setups, use an absolute
    path as a fallback:
    ```ts
    tailwindcss: {
      configPath: new URL('./tailwind.config.js', import.meta.url).pathname,
    },
    ```
  </description>
  <acceptance>
    - `@nuxtjs/tailwindcss` is in the modules array
    - `~/assets/css/main.css` is in the `css` array
    - Google Fonts links appear in the `<head>` of rendered HTML
    - `pnpm dev` starts without errors
    - Tailwind utility classes (`bg-primary`, `text-body-lg`, etc.) produce styles in the browser
  </acceptance>
  <effort>45 minutes</effort>
  <owner>Developer</owner>
</task>

<task id="7-005">
  <title>Smoke-test the foundation</title>
  <description>
    Manually verify the integration is working end-to-end before downstream plans begin.

    Steps:
    1. Run `pnpm dev`
    2. Open http://localhost:3000 in a browser
    3. Open DevTools → Elements → :root computed styles
       - Confirm `--color-primary: #006565` is present
       - Confirm `--font-body: 'Inter', sans-serif` is present
       - Confirm `--shadow-elevation-1: 0 1px 3px ...` is present
    4. In DevTools console, run:
       `getComputedStyle(document.documentElement).getPropertyValue('--color-primary')`
       Should return `" #006565"` (with possible leading space)
    5. Temporarily add `class="bg-primary text-white p-4"` to any element in index.vue,
       verify teal background renders, then remove the change
    6. Open Network tab, confirm Google Fonts CSS loads (status 200)
    7. Verify no CSS-related console errors

    Document any failures and resolve before proceeding to Wave 2 plans.
  </description>
  <acceptance>
    - All 7 steps complete without errors
    - CSS variables are accessible from DevTools
    - Tailwind bg-primary class applies correct teal color
    - Fonts load from Google Fonts CDN
    - Dev server runs stably for >1 minute without crashing
  </acceptance>
  <effort>30 minutes</effort>
  <owner>Developer</owner>
</task>

---

## Verification

After all tasks complete, run the following check:

```bash
# From project root
pnpm dev &
sleep 5
curl -s http://localhost:3000 | grep -c "fonts.googleapis.com"
# Should output: 1 or more (font links present in HTML)
```

In the browser:
1. DevTools → Sources → verify `design-tokens.css` is loaded
2. DevTools → Elements → `<html>` → Computed → filter `--color` → should list all design token variables
3. DevTools → Elements → `<html>` → Computed → filter `font-family` → body text should show `Inter`

**The Wave 2 plans (components, interactions) may not begin until this plan is verified complete.**
