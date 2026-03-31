# All Ideas Page - Vue Implementation Guide

## File Structure

```
app/
├── pages/
│   └── ideas/
│       ├── index.vue          (Main listing page)
│       └── [id].vue           (Already exists - detail view)
├── components/
│   └── ideas/
│       ├── AllIdeasHeader.vue
│       ├── AllIdeasHero.vue
│       ├── IdeasGrid.vue
│       ├── IdeaCard.vue
│       ├── IdeasPagination.vue
│       ├── SearchBar.vue
│       └── FilterChips.vue
├── composables/
│   └── useIdeas.ts            (API/data fetching)
└── styles/
    └── ideas.css              (Design tokens + shared styles)
```

---

## Design Token Mapping (CSS Variables)

Create `/app/styles/design-tokens.css`:

```css
:root {
  /* Primary Colors */
  --color-primary: #006565;
  --color-primary-container: #008080;
  --color-primary-fixed: #93f2f2;
  --color-primary-fixed-dim: #76d6d5;

  /* Secondary/Coral Accent */
  --color-secondary: #a43c12;
  --color-secondary-container: #fe7e4f;
  --color-coral: #FF7F50;

  /* Surface Colors */
  --color-surface: #f6faf9;
  --color-surface-low: #f0f4f3;
  --color-surface-lowest: #ffffff;
  --color-surface-high: #e5e9e8;
  --color-surface-highest: #dfe3e2;

  /* Text Colors */
  --color-text-primary: #181c1c;
  --color-text-secondary: #3e4949;
  --color-text-white: #ffffff;

  /* Outline/Border */
  --color-outline: #6e7979;
  --color-outline-variant: #bdc9c8;

  /* Tertiary */
  --color-tertiary: #495b70;

  /* Spacing Scale (using 8px base unit) */
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px, also 1.4rem = 22px in design */
  --spacing-5: 1.4rem;   /* 22px */
  --spacing-6: 2rem;     /* 32px */
  --spacing-8: 8.5rem;   /* Hero left margin */
  --spacing-7: 5.5rem;   /* Hero right margin */

  /* Typography */
  --font-family-headline: "Manrope", sans-serif;
  --font-family-body: "Inter", sans-serif;
  --font-size-display-lg: 3.5rem;
  --font-size-display-md: 2.8rem;
  --font-size-headline-sm: 1.5rem;
  --font-size-title-md: 1.1rem;
  --font-size-body-lg: 1rem;
  --font-size-body-md: 0.9rem;
  --font-size-body-sm: 0.8rem;
  --font-size-label-md: 0.75rem;
  --font-size-label-sm: 0.7rem;

  /* Letter Spacing */
  --letter-spacing-normal: 0;
  --letter-spacing-caps: 0.05em;

  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-ambient: 0 24px 24px rgba(24, 28, 28, 0.06);
  --shadow-hover: 0 24px 32px rgba(24, 28, 28, 0.08);

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow: 300ms ease-out;
}
```

---

## Component: AllIdeasPage (pages/ideas/index.vue)

