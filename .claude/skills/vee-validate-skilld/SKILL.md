---
name: vee-validate-skilld
description: "ALWAYS use when writing code importing \"vee-validate\". Consult for debugging, best practices, or modifying vee-validate, vee validate."
metadata:
  version: 4.15.1
  generated_at: 2026-04-01
---

# logaretm/vee-validate `vee-validate@4.15.1`
**Tags:** prev: 1.0.0-beta.10, next-edge: 4.5.0-alpha.2, edge: 4.5.0-alpha.6

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p vee-validate` instead of grepping `.skilld/` directories. Run `skilld search --guide -p vee-validate` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes for vee-validate v4.15.1 — prioritizing recent major/minor releases.

- DEPRECATED: `useFieldModel()` — deprecated in favor of `defineField()` for unified field binding [source](./.skilld/pkg/dist/vee-validate.d.ts:L445:L451)

- DEPRECATED: `defineComponentBinds()` — deprecated in favor of `defineField()` for unified field binding [source](./.skilld/pkg/dist/vee-validate.d.ts:L453:L455)

- DEPRECATED: `defineInputBinds()` — deprecated in favor of `defineField()` for unified field binding [source](./.skilld/pkg/dist/vee-validate.d.ts:L457:L459)

- DEPRECATED: `valueProp` option in `useField()` FieldOptions — deprecated, use `checkedValue` instead for checked input values [source](./.skilld/pkg/dist/vee-validate.d.ts:L535:L537)

- DEPRECATED: `standalone` option in `useField()` FieldOptions — deprecated, use `controlled` instead (opposite behavior) [source](./.skilld/pkg/dist/vee-validate.d.ts:L542:L545)

- DEPRECATED: `modelPropName` option in `useField()` FieldOptions — deprecated, pass model name via `syncVModel` string parameter instead [source](./.skilld/pkg/dist/vee-validate.d.ts:L548:L550)

**Also changed:** Removed default export in @vee-validate/rules v4.11.7 · Email regex updated v4.12.3 · Added 'exports' field in package.json v4.14.0 · Official Nuxt module package added v4.8.6 · Valibot schema support added v4.15.0
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Display errors only when field is touched to avoid aggressive error messaging — prevents overwhelming users while they are still filling out the form [source](./.skilld/docs/src/pages/guide/best-practices.mdx#displaying-errors)

- Use named imports from yup instead of import * to enable bundler tree-shaking — reduces bundle size significantly for validator libraries [source](./.skilld/docs/src/pages/guide/best-practices.mdx#yup-bundle-size)

- Mark yup/zod schemas as non-reactive using markRaw or setup context — avoids Vue's deep reactivity conversion overhead on validation schemas [source](./.skilld/docs/src/pages/guide/best-practices.mdx#yup-schemas-in-data)

- Use toTypedSchema with yup/zod/valibot for dual input/output type safety — automatically types both user input (nullable) and submitted values (required) correctly [source](./.skilld/docs/src/pages/guide/composition-api/typed-schema.mdx#input-and-output-types)

- Destructure composable results directly into individual refs rather than wrapping entire composables with reactive() — preserves reactivity tracking and simplifies template access [source](./.skilld/docs/src/pages/guide/composition-api/caveats.mdx#destructing-composable)

- Pass field names as functions (getters) to useField when name comes from reactive props — maintains reactivity when field names change dynamically in loops or conditional contexts [source](./.skilld/docs/src/pages/guide/composition-api/caveats.mdx#function-field-names-with-usefield)

- Always provide initialValues to useForm even if empty objects — prevents undefined validation issues with third-party validators that don't handle undefined gracefully [source](./.skilld/docs/src/pages/guide/composition-api/handling-forms.mdx#initial-values)

- Use handleSubmit.withControlled() to submit only form-controlled fields — filters out extra initial data from APIs and prevents sending unintended fields to servers [source](./.skilld/docs/src/pages/guide/composition-api/handling-forms.mdx#controlled-values)

- Use resetForm instead of setValues for async data initialization — resets all meta state (dirty/touched) while updating values, providing proper form state for pre-fill scenarios [source](./.skilld/docs/src/pages/guide/composition-api/handling-forms.mdx#setting-initial-values-asynchronously)

- Set server validation errors with setErrors in submission handlers after API responses — allows vee-validate to manage and display server-side errors without duplicating validation logic [source](./.skilld/docs/src/pages/guide/composition-api/handling-forms.mdx#setting-errors-manually)

- Combine valid + dirty checks for submit button disabled state, not valid alone — prevents false positives where unmodified pristine forms show as valid but haven't been validated yet [source](./.skilld/docs/src/pages/api/composition-helpers.mdx#useisformvalid)

- Use field.key from useFieldArray for v-for iteration, not array indices — maintains field stability when array items are added/removed/reordered, preserving validation state per item [source](./.skilld/docs/src/pages/guide/composition-api/nested-objects-and-arrays.mdx#field-arrays)

- Set keepValuesOnUnmount on useForm or individual useField calls for multi-step/tabbed forms — preserves field values when conditionally rendered fields unmount, required for wizard patterns [source](./.skilld/docs/src/pages/guide/composition-api/nested-objects-and-arrays.mdx#paths-creation-and-destruction)

- Use errorBag instead of errors to display multiple validation messages per field — errors only shows first message per field; errorBag contains all violations [source](./.skilld/docs/src/pages/guide/composition-api/handling-forms.mdx#errors)
<!-- /skilld:best-practices -->
