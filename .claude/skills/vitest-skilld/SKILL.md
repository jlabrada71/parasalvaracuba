---
name: vitest-skilld
description: "ALWAYS use when writing code importing \"vitest\". Consult for debugging, best practices, or modifying vitest."
metadata:
  version: 4.1.2
  generated_at: 2026-04-01
---

# vitest-dev/vitest `vitest@4.1.2`
**Tags:** beta: 4.1.0-beta.6, latest: 4.1.2

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p vitest` instead of grepping `.skilld/` directories. Run `skilld search --guide -p vitest` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

## Breaking Changes (v3 → v4)

- BREAKING: Browser provider configuration changed from string to object with factory function — requires separate package imports (`@vitest/browser-playwright`, `@vitest/browser-webdriverio`, or `@vitest/browser-preview`) [source](./.skilld/docs/blog/vitest-4.md:L55-L143)

- BREAKING: `maxThreads` and `maxForks` renamed to `maxWorkers` — environment variables `VITEST_MAX_THREADS` and `VITEST_MAX_FORKS` also renamed to `VITEST_MAX_WORKERS` [source](./.skilld/docs/guide/migration.md:L329-L330)

- BREAKING: `singleThread` and `singleFork` options replaced with `maxWorkers: 1, isolate: false` — if tests relied on module reset, add `vi.resetModules()` in `beforeAll` [source](./.skilld/docs/guide/migration.md:L331)

- BREAKING: `poolOptions` removed entirely — all previous pool options are now top-level; `poolOptions.threads.useAtomics` and `poolOptions.vmThreads.memoryLimit` (now `vmMemoryLimit`) moved to config root [source](./.skilld/docs/guide/migration.md:L332-L355)

- BREAKING: `coverage.all` and `coverage.extensions` removed — v4 defaults to include only covered files, must explicitly define `coverage.include` [source](./.skilld/docs/guide/migration.md:L34-L62)

- BREAKING: `coverage.experimentalAstAwareRemapping` removed — AST-based remapping is now default and only supported method [source](./.skilld/docs/guide/migration.md:L31)

- BREAKING: `coverage.ignoreEmptyLines` removed — lines without runtime code no longer included in reports [source](./.skilld/docs/guide/migration.md:L30)

- BREAKING: `vi.restoreAllMocks` no longer resets spy state — only restores manual `vi.spyOn` calls; automocks no longer affected; `.mockRestore()` still resets [source](./.skilld/docs/guide/migration.md:L157)

- BREAKING: `vi.fn().getMockName()` returns `vi.fn()` instead of `spy` — affects snapshots; spies created with `vi.spyOn` keep original name [source](./.skilld/docs/guide/migration.md:L156)

- BREAKING: Automocked getters no longer call original getter — now return `undefined` by default; use `vi.spyOn(object, name, 'get')` to spy and change implementation [source](./.skilld/docs/guide/migration.md:L182)

- BREAKING: `mock.settledResults` populated immediately with `'incomplete'` result — type changes when promise settles [source](./.skilld/docs/guide/migration.md:L159)

- BREAKING: `workspace` configuration renamed to `projects` — cannot specify file source like `vitest.workspace.js` anymore [source](./.skilld/docs/guide/migration.md:L230-L264)

- BREAKING: Import from `vitest/browser` instead of `@vitest/browser/context` and `@vitest/browser/utils` — old imports work during transition but will be removed [source](./.skilld/docs/guide/migration.md:L297-L320)

- BREAKING: Custom environment `transformMode` property removed — provide `viteEnvironment` instead; Vitest uses environment name for server transforms [source](./.skilld/docs/guide/migration.md:L222)

- BREAKING: `VITE_NODE_DEPS_MODULE_DIRECTORIES` environment variable replaced with `VITEST_MODULE_DIRECTORIES` [source](./.skilld/docs/guide/migration.md:L219)

- BREAKING: `vitest/execute` entry point removed — was internal API [source](./.skilld/docs/guide/migration.md:L221)

- BREAKING: `deps.optimizer.web` renamed to `deps.optimizer.client` [source](./.skilld/docs/guide/migration.md:L224)

- BREAKING: `spyOn` and `fn` constructors now call with `new` instead of `.apply()` — mock implementation must use `function` or `class` keyword; arrow functions cause error [source](./.skilld/docs/guide/migration.md:L121-L150)

## New APIs (v4.1)

- NEW: `doMock()` now returns a `Disposable` object for cleanup — enables cleanup pattern without explicit `vi.unmock()` [source](./.skilld/releases/v4.1.0.md:L15)

- NEW: `aroundEach` and `aroundAll` lifecycle hooks — wrap tests in context like transactions or spans; hook receives `runTest` function that must be called [source](./.skilld/releases/v4.1.0.md:L23)

- NEW: `mockThrow()` and `mockThrowOnce()` methods — simpler than `mockImplementation(() => { throw ... })` [source](./.skilld/releases/v4.1.0.md:L33)

- NEW: `test.extend()` builder pattern with type inference — return values directly instead of calling `use()`, TypeScript infers fixture types [source](./.skilld/releases/v4.1.0.md:L27)

- NEW: Tags support via `test.tags` option and `--tags-filter` CLI flag — organize tests and apply shared options like timeout/retry [source](./.skilld/releases/v4.1.0.md:L22)

- NEW: `vi.defineHelper()` utility — hides helper function internals from stack traces, points errors to call site instead [source](./.skilld/docs/blog/vitest-4-1.md:L295-L314)

- NEW: `page.mark()` and `locator.mark()` APIs — annotate trace timeline with custom markers in browser tests [source](./.skilld/releases/v4.1.0.md:L36)

- NEW: `userEvent.wheel()` API for browser tests [source](./.skilld/releases/v4.1.0.md:L44)

- NEW: Matcher types exposed — asymmetric matchers and custom matchers now have proper TypeScript types [source](./.skilld/releases/v4.1.0.md:L18)

- NEW: `meta` option in test options — attach arbitrary metadata to test tasks [source](./.skilld/releases/v4.1.0.md:L26)

- NEW: `setTickMode()` in timer controls — from sinon/fake-timers v15 [source](./.skilld/releases/v4.1.0.md:L17)

- NEW: Chai-style mocking assertions — `expect(fn).to.have.been.called`, `.to.have.been.calledWith()`, `.to.have.returned`, `.to.have.callCount(n)` [source](./.skilld/docs/blog/vitest-4-1.md:L419-L434)

- NEW: `expect.schemaMatching()` asymmetric matcher — validates values against Standard Schema v1 (Zod, Valibot, ArkType) [source](./.skilld/docs/blog/vitest-4.md:L259-L289)

- NEW: `expect.assert()` — Chai assert available on expect object for easier type narrowing [source](./.skilld/docs/blog/vitest-4.md:L235-L257)

- NEW: `--detect-async-leaks` flag and `detectAsyncLeaks` config — reports leaked timers and unresolved async using `node:async_hooks` [source](./.skilld/docs/blog/vitest-4-1.md:L315-L337)

- NEW: `coverage.changed` option — report coverage only for modified files while running all tests [source](./.skilld/releases/v4.1.0.md:L54)

- NEW: `experimental_parseSpecifications()` API method — parse test file without executing it [source](./.skilld/docs/blog/vitest-4.md:L323)

- NEW: `runTestFiles()` as alternative to `runTestSpecifications()` in API [source](./.skilld/releases/v4.1.0.md:L40)

- NEW: `allowWrite` and `allowExec` options for API configuration [source](./.skilld/releases/v4.1.0.md:L41)

- NEW: `toMatchScreenshot()` assertion for visual regression testing — captures and compares screenshots in browser mode [source](./.skilld/docs/blog/vitest-4.md:L145-L174)

- NEW: `toBeInViewport()` matcher with optional `ratio` parameter — checks if element in viewport using IntersectionObserver [source](./.skilld/docs/blog/vitest-4.md:L166-L174)

- NEW: Playwright Trace Viewer support with `trace` config option — browser interactions automatically grouped and linked to source [source](./.skilld/docs/blog/vitest-4.md:L176-L182)

- NEW: `frameLocator()` API for `<iframe>` element location (playwright provider only) [source](./.skilld/docs/blog/vitest-4.md:L184-L196)

- NEW: Locator `.length` property — works with `toHaveLength()` matcher [source](./.skilld/docs/blog/vitest-4.md:L198-L202)

## Deprecated APIs (v4.1)

- DEPRECATED: Several `vitest/*` entry points — migration path to be defined; currently warn but functional [source](./.skilld/releases/v4.1.0.md:L76)

- DEPRECATED: `toBe*` spy assertions in favor of `toHaveBeen*` and `toThrowError` — chai-style assertions recommended instead [source](./.skilld/releases/v4.1.0.md:L104)

- DEPRECATED: Unused types in matcher context (e.g., `MatcherContext` extensions) [source](./.skilld/releases/v4.1.0.md:L79)

**Also changed:** `@vitest/browser/context` import path (use `vitest/browser`) · `basic` reporter removed (use `default` with `summary: false`) · `vi.mocked()` now supports deep partial · `page.frameLocator()` strict mode default · `browser.detailsPanelPosition` UI configuration · coverage ignore hints updated (`/* istanbul ignore start --` / `/* v8 ignore start --`) · `experimental.viteModuleRunner: false` option for native Node.js execution · Type-aware hooks on `test.extend()` fixtures · `watcher`, `enableCoverage`, `disableCoverage`, `getSeed`, `getGlobalTestNamePattern`, `waitForTestRunEnd` new API methods
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Use `test.extend()` with the builder pattern for fixtures — automatically infers fixture types without requiring manual type declarations, making custom test utilities more ergonomic and maintainable [source](./.skilld/docs/blog/vitest-4-1.md#type-inference-in-test-extend-new-builder-pattern)

- Use `vi.defineHelper()` to wrap custom assertion functions — removes test internals from stack traces so errors point to where the helper was called, not inside its implementation [source](./.skilld/docs/blog/vitest-4-1.md#helper-for-better-stack-traces)

- Organize tests with tags and filter them via CLI — define tags in config with optional test options (timeout, retry) that automatically apply to all tests with that tag [source](./.skilld/docs/blog/vitest-4-1.md#test-tags)

- Use `expect` from test context in concurrent tests — when running snapshots or assertions with `.concurrent`, use the context-bound `expect` to ensure the correct test is detected [source](./.skilld/docs/guide/test-context.md:L41-52)

- Use `.concurrent` on test suites for parallel execution — mark individual tests or entire suites as concurrent to run them in parallel and reduce overall test duration [source](./.skilld/docs/guide/features.md:L50-78)

- Prefer `vi.spyOn()` over `vi.mock()` for tracking single exports — when you only need to track calls to one method without replacing the entire module, use `vi.spyOn()` on a namespace import [source](./.skilld/docs/guide/mocking/modules.md:L105-115)

- Use `{ spy: true }` option to auto-mock while preserving behavior — when you want to track calls but keep the original implementation, pass `{ spy: true }` to `vi.mock()` instead of wrapping the implementation [source](./.skilld/docs/guide/mocking/modules.md:L167-187)

- Return cleanup functions from setup hooks — `beforeEach()` and `beforeAll()` can return an optional cleanup function instead of requiring separate `afterEach()` or `afterAll()` declarations [source](./.skilld/docs/api/hooks.md:L37-50)

- Use `toMatchFileSnapshot()` for multi-line or language-specific snapshots — store snapshots in actual files with meaningful extensions (`.html`, `.xml`) rather than escape-heavy `.snap` files for better readability [source](./.skilld/docs/guide/snapshot.md:L88-103)

- Enable `experimental.fsModuleCache` for faster watch reruns — persist Vitest's file transform cache to disk so subsequent reruns don't retransform unchanged modules, especially beneficial with large module graphs [source](./.skilld/docs/guide/improving-performance.md:L82-92)

- Use `pool: 'threads'` for 10-30% performance improvement over forks — switch from the default `forks` pool to `threads` for faster test execution, though `forks` is safer for compatibility with hanging processes [source](./.skilld/docs/guide/improving-performance.md:L94-113)

- Use Browser Mode with Playwright provider for CI — avoid the `preview` provider in continuous integration; Playwright provides true browser automation via Chrome DevTools Protocol and supports parallel execution [source](./.skilld/docs/guide/browser/index.md:L56-61)

- Shard large test suites across CI machines — split your test suite using `--shard=N/TOTAL` and `--reporter=blob` on multiple machines, then merge reports with `--merge-reports` to balance load [source](./.skilld/docs/guide/improving-performance.md:L115-220)

- Use `vi.hoisted()` before `vi.mock()` to reference outer scope variables — when your mock factory needs variables from the file scope, define them inside `vi.hoisted()` and reference them in the mock factory [source](./.skilld/docs/api/vi.md:L102-123)
<!-- /skilld:best-practices -->