```vue
<template>
  <div class="ideas-page">
    <!-- Header -->
    <AllIdeasHeader />

    <!-- Hero Section with Filters -->
    <AllIdeasHero
      :search-query="searchQuery"
      :selected-filter="selectedFilter"
      @search="handleSearch"
      @filter="handleFilter"
    />

    <!-- Ideas Grid -->
    <IdeasGrid
      :ideas="paginatedIdeas"
      @vote="handleVote"
      @comment="handleComment"
    />

    <!-- Pagination -->
    <IdeasPagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @change-page="currentPage = $event"
    />

    <!-- Footer -->
    <AllIdeasFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AllIdeasHeader from '~/components/ideas/AllIdeasHeader.vue'
import AllIdeasHero from '~/components/ideas/AllIdeasHero.vue'
import IdeasGrid from '~/components/ideas/IdeasGrid.vue'
import IdeasPagination from '~/components/ideas/IdeasPagination.vue'
import AllIdeasFooter from '~/components/AllIdeasFooter.vue'

const { t } = useI18n()

// Data
const allIdeas = ref([])
const searchQuery = ref('')
const selectedFilter = ref('recent')
const currentPage = ref(1)
const itemsPerPage = 12

// Fetch ideas
const { data: ideas } = await useFetch('/api/ideas', {
  query: {
    page: currentPage,
    sort: selectedFilter,
    search: searchQuery,
  }
})

allIdeas.value = ideas.value?.data || []

// Computed
const filteredIdeas = computed(() => {
  let result = allIdeas.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(idea =>
      idea.title.toLowerCase().includes(query) ||
      idea.excerpt.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  switch (selectedFilter.value) {
    case 'most-voted':
      result.sort((a, b) => b.votes - a.votes)
      break
    case 'most-discussed':
      result.sort((a, b) => b.comments - a.comments)
      break
    case 'recent':
    default:
      result.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  return result
})

const paginatedIdeas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredIdeas.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredIdeas.value.length / itemsPerPage)
})

// Methods
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

const handleFilter = (filter: string) => {
  selectedFilter.value = filter
  currentPage.value = 1
}

const handleVote = (ideaId: string, direction: 'up' | 'down') => {
  // API call to vote
  $fetch(`/api/ideas/${ideaId}/vote`, {
    method: 'POST',
    body: { direction }
  })
}

const handleComment = (ideaId: string) => {
  navigateTo(`/ideas/${ideaId}`)
}

// Set page title
useHead({
  title: t('ideas.allIdeas')
})
</script>

<style scoped>
.ideas-page {
  background-color: var(--color-surface);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
```

---

## Component: IdeaCard.vue

```vue
<template>
  <div class="idea-card">
    <!-- Category Badge -->
    <div class="card-badge">
      {{ idea.category.toUpperCase() }}
    </div>

    <!-- Title -->
    <h2 class="card-title">{{ idea.title }}</h2>

    <!-- Metadata Row -->
    <div class="card-metadata">
      <div class="author-info">
        <img
          :src="idea.authorAvatar"
          :alt="idea.author"
          class="author-avatar"
        />
        <span class="author-name">{{ idea.author }}</span>
      </div>
      <span class="dot">•</span>
      <time class="posted-date">{{ formatDate(idea.date) }}</time>
    </div>

    <!-- Excerpt -->
    <p class="card-excerpt">{{ idea.excerpt }}</p>

    <!-- Engagement Footer -->
    <div class="engagement-footer">
      <button
        class="vote-button"
        :class="{ active: idea.userVote === 'up' }"
        @click="$emit('vote', idea.id, 'up')"
      >
        <Icon name="ThumbsUp" size="18" />
        <span class="vote-count">{{ idea.votes }}</span>
      </button>

      <button
        class="vote-button"
        :class="{ active: idea.userVote === 'down' }"
        @click="$emit('vote', idea.id, 'down')"
      >
        <Icon name="ThumbsDown" size="18" />
        <span class="vote-count">{{ idea.downvotes }}</span>
      </button>

      <button
        class="comment-button"
        @click="$emit('comment', idea.id)"
      >
        <Icon name="MessageCircle" size="18" />
        <span class="comment-count">{{ idea.comments }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Idea {
  id: string
  title: string
  author: string
  authorAvatar: string
  date: string
  excerpt: string
  category: string
  votes: number
  downvotes: number
  comments: number
  userVote?: 'up' | 'down' | null
}

defineProps<{
  idea: Idea
}>()

defineEmits<{
  vote: [ideaId: string, direction: 'up' | 'down']
  comment: [ideaId: string]
}>()

const formatDate = (date: string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.idea-card {
  background-color: var(--color-surface-lowest);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);

  /* Layering effect: card on surface-low background */
  transition: box-shadow var(--transition-normal);
  cursor: pointer;
}

.idea-card:hover {
  box-shadow: var(--shadow-ambient);
}

.card-badge {
  display: inline-block;
  background-color: var(--color-primary-container);
  color: var(--color-text-white);
  padding: var(--spacing-2) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-label-sm);
  font-weight: 600;
  letter-spacing: var(--letter-spacing-caps);
  width: fit-content;
}

.card-title {
  margin: 0;
  font-family: var(--font-family-headline);
  font-size: var(--font-size-title-md);
  font-weight: 700;
  color: var(--color-text-primary);
  line-clamp: 2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-metadata {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  font-size: var(--font-size-body-sm);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.author-name {
  font-family: var(--font-family-headline);
  color: var(--color-text-primary);
  font-size: var(--font-size-body-sm);
}

.dot {
  color: var(--color-text-secondary);
}

.posted-date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-label-sm);
}

.card-excerpt {
  margin: 0;
  color: var(--color-text-primary);
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-sm);
  line-height: 1.5;
  line-clamp: 2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex-grow: 1;
}

.engagement-footer {
  display: flex;
  gap: var(--spacing-2);
  padding-top: var(--spacing-3);
  margin-top: auto;
  /* No top border - rely on spacing */
}

.vote-button,
.comment-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-body-sm);
  padding: 0;
  transition: color var(--transition-fast);
}

.vote-button:hover,
.comment-button:hover {
  color: var(--color-coral);
}

.vote-button.active {
  color: var(--color-coral);
  font-weight: 600;
}

.vote-count,
.comment-count {
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-sm);
}
</style>
```

