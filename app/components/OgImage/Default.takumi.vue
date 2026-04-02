<template>
  <!-- 1200x630 — rendered by Satori via nuxt-og-image -->
  <div
    :style="{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f6faf9',
      fontFamily: 'sans-serif',
      padding: '60px',
      position: 'relative',
    }"
  >
    <!-- top accent bar -->
    <div
      :style="{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '8px',
        background: 'linear-gradient(90deg, #e8724a 0%, #3ab5a0 100%)',
      }"
    />

    <!-- logo -->
    <img
      src="/images/ouroboros-logo.png"
      :style="{
        width: '160px',
        height: '160px',
        objectFit: 'contain',
        marginBottom: '36px',
      }"
    />

    <!-- title -->
    <div
      :style="{
        fontSize: title ? '44px' : '56px',
        fontWeight: '700',
        color: '#1a2e2b',
        textAlign: 'center',
        marginBottom: '20px',
        lineHeight: '1.2',
        maxWidth: '900px',
      }"
    >
      {{ title || 'Para Salvar A Cuba' }}
    </div>

    <!-- subtitle / site name when showing a sub-page title -->
    <div
      :style="{
        fontSize: '22px',
        color: '#3ab5a0',
        fontWeight: '600',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }"
    >
      {{ title ? 'parasalvaracuba.org' : 'parasalvaracuba.org' }}
    </div>

    <!-- description -->
    <div
      v-if="description"
      :style="{
        fontSize: '22px',
        color: '#4a6b65',
        textAlign: 'center',
        maxWidth: '760px',
        marginTop: '20px',
        lineHeight: '1.5',
      }"
    >
      {{ description }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>
