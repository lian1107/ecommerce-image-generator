<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label?: string
  showValue?: boolean
  unit?: string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showValue: true,
  unit: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const rangeValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  }
})

const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})
</script>

<template>
  <div class="base-range-wrapper">
    <div v-if="label || showValue" class="base-range__header">
      <label v-if="label" class="base-range__label">{{ label }}</label>
      <span v-if="showValue" class="base-range__value">
        {{ modelValue }}{{ unit }}
      </span>
    </div>
    <div class="base-range__container">
      <input
        v-model.number="rangeValue"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        class="base-range"
        :style="{ '--percentage': `${percentage}%` }"
      />
    </div>
    <div class="base-range__marks">
      <span>{{ min }}{{ unit }}</span>
      <span>{{ max }}{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.base-range-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.base-range__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base-range__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text, #374151);
}

.base-range__value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
  min-width: 3rem;
  text-align: right;
}

.base-range__container {
  position: relative;
  height: 1.5rem;
  display: flex;
  align-items: center;
}

.base-range {
  width: 100%;
  height: 0.375rem;
  appearance: none;
  background: linear-gradient(
    to right,
    var(--color-primary, #3b82f6) 0%,
    var(--color-primary, #3b82f6) var(--percentage, 0%),
    var(--color-border, #d1d5db) var(--percentage, 0%),
    var(--color-border, #d1d5db) 100%
  );
  border-radius: 0.25rem;
  cursor: pointer;
}

.base-range::-webkit-slider-thumb {
  appearance: none;
  width: 1.125rem;
  height: 1.125rem;
  background: white;
  border: 2px solid var(--color-primary, #3b82f6);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.15s, box-shadow 0.15s;
}

.base-range::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.base-range::-moz-range-thumb {
  width: 1.125rem;
  height: 1.125rem;
  background: white;
  border: 2px solid var(--color-primary, #3b82f6);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.base-range:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-range__marks {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
}
</style>
