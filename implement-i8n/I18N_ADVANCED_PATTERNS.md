# Nuxt 4 i18n Advanced Patterns & Best Practices

Advanced patterns for complex i18n scenarios in Nuxt 4

---

## 1. Advanced useI18n() Composable Usage

### Basic Usage

```vue
<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()

// t() - Translate keys
const title = t('home.title')

// locale - Current locale (reactive)
console.log(locale.value) // 'es'

// locales - Array of all available locales
locales.value.forEach(l => console.log(l.code))

// setLocale() - Change locale programmatically
setLocale('en')
</script>
```

### Advanced Features

```typescript
// 1. Pluralization
const count = ref(3)
const message = computed(() =>
  t('comments.title', count.value) // Uses {count} in translation
)

// 2. List formatting
const i18n = useI18n()
const list = i18n.t('common.list', { list: ['apples', 'oranges'] })

// 3. Date/Number formatting
const { d, n } = useI18n()
const formattedDate = d(new Date(), 'short') // Uses locale-specific format
const formattedNumber = n(1234.56) // Uses locale-specific separators

// 4. HTML messages with dangerouslySetInnerHTML
const htmlMessage = t('common.htmlContent')
// In template:
// <div v-html="htmlMessage"></div>
```

### Composable Return Values

```typescript
interface I18nInstance {
  locale: Ref<string>           // Current locale code
  locales: ComputedRef<Locale[]> // All available locales
  t: Function                   // Translation function
  d: Function                   // Date formatter
  n: Function                   // Number formatter
  tm: Function                  // Get raw message object
  te: Function                  // Check if translation exists
  setLocale: (locale: string) => Promise<void>
  getLocaleMessage: (locale: string) => any
  setLocaleMessage: (locale: string, message: any) => void
  mergeLocaleMessage: (locale: string, message: any) => void
}
```

---

## 2. Locale Switching Patterns

### Pattern 1: Automatic Route Switching (Recommended)

When user changes locale, automatically navigate to same page in new locale:

```vue
<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const { switchLocalePath } = useI18n()

async function changeLocale(newLocale: string) {
  // Get the current page path in the new locale
  const localizedPath = switchLocalePath(newLocale)

  // Navigate to it
  await router.push(localizedPath)
}
</script>

<template>
  <select @change="changeLocale($event.target.value)" :value="locale">
    <option value="en">English</option>
    <option value="es">Español</option>
    <option value="pt">Português</option>
  </select>
</template>
```

### Pattern 2: Locale Dropdown with useLocalePath()

```vue
<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// Create locale options with links
const localeLinks = [
  { code: 'en', name: 'English', path: localePath('/ideas') },
  { code: 'es', name: 'Español', path: localePath('/ideas') },
  { code: 'pt', name: 'Português', path: localePath('/ideas') },
]
</script>

<template>
  <select v-model="locale" @change="() => {}">
    <option v-for="loc in localeLinks" :key="loc.code" :value="loc.code">
      {{ loc.name }}
    </option>
  </select>
</template>
```

### Pattern 3: Custom Hook for Locale Management

```typescript
// composables/useLocaleManager.ts
export const useLocaleManager = () => {
  const router = useRouter()
  const route = useRoute()
  const { locale, switchLocalePath } = useI18n()

  // Save preference and navigate
  const setLocaleAndNavigate = async (newLocale: string) => {
    // The @nuxtjs/i18n module handles cookie automatically,
    // but you can add custom logic here
    console.log(`Switching to ${newLocale}`)

    // Navigate to the new locale version of current page
    const path = switchLocalePath(newLocale)
    await router.push(path)
  }

  // Get all available locales with current status
  const getLocaleStatus = () => {
    return [
      { code: 'en', name: 'English', active: locale.value === 'en' },
      { code: 'es', name: 'Español', active: locale.value === 'es' },
      { code: 'pt', name: 'Português', active: locale.value === 'pt' },
    ]
  }

  return {
    setLocaleAndNavigate,
    getLocaleStatus,
    currentLocale: computed(() => locale.value),
  }
}
```

Usage:
```vue
<script setup lang="ts">
const { setLocaleAndNavigate, getLocaleStatus } = useLocaleManager()
</script>
```

---

## 3. SEO & Meta Tags per Locale

### Setting Locale-Specific Meta Tags

```vue
<script setup lang="ts">
const { locale, t } = useI18n()
const route = useRoute()

useHead({
  // Title changes with locale
  title: computed(() => t('home.title')),

  // Meta tags
  meta: [
    {
      name: 'description',
      content: computed(() => t('home.description')),
    },
    {
      property: 'og:title',
      content: computed(() => t('home.title')),
    },
    {
      property: 'og:description',
      content: computed(() => t('home.description')),
    },
    {
      property: 'og:locale',
      content: computed(() => locale.value === 'pt-BR' ? 'pt_BR' : locale.value),
    },
  ],

  // HTML lang attribute (required)
  htmlAttrs: {
    lang: computed(() => locale.value),
  },
})
</script>
```

### Hreflang Tags for SEO (Advanced)

Add to root component (app.vue) for cross-locale SEO:

