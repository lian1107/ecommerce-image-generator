<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'

interface Props {
  visible: boolean
  title?: string
  width?: string
  closable?: boolean
  maskClosable?: boolean
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '480px',
  closable: true,
  maskClosable: true,
  showFooter: true
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
  confirm: []
}>()

const close = () => {
  emit('update:visible', false)
  emit('close')
}

const handleMaskClick = () => {
  if (props.maskClosable) {
    close()
  }
}

const handleConfirm = () => {
  emit('confirm')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closable) {
    close()
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleMaskClick">
      <div class="modal" :style="{ maxWidth: width }">
        <div v-if="title || closable" class="modal__header">
          <h3 v-if="title" class="modal__title">{{ title }}</h3>
          <button
            v-if="closable"
            class="modal__close"
            @click="close"
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal__body">
          <slot></slot>
        </div>
        <div v-if="showFooter" class="modal__footer">
          <slot name="footer">
            <button class="modal__btn modal__btn--cancel" @click="close">取消</button>
            <button class="modal__btn modal__btn--confirm" @click="handleConfirm">确认</button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.modal {
  background: var(--color-bg-card, #ffffff);
  border-radius: var(--radius-lg, 0.75rem);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.modal__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text, #111827);
  margin: 0;
}

.modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted, #9ca3af);
  border-radius: var(--radius-md, 0.375rem);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.modal__close:hover {
  background: var(--color-bg-hover, #f3f4f6);
  color: var(--color-text, #374151);
}

.modal__body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.modal__btn {
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: var(--radius-md, 0.375rem);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: inherit;
}

.modal__btn--cancel {
  background: var(--color-bg-secondary, #f3f4f6);
  color: var(--color-text, #374151);
}

.modal__btn--cancel:hover {
  background: var(--color-bg-hover, #e5e7eb);
}

.modal__btn--confirm {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.modal__btn--confirm:hover {
  background: var(--color-primary-dark, #2563eb);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95);
  opacity: 0;
}
</style>
