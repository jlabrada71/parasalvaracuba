<template>
  <div class="create-page">
    <nav class="nav">
      <NuxtLink to="/" class="nav-back">← Back to feed</NuxtLink>
      <span class="nav-brand">ParaSalvaraCuba</span>
    </nav>

    <main>
      <h1>Submit a new idea</h1>
      <p class="subtitle">Share what you think would help Cuba.</p>

      <form class="create-form" @submit.prevent="handleSubmit">
        <label>
          Title <span class="required">*</span>
          <input
            v-model="title"
            maxlength="200"
            placeholder="Short, clear title (max 200 characters)"
            required
          />
          <span class="char-count">{{ title.length }}/200</span>
        </label>

        <label>
          Description <span class="required">*</span>
          <textarea
            v-model="description"
            rows="8"
            placeholder="Describe the idea in detail…"
            required
          />
        </label>

        <p v-if="formError" class="error">{{ formError }}</p>

        <div class="form-actions">
          <button type="submit" :disabled="submitting">
            {{ submitting ? 'Submitting…' : 'Submit idea' }}
          </button>
          <NuxtLink to="/" class="cancel-link">Cancel</NuxtLink>
        </div>
      </form>
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
import { useRouter } from 'vue-router'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'
import { useEmailGate } from '~/composables/useEmailGate'
import { apiRequest } from '~/utils/apiClient'

const router = useRouter()
const { modalVisible, requireEmail, onModalSaved, onModalClose } = useEmailGate()

const title = ref('')
const description = ref('')
const submitting = ref(false)
const formError = ref('')

function handleSubmit() {
  requireEmail(submitIdea)
}

async function submitIdea() {
  if (!title.value.trim()) { formError.value = 'Title is required.'; return }
  if (!description.value.trim()) { formError.value = 'Description is required.'; return }

  submitting.value = true
  formError.value = ''

  try {
    const idea = await apiRequest<{ id: string }>('/api/ideas', {
      method: 'POST',
      body: { title: title.value.trim(), description: description.value.trim() },
    })
    router.push(`/ideas/${idea.id}`)
  } catch (e: unknown) {
    formError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to submit. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-page { font-family: system-ui, sans-serif; }
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1e3a5f;
  color: white;
}
.nav-back { color: white; text-decoration: none; font-size: 0.9rem; }
.nav-brand { font-weight: 700; font-size: 1.1rem; }
main { max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
.subtitle { color: #6b7280; margin-bottom: 1.5rem; }
.create-form { display: flex; flex-direction: column; gap: 1rem; }
.create-form label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.9rem; font-weight: 600; }
.create-form input, .create-form textarea {
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}
.char-count { font-size: 0.75rem; color: #9ca3af; font-weight: 400; }
.required { color: #dc2626; }
.form-actions { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; }
.form-actions button {
  padding: 0.65rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
.form-actions button:disabled { opacity: 0.6; cursor: not-allowed; }
.cancel-link { color: #6b7280; font-size: 0.9rem; text-decoration: none; }
.error { color: #dc2626; font-size: 0.9rem; }
</style>
