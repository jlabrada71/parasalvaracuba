<template>
  <div class="home-page">
    <nav class="nav">
      <span class="nav-brand">ParaSalvaraCuba</span>
      <NuxtLink to="/settings" class="nav-link">Settings</NuxtLink>
    </nav>

    <main>
      <h1>Ideas for Cuba</h1>
      <p>Submit and vote on ideas. Your voice matters.</p>

      <div class="actions">
        <button @click="handleCreateIdea">Create Idea</button>
        <button @click="handleVote">Vote</button>
        <button @click="handleComment">Comment</button>
      </div>

      <p v-if="actionFeedback" class="feedback">{{ actionFeedback }}</p>
    </main>

    <EmailCaptureModal
      :visible="modalVisible"
      @saved="onModalSaved"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEmailGate } from '~/composables/useEmailGate'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'

const { modalVisible, requireEmail, onModalSaved, onModalClose } = useEmailGate()
const actionFeedback = ref('')

function handleCreateIdea() {
  requireEmail(() => {
    actionFeedback.value = 'Create Idea action executed!'
  })
}

function handleVote() {
  requireEmail(() => {
    actionFeedback.value = 'Vote action executed!'
  })
}

function handleComment() {
  requireEmail(() => {
    actionFeedback.value = 'Comment action executed!'
  })
}
</script>

<style scoped>
.home-page {
  font-family: system-ui, sans-serif;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1e3a5f;
  color: white;
}

.nav-brand {
  font-weight: 700;
  font-size: 1.1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
}

main {
  max-width: 720px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

button {
  padding: 0.6rem 1.25rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.feedback {
  margin-top: 1rem;
  color: #16a34a;
  font-weight: 600;
}
</style>