```vue
<script setup lang="ts">
const { locales } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

const baseUrl = config.public.baseUrl || 'https://parasalvaracuba.org'

// Generate hreflang links for all locales
const hrefLangLinks = computed(() => {
  const links: any[] = []

  locales.value.forEach(loc => {
    links.push({
      rel: 'alternate',
      hrefLang: loc.language,
      href: `${baseUrl}${useLocalePath(loc.code)(route.path)}`,
    })
  })

  // x-default for search engines
  links.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${baseUrl}/`,
  })

  return links
})

useHead({
  link: hrefLangLinks,
})
</script>
```

---

## 4. Dynamic Locale Loading (Lazy Loading)

For large applications with many locales:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  i18n: {
    langDir: 'locales/',
    lazy: true, // Enable lazy loading
    defaultLocale: 'es',
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'es', file: 'es.json' },
      { code: 'pt', file: 'pt.json' },
    ],
  },
})
```

**Result**: Only the selected locale's messages are loaded, reducing bundle size.

### With Dynamic Messages

```typescript
// Load additional messages at runtime
const i18n = useI18n()

// Load messages from API
async function loadDynamicMessages() {
  const response = await fetch('/api/translations')
  const messages = await response.json()

  i18n.setLocaleMessage('en', {
    ...i18n.getLocaleMessage('en'),
    ...messages.en,
  })
}
```

---

## 5. Middleware for Locale Validation

Ensure only valid locales are accessible:

```typescript
// middleware/validateLocale.ts
export default defineRouteMiddleware((to, from) => {
  const { locales } = useI18n()
  const localeCode = to.params.locale as string | undefined

  // If route has locale parameter, validate it
  if (localeCode) {
    const validLocales = locales.value.map(l => l.code)

    if (!validLocales.includes(localeCode)) {
      // Redirect to default locale version
      return navigateTo(`/` + to.path)
    }
  }
})
```

Usage in pages:
```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'validateLocale',
})
</script>
```

---

## 6. Locale Detection from Different Sources

### Precedence Order

The @nuxtjs/i18n module checks locales in this order:

1. **URL prefix** (e.g., `/en/`) - if using `prefix*` strategy
2. **Query parameter** (optional, with custom config)
3. **Cookie** (if `useCookie: true`)
4. **Browser Accept-Language header**
5. **Default locale**

### Custom Locale Detection

To add custom detection:

```typescript
// plugins/customLocaleDetection.ts
export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n

  // Check custom source (e.g., user profile)
  const userProfileLocale = useAuthStore().user?.locale

  if (userProfileLocale && i18n.locales.map(l => l.code).includes(userProfileLocale)) {
    i18n.locale.value = userProfileLocale
  }
})
```

---

## 7. Message Organization Best Practices

### Structure Large Translation Files

Instead of one giant `en.json`, split by features:

```
app/locales/
├── en.json (core translations)
├── en/
│  ├── home.json
│  ├── ideas.json
│  └── settings.json
├── es.json
├── es/
│  ├── home.json
│  ├── ideas.json
│  └── settings.json
└── ...
```

Merge them in code:

```typescript
// locales/en.json
{
  "nav": { /* ... */ },
  "common": { /* ... */ }
}

// Merge feature files
import enHome from './en/home.json'
import enIdeas from './en/ideas.json'

const messages = {
  en: {
    ...enDefault,
    home: enHome,
    ideas: enIdeas,
  },
}
```

### Translation Key Naming Convention

```json
{
  "page.section.element.state": "Translation",
  "home.hero.title": "Welcome",
  "home.hero.subtitle": "Create ideas",
  "ideas.list.empty": "No ideas yet",
  "ideas.list.error": "Failed to load",
  "ideas.detail.notFound": "Idea not found",
  "common.button.submit": "Submit",
  "common.button.cancel": "Cancel",
  "errors.validation.required": "This field is required",
  "errors.network.timeout": "Request timeout"
}
```

---

## 8. Testing i18n Features

### Testing Translation Output

```typescript
// tests/i18n.spec.ts
import { useI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it } from 'vitest'

describe('i18n', () => {
  let i18n: ReturnType<typeof useI18n>

  beforeEach(() => {
    i18n = useI18n()
  })

  it('should translate keys', () => {
    i18n.locale.value = 'en'
    expect(i18n.t('home.title')).toBe('Ideas for Cuba')

    i18n.locale.value = 'es'
    expect(i18n.t('home.title')).toBe('Ideas para Cuba')
  })

  it('should handle missing keys', () => {
    expect(i18n.t('nonexistent.key')).toBe('nonexistent.key')
  })

  it('should support plural', () => {
    const result = i18n.t('comments.title', 5)
    expect(result).toContain('5')
  })
})
```

### Testing Component with i18n

```typescript
// tests/components/LanguageSwitcher.spec.ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

describe('LanguageSwitcher', () => {
  it('should render all locale buttons', () => {
    const wrapper = mount(LanguageSwitcher)
    const buttons = wrapper.findAll('.lang-btn')
    expect(buttons).toHaveLength(3) // en, es, pt
  })

  it('should mark active locale', () => {
    const wrapper = mount(LanguageSwitcher)
    const active = wrapper.find('.lang-btn.active')
    expect(active.exists()).toBe(true)
  })
})
```

