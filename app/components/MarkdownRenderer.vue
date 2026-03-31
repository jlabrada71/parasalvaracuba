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
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: #374151;
}

.markdown-output strong,
.markdown-output b {
  font-weight: 700;
}

.markdown-output em,
.markdown-output i {
  font-style: italic;
}

.markdown-output a {
  color: #2563eb;
  text-decoration: none;
}

.markdown-output a:hover {
  text-decoration: underline;
}

.markdown-output h1,
.markdown-output h2,
.markdown-output h3,
.markdown-output h4,
.markdown-output h5,
.markdown-output h6 {
  margin: 0.5em 0 0.25em;
  font-weight: 700;
  color: #1f2937;
}

.markdown-output h1 { font-size: 1.875em; }
.markdown-output h2 { font-size: 1.5em; }
.markdown-output h3 { font-size: 1.25em; }
.markdown-output h4 { font-size: 1.1em; }
.markdown-output h5 { font-size: 1em; }
.markdown-output h6 { font-size: 0.9em; }

.markdown-output ul,
.markdown-output ol {
  margin: 0.5em 0;
  padding-left: 2em;
}

.markdown-output li {
  margin: 0.25em 0;
}

.markdown-output blockquote {
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 4px solid #d1d5db;
  color: #6b7280;
  font-style: italic;
}

.markdown-output code {
  background: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-output pre {
  background: #f3f4f6;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-output pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}

.markdown-output table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}

.markdown-output th,
.markdown-output td {
  border: 1px solid #d1d5db;
  padding: 0.5em;
  text-align: left;
}

.markdown-output th {
  background-color: #f5f5f5;
  font-weight: 700;
}

.markdown-output img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
