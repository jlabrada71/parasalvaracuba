# Nuxt 4 i18n Quick Setup Guide

For parasalvaracuba.org - Implementation in 5 minutes

---

## Step 1: Update nuxt.config.ts (30 seconds)

Replace your current `nuxt.config.ts`:

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app',
  modules: [
    '@nuxtjs/i18n',    // ADD THIS
    '@pinia/nuxt',
  ],
  i18n: {             // ADD THIS ENTIRE BLOCK
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

---

## Step 2: Delete the Plugin (20 seconds)

Delete this file (the module handles it now):
```
app/plugins/i18n.ts  ← DELETE THIS FILE
```

---

## Step 3: Update LanguageSwitcher.vue (2 minutes)

Replace `app/components/LanguageSwitcher.vue`:

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

---

## Step 4: Verify app.vue

No changes needed, but verify it has this:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/authStore'

const auth = useAuthStore()
const { locale } = useI18n()  // ✅ This is auto-imported now

useHead({ htmlAttrs: { lang: locale } })

onMounted(() => auth.init())
</script>
```

---

## Step 5: Test It

```bash
npm run dev
```

Test these URLs:
- ✅ `http://localhost:3000/` - Spanish (default, no prefix)
- ✅ `http://localhost:3000/en/` - English
- ✅ `http://localhost:3000/pt/` - Portuguese
- ✅ Click language switcher buttons
- ✅ Refresh page → locale persists (via cookie)

---

## What Changed?

| Before | After |
|--------|-------|
| Manual plugin setup | @nuxtjs/i18n module |
| localStorage persistence | Cookie-based persistence |
| No URL locale prefixes | `/en/`, `/es/`, `/pt/` prefixes |
| Manual imports needed | Auto-imports work |
| Limited features | Full routing, SEO, browser detection |

---

## Your Locale Files (No Changes Needed)

Already correct:
- ✅ `/app/locales/en.json`
- ✅ `/app/locales/es.json`
- ✅ `/app/locales/pt.json`

---

## What Gets Auto-Imported Now

These work anywhere without `import` statements:

```typescript
const { locale, t, locales } = useI18n()
const path = useLocalePath('/ideas/1')
const newPath = switchLocalePath('en')
const route = useLocaleRoute({ name: 'ideas-id' })
```

---

## Cookie Details

The module sets this cookie automatically:
```
Cookie: parasalvara_locale=es
```

This persists the user's language choice. You don't need to manage it.

---

## SEO Automatically Handled

The module automatically:
- ✅ Sets HTML `lang` attribute correctly
- ✅ Generates locale-specific routes
- ✅ Supports hreflang tags (with extra config)

---

## Common Issues & Fixes

### Routes not showing `/en/` prefix?
Check that you have:
```typescript
strategy: 'prefix_except_default',
defaultLocale: 'es',
```

### useI18n() not found?
Make sure module is listed:
```typescript
modules: ['@nuxtjs/i18n', '@pinia/nuxt']
```

### Locale resets on refresh?
Verify cookie settings:
```typescript
detectBrowserLanguage: {
  useCookie: true,
  cookieKey: 'parasalvara_locale',
}
```

---

## You're Done! 🎉

That's it. The module handles everything else.

- Locale detection
- Cookie persistence
- URL routing
- Auto-imports
- SSR support
- SEO features

See `I18N_IMPLEMENTATION_GUIDE.md` for advanced features and deep dives.
