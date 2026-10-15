<template>
  <form class="auth-form" novalidate @submit.prevent="onSubmit">
    <div class="field">
      <label for="login-email">{{ $t('auth.login.email') }}</label>
      <input id="login-email" v-model="email" v-bind="emailAttrs" type="email" autocomplete="email"
             :aria-invalid="!!errors.email" aria-describedby="login-email-error" />
      <span v-if="errors.email" id="login-email-error" class="error" role="alert">{{ errors.email }}</span>
    </div>

    <div class="field">
      <label for="login-password">{{ $t('auth.login.password') }}</label>
      <input id="login-password" v-model="password" v-bind="passwordAttrs" type="password" autocomplete="current-password"
             :aria-invalid="!!errors.password" aria-describedby="login-password-error" />
      <span v-if="errors.password" id="login-password-error" class="error" role="alert">{{ errors.password }}</span>
    </div>

    <p v-if="formError" class="error" role="alert">{{ formError }}</p>

    <Button type="submit" variant="primary" :loading="isSubmitting">{{ $t('auth.login.submit') }}</Button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { Button } from '@/components/design-system'
import { useUserStore, type SessionUser } from '~/stores/userStore'
import { loginSchema } from '~/utils/authSchemas'

const emit = defineEmits<{ (e: 'success', user: SessionUser): void }>()

const { t } = useI18n()
const store = useUserStore()
const formError = ref('')

const { defineField, errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: loginSchema(t),
  initialValues: { email: '', password: '' },
})
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  formError.value = ''
  try {
    const user = await store.login(values.email, values.password)
    emit('success', user)
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status
    formError.value = status === 429 ? t('auth.login.tooMany') : status === 401 ? t('auth.login.failed') : t('auth.login.generic')
  }
})
</script>

<style scoped>
.auth-form { display: flex; flex-direction: column; gap: var(--spacing-4); }
.field { display: flex; flex-direction: column; gap: var(--spacing-2); }
label { font-size: var(--font-size-label-lg); font-weight: var(--font-weight-semibold); color: var(--color-on-surface); }
input {
  background: var(--color-surface-container-highest); border: none;
  border-bottom: 2px solid var(--color-outline-variant); padding: var(--spacing-3) var(--spacing-2);
  font-size: var(--font-size-body-lg); font-family: var(--font-body); color: var(--color-on-surface);
}
input:focus { outline: none; border-bottom-color: var(--color-secondary); }
input[aria-invalid='true'] { border-bottom-color: var(--color-error); }
.error { color: var(--color-error); font-size: var(--font-size-body-sm); }
</style>
