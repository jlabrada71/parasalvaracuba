<template>
  <section class="ds-hero">
    <div class="ds-hero-content">
      <h1 v-if="title" class="ds-hero-title">
        {{ title }}
      </h1>

      <p v-if="subtitle" class="ds-hero-subtitle">
        {{ subtitle }}
      </p>

      <div v-if="$slots.actions" class="ds-hero-actions">
        <slot name="actions" />
      </div>

      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<style scoped>
.ds-hero {
  position: relative;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  color: var(--color-on-primary);
  padding: var(--spacing-24) var(--spacing-4);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ds-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.ds-hero-content {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
}

.ds-hero-title {
  font-family: var(--font-display);
  font-size: var(--font-size-display-lg);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin: 0 0 var(--spacing-6) 0;
}

.ds-hero-subtitle {
  font-family: var(--font-body);
  font-size: var(--font-size-title-lg);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
  margin: 0 0 var(--spacing-12) 0;
  opacity: 0.95;
}

.ds-hero-actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .ds-hero {
    padding: var(--spacing-12) var(--spacing-4);
    min-height: 300px;
  }

  .ds-hero-title {
    font-size: var(--font-size-headline-lg);
  }

  .ds-hero-subtitle {
    font-size: var(--font-size-title-md);
  }

  .ds-hero-actions {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-hero::before {
    animation: none;
  }
}
</style>
