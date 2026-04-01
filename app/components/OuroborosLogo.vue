<template>
  <div class="ouroboros-wrapper" :style="{ width: size + 'px', height: size + 'px' }">
    <img
      src="/images/ouroboros-logo.png"
      alt="Para Salvar - Ouroboros Logo"
      class="ouroboros-logo"
      :style="{ width: innerSize + 'px', height: innerSize + 'px' }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface Props {
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 64,
})

const innerSize = computed(() => Math.round(props.size * 0.85))
</script>

<style scoped>
.ouroboros-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 2px solid var(--color-outline-variant);
  background-color: var(--color-surface-container-lowest);
  overflow: hidden;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.ouroboros-wrapper:hover {
  transform: scale(1.05);
}

.ouroboros-logo {
  object-fit: contain;
  display: block;
}
</style>
