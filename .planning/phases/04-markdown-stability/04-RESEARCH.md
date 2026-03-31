# Phase 4 Research: Markdown & Stability Foundation

**Project:** ParaSalvaraCuba Platform
**Phase Goal:** Deliver Markdown editing with security-first approach; fix critical bugs (vote race condition, edge cases); establish security baseline
**Research Date:** March 27, 2026
**Overall Confidence:** HIGH (most findings verified with official documentation)

---

## Executive Summary

Phase 4 requires integrating a rich Markdown editor (Tiptap 3), implementing security-first XSS prevention (DOMPurify), fixing a critical vote race condition in the application layer, and handling comment deletion edge cases. The research confirms that:

1. **Tiptap 3 with Vue 3 is the right choice** for Nuxt 4 - mature, well-documented, integrates seamlessly via `useEditor` hook with `<script setup>` syntax
2. **DOMPurify + marked.js pattern is standard** - DOMPurify sanitizes post-render HTML after Markdown parsing
3. **Vote race condition fix uses PostgreSQL ON CONFLICT (upsert)** - eliminates app-level check-then-insert race condition atomically
4. **Comment deletion requires CASCADE on foreign keys** - already partially in place; needs migration to ensure all vote paths clean up
5. **Security testing needs 20+ OWASP payloads** - covering script tags, event handlers, data URIs, and encoding bypasses

---

## 1. Markdown Editor Integration

### Tiptap 3 with Nuxt 4 Setup

Tiptap 3 is the right choice for this project. Official Tiptap docs confirm seamless Nuxt 4 integration with SSR-safe configuration:

**Installation:**
```bash
npm install @tiptap/vue-3 @tiptap/pm @tiptap/starter-kit dompurify marked
```

**Core Files to Create:**

- `app/components/MarkdownEditor.vue` - Editor with toolbar and preview
- `app/components/MarkdownRenderer.vue` - Safe Markdown display component
- Database: TEXT columns already store Markdown as-is (no schema changes needed)

**Nuxt Configuration Note:**
SSR-safe setup is critical. Tiptap docs require `immediatelyRender: false` to prevent browser API calls during server-side rendering.

### MarkdownEditor Component Architecture

**Props:**
```typescript
interface Props {
  modelValue: string          // v-model binding
  placeholder?: string
  maxLength?: number
  previewMode?: 'split' | 'tab' | 'none'
}
```

**Events:**
```typescript
emit('update:modelValue', markdown: string)
emit('input', markdown: string)
emit('save', markdown: string)
```

**Implementation Pattern:**
```vue
<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit],
  immediatelyRender: false,  // SSR-safe: critical for Nuxt 4
  onUpdate: ({ editor }) => {
    const markdown = editor.storage.markdown.getMarkdown()
    emit('update:modelValue', markdown)
  },
})

watch(() => props.modelValue, (newVal) => {
  if (editor && !editor.isFocused) {
    editor.commands.setContent(newVal)
  }
})
</script>
```

**Toolbar Elements:**
- Bold, Italic, Strikethrough (Tiptap StarterKit includes these)
- Heading levels (H1-H3)
- Bullet list, Numbered list
- Code block (with language selector)
- Blockquote
- Link insertion dialog
- Undo/Redo

**Preview Implementation:**
Render stored Markdown using marked.js on display, not in editor. The editor stores raw Markdown in database. Preview only renders when user clicks "Preview" tab (not live during editing for performance).

### Storage Strategy

**Where Markdown Lives:**
- `ideas.description` - TEXT column (already exists, change nothing)
- `comments.content` - TEXT column (already exists, change nothing)
- Database stores **raw Markdown**, not HTML

**Rendering Pipeline:**
1. **On Display (IdeaCard, IdeaDetail, CommentItem):**
   - Fetch raw Markdown from DB
   - Pass through `marked.js` to convert to HTML
   - Sanitize with DOMPurify
   - Render sanitized HTML

2. **On Edit (inline in [id].vue):**
   - Fetch raw Markdown from DB
   - Load into MarkdownEditor with existing text
   - Update DB with new Markdown on save

### Integration Points

**In `/app/pages/ideas/create.vue`:**
- Replace `<textarea v-model="description">` with `<MarkdownEditor v-model="description" placeholder="..." />`
- No API change: still send `description` as Markdown string
- Store as-is in DB

**In `/app/pages/ideas/[id].vue`:**
- Display: Replace `<div class="idea-description">{{ idea.description }}</div>` with `<MarkdownRenderer :markdown="idea.description" />`
- Edit form: Replace textarea with MarkdownEditor component
- No API change: PATCH still sends description as Markdown

**In `/app/components/CommentThread.vue`:**
- Replace comment form textarea with `<MarkdownEditor v-model="newCommentBody" />`
- No API change: POST still sends as `body` field

**In `/app/components/CommentItem.vue`:**
- Replace display `<div class="comment-body">{{ comment.content }}</div>` with `<MarkdownRenderer :markdown="comment.content" />`
- Replace reply form textarea with `<MarkdownEditor v-model="replyBody" />`

---

## 2. Security-First XSS Prevention

### DOMPurify Integration Strategy

**Pattern: Sanitize Post-Render (Recommended)**

