# Skill: Implement i18n in Nuxt 4 Projects

A comprehensive skill for setting up internationalization (i18n) in Nuxt 4 using the official `@nuxtjs/i18n` module.

## Overview

This skill provides step-by-step guidance for implementing proper i18n support in Nuxt 4 projects, including:
- Automatic URL-based locale routing (`/en/`, `/es/`, `/pt/`)
- Cookie-based locale persistence
- SEO optimization per locale
- Browser language detection
- Auto-imports for i18n composables

## When to Use

Use this skill when:
- Setting up internationalization in a Nuxt 4 project
- Migrating from manual Vue-i18n plugin to `@nuxtjs/i18n` module
- Implementing locale routing and persistence
- Configuring multi-language support with SEO features

## Prerequisites

- Nuxt 4.x project
- `@nuxtjs/i18n@^9.5.6` installed (`npm install @nuxtjs/i18n`)
- Locale JSON files created (e.g., `app/locales/en.json`, `app/locales/es.json`)
- Basic understanding of Nuxt configuration

## Implementation Steps

### Phase 1: Configuration (5 minutes)

#### Step 1: Update nuxt.config.ts

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  srcDir: 'app',
  modules: [
    '@nuxtjs/i18n',    // ADD THIS
    '@pinia/nuxt',     // Keep existing modules
  ],
  i18n: {              // ADD THIS ENTIRE BLOCK
    // Define your locales
    locales: [
      { code: 'en', language: 'en-US', name: 'English' },
      { code: 'es', language: 'es-ES', name: 'Español' },
      { code: 'pt', language: 'pt-BR', name: 'Português' },
    ],

    // Set default locale
    defaultLocale: 'es',

    // URL routing strategy
    // 'prefix_except_default': Default locale has no prefix (/)
    // Others get prefixes (/en/, /pt/)
    strategy: 'prefix_except_default',

    // Locale files directory (relative to srcDir)
    langDir: 'locales/',

    // Browser language detection and persistence
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'your_app_locale',
      redirectOn: 'root',        // Redirect only on root
      alwaysRedirect: false,      // Don't redirect on every page
    },

    // Optional: Use Composition API only
    compositionOnly: true,
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
})
```

#### Step 2: Create i18n.config.ts (Optional but Recommended)

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

### Phase 2: Component Updates (3 minutes)

#### Step 3: Update LanguageSwitcher Component

Create or update `/app/components/LanguageSwitcher.vue`:

```vue
<template>
  <div class="lang-switcher">
    <NuxtLink
      v-for="loc in localeOptions"
      :key="loc.code"
      :to="switchLocalePath(loc.code)"
      :class="['lang-btn', { active: loc.code === locale }]"
      :aria-current="loc.code === locale ? 'true' : undefined"
    >
      {{ loc.name }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
// Auto-imported by @nuxtjs/i18n module - no import needed
const { locale, switchLocalePath } = useI18n()

const localeOptions = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
]
</script>

<style scoped>
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.lang-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s;
  text-decoration: none;
}

.lang-btn:hover {
  opacity: 1;
}

.lang-btn.active {
  opacity: 1;
  border-color: white;
  font-weight: 700;
}
</style>
```

#### Step 4: Update Root Component (app.vue)

Ensure your root component sets the HTML lang attribute:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'

// useI18n is auto-imported by the module
const { locale } = useI18n()

// Set HTML lang attribute dynamically
useHead({ htmlAttrs: { lang: locale } })

onMounted(() => {
  // Your app initialization
})
</script>
```

#### Step 5: Remove Manual Plugin (if exists)

Delete `/app/plugins/i18n.ts` if it exists. The module handles everything now.

### Phase 3: Testing & Verification (5 minutes)

#### Step 6: Start Dev Server

```bash
npm run dev
```

#### Step 7: Test URLs

Verify these URLs work:
- `http://localhost:3000/` - Default locale (Spanish)
- `http://localhost:3000/en/` - English
- `http://localhost:3000/pt/` - Portuguese

#### Step 8: Verify Features

Test the following:
- ✅ URLs have correct locale prefixes
- ✅ Language switcher buttons work
- ✅ Page content translates when switching locales
- ✅ Refresh page → locale persists (via cookie)
- ✅ HTML `lang` attribute updates
- ✅ No console errors

## Key Features Unlocked

### 1. Auto-Imports
These work automatically in any component:

```typescript
const { locale, t, locales } = useI18n()
const path = useLocalePath('/ideas/1')
const newPath = switchLocalePath('en')
```

