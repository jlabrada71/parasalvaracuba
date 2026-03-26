# Architecture Research: Civic Engagement Platforms

This document synthesizes architectural patterns from established civic engagement platforms (Consul, Decidim, Open Ministry) and applies them to IdeaHub's specific constraints and requirements.

## Core Components

### 1. API Layer (Express Router)
- **Request Router**: Route definitions for all HTTP endpoints
- **Validation Middleware**: Schema validation (joi, zod, or express-validator)
- **Auth Middleware**: Email session verification (localStorage token → request context)
- **Error Handler**: Standardized error responses (400, 401, 403, 404, 500)
- **CORS Handler**: Support frontend domain(s)
- **Rate Limiting**: Prevent spam/abuse (optional for v1, recommended for production)

**Files/Structure:**
- `backend/src/routes/` - Route definitions (ideas, comments, votes, moderation)
- `backend/src/middleware/` - Auth, validation, error handling
- `backend/src/utils/validators.ts` - Shared validation schemas

### 2. Ideas Service
Manages the core entity: ideas (proposals for improvement).

**Responsibilities:**
- CRUD operations: Create idea, read (list/paginate), update (edit by author), soft delete (hide by admin)
- Draft/published state (ideas in draft not visible to public until approved by moderator)
- Versioning (track edits for transparency; optional for v1)
- Scoping: All queries filtered by `country_id` (multi-tenancy)
- Sorting/ranking: by trending (weighted votes), recent, or custom algorithm

**API Endpoints:**
- `GET /countries/:id/ideas?sort=trending&limit=20&offset=0`
- `POST /ideas` (requires email session)
- `GET /ideas/:id` (with comment count, vote count, author email)
- `PATCH /ideas/:id` (author-only, or admin override)
- `DELETE /ideas/:id` (soft delete, admin-only)

**Database Table:**
```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY,
  country_id UUID NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('draft', 'published', 'hidden') DEFAULT 'draft',
  vote_score INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (country_id) REFERENCES countries(id),
  INDEX (country_id, status, vote_score)
);
```

### 3. Comments Service
Manages threaded discussions on ideas.

**Responsibilities:**
- Create comment (parent_id for threading; NULL = top-level)
- Read comments (tree/hierarchy traversal)
- Update comment (author-only)
- Soft delete (admin-only or author with cascade for children)
- Notification of parent (optional v2: email notification to idea author)

**API Endpoints:**
- `GET /ideas/:id/comments?sort=recent&limit=20` (returns tree structure)
- `POST /ideas/:id/comments` (requires email session)
- `PATCH /comments/:id` (author-only)
- `DELETE /comments/:id` (soft delete, admin-only)

**Database Table:**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  idea_id UUID NOT NULL,
  parent_comment_id UUID,
  author_email VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status ENUM('draft', 'published', 'hidden') DEFAULT 'draft',
  vote_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX (idea_id, status, vote_score),
  INDEX (parent_comment_id)
);
```

### 4. Voting Service
Manages ranking and consensus signals.

**Responsibilities:**
- Record vote: idea votes, comment votes
- Prevent double-voting: one vote per email per entity
- Update vote score: increment/decrement on vote/unvote
- Ranking algorithm: Apply weights (recency, velocity, etc.)

**API Endpoints:**
- `POST /ideas/:id/votes` (body: { direction: 'up'|'down' })
- `DELETE /ideas/:id/votes` (unvote)
- `POST /comments/:id/votes` (same)
- `DELETE /comments/:id/votes`

**Database Tables:**
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY,
  voter_email VARCHAR(255) NOT NULL,
  idea_id UUID,
  comment_id UUID,
  direction INT (1 = up, -1 = down) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  UNIQUE(voter_email, idea_id, comment_id),
  INDEX (idea_id, voter_email),
  INDEX (comment_id, voter_email)
);

-- Calculated/cached view for ranking
CREATE TABLE idea_rankings (
  idea_id UUID PRIMARY KEY,
  vote_score INTEGER DEFAULT 0,
  recent_boost FLOAT DEFAULT 1.0,
  trending_score FLOAT DEFAULT 0.0,
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
);
```

**Ranking Algorithm (simplified for v1):**
- Trending: `vote_score * recency_factor` (ideas with recent votes rank higher)
- Recent: Sort by created_at DESC
- Top: Sort by vote_score DESC
- Formula example: `trending_score = vote_score * exp(-days_old / 7)`

### 5. Moderation Service
Manages quality and spam prevention.

