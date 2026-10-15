<template>
  <form class="auth-form" novalidate @submit.prevent="onSubmit">
    <div class="field">
      <label for="invite-password">{{ $t('auth.invite.password') }}</label>
      <input id="invite-password" v-model="password" v-bind="passwordAttrs" type="password" autocomplete="new-password"
             :aria-invalid="!!errors.password" aria-describedby="invite-password-error" />
      <span v-if="errors.password" id="invite-password-error" class="error" role="alert">{{ errors.password }}</span>
    </div>

    <div class="field">
      <label for="invite-confirm">{{ $t('auth.invite.confirm') }}</label>
      <input id="invite-confirm" v-model="confirm" v-bind="confirmAttrs" type="password" autocomplete="new-password"
             :aria-invalid="!!errors.confirm" aria-describedby="invite-confirm-error" />
      <span v-if="errors.confirm" id="invite-confirm-error" class="error" role="alert">{{ errors.confirm }}</span>
    </div>

    <p v-if="formError" class="error" role="alert">{{ formError }}</p>

    <Button type="submit" variant="primary" :loading="isSubmitting">{{ $t('auth.invite.submit') }}</Button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { Button } from '@/components/design-system'
import { useUserStore, type SessionUser } from '~/stores/userStore'
import { acceptInviteSchema } from '~/utils/authSchemas'

const props = defineProps<{ token: string; email: string }>()
const emit = defineEmits<{ (e: 'success'): void }>()

const { t } = useI18n()
const store = useUserStore()
const formError = ref('')

const { defineField, errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: acceptInviteSchema(t),
  initialValues: { password: '', confirm: '' },
})
const [password, passwordAttrs] = defineField('password')
const [confirm, confirmAttrs] = defineField('confirm')

const onSubmit = handleSubmit(async (values) => {
  formError.value = ''
  try {
    const res = await $fetch<{ user: SessionUser }>(`/api/invitations/${encodeURIComponent(props.token)}/accept`, {
      method: 'POST',
      body: { password: values.password },
    })
    store.user = res.user
    store.loaded = true
    emit('success')
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status
    formError.value = status === 404 ? t('auth.invite.invalid') : status === 409 ? t('auth.invite.exists') : t('auth.login.generic')
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
