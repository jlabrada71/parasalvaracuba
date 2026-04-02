<template>
  <div class="about-page">
    <Navigation />

    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg-image" aria-hidden="true"></div>
      <div class="hero-gradient-overlay" aria-hidden="true"></div>
      <div class="hero-content-grid">
        <div class="hero-col">
          <span class="hero-tagline">{{ $t('about.heroTagline') }}</span>
          <h1 class="hero-title">
            {{ $t('about.heroTitleLine1') }}<br />
            <span class="hero-title-accent">{{ $t('about.heroTitleLine2') }}</span>
          </h1>
          <p class="hero-subtitle">{{ $t('about.heroSubtitle') }}</p>
          <div class="hero-actions">
            <NuxtLink :to="localePath('/ideas/create')" class="btn-primary">
              {{ $t('about.ctaButton') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/ideas')" class="btn-ghost">
              {{ $t('home.exploreIdeas') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Story -->
    <section class="story-section">
      <div class="section-container story-grid">
        <div class="story-quote-col">
          <blockquote class="pull-quote">{{ $t('about.storyQuote') }}</blockquote>
        </div>
        <div class="story-body-col">
          <h2 class="section-heading">{{ $t('about.storyTitle') }}</h2>
          <p class="body-lg">{{ $t('about.storyBody') }}</p>
          <div class="story-logo-wrap">
            <OuroborosLogo :size="72" />
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-section">
      <div class="section-container">
        <h2 class="section-heading centered">{{ $t('about.howTitle') }}</h2>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-icon-circle icon-teal">
              <span class="material-symbols-outlined">lightbulb</span>
            </div>
            <div class="step-number">01</div>
            <h3 class="step-title">{{ $t('about.step1Title') }}</h3>
            <p class="step-desc">{{ $t('about.step1Desc') }}</p>
          </div>
          <div class="step-card">
            <div class="step-icon-circle icon-coral">
              <span class="material-symbols-outlined">forum</span>
            </div>
            <div class="step-number">02</div>
            <h3 class="step-title">{{ $t('about.step2Title') }}</h3>
            <p class="step-desc">{{ $t('about.step2Desc') }}</p>
          </div>
          <div class="step-card">
            <div class="step-icon-circle icon-teal">
              <span class="material-symbols-outlined">rocket_launch</span>
            </div>
            <div class="step-number">03</div>
            <h3 class="step-title">{{ $t('about.step3Title') }}</h3>
            <p class="step-desc">{{ $t('about.step3Desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="values-section">
      <div class="section-container">
        <h2 class="section-heading centered">{{ $t('about.valuesTitle') }}</h2>
        <div class="values-grid">
          <div class="value-card">
            <div class="step-icon-circle icon-teal">
              <span class="material-symbols-outlined">flight</span>
            </div>
            <h3 class="value-title">{{ $t('about.value1Title') }}</h3>
            <p class="value-desc">{{ $t('about.value1Desc') }}</p>
          </div>
          <div class="value-card">
            <div class="step-icon-circle icon-teal">
              <span class="material-symbols-outlined">visibility</span>
            </div>
            <h3 class="value-title">{{ $t('about.value2Title') }}</h3>
            <p class="value-desc">{{ $t('about.value2Desc') }}</p>
          </div>
          <div class="value-card">
            <div class="step-icon-circle icon-coral">
              <span class="material-symbols-outlined">handshake</span>
            </div>
            <h3 class="value-title">{{ $t('about.value3Title') }}</h3>
            <p class="value-desc">{{ $t('about.value3Desc') }}</p>
          </div>
          <div class="value-card">
            <div class="step-icon-circle icon-coral">
              <span class="material-symbols-outlined">bolt</span>
            </div>
            <h3 class="value-title">{{ $t('about.value4Title') }}</h3>
            <p class="value-desc">{{ $t('about.value4Desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-card">
          <div class="cta-glow cta-glow-top" aria-hidden="true"></div>
          <div class="cta-glow cta-glow-bottom" aria-hidden="true"></div>
          <div class="cta-inner">
            <OuroborosLogo :size="56" />
            <h2 class="cta-title">{{ $t('about.ctaTitle') }}</h2>
            <p class="cta-subtitle">{{ $t('about.ctaSubtitle') }}</p>
            <NuxtLink :to="localePath('/ideas/create')" class="btn-coral">
              {{ $t('about.ctaButton') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <OuroborosLogo :size="28" />
          <span>Para Salvar A Cuba</span>
        </div>
        <div class="footer-links">
          <NuxtLink :to="localePath('/privacy')" class="footer-link">{{ $t('footer.privacy') }}</NuxtLink>
          <NuxtLink :to="localePath('/terms')" class="footer-link">{{ $t('footer.terms') }}</NuxtLink>
          <LanguageSwitcher />
        </div>
        <p class="footer-copy">{{ $t('footer.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Navigation from '~/components/Navigation.vue'
import OuroborosLogo from '~/components/OuroborosLogo.vue'
import LanguageSwitcher from '~/components/LanguageSwitcher.vue'

const localePath = useLocalePath()
const { t } = useI18n()

useSeoMeta({
  title: () => t('about.heroTitle'),
  description: () => t('about.heroSubtitle'),
  ogTitle: () => t('about.heroTitle'),
  ogDescription: () => t('about.heroSubtitle'),
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
defineOgImage('Default', { title: t('about.heroTitle'), description: t('about.heroSubtitle') })
</script>

<style scoped>
/* ─── Base ─────────────────────────────────── */
.about-page {
  background-color: var(--color-background);
  color: var(--color-on-surface);
  min-height: 100vh;
  font-family: var(--font-body);
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-8);
}

.section-heading {
  font-family: var(--font-headline);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-on-surface);
  margin: 0 0 var(--spacing-6);
  line-height: 1.1;
}

.section-heading.centered {
  text-align: center;
  margin-bottom: var(--spacing-12);
}

.body-lg {
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface-variant);
  line-height: 1.75;
  margin: 0;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* ─── Hero ─────────────────────────────────── */
.hero {
  position: relative;
  min-height: 780px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg-image {
  position: absolute;
  inset: 0;
  background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuB4F8O5We7BS1DvyKa0Y0YgBCYLWt6ZB_laiHgJe-faH7Kle_o3AEBBE-q9yxRZv9GM56Pidn7SNkuIfrqApICiF1GG5bI_Ql3olqGk3fJEmiRnhewUnpoYxN55JEFofuGO0dz8fTv6Clv3-FJpzIPBXur9x9pgxos79EQalCawAKHQlUkP4RLPaiuxqKlfTLk5Tc6JJlBl8vW-I7MpNCyjY5BfT2VjufxQxZNrzrKjVOMo1cWRRAefMwS85eiVm3duMVFh3t7yyik');
  background-size: cover;
  background-position: center;
  opacity: 0.15;
  mix-blend-mode: multiply;
}

.hero-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(246,250,249,0.92) 0%, rgba(240,244,243,0.75) 100%);
}

.hero-content-grid {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--spacing-20) var(--spacing-8);
}

.hero-col {
  max-width: 700px;
  margin-left: clamp(0px, 8vw, 8.5rem);
}

.hero-tagline {
  display: inline-block;
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  background-color: var(--color-secondary-fixed);
  color: var(--color-on-secondary-fixed);
  font-size: var(--font-size-label-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-6);
}

.hero-title {
  font-family: var(--font-headline);
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 0.95;
  color: var(--color-on-background);
  margin: 0 0 var(--spacing-8);
}

.hero-title-accent {
  color: var(--color-primary-container);
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.375rem);
  color: var(--color-on-surface-variant);
  line-height: 1.7;
  max-width: 560px;
  margin: 0 0 var(--spacing-10);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, #006565 0%, #008080 100%);
  color: var(--color-on-primary);
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: var(--font-size-body-lg);
  text-decoration: none;
  transition: opacity 0.2s, transform 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  border-radius: var(--radius-xl);
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: var(--font-size-body-lg);
  text-decoration: none;
  transition: background-color 0.2s;
}

.btn-ghost:hover {
  background-color: var(--color-surface-container-high);
}

/* ─── Story ─────────────────────────────────── */
.story-section {
  padding: var(--spacing-24) 0;
  background-color: var(--color-surface-container-lowest);
}

.story-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: var(--spacing-16);
  align-items: center;
}

.pull-quote {
  font-family: var(--font-headline);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.35;
  margin: 0;
  padding-left: var(--spacing-6);
  border-left: 4px solid var(--color-primary-container);
}

.story-logo-wrap {
  margin-top: var(--spacing-8);
  opacity: 0.5;
}

/* ─── How It Works ─────────────────────────── */
.how-section {
  padding: var(--spacing-24) 0;
  background-color: var(--color-surface-container-low);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-8);
}

.step-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  transition: transform 0.2s;
}

.step-card:hover {
  transform: translateY(-4px);
}

.step-icon-circle {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-6);
}

.icon-teal {
  background-color: var(--color-primary-fixed);
}

.icon-teal .material-symbols-outlined {
  color: var(--color-primary-container);
  font-size: 1.75rem;
}

.icon-coral {
  background-color: var(--color-secondary-fixed);
}

.icon-coral .material-symbols-outlined {
  color: var(--color-secondary);
  font-size: 1.75rem;
}

.step-number {
  font-family: var(--font-headline);
  font-size: 2.75rem;
  font-weight: 800;
  color: var(--color-secondary);
  opacity: 0.55;
  line-height: 1;
  margin-bottom: var(--spacing-3);
}

.step-title {
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-sm);
  font-weight: 700;
  color: var(--color-on-surface);
  margin: 0 0 var(--spacing-3);
}

.step-desc {
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface-variant);
  line-height: 1.7;
  margin: 0;
}

/* ─── Values ─────────────────────────────────── */
.values-section {
  padding: var(--spacing-24) 0;
  background-color: var(--color-background);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-8);
}

.value-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  transition: transform 0.2s;
}

.value-card:hover {
  transform: translateY(-4px);
}

.value-title {
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-sm);
  font-weight: 700;
  color: var(--color-on-surface);
  margin: 0 0 var(--spacing-3);
}

.value-desc {
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface-variant);
  line-height: 1.7;
  margin: 0;
}

/* ─── CTA ─────────────────────────────────── */
.cta-section {
  padding: var(--spacing-24) 0;
  background-color: var(--color-surface-container-lowest);
}

.cta-card {
  background-color: var(--color-surface-container-low);
  border-radius: 2rem;
  padding: clamp(3rem, 8vw, 5rem);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-glow {
  position: absolute;
  width: 16rem;
  height: 16rem;
  border-radius: 9999px;
  filter: blur(4rem);
  opacity: 0.3;
  pointer-events: none;
}

.cta-glow-top {
  top: -6rem;
  right: -6rem;
  background-color: var(--color-primary-fixed);
}

.cta-glow-bottom {
  bottom: -6rem;
  left: -6rem;
  background-color: var(--color-secondary-fixed);
}

.cta-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-6);
  max-width: 640px;
  margin: 0 auto;
}

.cta-title {
  font-family: var(--font-headline);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--color-on-surface);
  margin: 0;
}

