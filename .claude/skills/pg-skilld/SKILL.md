---
name: pg-skilld
description: "ALWAYS use when writing code importing \"pg\". Consult for debugging, best practices, or modifying pg, node-postgres, node postgres."
metadata:
  version: 8.20.0
  generated_at: 2026-04-01
---

# brianc/node-postgres `pg@8.20.0`
**Tags:** beta: 8.14.2-alpha.1, latest: 8.20.0

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p pg` instead of grepping `.skilld/` directories. Run `skilld search --guide -p pg` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes in pg v8.20.0 — prioritize recent major/minor releases and breaking changes.

### Breaking Changes

- BREAKING: `Client#connect()` return value — v8.18 changed to return client instance (previously `undefined`). If relying on promise-based calling, no code change needed; callbacks must not assume no return value [source](./.skilld/releases/CHANGELOG.md:L16:18)

- BREAKING: SSL certificate validation — v8.0 changed default `rejectUnauthorized` from `false` to `true`. Self-signed certificates now fail by default; explicitly set `{ ssl: { rejectUnauthorized: false } }` to restore old behavior [source](./.skilld/releases/CHANGELOG.md:L127:138)

- BREAKING: Error types — v8.0 changed `notice` messages to no longer be instances of `Error`. If code checks `instanceof Error` for notice handling, update error type checks [source](./.skilld/releases/CHANGELOG.md:L127:138)

### New APIs (v8.x)

- NEW: `Pool` constructor `onConnect` callback — v8.20 allows async initialization of newly created pooled clients before they are used. Receives newly connected client; useful for setting session parameters [source](./.skilld/releases/CHANGELOG.md:L7:9)

- NEW: `Pool` constructor `min` option — v8.16 adds minimum connection pool size. Maintains idle connections ready for use, reducing connection initialization time [source](./.skilld/releases/CHANGELOG.md:L24:26)

- NEW: ESM module imports — v8.15 adds native ES module support via exports field. Both `import { Pool } from 'pg'` (ESM) and `require('pg').Pool` (CJS) now work; previously required workarounds for named imports [source](./.skilld/releases/CHANGELOG.md:L28:30)

- NEW: Per-query timeout — v8.13 adds ability to specify `timeout` option on individual queries via `client.query({ text: '...', timeout: 1000 })`, overriding client-level timeout [source](./.skilld/releases/CHANGELOG.md:L36:38)

- NEW: `queryMode` config option — v8.12 adds `queryMode: 'extended'` to force extended query protocol for parameterless queries. Standard mode uses simple protocol for queries without parameters; this option forces extended for all queries [source](./.skilld/releases/CHANGELOG.md:L40:42)

- NEW: SCRAM-SHA-256-PLUS authentication — v8.14 adds channel binding support for SCRAM-SHA-256-PLUS. Required for some PostgreSQL configurations with channel binding enabled; handled transparently [source](./.skilld/releases/CHANGELOG.md:L32:34)

- NEW: `Pool` option `lock_timeout` — v8.8 adds PostgreSQL `lock_timeout` session parameter support via config option. Sets statement-level timeout for lock acquisition [source](./.skilld/releases/CHANGELOG.md:L54:60)

- NEW: `Pool` option `allowExitOnIdle` — v8.7 allows process to exit when pool is idle (no active connections). Default false; set to true in serverless/stateless environments to avoid hanging processes [source](./.skilld/releases/CHANGELOG.md:L66:68)

- NEW: Stream factory support — v8.9 adds `stream` config option to provide custom stream implementation. For advanced use cases needing non-standard stream behavior [source](./.skilld/releases/CHANGELOG.md:L48:52)

- NEW: `release` event on Pool — v8.10 (pg-pool) emits `release` event when client is returned to pool. Complements existing `connect`, `remove`, `error` events [source](./.skilld/releases/CHANGELOG.md:L44:46)

- NEW: `DatabaseError` export — v8.6 and v8.4 export `DatabaseError` class from `pg-protocol` for better error type handling in catch blocks [source](./.skilld/releases/CHANGELOG.md:L75:80)