**Responsibilities:**
- Spam detection: Basic heuristics (new email → auto-queue, flagged content → queue)
- Manual review queue: Admins approve/reject submissions
- Admin actions: Hide/delete content, ban email (optional), add notes

**API Endpoints (Admin-only):**
- `GET /admin/moderation/queue?sort=oldest` (with filters: ideas, comments, flagged)
- `POST /admin/moderation/queue/:id/approve` (publish content)
- `POST /admin/moderation/queue/:id/reject` (delete content)
- `POST /admin/moderation/queue/:id/note` (add admin note)

**Database Tables:**
```sql
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY,
  content_type ENUM('idea', 'comment') NOT NULL,
  content_id UUID NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  reason ENUM('new_email', 'flagged', 'spam_detection') NOT NULL,
  is_flagged BOOLEAN DEFAULT false,
  reviewed BOOLEAN DEFAULT false,
  reviewed_by_admin_email VARCHAR(255),
  reviewed_at TIMESTAMP,
  decision ENUM('approved', 'rejected'),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (content_id) REFERENCES ideas(id) ON DELETE CASCADE,
  INDEX (reviewed, reason),
  INDEX (created_at)
);

CREATE TABLE email_whitelist (
  email VARCHAR(255) PRIMARY KEY,
  is_new_user BOOLEAN DEFAULT true,
  first_submission_at TIMESTAMP,
  total_submissions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Moderation Rules (v1):**
1. New email (not in email_whitelist) → auto-queue with reason 'new_email'
2. Community flag (v2+) → auto-queue with reason 'flagged'
3. Basic spam detection (v2+): Links in first post, excessive caps, etc.
4. Auto-approve: Returning emails, content from whitelist

### 6. Country Isolation & Multi-Tenancy
Ensures data separation per country.

**Responsibilities:**
- Country CRUD: Define countries (name, code, description)
- Scoping: All queries filter by country_id
- URL structure: `/countries/:id/ideas` (country explicit in URL)
- Frontend: Country selector on landing (required first action)

**Database Table:**
```sql
CREATE TABLE countries (
  id UUID PRIMARY KEY,
  code VARCHAR(2) UNIQUE NOT NULL,  -- 'US', 'BR', 'ES', etc.
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX (is_active)
);
```

**Queries must always include country_id:**
```sql
SELECT * FROM ideas WHERE country_id = $1 AND status = 'published';
SELECT * FROM comments WHERE idea_id = $1 AND status = 'published';
```

### 7. Session & Auth Middleware
Email-based lightweight authentication (no signup flow).

**Responsibilities:**
- Collect email on first action (POST /ideas, POST /comments, POST /votes)
- Persist to localStorage (token-based or email-based)
- Validate token on subsequent requests
- Extract email from token → attach to req.user.email
- Allow email update/clear

**Session Strategy (localStorage):**
Option A: Simple token (email + hash)
```javascript
// Frontend
const token = btoa(email + ':' + crypto.randomUUID()); // base64(email:uuid)
localStorage.setItem('ideaHubSession', token);

// Backend
const [email, uuid] = atob(token).split(':');
// Validate that uuid was previously issued to this email (requires session table)
```

Option B: Lightweight JWT (no claims, just signature)
```javascript
// Similar to option A but with HMAC signature
const token = createSessionToken(email, serverSecret);
const email = validateSessionToken(token, serverSecret);
```

**Database Table (minimal):**
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  INDEX (email, token_hash)
);
```

## Data Flow

### Flow 1: User Visits Platform
```
1. User lands on /
2. Frontend checks localStorage for ideaHubSession token
3. If token exists, validate with GET /auth/verify
   - If valid: store email in component state
   - If invalid: clear localStorage, show country selector
4. If no token, show country selector
5. User selects country → Redirect to /countries/:id
6. Fetch GET /countries/:id/ideas?sort=trending
7. Display trending ideas in feed
```

### Flow 2: User Creates Idea
```
1. User clicks "Submit Idea"
2. If no token in localStorage:
   - Show email form modal
   - User enters email → POST /auth/session { email }
   - Backend: Check if email in email_whitelist
   - If yes: Generate token, return
   - If no: Generate token, add to email_whitelist, add to moderation queue for first post
   - Frontend: Store token in localStorage
3. User submits idea form: { title, description }
4. Frontend: POST /ideas { title, description, country_id }
   - Attach session token in header (Authorization: Bearer <token>)
5. Backend validation:
   - Validate schema (title: min 5, max 255; description: min 10, max 5000)
   - Verify auth token → extract email
   - Verify country_id exists and is active
6. Backend processing:
   - Check if email is in email_whitelist
   - If new email: Set idea.status = 'draft'
   - If returning email: Set idea.status = 'published'
   - Insert into ideas table
   - If draft: Insert into moderation_queue with reason 'new_email'
7. Return 201 Created { idea_id, status }
8. If draft: Show "Thank you! Your idea is under review"
   If published: Redirect to idea detail page
```

