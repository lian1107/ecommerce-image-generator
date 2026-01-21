<script setup lang="ts">
import { watch, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useFocusTrap, useFocusManagement, generateId } from '@/utils/accessibility'

interface Props {
  visible: boolean
  title?: string
  width?: string
  closable?: boolean
  maskClosable?: boolean
  showFooter?: boolean
  ariaLabel?: string
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

const modalRef = ref<HTMLElement | null>(null)
const isActive = ref(false)
const titleId = generateId('modal-title')

// 焦点管理
const { saveFocus, restoreFocus } = useFocusManagement()

// 焦点陷阱
useFocusTrap(modalRef, isActive)

const close = () => {
  emit('update:visible', false)
  emit('close')
  restoreFocus()
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

watch(() => props.visible, async (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
    isActive.value = true

    // 保存当前焦点
    saveFocus()

    // 等待 DOM 更新后，将焦点移到模态框
    await nextTick()
    if (modalRef.value) {
      // 尝试聚焦第一个可聚焦元素，否则聚焦模态框本身
      const firstFocusable = modalRef.value.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (firstFocusable) {
        firstFocusable.focus()
      } else {
        modalRef.value.focus()
      }
    }
  } else {
    document.body.style.overflow = ''
    isActive.value = false
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
    <div v-if="visible" class="modal-overlay" @click.self="handleMaskClick" role="presentation">
      <div
        ref="modalRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? titleId : undefined"
        :aria-label="!title ? ariaLabel : undefined"
        class="modal"
        :style="{ maxWidth: width }"
        tabindex="-1"
      >
        <div v-if="title || closable" class="modal__header">
          <h3 v-if="title" :id="titleId" class="modal__title">{{ title }}</h3>
          <button
            v-if="closable"
            class="modal__close"
            type="button"
            @click="close"
            aria-label="关闭对话框"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal__body">
          <slot></slot>
        </div>
        <div v-if="showFooter" class="modal__footer">
          <slot name="footer">
            <button type="button" class="modal__btn modal__btn--cancel" @click="close">取消</button>
            <button type="button" class="modal__btn modal__btn--confirm" @click="handleConfirm">确认</button>
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