### 2. URL Routing
Automatic locale-based routing:
```
Spanish (default):  /                /ideas/1          /settings
English:            /en/             /en/ideas/1       /en/settings
Portuguese:         /pt/             /pt/ideas/1       /pt/settings
```

### 3. Cookie Persistence
Locale choice automatically saved:
```
Cookie: your_app_locale=es
Expires: (session or configured)
```

### 4. Browser Detection
Automatically detects and redirects based on browser language on first visit.

### 5. SSR Support
Full server-side rendering support for proper meta tags and performance.

## Configuration Options Reference

### Routing Strategies

- `'prefix'` - All locales have prefix: `/es/`, `/en/`, `/pt/`
- `'prefix_except_default'` - Default has no prefix: `/`, `/en/`, `/pt/` ✅ Recommended
- `'no_prefix'` - No prefixes (use query params or other detection)

### Locale Detection

```typescript
detectBrowserLanguage: {
  useCookie: true,                    // Use cookies
  cookieKey: 'your_app_locale',      // Cookie name
  redirectOn: 'root',                // Redirect on root only
  alwaysRedirect: false,             // Don't redirect everywhere
  fallbackLocale: 'es',              // Fallback if detection fails
}
```

### Common locale property combinations

```typescript
locales: [
  {
    code: 'en',                       // Unique locale code
    language: 'en-US',               // BCP 47 language tag
    name: 'English',                 // Display name
    iso: 'en-US',                    // ISO code (optional)
  }
]
```

## Troubleshooting

### Issue: useI18n() not found
**Solution:** Ensure `@nuxtjs/i18n` is in modules array in nuxt.config.ts

### Issue: Routes don't have `/en/` prefix
**Solution:** Check you have:
```typescript
strategy: 'prefix_except_default',
defaultLocale: 'es',
```

### Issue: Locale resets on page refresh
**Solution:** Verify cookie settings:
```typescript
detectBrowserLanguage: {
  useCookie: true,
  cookieKey: 'your_app_locale',
}
```

### Issue: Translations show keys instead of values
**Solution:** Ensure locale JSON files exist and are properly imported in i18n.config.ts

## File Structure

After implementation:
```
app/
├── components/
│   └── LanguageSwitcher.vue     ← Updated
├── locales/
│   ├── en.json                  ← Existing
│   ├── es.json                  ← Existing
│   └── pt.json                  ← Existing
├── app.vue                       ← Updated
└── i18n.config.ts              ← New (optional)

nuxt.config.ts                    ← Updated
```

## Best Practices

1. **Use meaningful locale codes**: Use standard BCP 47 language tags (`en-US`, `es-ES`, etc.)
2. **Set a sensible default**: Choose the most common language for your users
3. **Implement language switcher UI**: Always give users easy way to change language
4. **Test all locales**: Test every page in every language before deploying
5. **Use cookie persistence**: Respects user preference across sessions
6. **Set HTML lang attribute**: Improves accessibility and SEO
7. **Handle missing translations**: Use fallback locale configuration

## Advanced Features (Not Covered in Basic Setup)

- Lazy loading of locale files
- Custom locale detection
- Generating hreflang tags for SEO
- Using i18n in Nitro server routes
- API integration for user language preferences
- Dynamic route names per locale

For advanced features, refer to official documentation at https://i18n.nuxtjs.org/

## Official Resources

- [Nuxt i18n Module Docs](https://i18n.nuxtjs.org/)
- [Getting Started Guide](https://i18n.nuxtjs.org/docs/getting-started)
- [Routing Guide](https://i18n.nuxtjs.org/docs/guide)
- [API Reference](https://i18n.nuxtjs.org/docs/api/options)
- [Vue I18n (underlying library)](https://vue-i18n.intlify.dev/)

## Success Criteria

After following this skill, you should have:
- ✅ Working URL-based locale routing
- ✅ Functional language switcher
- ✅ Persistent locale selection (via cookie)
- ✅ Browser language detection
- ✅ Auto-imports for i18n composables
- ✅ Proper HTML lang attribute
- ✅ All existing translations working
- ✅ No console errors

## Time Estimate

- Configuration: 5 minutes
- Component updates: 3 minutes
- Testing: 5-10 minutes
- **Total: 15-20 minutes**

## Support

If you encounter issues not covered here:
1. Check official documentation at https://i18n.nuxtjs.org/
2. Review the troubleshooting section above
3. Check browser console for specific error messages
4. Verify all files are in correct locations
5. Restart dev server after configuration changes

---

**Last Updated:** March 27, 2026
**Tested With:** Nuxt 4.4.2, @nuxtjs/i18n 9.5.6
