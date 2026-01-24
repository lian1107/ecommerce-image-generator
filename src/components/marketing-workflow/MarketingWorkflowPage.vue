<script setup lang="ts">
import { computed } from 'vue'
import { useMarketingWorkflowStore } from '@/stores/marketingWorkflowStore'
import WorkflowStepper from './WorkflowStepper.vue'
import AgentThoughtLog from './AgentThoughtLog.vue'
import { BaseButton } from '@/components/common'

import ProductAnalysisStep from './steps/ProductAnalysisStep.vue'
import StrategySelectionStep from './steps/StrategySelectionStep.vue'
import ContentPlanningStep from './steps/ContentPlanningStep.vue'
import BatchGenerationStep from './steps/BatchGenerationStep.vue'

const store = useMarketingWorkflowStore()

const currentStepComponent = computed(() => {
  switch (store.currentStep) {
    case 'ANALYSIS':
      return ProductAnalysisStep
    case 'STRATEGY':
    case 'CRITIQUING':
    case 'STRATEGY_READY':
      return StrategySelectionStep
    case 'PLANNING':
      return ContentPlanningStep
    case 'GENERATION':
    case 'QUALITY_CHECK':
    case 'COMPLETED':
      return BatchGenerationStep
    default:
      return null
  }
})

// Quick debug initializer
const init = () => {
    store.initAgentOrchestrator()
    store.addThought('System', 'Marketing Planner Mode initialized.')
}
init()

</script>

<template>
  <div class="marketing-page">
    <!-- Left Sidebar: Navigation & Agents -->
    <div class="sidebar">
      <div class="sidebar-section">
        <h3 class="sidebar-title">Workflow</h3>
        <WorkflowStepper />
      </div>
      
      <div class="sidebar-section flex-grow">
        <AgentThoughtLog />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <div v-if="currentStepComponent" class="step-container">
        <component :is="currentStepComponent" />
      </div>
      
      <!-- Placeholder Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🚧</div>
        <h2>正在建设中...</h2>
        <p>当前步骤: {{ store.currentStep }}</p>
        <p class="sub-text">Phase 3 将实现具体的功能步骤组件。</p>
        
        <div class="debug-actions">
            <BaseButton size="sm" @click="store.setStep('STRATEGY')">Debug: Next Step</BaseButton>
            <BaseButton size="sm" @click="store.addThought('Director', 'Thinking about strategy...')">Debug: Agent Log</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marketing-page {
  display: flex;
  height: 100%;
  gap: 24px;
}

.sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-section.flex-grow {
  flex: 1;
  min-height: 0;
}

.sidebar-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
}

.main-content {
  flex: 1;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 24px;
  overflow-y: auto;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.sub-text {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  opacity: 0.7;
}

.debug-actions {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
}

/* ========================================
   移动端样式 - 单栏堆叠布局
   ======================================== */
@media (max-width: 640px) {
  .marketing-page {
    flex-direction: column;
    height: auto;
    min-height: 100%;
    gap: 1rem;
    padding: 0;
  }

  .sidebar {
    width: 100%;
    flex-direction: column;
    gap: 0.75rem;
    order: 1; /* 步骤在上 */
  }

  .sidebar-section {
    gap: 0.5rem;
  }

  .sidebar-section.flex-grow {
    flex: none;
    min-height: auto;
    order: 3; /* 日志在最下方 */
  }

  .sidebar-title {
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .main-content {
    order: 2; /* 内容在中间 */
    flex: none;
    min-height: 50vh;
    padding: 1rem;
    border-radius: 0.75rem;
    margin: 0;
  }

  .step-container {
    padding: 0;
  }

  .empty-state {
    min-height: 200px;
    height: auto;
  }

  .empty-icon {
    font-size: 2rem;
  }

  .debug-actions {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .debug-actions button {
    width: 100%;
  }
}

/* 平板端样式 */
@media (min-width: 641px) and (max-width: 1024px) {
  .marketing-page {
    gap: 1rem;
  }

  .sidebar {
    width: 220px;
  }

  .main-content {
    padding: 1.25rem;
  }
}
</style>
