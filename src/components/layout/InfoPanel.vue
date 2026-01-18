<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  width?: string
  defaultCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '320px',
  defaultCollapsed: false
})

const isCollapsed = ref(props.defaultCollapsed)

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
    class="info-panel"
    :class="{ 'info-panel--collapsed': isCollapsed }"
    :style="{ '--panel-width': width }"
  >
    <button class="info-panel__toggle" @click="toggle" :title="isCollapsed ? '展开面板' : '收起面板'">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          :d="isCollapsed ? 'M10 4L6 8L10 12' : 'M6 4L10 8L6 12'"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div class="info-panel__content">
      <slot></slot>
    </div>
  </aside>
</template>

<style scoped>
.info-panel {
  position: relative;
  width: var(--panel-width);
  min-width: var(--panel-width);
  height: 100%;
  background: var(--color-bg-card, #ffffff);
  border-left: 1px solid var(--color-border, #e5e7eb);
  transition: width 0.3s ease, min-width 0.3s ease;
  display: flex;
  flex-direction: column;
}

.info-panel--collapsed {
  width: 0;
  min-width: 0;
  /* overflow: hidden; Removed */
  border-left: none;
}

.info-panel--collapsed .info-panel__content {
  display: none;
}

.info-panel__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-panel__toggle {
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: var(--color-bg-card, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 0.5rem) 0 0 var(--radius-md, 0.5rem);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #9ca3af);
  z-index: 10;
  transition: color 0.2s, background 0.2s;
}

.info-panel__toggle:hover {
  background: var(--color-bg-hover, #f9fafb);
  color: var(--color-text, #374151);
}

.info-panel--collapsed .info-panel__toggle {
  left: -24px;
  border-right: 1px solid var(--color-border, #e5e7eb);
}

/* Scrollbar styling */
.info-panel__content::-webkit-scrollbar {
  width: 6px;
}

.info-panel__content::-webkit-scrollbar-track {
  background: transparent;
}

.info-panel__content::-webkit-scrollbar-thumb {
  background: var(--color-border, #d1d5db);
  border-radius: 3px;
}

.info-panel__content::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted, #9ca3af);
}
</style>
