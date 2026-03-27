---
wave: 1
depends_on: []
files_modified:
  - src/stores/authStore.ts (create)
  - src/components/EmailCaptureModal.vue (create)
  - src/composables/useEmailGate.ts (create)
  - src/pages/settings.vue (create)
  - src/app.vue (modify)
  - server/middleware/emailExtract.ts (create)
  - server/utils/emailValidation.ts (create)
  - server/routes/auth.ts (create)
  - tests/unit/authStore.test.ts (create)
  - tests/unit/emailValidation.test.ts (create)
  - tests/integration/emailFlow.test.ts (create)
  - nuxt.config.ts (modify)
  - package.json (modify)
autonomous: true
---

# Phase 1 Plan: Identity Foundation

## Overview

Capture and persist a user's email on first action so every subsequent interaction
is attributed without requiring a sign-up flow. This phase covers the entire
identity loop: modal trigger, Pinia store, localStorage persistence, Express
middleware, and user-facing settings to change or clear the email.

No user table is created in this phase. Email identity lives in the client and
is forwarded to the server as a request header. Phase 2 will persist users to
Postgres.

---

## Tasks

### Task 1: Nuxt Setup & Dependencies

**Objective:** Ensure the Nuxt project has all required packages and a clean
directory structure before any feature code is written.

<task>
<id>P1-T1</id>
<title>Nuxt project setup with Pinia and validation</title>
<instructions>
- [ ] If no Nuxt project exists yet, scaffold one:
      `npx nuxi@latest init . --force`
- [ ] Install runtime dependencies:
      `npm install pinia @pinia/nuxt vee-validate @vee-validate/rules yup`
- [ ] Install dev/test dependencies:
      `npm install -D vitest @vue/test-utils happy-dom @vitest/coverage-v8`
- [ ] Add `@pinia/nuxt` to the `modules` array in `nuxt.config.ts`:
      ```ts
      export default defineNuxtConfig({
        modules: ['@pinia/nuxt'],
      })
      ```
- [ ] Create directory structure (these may already exist in a Nuxt scaffold):
      ```
      src/
        stores/
        components/
        composables/
        pages/
      server/
        middleware/
        routes/
        utils/
      tests/
        unit/
        integration/
      ```
- [ ] Add a `vitest.config.ts` at the project root:
      ```ts
      import { defineConfig } from 'vitest/config'
      import vue from '@vitejs/plugin-vue'

      export default defineConfig({
        plugins: [vue()],
        test: {
          environment: 'happy-dom',
          globals: true,
        },
      })
      ```
- [ ] Add test script to `package.json`:
      `"test": "vitest run"` and `"test:watch": "vitest"`
- [ ] Verify dev server starts: `npm run dev`

Acceptance: `npm run dev` starts without errors. `npm test` exits cleanly
(zero tests = pass for now).
</instructions>
<must_have>true</must_have>
</task>

---

### Task 2: Email Pinia Store

**Objective:** Create the single source of truth for the user's email. This
store reads from and writes to localStorage so state survives page refreshes.

<task>
<id>P1-T2</id>
<title>authStore — email read/write/clear with localStorage sync</title>
<depends_on>P1-T1</depends_on>
<instructions>
Create `src/stores/authStore.ts`:

```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'ideahub:email'

export const useAuthStore = defineStore('auth', () => {
  // State
  const email = ref<string | null>(null)

  // Getters
  const isIdentified = computed(() => email.value !== null && email.value.length > 0)

  // Actions
  function init() {
    if (import.meta.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) email.value = stored
    }
  }

  function setEmail(newEmail: string) {
    email.value = newEmail.trim().toLowerCase()
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, email.value)
    }
  }

  function clearEmail() {
    email.value = null
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return { email, isIdentified, init, setEmail, clearEmail }
})
```

- [ ] Call `authStore.init()` in `src/app.vue` inside `onMounted` so the store
      hydrates from localStorage on every page load.
- [ ] In `src/app.vue` add:
      ```vue
      <script setup lang="ts">
      import { onMounted } from 'vue'
      import { useAuthStore } from '~/stores/authStore'
      const auth = useAuthStore()
      onMounted(() => auth.init())
      </script>
      ```

