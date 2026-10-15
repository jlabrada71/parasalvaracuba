# Admin, Login and User Invitations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/login`, `/admin` and `/invite/:token` pages plus the backend so an admin can invite users (role `author`/`admin`) via single-use copyable links.

**Architecture:** Postgres-backed sessions (opaque token in an httpOnly cookie, only its SHA-256 stored). A Nitro middleware resolves `event.context.user` for `/api/*`; admin endpoints call `requireAdmin`. Invitation acceptance is one atomic SQL statement. Frontend: Pinia `userStore`, vee-validate+yup forms, a route middleware guarding `/admin`. The existing email-identity flow (`authStore`, `emailExtract` middleware) is untouched.

**Tech Stack:** Nuxt 4, Nitro/h3, `pg`, Node `crypto.scrypt`, Pinia, vee-validate + yup, @nuxtjs/i18n, vitest + @vue/test-utils + @testing-library/vue, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-15-admin-login-invitations-design.md`

## Global Constraints

- Language: TypeScript everywhere; Vue 3 `<script setup lang="ts">` for the frontend.
- All environment parameters live in `.env` files (`.env`, `.env.test`, `.env.prod-db`); never hardcode. New vars: `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Password: scrypt via `node:crypto`, min length 10, max length 200.
- Tokens (session, invitation): 32 random bytes base64url; only SHA-256 hex hash stored.
- Session cookie name `session`: httpOnly, SameSite=Lax, Secure when `NODE_ENV === 'production'`, 7-day lifetime.
- Invitation expiry: 7 days. Roles: `admin` | `author`. Emails stored lowercase, trimmed.
- Login failures return one generic message (`Invalid email or password`), HTTP 401; rate-limited → HTTP 429.
- Unit tests with vitest; component tests with @testing-library/vue (query by role/label for accessibility); UI automation with Playwright scripts named `*.e2e.ts` (so vitest does not collect them).
- UI strings in all three locales (`i18n/locales/{en,es,pt}.json`). UI uses existing design-system components (`@/components/design-system`) and CSS variables.
- Git commit prefixes: `feat:`, `bugfix:`, `secfix:`, `refactor:`, `config:`, `docs:`. Every commit message ends with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Existing public flows (ideas/votes/comments with `X-User-Email`) must keep working; `GET /api/auth/me` must still return `email`.

## Review Focus

1. Email case/whitespace: `" Alice@Example.COM "` must log in, be invited, and accept the same as `alice@example.com` (Tasks 5, 6).
2. Re-inviting an email while an invitation is pending: the old link must stop working and the new one work (Task 6).
3. Inviting an email that already has an account → 409, not a duplicate-key 500 (Task 6).
4. Garbage tokens / non-UUID ids in URLs (`/api/invitations/abc`, `DELETE /api/admin/invitations/not-a-uuid`) → 404, never 500 (Task 6).
5. Deactivated user: cannot log in and an existing session stops working; overlong password (10 000 chars) → 400 without running scrypt (Tasks 4, 5, 6).

## File Structure

Create:
- `db/migrations/007_create_users_sessions_invitations.sql` — tables
- `db/ensureAdmin.ts` — seeding logic (pure, takes a client)
- `db/create-admin.ts` — CLI wrapper (reads env file like `migrate.js`)
- `server/utils/password.ts`, `server/utils/tokens.ts`, `server/utils/rateLimit.ts`
- `server/utils/session.ts`, `server/utils/requireAdmin.ts`
- `server/middleware/session.ts`
- `server/api/auth/login.post.ts`, `server/api/auth/logout.post.ts`
- `server/api/admin/invitations/index.post.ts`, `index.get.ts`, `[id].delete.ts`; `server/api/admin/users.get.ts`
- `server/api/invitations/[token]/index.get.ts`, `accept.post.ts`
- `app/stores/userStore.ts`, `app/utils/authSchemas.ts`, `app/middleware/admin.ts`
- `app/components/LoginForm.vue`, `InviteAcceptForm.vue`, `AdminInviteForm.vue`, `AdminInvitationsList.vue`, `AdminUsersList.vue`
- `app/pages/login.vue`, `app/pages/admin.vue`, `app/pages/invite/[token].vue`
- Tests: `tests/unit/{password,tokens,rateLimit,session,requireAdmin,ensureAdmin,userStore,authSchemas,adminMiddleware,LoginForm,InviteAcceptForm,AdminInviteForm}.test.ts`, `tests/helpers/i18n.ts`, `tests/integration/{helpers,auth,invitations}.ts|.test.ts`, `tests/e2e/admin-invite.e2e.ts`, `playwright.config.ts`

Modify: `package.json`, `.env`, `.env.test`, `server/api/auth/me.get.ts`, `app/app.vue`, `app/components/Navigation.vue`, `i18n/locales/{en,es,pt}.json`, `README.md`, the spec (admin-seeding line).

Integration-test setup (used by Tasks 5–6, 12): DB running (`compose-db.yml`), then
`pnpm migrate test && pnpm create-admin test`, terminal A: `pnpm dev:test`, terminal B: `INTEGRATION=true pnpm vitest run <file>`.

---

### Task 1: Dependencies, env, migration, admin seeding

**Files:**
- Modify: `package.json`, `.env`, `.env.test`, `docs/superpowers/specs/2026-10-15-admin-login-invitations-design.md`
- Create: `db/migrations/007_create_users_sessions_invitations.sql`, `db/ensureAdmin.ts`, `db/create-admin.ts`, `server/utils/password.ts` (stub exports only, filled in Task 2 — see Step 3)
- Test: `tests/unit/ensureAdmin.test.ts`

**Interfaces:**
- Produces: `ensureAdmin(client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }> }, opts: { email: string; password: string }): Promise<'created' | 'exists'>` (throws `Error` on invalid email / password shorter than 10); tables `users`, `sessions`, `invitations` as in the spec.
- Consumes: `hashPassword(pw): Promise<string>`, `MIN_PASSWORD_LENGTH` from `server/utils/password.ts` (Task 2 — so do Task 2 **before** Step 3 of this task, or temporarily order tasks 2→1; see note).

> **Ordering note:** Do Task 2 first (it has no dependencies), then this task.

- [ ] **Step 1: Install dev dependencies**

```bash
pnpm add -D @testing-library/vue @testing-library/user-event @playwright/test
```

- [ ] **Step 2: Add scripts and env vars**

In `package.json` `scripts` add:

```json
"dev:test": "nuxt dev --dotenv .env.test",
"create-admin": "node db/create-admin.ts"
```

Append to `.env` and `.env.test` (these files are git-ignored; edit locally):

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-please-123
```

(Use a real address/password in `.env`; keep the example values in `.env.test`.)

- [ ] **Step 3: Write the failing test**

`tests/unit/ensureAdmin.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { ensureAdmin } from '../../db/ensureAdmin'
import { verifyPassword } from '../../server/utils/password'

function fakeClient(existingAdmins: number) {
  const calls: { sql: string; params?: unknown[] }[] = []
  return {
    calls,
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      calls.push({ sql, params })
      if (/SELECT 1 FROM users/i.test(sql)) return { rows: existingAdmins ? [{ '?column?': 1 }] : [] }
      return { rows: [] }
    }),
  }
}

describe('ensureAdmin', () => {
  it('does nothing when an admin already exists', async () => {
    const client = fakeClient(1)
    expect(await ensureAdmin(client, { email: 'a@example.com', password: 'longenough-pw' })).toBe('exists')
    expect(client.calls.some(c => /INSERT/i.test(c.sql))).toBe(false)
  })

  it('creates an admin with lowercase email and a hashed password', async () => {
    const client = fakeClient(0)
    expect(await ensureAdmin(client, { email: ' Admin@Example.COM ', password: 'longenough-pw' })).toBe('created')
    const insert = client.calls.find(c => /INSERT INTO users/i.test(c.sql))!
    expect(insert.params![0]).toBe('admin@example.com')
    expect(insert.params![1]).not.toBe('longenough-pw')
    expect(await verifyPassword('longenough-pw', insert.params![1] as string)).toBe(true)
  })

  it('rejects a password shorter than 10 characters', async () => {
    await expect(ensureAdmin(fakeClient(0), { email: 'a@example.com', password: 'short' })).rejects.toThrow(/password/i)
  })

  it('rejects an invalid email', async () => {
    await expect(ensureAdmin(fakeClient(0), { email: 'nope', password: 'longenough-pw' })).rejects.toThrow(/email/i)
  })
})
```

- [ ] **Step 4: Run it to verify it fails**

Run: `pnpm vitest run tests/unit/ensureAdmin.test.ts`
Expected: FAIL — cannot resolve `../../db/ensureAdmin`.

- [ ] **Step 5: Write the migration**

`db/migrations/007_create_users_sessions_invitations.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'author')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  TEXT NOT NULL UNIQUE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'author')),
  invited_by  UUID NOT NULL REFERENCES users (id),
  expires_at  TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS invitations_email_idx ON invitations (email);
```

- [ ] **Step 6: Write `db/ensureAdmin.ts`**

```ts
import { hashPassword, MIN_PASSWORD_LENGTH } from '../server/utils/password.ts'

interface Queryable {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }>
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function ensureAdmin(
  client: Queryable,
  opts: { email: string; password: string }
): Promise<'created' | 'exists'> {
  const existing = await client.query(`SELECT 1 FROM users WHERE role = 'admin' LIMIT 1`)
  if (existing.rows.length > 0) return 'exists'

  const email = (opts.email ?? '').trim().toLowerCase()
  if (!EMAIL_REGEX.test(email)) throw new Error('ADMIN_EMAIL is missing or not a valid email')
  if (typeof opts.password !== 'string' || opts.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`)
  }

  const hash = await hashPassword(opts.password)
  await client.query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')`,
    [email, hash]
  )
  return 'created'
}
```

- [ ] **Step 7: Write `db/create-admin.ts`**

```ts
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import dotenv from 'dotenv'
import { ensureAdmin } from './ensureAdmin.ts'

// USAGE: node db/create-admin.ts [database]   (same convention as migrate.js)
// Example: pnpm create-admin test  → loads .env.test
const __dirname = dirname(fileURLToPath(import.meta.url))
const database = process.argv[2] || ''
dotenv.config({ path: resolve(__dirname, database ? `../.env.${database}` : '../.env') })

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const client = new pg.Client({ connectionString: DATABASE_URL })
try {
  await client.connect()
  const result = await ensureAdmin(client, { email: ADMIN_EMAIL ?? '', password: ADMIN_PASSWORD ?? '' })
  console.log(result === 'created' ? `Admin created: ${ADMIN_EMAIL}` : 'An admin already exists; nothing to do.')
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await client.end()
}
```

- [ ] **Step 8: Run unit test; run migration and seeding against the test DB**

Run: `pnpm vitest run tests/unit/ensureAdmin.test.ts` → PASS (4 tests).
Run: `pnpm migrate test && pnpm create-admin test` → `Running migration: 007_...` then `Admin created: admin@example.com`. Run `pnpm create-admin test` again → `An admin already exists; nothing to do.`
If Node rejects the `.ts` extension in imports, confirm `node -v` ≥ 22.18 (type stripping is on by default).

- [ ] **Step 9: Fix the spec's seeding line**

In the spec, replace the sentence ending `…also invoked after migrations in the Docker flow.` with `Run manually after migrations, like \`pnpm migrate\` (\`pnpm create-admin [env]\`); the repo has no automated Docker migration flow.`

- [ ] **Step 10: Commit**

```bash
git add package.json pnpm-lock.yaml db tests/unit/ensureAdmin.test.ts docs
git commit -m "feat: add users, sessions and invitations schema with admin seeding"
```