---

## 9. Performance Optimization

### Code Splitting Messages

With lazy loading, each locale loads separately:

```bash
# Build output
dist/
├── _payload.json          (shared)
├── _nuxt/
│  ├── en.json             (loaded only when en is selected)
│  ├── es.json             (loaded only when es is selected)
│  └── ...
```

### Prefetch Other Locales

```vue
<script setup lang="ts">
// Preload other locale messages for faster switching
const { locales, setLocaleMessage } = useI18n()

async function prefetchLocale(code: string) {
  const data = await import(`../locales/${code}.json`)
  setLocaleMessage(code, data.default)
}

// On component mount, prefetch secondary locales
onMounted(() => {
  prefetchLocale('en')
  prefetchLocale('pt')
})
</script>
```

---

## 10. Common Patterns for parasalvaracuba.org

### Pattern: Multilingual Ideas

```vue
<!-- pages/ideas/[id].vue -->
<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const idea = await $fetch(`/api/ideas/${route.params.id}`)

// Translate content keys but keep idea data multilingual
const idealTitle = computed(() => {
  // Idea from database is multilingual
  return idea.title[locale.value] || idea.title.es
})
</script>

<template>
  <div>
    <h1>{{ idealTitle }}</h1>
    <p>{{ t('idea.by') }} {{ idea.author }}</p>
    <p>{{ idea.description[locale.value] || idea.description.es }}</p>
  </div>
</template>
```

### Pattern: Locale-Aware Sorting

```vue
<script setup lang="ts">
const { locale, d } = useI18n()

const ideas = ref([
  { id: 1, createdAt: new Date(), title: 'Idea 1' },
  { id: 2, createdAt: new Date(), title: 'Idea 2' },
])

// Sort with locale-aware date formatting
const sortedIdeas = computed(() => {
  return [...ideas.value].sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  )
})

// Display with locale formatting
function formatDate(date: Date) {
  return d(date, 'short')
}
</script>
```

### Pattern: Language-Specific Validation

```typescript
// composables/useLocaleValidation.ts
export const useLocaleValidation = () => {
  const { locale } = useI18n()

  const getValidationRules = () => {
    return {
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: locale.value === 'en'
          ? 'Invalid email'
          : 'Correo inválido',
      },
      phone: {
        // Different patterns per locale
        pattern: locale.value === 'es'
          ? /^\+?34\d{9}$/
          : /^\+?\d{10,}$/,
      },
    }
  }

  return { getValidationRules }
}
```

---

## 11. Troubleshooting Advanced Scenarios

### Locale Changes Not Reflected in Component

**Issue**: Component doesn't update when locale changes

**Solution**: Use `computed` for reactive values:

```vue
<script setup lang="ts">
const { t, locale } = useI18n()

// ❌ Wrong - not reactive
const title = t('home.title')

// ✅ Correct - reactive
const title = computed(() => t('home.title'))
</script>
```

### Messages Not Loading with Lazy Loading

**Issue**: Messages undefined when lazy-loading enabled

**Solution**: Ensure file structure matches config:

```typescript
// Correct structure for lazy: true
i18n: {
  langDir: 'locales/',
  lazy: true,
  locales: [
    { code: 'en', file: 'en.json' }, // File must exist
  ],
}

// File structure:
// app/locales/en.json ✅
```

### Mixed Lazy and Direct Messages

**Issue**: Some messages lazy-loaded, some direct

**Solution**: Use consistent approach - all lazy or all direct:

```typescript
// Option 1: All lazy
i18n: {
  lazy: true,
  locales: [
    { code: 'en', file: 'en.json' },
    { code: 'es', file: 'es.json' },
  ],
}

// Option 2: All direct (current approach)
i18n: {
  lazy: false,
  locales: [
    { code: 'en' },
    { code: 'es' },
  ],
  messages: { /* inline */ }
}
```

---

## Quick Reference: useI18n() Methods

```typescript
const i18n = useI18n()

// Properties
i18n.locale.value           // Current locale code
i18n.locales.value          // All available locales
i18n.fallbackLocale         // Fallback locale

// Translation
i18n.t('key')               // Translate
i18n.t('key', count)        // Plural
i18n.tm('key')              // Get raw object
i18n.te('key')              // Check existence

// Formatting
i18n.d(date, 'short')       // Date format
i18n.n(number)              // Number format

// Routing
i18n.localeRoute()          // Get route for locale
i18n.switchLocalePath(code) // Path to switch locale
i18n.localePath(path)       // Get locale-specific path

// Management
i18n.setLocale(code)        // Change locale
i18n.setLocaleMessage(code, msg)     // Set messages
i18n.mergeLocaleMessage(code, msg)   // Merge messages
```

---

## Summary

Advanced patterns for:
- ✅ Complex locale switching
- ✅ SEO optimization
- ✅ Lazy loading
- ✅ Custom detection
- ✅ Testing
- ✅ Performance
- ✅ Database integration

See main guide (`I18N_IMPLEMENTATION_GUIDE.md`) for foundational concepts.