The industry standard is:
1. Parse Markdown → HTML using marked.js
2. Sanitize HTML using DOMPurify
3. Render sanitized HTML

**Why NOT server-side sanitization:**
- Markdown is stored as-is
- If sanitization rules change, can't re-sanitize old content
- Client-side DOMPurify is battle-tested, fast, and portable

### MarkdownRenderer Component Implementation

```vue
<template>
  <div class="markdown-output" v-html="sanitizedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{
  markdown: string
  maxPreviewLength?: number
}>()

const sanitizedHtml = computed(() => {
  // Truncate for preview if needed
  const content = props.maxPreviewLength
    ? props.markdown.slice(0, props.maxPreviewLength)
    : props.markdown

  // Step 1: Parse Markdown to HTML
  const html = marked(content)

  // Step 2: Sanitize with DOMPurify
  // Configuration: allow common Markdown HTML (p, strong, em, a, img, etc.)
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'img',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class'],
    KEEP_CONTENT: true,  // Keep text if tag is removed
  })
})
</script>

<style scoped>
.markdown-output {
  line-height: 1.6;
  color: #374151;
  word-wrap: break-word;
}

.markdown-output p {
  margin: 0.5rem 0;
}

.markdown-output strong, .markdown-output b {
  font-weight: 600;
}

.markdown-output em, .markdown-output i {
  font-style: italic;
}

.markdown-output a {
  color: #2563eb;
  text-decoration: underline;
}

.markdown-output a:hover {
  color: #1d4ed8;
}

.markdown-output code {
  background: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-output pre {
  background: #1f2937;
  color: #e5e7eb;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-output pre code {
  background: none;
  padding: 0;
}

.markdown-output ul, .markdown-output ol {
  margin-left: 1.5rem;
  margin: 0.5rem 0;
}

.markdown-output blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  color: #6b7280;
  font-style: italic;
  margin: 0.5rem 0;
}

.markdown-output img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
```

**DOMPurify Configuration Rationale:**
- ALLOWED_TAGS: Includes common Markdown-generated HTML (headings, lists, tables)
- ALLOWED_ATTR: Restricts to safe attributes (href, src, alt, title)
- KEEP_CONTENT: Preserves text if dangerous tags are stripped
- No `onclick`, `onload`, or script attributes allowed by default

### Backward Compatibility

Existing plaintext ideas/comments will render fine:
- Plain text has no Markdown syntax, passes through cleanly
- marked.js wraps it in `<p>` tags
- DOMPurify passes `<p>` through
- No migration needed

### API Changes

**None.** The API already accepts and stores raw text:
- POST `/api/ideas` - `description` field stays as TEXT
- POST `/api/ideas/:id/comments` - `body` field stays as TEXT
- PATCH `/api/ideas/:id` - `description` field stays as TEXT

---

## 3. Vote Race Condition Fix

### Current Bug Analysis

**Root Cause:** Application-level check-then-insert in `/server/api/ideas/[id]/votes.post.ts`:

```typescript
// Lines 24-41 have race condition:
const [existingVote] = await query(...)  // Check happens here
// ... time gap: concurrent request can insert before our INSERT ...
await query('INSERT INTO votes ...')      // Insert happens here
```

Between the SELECT check and INSERT, a concurrent request can insert a duplicate vote.

**Current Schema (from migration 003):**
```sql
-- No UNIQUE constraint, app-level uniqueness only
-- Indexes exist for fast lookups:
CREATE INDEX votes_idea_id_email_idx ON votes (idea_id, email) WHERE comment_id IS NULL;
CREATE INDEX votes_comment_id_email_idx ON votes (comment_id, email) WHERE comment_id IS NOT NULL;
```

### Solution: PostgreSQL ON CONFLICT (Upsert)

**Approach:** Use `INSERT ... ON CONFLICT ... DO UPDATE` for atomic insert-or-update.

**New SQL Pattern:**

```sql
-- For idea votes (comment_id IS NULL)
INSERT INTO votes (idea_id, email, vote_value, comment_id)
VALUES ($1, $2, $3, NULL)
ON CONFLICT (idea_id, email)
  WHERE comment_id IS NULL
DO UPDATE SET
  vote_value = $3,
  updated_at = NOW()
RETURNING *;

-- For comment votes
INSERT INTO votes (idea_id, comment_id, email, vote_value)
VALUES ($1, $2, $3, $4)
ON CONFLICT (idea_id, comment_id, email)
DO UPDATE SET
  vote_value = $4,
  updated_at = NOW()
RETURNING *;
```

**Why This Works:**
- Atomic: Check and insert happen in single SQL statement
- No app-level logic needed
- PostgreSQL guarantees no duplicates
- Existing duplicate votes are OK (last one wins)

**Database Migration Required:**

```sql
-- Migration 004_vote_race_fix.sql
BEGIN;

-- Add back UNIQUE constraint with partial index for idea votes
ALTER TABLE votes ADD CONSTRAINT votes_idea_id_email_key
  UNIQUE (idea_id, email)
  WHERE comment_id IS NULL;

-- Add UNIQUE constraint for comment votes
ALTER TABLE votes ADD CONSTRAINT votes_comment_id_email_key
  UNIQUE (idea_id, comment_id, email)
  WHERE comment_id IS NOT NULL;

COMMIT;
```

