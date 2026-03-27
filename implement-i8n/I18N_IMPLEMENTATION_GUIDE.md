# Nuxt 4 Internationalization (i18n) Implementation Guide

## Executive Summary

This document provides a comprehensive guide for properly implementing internationalization (i18n) in Nuxt 4 with vue-i18n. It covers the official recommended approach, configuration, and best practices based on the latest Nuxt 4 and @nuxtjs/i18n v9+ documentation.

---

## 1. Recommended Approach: @nuxtjs/i18n Module (NOT Plain Vue-i18n)

### Decision: Use the @nuxtjs/i18n Module

**Official Recommendation:** Always use the `@nuxtjs/i18n` module instead of manually setting up vue-i18n through a plugin.

**Why?**
- ✅ **Official Support**: Maintained by the Nuxt team specifically for Nuxt integration
- ✅ **Advanced Features**: Includes built-in support for:
  - Localized routing with URL prefixes (e.g., `/en/`, `/es/`)
  - SEO meta tags per locale
  - Automatic locale detection and redirects
  - Cookie-based locale persistence
  - Server-side rendering (SSR) support
  - Lazy-loading of locale files
- ✅ **Auto-imports**: Automatically imports `useI18n()` and other i18n composables
- ✅ **Zero Configuration Option**: Works with sensible defaults
- ❌ **Plain Vue-i18n Limitation**: A manual plugin setup lacks routing, SEO, and advanced features

### Current Project Status

Your project **already has the module installed** (`@nuxtjs/i18n@^9.5.6`) but is **using a manual plugin approach** instead of the module. This setup is:
- ❌ Missing advanced i18n features
- ❌ Not using auto-imports efficiently
- ❌ Not using locale routing with URL prefixes
- ❌ Duplicating functionality the module provides

---

## 2. Official Setup for Nuxt 4

### Step 1: Ensure @nuxtjs/i18n is Installed

```bash
npm install @nuxtjs/i18n@latest
# or
pnpm add @nuxtjs/i18n
```

**Current Status**: ✅ Already installed (v9.5.6)

### Step 2: Update nuxt.config.ts

```typescript
export default defineNuxtConfig({
  srcDir: 'app',
  modules: [
    '@nuxtjs/i18n',  // ADD THIS
    '@pinia/nuxt',
  ],
  i18n: {
    // Core locales configuration
    locales: [
      { code: 'en', language: 'en-US', name: 'English' },
      { code: 'es', language: 'es-ES', name: 'Español' },
      { code: 'pt', language: 'pt-BR', name: 'Português' },
    ],
    defaultLocale: 'es',

    // Routing strategy (see section 6)
    strategy: 'prefix_except_default',

    // Locale detection and persistence
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root', // For better SEO
      alwaysRedirect: false,
    },

    // Optional: Lazy-load messages
    lazy: true,

    // Optional: Composition API only (recommended)
    compositionOnly: true,
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
  },
})
```

### Step 3: Create i18n.config.ts (Optional but Recommended)

Create `/app/i18n.config.ts`:

```typescript
import en from './locales/en.json'
import es from './locales/es.json'
import pt from './locales/pt.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'es',
  fallbackLocale: 'es',
  messages: {
    en,
    es,
    pt,
  },
}))
```

**When to use**: This is useful if you want to keep locale configuration separate from `nuxt.config.ts` or if you plan to use lazy-loading later.

### Step 4: Remove the Manual Plugin

**Delete or disable**: `/app/plugins/i18n.ts`

The module handles this automatically now.

---

## 3. Auto-Import of useI18n Composable

### How It Works with @nuxtjs/i18n

When using the `@nuxtjs/i18n` module:

✅ **Automatic Auto-import**: The module automatically configures Nuxt to auto-import:
- `useI18n()` - The main composable for accessing locale, t() function, etc.
- `useLocalePath()` - Get locale-prefixed paths
- `useLocaleRoute()` - Get locale-specific route objects
- `useSetLocaleLocale()` - Set the current locale

✅ **No Manual Configuration Needed**: You don't need to modify your `nuxt.config.ts` imports section.

