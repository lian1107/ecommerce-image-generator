<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'search'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: string
  label?: string
  hint?: string
  required?: boolean
  maxlength?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasError = computed(() => !!props.error)
</script>

<template>
  <div class="base-input-wrapper">
    <label v-if="label" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>
    <div class="base-input__container" :class="{ 'base-input__container--error': hasError }">
      <slot name="prefix"></slot>
      <input
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        class="base-input"
        :class="{ 'base-input--error': hasError }"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />
      <slot name="suffix"></slot>
    </div>
    <p v-if="error" class="base-input__error">{{ error }}</p>
    <p v-else-if="hint" class="base-input__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.base-input__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text, #374151);
}

.base-input__required {
  color: var(--color-danger, #ef4444);
  margin-left: 0.125rem;
}

.base-input__container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-bg-input, #ffffff);
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: var(--radius-md, 0.5rem);
  padding: 0 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.base-input__container:focus-within {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px var(--color-primary-light, rgba(59, 130, 246, 0.1));
}

.base-input__container--error {
  border-color: var(--color-danger, #ef4444);
}

.base-input__container--error:focus-within {
  box-shadow: 0 0 0 3px var(--color-danger-light, rgba(239, 68, 68, 0.1));
}

.base-input {
  flex: 1;
  padding: 0.625rem 0;
  font-size: 0.9375rem;
  color: var(--color-text, #374151);
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  min-width: 0;
}

.base-input::placeholder {
  color: var(--color-text-muted, #9ca3af);
}

.base-input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.base-input__error {
  font-size: 0.8125rem;
  color: var(--color-danger, #ef4444);
  margin: 0;
}

.base-input__hint {
  font-size: 0.8125rem;
  color: var(--color-text-muted, #9ca3af);
  margin: 0;
}
</style>