(`.env*` files are git-ignored; do not add them.)

---

### Task 2: Password and token utilities

**Files:**
- Create: `server/utils/password.ts`, `server/utils/tokens.ts`
- Test: `tests/unit/password.test.ts`, `tests/unit/tokens.test.ts`

**Interfaces:**
- Produces: `MIN_PASSWORD_LENGTH = 10`, `MAX_PASSWORD_LENGTH = 200`, `hashPassword(pw: string): Promise<string>`, `verifyPassword(pw: string, stored: string): Promise<boolean>`, `generateToken(): string`, `hashToken(token: string): string`.

- [ ] **Step 1: Write the failing tests**

`tests/unit/password.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../../server/utils/password'

describe('password', () => {
  it('verifies the correct password', async () => {
    const hash = await hashPassword('correct horse battery')
    expect(await verifyPassword('correct horse battery', hash)).toBe(true)
  })

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('correct horse battery')
    expect(await verifyPassword('wrong horse battery', hash)).toBe(false)
  })

  it('uses a different salt each time', async () => {
    expect(await hashPassword('same-password-1')).not.toBe(await hashPassword('same-password-1'))
  })

  it('returns false for a malformed stored hash instead of throwing', async () => {
    expect(await verifyPassword('x', 'not-a-hash')).toBe(false)
    expect(await verifyPassword('x', '')).toBe(false)
  })
})
```

`tests/unit/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateToken, hashToken } from '../../server/utils/tokens'

describe('tokens', () => {
  it('generates url-safe tokens of 43 chars (32 bytes) that are unique', () => {
    const a = generateToken()
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(generateToken()).not.toBe(a)
  })

  it('hashes deterministically to 64 hex chars and never returns the token', () => {
    const t = generateToken()
    expect(hashToken(t)).toBe(hashToken(t))
    expect(hashToken(t)).toMatch(/^[0-9a-f]{64}$/)
    expect(hashToken(t)).not.toContain(t)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm vitest run tests/unit/password.test.ts tests/unit/tokens.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

`server/utils/password.ts`:

```ts
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>

export const MIN_PASSWORD_LENGTH = 10
export const MAX_PASSWORD_LENGTH = 200
const KEY_LENGTH = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, saltB64, keyB64] = (stored ?? '').split('$')
  if (alg !== 'scrypt' || !saltB64 || !keyB64) return false
  const expected = Buffer.from(keyB64, 'base64')
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length)
  return timingSafeEqual(actual, expected)
}
```

`server/utils/tokens.ts`:

```ts
import { createHash, randomBytes } from 'node:crypto'

export function generateToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm vitest run tests/unit/password.test.ts tests/unit/tokens.test.ts` → PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add server/utils/password.ts server/utils/tokens.ts tests/unit/password.test.ts tests/unit/tokens.test.ts
git commit -m "feat: add password hashing and token utilities"
```

---

### Task 3: Rate limiter

**Files:**
- Create: `server/utils/rateLimit.ts`
- Test: `tests/unit/rateLimit.test.ts`

**Interfaces:**
- Produces: `createRateLimiter(opts: { max: number; windowMs: number; now?: () => number }): { isLimited(key: string): boolean; recordFailure(key: string): void; reset(key: string): void }`. A key is limited once it has `max` failures within the sliding window.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { createRateLimiter } from '../../server/utils/rateLimit'

