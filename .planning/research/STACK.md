# Stack Research: IdeaHub Civic Engagement Platform

**Date:** March 2026
**Scope:** Greenfield project, solo developer, ASAP launch
**Locked Stack:** Nuxt.js / Vue.js (frontend), Node.js / Express (backend), PostgreSQL (database)

---

## 1. ORM / Query Builder

### Recommendation: Prisma v5+

**Why:**
- **Type safety:** Full TypeScript support with auto-generated types from schema, reducing runtime errors
- **Developer velocity:** Intuitive schema-first approach; migrations auto-generated; zero boilerplate queries
- **Rapid prototyping:** Minimal setup time critical for ASAP launch timeline
- **Query optimization:** Prisma Client handles N+1 query prevention automatically with `.include()` patterns
- **Solo dev friendly:** Built-in seeding tools, CLI migrations, and comprehensive error messages
- **Maturity:** Production-ready since 2021, widely adopted in new JavaScript/Node projects
- **PostgreSQL native:** First-class support; relationship handling optimized for relational databases

**Version:** `^5.x` (latest stable as of early 2026)

**Setup example:**
```bash
npm install @prisma/client
npm install -D prisma
```

**Why not:**
- **TypeORM:** Over-engineered for v1 scope; requires more boilerplate (decorators, repositories); slower iteration
- **Drizzle:** Excellent but smaller ecosystem; fewer learning resources; schema-as-code approach less intuitive for rapid prototyping
- **Raw SQL / node-postgres:** No type safety; error-prone for solo dev; high cognitive load managing migrations

**Confidence:** HIGH

---

## 2. Authentication / Session Management

### Recommendation: Auth0 or custom lightweight token-based auth with `jsonwebtoken` + `express-session`

**Option A: Auth0 (Recommended for less ops burden)**
- **Why:** Managed service removes auth complexity; handles email verification, passwordless flows, session management
- **Version:** Native integration via SDK
- **Cost:** Free tier covers 7,500 users; sufficient for v1 launch
- **Tradeoff:** Vendor lock-in, adds external dependency
- **Confidence:** HIGH

**Option B: Custom lightweight auth (Recommended for full control)**
- **Libraries:**
  - `jsonwebtoken@^9.x` - JWT token generation/verification
  - `express-session@^1.18.x` - Server-side session management
  - `nodemailer@^6.x` - Email delivery for passwordless login
  - `bcrypt@^5.x` - Hashing (optional, for stored tokens)

**Why custom works for IdeaHub:**
- **Email-only requirement:** Passwordless flow is simpler to implement than typical oauth
- **Stateless tokens:** JWTs align with REST API; no session database needed initially
- **Low complexity:** Email validation + token issuance fits easily in Express middleware
- **Cost:** No external service fees
- **Control:** Can add email verification, token refresh patterns without platform constraints

**Implementation pattern:**
```javascript
// POST /auth/login - send magic link
// POST /auth/verify - exchange token, set session cookie
// Middleware: verifyToken() checks JWT in Authorization header or session cookie
```

**Why not:**
- **Passport.js:** Overkill for email-only flow; designed for oauth/social login
- **NextAuth.js:** Tied to Next.js; your frontend is Nuxt
- **Firebase Auth:** Vendor lock-in; adds costs at scale; not necessary for civic platform scope

**Confidence:** HIGH (custom) / HIGH (Auth0)

---

## 3. API Validation & Security

### Recommendation: Zod v4+ for validation + Helmet.js for security headers

**Zod (Request validation):**
- **Version:** `^4.x`
- **Why:**
  - TypeScript-first schema validation; generates types automatically
  - Smaller bundle than Joi/Yup; faster runtime validation
  - Integrates naturally with Prisma types
  - Clear error messages for malformed requests

**Pattern:**
```javascript
import { z } from 'zod';

const createIdeaSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  countryCode: z.string().length(2),
});

app.post('/ideas', (req, res) => {
  const data = createIdeaSchema.parse(req.body);
  // data is now type-safe
});
```

**Helmet.js (Security headers):**
- **Version:** `^7.x`
- **Why:**
  - Sets 15+ HTTP security headers (CSP, X-Frame-Options, HSTS, etc.)
  - Single middleware; zero configuration needed for defaults
  - Industry standard; used in 95% of Node production apps

