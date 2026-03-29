<template>
  <div class="lang-switcher">
    <NuxtLink
      v-for="loc in localeOptions"
      :key="loc.code"
      :to="switchLocalePath(loc.code)"
      :class="['lang-btn', { active: loc.code === locale }]"
      :aria-current="loc.code === locale ? 'true' : undefined"
    >
      {{ loc.name }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const localeOptions = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
]
</script>


<style scoped>
.lang-switcher {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}
.lang-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  min-width: 44px;
  padding: var(--spacing-1) var(--spacing-3);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: var(--color-on-primary);
  border-radius: var(--radius-sm);
  font-family: var(--font-label);
  font-size: var(--font-size-label-md);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  opacity: 0.75;
  transition: opacity var(--transition-fast), border-color var(--transition-fast),
              background-color var(--transition-fast);
}
.lang-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}
.lang-btn:focus-visible {
  outline: 2px solid var(--color-on-primary);
  outline-offset: 2px;
  opacity: 1;
}
.lang-btn.active {
  opacity: 1;
  border-color: rgba(255, 255, 255, 0.8);
  font-weight: var(--font-weight-semi-bold);
  background: rgba(255, 255, 255, 0.15);
}
</style>
