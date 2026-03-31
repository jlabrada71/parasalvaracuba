<template>
  <span :class="['ds-badge', `ds-badge-${variant}`]">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  }>(),
  {
    variant: 'primary',
  }
)
</script>

<style scoped>
.ds-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-label-md);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-sm);
  text-transform: uppercase;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.ds-badge-primary {
  background-color: var(--color-primary-fixed);
  color: var(--color-on-primary-fixed);
}

.ds-badge-secondary {
  background-color: var(--color-secondary-fixed);
  color: var(--color-on-secondary-fixed);
}

.ds-badge-success {
  background-color: #c8e6c9;
  color: #1b5e20;
}

.ds-badge-warning {
  background-color: #ffe0b2;
  color: #e65100;
}

.ds-badge-error {
  background-color: var(--color-error-container);
  color: var(--color-on-error-container);
}
</style>
