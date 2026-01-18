<script setup lang="ts">
import { computed } from 'vue'
import { useApiStore } from '@/stores/apiStore'
import { useStatsStore } from '@/stores/statsStore'
import BaseButton from '@/components/common/BaseButton.vue'

const apiStore = useApiStore()
const statsStore = useStatsStore()

const emit = defineEmits<{
  'open-settings': []
}>()

const openSettings = () => {
  console.log('Open Settings clicked')
  emit('open-settings')
}

const connectionStatusClass = computed(() => ({
  'status-dot': true,
  'status-dot--connected': apiStore.connectionStatus.isConnected,
  'status-dot--loading': apiStore.connectionStatus.isLoading,
  'status-dot--error': apiStore.connectionStatus.error && !apiStore.connectionStatus.isLoading
}))
</script>

<template>
  <nav class="navbar">
    <div class="navbar__brand">
      <span class="navbar__logo">🎨</span>
      <h1 class="navbar__title">电商智能生图系统</h1>
    </div>

    <div class="navbar__center">
      <div class="navbar__stats">
        <span class="navbar__stat">
          <span class="navbar__stat-value">{{ statsStore.totalGenerations }}</span>
          <span class="navbar__stat-label">总生成</span>
        </span>
        <span class="navbar__divider"></span>
        <span class="navbar__stat">
          <span class="navbar__stat-value">{{ statsStore.totalImages }}</span>
          <span class="navbar__stat-label">总图片</span>
        </span>
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
}

.navbar__center {
  display: flex;
  align-items: center;
}

.navbar__stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: var(--color-bg-secondary);
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-full, 9999px);
  border: 1px solid var(--color-border-light);
}

.navbar__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  line-height: 1.2;
}

.navbar__stat-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-primary);
}

.navbar__stat-label {
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.navbar__divider {
  width: 1px;
  height: 1.5rem;
  background: var(--color-border);
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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

@media (max-width: 768px) {
  .navbar__center {
    display: none;
  }

  .navbar__title {
    font-size: 1rem;
  }
}
</style>