**Additional security layers:**
- **CORS:** Use `cors@^2.8.x` with whitelist (Nuxt frontend domain only)
- **Rate limiting:** `express-rate-limit@^7.x` to prevent spam on auth/idea creation endpoints
- **Input sanitization:** Integrate DOMPurify or similar when storing user text (ideas/comments)

**Why not:**
- **Joi:** Larger bundle; schema syntax less intuitive than Zod
- **Yup:** Legacy; Zod is faster and has better TypeScript support
- **Manual validation:** Risk of missing edge cases; security holes

**Confidence:** HIGH

---

## 4. Testing Framework

### Recommendation: Vitest v1+ for unit/integration tests + Supertest for API testing

**Vitest:**
- **Version:** `^1.x`
- **Why:**
  - Drop-in Jest replacement; same syntax, 2-3x faster
  - Native ESM support (modern JavaScript)
  - Zero config; works with Prisma, TypeScript out of box
  - Growing ecosystem; integrates with popular CI/CD tools

**Supertest:**
- **Version:** `^6.x`
- **Why:**
  - HTTP assertion library; makes API testing readable
  - Designed for Express; no setup needed

**Optional: Playwright (e2e tests):**
- **Version:** `^1.40+`
- **Why:** Tests full flow (idea creation → voting → comments) in real browser
- **When:** Add after core features working, if time permits

**Test strategy for v1:**
- **Unit tests:** Model functions, validation schemas (20% of effort)
- **Integration tests:** API endpoints with Prisma (60% of effort)
- **E2E tests:** Critical user flows in Playwright (20% of effort, nice-to-have)

**Why not:**
- **Jest:** Still excellent, but slower; overkill for v1
- **Mocha + Chai:** Outdated; Vitest offers better DX
- **No tests:** Risk of shipping bugs; even light testing saves hours in production debugging

**Confidence:** HIGH

---

## 5. Deployment / Hosting

### Recommendation: Vercel (Nuxt frontend) + Railway or Render (Node/PostgreSQL backend)

**Vercel (Frontend):**
- **Why:**
  - Native Nuxt support (optimized builds, edge functions optional)
  - Free tier sufficient for v1; $20/month for custom domain + analytics
  - Instant rollbacks; simple GitHub integration
  - Edge function capability for future optimization

**Railway or Render (Backend + Database):**

**Option A: Railway** (Recommended)
- **Why:**
  - PostgreSQL + Node.js ecosystem integrated
  - Simple environment variables; auto-deploys on git push
  - Pricing: ~$5-15/month for small app (generous free credits)
  - Database backups included
  - Better for full-stack teams

**Option B: Render**
- **Why:**
  - Both backend and database in same platform
  - Free PostgreSQL tier (500 MB, suspended after 15 min inactivity)
  - Simple deployment; good docs
  - Cheaper sustained plan (~$7-10/month after free tier)
  - Good for solo devs

**Database hosting:** Both Railway and Render include PostgreSQL. Alternatively:
- **Neon** (PostgreSQL serverless): $0.5/month + usage ($0.01 per query ~100M queries free)
- **Supabase** (PostgreSQL + Auth): $25/month (but includes Auth0-like features)

**Alternative: Self-contained option**
- **Fly.io:** Docker-based; apps + database on one platform; ~$5-10/month
- **Why:** Predictable pricing; good performance; no vendor lock-in compared to serverless

**Why not:**
- **AWS / Azure / Google Cloud:** Overkill for v1; spend weeks on DevOps, not features
- **Heroku:** Killed free tier 2022; now $7/month minimum (pricey for learning)
- **Docker / Kubernetes:** Solo dev adding ops complexity; managed hosting removes that burden

**Deployment checklist:**
- [ ] Environment variables secured (API keys, database URL, JWT secret)
- [ ] Database backups automated (all platforms above do this)
- [ ] Monitoring via platform dashboards or simple uptime ping (Pingdom, Uptime Robot free tier)
- [ ] Error tracking via Sentry (free tier; 5000 events/month)

**Confidence:** HIGH (Railway or Render), MEDIUM (Fly.io alternative)

---

## 6. Real-Time Capabilities

### Recommendation: Server-Sent Events (SSE) for voting updates; optional WebSocket upgrade

**Short answer:** Do NOT add real-time initially; adds infrastructure complexity.