Acceptance: After entering an email, a hard refresh of the page restores
`auth.email` from localStorage without re-showing the modal.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 3: Email Validation Utility (shared)

**Objective:** A single validation function used by both the Vue component and
the Express middleware to enforce consistent rules.

<task>
<id>P1-T3</id>
<title>Email validation utility — format, length, no disposable placeholder</title>
<depends_on>P1-T1</depends_on>
<instructions>
Create `server/utils/emailValidation.ts`:

```ts
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_LENGTH = 5
const MAX_LENGTH = 254

export interface ValidationResult {
  valid: boolean
  reason?: string
}

export function validateEmail(raw: unknown): ValidationResult {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { valid: false, reason: 'Email is required.' }
  }

  const email = raw.trim().toLowerCase()

  if (email.length < MIN_LENGTH) {
    return { valid: false, reason: `Email must be at least ${MIN_LENGTH} characters.` }
  }

  if (email.length > MAX_LENGTH) {
    return { valid: false, reason: `Email must be ${MAX_LENGTH} characters or fewer.` }
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, reason: 'Email format is invalid.' }
  }

  return { valid: true }
}
```

NOTE: For the Vue component, import this same function via a path alias or
duplicate the regex logic inline if tree-shaking from server/ is blocked by
the Nuxt build. Prefer a shared `utils/emailValidation.ts` at the project root
and import from both locations if the project structure allows it.

- [ ] If the Nuxt build cannot import from `server/`, copy the function to
      `src/utils/emailValidation.ts` and keep both files in sync manually
      for Phase 1. Consolidate in Phase 2.

Acceptance: Unit tests in Task 7 pass against this module.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 4: Email Capture Modal Component

**Objective:** A Vue modal that collects and validates the user's email. It
blocks gated actions until an email is submitted or the user explicitly
cancels (browse-only mode).

<task>
<id>P1-T4</id>
<title>EmailCaptureModal.vue — form, validation, Pinia integration</title>
<depends_on>P1-T2, P1-T3</depends_on>
<instructions>
Create `src/components/EmailCaptureModal.vue`:

```vue
<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click.self="onDismiss">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Enter your email to continue</h2>
        <p>No account needed. We use your email to attribute your contributions.</p>

        <form @submit.prevent="onSubmit" novalidate>
          <label for="email-input">Email address</label>
          <input
            id="email-input"
            v-model="inputEmail"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            :value="prefill"
            autofocus
          />
          <span v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</span>

          <div class="actions">
            <button type="submit">Continue</button>
            <button type="button" @click="onDismiss">Browse without saving</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '~/stores/authStore'
import { validateEmail } from '~/utils/emailValidation'

const props = defineProps<{
  visible: boolean
  prefill?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', email: string): void
}>()

const auth = useAuthStore()
const inputEmail = ref(props.prefill ?? '')
const errorMsg = ref('')

watch(() => props.prefill, (val) => { inputEmail.value = val ?? '' })

function onSubmit() {
  const result = validateEmail(inputEmail.value)
  if (!result.valid) {
    errorMsg.value = result.reason ?? 'Invalid email.'
    return
  }
  errorMsg.value = ''
  auth.setEmail(inputEmail.value)
  emit('saved', inputEmail.value)
  emit('close')
}

function onDismiss() {
  emit('close')
}
</script>
```

- [ ] Add minimal scoped styles (or use Tailwind if already in the project)
      sufficient to make the modal usable. Full polish is deferred.
- [ ] The modal must be keyboard accessible: Tab cycles through inputs and
      buttons; Escape key calls `onDismiss`.
      Add in `<script setup>`:
      ```ts
      import { onMounted, onUnmounted } from 'vue'
      function onKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') onDismiss()
      }
      onMounted(() => window.addEventListener('keydown', onKeydown))
      onUnmounted(() => window.removeEventListener('keydown', onKeydown))
      ```

