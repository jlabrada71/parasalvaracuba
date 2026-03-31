<template>
  <component
    :is="as"
    :class="[
      'ds-text',
      `ds-text-${size}`,
      { 'ds-text-muted': muted, 'ds-text-secondary': secondary }
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: 'p' | 'span' | 'div'
    size?: 'body-lg' | 'body-md' | 'body-sm' | 'label-lg' | 'label-md' | 'label-sm'
    muted?: boolean
    secondary?: boolean
  }>(),
  {
    as: 'p',
    size: 'body-lg',
  }
)
</script>

<style scoped>
.ds-text {
  font-family: var(--font-body);
  margin: 0;
  line-height: var(--line-height-normal);
  color: var(--color-on-surface);
}

.ds-text-body-lg {
  font-size: var(--font-size-body-lg);
  font-weight: var(--font-weight-regular);
}

.ds-text-body-md {
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-regular);
}

.ds-text-body-sm {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-regular);
}

.ds-text-label-lg {
  font-size: var(--font-size-label-lg);
  font-weight: var(--font-weight-semibold);
}

.ds-text-label-md {
  font-size: var(--font-size-label-md);
  font-weight: var(--font-weight-medium);
}

.ds-text-label-sm {
  font-size: var(--font-size-label-sm);
  font-weight: var(--font-weight-medium);
}

.ds-text-muted {
  color: var(--color-on-surface-variant);
}

.ds-text-secondary {
  color: var(--color-on-surface-variant);
}
</style>
