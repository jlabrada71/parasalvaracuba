<template>
  <div class="detail-page">
    <nav class="nav">
      <NuxtLink to="/" class="nav-back">← Back to feed</NuxtLink>
      <span class="nav-brand">ParaSalvaraCuba</span>
    </nav>

    <main>
      <div v-if="pending" class="loading">Loading…</div>
      <div v-else-if="error" class="error">Idea not found.</div>

      <article v-else-if="idea">
        <div class="idea-header">
          <VoteButton :idea-id="idea.id" :net-votes="idea.net_votes" @voted="onVoted" />
          <div class="idea-title-block">
            <h1>{{ idea.title }}</h1>
            <p class="idea-meta">by {{ idea.email }} &middot; {{ formatDate(idea.created_at) }}</p>
          </div>
        </div>

        <div class="idea-description">{{ idea.description }}</div>

        <div v-if="isAuthor" class="idea-actions">
          <button @click="openEdit">Edit idea</button>
        </div>

        <!-- Inline edit form (shown when editing) -->
        <form v-if="editing" class="edit-form" @submit.prevent="submitEdit">
          <label>
            Title
            <input v-model="editTitle" maxlength="200" required />
          </label>
          <label>
            Description
            <textarea v-model="editDescription" rows="6" required />
          </label>
          <div class="edit-actions">
            <button type="submit" :disabled="saving">Save changes</button>
            <button type="button" @click="editing = false">Cancel</button>
          </div>
          <p v-if="editError" class="error">{{ editError }}</p>
        </form>
      </article>
    </main>

    <EmailCaptureModal
      :visible="modalVisible"
      @saved="onModalSaved"
      @close="onModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import VoteButton from '~/components/VoteButton.vue'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'
import { useAuthStore } from '~/stores/authStore'
import { useEmailGate } from '~/composables/useEmailGate'
import { apiRequest } from '~/utils/apiClient'

interface Idea {
  id: string
  title: string
  description: string
  email: string
  created_at: string
  updated_at: string
  net_votes: number
}

const route = useRoute()
const auth = useAuthStore()
const { modalVisible, onModalSaved, onModalClose } = useEmailGate()

const idea = ref<Idea | null>(null)
const pending = ref(true)
const error = ref(false)

const editing = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const saving = ref(false)
const editError = ref('')

const isAuthor = computed(() => !!auth.email && idea.value?.email === auth.email)

async function fetchIdea() {
  pending.value = true
  error.value = false
  try {
    idea.value = await $fetch<Idea>(`/api/ideas/${route.params.id}`)
  } catch {
    error.value = true
  } finally {
    pending.value = false
  }
}

function onVoted(payload: { ideaId: string; netVotes: number }) {
  if (idea.value) idea.value.net_votes = payload.netVotes
}

function openEdit() {
  if (!idea.value) return
  editTitle.value = idea.value.title
  editDescription.value = idea.value.description
  editError.value = ''
  editing.value = true
}

async function submitEdit() {
  if (!idea.value) return
  saving.value = true
  editError.value = ''
  try {
    const updated = await apiRequest<Idea>(`/api/ideas/${idea.value.id}`, {
      method: 'PATCH',
      body: { title: editTitle.value, description: editDescription.value },
    })
    idea.value = { ...idea.value, ...updated }
    editing.value = false
  } catch (e: unknown) {
    editError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Failed to save.'
  } finally {
    saving.value = false
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CU', { year: 'numeric', month: 'short', day: 'numeric' })
}

auth.init()
fetchIdea()
</script>

<style scoped>
.detail-page { font-family: system-ui, sans-serif; }
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
main { max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
.idea-header { display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1rem; }
.idea-title-block h1 { margin: 0 0 0.25rem; font-size: 1.5rem; color: #1e3a5f; }
.idea-meta { font-size: 0.8rem; color: #6b7280; margin: 0; }
.idea-description { line-height: 1.7; color: #374151; white-space: pre-wrap; margin-bottom: 1.5rem; }
.idea-actions { margin-bottom: 1rem; }
.idea-actions button {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}
.edit-form { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
.edit-form label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.9rem; font-weight: 600; }
.edit-form input, .edit-form textarea {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}
.edit-actions { display: flex; gap: 0.75rem; }
.edit-actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #d1d5db;
}
.edit-actions button[type="submit"] { background: #2563eb; color: white; border-color: #2563eb; }
.loading, .error { padding: 2rem 0; color: #6b7280; }
.error { color: #dc2626; }
</style>