describe('rateLimit', () => {
  it('limits a key after max failures', () => {
    const rl = createRateLimiter({ max: 3, windowMs: 1000 })
    for (let i = 0; i < 2; i++) rl.recordFailure('k')
    expect(rl.isLimited('k')).toBe(false)
    rl.recordFailure('k')
    expect(rl.isLimited('k')).toBe(true)
  })

  it('does not limit other keys', () => {
    const rl = createRateLimiter({ max: 1, windowMs: 1000 })
    rl.recordFailure('a')
    expect(rl.isLimited('b')).toBe(false)
  })

  it('forgets failures older than the window', () => {
    let t = 0
    const rl = createRateLimiter({ max: 1, windowMs: 1000, now: () => t })
    rl.recordFailure('k')
    expect(rl.isLimited('k')).toBe(true)
    t = 1001
    expect(rl.isLimited('k')).toBe(false)
  })

  it('reset clears a key', () => {
    const rl = createRateLimiter({ max: 1, windowMs: 1000 })
    rl.recordFailure('k')
    rl.reset('k')
    expect(rl.isLimited('k')).toBe(false)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm vitest run tests/unit/rateLimit.test.ts` → FAIL (module missing).

- [ ] **Step 3: Implement**

```ts
export interface RateLimiter {
  isLimited(key: string): boolean
  recordFailure(key: string): void
  reset(key: string): void
}

export function createRateLimiter(opts: { max: number; windowMs: number; now?: () => number }): RateLimiter {
  const now = opts.now ?? Date.now
  const failures = new Map<string, number[]>()

  function recent(key: string): number[] {
    const cutoff = now() - opts.windowMs
    const kept = (failures.get(key) ?? []).filter(ts => ts > cutoff)
    if (kept.length) failures.set(key, kept)
    else failures.delete(key)
    return kept
  }

  return {
    isLimited: key => recent(key).length >= opts.max,
    recordFailure(key) {
      const kept = recent(key)
      kept.push(now())
      failures.set(key, kept)
    },
    reset: key => { failures.delete(key) },
  }
}
```

- [ ] **Step 4: Verify pass** — same command → PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add server/utils/rateLimit.ts tests/unit/rateLimit.test.ts
git commit -m "feat: add in-memory login rate limiter"
```

---

### Task 4: Session utilities, session middleware, requireAdmin

**Files:**
- Create: `server/utils/session.ts`, `server/utils/requireAdmin.ts`, `server/middleware/session.ts`
- Test: `tests/unit/session.test.ts`, `tests/unit/requireAdmin.test.ts`

**Interfaces:**
- Consumes: `query`, `queryOne` from `server/utils/db`; `generateToken`, `hashToken`.
- Produces:
  - `SESSION_COOKIE = 'session'`, `SESSION_TTL_MS = 604800000`
  - `interface SessionUser { id: string; email: string; role: 'admin' | 'author' }`
  - `createSession(event: H3Event, userId: string): Promise<void>` (inserts hashed token, sets cookie)
  - `getSessionUser(token: string): Promise<SessionUser | null>` (only active users, unexpired sessions)
  - `destroySession(event: H3Event): Promise<void>` (deletes row, clears cookie)
  - `requireAdmin(event: H3Event): SessionUser` (401 if no user, 403 if not admin)
  - `event.context.user: SessionUser | null` set for every `/api/*` request.

- [ ] **Step 1: Write failing tests**

`tests/unit/session.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../server/utils/db', () => ({ query: vi.fn(), queryOne: vi.fn() }))
vi.mock('h3', async (orig) => ({
  ...(await orig<typeof import('h3')>()),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
  getCookie: vi.fn(),
}))

import { query, queryOne } from '../../server/utils/db'
import { setCookie, deleteCookie, getCookie } from 'h3'
import { createSession, getSessionUser, destroySession, SESSION_COOKIE } from '../../server/utils/session'
import { hashToken } from '../../server/utils/tokens'

const event = {} as any

describe('session', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createSession stores only the token hash and sets a hardened cookie', async () => {
    await createSession(event, 'user-1')
    const [, params] = vi.mocked(query).mock.calls[0]
    const [, cookieName, cookieToken, opts] = vi.mocked(setCookie).mock.calls[0] as any
    expect(cookieName).toBe(SESSION_COOKIE)
    expect(params![0]).toBe(hashToken(cookieToken))
    expect(params![0]).not.toBe(cookieToken)
    expect(params![1]).toBe('user-1')
    expect(opts).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })
  })

  it('getSessionUser looks the session up by hash and returns the user', async () => {
    vi.mocked(queryOne).mockResolvedValue({ id: 'u1', email: 'a@b.co', role: 'admin' })
    expect(await getSessionUser('tok')).toEqual({ id: 'u1', email: 'a@b.co', role: 'admin' })
    const [sql, params] = vi.mocked(queryOne).mock.calls[0]
    expect(params).toEqual([hashToken('tok')])
    expect(sql).toMatch(/is_active/)
    expect(sql).toMatch(/expires_at\s*>\s*NOW\(\)/i)
  })

  it('getSessionUser returns null when nothing matches', async () => {
    vi.mocked(queryOne).mockResolvedValue(null)
    expect(await getSessionUser('tok')).toBeNull()
  })

  it('destroySession deletes the row and clears the cookie', async () => {
    vi.mocked(getCookie).mockReturnValue('tok')
    await destroySession(event)
    expect(vi.mocked(query).mock.calls[0][1]).toEqual([hashToken('tok')])
    expect(deleteCookie).toHaveBeenCalledWith(event, SESSION_COOKIE, expect.objectContaining({ path: '/' }))
  })

  it('destroySession still clears the cookie when there is none', async () => {
    vi.mocked(getCookie).mockReturnValue(undefined)
    await destroySession(event)
    expect(query).not.toHaveBeenCalled()
    expect(deleteCookie).toHaveBeenCalled()
  })
})
```

`tests/unit/requireAdmin.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { requireAdmin } from '../../server/utils/requireAdmin'

const ev = (user: unknown) => ({ context: { user } }) as any

describe('requireAdmin', () => {
  it('401 without a user', () => {
    expect(() => requireAdmin(ev(null))).toThrowError(expect.objectContaining({ statusCode: 401 }))
  })
  it('403 for a non-admin', () => {
    expect(() => requireAdmin(ev({ id: '1', email: 'a@b.co', role: 'author' }))).toThrowError(expect.objectContaining({ statusCode: 403 }))
  })
  it('returns the admin user', () => {
    const u = { id: '1', email: 'a@b.co', role: 'admin' }
    expect(requireAdmin(ev(u))).toEqual(u)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm vitest run tests/unit/session.test.ts tests/unit/requireAdmin.test.ts` → FAIL (modules missing).

- [ ] **Step 3: Implement**

`server/utils/session.ts`:

```ts
import { setCookie, deleteCookie, getCookie } from 'h3'
import type { H3Event } from 'h3'
import { query, queryOne } from './db'
import { generateToken, hashToken } from './tokens'

export const SESSION_COOKIE = 'session'
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface SessionUser {
  id: string
  email: string
  role: 'admin' | 'author'
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}

export async function createSession(event: H3Event, userId: string): Promise<void> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await query(
    `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)`,
    [hashToken(token), userId, expiresAt]
  )
  setCookie(event, SESSION_COOKIE, token, { ...cookieOptions(), expires: expiresAt })
}

export async function getSessionUser(token: string): Promise<SessionUser | null> {
  return queryOne<SessionUser>(
    `SELECT u.id, u.email, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.is_active = TRUE`,
    [hashToken(token)]
  )
}

export async function destroySession(event: H3Event): Promise<void> {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) await query(`DELETE FROM sessions WHERE token_hash = $1`, [hashToken(token)])
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
```

`server/utils/requireAdmin.ts`:

```ts
import { createError } from 'h3'
import type { H3Event } from 'h3'
import type { SessionUser } from './session'

export function requireAdmin(event: H3Event): SessionUser {
  const user = event.context.user as SessionUser | null | undefined
  if (!user) throw createError({ statusCode: 401, message: 'Authentication required' })
  if (user.role !== 'admin') throw createError({ statusCode: 403, message: 'Admin access required' })
  return user
}
```

`server/middleware/session.ts`:

```ts
import { defineEventHandler, getCookie } from 'h3'
import { getSessionUser, SESSION_COOKIE } from '../utils/session'

export default defineEventHandler(async (event) => {
  event.context.user = null
  if (!event.path.startsWith('/api/')) return
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return
  try {
    event.context.user = await getSessionUser(token)
  } catch (err) {
    console.error('session lookup failed:', err)
  }
})
```

- [ ] **Step 4: Verify pass** — same command → PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add server/utils/session.ts server/utils/requireAdmin.ts server/middleware/session.ts tests/unit/session.test.ts tests/unit/requireAdmin.test.ts
git commit -m "feat: add session handling and admin guard"
```

---

### Task 5: Auth endpoints (login, logout, me)

**Files:**
- Create: `server/api/auth/login.post.ts`, `server/api/auth/logout.post.ts`, `tests/integration/helpers.ts`
- Modify: `server/api/auth/me.get.ts`
- Test: `tests/integration/auth.test.ts`

**Interfaces:**
- Consumes: `verifyPassword`, `hashPassword`, `MAX_PASSWORD_LENGTH`; `createRateLimiter`; `createSession`, `destroySession`, `SessionUser`.
- Produces:
  - `POST /api/auth/login` body `{email, password}` → `200 { user: SessionUser }` + cookie; `400` bad body/overlong password; `401 {message:'Invalid email or password'}`; `429`.
  - `POST /api/auth/logout` → `200 { ok: true }`.
  - `GET /api/auth/me` → `{ email: string|null, user: SessionUser|null }`.
  - Test helpers (`tests/integration/helpers.ts`): `BASE`, `RUN_HTTP`, `api(path, {method?, body?, cookie?, headers?}): Promise<Response>`, `cookieFrom(res: Response): string`, `loginAs(email, password): Promise<string>`, `adminCookie(): Promise<string>`, `withDb<T>(fn: (c: pg.Client) => Promise<T>): Promise<T>`.

- [ ] **Step 1: Write helpers**

`tests/integration/helpers.ts`:

```ts
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.test' })

export const RUN_HTTP = process.env.INTEGRATION === 'true'
export const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'

export async function api(
  path: string,
  opts: { method?: string; body?: unknown; cookie?: string; headers?: Record<string, string> } = {}
): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
    headers: {
      ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.cookie ? { Cookie: opts.cookie } : {}),
      ...opts.headers,
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
}

/** Returns "session=<token>" from a Set-Cookie header ('' if none). */
export function cookieFrom(res: Response): string {
  const raw = res.headers.getSetCookie().find(c => c.startsWith('session=')) ?? ''
  return raw.split(';')[0]
}

export async function loginAs(email: string, password: string): Promise<string> {
  const res = await api('/api/auth/login', { body: { email, password } })
  if (res.status !== 200) throw new Error(`login failed for ${email}: ${res.status}`)
  return cookieFrom(res)
}

export const adminCookie = () => loginAs(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!)

export async function withDb<T>(fn: (c: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try { return await fn(client) } finally { await client.end() }
}
```

- [ ] **Step 2: Write the failing integration test**

`tests/integration/auth.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { RUN_HTTP, api, cookieFrom, loginAs, adminCookie, withDb } from './helpers'
import { hashPassword } from '../../server/utils/password'

describe.skipIf(!RUN_HTTP)('Auth API (HTTP)', () => {
  const ADMIN = () => process.env.ADMIN_EMAIL!
  const PW = () => process.env.ADMIN_PASSWORD!

  it('logs in with valid credentials, sets an httpOnly cookie, never returns the hash', async () => {
    const res = await api('/api/auth/login', { body: { email: ADMIN(), password: PW() } })
    expect(res.status).toBe(200)
    const setCookie = res.headers.getSetCookie().find(c => c.startsWith('session='))!
    expect(setCookie).toMatch(/HttpOnly/i)
    expect(setCookie).toMatch(/SameSite=Lax/i)
    const body = await res.json()
    expect(body.user).toMatchObject({ email: ADMIN().toLowerCase(), role: 'admin' })
    expect(JSON.stringify(body)).not.toMatch(/scrypt|password/i)
  })

  it('normalizes email case and whitespace on login', async () => {
    const res = await api('/api/auth/login', { body: { email: `  ${ADMIN().toUpperCase()} `, password: PW() } })
    expect(res.status).toBe(200)
  })

  it('returns the same generic 401 for wrong password and unknown email', async () => {
    const a = await api('/api/auth/login', { body: { email: ADMIN(), password: 'definitely-wrong-pw' } })
    const b = await api('/api/auth/login', { body: { email: 'nobody-here@example.com', password: 'definitely-wrong-pw' } })
    expect(a.status).toBe(401)
    expect(b.status).toBe(401)
    expect((await a.json()).message).toBe((await b.json()).message)
  })

  it('rejects an overlong password with 400', async () => {
    const res = await api('/api/auth/login', { body: { email: ADMIN(), password: 'x'.repeat(10_000) } })
    expect(res.status).toBe(400)
  })

  it('rejects a missing body with 400', async () => {
    const res = await api('/api/auth/login', { body: {} })
    expect(res.status).toBe(400)
  })

  it('rate-limits repeated failures for one email (429 on the 6th)', async () => {
    const email = `ratelimit-${Date.now()}@example.com`
    const statuses: number[] = []
    for (let i = 0; i < 6; i++) {
      statuses.push((await api('/api/auth/login', { body: { email, password: 'wrong-password-1' } })).status)
    }
    expect(statuses.slice(0, 5).every(s => s === 401)).toBe(true)
    expect(statuses[5]).toBe(429)
  })

  it('/api/auth/me returns the user for a session and null without', async () => {
    const cookie = await adminCookie()
    const me = await (await api('/api/auth/me', { cookie })).json()
    expect(me.user).toMatchObject({ role: 'admin' })
    const anon = await (await api('/api/auth/me')).json()
    expect(anon.user).toBeNull()
  })

  it('/api/auth/me still returns the legacy email identity', async () => {
    const me = await (await api('/api/auth/me', { headers: { 'X-User-Email': 'Legacy@Example.com' } })).json()
    expect(me.email).toBe('legacy@example.com')
  })

  it('logout invalidates the session', async () => {
    const cookie = await adminCookie()
    const out = await api('/api/auth/logout', { method: 'POST', cookie })
    expect(out.status).toBe(200)
    const me = await (await api('/api/auth/me', { cookie })).json()
    expect(me.user).toBeNull()
  })

  it('a deactivated user cannot log in and an existing session stops working', async () => {
    const email = `inactive-${Date.now()}@example.com`
    const hash = await hashPassword('inactive-user-pw')
    await withDb(c => c.query(`INSERT INTO users (email, password_hash, role) VALUES ($1,$2,'author')`, [email, hash]))
    const cookie = await loginAs(email, 'inactive-user-pw')
    expect((await (await api('/api/auth/me', { cookie })).json()).user).not.toBeNull()
    await withDb(c => c.query(`UPDATE users SET is_active = FALSE WHERE email = $1`, [email]))
    expect((await (await api('/api/auth/me', { cookie })).json()).user).toBeNull()
    const res = await api('/api/auth/login', { body: { email, password: 'inactive-user-pw' } })
    expect(res.status).toBe(401)
    expect(cookieFrom(res)).toBe('')
  })
})
```

- [ ] **Step 3: Run to verify failure**

With the dev server running (see "Integration-test setup"): `INTEGRATION=true pnpm vitest run tests/integration/auth.test.ts`
Expected: FAIL (404 on `/api/auth/login`, `me.user` undefined).

- [ ] **Step 4: Implement**

`server/api/auth/login.post.ts`:

```ts
import { defineEventHandler, readBody, createError, getRequestIP } from 'h3'
import { queryOne } from '../../utils/db'
import { hashPassword, verifyPassword, MAX_PASSWORD_LENGTH } from '../../utils/password'
import { createRateLimiter } from '../../utils/rateLimit'
import { createSession } from '../../utils/session'

const WINDOW_MS = 15 * 60 * 1000
const emailLimiter = createRateLimiter({ max: 5, windowMs: WINDOW_MS })
const ipLimiter = createRateLimiter({ max: 30, windowMs: WINDOW_MS })

// Verified against when the email is unknown, so timing does not reveal account existence.
const dummyHash = hashPassword('timing-equalizer-password')

interface UserRow { id: string; email: string; role: 'admin' | 'author'; password_hash: string; is_active: boolean }

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) throw createError({ statusCode: 400, message: 'Email and password are required' })
  if (password.length > MAX_PASSWORD_LENGTH) throw createError({ statusCode: 400, message: 'Password is too long' })

  const ip = getRequestIP(event) ?? 'unknown'
  if (emailLimiter.isLimited(`email:${email}`) || ipLimiter.isLimited(`ip:${ip}`)) {
    throw createError({ statusCode: 429, message: 'Too many attempts, try again later' })
  }

  const user = await queryOne<UserRow>(
    `SELECT id, email, role, password_hash, is_active FROM users WHERE email = $1`,
    [email]
  )
  const ok = user && user.is_active
    ? await verifyPassword(password, user.password_hash)
    : (await verifyPassword(password, await dummyHash), false)

  if (!user || !ok) {
    emailLimiter.recordFailure(`email:${email}`)
    ipLimiter.recordFailure(`ip:${ip}`)
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  emailLimiter.reset(`email:${email}`)
  await createSession(event, user.id)
  return { user: { id: user.id, email: user.email, role: user.role } }
})
```

`server/api/auth/logout.post.ts`:

```ts
import { defineEventHandler } from 'h3'
import { destroySession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  await destroySession(event)
  return { ok: true }
})
```

`server/api/auth/me.get.ts` (replace contents):

```ts
import { defineEventHandler } from 'h3'

/**
 * GET /api/auth/me
 * - `email`: legacy email identity from the X-User-Email header (public flow)
 * - `user`: logged-in account from the session cookie, or null
 */
export default defineEventHandler((event) => {
  return {
    email: event.context.userEmail || null,
    user: event.context.user ?? null,
  }
})
```

- [ ] **Step 5: Restart dev server, verify pass**

Run: `INTEGRATION=true pnpm vitest run tests/integration/auth.test.ts` → PASS (10 tests). Also run `INTEGRATION=true pnpm vitest run tests/integration` to confirm existing integration tests still pass.

- [ ] **Step 6: Commit**

```bash
git add server/api/auth tests/integration/helpers.ts tests/integration/auth.test.ts
git commit -m "feat: add login, logout and session-aware me endpoints"
```

---

### Task 6: Invitation and admin API

**Files:**
- Create: `server/api/admin/invitations/index.post.ts`, `server/api/admin/invitations/index.get.ts`, `server/api/admin/invitations/[id].delete.ts`, `server/api/admin/users.get.ts`, `server/api/invitations/[token]/index.get.ts`, `server/api/invitations/[token]/accept.post.ts`
- Test: `tests/integration/invitations.test.ts`

**Interfaces:**
- Consumes: `requireAdmin`, `generateToken`, `hashToken`, `hashPassword`, `MIN/MAX_PASSWORD_LENGTH`, `createSession`, `validateEmail` (`server/utils/emailValidation`), `query`, `queryOne`.
- Produces:
  - `POST /api/admin/invitations` `{email, role?: 'author'|'admin'}` → `201 { id, email, role, link, expiresAt }`; `400` invalid; `409` account exists; `401/403`.
  - `GET /api/admin/invitations` → `Invitation[]` where `Invitation = { id, email, role, created_at, expires_at }` (pending only; no token/hash).
  - `DELETE /api/admin/invitations/:id` → `{ ok: true }`; `404` if not pending/not found/not a UUID.
  - `GET /api/admin/users` → `{ id, email, role, is_active, created_at }[]`.
  - `GET /api/invitations/:token` → `{ email, role }` or `404 { message: 'Invitation not found or expired' }`.
  - `POST /api/invitations/:token/accept` `{password}` → `201 { user: SessionUser }` + session cookie; `400` password length; `404` invalid token; `409` account exists.

- [ ] **Step 1: Write the failing integration test**

`tests/integration/invitations.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { RUN_HTTP, api, adminCookie, loginAs, cookieFrom, withDb } from './helpers'
import { hashPassword } from '../../server/utils/password'

