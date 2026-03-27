# Research: Phase 1 — Identity Foundation

**Date:** 2026-03-26
**Phase Goal:** Capture and persist a user's email on first action so every subsequent interaction is attributed without requiring a sign-up flow.

**Requirements to Deliver:**
- AUTH-01: First action (idea/comment/vote) prompts for email entry
- AUTH-02: Email is persisted to localStorage so future actions within the session are seamless
- AUTH-03: User can update or clear their stored email at any time

---

## 1. Frontend Architecture

### Email Capture Modal

**Component Structure (Vue Single-File Component)**

```
src/components/EmailCaptureModal.vue
├── Template
│   ├── Modal overlay (v-show with Z-index)
│   ├── Form (email input + validation feedback)
│   ├── Buttons (Save, Cancel/Skip)
│   └── Close icon (X)
├── Script Setup
│   ├── Props: isOpen (boolean), onSave (callback), onClose (callback)
│   ├── Reactive data: email (string), error (string), isLoading (boolean)
│   ├── Methods: validateEmail(), handleSubmit(), handleClose()
│   └── Validation rules (client-side regex)
└── Style
    ├── Modal backdrop (semi-transparent)
    ├── Form styling (responsive, accessible)
    └── Error states (red text, icon)
```

**Trigger Logic**

- Modal is shown **before user submits any gated action** (create idea, vote, comment)
- Gated actions check: `if (!getStoredEmail()) { showEmailModal = true; return; }`
- Modal is NOT shown if:
  - User already has email in localStorage (checked via composable on page load)
  - User explicitly clicked "Skip" in current session (tracked in component state)
  - User is reviewing existing ideas (read-only actions not gated)

**Form Fields**

```
Input: email
- Placeholder: "your@email.com"
- Type: "email"
- Validation rules:
  ✓ Required (non-empty)
  ✓ Valid email format (HTML5 email validation + regex)
  ✓ Length: min 5 chars, max 254 chars (RFC 5321)
  ✓ No disposable email domains (optional, v1.1+)
- Accessibility: aria-label, aria-describedby for errors
- Behavior: Clear error message on focus, validate on blur
```

**localStorage Integration (Pinia store)**

```typescript
// src/stores/authStore.ts (Pinia)
export const useAuthStore = defineStore('auth', () => {
  const email = ref<string | null>(null);
  const sessionId = ref<string>(generateUUID()); // For tracking

  // Load email from localStorage on app init
  const initializeSession = () => {
    const stored = localStorage.getItem('ideahub:email');
    if (stored && validateEmail(stored)) {
      email.value = stored;
    }
  };

  // Save email to both state and localStorage
  const setEmail = (newEmail: string) => {
    if (!validateEmail(newEmail)) throw new Error('Invalid email');
    email.value = newEmail;
    localStorage.setItem('ideahub:email', newEmail);
    // Optional: Send to backend to track participation
    // POST /api/auth/session with { email, sessionId }
  };

  // Clear email from both
  const clearEmail = () => {
    email.value = null;
    localStorage.removeItem('ideahub:email');
  };

  // Check if user has email
  const hasEmail = () => email.value !== null;

  return {
    email: readonly(email),
    sessionId: readonly(sessionId),
    initializeSession,
    setEmail,
    clearEmail,
    hasEmail,
  };
});
```

### Session Management

**localStorage Schema**

```javascript
// Keys stored in localStorage
{
  "ideahub:email": "user@example.com",        // String, UTF-8 encoded
  "ideahub:sessionId": "uuid-v4-string",      // Generated on first visit
}

// Storage limits: localStorage ~5-10 MB per domain (sufficient for identity data)
// Browser compatibility: Works in all modern browsers (IE11+ with polyfill)
```

**Restoration on Page Reload**

1. On app initialization (nuxt.config.ts or app.vue `setup()`):
   ```typescript
   const authStore = useAuthStore();

   // Restore session from localStorage
   onMounted(() => {
     authStore.initializeSession();
   });
   ```

2. Restored email is immediately available to all components via Pinia
3. No network call needed; instant restoration (user sees no latency)
4. If localStorage corrupted, validation catches it and clears

**Clearing Session**

- User clicks "Clear Email" in settings modal
- `authStore.clearEmail()` removes both from state and localStorage
- Next action (submit idea/vote/comment) triggers email modal again
- No logout button needed (stateless design)

**Email Validation Rules (Client-Side)**