### Usage in Components

```vue
<script setup lang="ts">
// No import needed! These are auto-imported
const { t, locale } = useI18n()
const localePath = useLocalePath()

// Usage in template
// t('nav.newIdea') returns the translated string
// locale.value contains current locale code (e.g., 'es', 'en')
</script>
```

### If Auto-Import Fails

If for some reason auto-imports aren't working:

```typescript
// Import explicitly from #imports
import { useI18n } from '#imports'

// Or from vue-i18n directly (if module auto-imports are disabled)
import { useI18n } from 'vue-i18n'
```

---

## 4. @nuxtjs/i18n Configuration for Nuxt 4

### Complete Configuration Reference

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],

  i18n: {
    // ===== LOCALES CONFIGURATION =====
    locales: [
      {
        code: 'en',
        name: 'English',
        language: 'en-US', // BCP-47 language tag
      },
      {
        code: 'es',
        name: 'Español',
        language: 'es-ES',
      },
      {
        code: 'pt',
        name: 'Português',
        language: 'pt-BR',
      },
    ],

    defaultLocale: 'es', // Fallback locale

    // ===== ROUTING CONFIGURATION =====
    strategy: 'prefix_except_default', // See section 6

    // ===== LOCALE DETECTION & PERSISTENCE =====
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'NUXT_LANGUAGE', // Cookie name
      cookieCrossOrigin: false,
      alwaysRedirect: false,
      redirectOn: 'root', // When to redirect (recommended for SEO)
    },

    // ===== MESSAGE LOADING =====
    langDir: 'locales/', // Relative to app directory

    // Lazy-load: Only load selected locale messages
    lazy: true,

    // For lazy-loading, specify file extension and format
    // parser: '@intlify/unplugin-vue-i18n/messages', // If using JSON

    // ===== COMPOSITION API =====
    compositionOnly: true, // Use only Composition API (recommended)

    // ===== SEO & METADATA =====
    // The module handles HTML lang attribute automatically
    // but you should still set it in your root component:
    // useHead({ htmlAttrs: { lang: locale } })
  },
})
```

### Configuration Options Explained

| Option | Purpose | Default |
|--------|---------|---------|
| `locales` | Array of locale definitions with code and name | Required |
| `defaultLocale` | Fallback locale | `undefined` |
| `strategy` | URL routing strategy (see section 6) | `'prefix_except_default'` |
| `useCookie` | Enable cookie-based persistence | `true` |
| `cookieKey` | Name of persistence cookie | `'i18n_redirected'` |
| `redirectOn` | When to perform auto-redirect: `'all'`, `'root'`, `'no'` | `'all'` |
| `langDir` | Directory with locale files (relative to app dir) | `'locales'` |
| `lazy` | Lazy-load messages per locale | `false` |
| `compositionOnly` | Use only Composition API | `false` |

---

## 5. Project-Specific Setup for parasalvaracuba.org

### Current Status

✅ **Existing Locale Files**:
- `/app/locales/en.json` - English translations
- `/app/locales/es.json` - Spanish translations
- `/app/locales/pt.json` - Portuguese translations

✅ **Existing Usage**: Components already use `useI18n()` correctly

❌ **Issues to Fix**:
1. Using manual plugin instead of @nuxtjs/i18n module
2. Not leveraging module's routing and SEO features
3. Manual localStorage persistence instead of built-in cookie support

### Recommended Migration Steps

#### Step 1: Update nuxt.config.ts

Replace the current config with:

```typescript
export default defineNuxtConfig({
  srcDir: 'app',
  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
  ],

  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name: 'English' },
      { code: 'es', language: 'es-ES', name: 'Español' },
      { code: 'pt', language: 'pt-BR', name: 'Português' },
    ],
    defaultLocale: 'es',
    strategy: 'prefix_except_default',
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'parasalvara_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
    compositionOnly: true,
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
  },
})
```

#### Step 2: Delete the Manual Plugin

Remove or rename `/app/plugins/i18n.ts` - the module handles initialization.

#### Step 3: Update URL Switching

Your `LanguageSwitcher.vue` can remain mostly the same, but update it to use the module's routing:

```vue
<template>
  <div class="lang-switcher">
    <NuxtLink
      v-for="loc in localeOptions"
      :key="loc.code"
      :to="localeRoute({ name: route.name, params: route.params })"
      :class="['lang-btn', { active: loc.code === locale }]"
    >
      {{ loc.name }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const { localeRoute } = useI18n() // NEW: built-in helper
const route = useRoute()

const localeOptions = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
]
</script>
```

#### Step 4: Update app.vue

No changes needed - it already correctly uses `useI18n()`:

```vue
<script setup lang="ts">
const { locale } = useI18n()
useHead({ htmlAttrs: { lang: locale } })
// ...
</script>
```

---

## 6. Locale Routing with URL Prefixes

### Overview

The @nuxtjs/i18n module automatically adds locale prefixes to all routes based on your chosen strategy.

### The Four Routing Strategies

#### Strategy 1: `'prefix_except_default'` (Recommended)

- **Default locale**: Routes accessible WITHOUT prefix
- **Other locales**: Routes accessible WITH locale prefix
- **Example**:
  - English (default): `/` → `/about` → `/ideas/42`
  - Spanish: `/es/` → `/es/about` → `/es/ideas/42`
  - Portuguese: `/pt/` → `/pt/about` → `/pt/ideas/42`

```typescript
i18n: {
  strategy: 'prefix_except_default',
  defaultLocale: 'es',
}
```

#### Strategy 2: `'prefix'`

- **All locales**: Routes have locale prefix
- **Example**:
  - English: `/en/` → `/en/about`
  - Spanish: `/es/` → `/es/about`
  - Portuguese: `/pt/` → `/pt/about`

```typescript
i18n: {
  strategy: 'prefix',
  defaultLocale: 'es',
}
```

#### Strategy 3: `'prefix_and_default'`

- **Default locale**: Accessible both WITH and WITHOUT prefix
- **Other locales**: Prefix required
- **Example**:
  - English: `/` OR `/en/` → `/about` OR `/en/about`
  - Spanish: `/es/` → `/es/about`
  - Portuguese: `/pt/` → `/pt/about`

```typescript
i18n: {
  strategy: 'prefix_and_default',
  defaultLocale: 'en',
}
```

#### Strategy 4: `'no_prefix'`

- **No locale prefixes** in URLs
- **Locale detection**: Via cookie, browser language, or manual switching
- **Example**: `/about` works for all locales
- **Best for**: Apps where locale switching doesn't change URL

```typescript
i18n: {
  strategy: 'no_prefix',
  defaultLocale: 'es',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_locale',
  },
}
```

### Recommendation for parasalvaracuba.org

**Suggested**: `'prefix_except_default'` with `defaultLocale: 'es'`

Why?
- Spanish is the primary language
- Other languages (English, Portuguese) clearly prefixed for clarity
- SEO-friendly: default locale doesn't have extra prefix
- User-friendly: `/ideas` is shorter than `/es/ideas` for main audience

### Navigation with Locale Routes

Use the `useLocalePath()` composable to generate locale-specific paths:

```vue
<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

