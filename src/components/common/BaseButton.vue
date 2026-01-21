<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
  ariaDescribedby?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      {
        'base-button--block': block,
        'base-button--loading': loading,
        'base-button--disabled': disabled
      }
    ]"
    @click="handleClick"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true"></span>
    <span class="base-button__content" :class="{ 'base-button__content--hidden': loading }">
      <slot></slot>
    </span>
    <span v-if="loading" class="sr-only">Loading...</span>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border-radius: var(--radius-sm); /* Slightly sharper corners for "paper" feel */
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  border: 1px solid transparent;
  position: relative;
  font-family: inherit;
  letter-spacing: -0.01em;
}

/* Sizes */
.base-button--sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  min-height: 2rem;
}

.base-button--md {
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  min-height: 2.25rem;
}

.base-button--lg {
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  min-height: 2.75rem;
}

/* Variants */
.base-button--primary {
  background: var(--color-primary); /* Terracotta */
  color: white;
  border-color: var(--color-primary-dark);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.base-button--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.base-button--secondary {
  background: white;
  color: var(--color-text);
  border-color: var(--color-border);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.base-button--secondary:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-text-muted);
  color: var(--color-text-dark);
}

.base-button--outline {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.base-button--outline:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-text-muted);
}

.base-button--ghost {
  background: transparent;
  color: var(--color-text);
}

.base-button--ghost:hover:not(:disabled) {
  background: var(--color-bg-hover);
  color: var(--color-primary);
}

.base-button--danger {
  background: var(--color-danger);
  color: white;
  border-color: var(--color-danger-dark);
}

.base-button--danger:hover:not(:disabled) {
  background: var(--color-danger-dark);
}

/* States */
.base-button--block {
  width: 100%;
}

.base-button--disabled,
.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
  filter: grayscale(0.5);
}

.base-button--loading {
  cursor: wait;
}

/* Spinner */
.base-button__spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  position: absolute;
}

.base-button__content--hidden {
  visibility: hidden;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
