<template>
  <div
    :class="[
      'ds-card',
      { 'ds-card-interactive': interactive, 'ds-card-elevated': elevated }
    ]"
  >
    <header v-if="$slots.header" class="ds-card-header">
      <slot name="header" />
    </header>

    <main class="ds-card-content">
      <slot />
    </main>

    <footer v-if="$slots.footer" class="ds-card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  interactive?: boolean
  elevated?: boolean
}>()
</script>

<style scoped>
.ds-card {
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-elevation-1);
  transition: all var(--transition-normal);
}

.ds-card-interactive:hover {
  box-shadow: var(--shadow-elevation-3);
  transform: translateY(-2px);
  cursor: pointer;
}

.ds-card-elevated {
  box-shadow: var(--shadow-elevation-3);
}

.ds-card-header {
  margin-bottom: var(--spacing-4);
}

.ds-card-content {
  flex: 1;
}

.ds-card-footer {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-outline-variant);
}

@media (prefers-reduced-motion: reduce) {
  .ds-card {
    transition: none;
  }

  .ds-card-interactive:hover {
    transform: none;
  }
}
</style>
