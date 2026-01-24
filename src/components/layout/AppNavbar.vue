<script setup lang="ts">
import { computed } from 'vue'
import { useApiStore } from '@/stores/apiStore'
import BaseButton from '@/components/common/BaseButton.vue'

const apiStore = useApiStore()

defineProps<{
  activeMode: 'quick' | 'advanced' | 'marketing'
}>()

const emit = defineEmits<{
  'open-settings': [],
  'open-help': [],
  'switch-mode': [mode: 'landing' | 'quick' | 'advanced' | 'marketing']
}>()

const openSettings = () => {
  emit('open-settings')
}

const openHelp = () => {
  emit('open-help')
}

const connectionStatusClass = computed(() => ({
  'status-dot': true,
  'status-dot--connected': apiStore.connectionStatus.isConnected,
  'status-dot--loading': apiStore.connectionStatus.isLoading,
  'status-dot--error': apiStore.connectionStatus.error && !apiStore.connectionStatus.isLoading
}))

const navItems = [
  { id: 'quick', label: '🚀 快速生成', tooltip: 'Quick Generation' },
  { id: 'advanced', label: '✨ 高级生成', tooltip: 'Advanced Generation' },
  { id: 'marketing', label: '📊 营销企划', tooltip: 'Marketing Planner' }
] as const
</script>

<template>
  <nav class="navbar">
    <div class="navbar__brand" @click="emit('switch-mode', 'landing')">
      <span class="navbar__logo">🎨</span>
      <h1 class="navbar__title">电商智能生图系统</h1>
    </div>

    <!-- Center Navigation Tabs -->
    <div class="navbar__center">
      <div class="nav-tabs">
        <button 
          v-for="item in navItems"
          :key="item.id"
          class="nav-tab"
          :class="{ active: activeMode === item.id }"
          @click="emit('switch-mode', item.id)"
          :title="item.tooltip"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="navbar__actions">
      <div class="navbar__status" title="Connection Status">
        <span :class="connectionStatusClass"></span>
        <span class="navbar__status-text" v-if="apiStore.connectionStatus.isConnected">Connected</span>
        <span class="navbar__status-text" v-else>Disconnected</span>
      </div>
      
      <BaseButton
        variant="secondary"
        size="sm"
        @click="openSettings"
      >
        <span>⚙️</span>
        System Settings
      </BaseButton>

      <BaseButton
        variant="ghost"
        size="sm"
        @click="openHelp"
        class="help-btn"
      >
        <span>❓</span>
        帮助
      </BaseButton>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 64px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px; /* Prevent shrinking */
  cursor: pointer;
}

.navbar__logo {
  font-size: 1.5rem;
}

.navbar__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-dark);
  font-family: var(--font-serif);
  margin: 0;
  white-space: nowrap;
}

.navbar__center {
  display: flex;
  justify-content: center;
  flex: 1;
  padding: 0 1rem;
}

.nav-tabs {
  display: flex;
  background: var(--color-bg-secondary);
  padding: 4px;
  border-radius: 8px;
  gap: 4px;
}

.nav-tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-tab:hover {
  background: rgba(0,0,0,0.05);
  color: var(--color-primary);
}

.nav-tab.active {
  background: var(--color-bg-card);
  color: var(--color-primary);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
  justify-content: flex-end;
}

.navbar__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-text-muted);
}

.status-dot--connected {
  background: var(--color-success);
  box-shadow: 0 0 0 2px var(--color-success-bg);
}

.status-dot--loading {
  background: var(--color-warning);
  animation: pulse 1.5s infinite;
}

.status-dot--error {
  background: var(--color-danger);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.navbar__status-text {
  font-weight: 500;
}

@media (max-width: 850px) {
  .navbar__title {
      display: none;
  }
}

/* 移动端样式优化 - 隐藏中间标签和右侧操作按钮 */
@media (max-width: 640px) {
  .navbar {
    justify-content: center;
    padding: 0 1rem;
  }

  .navbar__brand {
    min-width: auto;
  }

  .navbar__title {
    display: block;
    font-size: 1rem;
  }

  .navbar__center {
    display: none;
  }

  .navbar__actions {
    display: none;
  }
}
</style>