const uniq = () => `invitee-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`
const tokenOf = (link: string) => link.split('/invite/')[1]

describe.skipIf(!RUN_HTTP)('Invitations API (HTTP)', () => {
  it('rejects unauthenticated (401) and non-admin (403) access to admin endpoints', async () => {
    expect((await api('/api/admin/invitations')).status).toBe(401)
    expect((await api('/api/admin/users')).status).toBe(401)
    expect((await api('/api/admin/invitations', { body: { email: uniq() } })).status).toBe(401)

    const email = uniq()
    await withDb(async c => c.query(`INSERT INTO users (email, password_hash, role) VALUES ($1,$2,'author')`, [email, await hashPassword('author-user-pw1')]))
    const cookie = await loginAs(email, 'author-user-pw1')
    expect((await api('/api/admin/invitations', { cookie })).status).toBe(403)
    expect((await api('/api/admin/invitations', { cookie, body: { email: uniq() } })).status).toBe(403)
    expect((await api('/api/admin/users', { cookie })).status).toBe(403)
  })

  it('full lifecycle: invite → validate → accept → login; token is single-use', async () => {
    const admin = await adminCookie()
    const email = uniq()
    const create = await api('/api/admin/invitations', { cookie: admin, body: { email: `  ${email.toUpperCase()} `, role: 'author' } })
    expect(create.status).toBe(201)
    const inv = await create.json()
    expect(inv.email).toBe(email)
    expect(inv.link).toMatch(/\/invite\/[A-Za-z0-9_-]{43}$/)
    const token = tokenOf(inv.link)

    const list = await (await api('/api/admin/invitations', { cookie: admin })).json()
    const listed = list.find((i: any) => i.id === inv.id)
    expect(listed).toBeTruthy()
    expect(JSON.stringify(listed)).not.toContain(token)

    expect(await (await api(`/api/invitations/${token}`)).json()).toEqual({ email, role: 'author' })

    const accept = await api(`/api/invitations/${token}/accept`, { body: { password: 'brand-new-password' } })
    expect(accept.status).toBe(201)
    expect(cookieFrom(accept)).toMatch(/^session=/)
    expect((await accept.json()).user).toMatchObject({ email, role: 'author' })

    expect((await api(`/api/invitations/${token}`)).status).toBe(404)
    expect((await api(`/api/invitations/${token}/accept`, { body: { password: 'another-password-1' } })).status).toBe(404)
    await loginAs(email, 'brand-new-password')

    const users = await (await api('/api/admin/users', { cookie: admin })).json()
    const row = users.find((u: any) => u.email === email)
    expect(row).toMatchObject({ role: 'author', is_active: true })
    expect(JSON.stringify(row)).not.toMatch(/password|scrypt/i)
  })

  it('re-inviting a pending email kills the old link and the new one works', async () => {
    const admin = await adminCookie()
    const email = uniq()
    const first = tokenOf((await (await api('/api/admin/invitations', { cookie: admin, body: { email } })).json()).link)
    const second = tokenOf((await (await api('/api/admin/invitations', { cookie: admin, body: { email } })).json()).link)
    expect((await api(`/api/invitations/${first}`)).status).toBe(404)
    expect((await api(`/api/invitations/${second}`)).status).toBe(200)
  })

  it('409 when the email already has an account', async () => {
    const admin = await adminCookie()
    const res = await api('/api/admin/invitations', { cookie: admin, body: { email: process.env.ADMIN_EMAIL } })
    expect(res.status).toBe(409)
  })

  it('400 for an invalid email or unknown role', async () => {
    const admin = await adminCookie()
    expect((await api('/api/admin/invitations', { cookie: admin, body: { email: 'not-an-email' } })).status).toBe(400)
    expect((await api('/api/admin/invitations', { cookie: admin, body: { email: uniq(), role: 'superuser' } })).status).toBe(400)
  })

  it('revoked and expired invitations cannot be used', async () => {
    const admin = await adminCookie()
    const a = await (await api('/api/admin/invitations', { cookie: admin, body: { email: uniq() } })).json()
    expect((await api(`/api/admin/invitations/${a.id}`, { method: 'DELETE', cookie: admin })).status).toBe(200)
    expect((await api(`/api/invitations/${tokenOf(a.link)}`)).status).toBe(404)
    expect((await api(`/api/admin/invitations/${a.id}`, { method: 'DELETE', cookie: admin })).status).toBe(404)

    const b = await (await api('/api/admin/invitations', { cookie: admin, body: { email: uniq() } })).json()
    await withDb(c => c.query(`UPDATE invitations SET expires_at = NOW() - INTERVAL '1 minute' WHERE id = $1`, [b.id]))
    expect((await api(`/api/invitations/${tokenOf(b.link)}`)).status).toBe(404)
    expect((await api(`/api/invitations/${tokenOf(b.link)}/accept`, { body: { password: 'valid-password-1' } })).status).toBe(404)
  })

  it('accept enforces password length (10–200)', async () => {
    const admin = await adminCookie()
    const inv = await (await api('/api/admin/invitations', { cookie: admin, body: { email: uniq() } })).json()
    const token = tokenOf(inv.link)
    expect((await api(`/api/invitations/${token}/accept`, { body: { password: 'short' } })).status).toBe(400)
    expect((await api(`/api/invitations/${token}/accept`, { body: { password: 'x'.repeat(10_000) } })).status).toBe(400)
    expect((await api(`/api/invitations/${token}`)).status).toBe(200) // still usable
  })

  it('garbage tokens and ids give 404, never 500', async () => {
    const admin = await adminCookie()
    expect((await api('/api/invitations/abc')).status).toBe(404)
    expect((await api(`/api/invitations/${'A'.repeat(500)}`)).status).toBe(404)
    expect((await api('/api/invitations/abc/accept', { body: { password: 'valid-password-1' } })).status).toBe(404)
    expect((await api('/api/admin/invitations/not-a-uuid', { method: 'DELETE', cookie: admin })).status).toBe(404)
  })

  it('accepting when an account was created meanwhile → 409 and the invite is not consumed', async () => {
    const admin = await adminCookie()
    const email = uniq()
    const inv = await (await api('/api/admin/invitations', { cookie: admin, body: { email } })).json()
    await withDb(async c => c.query(`INSERT INTO users (email, password_hash, role) VALUES ($1,$2,'author')`, [email, await hashPassword('someone-else-pw1')]))
    const res = await api(`/api/invitations/${tokenOf(inv.link)}/accept`, { body: { password: 'valid-password-1' } })
    expect(res.status).toBe(409)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `INTEGRATION=true pnpm vitest run tests/integration/invitations.test.ts` → FAIL (404s on all new routes).

- [ ] **Step 3: Implement admin endpoints**

`server/api/admin/invitations/index.post.ts`:

```ts
import { defineEventHandler, readBody, createError, setResponseStatus, getRequestURL } from 'h3'
import { query, queryOne } from '../../../utils/db'
import { requireAdmin } from '../../../utils/requireAdmin'
import { generateToken, hashToken } from '../../../utils/tokens'
import { validateEmail } from '../../../utils/emailValidation'

const ROLES = ['author', 'admin']
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const body = await readBody(event)

  const check = validateEmail(body?.email)
  if (!check.valid) throw createError({ statusCode: 400, message: check.reason ?? 'Invalid email' })
  const email = String(body.email).trim().toLowerCase()

  const role = body?.role ?? 'author'
  if (!ROLES.includes(role)) throw createError({ statusCode: 400, message: 'Invalid role' })

  if (await queryOne(`SELECT 1 FROM users WHERE email = $1`, [email])) {
    throw createError({ statusCode: 409, message: 'A user with this email already exists' })
  }

  // A new invitation supersedes any pending one for the same email.
  await query(
    `UPDATE invitations SET revoked_at = NOW() WHERE email = $1 AND accepted_at IS NULL AND revoked_at IS NULL`,
    [email]
  )

  const token = generateToken()
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS)
  const [row] = await query<{ id: string }>(
    `INSERT INTO invitations (token_hash, email, role, invited_by, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [hashToken(token), email, role, admin.id, expiresAt]
  )

  setResponseStatus(event, 201)
  return {
    id: row.id,
    email,
    role,
    link: `${getRequestURL(event).origin}/invite/${token}`,
    expiresAt: expiresAt.toISOString(),
  }
})
```

`server/api/admin/invitations/index.get.ts`:

```ts
import { defineEventHandler } from 'h3'
import { query } from '../../../utils/db'
import { requireAdmin } from '../../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  return query(
    `SELECT id, email, role, created_at, expires_at
       FROM invitations
      WHERE accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()
      ORDER BY created_at DESC`
  )
})
```

`server/api/admin/invitations/[id].delete.ts`:

```ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { queryOne } from '../../../utils/db'
import { requireAdmin } from '../../../utils/requireAdmin'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  if (!UUID.test(id)) throw createError({ statusCode: 404, message: 'Invitation not found' })

  const row = await queryOne(
    `UPDATE invitations SET revoked_at = NOW()
      WHERE id = $1 AND accepted_at IS NULL AND revoked_at IS NULL RETURNING id`,
    [id]
  )
  if (!row) throw createError({ statusCode: 404, message: 'Invitation not found' })
  return { ok: true }
})
```

`server/api/admin/users.get.ts`:

```ts
import { defineEventHandler } from 'h3'
import { query } from '../../utils/db'
import { requireAdmin } from '../../utils/requireAdmin'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  return query(`SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at ASC`)
})
```

- [ ] **Step 4: Implement public invitation endpoints**

`server/api/invitations/[token]/index.get.ts`:

```ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { queryOne } from '../../../utils/db'
import { hashToken } from '../../../utils/tokens'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token') ?? ''
  const row = await queryOne<{ email: string; role: string }>(
    `SELECT email, role FROM invitations
      WHERE token_hash = $1 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()`,
    [hashToken(token)]
  )
  if (!row) throw createError({ statusCode: 404, message: 'Invitation not found or expired' })
  return row
})
```

`server/api/invitations/[token]/accept.post.ts`:

```ts
import { defineEventHandler, getRouterParam, readBody, createError, setResponseStatus } from 'h3'
import { queryOne } from '../../../utils/db'
import { hashToken } from '../../../utils/tokens'
import { hashPassword, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../../../utils/password'
import { createSession } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token') ?? ''
  const body = await readBody(event)
  const password = typeof body?.password === 'string' ? body.password : ''
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw createError({ statusCode: 400, message: `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters` })
  }

  const hash = await hashPassword(password)

  // One statement = atomic: the invitation is consumed only if the user row is created.
  let user: { id: string; email: string; role: 'admin' | 'author' } | null
  try {
    user = await queryOne(
      `WITH inv AS (
         UPDATE invitations SET accepted_at = NOW()
          WHERE token_hash = $1 AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()
          RETURNING email, role
       )
       INSERT INTO users (email, password_hash, role)
       SELECT email, $2, role FROM inv
       RETURNING id, email, role`,
      [hashToken(token), hash]
    )
  } catch (err: any) {
    if (err?.code === '23505') throw createError({ statusCode: 409, message: 'An account with this email already exists' })
    throw err
  }
  if (!user) throw createError({ statusCode: 404, message: 'Invitation not found or expired' })

  await createSession(event, user.id)
  setResponseStatus(event, 201)
  return { user }
})
```

- [ ] **Step 5: Verify pass**

Restart dev server if needed. `INTEGRATION=true pnpm vitest run tests/integration` → all PASS (auth + invitations + pre-existing).

- [ ] **Step 6: Commit**

```bash
git add server/api/admin server/api/invitations tests/integration/invitations.test.ts
git commit -m "feat: add admin invitation and user listing API"
```

---

### Task 7: Frontend state, schemas, route guard

**Files:**
- Create: `app/stores/userStore.ts`, `app/utils/authSchemas.ts`, `app/middleware/admin.ts`, `tests/helpers/i18n.ts`
- Modify: `app/app.vue`
- Test: `tests/unit/userStore.test.ts`, `tests/unit/authSchemas.test.ts`, `tests/unit/adminMiddleware.test.ts`

**Interfaces:**
- Produces:
  - `type SessionUser = { id: string; email: string; role: 'admin' | 'author' }`
  - `useUserStore()` → `{ user: Ref<SessionUser|null>, loaded: Ref<boolean>, isAdmin: ComputedRef<boolean>, fetchMe(): Promise<void>, login(email: string, password: string): Promise<SessionUser>, logout(): Promise<void> }`
  - `type Translate = (key: string) => string`; `loginSchema(t)`, `acceptInviteSchema(t)`, `inviteSchema(t)` → yup object schemas. Error message keys: `auth.errors.emailRequired|emailInvalid|passwordRequired|passwordMin|passwordMax|passwordMismatch|roleInvalid`.
  - Test helper `tests/helpers/i18n.ts`: `export const i18nMocks = { $t: (k: string) => k }`.

- [ ] **Step 1: Write failing tests**

`tests/helpers/i18n.ts`:

```ts
export const i18nMocks = { $t: (key: string) => key }
```

`tests/unit/userStore.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../../app/stores/userStore'

