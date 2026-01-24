<script setup lang="ts">
interface Props {
  padding?: string
}

withDefaults(defineProps<Props>(), {
  padding: '1.5rem'
})
</script>

<template>
  <main class="workspace" :style="{ padding }">
    <slot></slot>
  </main>
</template>

<style scoped>
.workspace {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  background: var(--color-bg, #f9fafb);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Scrollbar styling */
.workspace::-webkit-scrollbar {
  width: 8px;
}

.workspace::-webkit-scrollbar-track {
  background: transparent;
}

.workspace::-webkit-scrollbar-thumb {
  background: var(--color-border, #d1d5db);
  border-radius: 4px;
}

.workspace::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted, #9ca3af);
}

/* ========================================
   移动端样式 - 全宽工作区
   ======================================== */
@media (max-width: 640px) {
  .workspace {
    width: 100%;
    min-width: 100%;
    padding: 1rem;
    padding-bottom: calc(1rem + 80px); /* 为FAB按钮留出空间 */
    overflow-y: auto;
    overflow-x: hidden;
  }
}

/* 平板端样式 */
@media (min-width: 641px) and (max-width: 1024px) {
  .workspace {
    flex: 1;
    min-width: 0;
    padding: 1.25rem;
  }
}
</style>
