<template>
  <svg
    class="community-logo"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Center circle (community hub) -->
    <circle cx="32" cy="32" r="8" :fill="primaryColor" />

    <!-- Surrounding circles (community members) -->
    <circle cx="32" cy="12" r="6" :fill="accentColor" opacity="0.8" />
    <circle cx="48" cy="24" r="6" :fill="accentColor" opacity="0.8" />
    <circle cx="48" cy="40" r="6" :fill="accentColor" opacity="0.8" />
    <circle cx="32" cy="52" r="6" :fill="accentColor" opacity="0.8" />
    <circle cx="16" cy="40" r="6" :fill="accentColor" opacity="0.8" />
    <circle cx="16" cy="24" r="6" :fill="accentColor" opacity="0.8" />

    <!-- Connection lines (network/connection) -->
    <line x1="32" y1="18" x2="32" y2="26" :stroke="primaryColor" stroke-width="1.5" opacity="0.6" />
    <line x1="40" y1="24" x2="44" y2="26" :stroke="primaryColor" stroke-width="1.5" opacity="0.6" />
    <line x1="40" y1="40" x2="44" y2="40" :stroke="primaryColor" stroke-width="1.5" opacity="0.6" />
    <line x1="32" y1="46" x2="32" y2="38" :stroke="primaryColor" stroke-width="1.5" opacity="0.6" />
    <line x1="24" y1="40" x2="20" y2="40" :stroke="primaryColor" stroke-width="1.5" opacity="0.6" />
    <line x1="24" y1="24" x2="20" y2="24" :stroke="primaryColor" stroke-width="1.5" opacity="0.6" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: number
  primaryColor?: string
  accentColor?: string
}

withDefaults(defineProps<Props>(), {
  size: 64,
  primaryColor: '#008080',
  accentColor: '#a43c12',
})
</script>

<style scoped>
.community-logo {
  display: inline-block;
  transition: transform 0.3s ease;
}

.community-logo:hover {
  transform: scale(1.05);
}
</style>