### Data Cleanup

**Check for duplicates before migration:**

```sql
-- Find duplicate idea votes
SELECT idea_id, email, COUNT(*)
FROM votes
WHERE comment_id IS NULL
GROUP BY idea_id, email
HAVING COUNT(*) > 1;

-- Find duplicate comment votes
SELECT idea_id, comment_id, email, COUNT(*)
FROM votes
WHERE comment_id IS NOT NULL
GROUP BY idea_id, comment_id, email
HAVING COUNT(*) > 1;
```

**If duplicates exist, keep latest:**

```sql
DELETE FROM votes v1
WHERE v1.id NOT IN (
  SELECT MAX(id)
  FROM votes v2
  WHERE v2.idea_id = v1.idea_id
    AND v2.email = v1.email
    AND v2.comment_id IS NULL
  GROUP BY idea_id, email
) AND comment_id IS NULL;
```

### Code Changes

**File: `/server/api/ideas/[id]/votes.post.ts`**

Replace lines 23-41 with:

```typescript
const body = await readBody(event)
const voteValue = body?.vote_value ?? 0

if (![1, 0, -1].includes(voteValue)) {
  throw createError({ statusCode: 400, message: 'vote_value must be -1, 0, or 1' })
}

// Atomic upsert: PostgreSQL handles duplicate prevention
await query(
  `INSERT INTO votes (idea_id, email, vote_value, comment_id)
   VALUES ($1, $2, $3, NULL)
   ON CONFLICT (idea_id, email) WHERE comment_id IS NULL
   DO UPDATE SET vote_value = $3, updated_at = NOW()`,
  [ideaId, userEmail, voteValue]
)

// Get updated vote count
const [result] = await query(
  'SELECT COALESCE(SUM(vote_value), 0)::int as net_votes FROM votes WHERE idea_id = $1 AND comment_id IS NULL AND vote_value != 0',
  [ideaId]
)
```

**Same pattern for `/server/api/comments/[commentId]/votes.post.ts`** with comment_id fields.

### Testing Strategy

**Unit tests:** Verify vote count calculation
**Integration tests:** Simulate concurrent votes

```typescript
// Test concurrent vote insertion
test('prevents duplicate votes under concurrency', async () => {
  // Fire 10 identical vote requests simultaneously
  const promises = Array(10).fill(null).map(() =>
    apiRequest(`/api/ideas/${ideaId}/votes`, {
      method: 'POST',
      body: { vote_value: 1 },
      headers: { 'x-email': 'test@example.com' }
    })
  )

  const results = await Promise.all(promises)

  // All should succeed (no error)
  expect(results.every(r => r.statusCode === 200)).toBe(true)

  // But database should have only 1 vote, not 10
  const [votes] = await db.query(
    'SELECT COUNT(*) as count FROM votes WHERE idea_id = $1 AND email = $2',
    [ideaId, 'test@example.com']
  )
  expect(votes.count).toBe(1)
})
```

---

## 4. Comment Deletion Edge Cases

### Current Schema Analysis

From migration 002:

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES ideas (id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments (id) ON DELETE CASCADE,
  ...
);

