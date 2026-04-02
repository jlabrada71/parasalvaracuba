<template>
  <div class="detail-page">
    <nav class="nav">
      <NuxtLink :to="localePath('/problems')" class="nav-back">← {{ $t('problems.title') }}</NuxtLink>
    </nav>

    <main>
      <div v-if="pending" class="loading">{{ $t('problem.loading') }}</div>
      <div v-else-if="error" class="error">{{ $t('problem.notFound') }}</div>

      <article v-else-if="problem">
        <div class="problem-header">
          <VoteButton :problem-id="problem.id" :net-votes="problem.net_votes" @voted="onVoted" />
          <div class="problem-title-block">
            <h1>{{ problem.title }}</h1>
            <p class="problem-meta">{{ $t('problem.by') }} {{ maskEmail(problem.email) }} &middot; {{ formatDate(problem.created_at) }}</p>
          </div>
        </div>

        <MarkdownRenderer :markdown="problem.description" />

        <div v-if="isAuthor" class="problem-actions">
          <Button variant="tertiary" size="sm" @click="openEdit">{{ $t('problem.editProblem') }}</Button>
        </div>

        <form v-if="editing" class="edit-form" @submit.prevent="submitEdit">
          <div class="form-field">
            <label class="form-label" for="edit-title">{{ $t('problem.titleLabel') }}</label>
            <input id="edit-title" v-model="editTitle" class="form-input" maxlength="200" required />
          </div>
          <div class="form-field">
            <label class="form-label" for="edit-description">{{ $t('problem.descriptionLabel') }}</label>
            <textarea id="edit-description" v-model="editDescription" class="form-textarea" rows="6" required />
          </div>
          <div class="edit-actions">
            <Button type="submit" variant="primary" size="sm" :disabled="saving">{{ $t('problem.saveChanges') }}</Button>
            <Button type="button" variant="tertiary" size="sm" @click="editing = false">{{ $t('problem.cancel') }}</Button>
          </div>
          <p v-if="editError" class="form-error">{{ editError }}</p>
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
import { useI18n } from 'vue-i18n'
import VoteButton from '~/components/VoteButton.vue'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'
import MarkdownRenderer from '~/components/MarkdownRenderer.vue'
import { Button } from '@/components/design-system'
import { useAuthStore } from '~/stores/authStore'
import { useEmailGate } from '~/composables/useEmailGate'
import { apiRequest } from '~/utils/apiClient'
import { maskEmail } from '~/utils/emailValidation'

const localePath = useLocalePath()

interface Problem {
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
const i18n = useI18n()
const { modalVisible, onModalSaved, onModalClose } = useEmailGate()

const problem = ref<Problem | null>(null)
const pending = ref(true)

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, text.lastIndexOf(' ', max)) + '…'
}

useSeoMeta({
  title: () => problem.value?.title ?? i18n.t('problem.loading'),
  description: () => problem.value?.description ? truncateAtWord(problem.value.description, 160) : '',
  ogTitle: () => problem.value?.title ?? i18n.t('problem.loading'),
  ogDescription: () => problem.value?.description ? truncateAtWord(problem.value.description, 160) : '',
  ogType: 'article',
  ogUrl: () => `https://parasalvaracuba.org/problems/${route.params.id}`,
  twitterCard: 'summary_large_image',
})
defineOgImage({
  component: 'Default',
  props: {
    title: computed(() => problem.value?.title),
    description: computed(() => problem.value?.description ? truncateAtWord(problem.value.description, 120) : undefined),
  },
})

const error = ref(false)
const editing = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const saving = ref(false)
const editError = ref('')

const isAuthor = computed(() => !!auth.email && problem.value?.email === auth.email)

async function fetchProblem() {
  pending.value = true
  error.value = false
  try {
    problem.value = await $fetch<Problem>(`/api/problems/${route.params.id}`)
  } catch {
    error.value = true
  } finally {
    pending.value = false
  }
}

function onVoted(payload: { problemId: string; netVotes: number }) {
  if (problem.value) problem.value.net_votes = payload.netVotes
}

function openEdit() {
  if (!problem.value) return
  editTitle.value = problem.value.title
  editDescription.value = problem.value.description
  editError.value = ''
  editing.value = true
}

async function submitEdit() {
  if (!problem.value) return
  saving.value = true
  editError.value = ''
  try {
    const updated = await apiRequest<Problem>(`/api/problems/${problem.value.id}`, {
      method: 'PATCH',
      body: { title: editTitle.value, description: editDescription.value },
    })
    problem.value = { ...problem.value, ...updated }
    editing.value = false
  } catch (e: unknown) {
    editError.value = (e as { data?: { message?: string } })?.data?.message ?? i18n.t('problem.errors.saveFailed')
  } finally {
    saving.value = false
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CU', { year: 'numeric', month: 'short', day: 'numeric' })
}

auth.init()
fetchProblem()
</script>

<style scoped>
.detail-page {
  font-family: var(--font-body);
  background-color: var(--color-background);
  color: var(--color-on-surface);
  min-height: 100vh;
}
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-8);
  background: var(--color-primary);
  color: var(--color-on-primary);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-elevation-2);
}
.nav-back {
  color: var(--color-on-primary);
  text-decoration: none;
  font-size: var(--font-size-body-md);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  opacity: 0.85;
  transition: opacity var(--transition-fast);
}
.nav-back:hover { opacity: 1; }
main { max-width: 720px; margin: var(--spacing-8) auto; padding: 0 var(--spacing-4); }
.problem-header {
  display: flex;
  gap: var(--spacing-6);
  align-items: flex-start;
  margin-bottom: var(--spacing-4);
}
.problem-title-block h1 {
  margin: 0 0 var(--spacing-1);
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
.problem-meta {
  font-size: var(--font-size-body-sm);
  color: var(--color-on-surface-variant);
  margin: 0;
}
.problem-actions { margin-bottom: var(--spacing-4); }
.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  margin-top: var(--spacing-4);
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.form-label {
  font-family: var(--font-label);
  font-size: var(--font-size-label-lg);
  font-weight: var(--font-weight-semi-bold);
  color: var(--color-on-surface);
}
.form-input,
.form-textarea {
  background-color: var(--color-surface-container-highest);
  border: none;
  border-bottom: 2px solid var(--color-outline-variant);
  border-radius: 0;
  padding: var(--spacing-3) var(--spacing-2);
  font-size: var(--font-size-body-lg);
  font-family: var(--font-body);
  color: var(--color-on-surface);
  transition: border-color var(--transition-fast);
  width: 100%;
}
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-bottom-color: var(--color-secondary-container);
  border-bottom-width: 3px;
}
.edit-actions { display: flex; gap: var(--spacing-3); }
.form-error {
  font-size: var(--font-size-body-sm);
  color: var(--color-error);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-error-container);
  border-radius: var(--radius-sm);
}
.loading, .error { padding: var(--spacing-8) 0; color: var(--color-on-surface-variant); }
.error { color: var(--color-error); }
</style>
