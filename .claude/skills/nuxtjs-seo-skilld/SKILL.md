---
name: nuxtjs-seo-skilld
description: "ALWAYS use when writing code importing \"@nuxtjs/seo\". Consult for debugging, best practices, or modifying @nuxtjs/seo, nuxtjs/seo, nuxtjs seo, nuxt-seo, nuxt seo."
metadata:
  version: 5.1.0
  generated_at: 2026-04-01
---

# harlan-zw/nuxt-seo `@nuxtjs/seo@5.1.0`
**Tags:** latest: 5.1.0

**References:** [package.json](./.skilld/pkg/package.json) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p @nuxtjs/seo` instead of grepping `.skilld/` directories. Run `skilld search --guide -p @nuxtjs/seo` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

- BREAKING: `useSiteConfig()` (server-side) — v5.0.0 changed to `getSiteConfig(event)`, old composable no longer available on server [source](./.skilld/docs/content/6.migration-guide/5.v4-to-v5.md:L64)

- BREAKING: `site.name` must be set explicitly — v5.0.0 removed implicit site name inference from package.json/directory name, now required in nuxt.config [source](./.skilld/docs/content/6.migration-guide/5.v4-to-v5.md:L31:41)

- BREAKING: Legacy runtime config removed — v5.0.0 removes `siteUrl`, `siteName`, `siteDescription` keys, migrate to `site` object in nuxt.config [source](./.skilld/docs/content/6.migration-guide/5.v4-to-v5.md:L43:60)

- BREAKING: `SiteConfig` type renamed — v5.0.0 changes `SiteConfig` to `SiteConfigResolved` for type consistency [source](./.skilld/docs/content/6.migration-guide/5.v4-to-v5.md:L66)

- DEPRECATED: `asSeoCollection()` wrapper — v5.0.0 deprecates Content v3 collection wrapper, use individual `defineXxxSchema()` functions instead [source](./.skilld/releases/v5.0.0.md:L161)

- DEPRECATED: Collection wrappers (`asRobotsCollection()`, `asSitemapCollection()`, `asOgImageCollection()`, `asSchemaOrgCollection()`) — v5.0.0 replaces these with `defineRobotsSchema()`, `defineSitemapSchema()`, `defineOgImageSchema()`, `defineSchemaOrgSchema()` respectively [source](./.skilld/docs/content/6.migration-guide/5.v4-to-v5.md:L129:139)

- NEW: `useShareLinks()` composable — v5.0.0 adds composable for generating social sharing URLs (Twitter, Facebook, LinkedIn, WhatsApp, Telegram, Reddit, Pinterest, Email) with UTM tracking support [source](./.skilld/releases/v5.0.0.md:L56:76)

- NEW: ESLint rules for Link Checker — v5.0.0 adds `link-checker/valid-route` (validates relative URLs match known routes) and `link-checker/valid-sitemap-link` (checks URLs in sitemap) with auto-registration in `@nuxt/eslint` [source](./.skilld/releases/v5.0.0.md:L32:48)

- NEW: `definePageMeta()` sitemap integration — v5.0.0 lets you configure sitemap options (changefreq, priority) directly in `definePageMeta`, replacing route rules workaround [source](./.skilld/releases/v5.0.0.md:L128:141)

- NEW: `useServerSeoMeta` composable — v5.0.0 adds server-side SEO meta function that takes precedence over site defaults [source](./.skilld/releases/v5.0.0.md:L181)

- NEW: Inline script/style minification — v5.0.0 automatically minifies inline `script` and `style` HTML rendered via `useHead()` [source](./.skilld/releases/v5.0.0.md:L88:125)

- NEW: `SiteConfigPriority` constants — v5.0.0 provides named priority constants (`SiteConfigPriority.runtime`, etc.) for Site Config configuration [source](./.skilld/releases/v5.0.0.md:L155:157)

- BREAKING: `getSiteIndexable()` removed — v5.0.0 replaces server-side function with `getSiteConfig(event).indexable` property [source](./.skilld/docs/content/6.migration-guide/5.v4-to-v5.md:L64:66)

- BREAKING: Import path changed — v5.0.0 removes `#internal/nuxt-site-config` imports, use named imports from `nuxt-site-config` directly [source](./.skilld/docs/content/6.migration-guide/5.v4-to-v5.md:L67)

