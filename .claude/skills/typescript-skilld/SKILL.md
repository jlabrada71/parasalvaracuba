---
name: typescript-skilld
description: "ALWAYS use when editing or working with *.ts, *.tsx, *.mts, *.cts files or code importing \"typescript\". Consult for debugging, best practices, or modifying typescript, TypeScript."
metadata:
  version: 6.0.2
  generated_at: 2026-04-01
---

# microsoft/TypeScript `typescript@6.0.2`
**Tags:** dev: 3.9.4, tag-for-publishing-older-releases: 4.1.6, insiders: 4.6.2-insiders.20220225

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p typescript` instead of grepping `.skilld/` directories. Run `skilld search --guide -p typescript` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

- BREAKING: Default `strict: true` — TypeScript 6.0 now defaults `"strict": true` in tsconfig; set `"strict": false` if you need older behavior [source](./.skilld/releases/blog-6.0.md:L472)

- BREAKING: Default `module: esnext` — TypeScript 6.0 defaults `"module": "esnext"` instead of `commonjs`; specify `"module": "commonjs"` or another target to restore prior behavior [source](./.skilld/releases/blog-6.0.md:L473)

- BREAKING: Default `target` now floating (es2025) — TypeScript 6.0 defaults `"target"` to the latest ES version (currently `es2025`); set explicitly to restore older behavior [source](./.skilld/releases/blog-6.0.md:L474)

- BREAKING: Default `types: []` — TypeScript 6.0 no longer auto-includes all `@types/*` packages; must explicitly set `"types": ["node", "jest"]` or `["*"]` [source](./.skilld/releases/blog-6.0.md:L512:540)

- BREAKING: Default `rootDir: .` — TypeScript 6.0 now defaults `rootDir` to the tsconfig directory instead of inferring common source root; set `"rootDir": "./src"` explicitly if using source subdirectories [source](./.skilld/releases/blog-6.0.md:L480:510)

- BREAKING: `esModuleInterop: false` no longer allowed — TypeScript 6.0 requires `esModuleInterop: true` (or omit); CommonJS import syntax changed from `import * as module` to `import module` [source](./.skilld/releases/blog-6.0.md:L671:690)

- BREAKING: `allowSyntheticDefaultImports: false` no longer allowed — TypeScript 6.0 enforces default import behavior; adjust CommonJS imports to use default syntax [source](./.skilld/releases/blog-6.0.md:L671:690)

- BREAKING: `asserts` keyword on imports removed — use `with` syntax instead for import attributes; `import blob from "./file.json" asserts { type: "json" }` is now an error [source](./.skilld/releases/blog-6.0.md:L737:757)

- NEW: `Map.getOrInsert(key, defaultValue)` — new in es2025, sets and returns value if key missing, avoiding verbose has/get/set pattern [source](./.skilld/releases/blog-6.0.md:L356:407)

- NEW: `Map.getOrInsertComputed(key, callback)` — new in es2025, like `getOrInsert` but callback only called if key missing, for expensive computations [source](./.skilld/releases/blog-6.0.md:L356:407)

- NEW: `WeakMap.getOrInsert(key, defaultValue)` — new in es2025, weak map variant of `Map.getOrInsert` [source](./.skilld/releases/blog-6.0.md:L356:407)

- NEW: `WeakMap.getOrInsertComputed(key, callback)` — new in es2025, weak map variant of `Map.getOrInsertComputed` [source](./.skilld/releases/blog-6.0.md:L356:407)

- NEW: `RegExp.escape(string)` — new in es2025, escapes special regex characters for safe literal string matching [source](./.skilld/releases/blog-6.0.md:L410:424)

- DEPRECATED: `--moduleResolution node` (node10) — replaced by `nodenext` for Node.js or `bundler` for bundlers; Node 10 resolution is outdated [source](./.skilld/releases/blog-6.0.md:L573:579)

- DEPRECATED: `--baseUrl` — no longer acts as module resolution root; move paths prefix into `paths` entries (e.g. `"@app/*": ["./src/app/*"]`) [source](./.skilld/releases/blog-6.0.md:L595:663)

**Also changed:** `target: es5` deprecated · `--downlevelIteration` deprecated · `--module amd/umd/systemjs` deprecated · `--outFile` deprecated · legacy `module` namespace syntax hard error · `/// <reference no-default-lib>` deprecated · `--alwaysStrict false` no longer allowed · `--noUncheckedSideEffectImports` now true by default · `--libReplacement` now false by default · `--stableTypeOrdering` flag new for 6.0→7.0 migration · `es2025` lib target new · Temporal API types new · subpath imports `#/` now supported · dom lib includes dom.iterable/dom.asynciterable · Less context-sensitivity on unmodified `this` parameters
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## TypeScript v6.0.2 Best Practices

## Best Practices

- For libraries, always enable `strict: true` in `tsconfig.json` — ensures library code works correctly with any consumer configuration, since satisfying strict settings tends to satisfy all others [source](./.skilld/docs/docs/handbook/modules/guides/choosing-compiler-options.html.md#im-writing-a-library)

- Use `"module": "node18"` and `"moduleResolution": "nodenext"` for Node.js projects — Node.js module resolution is the most widely compatible, and code working in Node.js almost always works in bundlers [source](./.skilld/docs/docs/handbook/modules/guides/choosing-compiler-options.html.md#im-compiling-and-running-the-outputs-in-nodejs)

- Set `verbatimModuleSyntax: true` in library configurations — prevents writing ambiguous import statements based on `esModuleInterop` settings and protects against ESM/CJS export pitfalls [source](./.skilld/docs/docs/handbook/modules/guides/choosing-compiler-options.html.md#im-writing-a-library)

- Use separate output directories with `rootDir` and `outDir` — necessary for libraries that publish source files; otherwise extension substitution causes consumers to load `.ts` files instead of `.d.ts` files [source](./.skilld/docs/docs/handbook/modules/guides/choosing-compiler-options.html.md#im-writing-a-library)

- Never use boxed types (`String`, `Number`, `Boolean`, `Symbol`, `Object`) — use lowercase primitives (`string`, `number`, `boolean`) instead, as boxed types refer to non-primitive objects rarely used in JavaScript [source](./.skilld/docs/docs/handbook/declaration-files/do-s-and-don-ts.html.md#number-string-boolean-symbol-and-object)

- Avoid `any` type in production code; use `unknown` instead — `any` disables type checking, while `unknown` maintains type safety and forces explicit type refinement [source](./.skilld/docs/docs/handbook/declaration-files/do-s-and-don-ts.html.md#any)

- Use `void` return type for callbacks whose return value will be ignored — safer than `any` because it prevents accidental usage of the return value [source](./.skilld/docs/docs/handbook/declaration-files/do-s-and-don-ts.html.md#return-types-of-callbacks)

- Prefer optional parameters over multiple overloads with different trailing arguments — single signature with optional params is more maintainable and works correctly with rest parameters and function reassignment [source](./.skilld/docs/docs/handbook/declaration-files/do-s-and-don-ts.html.md#use-optional-parameters)

- Use union types instead of overloads for functions differing by single parameter type — simplifies signatures and works correctly when passing values through as arguments [source](./.skilld/docs/docs/handbook/declaration-files/do-s-and-don-ts.html.md#use-union-types)

- Order function overloads from most specific to most general — TypeScript chooses the first matching overload, so more general signatures must come last [source](./.skilld/docs/docs/handbook/declaration-files/do-s-and-don-ts.html.md#ordering)

- Do not use optional parameters in callback signatures unless truly needed — makes intent clearer that the parameter is always passed; optional params only indicate the callback can ignore it [source](./.skilld/docs/docs/handbook/declaration-files/do-s-and-don-ts.html.md#optional-parameters-in-callbacks)

- Use `Map.getOrInsert()` for cache-like patterns — new ES2024 method eliminates boilerplate for checking existence and inserting default values [source](./.skilld/docs/docs/handbook/release-notes/typescript-6-0.html.md#new-types-for-upsert-methods-aka-getorinsert)

- Set `"target": "es2025"` to access latest built-in type definitions — TypeScript 6.0 adds `es2025` target with types for new built-in APIs like `RegExp.escape` and Temporal [source](./.skilld/docs/docs/handbook/release-notes/typescript-6-0.html.md#es2025-option-for-target-and-lib)
<!-- /skilld:best-practices -->