ALTER TABLE votes ADD COLUMN comment_id UUID REFERENCES comments (id) ON DELETE CASCADE;
```

**Good news:** CASCADE is already in place for:
- Deleting comment → cascades to child replies (`parent_comment_id`)
- Deleting comment → cascades to votes on that comment (`votes.comment_id`)

### Edge Cases Identified

1. **Deleting a reply with nested replies:**
   - Cascade handles this ✓
   - When reply is deleted, its children are too

2. **Deleting a comment → votes cleanup:**
   - Cascade on `votes.comment_id` handles this ✓
   - Votes on deleted comment are removed

3. **Deleting a comment → votes on nested replies:**
   - Cascade deletes child replies
   - Cascade deletes votes on those replies ✓

4. **Soft delete (keep comment but mark as deleted):**
   - Not implemented in current schema
   - Recommend hard delete (cascade handles cleanup)

### Implementation Gaps

**Need to add:** Delete endpoint for comments

Currently no API route exists. Need:

**File: `/server/api/ideas/[id]/comments/[commentId].delete.ts`**

```typescript
export default defineEventHandler(async (event) => {
  try {
    const ideaId = getRouterParam(event, 'id')
    const commentId = getRouterParam(event, 'commentId')
    const userEmail = event.context.userEmail

    if (!ideaId || !commentId) {
      throw createError({ statusCode: 400, message: 'IDs required' })
    }
    if (!userEmail) {
      throw createError({ statusCode: 401, message: 'Email required' })
    }

    // Check comment exists and user is author
    const [comment] = await query(
      'SELECT id, email FROM comments WHERE id = $1 AND idea_id = $2',
      [commentId, ideaId]
    )

    if (!comment) {
      throw createError({ statusCode: 404, message: 'Comment not found' })
    }

    if (comment.email !== userEmail) {
      throw createError({ statusCode: 403, message: 'Not authorized' })
    }

    // Delete comment (cascade handles votes and nested replies)
    await query(
      'DELETE FROM comments WHERE id = $1',
      [commentId]
    )

    return { success: true }
  } catch (err) {
    console.error('DELETE comment error:', err)
    if (err instanceof Error && 'statusCode' in err) throw err
    throw createError({
      statusCode: 500,
      message: `Database error: ${err instanceof Error ? err.message : String(err)}`
    })
  }
})
```

### Testing

Add cascade delete test:

```typescript
test('deleting comment cascades to votes and replies', async () => {
  // Create comment
  const comment = await createComment(ideaId, 'Parent comment')

  // Create reply
  const reply = await createComment(ideaId, 'Reply', comment.id)

  // Vote on reply
  await castVote(reply.id, 1, 'voter@example.com')

  // Delete parent comment
  await apiRequest(`/api/ideas/${ideaId}/comments/${comment.id}`, {
    method: 'DELETE'
  })

  // Verify comment is gone
  const [deleted] = await db.query(
    'SELECT COUNT(*) as count FROM comments WHERE id = $1',
    [comment.id]
  )
  expect(deleted.count).toBe(0)

  // Verify reply is gone
  const [replyGone] = await db.query(
    'SELECT COUNT(*) as count FROM comments WHERE id = $1',
    [reply.id]
  )
  expect(replyGone.count).toBe(0)

  // Verify vote is gone
  const [voteGone] = await db.query(
    'SELECT COUNT(*) as count FROM votes WHERE comment_id = $1',
    [reply.id]
  )
  expect(voteGone.count).toBe(0)
})
```

---

## 5. Component Architecture

### MarkdownEditor Component (`app/components/MarkdownEditor.vue`)

**Purpose:** Rich editor with toolbar, live preview, character count

**Key Features:**
- Tiptap 3 editor with StarterKit
- Toolbar for common Markdown (bold, italic, headings, lists, code)
- Optional split-view or tabbed preview
- Character limit tracking
- Clear formatting button
- Undo/Redo

**Props:**
```typescript
modelValue: string
placeholder?: string
maxLength?: number = 2000
previewMode?: 'split' | 'tab' | 'none' = 'tab'
```

**Events:**
```typescript
'update:modelValue': [markdown: string]
```

**State:**
- `editor` - Tiptap editor instance
- `previewTab` - current tab ('edit' | 'preview')
- `charCount` - length of current markdown

**Dependencies:**
- @tiptap/vue-3
- @tiptap/starter-kit
- marked (for preview rendering)
- dompurify (for sanitizing preview)

### MarkdownRenderer Component (`app/components/MarkdownRenderer.vue`)

**Purpose:** Safely render Markdown as styled HTML

**Key Features:**
- Parse Markdown with marked.js
- Sanitize with DOMPurify
- Custom styles for headings, links, code, blockquotes
- Optional truncation for preview mode
- Image responsive sizing

**Props:**
```typescript
markdown: string
maxPreviewLength?: number  // Truncate for previews
className?: string         // Custom CSS class
```

**No events** (display-only)

**Dependencies:**
- marked (parse Markdown)
- dompurify (sanitize HTML)

### Integration Points Summary

| File | Change | From | To |
|------|--------|------|-----|
| `create.vue` | Textarea → Editor | `<textarea>` | `<MarkdownEditor v-model="description" />` |
| `[id].vue` display | Plain → Rendered | `{{ idea.description }}` | `<MarkdownRenderer :markdown="idea.description" />` |
| `[id].vue` edit | Textarea → Editor | `<textarea>` | `<MarkdownEditor v-model="editDescription" />` |
| `CommentThread.vue` | Textarea → Editor | `<textarea>` | `<MarkdownEditor v-model="newCommentBody" />` |
| `CommentItem.vue` display | Plain → Rendered | `{{ comment.content }}` | `<MarkdownRenderer :markdown="comment.content" />` |
| `CommentItem.vue` reply | Textarea → Editor | `<textarea>` | `<MarkdownEditor v-model="replyBody" />` |

**No API changes needed** - components send/receive Markdown strings, DB stores Markdown as-is.

---

## 6. Testing Strategy

### Unit Tests: MarkdownEditor

**File:** `tests/unit/MarkdownEditor.spec.ts`

```typescript
import { mount } from '@vue/test-utils'
import MarkdownEditor from '@/components/MarkdownEditor.vue'

describe('MarkdownEditor', () => {
  test('renders editor with placeholder', () => {
    const wrapper = mount(MarkdownEditor, {
      props: { placeholder: 'Enter text...' }
    })
    expect(wrapper.find('.editor').exists()).toBe(true)
  })

  test('emits update:modelValue on input', async () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: '' }
    })
    // Simulate typing in editor
    await wrapper.vm.editor.commands.insertContent('# Hello')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  test('respects maxLength prop', () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: '', maxLength: 100 }
    })
    expect(wrapper.vm.maxLength).toBe(100)
  })

  test('toggles preview tab', async () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: '# Test', previewMode: 'tab' }
    })
    await wrapper.find('.tab-preview').trigger('click')
    expect(wrapper.vm.previewTab).toBe('preview')
  })

  test('toolbar buttons apply formatting', async () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: 'selected text' }
    })
    // Bold button
    await wrapper.find('.btn-bold').trigger('click')
    expect(wrapper.emitted('update:modelValue')[0][0]).toContain('**')
  })

  test('character count updates', async () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: '' }
    })
    await wrapper.vm.editor.commands.insertContent('Hello')
    expect(wrapper.vm.charCount).toBe(5)
  })

  test('prevents input beyond maxLength', async () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: '', maxLength: 5 }
    })
    await wrapper.vm.editor.commands.insertContent('This is too long')
    // Should be truncated by editor
    expect(wrapper.vm.charCount).toBeLessThanOrEqual(5)
  })
})
```

### Unit Tests: MarkdownRenderer

**File:** `tests/unit/MarkdownRenderer.spec.ts`

```typescript
import { mount } from '@vue/test-utils'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

