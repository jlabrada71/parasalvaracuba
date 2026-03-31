<template>
  <div class="home-page">
    <!-- Header Navigation -->
    <header class="header">
      <div class="header-content">
        <div class="header-brand">
          <span class="brand-name">Para Salvar</span>
        </div>
        <nav class="header-nav">
          <a href="#" class="nav-link">{{ $t('home.exploreIdeas') }}</a>
          <a href="#" class="nav-link">{{ $t('nav.community') }}</a>
          <a href="#" class="nav-link">{{ $t('nav.about') }}</a>
        </nav>
        <NuxtLink :to="localePath('/ideas/create')" class="nav-cta-wrapper">
          <Button variant="primary" size="md">{{ $t('nav.newIdea') }}</Button>
        </NuxtLink>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h2 class="hero-tagline">{{ $t('home.tagline') }}</h2>
        <h1 class="hero-title">{{ $t('home.title') }}</h1>
        <p class="hero-subtitle">{{ $t('home.subtitle') }}</p>
        <div class="hero-actions">
          <NuxtLink :to="localePath('/ideas/create')" class="action-link">
            <Button variant="primary">{{ $t('home.exploreIdeas') }}</Button>
          </NuxtLink>
          <button class="btn-secondary">{{ $t('home.howItWorks') }}</button>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works">
      <div class="section-container">
        <div class="how-it-works-grid">
          <div class="how-it-works-card">
            <span class="material-symbols-outlined icon">lightbulb</span>
            <h3>{{ $t('home.propose') }}</h3>
            <p>{{ $t('home.proposeDesc') }}</p>
          </div>
          <div class="how-it-works-card">
            <span class="material-symbols-outlined icon">groups</span>
            <h3>{{ $t('home.buildConsensus') }}</h3>
            <p>{{ $t('home.buildDesc') }}</p>
          </div>
          <div class="how-it-works-card">
            <span class="material-symbols-outlined icon">rocket_launch</span>
            <h3>{{ $t('home.createChange') }}</h3>
            <p>{{ $t('home.createDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Ideas Section -->
    <section class="featured-ideas">
      <div class="section-container">
        <div class="featured-header">
          <h2 class="section-title">{{ $t('home.featuredIdeas') }}</h2>
          <NuxtLink :to="localePath('/ideas')" class="view-all">
            {{ $t('home.viewAll') }} <span>→</span>
          </NuxtLink>
        </div>

        <div v-if="pending" class="loading">{{ $t('home.loading') }}</div>
        <div v-else-if="error" class="error">{{ $t('home.error') }}</div>
        <div v-else-if="ideas.length === 0" class="empty">{{ $t('home.empty') }}</div>

        <div v-else class="ideas-grid">
          <div
            v-for="idea in ideas.slice(0, 3)"
            :key="idea.id"
            class="idea-card"
          >
            <div class="idea-card-header">
              <h3 class="idea-title">{{ idea.title }}</h3>
              <span class="material-symbols-outlined favorite-icon">favorite</span>
            </div>
            <div class="vote-count">{{ idea.net_votes }}</div>
            <p class="idea-excerpt">{{ idea.email }} · {{ formatDate(idea.created_at) }}</p>
            <NuxtLink :to="localePath(`/ideas/${idea.id}`)" class="review-btn">
              <Button variant="primary" size="md">{{ $t('home.reviewProposal') }}</Button>
            </NuxtLink>
          </div>
        </div>

        <div v-if="hasMore" class="pagination">
          <Button :disabled="pending" @click="loadMore" variant="tertiary">{{ $t('home.loadMore') }}</Button>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-content">
          <h2 class="cta-title">{{ $t('home.ctaHeadline') }}</h2>
          <p class="cta-subtitle">{{ $t('home.ctaSubtitle') }}</p>
          <NuxtLink :to="localePath('/ideas/create')" class="cta-link">
            <Button variant="primary">{{ $t('home.shareIdea') }}</Button>
          </NuxtLink>
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
          <a href="#" class="footer-link">{{ $t('footer.privacy') }}</a>
          <a href="#" class="footer-link">{{ $t('footer.terms') }}</a>
          <LanguageSwitcher />
        </div>
      </div>
      <div class="footer-bottom">
        <p>{{ $t('footer.copyright') }}</p>
      </div>
    </footer>

    <EmailCaptureModal
      :visible="modalVisible"
      @saved="onModalSaved"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'
import { Button } from '@/components/design-system'
import { useEmailGate } from '~/composables/useEmailGate'

const localePath = useLocalePath()

interface Idea {
  id: string
  title: string
  email: string
  created_at: string
  net_votes: number
}

const { modalVisible, onModalSaved, onModalClose } = useEmailGate()

const page = ref(1)
const ideas = ref<Idea[]>([])
const hasMore = ref(false)
const pending = ref(false)
const error = ref(false)

async function fetchIdeas(p: number) {
  pending.value = true
  error.value = false
  try {
    const data = await $fetch<{ ideas: Idea[]; page: number; limit: number }>(`/api/ideas?page=${p}`)
    if (p === 1) {
      ideas.value = data.ideas
    } else {
      ideas.value.push(...data.ideas)
    }
    hasMore.value = data.ideas.length === data.limit
  } catch {
    error.value = true
  } finally {
    pending.value = false
  }
}

function loadMore() {
  page.value += 1
  fetchIdeas(page.value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CU', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Initial load
fetchIdeas(1)
</script>

<style scoped>
.home-page {
  background-color: var(--color-background);
  color: var(--color-on-surface);
  min-height: 100vh;
}

/* Header */
.header {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-outline-variant);
  padding: var(--spacing-4) 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-6);
}

.brand-name {
  font-family: var(--font-headline);
  font-size: var(--font-size-title-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
}

.header-nav {
  display: flex;
  gap: var(--spacing-6);
  flex: 1;
  justify-content: center;
}

.nav-link {
  text-decoration: none;
  color: var(--color-on-surface);
  font-size: var(--font-size-body-md);
  font-weight: 500;
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-cta-wrapper {
  text-decoration: none;
  display: inline-block;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, rgba(246, 250, 249, 0.9) 0%, rgba(240, 244, 243, 0.7) 100%);
  padding: var(--spacing-20) var(--spacing-4);
  text-align: center;
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
}

.hero-tagline {
  color: var(--color-on-surface-variant);
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 var(--spacing-4) 0;
}

.hero-title {
  font-family: var(--font-headline);
  font-size: 3.5rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  margin-bottom: var(--spacing-6);
  color: var(--color-on-surface);
}

.hero-subtitle {
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface-variant);
  margin-bottom: var(--spacing-8);
  line-height: var(--line-height-relaxed);
}

.hero-actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
  flex-wrap: wrap;
}

.action-link {
  text-decoration: none;
  display: inline-block;
}

.btn-secondary {
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  background-color: transparent;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: var(--font-size-label-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-secondary:hover {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.btn-secondary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* How It Works Section */
.how-it-works {
  background-color: white;
  padding: var(--spacing-16) 0;
}

.how-it-works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-12);
}

.how-it-works-card {
  text-align: center;
}

.how-it-works-card .icon {
  font-size: 3rem;
  color: var(--color-primary);
  display: block;
  margin-bottom: var(--spacing-4);
}

.how-it-works-card h3 {
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-sm);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
  color: var(--color-on-surface);
}

.how-it-works-card p {
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface-variant);
  line-height: var(--line-height-relaxed);
}

/* Featured Ideas Section */
.featured-ideas {
  padding: var(--spacing-16) 0;
  background-color: var(--color-background);
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

.featured-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-8);
}

