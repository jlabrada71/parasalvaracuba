---
name: vue-test-utils-skilld
description: "ALWAYS use when writing code importing \"@vue/test-utils\". Consult for debugging, best practices, or modifying @vue/test-utils, vue/test-utils, vue test-utils, vue test utils, test-utils, test utils."
metadata:
  version: 2.4.6
  generated_at: 2026-04-01
---

# vuejs/test-utils `@vue/test-utils@2.4.6`
**Tags:** latest: 2.4.6, 2.0.0-alpha.0: 2.0.0-alpha.0, 2.0.0-alpha.1: 2.0.0-alpha.1

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p @vue/test-utils` instead of grepping `.skilld/` directories. Run `skilld search --guide -p @vue/test-utils` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

- NEW: `renderToString()` — added in v2.3.0 for SSR testing, returns string HTML instead of wrapper. `attachTo` is not allowed with renderToString [source](./.skilld/releases/v2.3.0.md)

- NEW: Teleport stub support — added in v2.4.5, allows stubbing `<Teleport>` components in mounting options via `global.stubs: { Teleport: true }` [source](./.skilld/releases/v2.4.5.md)

- NEW: Dynamic element getter — added in v2.4.6, `wrapper.element` now has improved return type inference [source](./.skilld/releases/v2.4.6.md:L14)

- BREAKING: `setValue()` trigger behavior — v2.4.0 changed to trigger `input` event for checkbox, radio, and select elements (previously only for input/textarea) [source](./.skilld/releases/v2.4.0-alpha.0.md:L13)

- BREAKING: `wrapper.text()` trimming behavior — v2.4.2 trims whitespace per element (not between elements), affecting multi-element text assertions. Previously `<span>Trimmed </span><span>Example</span>` returned `Trimmed Example`, now returns `TrimmedExample` [source](./.skilld/releases/v2.4.2.md:L11)

- DEPRECATED: `propsData` mounting option — v1→v2 migration prefers `props` instead. `propsData` remains supported for backwards compatibility but is considered deprecated [source](./.skilld/docs/migration/index.md:L8)

- BREAKING: `scopedSlots` removed — v1→v2 merged scoped slots with regular slots. Use `slots` mounting option with `<template #name="scope">` for scoped slot bindings [source](./.skilld/docs/migration/index.md:L218)

- BREAKING: `findAll().at()` removed — v1→v2 changed `findAll()` to return array directly. Use array indexing: `findAll('selector')[0]` instead of `.at(0)` [source](./.skilld/docs/migration/index.md:L234)

- BREAKING: `destroy()` renamed — v1→v2 renamed to `unmount()` to match Vue 3 lifecycle naming. `wrapper.destroy()` must become `wrapper.unmount()` [source](./.slikld/docs/migration/index.md:L212)

- BREAKING: `createWrapper()` removed — v1→v2 made internal. Use `new DOMWrapper(element)` constructor to wrap DOM elements directly [source](./.skilld/docs/migration/index.md:L250)

- BREAKING: `createLocalVue` removed — v1→v2 no longer needed; use `global` mounting option instead for plugins, mixins, directives. Vue 3 does not mutate global instance [source](./.skilld/docs/migration/index.md:L39)

- BREAKING: `shallowMount` slot rendering — v1→v2 stopped rendering default slot content in stubbed components by default. Enable with `config.global.renderStubDefaultSlot = true` [source](./.skilld/docs/migration/index.md:L204)

- Type change: `setProps()` signature — v2.4.3 changed to accept `Partial<T['$props']>` instead of full props object, allowing partial updates [source](./.skilld/releases/v2.4.3.md)

- Type change: `attachTo` validation — v2.4.6 fixed type definition to properly validate Element | string selector [source](./.skilld/releases/v2.4.6.md:L11)

- Enhanced: `vm` global provides — v2.4.6 ensures global provides are set before Vue plugins run, fixing initialization order [source](./.skilld/releases/v2.4.6.md:L16)

- Fixed: Error handling in mount — v2.4.6 throws first error during mount rather than silently failing [source](./.skilld/releases/v2.4.6.md:L17)