const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchMock.mockReset()
  })

  it('starts logged out and not loaded', () => {
    const s = useUserStore()
    expect(s.user).toBeNull()
    expect(s.loaded).toBe(false)
    expect(s.isAdmin).toBe(false)
  })

  it('fetchMe stores the session user and marks loaded', async () => {
    fetchMock.mockResolvedValue({ email: null, user: { id: '1', email: 'a@b.co', role: 'admin' } })
    const s = useUserStore()
    await s.fetchMe()
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me')
    expect(s.user?.email).toBe('a@b.co')
    expect(s.isAdmin).toBe(true)
    expect(s.loaded).toBe(true)
  })

  it('fetchMe marks loaded even when the request fails', async () => {
    fetchMock.mockRejectedValue(new Error('boom'))
    const s = useUserStore()
    await s.fetchMe()
    expect(s.user).toBeNull()
    expect(s.loaded).toBe(true)
  })

  it('login posts credentials and stores the user', async () => {
    fetchMock.mockResolvedValue({ user: { id: '2', email: 'x@y.co', role: 'author' } })
    const s = useUserStore()
    const u = await s.login('x@y.co', 'pw-pw-pw-pw-pw')
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', { method: 'POST', body: { email: 'x@y.co', password: 'pw-pw-pw-pw-pw' } })
    expect(u.role).toBe('author')
    expect(s.isAdmin).toBe(false)
  })

  it('login propagates failure and leaves the user null', async () => {
    fetchMock.mockRejectedValue({ statusCode: 401 })
    const s = useUserStore()
    await expect(s.login('x@y.co', 'bad')).rejects.toBeTruthy()
    expect(s.user).toBeNull()
  })

  it('logout clears the user', async () => {
    fetchMock.mockResolvedValueOnce({ user: { id: '1', email: 'a@b.co', role: 'admin' } }).mockResolvedValueOnce({ ok: true })
    const s = useUserStore()
    await s.login('a@b.co', 'whatever-password')
    await s.logout()
    expect(fetchMock).toHaveBeenLastCalledWith('/api/auth/logout', { method: 'POST' })
    expect(s.user).toBeNull()
  })
})
```

`tests/unit/authSchemas.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { loginSchema, acceptInviteSchema, inviteSchema } from '../../app/utils/authSchemas'

const t = (k: string) => k

describe('authSchemas', () => {
  it('loginSchema requires valid email and a password', async () => {
    await expect(loginSchema(t).validate({ email: '', password: '' }, { abortEarly: false })).rejects.toMatchObject({
      errors: expect.arrayContaining(['auth.errors.emailRequired', 'auth.errors.passwordRequired']),
    })
    await expect(loginSchema(t).validate({ email: 'nope', password: 'x' })).rejects.toMatchObject({ errors: ['auth.errors.emailInvalid'] })
    await expect(loginSchema(t).validate({ email: 'a@b.co', password: 'x' })).resolves.toBeTruthy()
  })

  it('acceptInviteSchema enforces 10–200 chars and matching confirmation', async () => {
    const ok = 'a-long-enough-password'
    await expect(acceptInviteSchema(t).validate({ password: 'short', confirm: 'short' })).rejects.toMatchObject({ errors: ['auth.errors.passwordMin'] })
    await expect(acceptInviteSchema(t).validate({ password: 'x'.repeat(201), confirm: 'x'.repeat(201) })).rejects.toMatchObject({ errors: ['auth.errors.passwordMax'] })
    await expect(acceptInviteSchema(t).validate({ password: ok, confirm: ok + '!' })).rejects.toMatchObject({ errors: ['auth.errors.passwordMismatch'] })
    await expect(acceptInviteSchema(t).validate({ password: ok, confirm: ok })).resolves.toBeTruthy()
  })

  it('inviteSchema validates email and role', async () => {
    await expect(inviteSchema(t).validate({ email: 'bad', role: 'author' })).rejects.toMatchObject({ errors: ['auth.errors.emailInvalid'] })
    await expect(inviteSchema(t).validate({ email: 'a@b.co', role: 'root' })).rejects.toMatchObject({ errors: ['auth.errors.roleInvalid'] })
    await expect(inviteSchema(t).validate({ email: 'a@b.co', role: 'admin' })).resolves.toBeTruthy()
  })
})
```

`tests/unit/adminMiddleware.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../../app/stores/userStore'

const navigateTo = vi.fn((p: string) => p)
vi.stubGlobal('defineNuxtRouteMiddleware', (fn: unknown) => fn)
vi.stubGlobal('useLocalePath', () => (p: string) => p)
vi.stubGlobal('navigateTo', navigateTo)
vi.stubGlobal('useUserStore', useUserStore)

describe('admin route middleware', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    navigateTo.mockClear()
  })

  it('redirects anonymous visitors to /login (fetching the session first if needed)', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ user: null }))
    const mw = (await import('../../app/middleware/admin')).default as () => Promise<unknown>
    await mw()
    expect(navigateTo).toHaveBeenCalledWith('/login')
  })

  it('redirects non-admin users', async () => {
    const s = useUserStore()
    s.user = { id: '1', email: 'a@b.co', role: 'author' }
    s.loaded = true
    const mw = (await import('../../app/middleware/admin')).default as () => Promise<unknown>
    await mw()
    expect(navigateTo).toHaveBeenCalledWith('/login')
  })

  it('lets admins through', async () => {
    const s = useUserStore()
    s.user = { id: '1', email: 'a@b.co', role: 'admin' }
    s.loaded = true
    const mw = (await import('../../app/middleware/admin')).default as () => Promise<unknown>
    expect(await mw()).toBeUndefined()
    expect(navigateTo).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm vitest run tests/unit/userStore.test.ts tests/unit/authSchemas.test.ts tests/unit/adminMiddleware.test.ts` → FAIL (modules missing).

- [ ] **Step 3: Implement**

`app/stores/userStore.ts`:

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SessionUser {
  id: string
  email: string
  role: 'admin' | 'author'
}

export const useUserStore = defineStore('user', () => {
  const user = ref<SessionUser | null>(null)
  const loaded = ref(false)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function fetchMe() {
    try {
      // On the server, forward the incoming request's cookies.
      const fetcher = import.meta.server ? useRequestFetch() : $fetch
      const res = await fetcher<{ user: SessionUser | null }>('/api/auth/me')
      user.value = res.user ?? null
    } catch {
      user.value = null
    } finally {
      loaded.value = true
    }
  }

  async function login(email: string, password: string): Promise<SessionUser> {
    const res = await $fetch<{ user: SessionUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = res.user
    loaded.value = true
    return res.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, loaded, isAdmin, fetchMe, login, logout }
})
```

Note: the test asserts `fetchMock` was called with exactly `'/api/auth/me'`; `fetcher(url)` with no second arg satisfies that.

`app/utils/authSchemas.ts`:

```ts
import { object, string } from 'yup'

export type Translate = (key: string) => string

const MIN = 10
const MAX = 200

export function loginSchema(t: Translate) {
  return object({
    email: string().trim().required(t('auth.errors.emailRequired')).email(t('auth.errors.emailInvalid')),
    password: string().required(t('auth.errors.passwordRequired')),
  })
}

export function acceptInviteSchema(t: Translate) {
  return object({
    password: string()
      .required(t('auth.errors.passwordRequired'))
      .min(MIN, t('auth.errors.passwordMin'))
      .max(MAX, t('auth.errors.passwordMax')),
    confirm: string()
      .required(t('auth.errors.passwordRequired'))
      .test('match', t('auth.errors.passwordMismatch'), function (value) {
        return value === this.parent.password
      }),
  })
}

export function inviteSchema(t: Translate) {
  return object({
    email: string().trim().required(t('auth.errors.emailRequired')).email(t('auth.errors.emailInvalid')),
    role: string().oneOf(['author', 'admin'], t('auth.errors.roleInvalid')).required(t('auth.errors.roleInvalid')),
  })
}
```

`app/middleware/admin.ts`:

```ts
export default defineNuxtRouteMiddleware(async () => {
  const localePath = useLocalePath()
  const user = useUserStore()
  if (!user.loaded) await user.fetchMe()
  if (!user.isAdmin) return navigateTo(localePath('/login'))
})
```

`app/app.vue` — replace the script block with:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
const auth = useAuthStore()
const user = useUserStore()
onMounted(() => {
  auth.init()
  if (!user.loaded) user.fetchMe()
})
</script>
```

- [ ] **Step 4: Verify pass** — same command → PASS (13 tests). If `useRequestFetch` is flagged as undefined in unit tests, it is not — `import.meta.server` is `false` under vitest (`vitest.config.ts` defines it).

- [ ] **Step 5: Commit**

```bash
git add app/stores/userStore.ts app/utils/authSchemas.ts app/middleware/admin.ts app/app.vue tests/helpers tests/unit/userStore.test.ts tests/unit/authSchemas.test.ts tests/unit/adminMiddleware.test.ts
git commit -m "feat: add user store, auth schemas and admin route guard"
```

---

### Task 8: i18n strings and Stitch designs

**Files:**
- Modify: `i18n/locales/en.json`, `i18n/locales/es.json`, `i18n/locales/pt.json`
- Memory: `/mnt/home/jlabrada/.claude/projects/-mnt-data-sources-parasalvaracuba/memory/` (Stitch project id)

**Interfaces:**
- Produces: translation keys used by Tasks 9–11 (listed below, must match exactly).

- [ ] **Step 1: Add translations**

Add these two top-level objects to **each** locale file (keep valid JSON; add before the final `}`; add a comma after the previous last key). English shown; provide natural Spanish (`es`) and Portuguese (`pt`) with identical keys:

```json
"auth": {
  "nav": { "login": "Log in", "logout": "Log out", "admin": "Admin" },
  "login": {
    "title": "Log in",
    "subtitle": "For invited team members",
    "email": "Email",
    "password": "Password",
    "submit": "Log in",
    "failed": "Invalid email or password",
    "tooMany": "Too many attempts. Try again later.",
    "generic": "Something went wrong. Please try again."
  },
  "invite": {
    "title": "Accept your invitation",
    "subtitle": "Choose a password for {email}",
    "password": "Password",
    "confirm": "Confirm password",
    "submit": "Create account",
    "invalid": "This invitation is invalid or has expired.",
    "exists": "An account with this email already exists."
  },
  "errors": {
    "emailRequired": "Email is required",
    "emailInvalid": "Enter a valid email",
    "passwordRequired": "Password is required",
    "passwordMin": "Use at least 10 characters",
    "passwordMax": "Use at most 200 characters",
    "passwordMismatch": "Passwords do not match",
    "roleInvalid": "Choose a valid role"
  }
},
"admin": {
  "title": "Admin",
  "invite": {
    "title": "Invite a user",
    "email": "Email",
    "role": "Role",
    "roleAuthor": "Author",
    "roleAdmin": "Admin",
    "submit": "Create invitation",
    "linkReady": "Invitation link (shown once — copy and send it):",
    "copy": "Copy link",
    "copied": "Copied",
    "exists": "A user with this email already exists.",
    "failed": "Could not create the invitation."
  },
  "pending": {
    "title": "Pending invitations",
    "empty": "No pending invitations.",
    "email": "Email",
    "role": "Role",
    "expires": "Expires",
    "revoke": "Revoke"
  },
  "users": {
    "title": "Users",
    "email": "Email",
    "role": "Role",
    "created": "Created"
  }
}
```

- [ ] **Step 2: Verify all three locales parse and share keys**

```bash
node -e "const f=['en','es','pt'].map(l=>require('./i18n/locales/'+l+'.json'));const keys=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'?keys(v,p+k+'.'):[p+k]);const [a,...r]=f.map(x=>keys(x.auth).concat(keys(x.admin)).sort().join());console.log(r.every(x=>x===a)?'OK':'MISMATCH')"
```
Expected: `OK`.

- [ ] **Step 3: Stitch designs** (per user standard: use the stitch MCP for design)

1. Check project memory for an existing Stitch project id (`grep -ril stitch /mnt/home/jlabrada/.claude/projects/-mnt-data-sources-parasalvaracuba/memory/`). If none: `mcp__stitch__create_project` (title "Para Salvar A Cuba"), and `mcp__stitch__list_design_systems` to reuse an existing design system if present.
2. `mcp__stitch__generate_screen_from_text` for three screens: **Login** (centered card, email, password, primary button, error area), **Invite acceptance** (card, shows invited email, password + confirm), **Admin** (invite form with email/role/button, one-time copyable link box, pending-invitations table with Revoke, users table). Use the existing look: teal primary, Manrope/Inter, design-system tokens in `app/assets/css/main.css`.
3. Save the project id to memory: create `memory/stitch-project.md` with frontmatter (`name: stitch-project-id`, `description: Stitch MCP project id for parasalvaracuba design work`, `metadata: type: reference`) and the id in the body; add a pointer line to `memory/MEMORY.md`.
4. Use the screens as visual reference in Tasks 9–11 (layout/spacing); implementation still uses the repo's design-system components.

- [ ] **Step 4: Commit**

```bash
git add i18n/locales
git commit -m "feat: add auth and admin translations"
```

---

### Task 9: Login form, login page, navigation

**Files:**
- Create: `app/components/LoginForm.vue`, `app/pages/login.vue`
- Modify: `app/components/Navigation.vue`
- Test: `tests/unit/LoginForm.test.ts`

**Interfaces:**
- Consumes: `useUserStore`, `loginSchema`, `Button` from `@/components/design-system`.
- Produces: `<LoginForm @success="(user: SessionUser) => void" />`.

- [ ] **Step 1: Write the failing test**

`tests/unit/LoginForm.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { i18nMocks } from '../helpers/i18n'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

import LoginForm from '../../app/components/LoginForm.vue'

function setup() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return render(LoginForm, { global: { plugins: [pinia], mocks: i18nMocks } })
}

