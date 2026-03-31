<template>
  <button
    :class="[
      'ds-btn',
      `ds-btn-${variant}`,
      `ds-btn-${size}`,
      { 'ds-btn-disabled': disabled, 'ds-btn-loading': loading }
    ]"
    :disabled="disabled || loading"
    :type="type"
    v-bind="$attrs"
  >
    <span v-if="loading" class="ds-btn-spinner" />
    <Icon v-if="icon && !loading" :name="icon" class="ds-btn-icon" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import Icon from '@/components/Icon.vue'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'tertiary'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    icon?: string
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
  }
)
</script>

<style scoped>
.ds-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-label-lg);
  font-family: var(--font-body);
  cursor: pointer;
  transition: all var(--transition-normal);
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Sizes */
.ds-btn-sm {
  padding: 0.5rem 1rem;
  min-height: 40px;
}

.ds-btn-md {
  padding: 1rem 2rem;
  min-height: 48px;
}

.ds-btn-lg {
  padding: 1.25rem 2.5rem;
  min-height: 56px;
}

/* Variants */
.ds-btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  color: var(--color-on-primary);
  box-shadow: 0 15px 30px rgba(0, 101, 101, 0.15);
}

.ds-btn-primary:hover:not(:disabled) {
  box-shadow: 0 20px 40px rgba(0, 101, 101, 0.25);
  transform: translateY(-2px);
}

.ds-btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.ds-btn-secondary {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
}

.ds-btn-secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-container);
  transform: translateY(-2px);
}

.ds-btn-tertiary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-outline-variant);
}

.ds-btn-tertiary:hover:not(:disabled) {
  background-color: var(--color-surface-container-low);
}

/* States */
.ds-btn:focus-visible {
  outline-color: var(--color-primary);
}

.ds-btn-disabled,
.ds-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ds-btn-loading {
  color: transparent;
}

.ds-btn-spinner {
  position: absolute;
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .ds-btn {
    transition: none;
  }

  .ds-btn-spinner {
    animation: none;
    border-top-color: currentColor;
    opacity: 0.5;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