Acceptance: Submitting a valid email closes the modal and stores the value in
the Pinia store and localStorage. Submitting an invalid email shows an inline
error. Escape/dismiss closes without saving.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 5: useEmailGate Composable

**Objective:** A reusable composable that any page or component can call to
gate an action behind email capture. This keeps modal trigger logic out of
individual components.

<task>
<id>P1-T5</id>
<title>useEmailGate composable — wraps modal visibility for gated actions</title>
<depends_on>P1-T4</depends_on>
<instructions>
Create `src/composables/useEmailGate.ts`:

```ts
import { ref } from 'vue'
import { useAuthStore } from '~/stores/authStore'

export function useEmailGate() {
  const auth = useAuthStore()
  const modalVisible = ref(false)
  let pendingCallback: (() => void) | null = null

  /**
   * Call this before any action that requires identity.
   * If the user is already identified, runs `action` immediately.
   * Otherwise shows the modal; runs `action` after email is saved.
   */
  function requireEmail(action: () => void) {
    if (auth.isIdentified) {
      action()
      return
    }
    pendingCallback = action
    modalVisible.value = true
  }

  function onModalSaved() {
    modalVisible.value = false
    if (pendingCallback) {
      pendingCallback()
      pendingCallback = null
    }
  }

  function onModalClose() {
    modalVisible.value = false
    pendingCallback = null
  }

  return { modalVisible, requireEmail, onModalSaved, onModalClose }
}
```

Usage example in any page component:
```vue
<script setup lang="ts">
import { useEmailGate } from '~/composables/useEmailGate'
const { modalVisible, requireEmail, onModalSaved, onModalClose } = useEmailGate()

function handleCreateIdea() {
  requireEmail(() => {
    // actual create idea logic here
  })
}
</script>

<template>
  <button @click="handleCreateIdea">Create Idea</button>
  <EmailCaptureModal
    :visible="modalVisible"
    @saved="onModalSaved"
    @close="onModalClose"
  />
</template>
```

- [ ] Wire `useEmailGate` into every existing action that requires identity:
      create idea, vote, comment. For each, replace direct action calls with
      `requireEmail(() => originalAction())`.

Acceptance: Unauthenticated user clicking a gated button sees the modal. After
saving email, the original action executes. Authenticated user clicking the
same button skips the modal entirely.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 6: Settings Page (AUTH-03)

**Objective:** Give the user a dedicated place to change or clear their email
without requiring them to find a gated action.

<task>
<id>P1-T6</id>
<title>src/pages/settings.vue — change and clear email</title>
<depends_on>P1-T4</depends_on>
<instructions>
Create `src/pages/settings.vue`:

```vue
<template>
  <div class="settings-page">
    <h1>Settings</h1>

    <section>
      <h2>Your Identity</h2>

      <div v-if="auth.isIdentified">
        <p>Current email: <strong>{{ auth.email }}</strong></p>
        <button @click="openChangeModal">Change Email</button>
        <button @click="clearEmail">Clear Email (sign out)</button>
      </div>

      <div v-else>
        <p>You have not set an email yet.</p>
        <button @click="openChangeModal">Set Email</button>
      </div>
    </section>

    <EmailCaptureModal
      :visible="modalVisible"
      :prefill="auth.email ?? ''"
      @saved="onModalSaved"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/authStore'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'

const auth = useAuthStore()
const modalVisible = ref(false)

function openChangeModal() {
  modalVisible.value = true
}

function onModalSaved() {
  modalVisible.value = false
}

function onModalClose() {
  modalVisible.value = false
}

function clearEmail() {
  auth.clearEmail()
}
</script>
```

- [ ] Add a link to `/settings` in the global navigation (header or nav bar).
- [ ] Verify the route is accessible at `/settings` in the running app.

Acceptance: Authenticated user visits /settings, sees their email, can change
it (new value persists after refresh), and can clear it (modal reappears on
next gated action).
</instructions>
<must_have>true</must_have>
</task>

---

### Task 7: Express Middleware — Email Extraction

**Objective:** Extract and validate the user's email from the `X-User-Email`
request header so every backend handler can access `req.userEmail` without
repeating header-parsing logic.