describe('MarkdownRenderer', () => {
  test('renders markdown as HTML', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: { markdown: '# Heading\n\nParagraph text' }
    })
    expect(wrapper.html()).toContain('<h1>')
    expect(wrapper.html()).toContain('<p>')
  })

  test('sanitizes dangerous HTML', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: { markdown: '<script>alert("xss")</script>' }
    })
    // Script tag should be removed
    expect(wrapper.html()).not.toContain('<script>')
  })

  test('preserves safe formatting', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: { markdown: '**bold** and *italic* text' }
    })
    expect(wrapper.html()).toContain('<strong>')
    expect(wrapper.html()).toContain('<em>')
  })

  test('renders links safely', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: { markdown: '[link](https://example.com)' }
    })
    expect(wrapper.html()).toContain('<a href="https://example.com">')
  })

  test('blocks javascript: protocol in links', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: { markdown: '[click](javascript:alert("xss"))' }
    })
    // DOMPurify should remove javascript: protocol
    expect(wrapper.html()).not.toContain('javascript:')
  })

  test('renders code blocks', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: { markdown: '```\ncode here\n```' }
    })
    expect(wrapper.html()).toContain('<pre>')
    expect(wrapper.html()).toContain('<code>')
  })

  test('truncates for preview', () => {
    const markdown = 'A'.repeat(500)
    const wrapper = mount(MarkdownRenderer, {
      props: { markdown, maxPreviewLength: 100 }
    })
    // Should truncate to 100 chars before rendering
    expect(wrapper.vm.previewText.length).toBeLessThanOrEqual(100)
  })

  test('renders lists correctly', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: { markdown: '- Item 1\n- Item 2\n\n1. First\n2. Second' }
    })
    expect(wrapper.html()).toContain('<ul>')
    expect(wrapper.html()).toContain('<ol>')
  })

  test('renders blockquotes', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: { markdown: '> This is a quote' }
    })
    expect(wrapper.html()).toContain('<blockquote>')
  })
})
```

### XSS Security Tests

**File:** `tests/unit/MarkdownXSS.spec.ts`

OWASP Markdown injection payloads (20+ test cases):

```typescript
import { mount } from '@vue/test-utils'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const XSS_PAYLOADS = [
  // Script tags
  {
    name: 'Direct script tag',
    payload: '<script>alert("xss")</script>',
    shouldNotContain: '<script>'
  },
  {
    name: 'Script with event handler',
    payload: '<img src=x onerror="alert(\'xss\')">',
    shouldNotContain: 'onerror'
  },
  {
    name: 'Inline onclick',
    payload: '<button onclick="alert(\'xss\')">Click</button>',
    shouldNotContain: 'onclick'
  },

  // Event handlers
  {
    name: 'onload event',
    payload: '<body onload="alert(\'xss\')">',
    shouldNotContain: 'onload'
  },
  {
    name: 'img onload',
    payload: '![image](x onerror="alert(1)")',
    shouldNotContain: 'onerror'
  },

  // JavaScript protocol
  {
    name: 'javascript: in href',
    payload: '[click](javascript:alert(1))',
    shouldNotContain: 'javascript:'
  },
  {
    name: 'javascript: encoded',
    payload: '[click](java&#x09;script:alert(1))',
    shouldNotContain: 'javascript'
  },

  // Data URIs
  {
    name: 'data: URI with script',
    payload: '<img src="data:text/html,<script>alert(1)</script>">',
    shouldNotContain: 'alert'
  },
  {
    name: 'data: URI base64',
    payload: '<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">',
    shouldNotContain: '<script>'
  },

  // SVG vectors
  {
    name: 'SVG with onload',
    payload: '<svg onload="alert(1)">',
    shouldNotContain: 'onload'
  },
  {
    name: 'SVG image with event',
    payload: '<svg><image href=x onerror=alert(1)></image></svg>',
    shouldNotContain: 'onerror'
  },

  // Form and input
  {
    name: 'Form with onsubmit',
    payload: '<form onsubmit="alert(1)"><input type="submit"></form>',
    shouldNotContain: 'onsubmit'
  },
  {
    name: 'Input autofocus onfocus',
    payload: '<input autofocus onfocus="alert(1)">',
    shouldNotContain: 'onfocus'
  },

  // Attribute injection
  {
    name: 'Attribute with quotes',
    payload: '<div style="background:url(javascript:alert(1))">',
    shouldNotContain: 'javascript'
  },
  {
    name: 'Data attribute event',
    payload: '<div data-onload="alert(1)">',
    shouldNotContain: 'data-onload'
  },

  // eval() variants
  {
    name: 'eval in style',
    payload: '<style>body { background: expression(eval(alert(1))) }</style>',
    shouldNotContain: 'eval'
  },
  {
    name: 'eval via setTimeout',
    payload: '<img src=x onerror="setTimeout(\'alert(1)\')">',
    shouldNotContain: 'setTimeout'
  },

  // Math operators and encoding
  {
    name: 'Math operator injection',
    payload: '<img src=x alt=test onclick=alert(1) />',
    shouldNotContain: 'onclick'
  },
  {
    name: 'HTML entity encoding bypass',
    payload: '<img src=x alt="test" onerror="alert(&quot;xss&quot;)">',
    shouldNotContain: 'onerror'
  },

  // Meta and style
  {
    name: 'Meta with refresh and javascript',
    payload: '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
    shouldNotContain: 'javascript'
  },
  {
    name: 'Style tag with import',
    payload: '<style>@import url("javascript:alert(1)");</style>',
    shouldNotContain: 'javascript'
  }
]

