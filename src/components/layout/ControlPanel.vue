<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '380px'
})

const isCollapsed = ref(false)

const toggle = () => {
  isCollapsed.value = !isCollapsed.value
}

defineExpose({
  isCollapsed,
  toggle,
  expand: () => { isCollapsed.value = false },
  collapse: () => { isCollapsed.value = true }
})
</script>

<template>
  <aside
    class="control-panel"
    :class="{ 'control-panel--collapsed': isCollapsed }"
    :style="{ '--panel-width': width }"
  >
    <div class="control-panel__content">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="control-panel__footer">
      <slot name="footer"></slot>
    </div>

    <button class="control-panel__toggle" @click="toggle" :title="isCollapsed ? 'Expand Panel' : 'Collapse Panel'">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          :d="isCollapsed ? 'M6 4L10 8L6 12' : 'M10 4L6 8L10 12'"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </aside>
</template>

<style scoped>
.control-panel {
  position: relative;
  width: var(--panel-width);
  min-width: var(--panel-width);
  height: 100%;
  background: var(--color-bg-card); /* Warm White */
  border-right: 1px solid var(--color-border); /* Soft Stone */
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), min-width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: var(--shadow-sm); /* Subtle depth */
}

.control-panel--collapsed {
  width: 0;
  min-width: 0;
  /* overflow: hidden; Removed to let toggle button show */
  border-right: none;
  box-shadow: none;
}

.control-panel--collapsed .control-panel__content,
.control-panel--collapsed .control-panel__footer {
  display: none;
}

.control-panel__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem; /* More breathing room */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-panel__footer {
  flex-shrink: 0;
  padding: 1rem 1.5rem;
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border-light);
  z-index: 5;
}

.control-panel__toggle {
  position: absolute;
  right: -24px; /* Floating outside */
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-left: none; /* Attached to right edge */
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  z-index: 10;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.control-panel__toggle:hover {
  background: var(--color-bg-hover);
  color: var(--color-primary);
  width: 28px; /* Subtle interaction */
}

.control-panel--collapsed .control-panel__toggle {
  right: -24px;
}

/* Scrollbar styling */
.control-panel__content::-webkit-scrollbar {
  width: 6px;
}

.control-panel__content::-webkit-scrollbar-track {
  background: transparent;
}

.control-panel__content::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.06);
  border-radius: 3px;
}

.control-panel__content::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.15);
}
</style>
