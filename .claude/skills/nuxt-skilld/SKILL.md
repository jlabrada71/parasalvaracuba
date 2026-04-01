---
name: nuxt-skilld
description: "ALWAYS use when writing code importing \"nuxt\". Consult for debugging, best practices, or modifying nuxt."
metadata:
  version: 4.4.2
  generated_at: 2026-04-01
---

# nuxt/nuxt `nuxt@4.4.2`
**Tags:** 1x: 1.4.5, 2x: 2.18.1, alpha: 4.0.0-alpha.4

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p nuxt` instead of grepping `.skilld/` directories. Run `skilld search --guide -p nuxt` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes for Nuxt v4.4.2 — prioritizing recent major/minor releases and breaking changes.

### Breaking Changes (v4.0 → v4.4.2)

- BREAKING: `#app/components/layout` moved to `#app/components/nuxt-layout` — component location changed in v4.0 [source](./.skilld/releases/v4.0.0.md#breaking-changes)

- BREAKING: Remove `public` and `assets` aliases — `public` directory moved to root, use `~` or `#public` since v4.0 [source](./.skilld/releases/v4.0.0.md:L200)

- BREAKING: Top-level `generate` option removed — use `nitro.prerender` instead (v4.0) [source](./.skilld/releases/v4.0.0.md#breaking-changes)

- BREAKING: `globalName` property removed — global Nuxt app name not exposed (v4.0) [source](./.skilld/releases/v4.0.0.md:L176)

- BREAKING: `__NUXT__` removed from DOM after hydration — global reference cleaned up in v4.0 [source](./.skilld/releases/v4.0.0.md:L167)

- BREAKING: `compatibilityVersion: 3` removed — only v4+ supported (v4.0) [source](./.skilld/releases/v4.0.0.md#breaking-changes)

### New Composables & Components (v4.2–v4.4)

- NEW: `createUseFetch()` — factory function to create custom `useFetch` instances with default options in v4.4 [source](./.skilld/releases/v4.4.0.md:L14-L51)

- NEW: `createUseAsyncData()` — factory function for custom `useAsyncData` instances with merging control in v4.4 [source](./.skilld/releases/v4.4.0.md:L52)

- NEW: `useAnnouncer()` — composable for ARIA live region announcements of dynamic page changes in v4.4 [source](./.skilld/releases/v4.4.0.md:L94-L128)

- NEW: `<NuxtAnnouncer>` component — renders ARIA live region for `useAnnouncer` in v4.4 [source](./.skilld/releases/v4.4.0.md:L99-L106)

- NEW: Signal/AbortController support in `useAsyncData()` — accepts signal parameter to handler and refresh() in v4.2 [source](./.skilld/releases/v4.2.0.md:L15-L48)

### New Layout Features (v4.3–v4.4)

- NEW: `definePageMeta()` layout props — pass typed props to layouts via `layout: { name, props }` in v4.4 [source](./.skilld/releases/v4.4.0.md:L63-L92)

- NEW: `setPageLayout()` with props parameter — update layout and pass props from middleware in v4.3 [source](./.skilld/releases/v4.3.0.md:L116-L136)

- NEW: `appLayout` in route rules — set layouts declaratively via `routeRules` in v4.3 [source](./.skilld/releases/v4.3.0.md:L33-L47)

- NEW: Route groups in page meta — `route.meta.groups` exposes parenthesized folder groups in v4.3 [source](./.skilld/releases/v4.3.0.md:L95-L114)

### New Kit & Module Features (v4.1–v4.3)

- NEW: `moduleDependencies` — modules can declare version-constrained dependencies with version/optional/defaults/overrides in v4.1 [source](./.skilld/releases/v4.1.0.md:L140-L162)

- NEW: `onInstall` and `onUpgrade` module hooks — lifecycle hooks for module installation and version upgrades in v4.1 [source](./.skilld/releases/v4.1.0.md:L166-L187)

- NEW: `getLayerDirectories()` utility — clean API to access layer directories instead of private `_layers` in v4.1 [source](./.skilld/releases/v4.1.0.md:L207-L218)

- NEW: `#server` alias — import server utilities with `#server/path` similar to `#shared` in v4.3 [source](./.skilld/releases/v4.3.0.md:L138-L150)

- NEW: `resolveFiles()` ignore option — exclude files by glob pattern in v4.1 [source](./.skilld/releases/v4.1.0.md:L196-L202)

### New Runtime Features (v4.3–v4.4)

- NEW: `useState()` reset to default — `clearNuxtState()` resets to initial value, not undefined in v4.4 [source](./.skilld/releases/v4.4.0.md:L174-L186)

- NEW: `useCookie()` refresh option — extend expiration without changing value in v4.4 [source](./.skilld/releases/v4.4.0.md:L158-L172)

- NEW: Payload extraction for ISR/SWR — `_payload.json` works with cached routes in v4.3 [source](./.skilld/releases/v4.3.0.md:L57-L74)

### Deprecated APIs (v4.3)

- DEPRECATED: `statusCode` → use `status` instead — H3/Nitro v3 Web API naming in v4.3 [source](./.skilld/releases/v4.3.0.md:L196-L204)

- DEPRECATED: `statusMessage` → use `statusText` instead — Web API alignment in v4.3 [source](./.skilld/releases/v4.3.0.md:L196-L204)

**Also changed:** `setGlobalHead()` new kit utility (v4.2) · `extractAsyncDataHandlers` experimental option (v4.2) · `typescriptPlugin` experimental TypeScript support (v4.2) · `viteEnvironmentApi` opt-in experimental (v4.2) · `@nuxt/nitro-server` package extracted (v4.2) · Lazy hydration macros without auto-imports (v4.1) · `entryImportMap` for chunk stability (v4.1) · `rolldown-vite` experimental support (v4.1) · `payloadExtraction: 'client'` for cached routes (v4.4) · `normalizeComponentNames` experimental option (v4.4) · `nuxt build --profile` for build analysis (v4.4) · Vue Router v5 upgrade transparent (v4.4) · `unrouting` migration for 28x faster route generation in dev (v4.4)
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Avoid costly plugin setup by favoring composition over plugins — Plugins run during the hydration phase and can block rendering. Move expensive logic to composables, utilities, or deferred lifecycle hooks instead. [source](./.skilld/docs/3.guide/2.best-practices/plugins.md#avoid-costly-plugin-setup)

- Set `parallel: true` when defining asynchronous plugins — By default, plugins load synchronously, blocking subsequent plugins and delaying startup. Parallel loading allows multiple async plugins to execute concurrently, preventing bottlenecks. [source](./.skilld/docs/3.guide/2.best-practices/plugins.md#if-async-enable-parallel)

- Fix hydration mismatches immediately using SSR-friendly composables — Hydration errors force Vue to re-render the entire component tree, increase time-to-interactive, and can cause broken interactivity and SEO issues. Use [`useCookie`](/docs/4.x/api/composables/use-cookie), [`useState`](/docs/4.x/api/composables/use-state), and [`ClientOnly`](/docs/4.x/api/components/client-only) to ensure server and client render identically. [source](./.skilld/docs/3.guide/2.best-practices/hydration.md#common-reasons)

- Use `<NuxtLink>` instead of native `<a>` tags for intelligent route handling — NuxtLink automatically prefetches JavaScript for visible links, renders internal routes with router-link and external routes with regular links, and provides smart prefetching based on viewport visibility. [source](./.skilld/docs/3.guide/2.best-practices/performance.md#links)

- Lazy-load components with the `Lazy` prefix to optimize bundle size — Prefix any component name with `Lazy` to delay loading its code until needed, reducing initial JavaScript bundle size when components aren't always required. [source](./.skilld/docs/2.directory-structure/1.app/1.components.md#dynamic-imports)

- Use lazy hydration strategies for below-fold components — Apply `hydrate-on-visible` or other hydration strategies to delay making components interactive until they're visible in the viewport, improving time-to-interactive for pages with many components. [source](./.skilld/docs/2.directory-structure/1.app/1.components.md#delayed-or-lazy-hydration)

- Configure `routeRules` to enable hybrid rendering per route — Route rules allow different caching strategies (prerender, ISR, SWR, SSR-disabled) on a per-route basis, letting you combine static, incremental, and on-demand rendering in the same application. [source](./.skilld/docs/3.guide/2.best-practices/performance.md#hybrid-rendering)

- Use `useFetch` or `useAsyncData` instead of `$fetch` for initial data in setup functions — These composables ensure data fetched on the server is passed to the client in the payload, avoiding double-fetches during hydration; `$fetch` alone has no such mechanism. [source](./.skilld/docs/1.getting-started/10.data-fetching.md#the-need-for-usefetch-and-useasyncdata)

- Combine `useState` with `shallowRef` for large state objects — When state contains large objects or arrays that don't need deep reactivity, `shallowRef` prevents expensive deep tracking and improves performance. [source](./.skilld/docs/4.api/2.composables/use-state.md#using-shallowref)

- Call Nuxt composables only in the correct lifecycle context — Nuxt composables require a valid context (plugins, route middleware, setup functions, or `<script setup>`) to track the current component instance. Calling them outside these contexts causes "Nuxt instance is unavailable" errors. [source](./.skilld/docs/3.guide/1.concepts/3.auto-imports.md#L51:98)

- Prefix all module exports with your module name to prevent conflicts — Naming exports with a distinctive prefix (e.g., `useFooData` instead of `useData`, `FooButton` instead of `Button`, `/api/_foo/...` instead of `/api/...`) avoids collisions with user code and other modules. [source](./.skilld/docs/3.guide/4.modules/6.best-practices.md#prefix-your-exports)

- Use module lifecycle hooks instead of top-level async setup — Nuxt modules emit `onInstall`, `onUpgrade`, and other hooks for one-time setup tasks. Deferring expensive work to these hooks prevents unnecessary execution on every build and respects the 1-second setup budget. [source](./.skilld/docs/3.guide/4.modules/6.best-practices.md#use-lifecycle-hooks)

- Pass abort signals to `useAsyncData` for cancellable requests — Supply the `signal` from the composable's second argument to your fetch request to enable automatic cancellation when `refresh()` is called or the component unmounts, preventing memory leaks and race conditions. [source](./.skilld/docs/4.api/2.composables/use-async-data.md#make-your-handler-abortable)

- Enable `asyncContext` (experimental) to use Nuxt composables in async functions — This feature allows composables to be called within async functions by maintaining context across await boundaries, reducing "Nuxt instance is unavailable" errors in complex async workflows. [source](./.skilld/docs/3.guide/6.going-further/1.experimental-features.md#asynccontext)
<!-- /skilld:best-practices -->