const paths = {
  home: localePath('/'),
  ideas: localePath('/ideas/[id]'),
  settings: localePath('/settings'),
}
</script>

<template>
  <NuxtLink :to="paths.home">Home</NuxtLink>
  <NuxtLink :to="paths.ideas">Ideas</NuxtLink>
  <NuxtLink :to="paths.settings">Settings</NuxtLink>
</template>
```

---

## 7. Locale Switching and Persistence

### Method 1: Built-In Cookie Persistence (Recommended)

The @nuxtjs/i18n module handles this automatically:

```typescript
i18n: {
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'parasalvara_locale',
    redirectOn: 'root',
    alwaysRedirect: false,
  },
}
```

**How it works**:
1. User's browser language is detected on first visit
2. If a supported locale is available, they're redirected to it
3. A cookie is set remembering their choice
4. On future visits, the cookie is checked first before browser language
5. Cookie expires after 365 days (configurable)

### Method 2: Manual Locale Switching

Switch locale without URL change (for `no_prefix` strategy):

```vue
<script setup lang="ts">
const i18n = useI18n()

function switchLocale(locale: string) {
  i18n.locale.value = locale
  // Cookie is updated automatically by the module
}
</script>

<template>
  <button @click="switchLocale('en')">English</button>
  <button @click="switchLocale('es')">Español</button>
  <button @click="switchLocale('pt')">Português</button>