**Why for v1:**
- **MVP doesn't require live updates:** Users refresh page or check in later
- **Voting/comments are asynchronous:** Not a chat app where real-time feels broken
- **Complexity cost:** WebSocket state management + connection pooling + testing overhead
- **Solo dev:** Better to ship MVP, gather feedback, then add real-time if needed

**If real-time becomes critical (unlikely):**

**Option A: Server-Sent Events (SSE) - Simpler**
```javascript
// Minimal setup; works over HTTP
app.get('/api/ideas/:id/updates', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  // Send vote count updates when they happen
});
```
- **Pros:** No dependencies; works with most hosting; scales to ~10k concurrent connections per server
- **Cons:** Unidirectional; server → client only

**Option B: Socket.IO (WebSocket with fallbacks)**
- **Version:** `^4.x`
- **Pros:** Bidirectional; browser fallbacks; many tutorials
- **Cons:** Adds complexity; requires Redis for multi-server scaling; 30 min setup

**Recommendation:** Launch without real-time. Add SSE only if users complain that voting updates don't reflect fast enough.

**Confidence:** MEDIUM (decision to defer is HIGH confidence)

---

## 7. Caching Strategy

### Recommendation: Redis v7+ for session + query result caching

**Option A: Redis (Managed)**
- **Services:**
  - **Upstash Redis:** $0.25/month + usage (free tier: 10k commands/day)
  - **Redis Cloud:** Free tier sufficient for v1
  - **Railway/Render Redis addon:** Built-in; simplest setup
- **Why:**
  - Session storage (if you use express-session with Redis adapter)
  - Cache trending ideas list (updated every 5 min)
  - Cache comment threads (invalidate on new comment)
  - Cache vote counts (live updates without database hits)

**What to cache:**
```javascript
// Trending ideas (computed hourly)
cache.set('trending:global', ideaList, 3600);

// Idea detail + comments (invalidated on new comment)
cache.set(`idea:${ideaId}:comments`, commentList, 300);

// Vote count per idea (critical path)
cache.increment(`idea:${ideaId}:votes`);
```

**Option B: In-memory caching with node-cache (No external dependency)**
- **Version:** `^5.x`
- **Why:**
  - Zero external infrastructure
  - Suitable for v1 (<100k ideas, <10k MAU)
  - Enough for single-server deployment
- **Downside:** Cache lost on restart; doesn't scale beyond one server

**Implementation:**
```javascript
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 600 }); // 10 min default TTL
```

**Recommendation for v1:** Start with **node-cache**. Upgrade to Redis only if database load becomes issue (monitor with pg_stat_statements).

**Why not:**
- **Memcached:** No longer common in Node ecosystem; Redis is universal
- **Database query caching:** Prisma caching still immature; explicit caching better

**Confidence:** HIGH (recommendation to defer Redis initially)

---

## 8. File Storage

### Recommendation: Do NOT implement file uploads for v1

**Reasoning:**
- **Scope:** Ideas are text + description. Comments are text. No images/documents needed.
- **Complexity:** File uploads require virus scanning, image optimization, storage cleanup
- **Cost:** Storage costs accumulate; moderation burden increases
- **Timeline:** Solo dev; feature bloat delays launch

**If file storage becomes necessary (v1.1+):**

**Option A: Cloudinary (Images only)**
- **Why:** Image optimization, CDN, free tier (25/month)
- **Cost:** Free tier sufficient for v1.1
- **Setup:** JavaScript SDK + form upload

**Option B: AWS S3**
- **Why:** Industry standard; cheap ($0.023 per GB)
- **Downside:** More setup; requires AWS account management
- **Cost:** ~$1-3/month for small platform

**Option C: Supabase Storage**
- **Why:** PostgreSQL + storage in one platform; simple API
- **Cost:** $5/month + storage usage
- **When:** If you already using Supabase for auth

**Recommendation:** Skip entirely for v1. Add image uploads for ideas/comments in v1.1 if users request.

**Confidence:** HIGH

---

## 9. Development Tools & Environment

### TypeScript
- **Version:** `^5.4+`
- **Why:** Type safety eliminates entire categories of bugs; pairs naturally with Prisma and Zod
- **Setup:** `npm install -D typescript ts-node @types/node @types/express`

