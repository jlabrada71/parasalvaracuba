---
name: nuxtjs-i18n-skilld
description: "ALWAYS use when writing code importing \"@nuxtjs/i18n\". Consult for debugging, best practices, or modifying @nuxtjs/i18n, nuxtjs/i18n, nuxtjs i18n, i18n."
metadata:
  version: 10.2.4
  generated_at: 2026-04-01
---

# nuxt-modules/i18n `@nuxtjs/i18n@10.2.4`
**Tags:** 7x: 7.3.1, 8x: 8.5.6, 9x: 9.5.6

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p @nuxtjs/i18n` instead of grepping `.skilld/` directories. Run `skilld search --guide -p @nuxtjs/i18n` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes in @nuxtjs/i18n v10.x — prioritize v10 major/minor releases.

### Breaking Changes (v10.0.0)

- BREAKING: `vue-i18n` — Upgraded to v11 with deprecated Legacy API mode; removes `tc()` and `$tc()` from Legacy API mode [source](./.skilld/releases/v10.0.0.md#highlights)

- BREAKING: `onLanguageSwitched()` removed — Use `i18n:localeSwitched` hook instead; old function actually called the hook instead of subscribing, leading to unpredictable behavior [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L65)

- BREAKING: `onBeforeLanguageSwitch()` removed — Use `i18n:beforeLocaleSwitch` hook instead; old function actually called the hook instead of subscribing, leading to unpredictable behavior [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L66)

- BREAKING: `finalizePendingLocaleChange()` signature changed — Now synchronous instead of async; code passing it as async will silently fail without type error [source](./.skilld/releases/CHANGELOG.md:L192)

- BREAKING: `useLocaleHead()` parameter `key` removed — The `key` property on options parameter can no longer be configured; necessary for consistent localized head tag management [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L64)

- BREAKING: `$localeHead()` parameter `key` removed — Same as `useLocaleHead()`; the `key` property can no longer be configured [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L77)

- BREAKING: `lazy` option removed — Lazy loading of locale messages is now enabled for all locale files; option can no longer be set to false [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L28)

- BREAKING: `bundle.optimizeTranslationDirective` removed — This feature has been disabled and fully removed from the build [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L29)

- BREAKING: `experimental.generatedLocaleFilePathFormat` removed — File paths configured for this module are now removed from the build entirely [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L30)

- BREAKING: `$resolveRoute()` removed — Use `$localeRoute()` instead [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L80)

- BREAKING: `$localeLocation()` removed — Use `$localeRoute()` instead [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L81)

- BREAKING: ESM-only module — CommonJS support removed; projects must use ESM imports [source](./.skilld/releases/CHANGELOG.md:L183)

- BREAKING: Node.js minimum version — Raised to `>=20.11.1`; earlier versions no longer supported [source](./.skilld/releases/CHANGELOG.md:L176)

### Promoted/Renamed Options (v10.0.0)

- BREAKING: `experimental.hmr` → `hmr` — Promoted to stable option, enabled by default; option renamed [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L20)

- BREAKING: `experimental.switchLocalePathLinkSSR` → enabled by default — Behavior changed to always enabled, option to disable removed [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L21)

- BREAKING: `experimental.autoImportTranslationFunctions` → `autoDeclare` — Promoted to stable option, enabled by default; option renamed [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L22)

- BREAKING: `experimental.alternateLinkCanonicalQueries` → `alternateLinkCanonicalQueries` — Promoted from experimental to stable [source](./.skilld/releases/CHANGELOG.md:L186)

### Deprecated (still works, will be removed in v11)

- DEPRECATED: `$localeHead()` — Use `useLocaleHead()` composable instead; context function deprecated due to limited use cases [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L78)

- DEPRECATED: `$getRouteBaseName()` → `$routeBaseName()` — Renamed for consistency with other context functions; old name still works [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L79)

- DEPRECATED: `types` option — Only `'composition'` types will be supported in v11, in line with Vue I18n v12 [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L24)

- DEPRECATED: `baseUrl` option (function form) — Will only allow string values in v11; function configuration no longer supported [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L25)

- DEPRECATED: `routesNameSeparator` option — Documented as internal; use cases for end-users unclear [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L26)

- DEPRECATED: `defaultLocaleRouteNameSuffix` option — Documented as internal; use cases for end-users unclear [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L27)

### New Features (v10.0.0+)

- NEW: `useI18nPreloadKeys()` composable — New in v10.0.0 for managing translation key preloading [source](./.skilld/releases/CHANGELOG.md:L203)

- NEW: `definePageMeta()` support for custom routes — Set custom routes via `i18n` property in `definePageMeta()` when `customRoutes: 'meta'` is enabled [source](./.skilld/docs/content/docs/02.guide/91.new-features.md:L9)

- NEW: `redirectStatusCode` option — Added in v10.0.0-beta.12 to configure HTTP status code for redirects [source](./.skilld/releases/CHANGELOG.md:L205)

- NEW: Server-side localized redirection — Language detection and redirection now handled from Nitro server for better performance and accuracy with prerendering [source](./.skilld/docs/content/docs/02.guide/91.new-features.md:L27)

- NEW: `strictSeo` option (experimental) — Experimental strict SEO mode that changes i18n head tag handling; will become default in v11 [source](./.skilld/docs/content/docs/02.guide/91.new-features.md:L34)

- NEW: `messageServerRoute.prefix` option (v10.2.0) — Configurable message server route prefix [source](./.skilld/releases/v10.2.0.md:L11)

- NEW: `httpCacheDuration` option (experimental, v10.2.0) — Experimental option for server messages route caching duration [source](./.skilld/releases/v10.2.0.md:L12)

### Runtime Config Changes (v10.0.0)

The following options are now compile-time constants instead of runtime config — they cannot be changed at runtime:

- `lazy` · `strategy` · `trailingSlash` · `differentDomains` · `defaultDirection` · `multiDomainLocales` · `routeNameSeparator` · `defaultLocaleRouteNameSuffix` [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L90-L99)

### Generated Options Removed (v10.0.0)

The following exports removed from generated options files (`#build/i18n-options.mjs`, `#internal/i18n-options.mjs`):