```typescript
// Validation utility
export const validateEmail = (email: string): boolean => {
  // HTML5 standard email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Rules:
  // 1. Non-empty
  if (!email || email.trim() === '') return false;

  // 2. Valid email format
  if (!emailRegex.test(email)) return false;

  // 3. Length constraints (RFC 5321)
  if (email.length < 5 || email.length > 254) return false;

  // 4. Local part max 64 chars
  const [local] = email.split('@');
  if (local.length > 64) return false;

  return true;
};

export const getEmailErrorMessage = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (email.length < 5) return 'Email is too short';
  if (email.length > 254) return 'Email is too long';
  if (!validateEmail(email)) return 'Please enter a valid email address';
  return null;
};
```

### Page Reload & Session Persistence

**Workflow**

1. User visits site → app.vue mounts → `authStore.initializeSession()` runs
2. If `localStorage['ideahub:email']` exists and is valid → email is restored
3. User can immediately perform actions without re-entering email
4. If localStorage is cleared (by browser or user) → email is lost, user prompted on next action

**Testing Session Persistence**

```javascript
// Manual test: Open DevTools Console
localStorage.setItem('ideahub:email', 'test@example.com');
// Refresh page (Ctrl+R)
// Check: authStore.email should be 'test@example.com'

// Clear test:
localStorage.removeItem('ideahub:email');
// Refresh page
// Check: authStore.email should be null, next action shows modal
```

---

## 2. Backend Architecture

### Express Middleware: Email Extraction & Validation

**Middleware Location**

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  email?: string;
  sessionId?: string;
}

export const extractEmailMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Extract email from request context (priority order)
  const email =
    req.headers['x-user-email'] as string ||          // Header (preferred)
    req.body?.email ||                                // Body (for POST)
    req.query?.email;                                 // Query (not recommended)

  if (!email) {
    // Email is optional for GET requests (read-only)
    // Email is REQUIRED for POST/PATCH/DELETE (write actions)
    if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
      return res.status(401).json({
        error: 'MISSING_EMAIL',
        message: 'Email required for this action',
      });
    }
    return next(); // Read-only, allow unauthenticated
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: 'INVALID_EMAIL',
      message: 'Email format invalid',
    });
  }

  // Attach to request object for downstream handlers
  req.email = email;
  req.sessionId = req.headers['x-session-id'] as string;

  next();
};

// Validation function (mirrors frontend)
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (
    email &&
    emailRegex.test(email) &&
    email.length >= 5 &&
    email.length <= 254 &&
    email.split('@')[0].length <= 64
  );
}
```

**Endpoint Flow: Email from Frontend → Backend**

```
Frontend (Nuxt component)
  ↓
  POST /api/ideas (payload body or header)
  {
    "title": "...",
    "description": "...",
    "email": "user@example.com" // Option A: in body
  }
  OR headers:
  {
    "X-User-Email": "user@example.com" // Option B: in header (preferred)
  }
  ↓
  Express middleware (extractEmailMiddleware)
  ↓
  req.email = "user@example.com" (attached to request object)
  ↓
  Route handler (createIdea)
  ↓
  POST /api/ideas route
  (req.email available as ctx for INSERT query)
```

**Recommended Approach: Header Extraction**

- **Use `X-User-Email` header** (HTTP convention for custom headers)
- **Why headers, not body:**
  - Cleaner API (email is metadata, not resource data)
  - Works for all HTTP methods (GET, POST, PATCH, DELETE)
  - Easier to inspect in middleware (before body parsing)
  - Follows REST best practices for authentication context

**Frontend Implementation (Axios/Fetch interceptor)**

```typescript
// src/plugins/apiClient.ts
import axios from 'axios';
import { useAuthStore } from '~/stores/authStore';

export default defineNuxtPlugin(() => {
  const api = axios.create({
    baseURL: process.env.API_URL || 'http://localhost:3000/api',
  });

  // Request interceptor: attach email to all requests
  api.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    if (authStore.email) {
      config.headers['X-User-Email'] = authStore.email;
      config.headers['X-Session-Id'] = authStore.sessionId;
    }
    return config;
  });

  return { provide: { api } };
});
```

### Email Validation (Backend)

**Layer 1: Format Validation** (same regex as frontend)

```typescript
function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  if (email.length < 5 || email.length > 254) return false;
  if (email.split('@')[0].length > 64) return false;
  return true;
}
```

**Layer 2: Domain Validation** (backend only)

```typescript
// Optional: Check domain validity (DNS lookup)
// Prevents typos like "example.cmo" (instead of .com)
import dns from 'dns/promises';