</template>
```

### Method 3: Route-Based Switching (For `prefix_*` Strategies)

Switch locale by navigating to locale-prefixed route:

```vue
<script setup lang="ts">
const { locale } = useI18n()
const route = useRoute()

function switchToLocale(newLocale: string) {
  // Navigate to the same page in the new locale
  navigateTo(
    switchLocalePath(newLocale) // Built-in helper
  )
}
</script>

<template>
  <NuxtLink :to="switchLocalePath('en')">English</NuxtLink>
  <NuxtLink :to="switchLocalePath('es')">Español</NuxtLink>
  <NuxtLink :to="switchLocalePath('pt')">Português</NuxtLink>
</template>
```

### Current Implementation Issues

Your `LanguageSwitcher.vue` uses localStorage directly:

```typescript
// Current (manual):
function switchLocale(code: string) {
  const i18n = useI18n()
  i18n.locale.value = code
  localStorage.setItem('locale', code) // ❌ Manual persistence
}
```

**Problem**: localStorage doesn't work on servers and isn't used by the module's routing logic.

**Solution**: Replace with the module's built-in persistence (see above).

---

## 8. SEO Considerations

### HTML Lang Attribute

The module automatically sets the HTML `lang` attribute. Ensure it's set in your root component:

```vue
<!-- app.vue -->
<script setup lang="ts">
const { locale } = useI18n()
useHead({
  htmlAttrs: {
    lang: locale, // ✅ Must be reactive
  },
})
</script>
```

### OpenGraph and Canonical Tags

For proper SEO with multiple locales:

```vue
<script setup lang="ts">
const { locale, t } = useI18n()
const route = useRoute()

useHead({
  title: t('home.title'),
  ogLocale: locale,
  link: [
    {
      rel: 'alternate',
      hrefLang: 'x-default',
      href: useLocalePath({ name: route.name })('en'),
    },
    {
      rel: 'alternate',
      hrefLang: 'en',
      href: useLocalePath({ name: route.name })('en'),
    },
    {
      rel: 'alternate',
      hrefLang: 'es',
      href: useLocalePath({ name: route.name })('es'),
    },
    {
      rel: 'alternate',
      hrefLang: 'pt',
      href: useLocalePath({ name: route.name })('pt'),
    },
  ],
})
</script>
```

---

## 9. Lazy-Loading Locale Messages

For large applications, lazy-loading reduces initial bundle size:

```typescript
export default defineNuxtConfig({
  i18n: {
    langDir: 'locales/',
    lazy: true,
    defaultLocale: 'es',
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'es', file: 'es.json' },
      { code: 'pt', file: 'pt.json' },
    ],
  },
})
```

**File structure required**:
```
app/locales/
├── en.json
├── es.json
└── pt.json
```

Only the selected locale's messages are loaded into memory.

---

## 10. Comparison: Current vs. Recommended Approach

### Current Implementation (Manual Plugin)

```
Status: ❌ Suboptimal
├── ✅ Basic i18n works
├── ❌ No automatic routing with prefixes
├── ❌ No SEO optimizations
├── ❌ Manual persistence (localStorage)
├── ❌ No lazy-loading support
├── ❌ Duplicates @nuxtjs/i18n functionality
└── ❌ Not leveraging auto-imports
```

### Recommended Implementation (@nuxtjs/i18n Module)

```
Status: ✅ Optimal
├── ✅ Full i18n support
├── ✅ Automatic URL routing (/en/, /es/, /pt/)
├── ✅ Built-in SEO support (hreflang, og:locale)
├── ✅ Secure cookie-based persistence
├── ✅ Server-side rendering (SSR) support
├── ✅ Lazy-loading for performance
├── ✅ Browser language auto-detection
└── ✅ Auto-imports useI18n() and helpers
```

---

## 11. Troubleshooting

### Issue: useI18n() not auto-imported

**Cause**: Auto-imports disabled or module not loaded
**Solution**:
```typescript
// Ensure module is listed first
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n', '@pinia/nuxt'],
})

