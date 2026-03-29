---
wave: 2
phase: 7
depends_on:
  - 07-wave-1-foundation-PLAN.md
files_modified:
  - app/components/VoteButton.vue
  - app/components/CommentItem.vue
  - app/components/CommentThread.vue
  - app/components/EmailCaptureModal.vue
autonomous: true
---

# Plan 3: Vote Interactions & Detail Page Components

**Wave 2 Execution Note:**

This plan (2b) is the second half of Wave 2 (9 tasks total). Execute it only after
`07-wave-2a-components` is fully complete and smoke-tested. The components here
(VoteButton, CommentItem, Modal) rely on Button and Card styles established in 2a.

If any 2a task required fixes, verify those fixes are stable before starting 2b.

---

**Goal:** Refactor VoteButton, CommentItem, CommentThread, and EmailCaptureModal to use the Para Salvar design tokens. Replace the hardcoded blue (`#2563eb`) vote and action interactions with the teal/coral design language.

**Success Criteria:**
- VoteButton uses teal for the up-vote active state and coral for the down-vote active state
- Vote buttons are 44px minimum touch targets (currently ~28px — must be enlarged)
- CommentItem uses card surface and design-system typography; `border-left` accent uses primary color
- EmailCaptureModal uses the card + glass design pattern with correct font hierarchy
- Reply textarea uses the bottom-border input style from the design system
- No hardcoded `#2563eb` (blue), `#dc2626` (Tailwind red), or `#1e3a5f` (navy) in any component
- All interactive elements have visible focus-visible outlines

---

## Tasks