async function validateEmailDomain(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  try {
    await dns.resolveMx(domain);
    return true; // Domain has MX records
  } catch {
    return false; // Domain not found or invalid
  }
}
// NOTE: Optional for v1. Adds latency (~100ms per request). Skip if performance critical.
```

**Layer 3: Blacklist/Spam Check** (optional for v1)

```typescript
// Simple approach: block disposable email providers
const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  '10minutemail.com',
  'mailinator.com',
  // ... add more as needed
];

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1].toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}
// NOTE: Defer to v1.1. For v1, accept all emails (moderation catches abuse).
```

**Prevention: Email Spoofing & Manipulation**

The email is trusted from the client because:

1. **Client validates format** (basic regex)
2. **Backend re-validates format** (defense-in-depth)
3. **No permanent consequences** (email is not a unique key in v1)
4. **Moderation layer catches abuse** (admin can delete spam content)

**Q: Can user claim someone else's email and impersonate them?**

**A:** Yes, in v1. This is acceptable because:
- No email verification (no sign-up flow)
- Ideas/comments are attributed to email, not verified identity
- Email address is visible; accountability comes from reputation, not authentication
- Moderation handles egregious abuse (spam, impersonation)
- **Upgrade in v2:** Email verification (send link, user clicks to confirm) if needed

### Backend: Database Decisions

**Question: Do you need a `users` table?**

**Answer for v1: Optional. Email-in-request is sufficient.**

**Rationale:**
- Phase 1 only requires storing email with submissions (ideas, comments)
- No user profile, reputation, or tracking needed
- Email is passed via request header; no session storage needed
- **Defer database user table to Phase 2** when you need to track authorship

**If you defer `users` table (Recommended for v1):**

```typescript
// In Phase 2, when adding ideas:
// src/prisma/schema.prisma

model Idea {
  id        String   @id @default(cuid())
  title     String
  description String
  email     String   // Email is stored with idea, not linked to user table
  votes     Int      @default(0)
  createdAt DateTime @default(now())

  // No relation to users table yet
}

model Vote {
  id        String @id @default(cuid())
  ideaId    String
  email     String // Email is stored with vote
  direction Int    // +1 (up) or -1 (down)
  createdAt DateTime @default(now())

  // Unique constraint: one vote per email per idea
  @@unique([ideaId, email])
}
```

**If you add `users` table (Optional, for future tracking):**

```typescript
// Phase 2+ extension:
// src/prisma/schema.prisma

model User {
  id         String @id @default(cuid())
  email      String @unique
  joinedAt   DateTime @default(now())
  lastSeenAt DateTime @updatedAt

  ideas      Idea[]
  votes      Vote[]
  comments   Comment[]
}

model Idea {
  id        String @id @default(cuid())
  title     String
  description String
  authorId  String
  author    User @relation(fields: [authorId], references: [id])
  // ... rest
}
```

**Recommendation:** Start without `users` table. Add it in Phase 2 when you need to link ideas → author.

### Duplicate Emails (Same Person, Different Sessions)

**Current Handling (v1):**

```
User A visits site
  ↓ localStorage stores: "alice@example.com"
  ↓ Creates idea #1

User A clears browser data
  ↓ localStorage lost
  ↓ Visits site again, enters email again

Result: Database has 2 "alice@example.com" entries (same person, same email, different sessions)
Status: ACCEPTABLE for v1 (no user table to link them)
```

**Future Handling (Phase 2+):**

```typescript
// When adding users table:
async function getOrCreateUser(email: string) {
  return await prisma.user.upsert({
    where: { email },
    update: { lastSeenAt: new Date() },
    create: { email, joinedAt: new Date() },
  });
}

// Now all actions by "alice@example.com" are linked to one User record
```

---

## 3. Database

### Do You Need a `users` Table for Phase 1?

**Answer: NO**

**Why:**
- Phase 1 only requires email capture and localStorage persistence
- Phases 2 & 3 require `ideas` and `comments` tables, which store email directly
- User identity is inferred from email string; no profiling needed
- Adding `users` table adds schema complexity with zero Phase 1 benefit

### Phase 1 Database Schema (Minimal)

```typescript
// src/prisma/schema.prisma (Phase 1 content only)

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model EmailSession {
  id        String @id @default(cuid())
  email     String
  sessionId String @unique
  createdAt DateTime @default(now())
  lastSeen  DateTime @updatedAt

  // Optional: Track when users first participated
  // Helps with spam detection / user cohort analysis
}

