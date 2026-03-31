<template>
  <div class="settings-page">
    <h1>{{ $t('settings.title') }}</h1>

    <section>
      <h2>{{ $t('settings.identity.title') }}</h2>

      <div v-if="auth.isIdentified">
        <p>{{ $t('settings.identity.currentEmail') }} <strong>{{ auth.email }}</strong></p>
        <Button variant="primary" @click="openChangeModal">{{ $t('settings.identity.changeEmail') }}</Button>
        <Button variant="secondary" @click="clearEmail">{{ $t('settings.identity.clearEmail') }}</Button>
      </div>

      <div v-else>
        <p>{{ $t('settings.identity.noEmail') }}</p>
        <Button variant="primary" @click="openChangeModal">{{ $t('settings.identity.setEmail') }}</Button>
      </div>
    </section>

    <EmailCaptureModal
      :visible="modalVisible"
      :prefill="auth.email ?? ''"
      @saved="onModalSaved"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/design-system'
import { useAuthStore } from '~/stores/authStore'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'

const auth = useAuthStore()
const modalVisible = ref(false)

function openChangeModal() {
  modalVisible.value = true
}

function onModalSaved() {
  modalVisible.value = false
}

function onModalClose() {
  modalVisible.value = false
}

function clearEmail() {
  auth.clearEmail()
}
</script>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: var(--font-body);
  background-color: var(--color-background);
  color: var(--color-on-surface);
  min-height: 100vh;
}

h1 {
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-lg);
  color: var(--color-on-surface);
}

section {
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-top: var(--spacing-4);
}

h2 {
  margin-top: 0;
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-md);
  color: var(--color-on-surface);
}

p {
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface-variant);
}
</style>