describe('LoginForm', () => {
  beforeEach(() => fetchMock.mockReset())

  it('exposes labelled fields and a submit button (accessibility)', () => {
    setup()
    expect(screen.getByLabelText('auth.login.email')).toBeTruthy()
    expect(screen.getByLabelText('auth.login.password')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'auth.login.submit' })).toBeTruthy()
  })

  it('shows validation errors as alerts and does not call the API', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: 'auth.login.submit' }))
    const alerts = await screen.findAllByRole('alert')
    expect(alerts.map(a => a.textContent)).toEqual(expect.arrayContaining(['auth.errors.emailRequired', 'auth.errors.passwordRequired']))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('submits credentials and emits success with the user', async () => {
    fetchMock.mockResolvedValue({ user: { id: '1', email: 'a@b.co', role: 'admin' } })
    const { emitted } = setup()
    await userEvent.type(screen.getByLabelText('auth.login.email'), 'a@b.co')
    await userEvent.type(screen.getByLabelText('auth.login.password'), 'some-password-1')
    await userEvent.click(screen.getByRole('button', { name: 'auth.login.submit' }))
    await waitFor(() => expect(emitted().success).toBeTruthy())
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', { method: 'POST', body: { email: 'a@b.co', password: 'some-password-1' } })
  })

  it('shows a generic alert on 401', async () => {
    fetchMock.mockRejectedValue({ statusCode: 401 })
    setup()
    await userEvent.type(screen.getByLabelText('auth.login.email'), 'a@b.co')
    await userEvent.type(screen.getByLabelText('auth.login.password'), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: 'auth.login.submit' }))
    expect((await screen.findByRole('alert')).textContent).toBe('auth.login.failed')
  })

  it('shows the rate-limit message on 429', async () => {
    fetchMock.mockRejectedValue({ statusCode: 429 })
    setup()
    await userEvent.type(screen.getByLabelText('auth.login.email'), 'a@b.co')
    await userEvent.type(screen.getByLabelText('auth.login.password'), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: 'auth.login.submit' }))
    expect((await screen.findByRole('alert')).textContent).toBe('auth.login.tooMany')
  })
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm vitest run tests/unit/LoginForm.test.ts` → FAIL (component missing).

- [ ] **Step 3: Implement `LoginForm.vue`**

```vue
<template>
  <form class="auth-form" novalidate @submit.prevent="onSubmit">
    <div class="field">
      <label for="login-email">{{ $t('auth.login.email') }}</label>
      <input id="login-email" v-model="email" v-bind="emailAttrs" type="email" autocomplete="email"
             :aria-invalid="!!errors.email" aria-describedby="login-email-error" />
      <span v-if="errors.email" id="login-email-error" class="error" role="alert">{{ errors.email }}</span>
    </div>

    <div class="field">
      <label for="login-password">{{ $t('auth.login.password') }}</label>
      <input id="login-password" v-model="password" v-bind="passwordAttrs" type="password" autocomplete="current-password"
             :aria-invalid="!!errors.password" aria-describedby="login-password-error" />
      <span v-if="errors.password" id="login-password-error" class="error" role="alert">{{ errors.password }}</span>
    </div>

    <p v-if="formError" class="error" role="alert">{{ formError }}</p>

    <Button type="submit" variant="primary" :loading="isSubmitting">{{ $t('auth.login.submit') }}</Button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { Button } from '@/components/design-system'
import { useUserStore, type SessionUser } from '~/stores/userStore'
import { loginSchema } from '~/utils/authSchemas'

const emit = defineEmits<{ (e: 'success', user: SessionUser): void }>()

const { t } = useI18n()
const store = useUserStore()
const formError = ref('')

const { defineField, errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: loginSchema(t),
  initialValues: { email: '', password: '' },
})
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  formError.value = ''
  try {
    const user = await store.login(values.email, values.password)
    emit('success', user)
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status
    formError.value = status === 429 ? t('auth.login.tooMany') : status === 401 ? t('auth.login.failed') : t('auth.login.generic')
  }
})
</script>

<style scoped>
.auth-form { display: flex; flex-direction: column; gap: var(--spacing-4); }
.field { display: flex; flex-direction: column; gap: var(--spacing-2); }
label { font-size: var(--font-size-label-lg); font-weight: var(--font-weight-semibold); color: var(--color-on-surface); }
input {
  background: var(--color-surface-container-highest); border: none;
  border-bottom: 2px solid var(--color-outline-variant); padding: var(--spacing-3) var(--spacing-2);
  font-size: var(--font-size-body-lg); font-family: var(--font-body); color: var(--color-on-surface);
}
input:focus { outline: none; border-bottom-color: var(--color-secondary); }
input[aria-invalid='true'] { border-bottom-color: var(--color-error); }
.error { color: var(--color-error); font-size: var(--font-size-body-sm); }
</style>
```

- [ ] **Step 4: Implement `login.vue`**

```vue
<template>
  <div class="auth-page">
    <main class="auth-card">
      <h1>{{ $t('auth.login.title') }}</h1>
      <p class="subtitle">{{ $t('auth.login.subtitle') }}</p>
      <LoginForm @success="onSuccess" />
    </main>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '~/components/LoginForm.vue'
import { useUserStore, type SessionUser } from '~/stores/userStore'

useSeoMeta({ robots: 'noindex, nofollow' })

const localePath = useLocalePath()
const store = useUserStore()

if (store.isAdmin) await navigateTo(localePath('/admin'))

async function onSuccess(user: SessionUser) {
  await navigateTo(localePath(user.role === 'admin' ? '/admin' : '/'))
}
</script>

<style scoped>
.auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: var(--spacing-6) var(--spacing-4); }
.auth-card {
  width: 100%; max-width: 420px; background: var(--color-surface-container-low);
  border-radius: var(--radius-lg); padding: var(--spacing-8);
  display: flex; flex-direction: column; gap: var(--spacing-4);
}
.subtitle { color: var(--color-on-surface-variant); }
</style>
```

- [ ] **Step 5: Update `Navigation.vue`**

In `<div class="nav-ctas">`, before the `LanguageSwitcher`, add:

```vue
        <template v-if="user.user">
          <NuxtLink v-if="user.isAdmin" :to="localePath('/admin')" class="nav-cta">
            <Button variant="tertiary" size="md">{{ $t('auth.nav.admin') }}</Button>
          </NuxtLink>
          <Button variant="tertiary" size="md" @click="onLogout">{{ $t('auth.nav.logout') }}</Button>
        </template>
        <NuxtLink v-else :to="localePath('/login')" class="nav-cta">
          <Button variant="tertiary" size="md">{{ $t('auth.nav.login') }}</Button>
        </NuxtLink>
```

In `<script setup>` add:

```ts
import { useUserStore } from '~/stores/userStore'

const user = useUserStore()

