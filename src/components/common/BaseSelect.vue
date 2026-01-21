<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

interface Props {
  modelValue: string | number
  options: Option[]
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  }
})

const hasError = computed(() => !!props.error)
</script>

<template>
  <div class="base-select-wrapper">
    <label v-if="label" class="base-select__label">
      {{ label }}
      <span v-if="required" class="base-select__required">*</span>
    </label>
    <div class="base-select__container" :class="{ 'base-select__container--error': hasError }">
      <select
        v-model="selectedValue"
        :disabled="disabled"
        :required="required"
        class="base-select"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      <span class="base-select__arrow">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
    <p v-if="error" class="base-select__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.base-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.base-select__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text, #374151);
}

.base-select__required {
  color: var(--color-danger, #ef4444);
  margin-left: 0.125rem;
}

.base-select__container {
  position: relative;
  display: flex;
  align-items: center;
}

.base-select {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 0.75rem;
  font-size: 0.9375rem;
  color: var(--color-text, #374151);
  background: var(--color-bg-input, #ffffff);
  border: 1px solid var(--color-border, #d1d5db);
  border-radius: var(--radius-md, 0.5rem);
  cursor: pointer;
  appearance: none;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.base-select:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px var(--color-primary-light, rgba(59, 130, 246, 0.1));
}

.base-select:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.base-select__container--error .base-select {
  border-color: var(--color-danger, #ef4444);
}

.base-select__arrow {
  position: absolute;
  right: 0.75rem;
  pointer-events: none;
  color: var(--color-text-muted, #9ca3af);
}

.base-select__error {
  font-size: 0.8125rem;
  color: var(--color-danger, #ef4444);
  margin: 0;
}

/* Mobile Optimization */
@media (max-width: 640px) {
  .base-select {
    font-size: 16px; /* Prevent iOS zoom */
    padding: 0.75rem 2.5rem 0.75rem 1rem; /* Larger padding */
    min-height: 48px; /* Larger touch target */
  }

  .base-select__label {
    font-size: 0.9375rem;
  }

  .base-select__error {
    font-size: 0.875rem;
  }

  .base-select__arrow {
    right: 1rem;
  }
}
</style>
