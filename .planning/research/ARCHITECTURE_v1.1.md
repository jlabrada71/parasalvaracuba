# Architecture Research: v1.1 Markdown & Stitch Design System Integration

**Project:** IdeaHub / ParaSalvaraCuba
**Milestone:** v1.1 (Polish & Design)
**Date:** March 2026
**Confidence:** HIGH for markdown, MEDIUM for Stitch (design decision pending)

---

## Executive Summary

v1.1 requires two major architectural changes:

1. **Markdown Support:** Add rich text editing for ideas and comments (client-side editor, server-side storage as raw Markdown, client-side rendering with sanitization)
2. **Stitch Design System Integration:** Replace ad-hoc inline styles with design tokens and reusable components

Both changes are **low-risk architectural additions** that don't require restructuring existing API or database schema. Markdown support is built entirely in the frontend and rendering layer. Stitch integration follows standard CSS variable patterns already compatible with Nuxt.

---

## Part 1: Markdown Architecture

### 1.1 Where Does Parsing Happen?

**Decision: Client-side editing, server-side storage, client-side rendering**

```
User Input → MD Editor (Client) → Raw Markdown → API → Database
                                                         ↓
Display → HTML (DOMPurify) ← Marked.js + DOMPurify ← Raw Markdown ← Database
```

**Rationale:**
- **Client-side editing** keeps UI responsive; no server round-trip for preview
- **Store raw Markdown** (not pre-rendered HTML) to preserve editability and allow future rendering updates
- **Client-side rendering** (marked.js + DOMPurify) keeps backend simple and allows version-agnostic rendering updates
- **No server-side parsing initially** keeps Node.js API lean; can add server rendering later if needed (e.g., for email previews)

**Trade-offs:**
- ✓ Simple backend (no dependencies on marked/sanitizer)
- ✓ Frontend controls UX (preview, editing, rendering)
- ✓ Can update rendering logic without API changes
- ✗ Each client parses independently (minimal performance impact for <2KB comments)
- ✗ Server can't validate Markdown syntax (validation is client-side responsibility)

### 1.2 Components & Data Flow

#### New Components Needed

```
MarkdownEditor (NEW)
├── Usage: ideas/create.vue, ideas/[id].vue (edit form), CommentItem.vue (reply form)
├── Props: modelValue (Markdown string), placeholder
├── Features:
│   ├── Split-pane editing (Markdown left, preview right)
│   ├── Toolbar for common formatting (bold, italic, lists, code blocks)
│   ├── Character count / warnings
│   ├── Character limit enforcement (200 for title, 5000 for description, 2000 for comments)
├── Emits: update:modelValue

MarkdownRenderer (NEW)
├── Usage: IdeaCard (summary), CommentItem (display), ideas/[id].vue (detail display)
├── Props: markdown (string), maxLength (for truncation)
├── Features:
│   ├── Safe HTML rendering via marked.js + DOMPurify
│   ├── Syntax highlighting for code blocks (optional, low priority)
│   ├── Link sanitization (no javascript: protocol)
│   ├── Heading hierarchy preserved
├── Emits: none (read-only)
```

**Implementation Notes:**
- MarkdownEditor: Use `md-editor-v3` or Tiptap Vue 3 component
- MarkdownRenderer: Custom component wrapping marked.js + DOMPurify
- Both components should integrate with Stitch design tokens (button colors, font sizes, etc.)

#### Component Modifications

| Component | Change | Rationale |
|-----------|--------|-----------|
| **IdeaCard.vue** | Display Markdown summary instead of plain text | Rich formatting visible in list |
| **CommentItem.vue** | Display Markdown in comment body; add MarkdownEditor for replies | Consistent editing experience |
| **ideas/create.vue** | Replace textarea with MarkdownEditor | Improved UX for longer descriptions |
| **ideas/[id].vue** | Replace plain text display with MarkdownRenderer for title/description; edit form uses MarkdownEditor | Better readability |
| **CommentThread.vue** | No changes (parent of CommentItem; inherits improvements) | Flows from CommentItem changes |

### 1.3 Data Storage Strategy

#### Database Schema (No Changes Required)

