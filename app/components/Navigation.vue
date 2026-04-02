<template>
  <header class="navigation">
    <div class="navigation-content">
      <NuxtLink :to="localePath('/')" class="brand">
        <OuroborosLogo :size="52" />
        <span class="brand-name">Para Salvar A Cuba</span>
      </NuxtLink>

      <nav class="nav-links">
        <NuxtLink :to="localePath('/ideas')" class="nav-link">{{ $t('home.exploreIdeas') }}</NuxtLink>
        <NuxtLink :to="localePath('/problems')" class="nav-link">{{ $t('nav.problems') }}</NuxtLink>
        <NuxtLink :to="localePath('/community')" class="nav-link">{{ $t('nav.community') }}</NuxtLink>
        <NuxtLink :to="localePath('/about')" class="nav-link">{{ $t('nav.about') }}</NuxtLink>
      </nav>

      <div class="nav-ctas">
        <NuxtLink :to="localePath('/ideas/create')" class="nav-cta">
          <Button variant="tertiary" size="md">{{ $t('nav.newIdea') }}</Button>
        </NuxtLink>
        <NuxtLink :to="localePath('/problems/create')" class="nav-cta">
          <Button variant="primary" size="md">{{ $t('nav.newProblem') }}</Button>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Button } from '@/components/design-system'
import OuroborosLogo from './OuroborosLogo.vue'

const localePath = useLocalePath()
</script>

<style scoped>
.navigation {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-outline-variant);
  padding: var(--spacing-3) 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navigation-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-6);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  text-decoration: none;
  white-space: nowrap;
}

.brand-name {
  font-family: var(--font-headline);
  font-size: var(--font-size-title-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
  transition: color var(--transition-fast);
}

.brand:hover .brand-name {
  color: var(--color-primary);
}

.nav-links {
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

.nav-ctas {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.nav-cta {
  text-decoration: none;
  display: inline-block;
}

@media (max-width: 768px) {
  .navigation-content {
    flex-direction: column;
    gap: var(--spacing-3);
    padding: var(--spacing-3) var(--spacing-4);
  }

  .nav-links {
    flex: none;
    gap: var(--spacing-4);
  }

  .brand {
    width: 100%;
    justify-content: center;
  }
}
</style>
