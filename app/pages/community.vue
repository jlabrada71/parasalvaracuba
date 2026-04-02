<template>
  <div class="community-page">
    <Navigation />

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="logo-container">
          <CommunityLogo :size="120" />
        </div>
        <h1 class="hero-title">{{ $t('community.title') }}</h1>
        <p class="hero-subtitle">{{ $t('community.subtitle') }}</p>
      </div>
    </section>

    <!-- Community Stats Section -->
    <section class="stats-section">
      <div class="section-container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">💡</div>
            <div class="stat-number">{{ ideaCount }}</div>
            <div class="stat-label">{{ $t('community.ideasSubmitted') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚠️</div>
            <div class="stat-number">{{ problemCount }}</div>
            <div class="stat-label">{{ $t('community.problemsReported') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-number">{{ participantCount }}</div>
            <div class="stat-label">{{ $t('community.participants') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-number">{{ totalVotes }}</div>
            <div class="stat-label">{{ $t('community.votes') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Community Mission Section -->
    <section class="mission-section">
      <div class="section-container">
        <h2 class="section-title">{{ $t('community.mission') }}</h2>
        <div class="mission-content">
          <p>{{ $t('community.missionText') }}</p>
        </div>
      </div>
    </section>

    <!-- Community Values Section -->
    <section class="values-section">
      <div class="section-container">
        <h2 class="section-title">{{ $t('community.values') }}</h2>
        <div class="values-grid">
          <div class="value-card">
            <h3 class="value-title">{{ $t('community.participationTitle') }}</h3>
            <p class="value-text">{{ $t('community.participationText') }}</p>
          </div>
          <div class="value-card">
            <h3 class="value-title">{{ $t('community.inclusivityTitle') }}</h3>
            <p class="value-text">{{ $t('community.inclusivityText') }}</p>
          </div>
          <div class="value-card">
            <h3 class="value-title">{{ $t('community.transparencyTitle') }}</h3>
            <p class="value-text">{{ $t('community.transparencyText') }}</p>
          </div>
          <div class="value-card">
            <h3 class="value-title">{{ $t('community.actionTitle') }}</h3>
            <p class="value-text">{{ $t('community.actionText') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">{{ $t('community.joinTitle') }}</h2>
        <p class="cta-subtitle">{{ $t('community.joinSubtitle') }}</p>
        <NuxtLink :to="localePath('/ideas/create')" class="cta-button">
          <Button variant="primary" size="lg">{{ $t('community.joinButton') }}</Button>
        </NuxtLink>
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
import { ref, onMounted } from 'vue'
import Navigation from '~/components/Navigation.vue'
import { Button } from '@/components/design-system'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'
import CommunityLogo from '~/components/CommunityLogo.vue'

const localePath = useLocalePath()
const { t } = useI18n()

useSeoMeta({
  title: () => t('community.title'),
  description: () => t('community.subtitle'),
  ogTitle: () => t('community.title'),
  ogDescription: () => t('community.subtitle'),
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
defineOgImage('Default', { title: t('community.title'), description: t('community.subtitle') })

const ideaCount = ref(0)
const problemCount = ref(0)
const participantCount = ref(0)
const totalVotes = ref(0)

onMounted(async () => {
  try {
    const data = await $fetch<{
      ideas: number
      problems: number
      participants: number
      votes: number
    }>('/api/community/stats')

    ideaCount.value = data.ideas
    problemCount.value = data.problems
    participantCount.value = data.participants
    totalVotes.value = data.votes
  } catch (error) {
    console.error('Failed to load community stats:', error)
    ideaCount.value = 0
    problemCount.value = 0
    participantCount.value = 0
    totalVotes.value = 0
  }
})
</script>

<style scoped>
.community-page {
  background-color: var(--color-background);
  color: var(--color-on-surface);
  min-height: 100vh;
}


/* Hero Section */
.hero {
  background: linear-gradient(135deg, rgba(246, 250, 249, 0.9) 0%, rgba(240, 244, 243, 0.7) 100%);
  padding: var(--spacing-16) var(--spacing-4);
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.logo-container {
  margin-bottom: var(--spacing-8);
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

/* Stats Section */
.stats-section {
  padding: var(--spacing-12) 0;
  background-color: var(--color-surface-container-low);
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-6);
}

.stat-card {
  background: white;
  padding: var(--spacing-8);
  border-radius: var(--radius-xl);
  text-align: center;
  box-shadow: var(--shadow-elevation-1);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-4);
}

.stat-number {
  font-family: var(--font-headline);
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-2);
}

.stat-label {
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface-variant);
}

/* Mission Section */
.mission-section {
  padding: var(--spacing-12) 0;
}

.section-title {
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-8);
  text-align: center;
  color: var(--color-on-surface);
}

.mission-content {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.mission-content p {
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface);
  line-height: var(--line-height-relaxed);
}

/* Values Section */
.values-section {
  padding: var(--spacing-12) 0;
  background-color: var(--color-surface-container-low);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-6);
}

.value-card {
  background: white;
  padding: var(--spacing-6);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-primary);
}

.value-title {
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-sm);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-3);
  color: var(--color-on-surface);
}

.value-text {
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface-variant);
  line-height: var(--line-height-normal);
  margin: 0;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #f0f4f3, #ebefee);
  padding: var(--spacing-16) var(--spacing-4);
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  font-family: var(--font-headline);
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-4);
  color: var(--color-on-surface);
}

.cta-subtitle {
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface-variant);
  margin-bottom: var(--spacing-8);
  line-height: var(--line-height-relaxed);
}

.cta-button {
  text-decoration: none;
  display: inline-block;
}

/* Footer */
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

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .values-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