// That's it for Phase 1.
// ideas, votes, comments, users tables are added in Phases 2 & 3.
```

**What the EmailSession table does:**

- Records each first-time email participation
- Tracks `createdAt` to identify new vs. returning users
- Tracks `lastSeen` for passive analytics (user retention)
- `sessionId` allows pairing frontend session with backend session data
- **Optional:** Used in Phase 2+ for moderation (e.g., "first post from this email?")

**Migration to Create Table:**

```sql
-- migrations/001_create_email_session.sql
CREATE TABLE "EmailSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "EmailSession_email_idx" ON "EmailSession"("email");
```

**Usage in Express Middleware:**

```typescript
export const recordEmailSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.email) return next();

  try {
    // Check if email + sessionId combo exists
    const existing = await prisma.emailSession.findUnique({
      where: { sessionId: req.sessionId! },
    });

    if (!existing) {
      // First time seeing this session
      await prisma.emailSession.create({
        data: {
          email: req.email,
          sessionId: req.sessionId!,
        },
      });
    } else {
      // Update lastSeen
      await prisma.emailSession.update({
        where: { sessionId: req.sessionId! },
        data: { lastSeen: new Date() },
      });
    }
  } catch (error) {
    // Don't fail request if session recording fails
    console.error('Failed to record email session:', error);
  }

  next();
};
```

### Privacy Implications

**Data stored:**
- `email`: User identifier
- `sessionId`: Anonymous session identifier (UUID, not linked to user account)
- `createdAt`: First participation timestamp
- `lastSeen`: Last activity timestamp

**Privacy considerations:**
- Email is retained; user cannot fully delete their data in Phase 1
- **Mitigation in v2+:** Add email deletion endpoint + data retention policy
- No IP address, user agent, or location tracking
- No advertising/analytics integration

**GDPR Compliance Checklist:**
- [ ] Privacy policy states email is stored
- [ ] User can delete email via API (POST /api/auth/clear-email)
- [ ] Data retention policy (e.g., delete after 2 years inactivity)
- [ ] No third-party sharing

---

## 4. Edge Cases & Design Decisions

### Edge Case Decision Matrix

| Case | Current Approach (Phase 1) | Why | Future Improvement (v1.1+) |
|------|---------------------------|-----|---------------------------|
| **JavaScript disabled** | Form submission falls back to POST /api/ideas with email in body | Progressive enhancement; server-side fallback | Add `<noscript>` warning if needed |
| **Fake email** | Accept for v1; moderation catches spam | Frictionless signup; moderation is cheaper than verification | Email verification link in v2 if abuse escalates |
| **Change email mid-session** | Update localStorage + Pinia state; next request uses new email | Simple UX; no logout needed | Settings page with email history (v2) |
| **Clear email mid-session** | Remove from localStorage; next action prompts modal again | User has full control; simple implementation | Add confirmation dialog to prevent accidents |
| **No localStorage support** | Email lost on page reload; user prompted again | Edge case (mobile Safari private mode); rare | Fallback to session cookie + server-side session store (v2) |
| **localStorage quota exceeded** | Graceful degradation; prompt user again | Data is ~50 bytes; unlikely to hit 5 MB limit | Monitor localStorage usage; warn user |
| **Multiple tabs/windows** | Email shared across all tabs (localStorage is shared) | Expected behavior; no sync issues | Optional: detect email mismatch across tabs (future) |
| **Email contains special characters** | Validated server-side; rare characters rejected | Simplicity; avoid encoding issues | Support internationalized emails (IDN) in v2 |
| **Empty email after trim** | Treated as missing; modal re-shown | Prevent whitespace-only submissions | Client-side trim() before validation |
| **Duplicate votes with same email** | Handled at database layer in Phase 2 (unique constraint) | Vote deduplication logic belongs in Phase 2 | Implement unique(ideaId, email) in votes table |

### Change Email (AUTH-03 Implementation)

**UX: Settings Modal**

```
Header or Navigation Menu
  ↓
  [User Icon / Settings Button]
  ↓
  Dropdown or Modal opens:
  ┌─────────────────────────────┐
  │ Email Settings              │
  │ ─────────────────────────   │
  │ Current: alice@example.com  │
  │                             │
  │ [Change Email] button       │
  │ [Clear Email]  button       │
  └─────────────────────────────┘
```

**Change Email Flow**

```typescript
// src/stores/authStore.ts
const updateEmail = (newEmail: string) => {
  if (!validateEmail(newEmail)) throw new Error('Invalid email');

  // Validate it's different
  if (newEmail === email.value) {
    throw new Error('Email unchanged');
  }

  // Update both state and localStorage
  email.value = newEmail;
  localStorage.setItem('ideahub:email', newEmail);

  // Optional: Notify backend of change
  // POST /api/auth/email-changed with { oldEmail, newEmail }
};