<task>
<id>P1-T7</id>
<title>server/middleware/emailExtract.ts — extract X-User-Email header</title>
<depends_on>P1-T3</depends_on>
<instructions>
Create `server/middleware/emailExtract.ts`:

```ts
import { Request, Response, NextFunction } from 'express'
import { validateEmail } from '../utils/emailValidation'

declare global {
  namespace Express {
    interface Request {
      userEmail: string | null
    }
  }
}

export function emailExtractMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const raw = req.headers['x-user-email']
  const headerValue = Array.isArray(raw) ? raw[0] : raw

  const result = validateEmail(headerValue)
  req.userEmail = result.valid ? (headerValue as string).trim().toLowerCase() : null

  next()
}
```

Register globally in the Express app entry point:
```ts
import { emailExtractMiddleware } from './middleware/emailExtract'
app.use(emailExtractMiddleware)
```

Frontend must send the header on every mutating request:
```ts
// In a shared API utility / $fetch defaults
const auth = useAuthStore()
const headers: Record<string, string> = {}
if (auth.email) {
  headers['X-User-Email'] = auth.email
}
await $fetch('/api/ideas', { method: 'POST', headers, body: payload })
```

- [ ] Add a shared `src/utils/apiClient.ts` (or update an existing one) that
      automatically injects the `X-User-Email` header from the Pinia store on
      every non-GET request.
- [ ] Verify with a manual curl that the header is forwarded:
      `curl -X POST http://localhost:3001/api/ideas \
        -H "X-User-Email: test@example.com" \
        -H "Content-Type: application/json" \
        -d '{}' -v`
      Confirm `req.userEmail` is populated in server logs.

Acceptance: A request with a valid `X-User-Email` header sets `req.userEmail`
to the trimmed, lowercased value. A request with a missing or malformed header
sets `req.userEmail` to `null` and does not crash the server.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 8: Auth Route (Optional Health Check Endpoint)

**Objective:** Expose a lightweight endpoint that confirms the email
infrastructure is wired end-to-end. Useful for integration testing and future
debugging.

<task>
<id>P1-T8</id>
<title>server/routes/auth.ts — /api/auth/me endpoint</title>
<depends_on>P1-T7</depends_on>
<instructions>
Create `server/routes/auth.ts`:

```ts
import { Router, Request, Response } from 'express'

const router = Router()

/**
 * GET /api/auth/me
 * Returns the email extracted by the middleware, or null.
 * Used for integration tests and debugging only. Not user-facing in Phase 1.
 */
router.get('/me', (req: Request, res: Response) => {
  res.json({ email: req.userEmail })
})

export default router
```

Register in the Express app:
```ts
import authRouter from './routes/auth'
app.use('/api/auth', authRouter)
```

- [ ] Verify manually:
      `curl http://localhost:3001/api/auth/me \
        -H "X-User-Email: hello@example.com"`
      Expected: `{"email":"hello@example.com"}`

      `curl http://localhost:3001/api/auth/me`
      Expected: `{"email":null}`

Acceptance: Both curl commands return the expected JSON. Server does not error.
</instructions>
<must_have>false</must_have>
</task>

---

### Task 9: Unit Tests

**Objective:** Automated tests for the two most critical units: the email
validation function and the auth Pinia store.

<task>
<id>P1-T9</id>
<title>Unit tests — emailValidation and authStore</title>
<depends_on>P1-T2, P1-T3</depends_on>
<instructions>
Create `tests/unit/emailValidation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateEmail } from '../../server/utils/emailValidation'

describe('validateEmail', () => {
  it('accepts a valid email', () => {
    expect(validateEmail('user@example.com').valid).toBe(true)
  })

  it('rejects empty string', () => {
    expect(validateEmail('').valid).toBe(false)
  })

  it('rejects null', () => {
    expect(validateEmail(null).valid).toBe(false)
  })

  it('rejects missing @ symbol', () => {
    expect(validateEmail('notanemail').valid).toBe(false)
  })

  it('rejects email over 254 characters', () => {
    const long = 'a'.repeat(245) + '@example.com'
    expect(validateEmail(long).valid).toBe(false)
  })

  it('trims and lowercases in the valid path', () => {
    expect(validateEmail('  USER@EXAMPLE.COM  ').valid).toBe(true)
  })
})
```