### Flow 3: User Votes on Idea
```
1. User clicks upvote/downvote on idea card
2. Frontend checks localStorage token
   - If missing: Show email form first
   - Otherwise: Continue
3. Frontend: POST /ideas/:id/votes { direction: 'up'|'down' }
4. Backend:
   - Verify auth token → extract email
   - Check if email has already voted on this idea
     - If yes: Return 409 Conflict (already voted)
     - If no: Continue
   - Insert vote record: votes { voter_email, idea_id, direction }
   - Update ideas.vote_score: increment by 1 (up) or -1 (down)
   - Recalculate trending_score in idea_rankings
5. Return 201 Created { vote_id, new_vote_score }
6. Frontend: Update UI (highlight button, update score display)
```

### Flow 4: User Comments on Idea
```
1. User clicks "Add Comment" on idea detail
2. Frontend checks localStorage token (if missing, show email form)
3. User types comment, optional parent_comment_id if replying
4. Frontend: POST /ideas/:id/comments { body, parent_comment_id? }
5. Backend:
   - Verify auth token → extract email
   - Validate schema (body: min 5, max 2000)
   - Verify idea_id exists and status = 'published'
   - If parent_comment_id: Verify it exists and status = 'published'
   - Check if email is in email_whitelist
   - If new email: Set comment.status = 'draft', add to moderation_queue
   - If returning email: Set comment.status = 'published'
   - Insert into comments table
   - Update ideas.comment_count += 1
6. Return 201 Created { comment_id, status }
```

### Flow 5: Moderator Reviews Queue
```
1. Admin logs in (separate admin auth, out of scope for v1—assume localhost-only or hardcoded)
2. GET /admin/moderation/queue?sort=oldest
3. Display items: ideas and comments awaiting review
4. Admin clicks "Approve" on an idea
5. Frontend: POST /admin/moderation/queue/:id/approve
6. Backend:
   - Verify admin auth
   - Update moderation_queue { reviewed: true, decision: 'approved', reviewed_by_admin_email, reviewed_at }
   - Update ideas/comments { status: 'published' }
   - Add email to email_whitelist if not already present
7. Return 200 OK
8. Frontend: Remove from queue list, show confirmation
```

## Build Order (Dependency Graph)

### Phase 1: Foundation (Database & Server)
1. **Database Schema** (migrations)
   - `countries` table
   - `ideas` table
   - `comments` table
   - `votes` table
   - `moderation_queue` table
   - `email_whitelist` table
   - `sessions` table (if using database-backed sessions)
   - Rationale: Everything depends on the schema

2. **Express Server Setup**
   - `backend/src/app.ts` - Express app initialization
   - `backend/src/server.ts` - Server startup (listen on port)
   - `backend/src/config/` - Environment config, database connection
   - Rationale: Required before routing works

3. **Database Connection & Migrations**
   - `backend/src/db/` - PostgreSQL client, connection pool
   - `backend/src/migrations/` - Running migration files
   - Rationale: Schema must exist before queries

### Phase 2: Auth & Middleware
4. **Session/Auth Middleware**
   - `backend/src/middleware/auth.ts` - Extract email from token
   - `backend/src/middleware/validation.ts` - Schema validation
   - `backend/src/middleware/errorHandler.ts` - Centralized error handling
   - `backend/src/routes/auth.ts` - POST /auth/session endpoint
   - Rationale: All endpoints require auth; must be in place early

5. **Country Management**
   - `backend/src/routes/countries.ts` - GET /countries endpoint
   - Seed countries in database (hardcoded or migration)
   - Rationale: Ideas and comments scoped by country; must exist

### Phase 3: Core Features (Ideas & Comments)
6. **Ideas Service & Routes**
   - `backend/src/services/ideasService.ts` - CRUD logic
   - `backend/src/routes/ideas.ts` - GET, POST, PATCH, DELETE endpoints
   - Frontend: Ideas list component, idea detail component, create form
   - Rationale: Core feature; enables users to submit and view

7. **Comments Service & Routes**
   - `backend/src/services/commentsService.ts` - CRUD, threading logic
   - `backend/src/routes/comments.ts` - Nested under ideas (/ideas/:id/comments)
   - Frontend: Comment thread component, reply form
   - Rationale: Depends on ideas existing; enables discussion

