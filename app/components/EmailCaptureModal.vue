<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click.self="onDismiss">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">{{ $t('modal.title') }}</h2>
        <p>{{ $t('modal.description') }}</p>

        <form @submit.prevent="onSubmit" novalidate>
          <label for="email-input">{{ $t('modal.emailLabel') }}</label>
          <input
            id="email-input"
            v-model="inputEmail"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            autofocus
          />
          <span v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</span>

          <div class="actions">
            <button type="submit">{{ $t('modal.continue') }}</button>
            <button type="button" @click="onDismiss">{{ $t('modal.browse') }}</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/authStore'
import { validateEmail } from '~/utils/emailValidation'

const props = defineProps<{
  visible: boolean
  prefill?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', email: string): void
}>()

const auth = useAuthStore()
const i18n = useI18n()
const inputEmail = ref(props.prefill ?? '')
const errorMsg = ref('')

watch(() => props.prefill, (val) => { inputEmail.value = val ?? '' })

function onSubmit() {
  const result = validateEmail(inputEmail.value)
  if (!result.valid) {
    errorMsg.value = result.reason ?? i18n.t('modal.invalidEmail')
    return
  }
  errorMsg.value = ''
  auth.setEmail(inputEmail.value)
  emit('saved', inputEmail.value)
  emit('close')
}

function onDismiss() {
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') onDismiss()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(24, 28, 28, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: var(--backdrop-blur-sm);
  animation: fadeIn var(--transition-normal);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .modal-backdrop { animation: none; }
}

.modal {
  background-color: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  max-width: 480px;
  width: calc(100% - var(--spacing-8));
  box-shadow: var(--shadow-elevation-5);
  animation: slideUp var(--transition-normal);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .modal { animation: none; }
}

.modal h2 {
  margin: 0 0 var(--spacing-2);
  font-family: var(--font-headline);
  font-size: var(--font-size-title-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
}

.modal p {
  font-family: var(--font-body);
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface-variant);
  margin-bottom: var(--spacing-4);
  line-height: var(--line-height-relaxed);
}

form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
}

label {
  font-family: var(--font-label);
  font-size: var(--font-size-label-lg);
  font-weight: var(--font-weight-semi-bold);
  color: var(--color-on-surface);
  display: block;
  margin-bottom: var(--spacing-2);
}

input[type="email"] {
  display: block;
  width: 100%;
  background-color: var(--color-surface-container-highest);
  border: none;
  border-bottom: 2px solid var(--color-outline-variant);
  border-radius: 0;
  padding: var(--spacing-3) var(--spacing-2);
  font-family: var(--font-body);
  font-size: var(--font-size-body-lg);
  color: var(--color-on-surface);
  transition: border-color var(--transition-fast);
}

input[type="email"]:focus {
  outline: none;
  border-bottom-color: var(--color-secondary-container);
  border-bottom-width: 3px;
}

input[type="email"]::placeholder {
  color: var(--color-on-surface-variant);
}

.error {
  font-family: var(--font-body);
  font-size: var(--font-size-body-sm);
  color: var(--color-error);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-error-container);
  border-radius: var(--radius-sm);
}

.actions {
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
  flex-wrap: wrap;
}

button[type="submit"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  flex: 1;
  padding: var(--spacing-3) var(--spacing-6);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-family: var(--font-label);
  font-size: var(--font-size-label-lg);
  font-weight: var(--font-weight-semi-bold);
  transition: all var(--transition-normal);
  box-shadow: 0 8px 20px rgba(0, 101, 101, 0.15);
}

button[type="submit"]:hover {
  box-shadow: 0 12px 28px rgba(0, 101, 101, 0.25);
  transform: translateY(-1px);
}

button[type="submit"]:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

button[type="button"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: var(--spacing-3) var(--spacing-5);
  background: transparent;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-family: var(--font-label);
  font-size: var(--font-size-label-md);
  color: var(--color-on-surface-variant);
  transition: all var(--transition-fast);
}

button[type="button"]:hover {
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface);
}

button[type="button"]:focus-visible {
  outline: 2px solid var(--color-outline);
  outline-offset: 2px;
}
</style>
