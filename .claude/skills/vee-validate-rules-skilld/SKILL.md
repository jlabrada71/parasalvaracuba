---
name: vee-validate-rules-skilld
description: "ALWAYS use when writing code importing \"@vee-validate/rules\". Consult for debugging, best practices, or modifying @vee-validate/rules, vee-validate/rules, vee-validate rules, vee validate rules, vee-validate, vee validate."
metadata:
  version: 4.15.1
  generated_at: 2026-04-01
---

# logaretm/vee-validate `@vee-validate/rules@4.15.1`
**Tags:** next-edge: 4.5.0-alpha.2, edge: 4.5.0-alpha.6, next: 4.5.8

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p @vee-validate/rules` instead of grepping `.skilld/` directories. Run `skilld search --guide -p @vee-validate/rules` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes — prioritize recent major/minor releases.

- BREAKING: `import * from "@vee-validate/rules"` (default export) — removed in v4.11.7, use named imports instead. Package no longer exports a default export. [source](./.skilld/releases/CHANGELOG.md#4117)

- NEW: `all` export — added in v4.13.0, provides a record of all validation rules with simplified typings `Record<string, SimpleValidationRuleFunction>`. Use `import { all } from "@vee-validate/rules"` to access all validators. [source](./.skilld/releases/CHANGELOG.md#4130)

- BREAKING: `exports` field in package.json — added in v4.14.0, explicitly defines module resolution paths. Affects import resolution; only the main export (`.`) is available. Previous implicit wildcard imports no longer work. [source](./.skilld/releases/CHANGELOG.md#4140)

- CHANGED: `email` validator regex — updated in v4.14.0 (issue #4801) and further refined in v4.12.3 to use a better regex pulled from Zod. Both changes improve email validation accuracy; old regex patterns may have accepted invalid emails. Silent behavior change. [source](./.skilld/releases/CHANGELOG.md#4140), [source](./.skilld/releases/CHANGELOG.md#4123)

- RENAMED: `excluded` rule renamed to `not_one_of` — v4.7.3 renamed the rule for consistency with naming conventions. Old `excluded` export no longer available; use `not_one_of` instead. [source](./.skilld/releases/CHANGELOG.md#473)

- CHANGED: `length` rule signature — v4.12.0 made the rule consistent with other rules. Behavior change in parameter handling to align with `min`, `max`, and other validators. [source](./.skilld/releases/CHANGELOG.md#4120)

- FIXED: `ext` rule regex — v4.7.4 fixed regex that incorrectly used wildcard instead of literal period. Previously could match unintended file extensions. Silent behavior change, more strict validation. [source](./.skilld/releases/CHANGELOG.md#474)

- ENHANCED: `mimes` validator — v4.9.0 now correctly handles MIME types with plus signs (e.g., `application/vnd.api+json`). Previous versions could reject valid MIME types with `+` characters. [source](./.skilld/releases/CHANGELOG.md#490)

- IMPROVED: Type inference for Yup/Zod schemas — v4.8.0 added better typing with output types and input inference. Affected `toTypedSchema()` return types and schema-based validator typing. [source](./.skilld/releases/CHANGELOG.md#480)

**Also changed:** Incorrect shared type import in rules (v4.14.0)
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## @vee-validate/rules v4.15.1 Best Practices

## Best Practices

- Define all global rules at your application's entry point (main.js in CLI apps, or a Nuxt plugin file) to ensure forms can access them consistently — rules defined later in the component tree may not be available when needed [source](./.skilld/docs/src/pages/guide/global-validators.mdx#rules-placement)

- Use the `all` named export to batch-import and register all available rules at once instead of individually importing each rule — simplifies setup and ensures all common validators are available [source](./.skilld/docs/src/pages/guide/global-validators.mdx:L264:273)

```js
import { defineRule } from 'vee-validate';
import { all } from '@vee-validate/rules';

Object.entries(all).forEach(([name, rule]) => {
  defineRule(name, rule);
});
```

- Treat validation rules as pure functions that only depend on their inputs, without relying on external component scope — improves predictability and reusability across the app [source](./.skilld/docs/src/pages/guide/global-validators.mdx:L278)

- Use object expressions instead of string format for complex validation rules — more expressive, avoids string parsing edge cases, and supports dynamic validation [source](./.skilld/docs/src/pages/guide/global-validators.mdx:L224:240)

- Leverage the `@` prefix syntax for cross-field validation rules like `confirmed` to automatically inject target field values — more concise than manually accessing context.form [source](./.skilld/docs/src/pages/guide/global-validators.mdx:L200:222)

- Use object format with named arguments (e.g., `{ between: { min: 1, max: 10 } }`) for parameterized rules instead of positional arrays — improves readability and reduces parameter order mistakes [source](./.skilld/docs/src/pages/guide/global-validators.mdx:L422:435)

- Avoid using the `g` (global) flag in regex rules as the same regex instance is reused across validations, causing stateful behavior and unexpected failures [source](./.skilld/docs/src/pages/guide/global-validators.mdx:L745:749)

- Use object format for `regex` rules instead of string format to prevent conflicts with vee-validate's pipe and comma delimiters [source](./.skilld/docs/src/pages/guide/global-validators.mdx:L739:743)

- Be cautious about defining too many global rules as it increases initial bundle size — only define rules your app actually uses [source](./.skilld/docs/src/pages/guide/global-validators.mdx:L277)

- Rules like `confirmed` require a `<Form>` parent or `useForm()` in the component hierarchy — without proper context, cross-field references will not work [source](./.skilld/docs/src/pages/guide/global-validators.mdx:L458:462)

- Display error messages conditionally by checking `meta.touched` or `meta.dirty` before rendering — prevents aggressive error display before user interaction [source](./.skilld/docs/src/pages/guide/best-practices.mdx:L10:33)

- Use tree-shaking to import only the rules you need instead of importing the entire package — reduces bundle size significantly for form-heavy applications [source](./.skilld/docs/src/pages/guide/best-practices.mdx:L35:59)

- Wrap validation schemas with `markRaw()` when stored in component data to prevent Vue from applying unnecessary deep reactivity — significantly improves performance for large schemas [source](./.skilld/docs/src/pages/guide/best-practices.mdx:L61:119)

- Call `resetField()` when dynamically showing or hiding form fields with `v-if` to clear validation state and avoid displaying stale errors — prevents error messages from persisting when fields are re-rendered [source](./.skilld/repos/logaretm/vee-validate/discussions/discussion-4799.md#accepted-answer)
<!-- /skilld:best-practices -->
