<template>
  <div class="lang-switcher">
    <NuxtLink
      v-for="loc in localeOptions"
      :key="loc.code"
      :to="switchLocalePath(loc.code)"
      :class="['lang-btn', { active: loc.code === locale }]"
      :aria-label="loc.name"
      :aria-current="loc.code === locale ? 'true' : undefined"
    >
      <span class="flag">{{ loc.flag }}</span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const localeOptions = [
  { code: 'es', name: 'Español', flag: '🇨🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
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
  width: 32px;
  height: 32px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  text-decoration: none;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity var(--transition-fast), border-color var(--transition-fast),
              background-color var(--transition-fast);
}
.lang-btn:hover {
  opacity: 0.85;
  background: var(--color-surface-container);
}
.lang-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  opacity: 1;
}
.lang-btn.active {
  opacity: 1;
  border-color: var(--color-outline-variant);
  background: var(--color-surface-container-low);
}
.flag {
  font-size: 1.25rem;
  line-height: 1;
}
</style>