describe('MarkdownRenderer XSS Security', () => {
  XSS_PAYLOADS.forEach(({ name, payload, shouldNotContain }) => {
    test(`blocks XSS: ${name}`, () => {
      const wrapper = mount(MarkdownRenderer, {
        props: { markdown: payload }
      })
      expect(wrapper.html()).not.toContain(shouldNotContain)
    })
  })

  test('renders safe content alongside blocked XSS', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: {
        markdown: '# Safe Title\n<script>alert("xss")</script>\nSafe paragraph'
      }
    })
    expect(wrapper.html()).toContain('<h1>')
    expect(wrapper.html()).toContain('Safe Title')
    expect(wrapper.html()).toContain('Safe paragraph')
    expect(wrapper.html()).not.toContain('<script>')
  })

  test('prompt() function blocked', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: { markdown: '[click](javascript:prompt("xss"))' }
    })
    expect(wrapper.html()).not.toContain('prompt')
    expect(wrapper.html()).not.toContain('javascript:')
  })

  test('console access blocked', () => {
    const wrapper = mount(MarkdownRenderer, {
      props: { markdown: '<img onerror="console.log(document.cookie)">' }
    })
    expect(wrapper.html()).not.toContain('console')
    expect(wrapper.html()).not.toContain('onerror')
  })
})
```

### Integration Tests: Vote Race Condition

**File:** `tests/integration/voteRaceCondition.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Vote Race Condition Prevention', () => {
  test('prevents duplicate votes under concurrent requests', async ({ page, context }) => {
    // This test requires backend support for concurrent testing
    // In practice, use Artillery or JMeter for realistic load

    const BASE_URL = 'http://localhost:3000'
    const ideaId = 'test-idea-123'
    const email = 'concurrent-voter@test.com'

    // Create 5 new pages (simulating 5 concurrent users)
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage(),
      context.newPage(),
      context.newPage()
    ])

    // All 5 simultaneously submit upvote request
    const votePromises = pages.map(p =>
      p.request.post(`${BASE_URL}/api/ideas/${ideaId}/votes`, {
        data: { vote_value: 1 },
        headers: { 'x-email': email }
      })
    )

    const responses = await Promise.all(votePromises)

    // All should succeed (200s)
    expect(responses.every(r => r.status() === 200)).toBe(true)

    // But verify in DB that only 1 vote exists for this user
    // (would need backend test endpoint or direct DB access)

    await Promise.all(pages.map(p => p.close()))
  })

  test('handles rapid toggle (up, down, up, down)', async ({ page }) => {
    const BASE_URL = 'http://localhost:3000'

    // Navigate to idea
    await page.goto(`${BASE_URL}/ideas/test-123`)

    const voteUpBtn = page.locator('.vote-btn.up')
    const voteDownBtn = page.locator('.vote-btn.down')

    // Rapid clicks
    for (let i = 0; i < 10; i++) {
      await voteUpBtn.click()
      await voteDownBtn.click()
      await voteUpBtn.click()
    }

    // Should complete without errors
    await expect(page.locator('.error')).not.toBeVisible()
  })
})
```

### Regression Tests

**Ensure existing features still work:**

```typescript
// tests/integration/markdownRegression.spec.ts
test('plain text ideas still display correctly', async ({ page }) => {
  // Create idea with plain text (no markdown syntax)
  const idea = {
    title: 'Simple idea',
    description: 'This is just plain text with no special formatting.'
  }

  // View idea
  await page.goto(`/ideas/${idea.id}`)

  // Should render as before (in paragraph)
  await expect(page.locator('.idea-description')).toContainText('just plain text')
})

test('comments still work with plain text', async ({ page }) => {
  await page.goto('/ideas/test-123')

  const commentBox = page.locator('.comment-form textarea')
  const submitBtn = page.locator('.form-actions button')

  await commentBox.fill('This is a comment')
  await submitBtn.click()

  // Comment should appear
  await expect(page.locator('.comment-body')).toContainText('This is a comment')
})

