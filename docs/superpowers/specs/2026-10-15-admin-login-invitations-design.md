# Admin, Login and User Invitations — Design

Date: 2026-10-15

## Goal

Add a login page and an admin page. The admin can invite new users. Invited users
become "authors"; a later phase will let them add articles (out of scope here).
Public participation (ideas, votes, comments via email capture) stays open and unchanged.

## Decisions (agreed with user)

- Public stays open; accounts are for the team only. Existing `authStore` (email identity) is untouched.
- Invitations are delivered as a copyable, single-use, expiring link shown in the admin page. No email sending.
- Sessions: server-side sessions in Postgres + httpOnly cookie.
- First admin is seeded from `.env`.

## Non-goals

Password reset, email sending, user deactivation UI, the articles feature, changes to the public email flow.

## Data model (migration `db/migrations/007_create_users_sessions_invitations.sql`)

- `users`: `id`, `email` (unique, stored lowercase), `password_hash`, `role` (`admin` | `author`), `is_active` (default true), `created_at`.
- `sessions`: `token_hash` (PK, SHA-256 of the cookie token), `user_id` (FK), `expires_at`, `created_at`.
- `invitations`: `id`, `token_hash` (unique), `email`, `role` (`author` | `admin`), `invited_by` (FK users), `expires_at` (now + 7 days), `accepted_at` (nullable), `revoked_at` (nullable), `created_at`.

## Security

- Passwords hashed with Node `crypto.scrypt` (per-user random salt, constant-time compare via `timingSafeEqual`). Minimum length 10.
- Tokens (session, invitation): 32 random bytes, base64url; only the SHA-256 hash is stored.
- Session cookie `session`: httpOnly, SameSite=Lax, Secure in production, 7-day lifetime. Logout deletes the row and clears the cookie.
- Login failures return one generic message; login is rate-limited per IP and per email (in-memory, small window).
- Invitation is valid only if not expired, not accepted, not revoked. Accepting is a single transaction (create user + mark accepted) so a token cannot be reused. Accepting for an email that already has a user fails.
- All admin endpoints use `server/utils/requireAdmin.ts` (401 unauthenticated, 403 non-admin). The token never appears in list responses; the link is returned only once, at creation.

## API

| Endpoint | Access | Behavior |
|---|---|---|
| `POST /api/auth/login` | public | email+password → sets cookie, returns user |
| `POST /api/auth/logout` | session | deletes session |
| `GET /api/auth/me` | public | existing behavior preserved; adds `user` (or null) |
| `POST /api/admin/invitations` | admin | `{email, role}` → creates invitation, returns `{id, link, expiresAt}` |
| `GET /api/admin/invitations` | admin | pending invitations (no tokens) |
| `DELETE /api/admin/invitations/:id` | admin | revokes |
| `GET /api/admin/users` | admin | read-only user list |
| `GET /api/invitations/:token` | public | validates; returns `{email, role}` |
| `POST /api/invitations/:token/accept` | public | `{password}` → creates user, starts session |

Admin seeding: `pnpm create-admin` (`db/create-admin.js`) reads `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env` and creates an admin if none exists; run manually after migrations, like `pnpm migrate` (`pnpm create-admin [env]`); the repo has no automated Docker migration flow. Both variables are documented in `.env` files.

## Frontend

- Pages: `app/pages/login.vue`, `app/pages/admin.vue` (invite form, pending invitations with copy-link/revoke, users table), `app/pages/invite/[token].vue` (set password).
- `app/stores/userStore.ts` (Pinia): session user, `fetchMe`, `login`, `logout`.
- `app/middleware/admin.ts`: redirects non-admins from `/admin` to `/login`.
- `Navigation.vue`: Login link when logged out; Admin (admin role) and Logout when logged in.
- Forms: vee-validate + yup. Strings in existing i18n locale files (all supported languages).
- Styling: existing design-system components and Tailwind. Screens designed with Stitch MCP; the Stitch project id is saved in project memory.

## Testing (test-first)

- Unit (vitest): password hash/verify, token utils, `userStore`, Login/Admin/Invite components, with testing-library accessibility checks.
- Integration (vitest + supertest, existing pattern in `tests/integration`): login success/failure/rate-limit; admin-only guard (401/403); invitation lifecycle incl. expired, revoked, reused, duplicate email; session create/destroy.
- Playwright scripts: login → invite → copy link → accept → login as new user; non-admin cannot reach `/admin`.

## Commits

Per user git standard: `feat:` for features, `config:` for env/config, `docs:` for docs.