const clearEmail = () => {
  email.value = null;
  localStorage.removeItem('ideahub:email');
};
```

**Settings Component**

```vue
<template>
  <div class="email-settings">
    <h3>Email Settings</h3>
    <p>Current: <strong>{{ authStore.email || 'Not set' }}</strong></p>

    <button @click="showChangeModal = true" :disabled="!authStore.email">
      Change Email
    </button>

    <button @click="clearEmailConfirm()" class="danger" :disabled="!authStore.email">
      Clear Email
    </button>

    <!-- Change Email Modal -->
    <EmailCaptureModal
      v-if="showChangeModal"
      :isOpen="showChangeModal"
      @save="handleChangeEmail"
      @close="showChangeModal = false"
      title="Change Email Address"
    />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore';
import EmailCaptureModal from '~/components/EmailCaptureModal.vue';

const authStore = useAuthStore();
const showChangeModal = ref(false);

const handleChangeEmail = (newEmail: string) => {
  try {
    authStore.updateEmail(newEmail);
    showChangeModal.value = false;
    // Toast: "Email updated successfully"
  } catch (error) {
    // Toast: error.message
  }
};

const clearEmailConfirm = () => {
  if (confirm('Are you sure? You'll be prompted for email on your next action.')) {
    authStore.clearEmail();
    // Toast: "Email cleared"
  }
};
</script>
```

---

## 5. Testing Strategy

### Unit Tests

**Frontend: Email Validation**

```typescript
// tests/utils/email.test.ts
import { validateEmail, getEmailErrorMessage } from '~/utils/email';
import { describe, it, expect } from 'vitest';

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('alice.bob+tag@co.uk')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
  });

  it('enforces length constraints', () => {
    const tooShort = 'a@b';
    const toolong = 'a'.repeat(250) + '@example.com';
    expect(validateEmail(tooShort)).toBe(false);
    expect(validateEmail(toolong)).toBe(false);
  });
});

describe('getEmailErrorMessage', () => {
  it('returns appropriate error messages', () => {
    expect(getEmailErrorMessage('')).toBe('Email is required');
    expect(getEmailErrorMessage('invalid')).toBe('Please enter a valid email address');
  });

  it('returns null for valid emails', () => {
    expect(getEmailErrorMessage('valid@example.com')).toBeNull();
  });
});
```

**Frontend: localStorage Persistence**

```typescript
// tests/stores/authStore.test.ts
import { useAuthStore } from '~/stores/authStore';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists email to localStorage', () => {
    const store = useAuthStore();
    store.setEmail('test@example.com');
    expect(localStorage.getItem('ideahub:email')).toBe('test@example.com');
  });

  it('restores email from localStorage', () => {
    localStorage.setItem('ideahub:email', 'persisted@example.com');
    const store = useAuthStore();
    store.initializeSession();
    expect(store.email).toBe('persisted@example.com');
  });

  it('clears email from both state and storage', () => {
    const store = useAuthStore();
    store.setEmail('test@example.com');
    store.clearEmail();
    expect(store.email).toBeNull();
    expect(localStorage.getItem('ideahub:email')).toBeNull();
  });

  it('validates email before persisting', () => {
    const store = useAuthStore();
    expect(() => store.setEmail('invalid')).toThrow('Invalid email');
    expect(store.email).toBeNull();
  });
});
```

**Backend: Email Validation Middleware**

```typescript
// tests/middleware/auth.middleware.test.ts
import { extractEmailMiddleware } from '~/middleware/auth.middleware';
import { describe, it, expect } from 'vitest';

describe('extractEmailMiddleware', () => {
  it('extracts email from X-User-Email header', () => {
    const req = {
      headers: { 'x-user-email': 'user@example.com' },
      method: 'POST',
    } as any;
    const res = { status: () => ({ json: () => {} }) } as any;
    const next = () => {};

    extractEmailMiddleware(req, res, next);
    expect(req.email).toBe('user@example.com');
  });

  it('rejects invalid email format', () => {
    const req = {
      headers: { 'x-user-email': 'invalid' },
      method: 'POST',
    } as any;
    const json = () => {};
    const status = () => ({ json });
    const res = { status } as any;
    const next = () => {};

    extractEmailMiddleware(req, res, next);
    // Should have called res.status(400)
  });

  it('allows POST without email to return 401', () => {
    const req = { headers: {}, method: 'POST' } as any;
    const json = () => {};
    const status = () => ({ json });
    const res = { status } as any;
    const next = () => {};

    extractEmailMiddleware(req, res, next);
    // Should have called res.status(401)
  });

  it('allows GET without email', () => {
    const req = { headers: {}, method: 'GET' } as any;
    const res = {} as any;
    const nextCalled = false;
    const next = () => { nextCalled = true; };

    extractEmailMiddleware(req, res, next);
    expect(nextCalled).toBe(true);
  });
});
```

### Integration Tests

**Frontend ↔ Backend: Email Flow**

```typescript
// tests/integration/email-flow.test.ts
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';