- NEW: Connection string `sslmode` support — v8.4 and v8.1 add `sslmode` and `&ssl=no-verify` query parameters to connection strings. Enables external configuration without code changes; equivalent to passing SSL objects in config [source](./.skilld/releases/CHANGELOG.md:L94:117)

- NEW: `options` string in config — v8.3 allows passing PostgreSQL command-line option flags as string via `{ options: '-c key=value' }`. Equivalent to `PGOPTIONS` environment variable [source](./.skilld/releases/CHANGELOG.md:L98:100)

### Deprecated APIs

- DEPRECATED: Internal query queue — v8.19 deprecates the internal query queue mechanism. Code should not rely on internal queue behavior; consider switching to explicitly managed connection pools or connection-per-request patterns if experiencing queue-related issues [source](./.skilld/releases/CHANGELOG.md:L11:14)

- CHANGED: Password callback signature — v8.19 changed password callback to receive connection parameters. Callback now receives `(host, user, database)` as arguments allowing parameter-aware password lookup (e.g., from vaults keyed by host) [source](./.skilld/releases/CHANGELOG.md:L11:14)

**Also changed:** Native bindings require minimum v3.0.1 (v8.8) · pg-pool v3.13.0 minimum (v8.x) · pg-types 2.2.0 pinned (v8.4) · Optional peer dependencies (v8.4) · pg-protocol internal parser (v8.2, backwards compatible)
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Centralize database access through a single module to enable logging, diagnostics, and configuration changes without modifying application code across multiple files [source](./.skilld/docs/pages/guides/project-structure.md:L5:10)

- Leave pool `max` size at its default of 10 for most applications; only increase if you encounter scaling bottlenecks, not preemptively, as oversized pools don't improve query performance [source](./.skilld/docs/pages/guides/pool-sizing.md:L23:25)

- Use `async/await` instead of event emitters for query handling; event emitters provide too many flow control options and mix poorly with promise `.catch` error handling [source](./.skilld/docs/pages/guides/upgrading.md:L67:75)

- For self-signed SSL certificates, pass `{ ssl: { rejectUnauthorized: false } }` rather than `ssl: true`, which defaults to strict verification in pg@8.0+ [source](./.skilld/docs/pages/guides/upgrading.md:L18:22)

- Replace deprecated `pgpass` module usage with a password callback function; the maintainer removed the explicit dependency to reduce third-party dependencies and enable extensibility [source](./.skilld/discussions/discussion-3601.md)

- When using password callbacks, leverage the connection parameters passed as arguments (since v8.19.0) to conditionally load credentials based on host, user, or database [source](./.skilld/releases/CHANGELOG.md:L14)

- Use the `onConnect` callback in pool configuration for async client initialization tasks like setting session parameters or preparing prepared statements [source](./.skilld/releases/CHANGELOG.md:L9)

- Always call `client.release()` within a finally block after acquiring a client from the pool to prevent connection leaks, even if the query succeeds [source](./.skilld/docs/pages/guides/project-structure.md:L88:92)

- Set query-level timeout via the query options object for fine-grained control over long-running queries, rather than relying only on client-level timeout [source](./.skilld/releases/CHANGELOG.md:L38)

- Configure minimum pool size for stable connection availability in production environments where you want to maintain warm connections across idle periods [source](./.skilld/releases/CHANGELOG.md:L26)

- Enable `allowExitOnIdle: true` for short-lived processes (scripts, lambdas) to prevent the idle pool from keeping the process alive indefinitely [source](./.skilld/releases/CHANGELOG.md:L68)

- Use `connectionLifetimeMillis` to periodically recycle connections and prevent stale database state or server-side connection limit issues in long-running applications [source](./.skilld/releases/CHANGELOG.md:L64:65)

- For streaming large result sets, use `pg-cursor` or `pg-query-stream` instead of the query object's event emitter pattern, which lacks backpressure support [source](./.skilld/docs/pages/guides/upgrading.md:L115)

- Listen to the pool's `error` event to capture unexpected connection failures and implement fallback logic, especially important in serverless or highly distributed environments [source](./.skilld/issues/issue-2112.md:L31:33)
<!-- /skilld:best-practices -->