<task id="7-201">
  <title>Refactor VoteButton to use design tokens with correct touch targets</title>
  <description>
    The current `app/components/VoteButton.vue` uses tiny vote buttons (`padding: 0.2rem 0.4rem`,
    `font-size: 0.75rem`) that do not meet the 44px touch target requirement. The active state
    uses `#2563eb` (blue) which is off-brand.

    Replace the entire `<style scoped>` block:
    ```css
    .vote-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-1);
      min-width: var(--spacing-11); /* 44px */
    }

    .vote-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: transparent;
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-body-md);
      color: var(--color-on-surface-variant);
      transition: all var(--transition-fast);
      padding: 0;
      line-height: 1;
    }

    .vote-btn:hover:not(:disabled) {
      border-color: var(--color-primary);
      color: var(--color-primary);
      background-color: var(--color-surface-container-low);
    }

    .vote-btn:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    /* Up-vote active: teal (primary) */
    .vote-btn.active-up {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
      border-color: var(--color-primary);
      color: var(--color-on-primary);
    }

    /* Down-vote active: coral (secondary) */
    .vote-btn.active-down {
      background-color: var(--color-secondary);
      border-color: var(--color-secondary);
      color: var(--color-on-secondary);
    }

    .vote-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .vote-count {
      font-family: var(--font-label);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-label-lg);
      color: var(--color-on-surface);
      min-width: var(--spacing-6);
      text-align: center;
      line-height: 1;
    }
    ```

    Update the template to use the new active state classes:
    - Change `:class="{ active: currentVote === 1 }"` to `:class="{ 'active-up': currentVote === 1 }"`
    - Change `:class="{ active: currentVote === -1 }"` to `:class="{ 'active-down': currentVote === -1 }"`

    Also update the arrow symbols to use more accessible Unicode:
    - Up arrow: `▲` → `↑` or keep `▲` but ensure font renders it cleanly at the larger size
    - Down arrow: `▼` → `↓` or keep `▼`

    The `aria-label` attributes are already present and correctly use i18n (`$t('vote.up')`
    and `$t('vote.down')`) — preserve these.
  </description>
  <acceptance>
    - Vote buttons are exactly 44×44px (verify in DevTools box model)
    - Up-vote active state is teal gradient
    - Down-vote active state is coral (#a43c12)
    - Default state shows outline-variant border with muted color
    - Hover state shows primary teal border
    - Vote count uses Manrope/Inter label font, not system-ui
    - No #2563eb in component styles
    - aria-label attributes preserved for screen reader accessibility
  </acceptance>
  <effort>1.5 hours</effort>
  <owner>Developer</owner>
</task>

<task id="7-202">
  <title>Refactor CommentItem to use card surface and design tokens</title>
  <description>
    The current `app/components/CommentItem.vue` uses `background: #f9fafb` (near-white),
    `border-left: 2px solid #d1d5db` (gray), and `#2563eb` for reply button and actions.

    Replace the entire `<style scoped>` block:
    ```css
    .comment-item {
      padding: var(--spacing-4) var(--spacing-5);
      background-color: var(--color-surface-container-low);
      border-left: 3px solid var(--color-primary-fixed-dim); /* teal accent */
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
      transition: border-color var(--transition-fast);
    }

    .comment-item:hover {
      border-left-color: var(--color-primary);
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      margin-bottom: var(--spacing-3);
    }

    .author {
      font-family: var(--font-label);
      font-weight: var(--font-weight-semi-bold);
      color: var(--color-primary);
      font-size: var(--font-size-label-lg);
    }

    .date {
      font-family: var(--font-body);
      font-size: var(--font-size-body-sm);
      color: var(--color-on-surface-variant);
    }

    .comment-body {
      font-family: var(--font-body);
      font-size: var(--font-size-body-lg);
      line-height: var(--line-height-relaxed);
      color: var(--color-on-surface);
      margin-bottom: var(--spacing-3);
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .comment-footer {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-3);
    }

    .reply-btn {
      display: inline-flex;
      align-items: center;
      min-height: 36px;
      padding: var(--spacing-1) var(--spacing-3);
      background: transparent;
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-family: var(--font-label);
      font-size: var(--font-size-label-md);
      font-weight: var(--font-weight-medium);
      color: var(--color-on-surface-variant);
      transition: all var(--transition-fast);
    }

    .reply-btn:hover {
      background-color: var(--color-surface-container-high);
      border-color: var(--color-outline);
      color: var(--color-on-surface);
    }

    .reply-btn:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .reply-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
      margin: var(--spacing-3) 0;
      padding: var(--spacing-4);
      background-color: var(--color-surface-container-lowest);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-elevation-1);
    }

    .reply-form textarea {
      background-color: var(--color-surface-container-highest);
      border: none;
      border-bottom: 2px solid var(--color-outline-variant);
      border-radius: 0;
      padding: var(--spacing-3) var(--spacing-2);
      font-family: var(--font-body);
      font-size: var(--font-size-body-md);
      color: var(--color-on-surface);
      resize: vertical;
      transition: border-color var(--transition-fast);
      width: 100%;
    }

    .reply-form textarea:focus {
      outline: none;
      border-bottom-color: var(--color-secondary-container);
      border-bottom-width: 3px;
    }

    .reply-form textarea::placeholder {
      color: var(--color-on-surface-variant);
    }

    .reply-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .reply-actions button[type="submit"] {
      display: inline-flex;
      align-items: center;
      min-height: 36px;
      padding: var(--spacing-2) var(--spacing-5);
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
      color: var(--color-on-primary);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-family: var(--font-label);
      font-size: var(--font-size-label-md);
      font-weight: var(--font-weight-semi-bold);
      transition: all var(--transition-normal);
    }

    .reply-actions button[type="submit"]:hover:not(:disabled) {
      box-shadow: 0 8px 16px rgba(0, 101, 101, 0.2);
      transform: translateY(-1px);
    }

    .reply-actions button[type="submit"]:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .reply-actions button[type="submit"]:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    .error {
      font-family: var(--font-body);
      font-size: var(--font-size-body-sm);
      color: var(--color-error);
    }

    .comment-replies {
      margin-left: var(--spacing-8);
      margin-top: var(--spacing-4);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }
    ```
  </description>
  <acceptance>
    - Comment left border is teal-tinted (primary-fixed-dim: #76d6d5)
    - Author name is teal (#006565)
    - Date is on-surface-variant (#3e4949)
    - Reply button is ghost/outline style (no blue)
    - Reply form background is white card on light surface
    - Reply textarea uses bottom-border style
    - Submit reply button is teal gradient
    - Nested replies are indented with 2rem left margin
    - No #2563eb, #1d4ed8, or #dc2626 in component
  </acceptance>
  <effort>1.5 hours</effort>
  <owner>Developer</owner>
</task>

<task id="7-203">
  <title>Check and update CommentThread for design token consistency</title>
  <description>
    Review `app/components/CommentThread.vue` for any hardcoded styles that need updating.
    The component likely has a section header, an add-comment form, and the list of CommentItems.

    Audit the file and apply the following standards:
    - Section heading: use `var(--font-headline)`, `var(--font-size-headline-sm)`, weight 700
    - Add comment textarea: use the bottom-border input style (same as reply-form textarea above)
    - Submit button: use `ds-btn ds-btn-primary` global classes
    - Loading/empty states: use `var(--color-on-surface-variant)` for muted text
    - Any `border: 1px solid #...` → replace with `var(--color-outline-variant)` or remove per
      the "no harsh borders" guideline from design-tokens.json
    - Section container: use `padding: var(--spacing-6) 0` and `border-top: none` (use
      `margin-top: var(--spacing-8)` for separation instead of a border)

    If the file already has no scoped styles (relies on global styles or inline), document
    that no changes are required for this component.
  </description>
  <acceptance>
    - Comment section header uses Manrope font
    - Add comment form uses bottom-border input style
    - Submit button uses teal gradient (ds-btn-primary or equivalent)
    - No hardcoded blue, navy, or gray hex values
    - Loading and empty states are readable
  </acceptance>
  <effort>45 minutes</effort>
  <owner>Developer</owner>
</task>

<task id="7-204">
  <title>Refactor EmailCaptureModal to use card design and design tokens</title>
  <description>
    The current `app/components/EmailCaptureModal.vue` uses hardcoded styles: `border-radius: 8px`
    (should be xl), `background: #2563eb` submit button (off-brand), plain `border: 1px solid #ccc`.

    Replace the entire `<style scoped>` block:
    ```css
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(24, 28, 28, 0.6); /* var(--color-on-surface) with 60% opacity */
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: var(--backdrop-blur-sm);
      animation: fadeIn var(--transition-normal);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .modal-backdrop { animation: none; }
    }

    .modal {
      background-color: var(--color-surface-container-lowest);
      border-radius: var(--radius-xl);
      padding: var(--spacing-8);
      max-width: 480px;
      width: calc(100% - var(--spacing-8));
      box-shadow: var(--shadow-elevation-5);
      animation: slideUp var(--transition-normal);
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .modal { animation: none; }
    }

    .modal h2 {
      margin: 0 0 var(--spacing-2);
      font-family: var(--font-headline);
      font-size: var(--font-size-title-lg);
      font-weight: var(--font-weight-bold);
      color: var(--color-on-surface);
    }

    .modal p {
      font-family: var(--font-body);
      font-size: var(--font-size-body-md);
      color: var(--color-on-surface-variant);
      margin-bottom: var(--spacing-4);
      line-height: var(--line-height-relaxed);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
      margin-top: var(--spacing-4);
    }

    label {
      font-family: var(--font-label);
      font-size: var(--font-size-label-lg);
      font-weight: var(--font-weight-semi-bold);
      color: var(--color-on-surface);
      display: block;
      margin-bottom: var(--spacing-2);
    }

    input[type="email"] {
      display: block;
      width: 100%;
      background-color: var(--color-surface-container-highest);
      border: none;
      border-bottom: 2px solid var(--color-outline-variant);
      border-radius: 0;
      padding: var(--spacing-3) var(--spacing-2);
      font-family: var(--font-body);
      font-size: var(--font-size-body-lg);
      color: var(--color-on-surface);
      transition: border-color var(--transition-fast);
    }

    input[type="email"]:focus {
      outline: none;
      border-bottom-color: var(--color-secondary-container);
      border-bottom-width: 3px;
    }

    input[type="email"]::placeholder {
      color: var(--color-on-surface-variant);
    }

    .error {
      font-family: var(--font-body);
      font-size: var(--font-size-body-sm);
      color: var(--color-error);
      padding: var(--spacing-2) var(--spacing-3);
      background-color: var(--color-error-container);
      border-radius: var(--radius-sm);
    }

    .actions {
      display: flex;
      gap: var(--spacing-3);
      margin-top: var(--spacing-2);
      flex-wrap: wrap;
    }

    button[type="submit"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      flex: 1;
      padding: var(--spacing-3) var(--spacing-6);
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
      color: var(--color-on-primary);
      border: none;
      border-radius: var(--radius-lg);
      cursor: pointer;
      font-family: var(--font-label);
      font-size: var(--font-size-label-lg);
      font-weight: var(--font-weight-semi-bold);
      transition: all var(--transition-normal);
      box-shadow: 0 8px 20px rgba(0, 101, 101, 0.15);
    }

    button[type="submit"]:hover {
      box-shadow: 0 12px 28px rgba(0, 101, 101, 0.25);
      transform: translateY(-1px);
    }

    button[type="submit"]:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    button[type="button"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: var(--spacing-3) var(--spacing-5);
      background: transparent;
      border: 1px solid var(--color-outline-variant);
      border-radius: var(--radius-lg);
      cursor: pointer;
      font-family: var(--font-label);
      font-size: var(--font-size-label-md);
      color: var(--color-on-surface-variant);
      transition: all var(--transition-fast);
    }

    button[type="button"]:hover {
      background-color: var(--color-surface-container-low);
      color: var(--color-on-surface);
    }

    button[type="button"]:focus-visible {
      outline: 2px solid var(--color-outline);
      outline-offset: 2px;
    }
    ```

    No template changes required — the existing modal structure with `role="dialog"`,
    `aria-modal="true"`, and `aria-labelledby="modal-title"` is already correct for accessibility.
    Preserve Escape key handler and backdrop click dismiss.
  </description>
  <acceptance>
    - Modal has 1.5rem border radius (var(--radius-xl))
    - Submit button is teal gradient with 44px height
    - "Browse anyway" button is ghost/outline style
    - Email input uses bottom-border style
    - Backdrop has slight blur via backdrop-filter
    - Modal animates in with slideUp (unless prefers-reduced-motion)
    - Error message renders with light red background
    - Focus is trapped within modal on open (existing behavior preserved)
    - Escape key still dismisses modal
    - No #2563eb blue in component
  </acceptance>
  <effort>1.5 hours</effort>
  <owner>Developer</owner>
</task>

---

## Verification

After all tasks in this plan complete:

1. Open an idea detail page (http://localhost:3000/ideas/[any-id])
   - Vote buttons: 44×44px, teal up / coral down when active
   - Comments render with teal left border accent
   - Reply buttons are ghost/outline style

2. Click "Vote" on a logged-out session to trigger EmailCaptureModal
   - Modal slides up with animation
   - Email input has bottom-border style
   - Submit button is teal gradient
   - Dismiss works via Escape and backdrop click

3. Keyboard navigation test on detail page:
   - Tab to vote buttons → focus rings visible
   - Tab to reply button → focus ring visible
   - Tab to modal submit → focus ring visible

4. Mobile test at 375px:
   - Vote buttons stack vertically without overflow
   - Comment replies indent does not cause horizontal scroll
   - Modal fits within viewport with `width: calc(100% - 2rem)`