.cta-subtitle {
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface-variant);
  line-height: 1.7;
  margin: 0;
  max-width: 500px;
}

.btn-coral {
  display: inline-flex;
  align-items: center;
  padding: 1.25rem 3rem;
  border-radius: var(--radius-xl);
  background-color: var(--color-secondary-container);
  color: var(--color-on-secondary);
  font-family: var(--font-headline);
  font-weight: 800;
  font-size: var(--font-size-body-lg);
  text-decoration: none;
  transition: box-shadow 0.2s, transform 0.2s, background-color 0.2s;
}

.btn-coral:hover {
  box-shadow: 0 8px 32px rgba(164, 60, 18, 0.25);
  transform: translateY(-2px);
  background-color: var(--color-secondary);
}

/* ─── Footer ─────────────────────────────────── */
.footer {
  background-color: var(--color-surface-container-low);
  padding: var(--spacing-10) var(--spacing-8);
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  font-weight: 700;
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface);
}

.footer-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
}

.footer-link {
  font-size: var(--font-size-body-sm);
  color: var(--color-on-surface-variant);
  text-decoration: none;
  transition: color 0.15s;
}

.footer-link:hover {
  color: var(--color-primary);
}

.footer-copy {
  font-size: var(--font-size-body-sm);
  color: var(--color-on-surface-variant);
  margin: 0;
}

/* ─── Responsive ─────────────────────────────── */
@media (max-width: 900px) {
  .story-grid,
  .steps-grid,
  .values-grid {
    grid-template-columns: 1fr;
  }

  .hero-col {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .section-container {
    padding: 0 var(--spacing-4);
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-content-grid {
    padding: var(--spacing-16) var(--spacing-4);
  }
}
</style>