Current schema already supports Markdown:
```sql
-- ideas table (existing)
CREATE TABLE ideas (
  id UUID PRIMARY KEY,
  title VARCHAR(255),          -- Plain text (no Markdown needed for titles initially)
  description TEXT,             -- STORE AS RAW MARKDOWN (currently plain text)
  ...
);

-- comments table (existing)
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  content TEXT,                 -- STORE AS RAW MARKDOWN (currently plain text)
  ...
);
```

**Action:** No migration needed. Start accepting Markdown in description/content fields immediately. Old plain text continues to work (Marked treats it as valid Markdown).

#### Backward Compatibility

- Existing plain text in database renders perfectly via marked.js (it's valid Markdown)
- Users can edit old content; Markdown syntax added on next edit
- No ETL needed

### 1.4 Rendering Pipeline

#### Frontend Rendering Flow

```javascript
// MarkdownRenderer.vue
<script setup>
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{ markdown: string }>()

const html = computed(() => {
  // Step 1: Parse Markdown to HTML
  const raw = marked.parse(props.markdown)

  // Step 2: Sanitize for XSS prevention
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    KEEP_CONTENT: true
  })
})
</script>

<template>
  <div class="markdown-rendered" v-html="html" />
</template>

<style scoped>
.markdown-rendered {
  /* Stitch design tokens applied here */
  line-height: 1.6;
  font-family: var(--font-family-body);
  color: var(--color-text-primary);
}

.markdown-rendered h1,
.markdown-rendered h2,
.markdown-rendered h3 {
  font-family: var(--font-family-heading);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.markdown-rendered a {
  color: var(--color-primary);
  text-decoration: underline;
}

.markdown-rendered code {
  background: var(--color-bg-secondary);
  padding: 0.2em 0.4em;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-mono);
  font-size: 0.9em;
}

.markdown-rendered pre {
  background: var(--color-bg-secondary);
  padding: 1rem;
  border-radius: var(--border-radius-md);
  overflow-x: auto;
}
</style>
```

#### Marked Configuration

```javascript
// utils/markdown.ts
import { marked } from 'marked'

export function setupMarked() {
  marked.setOptions({
    breaks: true,           // \n → <br> (better for user-pasted text)
    gfm: true,              // GitHub Flavored Markdown (tables, strikethrough, task lists)
    pedantic: false,
    smartLists: true,
    smartypants: false      // Don't convert quotes/dashes (preserve user intent)
  })
}

export function renderMarkdown(markdown: string): string {
  // This function is called by MarkdownRenderer
  return marked.parse(markdown)
}
```

#### Security: DOMPurify Configuration

```javascript
// utils/sanitize.ts
import DOMPurify from 'dompurify'

export const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'hr',
    'strong', 'em', 'u', 'del',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote',
    'code', 'pre',
    'a'
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG)
}
```

**Note:** This whitelist is conservative. Intentionally excludes:
- Images (img, svg) — prevent external image requests
- Event handlers — prevent inline onclick/onerror
- Scripts, iframes — obvious XSS vectors
- Style attributes — consistent with design tokens approach

### 1.5 Editor Component Selection

**Recommendation: md-editor-v3** (not Tiptap)

| Criteria | md-editor-v3 | Tiptap | Custom Editor |
|----------|-------------|--------|---------------|
| **Simplicity** | ✓ Markdown-specific, out-of-the-box | ✗ Headless, requires setup | ✗ Lots of work |
| **Vue 3 Support** | ✓✓ Native | ✓✓ Native | ✓ Simple |
| **Split-pane preview** | ✓✓ Built-in | ✗ Custom implementation needed | ✗ Custom |
| **Bundle size** | Medium (~80KB gzip) | Large (~150KB gzip) | Small |
| **Learning curve** | Low (Markdown syntax) | Medium (ProseMirror concepts) | N/A |
| **Maintenance** | Active, well-maintained | Very active; huge ecosystem | Solo dev burden |
| **Design customization** | ✓ CSS variables support | ✓✓ Very flexible | N/A |
| **Dark mode** | ✓ Built-in themes | ✓ Requires setup | ✓ Easy |
| **Maturity** | HIGH (production-ready) | HIGH (production-ready) | MEDIUM (unproven) |

**Decision: Use md-editor-v3**

```bash
npm install md-editor-v3
```

**Configuration:**
```javascript
<template>
  <MDEditor
    v-model="markdown"
    :theme="isDarkMode ? 'dark' : 'light'"
    :autoFocus="true"
    :toolbars="[
      'bold', 'italic', 'h1', 'h2', 'h3',
      'quote', 'ul', 'ol', 'code',
      'link', 'codeBlock'
    ]"
    :pageFullScreen="false"
    :preview="true"
    :previewOnly="isReadOnly"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { MDEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const props = defineProps<{ modelValue: string; isReadOnly?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const markdown = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isDarkMode = computed(() => /* check user's dark mode pref */)

function handleChange(text: string) {
  markdown.value = text
}
</script>

<style scoped>
/* Integrate Stitch tokens */
:deep(.md-editor) {
  border-color: var(--color-border);
  background: var(--color-bg-primary);
}

:deep(.md-editor-toolbar) {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
}

:deep(.md-editor-toolbar button) {
  color: var(--color-text-primary);
}

:deep(.md-editor-toolbar button:hover) {
  background: var(--color-bg-hover);
}
</style>
```

---

## Part 2: Stitch Design System Integration

### 2.1 What is Stitch?

Stitch is a **CSS-in-JS design system framework** with near-zero runtime overhead, enabling design tokens to be defined once and applied across components consistently.

**Key features:**
- Design tokens (colors, typography, spacing, shadows, radii)
- Semantic naming (e.g., `--color-primary`, not `--color-blue-500`)
- Dark/light mode support via CSS variables
- Theming without component rewrites
- Variant support (size, state, emotion variants on components)

**Reference:** [Stitches.dev](https://stitches.dev/)

### 2.2 Integration Architecture

**Goal:** Replace hard-coded colors and sizes in Vue components with CSS variables (design tokens) from Stitch.

**Current state (v1.0):**
```vue
<style scoped>
.idea-title {
  color: #1e3a5f;           /* Hard-coded blue */
  font-size: 1.05rem;       /* Magic number */
  font-weight: 600;         /* Magic number */
}
</style>
```

**Target state (v1.1):**
```vue
<style scoped>
.idea-title {
  color: var(--color-primary);      /* Design token */
  font-size: var(--font-size-lg);   /* Design token */
  font-weight: var(--font-weight-semibold);
}
</style>
```

### 2.3 Design Token System

#### Token Definition

Create **`app/assets/styles/tokens.css`**:

```css
:root {
  /* Colors - Semantic */
  --color-primary: #2563eb;
  --color-secondary: #6b7280;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Colors - Backgrounds */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --color-bg-hover: #e5e7eb;
  --color-bg-disabled: #d1d5db;

  /* Colors - Text */
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-text-inverse: #ffffff;

  /* Colors - Borders */
  --color-border: #e5e7eb;
  --color-border-secondary: #d1d5db;

  /* Typography */
  --font-family-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-family-mono: "Courier New", Courier, monospace;
  --font-family-heading: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Borders & Shapes */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 1rem;

  --border-width: 1px;
  --border-width-thick: 2px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #3b82f6;
    --color-secondary: #d1d5db;
    --color-text-primary: #f3f4f6;
    --color-text-secondary: #d1d5db;
    --color-text-tertiary: #9ca3af;
    --color-bg-primary: #111827;
    --color-bg-secondary: #1f2937;
    --color-bg-tertiary: #374151;
    --color-border: #4b5563;
    --color-border-secondary: #6b7280;
  }
}
```

#### Integration Points

**In `app.vue` or `nuxt.config.ts`:**
```typescript
export default defineNuxtConfig({
  css: ['~/assets/styles/tokens.css'],
  // ... rest of config
})
```

**In any component:**
```vue
<style scoped>
.button {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.button:hover {
  background: var(--color-primary-hover);
}
</style>
```

### 2.4 Dark Mode Implementation

#### Option A: Media Query (Recommended for v1.1)

Dark mode activated via `prefers-color-scheme: dark` (CSS will automatically swap variables).

**Setup:**
```javascript
// utils/darkMode.ts
export function initDarkMode() {
  // Option 1: Automatic (respects system preference)
  // CSS handles it via @media (prefers-color-scheme: dark)

  // Option 2: Manual toggle (optional for v1.1+)
  // Requires setting `data-theme="dark"` on root element
  // and additional CSS selectors
}
```

#### Option B: Class-based (For manual toggle, v1.1+ if needed)

```css
:root {
  /* Light mode (default) */
}

[data-theme="dark"] {
  --color-primary: #3b82f6;
  --color-text-primary: #f3f4f6;
  /* ... all overrides */
}
```

**Rationale:** Use media query initially (automatic). Manual toggle can be added in v1.2 if users request it.

### 2.5 Component Replacement Strategy

**Phased approach (gradual, not big-bang):**

#### Phase 1: Core Components (Immediate)

Apply Stitch tokens to existing components without structural changes:

| Component | Changes | Effort |
|-----------|---------|--------|
| **IdeaCard.vue** | Replace `color: #1e3a5f` with `var(--color-primary)`, sizes with tokens | 10 min |
| **CommentItem.vue** | Replace hard-coded colors/sizes | 15 min |
| **VoteButton.vue** | Replace button styles with token variables | 10 min |
| **EmailCaptureModal.vue** | Replace modal background, button colors | 10 min |

**Effort:** 1-2 hours total. No component rewrites.

#### Phase 2: New MarkdownEditor/Renderer Components

Built with Stitch tokens from the start:
- MarkdownEditor styling uses design tokens
- MarkdownRenderer styling uses design tokens
- Requires less refactoring than existing components

**Effort:** Integrated into new component development.

#### Phase 3: Optional Component Library (v1.2+)

If complexity grows (more pages, more variants), create explicit Stitch components:

```typescript
// components/Button.vue (explicit Stitch component)
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), { variant: 'primary', size: 'md' })
</script>

<template>
  <button :class="['btn', `btn-${variant}`, `btn-${size}`, { disabled }]">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
}

.btn-sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.btn-md {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
}

.btn-lg {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

This is **deferred to v1.2+** to avoid scope creep.

---

## Part 3: Integration & Data Flow

### 3.1 Idea Creation Flow (with Markdown & Stitch)

```
User types in form
  ↓
MarkdownEditor (styled with Stitch tokens)
  ├── Real-time preview (marked.js + DOMPurify)
  ├── Character count (Stitch styling)
  └── Emits @update:modelValue
  ↓
Form validation (client-side)
  ├── Title: 5-200 chars, plaintext
  ├── Description: 20-5000 chars, any Markdown
  └── Email: valid email
  ↓
POST /api/ideas (sent as raw Markdown)
  ↓
Database storage (raw Markdown)
  ↓
Redirect to idea detail page
  ↓
MarkdownRenderer (Markdown → HTML → DOMPurify → display, all styled with Stitch)
```

### 3.2 Comment Flow (with Markdown)

```
User clicks "Reply" on CommentItem
  ↓
MarkdownEditor appears (styled with Stitch)
  ↓
POST /api/ideas/{id}/comments/{commentId}/reply (raw Markdown)
  ↓
Database storage (raw Markdown)
  ↓
CommentItem re-renders with new reply
  ├── MarkdownRenderer displays reply (styled with Stitch)
  └── Recursive: reply can also be replied to
```

### 3.3 Edit Flow (with Markdown Preservation)

```
User clicks "Edit" on idea
  ↓
MarkdownEditor pre-filled with raw Markdown from DB
  ↓
User modifies (Markdown)
  ↓
PATCH /api/ideas/{id} (raw Markdown)
  ↓
Database updated (raw Markdown)
  ↓
Display updates via MarkdownRenderer
```

---

## Part 4: Bug Fixes & Stability (Mentioned in v1.1 Requirements)

### 4.1 Known Issues to Address in v1.1

Based on code review, no critical bugs identified in current v1.0. However, add these hardening measures:

#### Issue: Textarea/Input Handling
- **Current:** Plain textarea in `<form>` elements
- **v1.1:** Replace with MarkdownEditor (prevents raw HTML injection, improves UX)

#### Issue: Error Handling on Comment Submission
- **Current:** Generic error messages
- **v1.1:** Add client-side validation before submission; show clear error feedback

#### Issue: XSS Prevention
- **Current:** V-text binding (safe) in most places, but dangerous if we add user content rendering
- **v1.1:** Markdown rendering requires DOMPurify; document security assumptions

#### Issue: Dark Mode Support
- **Current:** Inline hard-coded colors; no dark mode
- **v1.1:** CSS variables + media query support; graceful dark mode

### 4.2 Testing Strategy for v1.1

#### Unit Tests (New)

```typescript
// tests/unit/markdown.spec.ts
import { renderMarkdown } from '~/utils/markdown'
import { sanitizeHtml } from '~/utils/sanitize'

describe('Markdown rendering', () => {
  it('should render bold text', () => {
    const result = renderMarkdown('**bold**')
    expect(result).toContain('<strong>bold</strong>')
  })

  it('should sanitize script tags', () => {
    const dirty = '<p><script>alert("xss")</script>Hello</p>'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toContain('<script>')
    expect(clean).toContain('Hello')
  })

  it('should preserve safe links', () => {
    const result = renderMarkdown('[link](https://example.com)')
    expect(result).toContain('href="https://example.com"')
  })

  it('should remove javascript: protocol', () => {
    const dirty = '<a href="javascript:alert(\'xss\')">click</a>'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toContain('javascript:')
  })
})
```

#### E2E Tests (Playwright)

```typescript
// tests/e2e/markdown-editing.spec.ts
test('user can create idea with markdown formatting', async ({ page }) => {
  await page.goto('http://localhost:3000/ideas/create')

  // Fill in title
  await page.fill('input[name="title"]', 'Better Infrastructure')

  // Fill in description with markdown
  await page.fill('textarea[name="description"]', '# Main heading\n\n**Bold text** and *italic*')

  // See preview
  await expect(page.locator('.markdown-preview')).toContainText('Main heading')
  await expect(page.locator('.markdown-preview')).toContainText('Bold text')

  // Submit
  await page.click('button[type="submit"]')

  // View rendered markdown on detail page
  await expect(page.locator('h1')).toContainText('Better Infrastructure')
  await expect(page.locator('.idea-description h1')).toContainText('Main heading')
})
```

---

## Part 5: Technology Stack (v1.1 Additions)

| Layer | Package | Version | Purpose | Why |
|-------|---------|---------|---------|-----|
| **Markdown Editor** | md-editor-v3 | ^6.3.x | Vue 3 Markdown editor with split-pane preview | Simplicity, dark mode support, no dependencies bloat |
| **Markdown Parser** | marked | ^13.x | Parse Markdown to HTML (client-side) | Lightweight, fast, widely used |
| **HTML Sanitizer** | dompurify | ^3.x | Sanitize HTML to prevent XSS | Industry standard for Vue apps |
| **Design System** | (Native CSS variables) | - | Design tokens (colors, typography, spacing) | Zero dependencies, CSS-in-JS not needed for v1.1 |
| **Dark Mode** | (Media query) | - | Automatic dark mode via system preference | Built-in browser API, no library needed |

**Installation:**
```bash
npm install md-editor-v3 marked dompurify
npm install -D @types/dompurify
```

---

## Part 6: Implementation Timeline (v1.1 Phase)

### Week 1: Markdown Foundation
- [ ] Install dependencies (marked, dompurify, md-editor-v3)
- [ ] Create `utils/markdown.ts` and `utils/sanitize.ts`
- [ ] Create `MarkdownRenderer.vue` component
- [ ] Create `MarkdownEditor.vue` (wrapping md-editor-v3)
- [ ] Unit tests for markdown utilities

### Week 2: Component Integration
- [ ] Update `ideas/create.vue` to use MarkdownEditor
- [ ] Update `ideas/[id].vue` to use MarkdownEditor for editing
- [ ] Update `CommentItem.vue` to use MarkdownEditor for replies
- [ ] Update `IdeaCard.vue` to use MarkdownRenderer for summary
- [ ] Update `CommentItem.vue` to use MarkdownRenderer for display

### Week 3: Design System
- [ ] Create `assets/styles/tokens.css` with design tokens
- [ ] Integrate tokens into `nuxt.config.ts`
- [ ] Update existing components to use token variables (IdeaCard, CommentItem, VoteButton, etc.)
- [ ] Test dark mode with system preference

### Week 4: Polish & Testing
- [ ] E2E tests for markdown editing and rendering
- [ ] XSS injection tests (malicious Markdown)
- [ ] Dark mode manual testing
- [ ] Performance testing (large comments, many markdown documents)
- [ ] Bug fixes and refinement

---

## Part 7: Risk Assessment & Mitigation

### Risk 1: XSS via Markdown Injection

**Risk Level:** HIGH if not handled correctly
**Impact:** Attackers inject script tags via comment markdown

**Mitigation:**
- Use DOMPurify with whitelist (not blacklist)
- Run server-side validation on comment submission (reject if contains <script>)
- Regular security audits of DOMPurify configuration
- Monitor CVEs in marked.js and dompurify

**Test coverage:** Unit tests for sanitization (see Part 4.2)

### Risk 2: Performance Degradation

**Risk Level:** MEDIUM
**Impact:** Parsing large comments (5000+ chars) every time they render

**Mitigation:**
- Memoize/cache parsed HTML at component level (Vue computed properties do this)
- Lazy-load MarkdownRenderer for comments below the fold
- Profile before/after with real data
- Defer syntax highlighting to v1.2 if needed

**Test coverage:** Benchmark marked.js with 2KB average comments

### Risk 3: Incomplete Stitch Integration

**Risk Level:** LOW
**Impact:** Design tokens not fully applied; inconsistent styling

**Mitigation:**
- Create component audit checklist (all hard-coded colors replaced)
- Automated tests for CSS variable usage (grep for hex colors in scoped styles)
- Screenshot comparison tests for dark mode

### Risk 4: Database Compatibility

**Risk Level:** VERY LOW
**Impact:** Old plain text doesn't render as Markdown

**Mitigation:**
- Plain text is valid Markdown (no data migration needed)
- Test with existing data: create comment with plain text, view it (should render fine)
- No breaking changes to API

---

## Part 8: Future Enhancements (v1.2+)

These are **NOT** included in v1.1 but noted for roadmap:

1. **Syntax Highlighting** (code blocks)
   - Use `highlight.js` or `prism.js`
   - Effort: ~4 hours
   - Value: Better code readability

2. **Custom Component Library**
   - Explicit Button, Card, Input components
   - Variants for size, color, state
   - Effort: ~1 week
   - Value: Consistent UX, faster component creation

3. **Advanced Markdown Features**
   - Tables, footnotes, math (KaTeX)
   - Custom extensions via marked.use()
   - Effort: ~4 hours per feature
   - Value: Power-user editing

4. **Editor Plugins**
   - Emoji picker, mention support (@user)
   - Upload images to cloud storage (Cloudinary)
   - Effort: ~8 hours
   - Value: Modern social features

5. **Manual Dark Mode Toggle**
   - Add settings page for user preference
   - Persist to localStorage
   - Effort: ~2 hours
   - Value: User control over theme

---

## Part 9: Success Criteria (v1.1)

- [ ] Users can create ideas with Markdown formatting (bold, italic, lists, code blocks)
- [ ] Markdown is rendered safely on display (no XSS, no script injection)
- [ ] Comments support Markdown with same safety guarantees
- [ ] All UI components use design tokens instead of hard-coded colors
- [ ] Dark mode automatically activates on system preference
- [ ] No performance regression (page load time unchanged)
- [ ] E2E tests pass for markdown creation, editing, rendering
- [ ] Backward compatibility: existing plain text content renders correctly

---

## Sources & References

1. **Marked.js:** https://marked.js.org/ - Markdown parser documentation
2. **DOMPurify:** https://github.com/cure53/DOMPurify - XSS sanitizer (GitHub)
3. **md-editor-v3:** https://github.com/imzbf/md-editor-v3 - Vue 3 Markdown editor
4. **Stitches Design System:** https://stitches.dev/ - CSS-in-JS design tokens
5. **Vue Security Guide:** https://vuejs.org/guide/best-practices/security - Official Vue security best practices
6. **CSS Variables (Custom Properties):** https://developer.mozilla.org/en-US/docs/Web/CSS/--* - MDN reference

---

**Research Confidence:** HIGH
**Estimated Effort (Implementation):** 3-4 weeks for solo developer
**Blocking Issues:** None identified

Last updated: 2026-03-27
