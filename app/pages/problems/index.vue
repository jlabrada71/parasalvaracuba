<template>
  <div class="problems-page">
    <Navigation />

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">{{ $t('problems.title') }}</h1>
        <p class="hero-subtitle">{{ $t('problems.subtitle') }}</p>

        <!-- Search Bar -->
        <div class="search-container">
          <input
            v-model="search"
            type="text"
            :placeholder="$t('problems.searchPlaceholder')"
            class="search-input"
            @input="onSearchChange"
          />
        </div>

        <!-- Filter Chips -->
        <div class="filter-chips">
          <button
            :class="['chip', { 'chip-active': sort === 'top' }]"
            @click="setSort('top')"
          >
            {{ $t('problems.filterTop') }}
          </button>
          <button
            :class="['chip', { 'chip-active': sort === 'recent' }]"
            @click="setSort('recent')"
          >
            {{ $t('problems.filterRecent') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Problems Grid Section -->
    <section class="problems-section">
      <div class="section-container">
        <div v-if="pending" class="loading">{{ $t('problems.loading') }}</div>
        <div v-else-if="error" class="error">{{ $t('problems.error') }}</div>
        <div v-else-if="problems.length === 0" class="empty">{{ $t('problems.noResults') }}</div>

        <div v-else class="problems-grid">
          <div v-for="problem in problems" :key="problem.id" class="problem-card">
            <div class="problem-card-header">
              <h3 class="problem-title">{{ problem.title }}</h3>
            </div>

            <p class="problem-excerpt">{{ truncateDescription(problem.description, 100) }}</p>

            <div class="problem-meta">
              <p class="meta-text">{{ $t('problems.by', { author: maskEmail(problem.email) }) }} · {{ formatDate(problem.created_at) }}</p>
              <div class="vote-count">{{ problem.net_votes }}</div>
            </div>

            <NuxtLink :to="localePath(`/problems/${problem.id}`)" class="view-btn">
              <Button variant="primary" size="md">{{ $t('problems.viewProblem') }}</Button>
            </NuxtLink>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="problems.length > 0 && hasMore" class="pagination">
          <button
            :disabled="page === 1 || pending"
            class="pagination-btn"
            @click="previousPage"
          >
            {{ $t('problems.prev') }}
          </button>

          <div class="page-numbers">
            <span class="page-info">{{ $t('problems.page') }} {{ page }}</span>
          </div>

          <button
            :disabled="pending"
            class="pagination-btn"
            @click="nextPage"
          >
            {{ $t('problems.next') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>Para Salvar A Cuba</h3>
        </div>
        <div class="footer-links">
          <NuxtLink :to="localePath('/privacy')" class="footer-link">{{ $t('footer.privacy') }}</NuxtLink>
          <NuxtLink :to="localePath('/terms')" class="footer-link">{{ $t('footer.terms') }}</NuxtLink>
          <LanguageSwitcher />
        </div>
      </div>
      <div class="footer-bottom">
        <p>{{ $t('footer.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navigation from '~/components/Navigation.vue'
import { maskEmail } from '~/utils/emailValidation'
import { Button } from '@/components/design-system'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const localePath = useLocalePath()
const { t } = useI18n()

useSeoMeta({
  title: () => t('problems.title'),
  description: () => t('problems.subtitle'),
  ogTitle: () => t('problems.title'),
  ogDescription: () => t('problems.subtitle'),
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
defineOgImage('Default', { title: t('problems.title'), description: t('problems.subtitle') })

interface Problem {
  id: string
  title: string
  description: string
  email: string
  created_at: string
  net_votes: number
}

const page = ref(1)
const search = ref('')
const sort = ref<'top' | 'recent'>('top')
const problems = ref<Problem[]>([])
const hasMore = ref(false)
const pending = ref(false)
const error = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function fetchProblems(p: number = 1) {
  pending.value = true
  error.value = false
  try {
    const params = new URLSearchParams()
    params.append('page', String(p))
    params.append('sort', sort.value)
    if (search.value) params.append('search', search.value)

    const data = await $fetch<{ problems: Problem[]; page: number; limit: number }>(
      `/api/problems?${params.toString()}`
    )

    problems.value = data.problems
    hasMore.value = data.problems.length === data.limit
    page.value = p
  } catch {
    error.value = true
  } finally {
    pending.value = false
  }
}

function onSearchChange() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchProblems(1)
  }, 300)
}

function setSort(newSort: 'top' | 'recent') {
  sort.value = newSort
  fetchProblems(1)
}

function previousPage() {
  if (page.value > 1) fetchProblems(page.value - 1)
}

function nextPage() {
  fetchProblems(page.value + 1)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CU', { year: 'numeric', month: 'short', day: 'numeric' })
}

function truncateDescription(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

fetchProblems(1)
</script>

<style scoped>
.problems-page {
  background-color: var(--color-background);
  color: var(--color-on-surface);
  min-height: 100vh;
}

.hero {
  background: linear-gradient(135deg, rgba(246, 250, 249, 0.9) 0%, rgba(240, 244, 243, 0.7) 100%);
  padding: var(--spacing-16) var(--spacing-4);
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.hero-title {
  font-family: var(--font-headline);
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-4);
  color: var(--color-on-surface);
}

.hero-subtitle {
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface-variant);
  margin-bottom: var(--spacing-8);
  line-height: var(--line-height-relaxed);
}

.search-container {
  margin-bottom: var(--spacing-8);
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: var(--spacing-3) var(--spacing-4);
  border: none;
  border-bottom: 2px solid var(--color-outline-variant);
  border-radius: 0;
  font-size: var(--font-size-body-md);
  font-family: var(--font-body);
  background-color: transparent;
  color: var(--color-on-surface);
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-bottom-color: var(--color-primary);
}

.search-input::placeholder {
  color: var(--color-on-surface-variant);
}

.filter-chips {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  flex-wrap: wrap;
}

.chip {
  padding: var(--spacing-2) var(--spacing-4);
  border: 2px solid var(--color-outline-variant);
  background-color: transparent;
  color: var(--color-on-surface);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-body-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.chip-active {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.problems-section {
  padding: var(--spacing-16) 0;
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

.problems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.problem-card {
  background: white;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
}

.problem-card:hover {
  box-shadow: var(--shadow-elevation-2);
  transform: translateY(-2px);
}

.problem-card-header {
  margin-bottom: var(--spacing-4);
}

.problem-title {
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-sm);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-on-surface);
  line-height: var(--line-height-tight);
}

.problem-excerpt {
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface);
  margin: var(--spacing-3) 0;
  line-height: var(--line-height-normal);
  flex: 1;
}

.problem-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--spacing-4) 0;
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-outline-variant);
}

.meta-text {
  font-size: var(--font-size-body-sm);
  color: var(--color-on-surface-variant);
  margin: 0;
}

.vote-count {
  font-family: var(--font-label);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-label-lg);
  color: var(--color-primary);
}

.view-btn {
  text-decoration: none;
  display: block;
}

.loading,
.empty,
.error {
  padding: var(--spacing-12) 0;
  text-align: center;
  color: var(--color-on-surface-variant);
  font-size: var(--font-size-body-lg);
}

.error {
  color: var(--color-error);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-6);
  margin-top: var(--spacing-12);
  padding-top: var(--spacing-8);
  border-top: 1px solid var(--color-outline-variant);
}

.pagination-btn {
  padding: var(--spacing-3) var(--spacing-6);
  border: 1px solid var(--color-outline-variant);
  background-color: transparent;
  color: var(--color-on-surface);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-body-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface-variant);
}

.footer {
  background-color: var(--color-surface-container-high);
  padding: var(--spacing-8) 0;
  margin-top: var(--spacing-12);
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-6);
}

.footer-brand h3 {
  margin: 0;
  font-size: var(--font-size-body-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
}

.footer-links {
  display: flex;
  gap: var(--spacing-6);
  align-items: center;
}

.footer-link {
  text-decoration: none;
  color: var(--color-on-surface);
  font-size: var(--font-size-body-sm);
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-primary);
}

.footer-bottom {
  max-width: 1280px;
  margin: var(--spacing-4) auto 0;
  padding: var(--spacing-4) var(--spacing-4) 0;
  text-align: center;
  border-top: 1px solid var(--color-outline-variant);
  color: var(--color-on-surface-variant);
  font-size: var(--font-size-body-sm);
}

.footer-bottom p {
  margin: 0;
  padding: var(--spacing-4) 0;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 1.75rem;
  }

  .problems-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .pagination-btn {
    width: 100%;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
