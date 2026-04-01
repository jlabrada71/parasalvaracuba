---
name: yup-skilld
description: "ALWAYS use when writing code importing \"yup\". Consult for debugging, best practices, or modifying yup."
metadata:
  version: 1.7.1
  generated_at: 2026-04-01
---

# jquense/yup `yup@1.7.1`
**Tags:** next: 1.0.0-beta.8, latest: 1.7.1

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p yup` instead of grepping `.skilld/` directories. Run `skilld search --guide -p yup` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes in yup v1.x — prioritizing recent minor releases where new APIs are commonly unknown to LLMs trained on older data.

- NEW: `LazySchema` — exposed as a public type in v1.6.0 for type-safe lazy schema patterns [source](./.skilld/releases/CHANGELOG.md:L35)

- NEW: `object().exact()` — added in v1.5.0 to enforce exact property match without extras [source](./.skilld/releases/CHANGELOG.md:L51)

- NEW: `object().stripUnknown()` — added in v1.5.0 to remove unknown properties during validation [source](./.skilld/releases/CHANGELOG.md:L51)

- NEW: `string().datetime()` — added in v1.4.0 for RFC 3339 datetime validation [source](./.skilld/releases/CHANGELOG.md:L67)

- NEW: Schema metadata typing — v1.3.0 allows schema to be strongly typed with `meta<T>()` [source](./.skilld/releases/CHANGELOG.md:L117)

- NEW: `printValue()` — exposed utility function in v1.2.0 for formatting schema error messages [source](./.skilld/releases/CHANGELOG.md:L133)

- NEW: `default(options => value)` — v1.2.0 now passes validation options to default value callback function [source](./.skilld/releases/CHANGELOG.md:L134)

- NEW: Standard schema interface — v1.7.0 implements standard schema validation interface for broader compatibility [source](./.skilld/releases/CHANGELOG.md:L12)

- NEW: Reference parameter resolution — v1.7.0 resolves ref params when present during `describe()` calls [source](./.skilld/releases/CHANGELOG.md:L13)

- BEHAVIOR CHANGE: `strip()` scope — v1.1.0 changed to only resolve `strip()` for schema when used as an object field, not standalone [source](./.skilld/releases/CHANGELOG.md:L163)

**Also changed:** `object.pick()`/`object.omit()` context handling v1.1.0 · `ValidationError` extends Error v1.3.1 · `optional()` on strings v1.0.0-beta.8
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Yup v1.7.1 Best Practices

## Best Practices

- Use `InferType<typeof schema>` to extract static TypeScript types from schemas — enables compile-time type checking and autocomplete while ensuring schema and types stay in sync [source](./.skilld/pkg/README.md:L305:324)

- Use `strict: true` validation option to skip transformations when input is already parsed — prevents unwanted coercion and ensures validation-only behavior without side effects [source](./.skilld/pkg/README.md:L58:70)

- Schemas are immutable; always clone before mutations — each method call returns a new instance, so you can safely compose and reuse schemas without fear of affecting other references [source](./.skilld/docs/extending.md:L23:24)

- Never mutate an existing schema when creating extensions — instead use `clone()` before modifications, or use `addMethod()` which handles this automatically [source](./.skilld/docs/extending.md:L56:57)

- Use `addMethod()` to add custom validators to built-in schema types — it safely extends schema prototypes without the risks of manual prototype mutations [source](./.skilld/docs/extending.md:L27:41)

- Pass functions to the `message` parameter in custom tests to access context variables like `label` — enables field-friendly error messages without path-based output [source](./.skilld/issues/issue-1439.md:L62:70)

- Export and import `LazySchema` type for circular or conditional schema definitions — the class has been properly exported since v1.6.0 to support TypeScript type safety in complex schema patterns [source](./.skilld/releases/CHANGELOG.md:L35:36)

```ts
import { lazy, LazySchema } from 'yup';

const circularSchema: LazySchema = lazy((value) =>
  value.type === 'nested' ? nestedSchema : simpleSchema
);
```

- Use `when()` with context prefix `$` to depend on validation context rather than sibling fields — separate concerns between data-driven and context-driven conditional validation [source](./.skilld/pkg/README.md:L1082:1087)

- Call `setLocale()` before schema creation to ensure all error messages use your custom messages — localization is applied globally to subsequent schema instantiations [source](./.skilld/pkg/README.md:L417:440)

- Verify input types in transform functions before operating on values — previous transforms may have failed, leaving the value as `NaN`, invalid dates, or other sentinel types, not necessarily the expected type [source](./.skilld/pkg/README.md:L218:219)

- Use `cast()` for type coercion without running validation tests; use `validate()` for complete parsing and assertion — `cast()` applies transforms and type checks but skips custom test assertions [source](./.skilld/pkg/README.md:L45:56)

- Set `skipAbsent: true` in custom test config for optional fields — prevents unnecessary validation checks for undefined or null values unless explicitly checking for their presence [source](./.skilld/pkg/README.md:L248:251)

- Use function-based defaults for object and array schemas to avoid cloning overhead on each validation — reduces performance penalty when defaults are used repeatedly [source](./.skilld/pkg/README.md:L936:952)

- Yup implements the Standard Schema interface as of v1.7.0 — enables drop-in compatibility with form libraries and tools built on the standard schema spec without requiring custom adapters [source](./.skilld/pkg/README.md:L476:478)
<!-- /skilld:best-practices -->
