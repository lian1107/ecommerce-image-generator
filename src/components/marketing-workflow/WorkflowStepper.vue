<script setup lang="ts">
import { computed } from 'vue'
import { useMarketingWorkflowStore, type WorkflowStep } from '@/stores/marketingWorkflowStore'

const store = useMarketingWorkflowStore()

const steps = [
  { id: 'ANALYSIS', label: '1. 产品分析', icon: '🔍' },
  { id: 'STRATEGY', label: '2. 策略制定', icon: '🧠' },
  { id: 'PLANNING', label: '3. 内容企划', icon: '📝' },
  { id: 'GENERATION', label: '4. 批量生成', icon: '✨' }
]

const currentStepIndex = computed(() => {
  const map: Record<WorkflowStep, number> = {
    'ANALYSIS': 0,
    'STRATEGY': 1,
    'CRITIQUING': 1, // Share step
    'STRATEGY_READY': 1, // Share step
    'PLANNING': 2,
    'GENERATION': 3,
    'QUALITY_CHECK': 3,
    'COMPLETED': 4
  }
  return map[store.currentStep] ?? 0
})
</script>

<template>
  <div class="workflow-stepper">
    <div 
      v-for="(step, index) in steps" 
      :key="step.id"
      class="step-item"
      :class="{ 
        'active': index === currentStepIndex,
        'completed': index < currentStepIndex
      }"
    >
      <div class="step-icon">
        <span v-if="index < currentStepIndex" class="check">✓</span>
        <span v-else>{{ index + 1 }}</span>
      </div>
      <div class="step-label">
        <span class="label-text">{{ step.label }}</span>
      </div>
      <div class="step-line" v-if="index < steps.length - 1"></div>
    </div>
  </div>
</template>

<style scoped>
.workflow-stepper {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 1rem 0;
}

.step-item {
  display: flex;
  align-items: center;
  position: relative;
  padding-bottom: 2rem;
  color: var(--color-text-secondary);
}

.step-item:last-child {
  padding-bottom: 0;
}

.step-item:last-child .step-line {
  display: none;
}

.step-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  z-index: 2;
  transition: all 0.3s ease;
}

.step-label {
  margin-left: 1rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.step-line {
  position: absolute;
  left: 14px; /* Center of 28px icon */
  top: 28px;
  bottom: 0;
  width: 2px;
  background: var(--color-border-light);
  transform: translateX(-50%);
  z-index: 1;
}

/* Active State */
.step-item.active {
  color: var(--color-primary);
}

.step-item.active .step-icon {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 0 0 4px var(--color-primary-dim);
}

/* Completed State */
.step-item.completed {
  color: var(--color-text);
}

.step-item.completed .step-icon {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.step-item.completed .step-line {
  background: var(--color-success);
}
</style>
