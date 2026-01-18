<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: string
  label?: string
  hint?: string
  required?: boolean
  maxlength?: number
  rows?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  rows: 4,
  resize: 'vertical'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasError = computed(() => !!props.error)

const charCount = computed(() => props.modelValue.length)
</script>

<template>
  <div class="base-textarea-wrapper">
    <label v-if="label" class="base-textarea__label">
      {{ label }}
      <span v-if="required" class="base-textarea__required">*</span>
    </label>
    <textarea
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :maxlength="maxlength"
      :rows="rows"
      class="base-textarea"
      :class="{ 'base-textarea--error': hasError }"
      :style="{ resize }"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    ></textarea>
    <div class="base-textarea__footer">
      <p v-if="error" class="base-textarea__error">{{ error }}</p>
      <p v-else-if="hint" class="base-textarea__hint">{{ hint }}</p>
      <span v-if="maxlength" class="base-textarea__count">
        {{ charCount }}/{{ maxlength }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.base-textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.base-textarea__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text, #374151);
}

.base-textarea__required {
  color: var(--color-danger, #ef4444);
  margin-left: 0.125rem;
}

.base-textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: 0.9375rem;
  color: var(--color-text, #374151);
  background: var(--color-bg-input, #ffffff);
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: var(--radius-md, 0.5rem);
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.base-textarea:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px var(--color-primary-light, rgba(59, 130, 246, 0.1));
}

.base-textarea::placeholder {
  color: var(--color-text-muted, #9ca3af);
}

.base-textarea:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.base-textarea--error {
  border-color: var(--color-danger, #ef4444);
}

.base-textarea--error:focus {
  box-shadow: 0 0 0 3px var(--color-danger-light, rgba(239, 68, 68, 0.1));
}

.base-textarea__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 1.25rem;
}

.base-textarea__error {
  font-size: 0.8125rem;
  color: var(--color-danger, #ef4444);
  margin: 0;
}

.base-textarea__hint {
  font-size: 0.8125rem;
  color: var(--color-text-muted, #9ca3af);
  margin: 0;
}

.base-textarea__count {
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
  margin-left: auto;
}
</style>