Create `tests/unit/authStore.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../src/stores/authStore'

// Mock localStorage
const storageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
vi.stubGlobal('localStorage', storageMock)

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    storageMock.clear()
  })

  it('starts with null email', () => {
    const auth = useAuthStore()
    expect(auth.email).toBeNull()
    expect(auth.isIdentified).toBe(false)
  })

  it('setEmail stores value and marks isIdentified', () => {
    const auth = useAuthStore()
    auth.setEmail('user@example.com')
    expect(auth.email).toBe('user@example.com')
    expect(auth.isIdentified).toBe(true)
  })

  it('setEmail persists to localStorage', () => {
    const auth = useAuthStore()
    auth.setEmail('user@example.com')
    expect(storageMock.getItem('ideahub:email')).toBe('user@example.com')
  })

  it('clearEmail resets state and removes from localStorage', () => {
    const auth = useAuthStore()
    auth.setEmail('user@example.com')
    auth.clearEmail()
    expect(auth.email).toBeNull()
    expect(auth.isIdentified).toBe(false)
    expect(storageMock.getItem('ideahub:email')).toBeNull()
  })

  it('init hydrates from localStorage', () => {
    storageMock.setItem('ideahub:email', 'stored@example.com')
    const auth = useAuthStore()
    auth.init()
    expect(auth.email).toBe('stored@example.com')
  })
})
```

- [ ] Run `npm test` — all tests must pass.

Acceptance: `npm test` exits 0. All 10+ assertions pass.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 10: Integration Test — Email Flow Frontend to Backend

**Objective:** Confirm the full path: localStorage → Pinia store → request
header → Express middleware → `req.userEmail`.

<task>
<id>P1-T10</id>
<title>Integration test — email flows from client to server</title>
<depends_on>P1-T7, P1-T8, P1-T9</depends_on>
<instructions>
Create `tests/integration/emailFlow.test.ts`:

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import express from 'express'
import request from 'supertest'
import { emailExtractMiddleware } from '../../server/middleware/emailExtract'
import authRouter from '../../server/routes/auth'

// Install supertest: npm install -D supertest @types/supertest

const app = express()
app.use(emailExtractMiddleware)
app.use('/api/auth', authRouter)