- `isSSG` · `hasPages` · `parallelPlugin` · `nuxtI18nOptions` · `DEFAULT_COOKIE_KEY` · `DYNAMIC_PARAMS_KEY` · `NUXT_I18N_MODULE_ID` · `SWITCH_LOCALE_PATH_LINK_IDENTIFIER` [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L116-L125)

### Behavior Changes (v10.0.0)

- BREAKING: Browser language detection with `strategy: 'prefix'` and `redirectOn: 'root'` — Non-root paths (e.g., `/search`) no longer automatically redirect to localized versions; update to `redirectOn: 'all'` if needed [source](./.skilld/docs/content/docs/02.guide/90.migrating.md:L32-L56)

- BREAKING: Hook `i18n:localeSwitched` timing — Now triggered when pending locale switches, not just completed switches [source](./.skilld/releases/CHANGELOG.md:L196)
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## @nuxtjs/i18n v10.2.4 Best Practices

## Best Practices

- Use `definePageMeta()` with the `i18n` property to set custom locale-specific route paths — this is the recommended approach in v10 and replaces the deprecated `defineI18nRoute()` compiler macro which will be removed in v11 [source](./.skilld/docs/content/docs/02.guide/03.custom-paths.md:L186-L228)

- Use `defineI18nLocale()` composable when a lazy-loaded locale file function returns an object of messages — this is required for proper handling by the module's type system and message compilation [source](./.skilld/docs/content/docs/02.guide/07.lazy-load-translations.md:L66-L70)

- Use the `files` property (array of file paths) instead of `file` when managing regional dialect variants (e.g., `es.json` with `es-AR.json`) — messages are merged in load order, eliminating duplication across similar locales [source](./.skilld/docs/content/docs/02.guide/07.lazy-load-translations.md:L81-L149)

- Configure per-file caching with `{ path: string, cache?: boolean }` objects in `file` or `files` properties — caching is enabled by default for static files but must be explicitly disabled for dynamic API-loaded messages to ensure fresh content [source](./.skilld/docs/content/docs/02.guide/07.lazy-load-translations.md:L150-L188)

- Enable `experimental.scanPageMeta: true` in nuxt.config when using custom route names via `definePageMeta({ name: '...' })` — Nuxt v3.10+ overwrites generated route metadata at build time unless this is explicitly enabled [source](./.skilld/docs/content/docs/02.guide/03.custom-paths.md:L320-L334)

- Set the `language` property on each locale object using IETF BCP47 language tags (e.g., `'en-US'`, `'fr-CA'`, `'zh-Hans'`) — this is required to enable SEO features like hreflang links and OpenGraph locale tags [source](./.skilld/docs/content/docs/02.guide/06.seo.md:L18-L40)

- Set `baseUrl` as a string or function to ensure fully-qualified alternate URLs in hreflang tags and canonical links — this is especially critical for SEO and allows dynamic baseUrl computation based on request context [source](./.skilld/docs/content/docs/02.guide/06.seo.md:L68-L82)

- Use `useLocaleHead()` composable in layout components to apply SEO head tags globally, then override specific head properties per-page using `definePageMeta()` — this avoids duplicating SEO markup across every page component [source](./.skilld/docs/content/docs/02.guide/06.seo.md:L54-L65)

- Set `isCatchallLocale: true` on a specific locale object to designate it as the fallback for hreflang catchall links (e.g., using `en-GB` instead of `en-US` as the catchall for all `en-*` variants) [source](./.skilld/docs/content/docs/02.guide/06.seo.md:L170-L228)

- Set `detectBrowserLanguage.redirectOn` to `'root'` (the default) for better SEO — this limits language detection to only the root path `/` , allowing crawlers to access requested pages rather than being redirected away [source](./.skilld/docs/content/docs/02.guide/05.browser-language-detection.md:L14-L22)

- Define i18n runtime hooks (`i18n:beforeLocaleSwitch` and `i18n:localeSwitched`) in a Nuxt plugin to access app context and perform side effects (e.g., updating Axios config when language changes) — plugins provide the proper lifecycle hooks and app context access [source](./.skilld/docs/content/docs/02.guide/02.runtime-hooks.md:L48-L69)

- Use per-component i18n custom blocks with `useScope: 'local'` and the `t()` composable function for component-level translations — do not use `$t()` for component-scoped messages as it accesses global messages only [source](./.skilld/docs/content/docs/02.guide/12.per-component-translations.md:L6-L53)

- Use `useLocaleRoute()` instead of `useLocalePath()` when you need the full Route object with all properties (params, query, meta) — `useLocalePath()` returns only the path string and may lose route metadata [source](./.skilld/docs/content/docs/01.getting-started/02.usage.md:L159-L181)

- Use `defineI18nLocaleDetector()` to implement server-side locale detection that tries query string, then cookie, then accept-language header in fallback order — this ensures consistent locale selection across the initial request (experimental feature) [source](./.skilld/docs/content/docs/02.guide/16.server-side-translations.md:L12-L62)
<!-- /skilld:best-practices -->
