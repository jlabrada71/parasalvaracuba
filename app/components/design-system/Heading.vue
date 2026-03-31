<template>
  <component
    :is="level"
    :class="[
      'ds-heading',
      `ds-heading-${size}`,
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    size?: 'display-lg' | 'display-md' | 'headline-lg' | 'headline-md' | 'headline-sm' | 'title-lg' | 'title-md'
  }>(),
  {
    level: 'h2',
    size: 'headline-lg',
  }
)

const level = computed(() => props.level)
</script>

<style scoped>
.ds-heading {
  font-family: var(--font-headline);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-on-surface);
  margin: 0;
}

.ds-heading-display-lg {
  font-size: var(--font-size-display-lg);
}

.ds-heading-display-md {
  font-size: var(--font-size-display-md);
}

.ds-heading-headline-lg {
  font-size: var(--font-size-headline-lg);
}

.ds-heading-headline-md {
  font-size: var(--font-size-headline-md);
  font-weight: var(--font-weight-semibold);
}

.ds-heading-headline-sm {
  font-size: var(--font-size-headline-sm);
  font-weight: var(--font-weight-semibold);
}

.ds-heading-title-lg {
  font-size: var(--font-size-title-lg);
  font-weight: var(--font-weight-semibold);
}

.ds-heading-title-md {
  font-size: var(--font-size-title-md);
  font-weight: var(--font-weight-medium);
}
</style>
