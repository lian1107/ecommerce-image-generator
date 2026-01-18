<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  title: string
  defaultOpen?: boolean
  disabled?: boolean
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
  disabled: false
})

const isOpen = ref(props.defaultOpen)

const toggle = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

watch(() => props.defaultOpen, (value) => {
  isOpen.value = value
})

defineExpose({
  isOpen,
  toggle,
  open: () => { isOpen.value = true },
  close: () => { isOpen.value = false }
})
</script>

<template>
  <div class="collapse-section" :class="{ 'collapse-section--open': isOpen, 'collapse-section--disabled': disabled }">
    <button
      class="collapse-section__header"
      :disabled="disabled"
      @click="toggle"
      type="button"
    >
      <span v-if="icon" class="collapse-section__icon">{{ icon }}</span>
      <span class="collapse-section__title">{{ title }}</span>
      <slot name="header-extra"></slot>
      <span class="collapse-section__arrow">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>
    <Transition name="collapse">
      <div v-show="isOpen" class="collapse-section__content">
        <div class="collapse-section__body">
          <slot></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.collapse-section {
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 0.5rem);
  background: var(--color-bg-card, #ffffff);
  overflow: hidden;
}

.collapse-section__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.2s;
}

.collapse-section__header:hover:not(:disabled) {
  background: var(--color-bg-hover, #f9fafb);
}

.collapse-section--disabled .collapse-section__header {
  cursor: not-allowed;
  opacity: 0.6;
}

.collapse-section__icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.collapse-section__title {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text, #374151);
}

.collapse-section__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #9ca3af);
  transition: transform 0.2s;
}

.collapse-section--open .collapse-section__arrow {
  transform: rotate(180deg);
}

.collapse-section__content {
  overflow: hidden;
}

.collapse-section__body {
  padding: 0 1rem 1rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
  padding-top: 1rem;
}

/* Collapse transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease;
  max-height: 500px;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