---

## Component: SearchBar.vue

```vue
<template>
  <div class="search-container">
    <Icon name="Search" class="search-icon" />
    <input
      v-model="localQuery"
      type="text"
      :placeholder="t('ideas.searchPlaceholder')"
      class="search-input"
      @change="emitSearch"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localQuery = ref(props.modelValue)

const emitSearch = () => {
  emit('update:modelValue', localQuery.value)
}
</script>

<style scoped>
.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-3);
  color: var(--color-text-secondary);
  pointer-events: none;
  width: 20px;
  height: 20px;
}

.search-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-3) var(--spacing-5);
  background-color: var(--color-surface-highest);
  border: none;
  border-bottom: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-md);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-bottom: 2px solid var(--color-coral);
  background-color: var(--color-surface-lowest);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}
</style>
```

---

## Component: FilterChips.vue

```vue
<template>
  <div class="filter-chips">
    <button
      v-for="option in filters"
      :key="option.value"
      class="filter-chip"
      :class="{ active: modelValue === option.value }"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const filters = [
  { label: t('ideas.filter.recent'), value: 'recent' },
  { label: t('ideas.filter.mostVoted'), value: 'most-voted' },
  { label: t('ideas.filter.mostDiscussed'), value: 'most-discussed' },
  { label: t('ideas.filter.allCategories'), value: 'all' },
]
</script>

<style scoped>
.filter-chips {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  margin-top: var(--spacing-3);
}

.filter-chip {
  padding: var(--spacing-2) var(--spacing-3);
  background: none;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-chip:hover {
  border-color: var(--color-primary);
  background-color: var(--color-surface-low);
}

.filter-chip.active {
  background-color: var(--color-primary-fixed);
  color: var(--color-primary);
  border-color: var(--color-primary-fixed);
  font-weight: 600;
}
</style>
```

---

## Component: IdeasPagination.vue