**Also changed:** `zeroRuntime` mode for sitemap (v3.4.0+) · `parseSitemapIndex()` utility (v3.4.0+) · i18n multi-sitemap auto-expansion (v5.0.0) · Module version bumps (site-config v3→v4, seo-utils v7→v8, sitemap v7→v8, robots v5→v6, schema-org v5→v6, link-checker v4→v5)
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Set `site.url`, `site.name`, and `site.description` in `nuxt.config` once — all SEO modules read from this centralized `site` object instead of requiring per-module duplication [source](./.skilld/docs/content/2.guides/5.site-config.md#quick-setup)

- Use environment variables for multi-environment deployments — non-production sites are automatically blocked from search indexing by the robots module without manual configuration [source](./.skilld/docs/content/2.guides/5.site-config.md#environment-specific-config)

- Disable unused modules individually to reduce bundle size — OG Image, Link Checker, Schema.org, and other modules can be toggled via their `enabled: false` config key [source](./.skilld/docs/content/2.guides/1.disabling-modules.md:L17:40)

- Prefer `@nuxtjs/seo` alias for simpler setup unless pinning specific module versions — both approaches yield identical module configurations and capabilities [source](./.skilld/docs/content/1.getting-started/0.introduction.md#nuxtjsseo-vs-individual-modules)

- Use `useSeoMeta()` for reactive, page-specific meta tags; use `useServerSeoMeta()` for static server-rendered data to prevent hydration mismatches [source](./.skilld/discussions/discussion-322.md:L40:61)

- Load `@nuxtjs/seo` before `@nuxt/content` in your modules array — Nuxt Content v3 integration requires this order for schema composition to work correctly [source](./.skilld/docs/content/2.guides/2.nuxt-content.md#setup-nuxt-content-v3)

- Replace deprecated `asSeoCollection()` wrapper with individual `defineXxxSchema()` functions in `content.config.ts` — provides cleaner composition and only includes schemas for modules you use [source](./.skilld/docs/content/2.guides/2.nuxt-content.md:L73:79)

- Configure sitemap options per-page in `definePageMeta()` instead of route rules — cleaner, page-component-local alternative for setting `changefreq` and `priority` [source](./.skilld/docs/content/7.releases/1.v5.md#definePageMeta-sitemap-config)

- Leverage auto-expanded i18n multi-sitemaps: any custom sitemap with `includeAppSources: true` automatically generates per-locale variants without manual definition [source](./.skilld/docs/content/6.migration-guide/5.v4-to-v5.md#i18n-multi-sitemap-auto-expansion)

- Call `useSiteConfig()` in components and composables to access site configuration — provides single source of truth for canonical URLs, site names, and locale defaults [source](./.skilld/docs/content/2.guides/5.site-config.md#reading-site-config)

- Enable ESLint link checking to catch broken relative links at build time — the `@nuxt/eslint`-compatible rules validate route URLs and suggest corrections with "did you mean?" hints [source](./.skilld/docs/content/7.releases/1.v5.md#eslint-link-checking)

- Use `useShareLinks()` composable for social sharing URLs — automatically resolves the canonical URL of the current page and appends per-platform UTM parameters without manual URL building [source](./.skilld/docs/content/7.releases/1.v5.md#social-share-links)

- Generate all favicon variants from a single source with the `nuxt-seo-utils icons` CLI — produces 16x16, 32x32, 192x192, 512x512 PNGs plus apple-touch-icon from one image file [source](./.skilld/docs/content/7.releases/1.v5.md#favicon-generation-cli)

- Use multi-tenancy configuration to serve multiple domains from one Nuxt app — Site Config's `multiTenancy` option routes configuration based on incoming request hostname [source](./.skilld/docs/content/2.guides/5.site-config.md#multi-tenancy)
<!-- /skilld:best-practices -->