describe('Email Flow: Frontend → Backend', () => {
  let api: ReturnType<typeof axios.create>;

  beforeEach(() => {
    api = axios.create({ baseURL: 'http://localhost:3000/api' });
  });

  it('sends email in header to backend', async () => {
    // Simulate user entering email in modal
    const email = 'test@example.com';

    // Store email locally (simulates EmailCaptureModal.vue save)
    localStorage.setItem('ideahub:email', email);

    // Make request to backend
    const response = await api.post('/ideas', {
      title: 'Test Idea',
      description: 'Test description',
    }, {
      headers: { 'X-User-Email': email },
    });

    expect(response.status).toBe(201);
    expect(response.data.email).toBe(email);
  });

  it('returns 401 if email missing on POST', async () => {
    try {
      await api.post('/ideas', {
        title: 'Test Idea',
        description: 'Test description',
      });
      expect.fail('Should have thrown 401');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.error).toBe('MISSING_EMAIL');
    }
  });

  it('backend validates email format', async () => {
    try {
      await api.post('/ideas', {
        title: 'Test Idea',
        description: 'Test description',
      }, {
        headers: { 'X-User-Email': 'invalid-email' },
      });
      expect.fail('Should have thrown 400');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toBe('INVALID_EMAIL');
    }
  });
});
```

### E2E Tests (Optional, Playwright)

```typescript
// tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Phase 1: Identity Foundation', () => {
  test('user enters email on first action', async ({ page, context }) => {
    // Clear any existing storage
    await context.clearCookies();
    const storage = await context.storageState();
    storage.cookies = [];

    // Visit homepage
    await page.goto('http://localhost:3000');
    expect(page.url()).toContain('localhost');

    // Click "Create Idea" (first action)
    await page.click('[data-test="btn-create-idea"]');

    // Email modal should appear
    const modal = page.locator('[data-test="email-modal"]');
    await expect(modal).toBeVisible();

    // Enter email
    await page.fill('[data-test="input-email"]', 'e2e@example.com');
    await page.click('[data-test="btn-save-email"]');

    // Modal closes
    await expect(modal).not.toBeVisible();

    // Email is persisted to localStorage
    const email = await page.evaluate(() => localStorage.getItem('ideahub:email'));
    expect(email).toBe('e2e@example.com');
  });

  test('user is not prompted for email on second action', async ({ page, context }) => {
    // Set up initial email in localStorage
    await context.addInitScript(() => {
      localStorage.setItem('ideahub:email', 'returning@example.com');
    });

    await page.goto('http://localhost:3000');

    // Click "Create Idea" - modal should NOT appear
    await page.click('[data-test="btn-create-idea"]');

    const modal = page.locator('[data-test="email-modal"]');
    await expect(modal).not.toBeVisible();

    // Form should be visible and ready
    const form = page.locator('[data-test="form-create-idea"]');
    await expect(form).toBeVisible();
  });

  test('user can change email via settings', async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('ideahub:email', 'old@example.com');
    });

    await page.goto('http://localhost:3000');

    // Open settings
    await page.click('[data-test="btn-settings"]');

    // Click "Change Email"
    await page.click('[data-test="btn-change-email"]');

    // Modal appears
    const modal = page.locator('[data-test="email-modal"]');
    await expect(modal).toBeVisible();

    // Enter new email
    await page.fill('[data-test="input-email"]', 'new@example.com');
    await page.click('[data-test="btn-save-email"]');

    // Check localStorage
    const email = await page.evaluate(() => localStorage.getItem('ideahub:email'));
    expect(email).toBe('new@example.com');
  });

  test('user can clear email', async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('ideahub:email', 'temp@example.com');
    });

    await page.goto('http://localhost:3000');
    await page.click('[data-test="btn-settings"]');
    await page.click('[data-test="btn-clear-email"]');

    // Confirm dialog
    page.once('dialog', (dialog) => dialog.accept());

    // Check localStorage is cleared
    const email = await page.evaluate(() => localStorage.getItem('ideahub:email'));
    expect(email).toBeNull();

    // Next action shows modal again
    await page.click('[data-test="btn-create-idea"]');
    const modal = page.locator('[data-test="email-modal"]');
    await expect(modal).toBeVisible();
  });
});
```

---

## 6. Implementation Timeline & Complexity

### Minimum Viable Implementation (MVP)

**What's required for Phase 1 launch:**

1. **Frontend (localStorage + modal)**
   - `src/stores/authStore.ts` (Pinia store) — 50 lines
   - `src/components/EmailCaptureModal.vue` — 150 lines
   - `src/utils/email.ts` (validation) — 50 lines
   - Integration in form components (1-2 lines per form)
   - **Time: 1-2 days**

2. **Backend (Express middleware)**
   - `src/middleware/auth.middleware.ts` — 100 lines
   - Header extraction + validation
   - Attach email to request object
   - **Time: 0.5 days**

3. **Database (optional for v1, required for Phase 2)**
   - Prisma schema (minimal)
   - EmailSession table (optional)
   - **Time: 0.5 days**

**Total MVP time: 2-3 days**

### What Can Be Deferred (v1.1+)

| Feature | Effort | Phase | Rationale |
|---------|--------|-------|-----------|
| Email verification (link) | 2 days | v1.1 | Not needed for initial launch; defer if abuse minimal |
| Disposable email blacklist | 0.5 day | v1.1 | Moderation catches spam; not a blocker |
| Email history / audit log | 1 day | v2 | Nice-to-have; not critical |
| Server-side session store | 2 days | v2 | localStorage sufficient for solo launch |
| Redis caching | 1 day | v2 | Not needed until scale issues appear |

### AUTH-03 (Change Email) Implementation Cost

**Decision: Implement in Phase 1 (low incremental cost)**

- Reuse EmailCaptureModal component (no new UI needed)
- Add `updateEmail()` method to Pinia store (10 lines)
- Add settings page with 2-3 buttons (30 lines)
- **Incremental cost: 0.5 days**

**Why not defer:**
- Low complexity
- High user value (control over identity)
- Avoids API design debt (change endpoint needed anyway)
- Deferred to v1.1 adds complexity (different modal, special handling)

---

## 7. Recommendations for Phase 1 Implementation

### Decision: Skip Database User Table in Phase 1

**Recommendation:** Do NOT create `users` table yet.

**Why:**
- Phase 1 only requires email capture + localStorage
- Email-in-request is sufficient for gating actions
- Adding users table adds schema complexity with zero v1 benefit
- Phase 2 (ideas creation) can introduce users table with ideas linking

**Migration path (Phase 2):**
```typescript
// When you create ideas in Phase 2:
// 1. Create users table + User model
// 2. Create ideas table with userId FK
// 3. Add migration to backfill users from existing submissions
// 4. Update middleware to getOrCreateUser(email)
```

### Decision: Header-Based Email Transport

**Recommendation:** Send email via `X-User-Email` header, not request body.

**Why:**
- Email is metadata (authentication context), not resource data
- Headers work for all HTTP methods (GET, POST, PATCH)
- Cleaner API contract
- Express middleware can extract before body parsing

**Implementation:**
```typescript
// Frontend: Axios interceptor
api.interceptors.request.use((config) => {
  const email = useAuthStore().email;
  if (email) {
    config.headers['X-User-Email'] = email;
  }
  return config;
});

