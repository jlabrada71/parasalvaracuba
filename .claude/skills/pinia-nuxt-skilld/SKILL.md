---
name: pinia-nuxt-skilld
description: "ALWAYS use when writing code importing \"@pinia/nuxt\". Consult for debugging, best practices, or modifying @pinia/nuxt, pinia/nuxt, pinia nuxt, pinia."
metadata:
  version: 0.11.3
  generated_at: 2026-04-01
---

# vuejs/pinia `@pinia/nuxt@0.11.3`
**Tags:** next: 0.0.1, beta: 0.5.2-beta.0, latest: 0.11.3

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p @pinia/nuxt` instead of grepping `.skilld/` directories. Run `skilld search --guide -p @pinia/nuxt` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes for @pinia/nuxt v0.11.3 — prioritize recent major/minor releases.

- BREAKING: Module is ESM-only — v0.11.0 dropped CommonJS support, requires modern bundler (Vite, webpack 5+, Rollup, esbuild) [source](./.skilld/releases/CHANGELOG.md:L24:27)

- BREAKING: `storesDirs` path resolution changed — v0.11.3 now resolves paths relative to project root, not `srcDir`. Use `'./stores/**'` instead of `'./app/stores/**'` in Nuxt 4 [source](./.skilld/issues/issue-3070.md:L20:37)

- NEW: Automatic HMR code generation — v0.11.3 (Vite only) automatically sets up hot module replacement for stores, no need for manual `acceptHMRUpdate()` scaffolding [source](./.skilld/releases/CHANGELOG.md:L3:5)

- NEW: Layer store auto-imports — v0.11.3 resolves stores from Nuxt layers automatically in main app [source](./.skilld/releases/CHANGELOG.md:L9:10)

- NEW: Support for Nuxt 4 — v0.11.1+ officially supports Nuxt 4 (v4.2.0+) alongside Nuxt 3 [source](./.skilld/releases/CHANGELOG.md:L20:22)

- FIX: Global pinia cleanup — v0.11.3 unsets global pinia instance after server render to prevent memory leaks and request contamination [source](./.skilld/releases/CHANGELOG.md:L10:11)

- BREAKING: `usePinia()` composable required outside setup — v0.3.0+ introduced `usePinia()` (similar to `getActivePinia()`) for use in middleware, route guards, and other non-component contexts [source](./.skilld/docs/ssr/nuxt.md:L86:91)

- BREAKING: Requires Pinia 3.0+ — v0.10.0+ requires `pinia@^3.0.4`, drops Pinia 2 and Vue 2 support [source](./.skilld/pkg/package.json:L40:41)

- BREAKING: `$nuxt` context removed in Nuxt 3 — v0.3.0+ no longer exposes `$nuxt` in stores for Nuxt 3, use `useNuxtApp()` instead [source](./.skilld/releases/CHANGELOG.md:L215:226)

- BREAKING: `autoImports` option removed — v0.5.0 removed the module option, `defineStore()` and `acceptHMRUpdate()` are now auto-imported by default [source](./.skilld/releases/CHANGELOG.md:L135:142)

- NEW: `storeToRefs` auto-import — v0.5.1 (2023-10-16) added `storeToRefs` to auto-imports for extracting reactive state [source](./.skilld/releases/CHANGELOG.md:L127:128)

- NEW: `storesDirs` configuration option — v0.5.0+ allows customizing store directories with glob patterns via `pinia.storesDirs` in `nuxt.config` [source](./.skilld/docs/ssr/nuxt.md:L93:106)

- FIX: Object hydration bug — v0.11.0 fixed `obj.hasOwnProperty` error in `shouldHydrate` that prevented proper state serialization in some cases [source](./.skilld/releases/CHANGELOG.md:L29:30)

**Also changed:** Layer store type checking · `usePinia()` composable type improvements (v0.10.1) · Nuxt 3 RC compatibility updates (v0.4.x) · Auto-imports resolution in nested directories
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## @pinia/nuxt Best Practices

## Best Practices

- Use `usePinia()` in Nuxt instead of `getActivePinia()` — the Nuxt module provides this composable specifically to work better with Nuxt's SSR context and app injection patterns [source](./.skilld/docs/ssr/nuxt.md#awaiting-for-actions-in-pages)

- Define state as a function, not a static object — required for SSR to work correctly, ensuring each server request gets its own isolated state instance [source](./.skilld/docs/core-concepts/state.md#the-state)

- Leverage auto-imports from `@pinia/nuxt` — the module automatically exposes `usePinia()`, `defineStore()`, `storeToRefs()`, and `acceptHMRUpdate()` without manual imports, plus auto-discovers stores in your `stores/` folder [source](./.skilld/docs/ssr/nuxt.md#auto-imports)

- Pass the `pinia` instance to `useStore()` when using stores outside `setup()` or injection-aware contexts (route guards, middleware, plugins) — without it, Nuxt cannot track the correct pinia instance in SSR [source](./.skilld/docs/ssr/nuxt.md#awaiting-for-actions-in-pages)

- Use `$patch()` to group multiple state changes instead of direct mutations — triggers only one devtools entry and supports both object and function syntax for complex updates [source](./.skilld/docs/core-concepts/state.md#mutating-the-state)

- Always call `useStore()` at the top of async actions before any `await` statements — in SSR apps, calling stores after await can cause Pinia to use the wrong instance [source](./.skilld/docs/cookbook/composing-stores.md#shared-actions)

- Use `skipHydrate()` on non-serializable state in Setup Stores when using composables — marks properties that should not be hydrated from the server, preventing SSR hydration mismatches [source](./.skilld/docs/cookbook/composables.md#ssr)

- Define a `hydrate()` function in Option Stores with composables — Pinia skips calling `state()` during client-side hydration when initial state exists, so composables like `useLocalStorage()` must be re-initialized [source](./.skilld/docs/cookbook/composables.md#ssr)

- Use `storeToRefs()` to extract individual properties as refs when destructuring — ensures reactivity is maintained and prevents losing the reactive connection when spreading store properties [source](./.skilld/docs/ssr/nuxt.md#auto-imports)

- Wrap non-reactive objects (like router instances) with `markRaw()` in plugins — prevents Vue from wrapping external objects that shouldn't be reactive, improving performance and avoiding unexpected behavior [source](./.skilld/docs/core-concepts/plugins.md#adding-new-external-properties)

- Call `$subscribe()` with `{ detached: true }` to persist state beyond component unmounting — by default subscriptions are tied to component lifecycle and are cleaned up on unmount [source](./.skilld/docs/core-concepts/state.md#detaching-subscriptions)

- Create Pinia plugins inside a Nuxt plugin rather than directly in `nuxt.config` — use `defineNuxtPlugin()` with `$pinia` injection to properly access the Pinia instance [source](./.skilld/docs/core-concepts/plugins.md#nuxt)

- Add `acceptHMRUpdate()` at the bottom of store files for HMR support in dev — enables editing stores without page reload while preserving state [source](./.skilld/docs/cookbook/hot-module-replacement.md#hmr-hot-module-replacement)

- Use `callOnce()` in Nuxt pages to await store actions instead of `onServerPrefetch()` — runs the action once and properly handles both SSR and client-side fetching [source](./.skilld/docs/ssr/nuxt.md#awaiting-for-actions-in-pages)

- Avoid circular dependencies in composed stores — if two stores use each other, only access other store properties inside computed properties and actions, not at the top level [source](./.skilld/docs/cookbook/composing-stores.md#composing-stores)

- Use Setup Stores with composables when you need more flexibility than Option Stores provide — Setup Stores support any composable, functions that expose methods, and readonly data [source](./.skilld/docs/cookbook/composables.md#setup-stores)

- Use `setActivePinia()` in unit tests before accessing stores — creates an isolated Pinia instance for each test, preventing state leakage between tests [source](./.skilld/docs/cookbook/testing.md#unit-testing-a-store)
<!-- /skilld:best-practices -->
