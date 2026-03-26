# Manual Smoke Test Checklist — Phase 1

## Pre-conditions
- Run `npm run dev` (Nuxt frontend: http://localhost:3000)
- Start Express server on port 3001 (to be scaffolded in Phase 2 with full server.ts)
- Use a private/incognito browser window to ensure clean localStorage

---

## Scenario A — First visit, no email
- [ ] Open app in private/incognito window (clean localStorage)
- [ ] Click "Create Idea", "Vote", or "Comment" button
- [ ] Modal appears with "Enter your email to continue"
- [ ] Submit invalid email (e.g. "notanemail") — inline error message shown
- [ ] Submit valid email (e.g. "user@example.com") — modal closes, action feedback shown

## Scenario B — Persistence across refresh
- [ ] After Scenario A, reload the page (F5 or Cmd+R)
- [ ] Click a gated action again
- [ ] Modal does NOT appear — email was restored from localStorage
- [ ] Open DevTools → Application → Local Storage
- [ ] Key `ideahub:email` is present with correct value

## Scenario C — Change email via settings
- [ ] Navigate to /settings
- [ ] Current email is displayed on page
- [ ] Click "Change Email" — modal opens pre-filled with current email
- [ ] Change to a new email address and save
- [ ] Settings page shows updated email
- [ ] Reload page — new email persists in localStorage

## Scenario D — Clear email
- [ ] On /settings, click "Clear Email (sign out)"
- [ ] `ideahub:email` key is removed from localStorage (check DevTools)
- [ ] Click a gated action on home page — modal reappears

## Scenario E — Browse without saving
- [ ] Open fresh incognito window, click a gated action
- [ ] Modal appears — click "Browse without saving"
- [ ] Modal closes, nothing saved to localStorage
- [ ] User can navigate and browse read-only content freely

---

## Acceptance
All five scenarios must behave as described with no console errors.

## Status
- Checklist documented: ✅
- Manual execution: To be performed before Phase 1 sign-off
