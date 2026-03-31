<template>
  <div class="create-page">
    <nav class="nav">
      <NuxtLink :to="localePath('/')" class="nav-back">{{ $t('nav.backToFeed') }}</NuxtLink>
      <span class="nav-brand">ParaSalvaraCuba</span>
    </nav>

    <main>
      <h1>{{ $t('create.title') }}</h1>
      <p class="subtitle">{{ $t('create.subtitle') }}</p>

      <form class="create-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <label class="form-label" for="create-title">
            {{ $t('create.titleLabel') }} <span class="required">*</span>
          </label>
          <input
            id="create-title"
            v-model="title"
            class="form-input"
            maxlength="200"
            :placeholder="$t('create.titlePlaceholder')"
            required
          />
          <span class="char-count">{{ title.length }}/200</span>
        </div>

        <div class="form-field">
          <label class="form-label" for="create-description">
            {{ $t('create.descriptionLabel') }} <span class="required">*</span>
          </label>
          <textarea
            id="create-description"
            v-model="description"
            class="form-textarea"
            rows="8"
            :placeholder="$t('create.descriptionPlaceholder')"
            required
          />
        </div>

        <p v-if="formError" class="form-error">{{ formError }}</p>

        <div class="form-actions">
          <Button type="submit" variant="primary" :disabled="submitting">
            {{ submitting ? $t('create.submitting') : $t('create.submit') }}
          </Button>
          <NuxtLink :to="localePath('/')" class="cancel-link">{{ $t('create.cancel') }}</NuxtLink>
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
import { useI18n } from 'vue-i18n'
import EmailCaptureModal from '~/components/EmailCaptureModal.vue'
import { Button } from '@/components/design-system'
import { useEmailGate } from '~/composables/useEmailGate'
import { apiRequest } from '~/utils/apiClient'
const localePath = useLocalePath()

const router = useRouter()
const i18n = useI18n()
const { modalVisible, requireEmail, onModalSaved, onModalClose } = useEmailGate()

const title = ref('')
const description = ref('')
const submitting = ref(false)
const formError = ref('')

function handleSubmit() {
  requireEmail(submitIdea)
}

async function submitIdea() {
  if (!title.value.trim()) { formError.value = i18n.t('create.errors.titleRequired'); return }
  if (!description.value.trim()) { formError.value = i18n.t('create.errors.descriptionRequired'); return }

  submitting.value = true
  formError.value = ''

  try {
    const idea = await apiRequest<{ id: string }>('/api/ideas', {
      method: 'POST',
      body: { title: title.value.trim(), description: description.value.trim() },
    })
    router.push(localePath(`/ideas/${idea.id}`))
  } catch (e: unknown) {
    formError.value = (e as { data?: { message?: string } })?.data?.message ?? i18n.t('create.errors.failed')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-page {
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
.nav-brand {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-title-md);
  letter-spacing: var(--letter-spacing-xs);
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
main {
  max-width: 640px;
  margin: var(--spacing-8) auto;
  padding: 0 var(--spacing-4);
}
h1 {
  font-family: var(--font-headline);
  font-size: var(--font-size-headline-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
  margin-bottom: var(--spacing-2);
}
.subtitle {
  color: var(--color-on-surface-variant);
  font-size: var(--font-size-body-lg);
  margin-bottom: var(--spacing-6);
}
.create-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
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
.required { color: var(--color-error); }
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
.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--color-on-surface-variant);
}
.char-count {
  font-size: var(--font-size-label-sm);
  color: var(--color-on-surface-variant);
  text-align: right;
  font-family: var(--font-label);
}
.form-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-top: var(--spacing-2);
}
.cancel-link {
  color: var(--color-on-surface-variant);
  font-size: var(--font-size-body-md);
  text-decoration: none;
}
.cancel-link:hover {
  color: var(--color-on-surface);
  text-decoration: underline;
}
.form-error {
  font-size: var(--font-size-body-sm);
  color: var(--color-error);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-error-container);
  border-radius: var(--radius-sm);
}
</style>
