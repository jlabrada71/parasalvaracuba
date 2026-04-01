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
  if (!props.markdown || typeof props.markdown !== 'string') {
    return ''
  }

  // Truncate for preview if maxPreviewLength is set
  const content = props.maxPreviewLength
    ? props.markdown.slice(0, props.maxPreviewLength)
    : props.markdown

  // Step 1: Parse Markdown to HTML
  let html = ''
  try {
    html = marked(content)
  } catch (e) {
    console.warn('Markdown parse error:', e)
    return DOMPurify.sanitize(content)
  }

  // Step 2: Sanitize with DOMPurify
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'img',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class'],
    KEEP_CONTENT: true,
  })
})
</script>

<style scoped>
.markdown-output {
  line-height: 1.75;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: var(--color-on-surface-variant);
  font-size: var(--font-size-body-md);
}

.markdown-output > * + * {
  margin-top: 1em;
}

.markdown-output p {
  margin: 0;
}

.markdown-output strong,
.markdown-output b {
  font-weight: 700;
  color: var(--color-on-surface);
}

.markdown-output em,
.markdown-output i {
  font-style: italic;
}

.markdown-output a {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.markdown-output a:hover {
  color: var(--color-primary-container);
}

.markdown-output h1,
.markdown-output h2,
.markdown-output h3,
.markdown-output h4,
.markdown-output h5,
.markdown-output h6 {
  font-family: var(--font-headline);
  font-weight: 700;
  color: var(--color-on-surface);
  line-height: 1.3;
  margin-top: 1.75em;
  margin-bottom: 0.4em;
}

.markdown-output > :first-child {
  margin-top: 0;
}

.markdown-output h1 { font-size: 1.75em; }
.markdown-output h2 { font-size: 1.375em; }
.markdown-output h3 { font-size: 1.15em; }
.markdown-output h4 { font-size: 1em; }
.markdown-output h5 { font-size: 0.95em; }
.markdown-output h6 { font-size: 0.875em; color: var(--color-on-surface-variant); }

.markdown-output ul,
.markdown-output ol {
  margin: 0;
  padding-left: 1.5em;
}

.markdown-output li {
  margin-top: 0.4em;
}

.markdown-output li:first-child {
  margin-top: 0;
}

.markdown-output blockquote {
  margin: 0;
  padding: 0.75em 1.25em;
  border-left: 3px solid var(--color-primary);
  background-color: var(--color-surface-container-low);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  color: var(--color-on-surface-variant);
  font-style: italic;
}

.markdown-output code {
  background: var(--color-surface-container);
  padding: 0.15em 0.4em;
  border-radius: var(--radius-sm);
  font-family: 'Courier New', monospace;
  font-size: 0.875em;
  color: var(--color-secondary);
}

.markdown-output pre {
  background: var(--color-surface-container);
  padding: 1.25em;
  border-radius: var(--radius-lg);
  overflow-x: auto;
  margin: 0;
}

.markdown-output pre code {
  background: none;
  padding: 0;
  border-radius: 0;
  color: var(--color-on-surface);
  font-size: 0.875em;
}

.markdown-output table {
  border-collapse: collapse;
  width: 100%;
  margin: 0;
  font-size: 0.9em;
}

.markdown-output th,
.markdown-output td {
  padding: 0.6em 0.875em;
  text-align: left;
}

.markdown-output thead tr {
  background-color: var(--color-surface-container-low);
  border-bottom: 2px solid var(--color-outline-variant);
}

.markdown-output th {
  font-weight: 700;
  color: var(--color-on-surface);
}

.markdown-output tbody tr + tr {
  border-top: 1px solid var(--color-surface-container);
}

.markdown-output tbody tr:hover {
  background-color: var(--color-surface-container-low);
}

.markdown-output img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
}

.markdown-output hr {
  border: none;
  border-top: 1px solid var(--color-outline-variant);
  margin: 0;
}
</style>