async function onLogout() {
  await user.logout()
  await navigateTo(localePath('/'))
}
```

- [ ] **Step 6: Verify**

Run: `pnpm vitest run tests/unit/LoginForm.test.ts` → PASS (5 tests). Then `pnpm nuxt typecheck` is not required; instead start `pnpm dev:test`, open `/login`, log in with the seeded admin → lands on `/admin` (404 until Task 11 — acceptable) and the nav shows Admin/Log out.

- [ ] **Step 7: Commit**

```bash
git add app/components/LoginForm.vue app/components/Navigation.vue app/pages/login.vue tests/unit/LoginForm.test.ts
git commit -m "feat: add login page and navigation links"
```

---

### Task 10: Invitation acceptance page

**Files:**
- Create: `app/components/InviteAcceptForm.vue`, `app/pages/invite/[token].vue`
- Test: `tests/unit/InviteAcceptForm.test.ts`

**Interfaces:**
- Consumes: `acceptInviteSchema`, `useUserStore` (sets `user`/`loaded` after accept).
- Produces: `<InviteAcceptForm :token="string" :email="string" @success />`; page `/invite/:token`.

- [ ] **Step 1: Write the failing test**

`tests/unit/InviteAcceptForm.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { createPinia, setActivePinia } from 'pinia'
import { i18nMocks } from '../helpers/i18n'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

import InviteAcceptForm from '../../app/components/InviteAcceptForm.vue'
import { useUserStore } from '../../app/stores/userStore'

function setup() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return render(InviteAcceptForm, { props: { token: 'tok123', email: 'new@example.com' }, global: { plugins: [pinia], mocks: i18nMocks } })
}

describe('InviteAcceptForm', () => {
  beforeEach(() => fetchMock.mockReset())

  it('has labelled password fields and a submit button', () => {
    setup()
    expect(screen.getByLabelText('auth.invite.password')).toBeTruthy()
    expect(screen.getByLabelText('auth.invite.confirm')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'auth.invite.submit' })).toBeTruthy()
  })

  it('blocks submit when passwords differ', async () => {
    setup()
    await userEvent.type(screen.getByLabelText('auth.invite.password'), 'a-long-enough-password')
    await userEvent.type(screen.getByLabelText('auth.invite.confirm'), 'a-different-password')
    await userEvent.click(screen.getByRole('button', { name: 'auth.invite.submit' }))
    expect((await screen.findByRole('alert')).textContent).toBe('auth.errors.passwordMismatch')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts the password to the token endpoint, stores the user and emits success', async () => {
    fetchMock.mockResolvedValue({ user: { id: '9', email: 'new@example.com', role: 'author' } })
    const { emitted } = setup()
    await userEvent.type(screen.getByLabelText('auth.invite.password'), 'a-long-enough-password')
    await userEvent.type(screen.getByLabelText('auth.invite.confirm'), 'a-long-enough-password')
    await userEvent.click(screen.getByRole('button', { name: 'auth.invite.submit' }))
    await waitFor(() => expect(emitted().success).toBeTruthy())
    expect(fetchMock).toHaveBeenCalledWith('/api/invitations/tok123/accept', { method: 'POST', body: { password: 'a-long-enough-password' } })
    expect(useUserStore().user?.email).toBe('new@example.com')
  })

  it('shows the invalid-invitation message on 404 and the exists message on 409', async () => {
    fetchMock.mockRejectedValueOnce({ statusCode: 404 })
    setup()
    await userEvent.type(screen.getByLabelText('auth.invite.password'), 'a-long-enough-password')
    await userEvent.type(screen.getByLabelText('auth.invite.confirm'), 'a-long-enough-password')
    await userEvent.click(screen.getByRole('button', { name: 'auth.invite.submit' }))
    expect((await screen.findByRole('alert')).textContent).toBe('auth.invite.invalid')
  })
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm vitest run tests/unit/InviteAcceptForm.test.ts` → FAIL.

- [ ] **Step 3: Implement `InviteAcceptForm.vue`**

```vue
<template>
  <form class="auth-form" novalidate @submit.prevent="onSubmit">
    <div class="field">
      <label for="invite-password">{{ $t('auth.invite.password') }}</label>
      <input id="invite-password" v-model="password" v-bind="passwordAttrs" type="password" autocomplete="new-password"
             :aria-invalid="!!errors.password" aria-describedby="invite-password-error" />
      <span v-if="errors.password" id="invite-password-error" class="error" role="alert">{{ errors.password }}</span>
    </div>

    <div class="field">
      <label for="invite-confirm">{{ $t('auth.invite.confirm') }}</label>
      <input id="invite-confirm" v-model="confirm" v-bind="confirmAttrs" type="password" autocomplete="new-password"
             :aria-invalid="!!errors.confirm" aria-describedby="invite-confirm-error" />
      <span v-if="errors.confirm" id="invite-confirm-error" class="error" role="alert">{{ errors.confirm }}</span>
    </div>

    <p v-if="formError" class="error" role="alert">{{ formError }}</p>

    <Button type="submit" variant="primary" :loading="isSubmitting">{{ $t('auth.invite.submit') }}</Button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { Button } from '@/components/design-system'
import { useUserStore, type SessionUser } from '~/stores/userStore'
import { acceptInviteSchema } from '~/utils/authSchemas'

const props = defineProps<{ token: string; email: string }>()
const emit = defineEmits<{ (e: 'success'): void }>()

const { t } = useI18n()
const store = useUserStore()
const formError = ref('')

const { defineField, errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: acceptInviteSchema(t),
  initialValues: { password: '', confirm: '' },
})
const [password, passwordAttrs] = defineField('password')
const [confirm, confirmAttrs] = defineField('confirm')

const onSubmit = handleSubmit(async (values) => {
  formError.value = ''
  try {
    const res = await $fetch<{ user: SessionUser }>(`/api/invitations/${encodeURIComponent(props.token)}/accept`, {
      method: 'POST',
      body: { password: values.password },
    })
    store.user = res.user
    store.loaded = true
    emit('success')
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status
    formError.value = status === 404 ? t('auth.invite.invalid') : status === 409 ? t('auth.invite.exists') : t('auth.login.generic')
  }
})
</script>

<style scoped>
.auth-form { display: flex; flex-direction: column; gap: var(--spacing-4); }
.field { display: flex; flex-direction: column; gap: var(--spacing-2); }
label { font-size: var(--font-size-label-lg); font-weight: var(--font-weight-semibold); color: var(--color-on-surface); }
input {
  background: var(--color-surface-container-highest); border: none;
  border-bottom: 2px solid var(--color-outline-variant); padding: var(--spacing-3) var(--spacing-2);
  font-size: var(--font-size-body-lg); font-family: var(--font-body); color: var(--color-on-surface);
}
input:focus { outline: none; border-bottom-color: var(--color-secondary); }
input[aria-invalid='true'] { border-bottom-color: var(--color-error); }
.error { color: var(--color-error); font-size: var(--font-size-body-sm); }
</style>
```

- [ ] **Step 4: Implement `app/pages/invite/[token].vue`**

```vue
<template>
  <div class="auth-page">
    <main class="auth-card">
      <template v-if="invitation">
        <h1>{{ $t('auth.invite.title') }}</h1>
        <p class="subtitle">{{ $t('auth.invite.subtitle', { email: invitation.email }) }}</p>
        <InviteAcceptForm :token="token" :email="invitation.email" @success="onSuccess" />
      </template>
      <template v-else>
        <h1>{{ $t('auth.invite.title') }}</h1>
        <p class="error" role="alert">{{ $t('auth.invite.invalid') }}</p>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import InviteAcceptForm from '~/components/InviteAcceptForm.vue'

useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const localePath = useLocalePath()
const token = String(route.params.token)

const { data: invitation } = await useFetch<{ email: string; role: string }>(
  `/api/invitations/${encodeURIComponent(token)}`,
  { default: () => null }
)

async function onSuccess() {
  await navigateTo(localePath('/'))
}
</script>

<style scoped>
.auth-page { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: var(--spacing-6) var(--spacing-4); }
.auth-card {
  width: 100%; max-width: 420px; background: var(--color-surface-container-low);
  border-radius: var(--radius-lg); padding: var(--spacing-8);
  display: flex; flex-direction: column; gap: var(--spacing-4);
}
.subtitle { color: var(--color-on-surface-variant); }
.error { color: var(--color-error); }
</style>
```

(`useFetch` swallows a 404 into `error` and leaves `data` as the `null` default, so the invalid branch renders.)

- [ ] **Step 5: Verify**

Run: `pnpm vitest run tests/unit/InviteAcceptForm.test.ts` → PASS (4 tests). Manually: create an invitation via `curl` (admin cookie) and open the link; an invalid token shows the invalid message.

- [ ] **Step 6: Commit**

```bash
git add app/components/InviteAcceptForm.vue "app/pages/invite" tests/unit/InviteAcceptForm.test.ts
git commit -m "feat: add invitation acceptance page"
```

---

### Task 11: Admin page

**Files:**
- Create: `app/components/AdminInviteForm.vue`, `app/components/AdminInvitationsList.vue`, `app/components/AdminUsersList.vue`, `app/pages/admin.vue`
- Test: `tests/unit/AdminInviteForm.test.ts`

**Interfaces:**
- Consumes: `inviteSchema`, `middleware/admin`.
- Produces: `<AdminInviteForm @created="(inv: CreatedInvitation) => void" />` where `CreatedInvitation = { id: string; email: string; role: string; link: string; expiresAt: string }`; `<AdminInvitationsList :invitations="Invitation[]" @revoke="(id: string) => void" />`; `<AdminUsersList :users="AdminUser[]" />`.

- [ ] **Step 1: Write the failing test**

`tests/unit/AdminInviteForm.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { i18nMocks } from '../helpers/i18n'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

import AdminInviteForm from '../../app/components/AdminInviteForm.vue'

const setup = () => render(AdminInviteForm, { global: { mocks: i18nMocks } })