// Backend: Middleware
export const extractEmailMiddleware = (req, res, next) => {
  const email = req.headers['x-user-email'];
  if (email) req.email = email;
  next();
};
```

### Decision: Accept All Emails in Phase 1 (No Verification)

**Recommendation:** Trust user-entered email; skip verification link.

**Why:**
- Frictionless signup (user enters email, immediately submits idea)
- Moderation layer catches spam/fake emails
- Verification adds latency + complexity
- Users can still update/clear email if mistaken

**Verification upgrade (Phase 2):**
```typescript
// If abuse escalates, add verification in Phase 2:
// 1. Generate random token
// 2. Send "verify your email" link
// 3. Store token + email in unverified_emails table
// 4. User clicks link to activate
// 5. Move to verified_users table
```

### Decision: Simple localStorage, No Server-Side Session Store

**Recommendation:** Phase 1 uses localStorage only; no server-side session state.

**Why:**
- Solo dev; no infrastructure to manage
- Stateless architecture scales
- Browser manages expiration (user clearing cookies)
- Email travels with every request (idempotent)

**Session store upgrade (Phase 2+):**
```typescript
// If you need persistent sessions:
// 1. Install express-session + redis
// 2. Generate sessionId on first request
// 3. Store sessionId → email mapping in Redis
// 4. Set secure cookie with sessionId
// 5. Verify sessionId server-side on requests
```

### Fallback for JavaScript Disabled (Progressive Enhancement)

**Recommendation:** Support form-based email submission for noscript fallback.

**Implementation:**
```html
<!-- Fallback form (hidden when JS enabled) -->
<noscript>
  <form action="/api/ideas" method="POST">
    <input type="email" name="email" required />
    <textarea name="description"></textarea>
    <button type="submit">Create Idea</button>
  </form>
