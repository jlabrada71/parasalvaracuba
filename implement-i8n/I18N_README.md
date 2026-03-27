# Nuxt 4 i18n Implementation - Complete Documentation

This directory contains comprehensive research and implementation guides for properly setting up internationalization (i18n) in Nuxt 4 using the official `@nuxtjs/i18n` module.

## Quick Navigation

### 1. **For Quick Implementation (5 minutes)**
→ Start here: **[I18N_QUICK_SETUP.md](I18N_QUICK_SETUP.md)**
- Step-by-step implementation guide
- Exact code changes needed
- Testing instructions
- Before/after comparison

### 2. **For Complete Understanding (30 minutes)**
→ Read this: **[I18N_IMPLEMENTATION_GUIDE.md](I18N_IMPLEMENTATION_GUIDE.md)**
- Full explanation of all concepts
- Why use @nuxtjs/i18n vs plain vue-i18n
- Routing strategies explained
- SEO considerations
- Troubleshooting section
- Migration checklist

### 3. **For Advanced Patterns (Reference)**
→ Explore: **[I18N_ADVANCED_PATTERNS.md](I18N_ADVANCED_PATTERNS.md)**
- Complex locale switching patterns
- SEO meta tags per locale
- Lazy loading strategies
- Custom locale detection
- Testing examples
- Performance optimization

### 4. **For Quick Reference (Summary)**
→ Check: **[I18N_RESEARCH_SUMMARY.txt](I18N_RESEARCH_SUMMARY.txt)**
- Key findings summary
- Configuration comparison
- Routing examples
- Required changes checklist
- Migration timeline

---

## The Official Recommendation

**Use `@nuxtjs/i18n` module** (already installed in this project)

### Why?

- ✅ Official Nuxt team support
- ✅ Automatic URL routing with locale prefixes (`/en/`, `/es/`, `/pt/`)
- ✅ Built-in SEO features (hreflang, og:locale, proper html lang)
- ✅ Browser language auto-detection
- ✅ Secure cookie-based persistence (365 days)
- ✅ Server-side rendering (SSR) support
- ✅ Auto-imports for `useI18n()` composable
- ✅ Lazy-loading support for performance
- ✅ Production-ready and battle-tested

### Not This
❌ Plain `vue-i18n` plugin (basic translations only, no routing/SEO)

---

## Current Project Status

**Installed:** `@nuxtjs/i18n@^9.5.6` ✅

**Issue:** Using manual plugin instead of module

**Impact:**
- No automatic locale routing
- No SEO optimization
- Manual localStorage persistence (doesn't work on server)
- Missing advanced features
- Duplicating module functionality

---

## Key Concepts

### 1. Routing Strategies

Your project should use: **`'prefix_except_default'`**

```
Spanish (default):  /                /ideas/1          /settings
English:            /en/             /en/ideas/1       /en/settings
Portuguese:         /pt/             /pt/ideas/1       /pt/settings
```

Why? Spanish is the primary audience, other languages clearly prefixed for clarity.

### 2. Auto-Imports

With the module, these work automatically in any component:

```typescript
const { t, locale, switchLocalePath } = useI18n()
// No import statement needed!
```

### 3. Persistence

Built-in, automatic cookie handling:

```
Cookie: parasalvara_locale = "es"
Expires: 365 days
Scope: Root domain
```

No manual code needed.

### 4. Locale Files

Already correct:
- `/app/locales/en.json` ✅
- `/app/locales/es.json` ✅
- `/app/locales/pt.json` ✅

---

## Implementation Steps

### Quick (5 minutes)

1. Update `nuxt.config.ts` with module and i18n config
2. Delete `/app/plugins/i18n.ts`
3. Update `LanguageSwitcher.vue` to use `switchLocalePath()`
4. Test URL routing and locale switching

**See: [I18N_QUICK_SETUP.md](I18N_QUICK_SETUP.md)**

### Complete (30-60 minutes)

Follow the detailed guide including:
- Understanding all routing strategies
- Setting up SEO features
- Browser language detection
- Error handling
- Testing in all locales

**See: [I18N_IMPLEMENTATION_GUIDE.md](I18N_IMPLEMENTATION_GUIDE.md)**

---

## Before & After

### Current Implementation
```
URL routing:      ❌ No locale prefixes
SEO:              ❌ Not optimized
Persistence:      ❌ localStorage (server-side issue)
Auto-imports:     ❌ Manual imports needed
Browser detect:   ❌ Not implemented
SSR:              ❌ Not configured
```

### After Implementation
```
URL routing:      ✅ /en/, /es/, /pt/ automatic
SEO:              ✅ hreflang, og:locale, html lang
Persistence:      ✅ Secure cookie (365 days)
Auto-imports:     ✅ useI18n() works everywhere
Browser detect:   ✅ Auto-redirect on first visit
SSR:              ✅ Full support
```

---

## Testing Checklist

After implementation, verify:

- [ ] URL routing works: `/en/`, `/es/`, `/pt/`
- [ ] HTML `lang` attribute updates with locale
- [ ] Language switcher works
- [ ] Locale persists on page refresh (via cookie)
- [ ] useI18n() auto-imports work
- [ ] All pages render correctly in all languages
- [ ] Browser language detection works (first visit)
- [ ] No console errors

---

## Official Documentation

- [Nuxt i18n Main Docs](https://i18n.nuxtjs.org/)
- [Getting Started](https://i18n.nuxtjs.org/docs/getting-started)
- [Routing Guide](https://i18n.nuxtjs.org/docs/guide)
- [API Options](https://i18n.nuxtjs.org/docs/api/options)
- [Vue I18n (underlying library)](https://vue-i18n.intlify.dev/)
- [Nuxt Auto-imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports)

---

## Version Info

- **Nuxt:** 4.4.2
- **@nuxtjs/i18n:** ^9.5.6
- **vue-i18n:** v11 (managed by @nuxtjs/i18n)

---

## Next Steps

1. **Read** [I18N_QUICK_SETUP.md](I18N_QUICK_SETUP.md) (5 minutes)
2. **Implement** the changes (5 minutes)
3. **Test** thoroughly (5-10 minutes)
4. **Deploy** with confidence

Total time: ~15-20 minutes including testing

---

## Frequently Asked Questions

### Q: Do I need to change the locale JSON files?
**A:** No, they're already correctly formatted.

### Q: Will this break my existing translations?
**A:** No, all existing translations continue to work. Components already use `useI18n()` correctly.

### Q: What about localStorage-based persistence?
**A:** The module uses secure cookies instead. Better for SSR and server-side logic.

### Q: Do I need to set up i18n.config.ts?
**A:** Optional. You can configure directly in nuxt.config.ts.

### Q: Can I use other routing strategies?
**A:** Yes, but `prefix_except_default` is recommended for this project.

### Q: When will useI18n() be auto-imported?
**A:** Immediately after adding the module to nuxt.config.ts.

---

## Support & Resources

- **Official Module:** https://github.com/nuxt-modules/i18n
- **Vue I18n:** https://vue-i18n.intlify.dev/
- **Nuxt Docs:** https://nuxt.com/docs
- **Discussion:** https://github.com/nuxt-modules/i18n/discussions

---

## Summary

This project has all the tools needed for proper i18n:
- ✅ @nuxtjs/i18n v9.5.6 installed
- ✅ Locale files already in place
- ✅ Components already use useI18n()
- ✅ Just needs module configuration

The guides provided contain everything needed for implementation, from quick setup to advanced patterns.

**Start with [I18N_QUICK_SETUP.md](I18N_QUICK_SETUP.md) and follow the steps!**

---

Last Updated: March 27, 2026
