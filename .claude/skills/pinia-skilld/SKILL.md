---
name: pinia-skilld
description: "ALWAYS use when writing code importing \"pinia\". Consult for debugging, best practices, or modifying pinia."
metadata:
  version: 3.0.4
  generated_at: 2026-04-01
---

# vuejs/pinia `pinia@3.0.4`
**Tags:** next: 2.0.0-rc.10, beta: 2.1.8-beta.0, latest: 3.0.4

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p pinia` instead of grepping `.skilld/` directories. Run `skilld search --guide -p pinia` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

- BREAKING: `defineStore({ id: 'storeName', ... })` — v3 requires positional `id` argument: `defineStore('storeName', { ... })`. Old object-style signature will fail with type error [source](./.skilld/docs/cookbook/migration-v2-v3.md#definestore--id-)

- BREAKING: `PiniaStorePlugin` type removed — replace with `PiniaPlugin` interface for store plugins [source](./.skilld/docs/cookbook/migration-v2-v3.md#piniastoreplugin)

- BREAKING: Vue 2 support dropped — v3 requires Vue 3 only. If using Vue 2, stay on v2 [source](./.skilld/docs/cookbook/migration-v2-v3.md#new-versions)

- BREAKING: TypeScript 4.4 and below no longer supported — TypeScript 5.0+ required [source](./.skilld/docs/cookbook/migration-v2-v3.md#new-versions)

- DEPRECATED: `mapGetters()` — use `mapState()` instead, works identically [source](./.skilld/pkg/dist/pinia.d.ts:L288)

**Also changed:** Devtools API upgraded to v7
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Pinia v3.0.4 Best Practices

## Best Practices

- Use arrow functions in `state()` to ensure full type inference and proper handling of `this` context — the function must return a fresh object for each store instance to work correctly with SSR. [source](./.skilld/docs/core-concepts/state.md#typescript)

- Declare all state properties upfront in the `state()` function, even if initially `undefined` — Vue cannot detect state properties added dynamically after store creation, breaking reactivity and devtools. [source](./.skilld/docs/core-concepts/state.md#accessing-the-state)

- Use `$patch()` with multiple state changes instead of individual assignments — it groups changes into a single devtools entry and can dramatically improve performance for complex mutations. [source](./.skilld/docs/core-concepts/state.md#mutating-the-state)

- Use `storeToRefs()` to extract reactive properties when destructuring from a store — direct destructuring breaks reactivity, but `storeToRefs()` preserves refs for state and computed properties while actions can be destructured normally. [source](./.skilld/docs/core-concepts/index.md#destructuring-from-a-store)

- Prefer arrow functions for getters that only depend on state — they automatically infer the return type and are idiomatic. Use regular functions only when accessing other getters via `this`, and always specify an explicit return type in TypeScript. [source](./.skilld/docs/core-concepts/getters.md#accessing-other-getters)

- For setup stores, implement a custom `$reset()` method to reset added state properties — the default `$reset()` only works in option stores and won't reset refs created in setup functions. [source](./.skilld/docs/core-concepts/state.md#resetting-the-state)

- Place business logic and side effects in actions rather than in state initialization or getters — actions are the intended place for async operations and complex logic, with proper type inference and error handling support. [source](./.skilld/docs/core-concepts/actions.md#actions)

- Call all `useStore()` functions at the top of async actions before any `await` statements — calling stores after an `await` can cause SSR apps to use the wrong pinia instance and share state across requests. [source](./.skilld/docs/cookbook/composing-stores.md#shared-actions)

- Use `$subscribe()` with `{ flush: 'sync' }` for immediate state persistence — without this option, subscriptions batch and trigger after multiple changes, potentially losing data on unexpected page closes. [source](./.skilld/docs/core-concepts/state.md#flush-timing)

- Wrap non-reactive objects from external libraries with `markRaw()` in plugins — prevents Vue from making them reactive, improving performance and avoiding issues with non-serializable objects like router instances. [source](./.skilld/docs/core-concepts/plugins.md#adding-new-external-properties)

- Add `acceptHMRUpdate()` to every store definition for Vite hot module replacement support — enables seamless development where store changes apply immediately without losing app state. [source](./.skilld/docs/cookbook/hot-module-replacement.md#hmr-hot-module-replacement)

- Avoid circular store dependencies in setup function bodies — if store A reads store B and B reads A at the top level, initialization fails. Move reads into computed properties or actions instead. [source](./.skilld/docs/cookbook/composing-stores.md#composing-stores)

- Use `createTestingPinia()` with `setActivePinia()` in unit tests — this provides a fresh pinia instance per test, stubs actions by default for unit isolation, and allows direct state manipulation. [source](./.skilld/docs/cookbook/testing.md#unit-testing-a-store)

- Use `$onAction()` with `detached: true` for global action listeners that must persist across component unmounts — action subscriptions are automatically cleaned up when components unmount unless explicitly detached. [source](./.skilld/docs/core-concepts/actions.md#subscribing-to-actions)
<!-- /skilld:best-practices -->
