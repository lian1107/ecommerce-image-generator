<script setup lang="ts">
import { computed } from 'vue'
import { useGenerationStore } from '@/stores/generationStore'
import { BaseButton } from '@/components/common'

const generationStore = useGenerationStore()

const progressPercentage = computed(() =>
  Math.round(generationStore.progress.progress)
)

const statusIcon = computed(() => {
  switch (generationStore.progress.status) {
    case 'preparing': return '⏳'
    case 'generating': return '🎨'
    case 'processing': return '⚙️'
    case 'completed': return '✅'
    case 'error': return '❌'
    default: return '💤'
  }
})
</script>

<template>
  <div v-if="generationStore.isGenerating || generationStore.progress.status === 'error'" class="generation-progress">
    <div class="generation-progress__header">
      <span class="generation-progress__icon">{{ statusIcon }}</span>
      <span class="generation-progress__status">{{ generationStore.progress.currentStep }}</span>
    </div>

    <div class="generation-progress__bar-container">
      <div class="generation-progress__bar">
        <div
          class="generation-progress__fill"
          :class="{ 'generation-progress__fill--error': generationStore.progress.status === 'error' }"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <span class="generation-progress__percentage">{{ progressPercentage }}%</span>
    </div>

    <div v-if="generationStore.progress.error" class="generation-progress__error">
      <p class="generation-progress__error-text">{{ generationStore.progress.error }}</p>
      <BaseButton variant="outline" size="sm" @click="generationStore.resetProgress">
        关闭
      </BaseButton>
    </div>

    <div v-if="generationStore.isGenerating" class="generation-progress__actions">
      <BaseButton variant="ghost" size="sm" @click="generationStore.cancelGeneration">
        取消生成
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.generation-progress {
  padding: 1rem;
  background: var(--color-bg-card, #ffffff);
  border-radius: var(--radius-lg, 0.75rem);
  border: 1px solid var(--color-border, #e5e7eb);
}

.generation-progress__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.generation-progress__icon {
  font-size: 1.25rem;
}

.generation-progress__status {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text, #374151);
}

.generation-progress__bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.generation-progress__bar {
  flex: 1;
  height: 8px;
  background: var(--color-bg-secondary, #e5e7eb);
  border-radius: 4px;
  overflow: hidden;
}

.generation-progress__fill {
  height: 100%;
  background: var(--color-primary, #3b82f6);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.generation-progress__fill--error {
  background: var(--color-danger, #ef4444);
}

.generation-progress__percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
  min-width: 3rem;
  text-align: right;
}

.generation-progress__error {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--color-error-bg, #fef2f2);
  border-radius: var(--radius-md, 0.5rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.generation-progress__error-text {
  font-size: 0.8125rem;
  color: var(--color-danger, #ef4444);
  margin: 0;
}

.generation-progress__actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
}
</style>
