<template>
  <div class="settings-page">
    <h1>Settings</h1>

    <section>
      <h2>Your Identity</h2>

      <div v-if="auth.isIdentified">
        <p>Current email: <strong>{{ auth.email }}</strong></p>
        <button @click="openChangeModal">Change Email</button>
        <button @click="clearEmail" class="btn-danger">Clear Email (sign out)</button>
      </div>

      <div v-else>
        <p>You have not set an email yet.</p>
        <button @click="openChangeModal">Set Email</button>
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
}

section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}

h2 {
  margin-top: 0;
}

button {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-danger {
  background: #dc2626;
}
</style>
