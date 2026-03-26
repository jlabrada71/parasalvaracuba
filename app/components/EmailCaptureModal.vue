<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click.self="onDismiss">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Enter your email to continue</h2>
        <p>No account needed. We use your email to attribute your contributions.</p>

        <form @submit.prevent="onSubmit" novalidate>
          <label for="email-input">Email address</label>
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
            <button type="submit">Continue</button>
            <button type="button" @click="onDismiss">Browse without saving</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
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
const inputEmail = ref(props.prefill ?? '')
const errorMsg = ref('')

watch(() => props.prefill, (val) => { inputEmail.value = val ?? '' })

function onSubmit() {
  const result = validateEmail(inputEmail.value)
  if (!result.valid) {
    errorMsg.value = result.reason ?? 'Invalid email.'
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.modal h2 {
  margin-top: 0;
  font-size: 1.25rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

label {
  font-weight: 600;
  font-size: 0.9rem;
}

input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.error {
  color: #dc2626;
  font-size: 0.85rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

button[type="submit"] {
  padding: 0.5rem 1.25rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button[type="button"] {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}
</style>