.section-title {
  font-family: var(--font-headline);
  font-size: 2.25rem;
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-on-surface);
}

.view-all {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: opacity var(--transition-fast);
}

.view-all:hover {
  opacity: 0.8;
}

.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.idea-card {
  background: white;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
}

.idea-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3);
}

.idea-title {
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-sm);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-on-surface);
  flex: 1;
}

.favorite-icon {
  color: var(--color-secondary);
  font-size: 1.5rem;
  margin-left: var(--spacing-2);
}

.vote-count {
  font-family: var(--font-label);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-label-lg);
  color: var(--color-on-surface);
  margin-bottom: var(--spacing-2);
}

.idea-excerpt {
  font-size: var(--font-size-body-sm);
  color: var(--color-on-surface-variant);
  margin: var(--spacing-3) 0;
  line-height: var(--line-height-normal);
}

.review-btn {
  text-decoration: none;
  display: block;
  width: 100%;
  margin-top: var(--spacing-4);
}

.loading,
.empty,
.error {
  padding: var(--spacing-12) 0;
  text-align: center;
  color: var(--color-on-surface-variant);
}

.error {
  color: var(--color-error);
}

.pagination {
  text-align: center;
  margin-top: var(--spacing-8);
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #f0f4f3 0%, #ebefee 100%);
  padding: var(--spacing-16) 0;
}

.cta-content {
  text-align: center;
}

.cta-title {
  font-family: var(--font-headline);
  font-size: 2.25rem;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-4);
  color: var(--color-on-surface);
}

.cta-subtitle {
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface-variant);
  margin-bottom: var(--spacing-8);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: var(--line-height-relaxed);
}

.cta-link {
  text-decoration: none;
  display: inline-block;
}

/* Footer */
.footer {
  background-color: var(--color-surface-container-high);
  padding: var(--spacing-8) 0;
  margin-top: var(--spacing-8);
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

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .header-nav {
    flex: none;
    gap: var(--spacing-4);
  }

  .hero-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .ideas-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