```vue
<template>
  <div class="pagination">
    <!-- Previous Button -->
    <button
      class="pagination-btn prev"
      :disabled="currentPage === 1"
      @click="$emit('change-page', currentPage - 1)"
    >
      ← {{ t('common.previous') }}
    </button>

    <!-- Page Numbers -->
    <div class="page-numbers">
      <template v-for="page in pageButtons" :key="page">
        <span v-if="page === '...'" class="ellipsis">...</span>
        <button
          v-else
          class="pagination-btn"
          :class="{ active: page === currentPage }"
          @click="$emit('change-page', page)"
        >
          {{ page }}
        </button>
      </template>
    </div>

    <!-- Next Button -->
    <button
      class="pagination-btn next"
      :disabled="currentPage === totalPages"
      @click="$emit('change-page', currentPage + 1)"
    >
      {{ t('common.next') }} →
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

defineEmits<{
  'change-page': [page: number]
}>()

const pageButtons = computed(() => {
  const pages = []
  const maxVisible = 5

  if (props.totalPages <= maxVisible) {
    return Array.from({ length: props.totalPages }, (_, i) => i + 1)
  }

  // Always show first page
  pages.push(1)

  // Calculate range around current page
  const start = Math.max(2, props.currentPage - 1)
  const end = Math.min(props.totalPages - 1, props.currentPage + 1)

  if (start > 2) pages.push('...')

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < props.totalPages - 1) pages.push('...')

  // Always show last page
  pages.push(props.totalPages)

  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-2);
  margin: var(--spacing-6) 0;
  flex-wrap: wrap;
}

.page-numbers {
  display: flex;
  gap: var(--spacing-1);
  align-items: center;
}

.pagination-btn {
  padding: var(--spacing-2) var(--spacing-3);
  background: none;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--color-surface-low);
  border-color: var(--color-primary);
}

.pagination-btn.active {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
  color: white;
  border: none;
  font-weight: 600;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ellipsis {
  color: var(--color-text-secondary);
  padding: 0 var(--spacing-1);
}

.prev,
.next {
  min-width: 120px;
}
</style>
```

---

## Responsive CSS Grid Helper

Add to `/app/styles/ideas.css`:

```css
@media (min-width: 1200px) {
  .ideas-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-4);
  }

  .hero-section {
    margin-left: var(--spacing-8);
    margin-right: var(--spacing-7);
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .ideas-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-4);
  }

  .hero-section {
    margin-left: 4rem;
    margin-right: 3rem;
  }
}

@media (max-width: 767px) {
  .ideas-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }

  .hero-section {
    margin-left: var(--spacing-4);
    margin-right: var(--spacing-4);
  }

  .filter-chips {
    overflow-x: auto;
    padding-bottom: var(--spacing-2);
  }

  .pagination {
    gap: var(--spacing-1);
  }

  .pagination-btn {
    padding: var(--spacing-2) var(--spacing-2);
    font-size: var(--font-size-label-sm);
  }
}
```

---

## API Integration Example

Create `/server/api/ideas/index.get.ts`:

```typescript
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page = 1, sort = 'recent', search = '' } = query

  // Fetch from database
  const ideas = await db.ideas.find({
    ...(search && {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ]
    })
  })

  // Sort
  switch (sort) {
    case 'most-voted':
      ideas.sort((a, b) => b.votes - a.votes)
      break
    case 'most-discussed':
      ideas.sort((a, b) => b.comments - a.comments)
      break
    case 'recent':
    default:
      ideas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Paginate
  const itemsPerPage = 12
  const start = (page - 1) * itemsPerPage
  const end = start + itemsPerPage

  return {
    data: ideas.slice(start, end),
    total: ideas.length,
    page,
    totalPages: Math.ceil(ideas.length / itemsPerPage)
  }
})
```

---

## i18n Configuration

Add to your i18n messages files:

**en.json:**
```json
{
  "ideas": {
    "allIdeas": "All Ideas",
    "exploreTitle": "Explore All Community Ideas",
    "exploreSubtitle": "Browse and support innovative ideas shaping Cuba's future",
    "searchPlaceholder": "Search ideas by title or content...",
    "filter": {
      "recent": "Recent",
      "mostVoted": "Most Voted",
      "mostDiscussed": "Most Discussed",
      "allCategories": "All Categories"
    }
  }
}
```

---

## Summary

This implementation guide provides:
1. Complete Vue 3 Composition API components
2. Design token mapping to CSS variables
3. Responsive design breakpoints
4. API integration patterns
5. i18n support for multi-language support
6. Accessibility considerations
7. Type safety with TypeScript

All components follow the "Empowered Editorial" design system with teal primary colors, coral accents, and clean typography. The layout uses surface layering instead of borders, generous whitespace, and maintains the civic platform's professional aesthetic.
