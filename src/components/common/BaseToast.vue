<script setup lang="ts">
import { computed } from 'vue'
import type { ToastType } from '@/types'

interface Props {
  type?: ToastType
  message: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: true
})

const emit = defineEmits<{
  dismiss: []
}>()

const icon = computed(() => {
  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[props.type]
})
</script>

<template>
  <div :class="['toast', `toast--${type}`]">
    <span class="toast__icon">{{ icon }}</span>
    <span class="toast__message">{{ message }}</span>
    <button
      v-if="dismissible"
      class="toast__dismiss"
      @click="emit('dismiss')"
      aria-label="关闭"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-md, 0.5rem);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: 280px;
  max-width: 400px;
}

.toast--success {
  background: var(--color-success-bg, #ecfdf5);
  border: 1px solid var(--color-success-border, #a7f3d0);
  color: var(--color-success-text, #065f46);
}

.toast--error {
  background: var(--color-error-bg, #fef2f2);
  border: 1px solid var(--color-error-border, #fecaca);
  color: var(--color-error-text, #991b1b);
}

.toast--warning {
  background: var(--color-warning-bg, #fffbeb);
  border: 1px solid var(--color-warning-border, #fcd34d);
  color: var(--color-warning-text, #92400e);
}

.toast--info {
  background: var(--color-info-bg, #eff6ff);
  border: 1px solid var(--color-info-border, #93c5fd);
  color: var(--color-info-text, #1e40af);
}

.toast__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.toast--success .toast__icon {
  background: var(--color-success, #10b981);
  color: white;
}

.toast--error .toast__icon {
  background: var(--color-danger, #ef4444);
  color: white;
}

.toast--warning .toast__icon {
  background: var(--color-warning, #f59e0b);
  color: white;
}

.toast--info .toast__icon {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.toast__message {
  flex: 1;
  font-size: 0.9375rem;
  line-height: 1.4;
}

.toast__dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  color: currentColor;
  opacity: 0.6;
  cursor: pointer;
  border-radius: var(--radius-sm, 0.25rem);
  transition: opacity 0.2s, background 0.2s;
  flex-shrink: 0;
}

.toast__dismiss:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}
</style>