describe('Email flow integration', () => {
  it('returns email when valid X-User-Email header is sent', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('X-User-Email', 'test@example.com')

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('test@example.com')
  })

  it('returns null when no header is sent', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(200)
    expect(res.body.email).toBeNull()
  })

  it('returns null when header is malformed', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('X-User-Email', 'not-an-email')

    expect(res.status).toBe(200)
    expect(res.body.email).toBeNull()
  })
})
```

- [ ] Install supertest: `npm install -D supertest @types/supertest`
- [ ] Run `npm test` — all integration tests pass alongside unit tests.

Acceptance: All three integration assertions pass. The header-to-middleware
pipeline is verified end-to-end without a running server.
</instructions>
<must_have>true</must_have>
</task>

---

### Task 11: Manual Smoke Test Checklist

**Objective:** Final human walkthrough before declaring Phase 1 done.

<task>
<id>P1-T11</id>
<title>Manual smoke test — run app end-to-end in browser</title>
<depends_on>P1-T1, P1-T2, P1-T3, P1-T4, P1-T5, P1-T6, P1-T7, P1-T8, P1-T9, P1-T10</depends_on>
<instructions>
Run both servers:
- `npm run dev` (Nuxt frontend, default: http://localhost:3000)
- Start Express server (default: http://localhost:3001)

Walk through each scenario manually:

**Scenario A — First visit, no email**
- [ ] Open app in a private/incognito window (clear localStorage)
- [ ] Click a gated action (Create Idea, Vote, or Comment)
- [ ] Modal appears
- [ ] Submit an invalid email — error message shown
- [ ] Submit a valid email — modal closes, action proceeds

**Scenario B — Persistence across refresh**
- [ ] Reload the page
- [ ] Click a gated action again
- [ ] Modal does NOT appear — email was restored from localStorage
- [ ] Open DevTools > Application > localStorage
- [ ] Key `ideahub:email` is present with correct value

**Scenario C — Change email via settings**
- [ ] Navigate to /settings
- [ ] Current email is displayed
- [ ] Click "Change Email" — modal opens pre-filled with current email
- [ ] Change email to a new address and save
- [ ] Settings page now shows new email
- [ ] Reload page — new email persists

**Scenario D — Clear email**
- [ ] On /settings, click "Clear Email"
- [ ] `ideahub:email` key is gone from localStorage
- [ ] Click a gated action — modal reappears

**Scenario E — Browse without saving**
- [ ] In a fresh incognito window, click a gated action
- [ ] Modal appears — click "Browse without saving"
- [ ] Modal closes without storing anything
- [ ] User can browse read-only content freely

Acceptance: All five scenarios behave as described with no console errors.
</instructions>
<must_have>true</must_have>
</task>

---

## Verification

### AUTH-01: First action prompts for email
- [ ] User lands on home page — no email in localStorage
- [ ] User clicks "Create Idea" (or Vote / Comment)
- [ ] Email capture modal appears immediately
- [ ] Modal overlays the page and blocks interaction with the underlying content
- [ ] User cannot complete the action without submitting a valid email or explicitly dismissing

### AUTH-02: Email persisted to localStorage
- [ ] User enters a valid email in the modal and submits
- [ ] Modal closes
- [ ] Open DevTools > Application > Local Storage > verify key `ideahub:email` exists
- [ ] User refreshes the page
- [ ] `authStore.email` is populated from localStorage (no modal re-shown)
- [ ] Subsequent gated actions proceed without re-prompting

### AUTH-03: User can change/clear their email
- [ ] User navigates to `/settings`
- [ ] Current email is displayed on the page
- [ ] "Change Email" button opens the modal pre-filled with current email
- [ ] User edits the email and saves — new value appears on settings page
- [ ] New email is reflected in next API request header
- [ ] "Clear Email" button removes `ideahub:email` from localStorage
- [ ] Pinia store `isIdentified` becomes `false`
- [ ] Clicking a gated action after clearing shows the modal again

---

## Must-Haves

These are non-deferrable in Phase 1. Phase 1 is not done until every item
below is checked.

- [ ] `src/stores/authStore.ts` exists and exports `useAuthStore`
- [ ] Email stored under key `ideahub:email` in localStorage
- [ ] Email restored from localStorage on `app.vue` `onMounted`
- [ ] `src/components/EmailCaptureModal.vue` exists and renders correctly
- [ ] Modal appears before create, vote, and comment actions (via `useEmailGate`)
- [ ] Modal validates email on submit: required, valid format, 5–254 chars
- [ ] Inline error message displayed for invalid input
- [ ] Modal closeable without saving (browse-only mode)
- [ ] Escape key closes the modal
- [ ] `src/composables/useEmailGate.ts` gates actions behind identity check
- [ ] `src/pages/settings.vue` exists and accessible at `/settings`
- [ ] Settings page shows current email (or "not set" state)
- [ ] Settings page allows changing email via modal (pre-filled)
- [ ] Settings page allows clearing email
- [ ] `server/utils/emailValidation.ts` exists with `validateEmail` function
- [ ] `server/middleware/emailExtract.ts` registered globally on the Express app
- [ ] All mutating API requests include `X-User-Email` header from Pinia store
- [ ] `req.userEmail` is populated (or `null`) on every Express request
- [ ] Unit tests pass: `validateEmail` and `authStore` (≥10 assertions)
- [ ] Integration tests pass: header → middleware → response (3 scenarios)
- [ ] `npm test` exits 0 with no failures
- [ ] Manual smoke test (Task 11): all 5 scenarios pass

Anything not in this list can be deferred to Phase 2.
