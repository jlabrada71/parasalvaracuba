<template>
  <div class="ds-input-wrapper">
    <label v-if="label" :for="inputId" class="ds-input-label">
      {{ label }}
      <span v-if="required" class="ds-input-required">*</span>
    </label>

    <input
      :id="inputId"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-label="label || placeholder"
      :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
      class="ds-input-field"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <div v-if="error" :id="`${inputId}-error`" class="ds-input-error" role="alert">
      {{ error }}
    </div>
    <div v-if="hint && !error" :id="`${inputId}-hint`" class="ds-input-hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    type?: string
    disabled?: boolean
    required?: boolean
    error?: string
    hint?: string
    id?: string
  }>(),
  {
    type: 'text',
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)
</script>

<style scoped>
.ds-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.ds-input-label {
  font-size: var(--font-size-label-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface);
  display: block;
  cursor: pointer;
}

.ds-input-required {
  color: var(--color-error);
  margin-left: 0.25rem;
}

.ds-input-field {
  background-color: var(--color-surface-container-highest);
  border: none;
  border-bottom: 2px solid var(--color-outline-variant);
  border-radius: 0;
  padding: var(--spacing-3) 0;
  font-size: var(--font-size-body-lg);
  font-family: var(--font-body);
  color: var(--color-on-surface);
  transition: all var(--transition-fast);
}

.ds-input-field::placeholder {
  color: var(--color-on-surface-variant);
}

.ds-input-field:focus {
  outline: none;
  border-bottom-color: var(--color-secondary);
  border-bottom-width: 3px;
  padding-bottom: calc(var(--spacing-3) - 1px);
}

.ds-input-field:disabled {
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
  cursor: not-allowed;
}

.ds-input-error {
  font-size: var(--font-size-body-sm);
  color: var(--color-error);
  margin-top: var(--spacing-1);
}

.ds-input-hint {
  font-size: var(--font-size-body-sm);
  color: var(--color-on-surface-variant);
}

@media (prefers-reduced-motion: reduce) {
  .ds-input-field {
    transition: none;
  }
}
</style>