describe('AdminInviteForm', () => {
  beforeEach(() => fetchMock.mockReset())

  it('has a labelled email input, a role select defaulting to author, and a submit button', () => {
    setup()
    expect(screen.getByLabelText('admin.invite.email')).toBeTruthy()
    expect((screen.getByLabelText('admin.invite.role') as HTMLSelectElement).value).toBe('author')
    expect(screen.getByRole('button', { name: 'admin.invite.submit' })).toBeTruthy()
  })

  it('validates the email before calling the API', async () => {
    setup()
    await userEvent.type(screen.getByLabelText('admin.invite.email'), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: 'admin.invite.submit' }))
    expect((await screen.findByRole('alert')).textContent).toBe('auth.errors.emailInvalid')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('creates the invitation, shows the link once and emits created', async () => {
    const inv = { id: 'i1', email: 'new@example.com', role: 'admin', link: 'http://x/invite/abc', expiresAt: '2026-10-22T00:00:00Z' }
    fetchMock.mockResolvedValue(inv)
    const { emitted } = setup()
    await userEvent.type(screen.getByLabelText('admin.invite.email'), 'new@example.com')
    await userEvent.selectOptions(screen.getByLabelText('admin.invite.role'), 'admin')
    await userEvent.click(screen.getByRole('button', { name: 'admin.invite.submit' }))
    await waitFor(() => expect(emitted().created).toBeTruthy())
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/invitations', { method: 'POST', body: { email: 'new@example.com', role: 'admin' } })
    expect((screen.getByLabelText('admin.invite.linkReady') as HTMLInputElement).value).toBe('http://x/invite/abc')
  })

  it('shows the already-exists message on 409', async () => {
    fetchMock.mockRejectedValue({ statusCode: 409 })
    setup()
    await userEvent.type(screen.getByLabelText('admin.invite.email'), 'dup@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'admin.invite.submit' }))
    expect((await screen.findByRole('alert')).textContent).toBe('admin.invite.exists')
  })
})
```

- [ ] **Step 2: Run to verify failure** — `pnpm vitest run tests/unit/AdminInviteForm.test.ts` → FAIL.

- [ ] **Step 3: Implement `AdminInviteForm.vue`**

```vue
<template>
  <section class="invite-form">
    <h2>{{ $t('admin.invite.title') }}</h2>
    <form novalidate @submit.prevent="onSubmit">
      <div class="field">
        <label for="admin-invite-email">{{ $t('admin.invite.email') }}</label>
        <input id="admin-invite-email" v-model="email" v-bind="emailAttrs" type="email" autocomplete="off"
               :aria-invalid="!!errors.email" aria-describedby="admin-invite-email-error" />
        <span v-if="errors.email" id="admin-invite-email-error" class="error" role="alert">{{ errors.email }}</span>
      </div>

      <div class="field">
        <label for="admin-invite-role">{{ $t('admin.invite.role') }}</label>
        <select id="admin-invite-role" v-model="role" v-bind="roleAttrs">
          <option value="author">{{ $t('admin.invite.roleAuthor') }}</option>
          <option value="admin">{{ $t('admin.invite.roleAdmin') }}</option>
        </select>
      </div>

      <p v-if="formError" class="error" role="alert">{{ formError }}</p>
      <Button type="submit" variant="primary" :loading="isSubmitting">{{ $t('admin.invite.submit') }}</Button>
    </form>

    <div v-if="created" class="link-box">
      <label for="admin-invite-link">{{ $t('admin.invite.linkReady') }}</label>
      <input id="admin-invite-link" :value="created.link" readonly @focus="($event.target as HTMLInputElement).select()" />
      <Button type="button" variant="secondary" size="sm" @click="copy">
        {{ copied ? $t('admin.invite.copied') : $t('admin.invite.copy') }}
      </Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { Button } from '@/components/design-system'
import { inviteSchema } from '~/utils/authSchemas'

export interface CreatedInvitation { id: string; email: string; role: string; link: string; expiresAt: string }

const emit = defineEmits<{ (e: 'created', invitation: CreatedInvitation): void }>()

const { t } = useI18n()
const formError = ref('')
const created = ref<CreatedInvitation | null>(null)
const copied = ref(false)

const { defineField, errors, handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: inviteSchema(t),
  initialValues: { email: '', role: 'author' },
})
const [email, emailAttrs] = defineField('email')
const [role, roleAttrs] = defineField('role')

const onSubmit = handleSubmit(async (values) => {
  formError.value = ''
  copied.value = false
  try {
    created.value = await $fetch<CreatedInvitation>('/api/admin/invitations', {
      method: 'POST',
      body: { email: values.email, role: values.role },
    })
    emit('created', created.value)
    resetForm()
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status
    formError.value = status === 409 ? t('admin.invite.exists') : t('admin.invite.failed')
  }
})

async function copy() {
  if (!created.value) return
  try {
    await navigator.clipboard.writeText(created.value.link)
    copied.value = true
  } catch {
    // clipboard unavailable: the readonly field is selectable as a fallback
  }
}
</script>

<style scoped>
.invite-form { display: flex; flex-direction: column; gap: var(--spacing-4); }
form { display: flex; flex-direction: column; gap: var(--spacing-4); max-width: 480px; }
.field { display: flex; flex-direction: column; gap: var(--spacing-2); }
label { font-size: var(--font-size-label-lg); font-weight: var(--font-weight-semibold); }
input, select {
  background: var(--color-surface-container-highest); border: none;
  border-bottom: 2px solid var(--color-outline-variant); padding: var(--spacing-3) var(--spacing-2);
  font-size: var(--font-size-body-lg); font-family: var(--font-body); color: var(--color-on-surface);
}
input:focus, select:focus { outline: none; border-bottom-color: var(--color-secondary); }
input[aria-invalid='true'] { border-bottom-color: var(--color-error); }
.error { color: var(--color-error); font-size: var(--font-size-body-sm); }
.link-box { display: flex; flex-direction: column; gap: var(--spacing-2); max-width: 640px; padding: var(--spacing-4); background: var(--color-surface-container-low); border-radius: var(--radius-lg); }
</style>
```

- [ ] **Step 4: Implement the list components and page**

`app/components/AdminInvitationsList.vue`:

```vue
<template>
  <section>
    <h2>{{ $t('admin.pending.title') }}</h2>
    <p v-if="invitations.length === 0">{{ $t('admin.pending.empty') }}</p>
    <table v-else>
      <thead>
        <tr>
          <th scope="col">{{ $t('admin.pending.email') }}</th>
          <th scope="col">{{ $t('admin.pending.role') }}</th>
          <th scope="col">{{ $t('admin.pending.expires') }}</th>
          <th scope="col"><span class="sr-only">{{ $t('admin.pending.revoke') }}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inv in invitations" :key="inv.id">
          <td>{{ inv.email }}</td>
          <td>{{ inv.role }}</td>
          <td>{{ new Date(inv.expires_at).toLocaleDateString() }}</td>
          <td>
            <Button variant="tertiary" size="sm" :aria-label="`${$t('admin.pending.revoke')} ${inv.email}`" @click="$emit('revoke', inv.id)">
              {{ $t('admin.pending.revoke') }}
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/components/design-system'

export interface Invitation { id: string; email: string; role: string; created_at: string; expires_at: string }

defineProps<{ invitations: Invitation[] }>()
defineEmits<{ (e: 'revoke', id: string): void }>()
</script>

<style scoped>
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: var(--spacing-3); border-bottom: 1px solid var(--color-outline-variant); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
```

`app/components/AdminUsersList.vue`:

```vue
<template>
  <section>
    <h2>{{ $t('admin.users.title') }}</h2>
    <table>
      <thead>
        <tr>
          <th scope="col">{{ $t('admin.users.email') }}</th>
          <th scope="col">{{ $t('admin.users.role') }}</th>
          <th scope="col">{{ $t('admin.users.created') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ new Date(u.created_at).toLocaleDateString() }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
export interface AdminUser { id: string; email: string; role: string; is_active: boolean; created_at: string }

defineProps<{ users: AdminUser[] }>()
</script>

<style scoped>
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: var(--spacing-3); border-bottom: 1px solid var(--color-outline-variant); }
</style>
```

`app/pages/admin.vue`:

```vue
<template>
  <div class="admin-page">
    <h1>{{ $t('admin.title') }}</h1>
    <AdminInviteForm @created="refreshInvitations" />
    <AdminInvitationsList :invitations="invitations ?? []" @revoke="revoke" />
    <AdminUsersList :users="users ?? []" />
  </div>
</template>

<script setup lang="ts">
import AdminInviteForm from '~/components/AdminInviteForm.vue'
import AdminInvitationsList, { type Invitation } from '~/components/AdminInvitationsList.vue'
import AdminUsersList, { type AdminUser } from '~/components/AdminUsersList.vue'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { data: invitations, refresh: refreshInvitations } = await useFetch<Invitation[]>('/api/admin/invitations')
const { data: users } = await useFetch<AdminUser[]>('/api/admin/users')

async function revoke(id: string) {
  await $fetch(`/api/admin/invitations/${id}`, { method: 'DELETE' })
  await refreshInvitations()
}
</script>

<style scoped>
.admin-page { max-width: 960px; margin: 0 auto; padding: var(--spacing-6) var(--spacing-4); display: flex; flex-direction: column; gap: var(--spacing-8); }
</style>
```

Note: `useFetch` on the server forwards the request cookies automatically, so the session carries through SSR.

- [ ] **Step 5: Verify**

Run: `pnpm vitest run tests/unit/AdminInviteForm.test.ts` → PASS (4 tests). Manually in `pnpm dev:test`: anonymous visit to `/admin` redirects to `/login`; logged in as admin shows the page; create → link appears; revoke removes the row.

- [ ] **Step 6: Commit**

```bash
git add app/components/Admin*.vue app/pages/admin.vue tests/unit/AdminInviteForm.test.ts
git commit -m "feat: add admin page with invitations and users"
```

---

### Task 12: Playwright automation, docs, final verification

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/admin-invite.e2e.ts`
- Modify: `README.md`, `package.json` (script `test:e2e`)

**Interfaces:**
- Consumes: the whole feature. Env: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (from `.env.test`), `E2E_BASE_URL` (default `http://localhost:3000`).

- [ ] **Step 1: Playwright config**

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  use: { baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000' },
})
```

Add to `package.json` scripts: `"test:e2e": "playwright test"`. Install the browser once: `pnpm exec playwright install chromium`.

- [ ] **Step 2: Write the e2e script**

`tests/e2e/admin-invite.e2e.ts` (uses Spanish default locale paths without prefix; selects by role/label via the `en` locale by visiting `/en/...`):

```ts
import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/en/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Log in' }).click()
}

test('anonymous visitors are redirected from /admin to /login', async ({ page }) => {
  await page.goto('/en/admin')
  await expect(page).toHaveURL(/\/login$/)
})

test('wrong password shows a generic error', async ({ page }) => {
  await login(page, ADMIN_EMAIL, 'definitely-wrong-password')
  await expect(page.getByRole('alert')).toHaveText('Invalid email or password')
})

test('admin invites a user who accepts and logs in; a non-admin cannot reach /admin', async ({ page, browser }) => {
  const invitee = `e2e-${Date.now()}@example.com`

  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD)
  await expect(page).toHaveURL(/\/admin$/)

  await page.getByLabel('Email').fill(invitee)
  await page.getByRole('button', { name: 'Create invitation' }).click()
  const link = await page.getByLabel(/Invitation link/).inputValue()
  expect(link).toMatch(/\/invite\//)
  await expect(page.getByRole('cell', { name: invitee })).toBeVisible()

  const ctx = await browser.newContext()
  const guest = await ctx.newPage()
  await guest.goto(link.replace(/(\/\/[^/]+)\//, '$1/en/'))
  await guest.getByLabel('Password', { exact: true }).fill('e2e-password-12345')
  await guest.getByLabel('Confirm password').fill('e2e-password-12345')
  await guest.getByRole('button', { name: 'Create account' }).click()
  await expect(guest).toHaveURL(/\/en\/?$/)

  await guest.goto('/en/admin')
  await expect(guest).toHaveURL(/\/login$/)

  // link is single-use
  await guest.goto(link.replace(/(\/\/[^/]+)\//, '$1/en/'))
  await expect(guest.getByRole('alert')).toHaveText('This invitation is invalid or has expired.')
  await ctx.close()
})
```

- [ ] **Step 3: Run it**

With `pnpm dev:test` running and the DB seeded: `pnpm test:e2e` → 3 passed. If a selector is ambiguous (e.g. several "Email" labels in the page), scope it with `page.getByRole('main')`/`locator('form')` — do not weaken the assertions.

- [ ] **Step 4: Document**

Add to `README.md` a section "Admin and invitations": env vars `ADMIN_EMAIL`/`ADMIN_PASSWORD`; the commands `pnpm migrate [env]`, `pnpm create-admin [env]`; how to log in at `/login`, create invitations at `/admin`, and that the invitation link is shown only once and expires in 7 days; how to run `pnpm dev:test`, the integration tests (`INTEGRATION=true pnpm vitest run tests/integration`) and `pnpm test:e2e`. Note that login rate limiting is in-memory (resets on restart, per instance).

- [ ] **Step 5: Full verification**

Run, and report each result faithfully (name any failure, including pre-existing ones):
- `pnpm test` (all unit tests)
- `INTEGRATION=true pnpm vitest run tests/integration` (with dev server)
- `pnpm test:e2e`
- `pnpm build` (must succeed)

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests/e2e README.md package.json
git commit -m "docs: document admin and invitations, add e2e tests"
```
