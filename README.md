# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Admin and invitations

Public participation (ideas, votes, comments) stays open with just an email. Team accounts are invitation-only:

- **Environment** (`.env`): `ADMIN_EMAIL` and `ADMIN_PASSWORD` (min. 10 chars) seed the first admin. Optional: `LOGIN_EMAIL_MAX_FAILURES` (default 5) and `LOGIN_IP_MAX_FAILURES` (default 30) tune the login rate limit (15-minute window; kept in memory, so it resets on restart and is per instance). Set `TRUST_PROXY=true` only when a reverse proxy in front of the app overwrites `X-Forwarded-For`; otherwise every client behind the proxy shares one IP and the limiter is spoof-proof by ignoring the header.
- **Setup**: `pnpm migrate [env]` then `pnpm create-admin [env]` (creates the admin only if none exists), e.g. `pnpm migrate test && pnpm create-admin test` for `.env.test`.
- **Use**: log in at `/login`; at `/admin` create an invitation (role *author* or *admin*). The invitation link is shown **once** — copy and send it. It is single-use and expires after 7 days; pending invitations can be revoked. The invited user opens the link, chooses a password, and is logged in.

### Tests

- Unit: `pnpm test`
- Integration (needs the DB migrated and seeded, and a dev server running on `.env.test`): `pnpm dev:test`, then `INTEGRATION=true TEST_BASE_URL=http://localhost:3000 pnpm vitest run tests/integration`
- UI automation (Playwright; install a browser once with `pnpm exec playwright install chromium`): `E2E_BASE_URL=http://localhost:3000 pnpm test:e2e`

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