// Or import explicitly
import { useI18n } from 'vue-i18n'
```

### Issue: Routes not prefixed with locale

**Cause**: Strategy not set correctly or module not loaded
**Solution**:
```typescript
i18n: {
  strategy: 'prefix_except_default',
  defaultLocale: 'es',
  locales: [
    { code: 'en', language: 'en-US' },
    // ... more locales
  ],
}
```

### Issue: Locale resets on page refresh

**Cause**: Cookie persistence disabled
**Solution**:
```typescript
i18n: {
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_locale',
  },
}
```

### Issue: Messages not loading

**Cause**: Wrong `langDir` path or file format
**Solution**: Ensure:
- `langDir: 'locales/'` is relative to `srcDir: 'app'`
- Files are named `{code}.json` (e.g., `en.json`)
- JSON is valid

---

## 12. Quick Reference: Configuration Template

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  srcDir: 'app',

  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
  ],

  i18n: {
    // Locales configuration
    locales: [
      { code: 'en', language: 'en-US', name: 'English' },
      { code: 'es', language: 'es-ES', name: 'Español' },
      { code: 'pt', language: 'pt-BR', name: 'Português' },
    ],
    defaultLocale: 'es',

    // Routing
    strategy: 'prefix_except_default',

    // Message loading
    langDir: 'locales/',

    // Persistence
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'parasalvara_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
    },

    // API style
    compositionOnly: true,
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
  },
})
```

---

## 13. Resources and Documentation

### Official Documentation
- [Nuxt i18n Module Official Docs](https://i18n.nuxtjs.org/)
- [Nuxt i18n Installation](https://i18n.nuxtjs.org/docs/getting-started)
- [Nuxt i18n Routing Guide](https://i18n.nuxtjs.org/docs/guide)
- [Nuxt i18n API Options](https://i18n.nuxtjs.org/docs/api/options)
- [Vue I18n (underlying library)](https://vue-i18n.intlify.dev/)
- [Nuxt Auto-imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports)

### Key Version Info
- **Nuxt**: 4.4.2
- **@nuxtjs/i18n**: ^9.5.6 (compatible with Nuxt 4)
- **vue-i18n**: Integrated via @nuxtjs/i18n

---

## 14. Migration Checklist

- [ ] Add `'@nuxtjs/i18n'` to modules in `nuxt.config.ts`
- [ ] Add `i18n` configuration object to `nuxt.config.ts`
- [ ] Delete or disable `/app/plugins/i18n.ts`
- [ ] Update `/app/components/LanguageSwitcher.vue` to use `switchLocalePath()` or route-based navigation
- [ ] Remove localStorage calls from locale switching
- [ ] Test locale switching and persistence with cookies
- [ ] Verify URL routing (e.g., `/es/ideas/1`, `/en/ideas/1`)
- [ ] Test browser language detection on first visit
- [ ] Verify `useI18n()` is auto-imported in all components
- [ ] Check HTML `lang` attribute updates with locale
- [ ] Test SSR (if applicable)
- [ ] Validate SEO tags (hreflang, og:locale)

---

## Summary

**The recommended approach for Nuxt 4 i18n is:**

1. ✅ Use **@nuxtjs/i18n module** (already installed in your project)
2. ✅ Configure it in **nuxt.config.ts** (not as a plugin)
3. ✅ Use **`prefix_except_default` routing strategy** for your use case
4. ✅ Enable **cookie-based persistence** for locale preference
5. ✅ Rely on **auto-imports** for `useI18n()` and related composables
6. ✅ Remove the manual **plugin/localStorage approach**

This approach provides a complete, production-ready i18n solution with proper routing, SEO support, and persistence.