</noscript>
```

**Backend:** Accept email in POST body as fallback:
```typescript
const email =
  req.headers['x-user-email'] ||  // From JS client
  req.body.email;                  // From form submission
```

---

## Implementation Checklist: Phase 1

### Frontend

- [ ] Create `src/stores/authStore.ts` (Pinia store for email + sessionId)
- [ ] Create `src/utils/email.ts` (validation helper)
- [ ] Create `src/components/EmailCaptureModal.vue` (modal component)
- [ ] Create `src/pages/settings.vue` (settings page for change/clear email)
- [ ] Create API interceptor to send `X-User-Email` header
- [ ] Add email validation errors to modal
- [ ] Test localStorage persistence (manual + unit tests)
- [ ] Test modal shows only on first action
- [ ] Test email restoration on page reload

### Backend

- [ ] Create `src/middleware/auth.middleware.ts` (extract email from header)
- [ ] Create `src/utils/email.ts` (validation helper, mirror frontend)
- [ ] Add middleware to Express app (app.use(extractEmailMiddleware))
- [ ] Guard POST/PATCH/DELETE routes to require email
- [ ] Test middleware rejects invalid email (400)
- [ ] Test middleware rejects missing email on POST (401)
- [ ] Test middleware allows GET without email
- [ ] Integration test: email flows from client → server

### Database (Optional for v1, Recommended to Plan)

- [ ] Design EmailSession table schema
- [ ] Create Prisma model (optional, can defer)
- [ ] Optionally create migration file
- [ ] Document schema in README

### Testing

- [ ] Unit: email validation (regex, length, format)
- [ ] Unit: localStorage persistence (set, get, clear)
- [ ] Unit: middleware extraction (header, body, query priority)
- [ ] Integration: email transport (frontend → backend header)
- [ ] E2E (optional): user enters email → stores → persists across reload
- [ ] E2E (optional): change email via settings

### Documentation

- [ ] Add comments to auth store explaining lifecycle
- [ ] Add comments to middleware explaining validation layers
- [ ] Document `X-User-Email` header convention
- [ ] Document localStorage schema
- [ ] Add API spec: which endpoints require email

---

## Summary: Architecture Overview

```
Frontend (Nuxt/Vue)
├── EmailCaptureModal.vue
│   ├── Form input (email)
│   ├── Client-side validation (regex, length)
│   └── onSave() → authStore.setEmail()
├── authStore.ts (Pinia)
│   ├── email: ref<string | null>
│   ├── sessionId: ref<string>
│   ├── setEmail() → localStorage.setItem()
│   ├── clearEmail() → localStorage.removeItem()
│   └── initializeSession() → restore from localStorage
├── API Interceptor
│   └── POST /api/* with header: X-User-Email
└── Settings page
    ├── Show current email
    ├── Change Email button (reuses modal)
    └── Clear Email button

Express Backend
├── Middleware: extractEmailMiddleware
│   ├── Extract from X-User-Email header
│   ├── Validate format (regex, length)
│   └── Attach req.email
├── Middleware: validateEmailRequired (for POST/PATCH/DELETE)
│   └── Return 401 if missing
├── Optional: recordEmailSession middleware
│   └── Create EmailSession record (Prisma)
└── Route handlers
    └── All handlers have access to req.email

Database (PostgreSQL + Prisma)
├── EmailSession table (optional for Phase 1)
│   ├── id (primary key)
│   ├── email (string)
│   ├── sessionId (unique)
│   ├── createdAt (timestamp)
│   └── lastSeen (timestamp)
└── (ideas, votes, comments tables added in Phases 2 & 3)
```

---

## Key Takeaways

1. **Phase 1 is lightweight:** Email capture + localStorage + Express middleware. No complex auth flow.

2. **No signup flow:** User enters email on first action, continues immediately. Zero friction.

3. **Email is inferred from request:** Each request carries email in header. No server-side session needed.

4. **Moderation layer handles abuse:** Accept all emails in v1; verification can be added in v2.

5. **localStorage is sufficient for v1:** User's browser manages persistence. No Redis or session store needed.

6. **AUTH-03 (change email) is low-cost:** Implement in Phase 1 using same modal component.

7. **Database user table is deferred:** Add in Phase 2 when tracking authorship becomes necessary.

8. **Progressive enhancement:** Form fallback for noscript; email in body as backup.

---

**Next Steps:**

1. Review this research with team/stakeholder
2. Build frontend: authStore + EmailCaptureModal
3. Build backend: extractEmailMiddleware
4. Write unit + integration tests
5. Manual testing: localStorage persistence, email flow, settings
6. Deploy Phase 1 skeleton before Phase 2 starts

---

*Research completed: 2026-03-26*
*Phase 1 Ready for Implementation*