### Environment Variables
- **Library:** `dotenv@^16.x` (for .env local) + `zod` for validation
- **Why:** Separate config from code; validate types at startup
```javascript
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production']),
});
const env = envSchema.parse(process.env);
```

### Logging
- **Library:** `pino@^8.x` or `winston@^3.x` (pino is faster)
- **Why:** Structured logging; JSON output for log aggregation
- **Setup:** `npm install pino pino-http`

### Linting & Formatting
- **ESLint:** `^8.x`
- **Prettier:** `^3.x`
- **Setup:** Standard Node.js config; pair both for type-aware linting

---

## Summary Table

| Layer | Recommendation | Version | Why | Confidence |
|-------|-----------------|---------|-----|-----------|
| **ORM** | Prisma | ^5.x | Type safety + velocity | HIGH |
| **Auth** | Custom JWT + nodemailer | see below | Email-only fits use case | HIGH |
| **Validation** | Zod | ^4.x | TypeScript-first; fast | HIGH |
| **Security** | Helmet.js + CORS | ^7.x | Headers + rate limiting | HIGH |
| **Testing** | Vitest + Supertest | ^1.x + ^6.x | Fast; Express-friendly | HIGH |
| **Hosting** | Railway/Render backend + Vercel frontend | - | Managed; low ops burden | HIGH |
| **Real-time** | Defer (SSE only if needed) | - | Not required for MVP | HIGH |
| **Caching** | node-cache (v1), Redis (v1.1+) | ^5.x | Progressive complexity | HIGH |
| **Storage** | None (defer) | - | Not in scope | HIGH |
| **Language** | TypeScript | ^5.4+ | Type safety | HIGH |
| **Logging** | Pino | ^8.x | Structured logs | MEDIUM |

---

## Not Recommended & Why

| Technology | Why Not | Alternative |
|------------|---------|-------------|
| **GraphQL** | Over-engineered for v1; REST API sufficient; adds complexity for solo dev | REST + Zod validation |
| **Docker** | Adds DevOps complexity; managed hosting handles containerization | Use managed platforms (Railway, Render, Vercel) |
| **Kubernetes** | Unnecessary at scale; overkill for solo dev project | Managed deployment platform |
| **Next.js** | Frontend is Nuxt (locked in); framework incompatibility | Stick with Nuxt |
| **Microservices** | Distributed complexity not justified by scope; monolith is simpler | Single Node.js/Express app |
| **MongoDB** | Civic data is relational (ideas → votes → comments); PostgreSQL better fit | Postgres (already chosen) |
| **Stripe/Payments** | Platform is civic, not commercial; no monetization in v1 | Defer; not needed |
| **Twilio/Email service** | Nodemailer sufficient for passwordless flows; Twilio adds cost | Nodemailer for email |
| **Sentry/DataDog immediately** | Overkill for launch; monitor with platform dashboards first | Add after bugs reported |
| **Redis immediately** | Node-cache covers v1; Redis adds infrastructure cost | Use node-cache first |

---

## Implementation Priority (for solo dev)

**Week 1-2 (Core API):**
1. Prisma schema + migrations (ideas, votes, comments, email sessions)
2. Express app + Zod validation
3. Basic auth (email + JWT)

**Week 2-3 (Full CRUD):**
4. API endpoints (POST idea, GET ideas, POST vote, POST comment)
5. Helmet + CORS security
6. Testing (Vitest integration tests for endpoints)

**Week 3-4 (Polish + Deploy):**
7. Frontend integration (Nuxt consuming API)
8. Moderation queue UI
9. Deploy to Railway/Render
10. Launch + monitor

---

## Next Steps

1. **Seed repository with packages:**
   ```bash
   npm init -y
   npm install express @prisma/client zod nodemailer jsonwebtoken
   npm install -D prisma typescript ts-node vitest supertest
   ```

2. **Generate Prisma schema** from requirements in PROJECT.md

3. **Set up TypeScript + ESLint** config

4. **Create API spec** (OpenAPI / POST man) before coding endpoints

5. **Deploy skeleton** to Railway/Render early (week 1) to catch deployment issues

---

**Research confidence:** HIGH (all recommendations are proven in production; no experimental tech)
**Estimated learning curve:** 2-3 days for solo dev familiar with Node.js
**Time to launch:** 3-4 weeks at sustainable pace

Last updated: 2026-03-26