**Also changed:** `mocks` and `stubs` now in `global` option (v2) · `propsData` deprecated for `props` (v2) · `slots` scope exposed as `params` (v2) · Recursive component stub caching (v2.4.0-alpha.2) · Custom Transition stubs allowed (v2.4.2) · `striper props` types (v2.4.2) · Async component stub finding (v2.4.0-alpha.1) · Prototype method handling in setData (v2.4.4) · Nested computed value access (v2.4.5)
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Await methods that trigger DOM updates (`trigger`, `setValue`, `setProps`) to ensure Vue completes reactivity before assertions run — these methods return `nextTick` automatically, eliminating manual `await nextTick()` calls. [source](./.skilld/docs/guide/advanced/async-suspense.md#a-simple-example-updating-with-trigger)

- Use `flushPromises()` from Vue Test Utils to resolve mocked promises from non-Vue dependencies (like axios) when testing async behavior — `nextTick` only handles Vue reactivity, not external APIs. [source](./.skilld/docs/guide/advanced/async-suspense.md#resolving-other-asynchronous-behavior)

- Test simple composables directly without mounting a component — only create a test wrapper component when the composable uses lifecycle hooks like `onMounted` or `provide`/`inject`. [source](./.skilld/docs/guide/advanced/reusability-composition.md#testing-composables)

```ts
// Direct test for pure composable
const { counter, increase } = useCounter()
expect(counter.value).toBe(0)
increase()
expect(counter.value).toBe(1)
```

- Use `global.provide` to pass injected values during mounting instead of creating wrapper components — simplifies tests for components that consume provided data. [source](./.skilld/docs/guide/advanced/reusability-composition.md#testing-inject)

- Extract complex methods, heavy computations, and API calls into separate composables or utility functions, then test them in isolation — this makes components simpler and allows focused unit testing without component mounting overhead. [source](./.skilld/docs/guide/essentials/easy-to-test.md#extract-complex-methods)

- Test user-observable inputs (props, interactions, API data) and outputs (DOM elements, emitted events) rather than implementation details — tests should not break on internal refactors that preserve behavior. [source](./.skilld/docs/guide/essentials/easy-to-test.md#do-not-test-implementation-details)

- Use `wrapper.emitted(eventName)` to verify components emit events with correct arguments — returns an array where each element is an emission with arguments wrapped in an array. [source](./.skilld/docs/guide/essentials/event-handling.md#asserting-the-emitted-events)

```ts
await wrapper.find('button').trigger('click')
expect(wrapper.emitted('increment')).toHaveLength(1)
expect(wrapper.emitted('increment')[0]).toEqual([expectedValue])
```

- Mock HTTP requests at system boundaries using `jest.spyOn()` or similar tools — avoid making real API calls in tests; assert the request was made with correct parameters, then use `flushPromises()` to resolve before checking DOM updates. [source](./.skilld/docs/guide/advanced/http-requests.md#a-list-of-blog-posts)

- Wrap components with asynchronous `setup()` functions in a `<Suspense>` wrapper during testing since they must be treated as async components in tests, not standalone. [source](./.skilld/docs/guide/advanced/async-suspense.md#testing-asynchronous-setup)

```ts
const TestComponent = defineComponent({
  components: { AsyncComponent },
  template: '<Suspense><AsyncComponent /></Suspense>'
})
const wrapper = mount(TestComponent)
```

- Prefer full `mount()` with targeted `stubs` over `shallow: true` for production-like tests — the more your tests resemble actual usage, the more confidence they provide; only use `shallow` for testing advanced components in complete isolation. [source](./.skilld/docs/guide/advanced/stubs-shallow-mount.md#mount-shallow-and-stubs-which-one-and-when)

- Set `config.global.renderStubDefaultSlot = true` before tests using `shallow` that need to verify slot content — without this, stubbed components won't render their default slot even with `shallow: true`. [source](./.skilld/docs/guide/advanced/stubs-shallow-mount.md#default-slots-and-shallow)

```ts
beforeAll(() => {
  config.global.renderStubDefaultSlot = true
})
afterAll(() => {
  config.global.renderStubDefaultSlot = false
})
```

- Test real `<transition>` components by disabling their stub and mocking `requestAnimationFrame` to complete animations synchronously — Vue Test Utils mocks transitions by default, preventing animation events from firing. [source](./.skilld/discussions/discussion-1913.md#accepted-answer)

```ts
vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb())
const wrapper = mount(Component, {
  global: {
    stubs: { transition: false }
  }
})
```

- Create custom `config.plugins.VueWrapper.install()` plugins to extend the wrapper API with reusable helpers like `findByTestId()` — this is the official way to add convenience methods without polluting every test. [source](./.skilld/docs/guide/extending-vtu/plugins.md#wrapper-plugin)
<!-- /skilld:best-practices -->
