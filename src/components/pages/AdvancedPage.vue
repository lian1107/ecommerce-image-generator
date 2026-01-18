<template>
  <div class="advanced-page">
    <div class="page-header">
      <h2 class="page-title">高级生成</h2>
      <p class="page-subtitle">使用多图融合和一致性控制，创造专业级效果</p>
    </div>

    <!-- 功能切换标签 -->
    <div class="feature-tabs">
      <button 
        class="feature-tab" 
        :class="{ active: activeTab === 'fusion' }"
        @click="activeTab = 'fusion'"
      >
        🔀 多图融合
      </button>
      <button 
        class="feature-tab"
        :class="{ active: activeTab === 'consistency' }"
        @click="activeTab = 'consistency'"
      >
        🎨 一致性系统
      </button>
      <button 
        class="feature-tab"
        :class="{ active: activeTab === 'marketing' }"
        @click="activeTab = 'marketing'"
      >
        📋 营销套图
      </button>
    </div>
    
    <div class="creation-grid">
      <!-- 左侧：基础资源 -->
      <div class="creation-section left-section">
        <ProductInfoSection />
      </div>

      <!-- 右侧：高级控制 -->
      <div class="creation-section right-section">
        <div v-show="activeTab === 'fusion'">
          <FusionPanel />
        </div>
        
        <div v-show="activeTab === 'consistency'">
          <ConsistencyPanel />
        </div>

        <div v-show="activeTab === 'marketing'">
          <MarketingPanel @switch-tab="activeTab = $event" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ProductInfoSection from '@/components/product/ProductInfoSection.vue'
import { FusionPanel } from '@/components/fusion'
import { ConsistencyPanel } from '@/components/consistency'
import MarketingPanel from '@/components/marketing/MarketingPanel.vue'
import { useFusionStore } from '@/stores/fusionStore'
import { useConsistencyStore } from '@/stores/consistencyStore'

const activeTab = ref<'fusion' | 'consistency' | 'marketing'>('fusion')
const fusionStore = useFusionStore()
const consistencyStore = useConsistencyStore()

// 监听标签页切换，自动管理功能的启用状态
watch(activeTab, (newTab) => {
  if (newTab === 'fusion') {
    fusionStore.setEnabled(true)
    consistencyStore.setEnabled(false)
  } else if (newTab === 'consistency') {
    fusionStore.setEnabled(false)
    consistencyStore.setEnabled(true)
  } else if (newTab === 'marketing') {
    fusionStore.setEnabled(false)
    // Modify: Allow consistency to remain enabled if it was already on
    // But if it was off, should we enable it? No, user choice.
  }
})

// 进入页面时初始化状态
onMounted(() => {
  if (activeTab.value === 'fusion') {
    fusionStore.setEnabled(true)
    consistencyStore.setEnabled(false)
  } else {
    fusionStore.setEnabled(false)
    consistencyStore.setEnabled(true)
  }
})
</script>

<style scoped>
.advanced-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  margin-bottom: 8px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-dark);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.feature-tabs {
  display: flex;
  gap: 12px;
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 1px;
}

.feature-tab {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.feature-tab:hover:not(:disabled) {
  color: var(--color-primary);
}

.feature-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.feature-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.creation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1100px) {
  .creation-grid {
    grid-template-columns: 1fr;
  }
}

.creation-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.placeholder-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px dashed var(--border);
  color: var(--text-secondary);
}
</style>