### Phase 4: Voting & Ranking
8. **Votes Service & Routes**
   - `backend/src/services/votesService.ts` - Record vote, prevent double-vote
   - `backend/src/routes/votes.ts` - POST, DELETE (nested under ideas and comments)
   - Rationale: Ideas and comments must exist first

9. **Ranking Algorithm**
   - `backend/src/services/rankingService.ts` - Calculate trending_score
   - Update idea_rankings on vote/new idea
   - GET /countries/:id/ideas?sort=trending uses ranking logic
   - Rationale: Votes must exist first

### Phase 5: Moderation
10. **Moderation Service & Routes**
    - `backend/src/services/moderationService.ts` - Queue logic, auto-approval rules
    - `backend/src/routes/admin/moderation.ts` - GET queue, POST approve/reject
    - Frontend: Admin dashboard (separate from main UI)
    - Rationale: Depends on ideas/comments existing; can be prototyped without initially

### Phase 6: Deployment & Polish
11. **Frontend Integration**
    - Nuxt pages: `/`, `/countries/:id`, `/ideas/:id`
    - Components: IdeaCard, IdeaDetail, CommentThread, VoteButton
    - Integration tests: Ensure flows work end-to-end
    - Rationale: Backend must be mostly complete

12. **Production Hardening**
    - Rate limiting on endpoints
    - CORS configuration
    - Logging/monitoring
    - Security: Input sanitization, SQL injection prevention
    - Rationale: Last step before launch

## Key Architectural Decisions

### Decision 1: Email-Based Identity (No Sign-Up Flow)
**Trade-off:** Simplicity vs. spam risk
- Pro: Fast to build, low friction for users
- Con: Requires moderation queue to filter spam
- Implication: Moderation queue essential, not optional

### Decision 2: Soft Deletes vs. Hard Deletes
**Trade-off:** Data preservation vs. true deletion
- Pro: Admins can restore mistaken deletions, audit trail
- Con: Requires status enum (draft, published, hidden), complicates queries
- Implication: Always filter by status in queries; never assume deleted records are gone

### Decision 3: Country-First UI
**Trade-off:** Simplicity vs. global browsing
- Pro: Clear mental model (select country → see country's ideas)
- Con: Can't browse across countries; requires explicit country selection
- Implication: Country selector must be prominent on landing

### Decision 4: Manual Moderation (No Automated Spam)
**Trade-off:** Scalability vs. control
- Pro: Simple rules, high admin control, fewer false positives
- Con: Doesn't scale well; becomes bottleneck at thousands of daily posts
- Implication: Soft limit to ~50 posts/day per country in v1; revisit if exceeds

### Decision 5: Single Database Table for Votes
**Trade-off:** Schema clarity vs. flexibility
- Pro: Single vote record type (idea or comment) enforces consistency
- Con: UNIQUE constraint on (voter_email, idea_id, comment_id) requires both to be nullable, slightly awkward
- Implication: Application-level validation that exactly one of idea_id or comment_id is set

### Decision 6: Calculated Rankings vs. Real-Time
**Trade-off:** Simplicity vs. freshness
- Pro: Can pre-calculate at intervals (e.g., every 10 min), no recalc on every vote
- Con: Trending results slightly stale
- Implication: Acceptable for v1; revisit if users complain about stale rankings

## Testing Strategy

### Unit Tests (Services)
- `ideasService.ts`: Test CRUD, country scoping, status transitions
- `votesService.ts`: Test vote recording, double-vote prevention
- `moderationService.ts`: Test queue logic, auto-approval rules

### Integration Tests (API)
- POST /ideas → 201 with draft status for new email
- POST /ideas → 201 with published status for returning email
- POST /ideas/:id/votes → 409 on double-vote
- GET /countries/:id/ideas?sort=trending → Correct order

### End-to-End Tests (Frontend)
- User flow: Select country → Create idea → Vote → Comment → See ranking change

## Deployment Considerations

### Multi-Environment
- `development`: Localhost, seed data for testing
- `staging`: Separate database, test moderation flows
- `production`: Real database, rate limiting, monitoring

### Database Backups
- Daily automated backups (PostgreSQL dump)
- Retention: 30 days
- Test restore annually

### Monitoring
- Error logging (Sentry or similar)
- Performance monitoring (slow query log)
- Moderation queue alerts (email if queue > 10 items)

---

**Last updated: 2026-03-26 after architecture research**
