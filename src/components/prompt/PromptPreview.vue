<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGenerationStore } from '@/stores/generationStore'
import { BaseButton, BaseTextarea, CollapseSection } from '@/components/common'

const generationStore = useGenerationStore()

const localPrompt = ref('')

watch(
  () => generationStore.finalPrompt,
  (newPrompt) => {
    localPrompt.value = newPrompt
  },
  { immediate: true }
)

const handlePromptChange = (value: string) => {
  localPrompt.value = value
  generationStore.setEditedPrompt(value)
}

const refreshPrompt = () => {
  generationStore.buildPrompt()
  localPrompt.value = generationStore.finalPrompt
}

const copyPrompt = async () => {
  try {
    await navigator.clipboard.writeText(localPrompt.value)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}
</script>

<template>
  <CollapseSection title="提示词预览" icon="📝" :default-open="true">
    <div class="prompt-preview">
      <div class="prompt-preview__header">
        <div class="prompt-preview__mode">
          <button
            class="prompt-preview__mode-btn"
            :class="{ 'prompt-preview__mode-btn--active': !generationStore.isEditingPrompt }"
            @click="generationStore.isEditingPrompt = false"
          >
            预览
          </button>
          <button
            class="prompt-preview__mode-btn"
            :class="{ 'prompt-preview__mode-btn--active': generationStore.isEditingPrompt }"
            @click="generationStore.isEditingPrompt = true"
          >
            编辑
          </button>
        </div>
        <div class="prompt-preview__actions">
          <BaseButton variant="ghost" size="sm" @click="refreshPrompt" title="刷新提示词">
            🔄
          </BaseButton>
          <BaseButton variant="ghost" size="sm" @click="copyPrompt" title="复制提示词">
            📋
          </BaseButton>
        </div>
      </div>

      <div v-if="!generationStore.isEditingPrompt" class="prompt-preview__content">
        <p v-if="localPrompt" class="prompt-preview__text">{{ localPrompt }}</p>
        <p v-else class="prompt-preview__empty">
          请先上传图片并选择场景，系统将自动生成提示词
        </p>
      </div>

      <div v-else class="prompt-preview__editor">
        <BaseTextarea
          :model-value="localPrompt"
          placeholder="输入或编辑提示词..."
          :rows="6"
          resize="vertical"
          @update:model-value="handlePromptChange"
        />
        <div class="prompt-preview__editor-actions">
          <BaseButton
            variant="ghost"
            size="sm"
            @click="generationStore.resetPromptToGenerated"
          >
            还原自动生成
          </BaseButton>
        </div>
      </div>

      <div v-if="generationStore.promptConfig?.layers" class="prompt-preview__layers">
        <h5 class="prompt-preview__layers-title">提示词层级</h5>
        <div class="prompt-preview__layers-list">
          <div
            v-for="layer in generationStore.promptConfig.layers.filter(l => l.content && l.name !== 'negative')"
            :key="layer.name"
            class="prompt-preview__layer"
          >
            <span class="prompt-preview__layer-name">{{ layer.name }}</span>
            <span class="prompt-preview__layer-weight">{{ layer.weight.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>
  </CollapseSection>
</template>

<style scoped>
.prompt-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.prompt-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prompt-preview__mode {
  display: flex;
  background: var(--color-bg-secondary, #f3f4f6);
  border-radius: var(--radius-md, 0.5rem);
  padding: 0.125rem;
}

.prompt-preview__mode-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm, 0.375rem);
  cursor: pointer;
  color: var(--color-text-muted, #6b7280);
  transition: all 0.2s;
  font-family: inherit;
}

.prompt-preview__mode-btn:hover {
  color: var(--color-text, #374151);
}

.prompt-preview__mode-btn--active {
  background: var(--color-bg-card, #ffffff);
  color: var(--color-text, #374151);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.prompt-preview__actions {
  display: flex;
  gap: 0.25rem;
}

.prompt-preview__content {
  padding: 0.75rem;
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 0.5rem);
  min-height: 80px;
}

.prompt-preview__text {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-text, #374151);
  margin: 0;
  word-break: break-word;
}

.prompt-preview__empty {
  font-size: 0.8125rem;
  color: var(--color-text-muted, #9ca3af);
  margin: 0;
  font-style: italic;
}

.prompt-preview__editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prompt-preview__editor-actions {
  display: flex;
  justify-content: flex-end;
}

.prompt-preview__layers {
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.prompt-preview__layers-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted, #9ca3af);
  margin: 0 0 0.5rem;
}

.prompt-preview__layers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.prompt-preview__layer {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  background: var(--color-bg-secondary, #f3f4f6);
  border-radius: var(--radius-sm, 0.25rem);
  font-size: 0.6875rem;
}

.prompt-preview__layer-name {
  color: var(--color-text, #374151);
}

.prompt-preview__layer-weight {
  color: var(--color-primary, #3b82f6);
  font-weight: 500;
}
</style>
