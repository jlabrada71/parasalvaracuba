<template>
  <div class="legal-page">
    <Navigation />

    <main class="legal-main">
      <div class="legal-container">
        <h1 class="legal-title">{{ $t('terms.title') }}</h1>
        <p class="legal-meta">{{ $t('terms.lastUpdated') }}</p>
        <p class="legal-intro">{{ $t('terms.intro') }}</p>

        <section class="legal-section">
          <h2>{{ $t('terms.s1Title') }}</h2>
          <p>{{ $t('terms.s1Body') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ $t('terms.s2Title') }}</h2>
          <p>{{ $t('terms.s2Body') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ $t('terms.s3Title') }}</h2>
          <p>{{ $t('terms.s3Body') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ $t('terms.s4Title') }}</h2>
          <p>{{ $t('terms.s4Body') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ $t('terms.s5Title') }}</h2>
          <p>{{ $t('terms.s5Body') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ $t('terms.s6Title') }}</h2>
          <p>{{ $t('terms.s6Body') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ $t('terms.s7Title') }}</h2>
          <p>{{ $t('terms.s7Body') }}</p>
        </section>

        <section class="legal-section">
          <h2>{{ $t('terms.s8Title') }}</h2>
          <p>{{ $t('terms.s8Body') }}</p>
        </section>
      </div>
    </main>

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
import Navigation from '~/components/Navigation.vue'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const localePath = useLocalePath()
const { t } = useI18n()

useSeoMeta({
  title: () => t('terms.title'),
  description: () => t('terms.intro'),
  ogTitle: () => t('terms.title'),
  ogDescription: () => t('terms.intro'),
})
</script>

<style scoped>
.legal-page {
  background-color: var(--color-background);
  color: var(--color-on-surface);
  min-height: 100vh;
}

.legal-main {
  padding: var(--spacing-16) var(--spacing-4);
}

.legal-container {
  max-width: 720px;
  margin: 0 auto;
}

.legal-title {
  font-family: var(--font-headline);
  font-size: 2.25rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
  margin-bottom: var(--spacing-2);
}

.legal-meta {
  font-size: var(--font-size-body-sm);
  color: var(--color-on-surface-variant);
  margin-bottom: var(--spacing-8);
}

.legal-intro {
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface-variant);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-10);
  padding-bottom: var(--spacing-8);
  border-bottom: 1px solid var(--color-outline-variant);
}

.legal-section {
  margin-bottom: var(--spacing-8);
}

.legal-section h2 {
  font-family: var(--font-headline);
  font-size: var(--font-size-title-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
  margin-bottom: var(--spacing-3);
}

.legal-section p {
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface);
  line-height: var(--line-height-relaxed);
  margin: 0;
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
  .legal-title {
    font-size: 1.75rem;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
