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
  gap: 0.25rem;
}

.lang-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.lang-btn:hover {
  opacity: 1;
}

.lang-btn.active {
  opacity: 1;
  border-color: white;
  font-weight: 700;
}
</style>
