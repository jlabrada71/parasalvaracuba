<template>
  <section class="invite-form">
    <h2>{{ $t('admin.invite.title') }}</h2>
    <form novalidate @submit.prevent="onSubmit">
      <div class="field">
        <label for="admin-invite-email">{{ $t('admin.invite.email') }}</label>
        <input id="admin-invite-email" v-model="email" v-bind="emailAttrs" type="email" autocomplete="off"
               :aria-invalid="!!errors.email" aria-describedby="admin-invite-email-error" />
        <span v-if="errors.email" id="admin-invite-email-error" class="error" role="alert">{{ errors.email }}</span>
      </div>

      <div class="field">
        <label for="admin-invite-role">{{ $t('admin.invite.role') }}</label>
        <select id="admin-invite-role" v-model="role" v-bind="roleAttrs">
          <option value="author">{{ $t('admin.invite.roleAuthor') }}</option>
          <option value="admin">{{ $t('admin.invite.roleAdmin') }}</option>
        </select>
      </div>

      <p v-if="formError" class="error" role="alert">{{ formError }}</p>
      <Button type="submit" variant="primary" :loading="isSubmitting">{{ $t('admin.invite.submit') }}</Button>
    </form>

    <div v-if="created" class="link-box">
      <label for="admin-invite-link">{{ $t('admin.invite.linkReady') }}</label>
      <input id="admin-invite-link" :value="created.link" readonly @focus="($event.target as HTMLInputElement).select()" />
      <Button type="button" variant="secondary" size="sm" @click="copy">
        {{ copied ? $t('admin.invite.copied') : $t('admin.invite.copy') }}
      </Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { Button } from '@/components/design-system'
import { inviteSchema } from '~/utils/authSchemas'

export interface CreatedInvitation { id: string; email: string; role: string; link: string; expiresAt: string }

const emit = defineEmits<{ (e: 'created', invitation: CreatedInvitation): void }>()

const { t } = useI18n()
const formError = ref('')
const created = ref<CreatedInvitation | null>(null)
const copied = ref(false)

const { defineField, errors, handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: inviteSchema(t),
  initialValues: { email: '', role: 'author' },
})
const [email, emailAttrs] = defineField('email')
const [role, roleAttrs] = defineField('role')

const onSubmit = handleSubmit(async (values) => {
  formError.value = ''
  copied.value = false
  try {
    created.value = await $fetch<CreatedInvitation>('/api/admin/invitations', {
      method: 'POST',
      body: { email: values.email, role: values.role },
    })
    emit('created', created.value)
    resetForm()
  } catch (err: any) {
    const status = err?.statusCode ?? err?.status
    formError.value = status === 409 ? t('admin.invite.exists') : t('admin.invite.failed')
  }
})

async function copy() {
  if (!created.value) return
  try {
    await navigator.clipboard.writeText(created.value.link)
    copied.value = true
  } catch {
    // clipboard unavailable: the readonly field is selectable as a fallback
  }
}
</script>

<style scoped>
.invite-form { display: flex; flex-direction: column; gap: var(--spacing-4); }
form { display: flex; flex-direction: column; gap: var(--spacing-4); max-width: 480px; }
.field { display: flex; flex-direction: column; gap: var(--spacing-2); }
label { font-size: var(--font-size-label-lg); font-weight: var(--font-weight-semibold); }
input, select {
  background: var(--color-surface-container-highest); border: none;
  border-bottom: 2px solid var(--color-outline-variant); padding: var(--spacing-3) var(--spacing-2);
  font-size: var(--font-size-body-lg); font-family: var(--font-body); color: var(--color-on-surface);
}
input:focus, select:focus { outline: none; border-bottom-color: var(--color-secondary); }
input[aria-invalid='true'] { border-bottom-color: var(--color-error); }
.error { color: var(--color-error); font-size: var(--font-size-body-sm); }
.link-box { display: flex; flex-direction: column; gap: var(--spacing-2); max-width: 640px; padding: var(--spacing-4); background: var(--color-surface-container-low); border-radius: var(--radius-lg); }
</style>
