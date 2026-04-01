---
name: nuxtjs-tailwindcss-skilld
description: "ALWAYS use when writing code importing \"@nuxtjs/tailwindcss\". Consult for debugging, best practices, or modifying @nuxtjs/tailwindcss, nuxtjs/tailwindcss, nuxtjs tailwindcss, tailwindcss."
metadata:
  version: 6.14.0
  generated_at: 2026-04-01
---

# nuxt-modules/tailwindcss `@nuxtjs/tailwindcss@6.14.0`
**Tags:** alpha: 4.0.0-12, prerelease: 5.0.0-0, latest: 6.14.0

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p @nuxtjs/tailwindcss` instead of grepping `.skilld/` directories. Run `skilld search --guide -p @nuxtjs/tailwindcss` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

- NEW: `configPath` option — v6.12 introduced HMR support with ability to specify custom config file paths separately from inline module config. Use for Tailwind plugins that require dedicated config files [source](./.skilld/releases/v6.12.0.md:L13)

- NEW: `defineConfig()` export — v6.13 added c12-powered config loader and `defineConfig` utility for type-safe Tailwind config authoring in TypeScript [source](./.skilld/releases/v6.13.0.md:L13)

- NEW: `tw` utility function — v6.10 introduced util to write Tailwind classes inside template strings and function calls with editor IntelliSense support via VSCode classRegex config [source](./.skilld/releases/v6.10.0.md:L11)

- NEW: `editorSupport` option — v6.11 added DX utilities including `autocompleteUtil` to enhance IDE/editor Tailwind class suggestions via custom handlers like `tw\`...\`` strings [source](./.skilld/releases/v6.11.0.md:L12)``

- REFACTORED: `injectPosition` moved to `cssPath` — v6.11 restructured injection control: use `cssPath: [path, { injectPosition: 'first'|'last'|{after: string}|number }]` format instead of separate top-level option [source](./.skilld/releases/v6.11.0.md:L24)

- NEW: First-class HMR for config files — v6.12 rewrote module to natively support configuration file hot module replacement without server restart (zero breaking changes but requires plugins in separate config file) [source](./.skilld/releases/v6.12.0.md:L11)

- NEW: `spaLoadingTemplate` content resolution — v6.13 added `{srcDir}/app/spa-loading-template.html` to automatic content resolution for apps using custom SPA loading templates [source](./.skilld/releases/v6.13.0.md:L12)

- NEW: Tailwind v4 initial support — v6.14 adds `tw4` support in v6 module with improved config handling and warning suppression for v4-only code paths [source](./.skilld/releases/v6.14.0.md:L13)

- NEW: `merger` export — v6.13 exposed `merger` utility from module exports for advanced config manipulation in Nuxt modules [source](./.skilld/releases/v6.13.0.md:L14)

**Also changed:** `editorSupport.autocompleteUtil` option (v6.11+) · Quiet mode via `quiet: true` config (v6.10+) · `exposeConfig.level` property up to 4 for granular imports (v6+) · Conditional return in defineConfig() (v6.14+)
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Prefer `tailwind.config` file over inline `config` option for complex configurations — the file-based approach allows JSON-serializable values and has priority during merging [source](./.skilld/docs/content/2.tailwindcss/1.configuration.md:L19-44)

- Use `cssPath` with `injectPosition` to control CSS cascade and priority — `'first'` places Tailwind at the lowest priority (safe for overrides), `'last'` gives it the highest priority (overrides everything) [source](./.skilld/docs/content/1.getting-started/2.module-options.md:L60-91)

- Enable `exposeConfig: true` only when accessing Tailwind configuration at runtime — adds ~19.5KB (~3.5KB gzipped) to bundle, so avoid unless necessary [source](./.skilld/docs/content/2.tailwindcss/1.configuration.md:L165-191)

- Use `exposeConfig: { level: 4 }` with deep property imports for optimal tree-shaking — allows importing specific nested config values like `theme/colors/slate` instead of the entire config [source](./.skilld/docs/content/2.tailwindcss/1.configuration.md:L195-216)

- Configure `content` paths with all Nuxt directories your app uses — the module auto-includes components, layouts, pages, plugins, composables, and utils, but custom directories must be added manually [source](./.skilld/docs/content/2.tailwindcss/1.configuration.md:L13-30)

- Use Nuxt hooks `tailwindcss:config` and `tailwindcss:resolvedConfig` for module authoring instead of inline config — hooks run at the correct time in the config resolution pipeline [source](./.skilld/docs/content/2.tailwindcss/1.configuration.md:L130-163)

- Enable `viewer: true` in development to access the Tailwind config viewer at `/_tailwind/` — provides a visual interface for debugging theme values without leaving the browser [source](./.skilld/docs/content/1.getting-started/2.module-options.md:L102-107)

- Use `defu` to merge configurations — the module automatically uses defu's array merger for combining multiple config sources, ensuring correct precedence [source](./.skilld/docs/content/2.tailwindcss/1.configuration.md:L42-44)

- Set `editorSupport: true` in development for VSCode autocomplete and syntax highlighting of Tailwind classes in template strings — requires VSCode extension and matching `.vscode/settings.json` config [source](./.skilld/docs/content/2.tailwindcss/2.editor-support.md:L23-45)

- Configure VSCode's `tailwindCSS.experimental.configFile` to `.nuxt/tailwind/postcss.mjs` for multi-layer projects — the module generates the merged config there automatically [source](./.skilld/docs/content/2.tailwindcss/2.editor-support.md:L49-62)

- Set `cssPath: false` when injecting Tailwind CSS manually through other means — prevents duplicate CSS when you're handling the stylesheet yourself [source](./.skilld/docs/content/1.getting-started/2.module-options.md:L93-100)

- Avoid downgrading Tailwind CSS version without reviewing the module's release changelog — compatibility between this module and specific Tailwind versions can break with downgrades [source](./.skilld/docs/content/2.tailwindcss/1.configuration.md:L239-241)

- Use `experimental.tailwindcss4: true` when testing Tailwind CSS v4 with this module — enables initial v6.14.0+ support for the newer Tailwind version [source](./.skilld/repos/nuxt-modules/tailwindcss/releases/v6.14.0.md:L13)
<!-- /skilld:best-practices -->