test('voting still works end-to-end', async ({ page }) => {
  await page.goto('/ideas/test-123')

  const upVoteBtn = page.locator('.vote-btn.up')
  const voteCount = page.locator('.vote-count')

  const initialCount = await voteCount.textContent()
  await upVoteBtn.click()

  const newCount = await voteCount.textContent()
  expect(parseInt(newCount!)).toBe(parseInt(initialCount!) + 1)
})
```

---

## 7. Implementation Dependencies

### New Packages to Install

```bash
npm install @tiptap/vue-3 @tiptap/pm @tiptap/starter-kit dompurify marked
```

**Versions:**
- @tiptap/vue-3: ^3.20.5 (matches tech stack)
- @tiptap/pm: ^3.20.5 (same as tiptap)
- @tiptap/starter-kit: ^3.20.5 (same as tiptap)
- dompurify: ^3.0.0 (matches tech stack)
- marked: ^11.0.0 (latest stable, full ESM support)

**Type support (already have @types):**
- `@types/dompurify` - included in dompurify 3.0+

### Database Changes

**Migration File:** `db/migrations/004_vote_race_fix.sql`

```sql
BEGIN;

-- Add UNIQUE constraints for vote deduplication
ALTER TABLE votes ADD CONSTRAINT votes_idea_id_email_key
  UNIQUE (idea_id, email)
  WHERE comment_id IS NULL;

ALTER TABLE votes ADD CONSTRAINT votes_comment_id_email_key
  UNIQUE (idea_id, comment_id, email)
  WHERE comment_id IS NOT NULL;

COMMIT;
```

**No schema changes needed for Markdown** - TEXT columns already exist and support Markdown syntax.

### API Endpoint Changes

**New Endpoint:**
- DELETE `/api/ideas/[id]/comments/[commentId]` - Delete a comment

**Modified Endpoints:**
- POST `/api/ideas/[id]/votes` - Use upsert instead of check-then-insert
- POST `/api/comments/[commentId]/votes` - Use upsert instead of check-then-insert

**No changes to request/response structure** - same field names, just safer implementation.

### Component Files to Create

1. `app/components/MarkdownEditor.vue` - Rich editor component
2. `app/components/MarkdownRenderer.vue` - Safe Markdown display
3. `tests/unit/MarkdownEditor.spec.ts` - Editor unit tests
4. `tests/unit/MarkdownRenderer.spec.ts` - Renderer unit tests
5. `tests/unit/MarkdownXSS.spec.ts` - XSS security tests
6. `tests/integration/voteRaceCondition.spec.ts` - Vote concurrency tests
7. `tests/integration/commentDeletion.spec.ts` - Cascade delete tests

### Component Files to Modify

1. `app/pages/ideas/create.vue` - Use MarkdownEditor
2. `app/pages/ideas/[id].vue` - Use MarkdownRenderer and MarkdownEditor
3. `app/components/CommentThread.vue` - Use MarkdownEditor
4. `app/components/CommentItem.vue` - Use MarkdownRenderer and MarkdownEditor
5. `app/components/IdeaCard.vue` - Optionally use MarkdownRenderer for preview

### Server Files to Create/Modify

1. `server/api/ideas/[id]/comments/[commentId].delete.ts` - New delete endpoint
2. `server/api/ideas/[id]/votes.post.ts` - Modify to use upsert
3. `server/api/comments/[commentId]/votes.post.ts` - Modify to use upsert

---

## 8. Build Order (Recommended Sequence)

**Why this order:** Components must be tested before integration, database fix must come early to prevent bugs, security tests validate implementation.

1. **Database Migration (004_vote_race_fix.sql)**
   - Apply UNIQUE constraints for vote deduplication
   - Runs before any vote changes
   - Validates schema is ready for upsert pattern

2. **MarkdownRenderer Component + Unit Tests**
   - Build renderer first (simpler, no editing logic)
   - Unit test against XSS payloads (20+ tests)
   - Validate DOMPurify configuration
   - Outputs: `MarkdownRenderer.vue`, `tests/unit/MarkdownXSS.spec.ts`

3. **MarkdownEditor Component + Unit Tests**
   - Build editor with toolbar and preview
   - Unit test toolbar, preview, character count
   - Validate Tiptap SSR setup
   - Outputs: `MarkdownEditor.vue`, `tests/unit/MarkdownEditor.spec.ts`

4. **Integrate into Create Idea Form**
   - Replace textarea with MarkdownEditor
   - Test end-to-end: create idea with Markdown
   - Verify storage as plaintext Markdown
   - File: `app/pages/ideas/create.vue`

5. **Integrate into Idea Display**
   - Replace plaintext display with MarkdownRenderer
   - Replace edit textarea with MarkdownEditor
   - Test rendering existing plaintext (backward compat)
   - Files: `app/pages/ideas/[id].vue`

6. **Integrate into Comments**
   - CommentThread: Replace form textarea with MarkdownEditor
   - CommentItem: Replace display with MarkdownRenderer, edit with MarkdownEditor
   - Test nested replies with Markdown
   - Files: `app/components/CommentThread.vue`, `app/components/CommentItem.vue`

7. **Fix Vote Race Condition**
   - Modify vote endpoints to use upsert pattern
   - Add integration tests for concurrent voting
   - Verify no duplicates under load
   - Files: `server/api/ideas/[id]/votes.post.ts`, `server/api/comments/[commentId]/votes.post.ts`

8. **Add Comment Deletion**
   - Create DELETE endpoint
   - Test cascade cleanup (comments + votes)
   - Verify nested replies deleted
   - File: `server/api/ideas/[id]/comments/[commentId].delete.ts`

9. **E2E Regression Testing**
   - Run all existing Playwright tests
   - Add new tests for Markdown workflows
   - Ensure voting, comments, i18n still work
   - Files: `tests/integration/markdownRegression.spec.ts`, etc.

10. **Performance & Security Review**
    - Load test Markdown rendering at scale
    - XSS payload fuzzing
    - Comment cascade deletion performance
    - Vote query performance with new indexes

---

## 9. Known Constraints & Assumptions

### Constraints

1. **Tiptap SSR requirement:** Must use `immediatelyRender: false` - non-negotiable for Nuxt 4
2. **v-html usage:** MarkdownRenderer uses `v-html` with sanitized content - only safe because DOMPurify runs before rendering
3. **Markdown storage:** Must store raw Markdown in DB, not rendered HTML (allows format flexibility)
4. **UNIQUE constraint placement:** PostgreSQL partial indexes in UNIQUE constraint require PostgreSQL 10+ (confirmed available)

### Assumptions

1. **Email is stable user identifier:** Voting and authorship rely on email not changing
2. **No bulk comment deletion:** API design assumes one-at-a-time deletion (not bulk ops)
3. **DOMPurify is sufficient:** Security posture assumes DOMPurify config is correct and library is up-to-date
4. **marked.js GFM support:** Using basic Markdown, not all GFM extensions (tables, strikethrough, etc. if used separately)

### Open Questions Deferred to Phase 4 Planning

1. **Markdown features scope:** Does phase include tables, footnotes, code highlighting? (Recommend v1.0: basic only)
2. **Markdown editing conflict resolution:** If same comment edited by multiple users simultaneously, which wins? (Recommend: last-write-wins)
3. **Preview rendering performance:** At what markdown size does preview become slow? (Test and document in code)
4. **Comment deletion UX:** Should deletion show "deleted comment" placeholder or remove entirely? (Recommend: remove entirely)
5. **Vote count recalculation:** Any need to audit/recount votes after duplicate cleanup? (Recommend: run query first, then cleanup)

---

## 10. Confidence Assessment

| Area | Confidence | Evidence | Notes |
|------|------------|----------|-------|
| **Tiptap Integration** | HIGH | Official Nuxt 4 docs, working examples, versions match | SSR setup well-documented, `useEditor` hook is stable |
| **DOMPurify Setup** | HIGH | Official docs, OWASP cheat sheet, working examples | 3.3.3 latest version, configuration options clear |
| **Markdown Rendering** | HIGH | marked.js docs, security guides, test patterns | marked.js is stable, DOMPurify integration is standard |
| **Vote Race Fix** | HIGH | PostgreSQL docs, upsert examples, tested patterns | ON CONFLICT is stable in PG 10+, atomic operation |
| **Comment Cascade** | HIGH | Schema already has CASCADE, migration is straightforward | No breaking changes, existing FK relationships in place |
| **XSS Payloads** | MEDIUM | OWASP lists, real CVEs, community payload repos | Payloads are real but list is living (new bypasses appear) |
| **E2E Testing** | MEDIUM | Playwright works, but i18n test shows complexity | Some race conditions hard to reproduce locally |

---

## 11. Sources & References

### Official Documentation
- [Tiptap Vue 3 Installation Guide](https://tiptap.dev/docs/editor/getting-started/install/vue3)
- [Tiptap Nuxt Installation](https://tiptap.dev/docs/editor/getting-started/install/nuxt)
- [Tiptap Export JSON and HTML](https://tiptap.dev/docs/guides/output-json-html)
- [Tiptap Markdown Support](https://tiptap.dev/docs/editor/markdown)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [PostgreSQL INSERT ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html)
- [PostgreSQL CASCADE DELETE](https://www.postgresql.org/docs/current/ddl-constraints.html)

### Security References
- [OWASP XSS Filter Evasion Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html)
- [PortSwigger XSS Cheat Sheet 2026](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet)
- [Markdown XSS Payloads Repository](https://github.com/cujanovic/Markdown-XSS-Payloads)
- [XSS in Markdown - HackTricks](https://book.hacktricks.xyz/pentesting-web/xss-cross-site-scripting/xss-in-markdown)

### Implementation Guides
- [Vue 3 Markdown Editor Patterns](https://www.vuescript.com/best-wysiwyg-rich-text-editor/) (2026 Update)
- [Marked.js Security Guide](https://marked.js.org/)
- [Safe-marked: Markdown + DOMPurify Pattern](https://github.com/azu/safe-marked)
- [PostgreSQL Race Condition Prevention](https://on-systems.tech/blog/128-preventing-read-committed-sql-concurrency-errors/)

---

## Next Steps for Phase 4 Planning

1. **Review this research** for accuracy and completeness
2. **Validate assumptions** about Markdown scope (basic vs. GFM)
3. **Confirm XSS test suite** - add any domain-specific payloads
4. **Finalize build order** - adjust sequence based on team capacity
5. **Estimate effort** for each step (not in this research doc)
6. **Create detailed specs** for each component (props, events, styling)
7. **Plan concurrent work** (testing can start before some components ready)

---

**Research completed.** Ready for Phase 4 planning and roadmap creation.
