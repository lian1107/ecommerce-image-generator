<script setup lang="ts">
import { ref } from 'vue'
import { useGenerationStore } from '@/stores/generationStore'
import { BaseButton, BaseModal } from '@/components/common'
import ImageCard from './ImageCard.vue'
import GenerationProgress from './GenerationProgress.vue'
import type { GenerationResult } from '@/types'

const generationStore = useGenerationStore()

const previewImage = ref<GenerationResult | null>(null)
const showPreviewModal = ref(false)

const handleSelect = (result: GenerationResult) => {
  generationStore.toggleResultSelection(result.id)
}

const handleDownload = (result: GenerationResult) => {
  generationStore.downloadResult(result.id)
}

const handleRemove = (result: GenerationResult) => {
  generationStore.removeResult(result.id)
}

const handlePreview = (result: GenerationResult) => {
  previewImage.value = result
  showPreviewModal.value = true
}

const closePreview = () => {
  showPreviewModal.value = false
  previewImage.value = null
}
</script>

<template>
  <div class="results-grid">
    <GenerationProgress />

    <div v-if="generationStore.hasResults" class="results-grid__header">
      <h3 class="results-grid__title">
        生成结果 ({{ generationStore.resultCount }}张)
      </h3>
      <div class="results-grid__actions">
        <BaseButton
          v-if="generationStore.hasSelectedResults"
          variant="outline"
          size="sm"
          @click="generationStore.downloadSelectedResults"
        >
          下载选中 ({{ generationStore.selectedCount }})
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="generationStore.selectAllResults"
        >
          全选
        </BaseButton>
        <BaseButton
          v-if="generationStore.hasSelectedResults"
          variant="ghost"
          size="sm"
          @click="generationStore.deselectAllResults"
        >
          取消全选
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="generationStore.downloadAllResults">
          下载全部
        </BaseButton>
      </div>
    </div>

    <div v-if="generationStore.hasResults" class="results-grid__grid">
      <ImageCard
        v-for="result in generationStore.results"
        :key="result.id"
        :result="result"
        :selected="generationStore.selectedResults.has(result.id)"
        @select="handleSelect"
        @download="handleDownload"
        @remove="handleRemove"
        @preview="handlePreview"
      />
    </div>

    <div v-else-if="!generationStore.isGenerating" class="results-grid__empty">
      <div class="results-grid__empty-icon">🖼️</div>
      <p class="results-grid__empty-text">暂无生成结果</p>
      <p class="results-grid__empty-hint">
        上传图片，选择场景，点击"开始生成"按钮
      </p>
    </div>

    <!-- Preview Modal -->
    <BaseModal
      v-model:visible="showPreviewModal"
      :title="previewImage ? `预览 - ${previewImage.metadata.width}×${previewImage.metadata.height}` : '预览'"
      width="800px"
      :show-footer="false"
    >
      <div v-if="previewImage" class="preview-modal">
        <img
          :src="previewImage.imageUrl"
          :alt="previewImage.prompt"
          class="preview-modal__image"
        />
        <div class="preview-modal__info">
          <p class="preview-modal__prompt">{{ previewImage.prompt }}</p>
          <div class="preview-modal__meta">
            <span>场景: {{ previewImage.scene }}</span>
            <span>创建时间: {{ new Date(previewImage.createdAt).toLocaleString() }}</span>
          </div>
        </div>
        <div class="preview-modal__actions">
          <BaseButton variant="primary" @click="handleDownload(previewImage!)">
            下载图片
          </BaseButton>
          <BaseButton variant="outline" @click="closePreview">
            关闭
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.results-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.results-grid__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.results-grid__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text, #111827);
  margin: 0;
}

.results-grid__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.results-grid__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.results-grid__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  background: var(--color-bg-card, #ffffff);
  border: 2px dashed var(--color-border, #e5e7eb);
  border-radius: var(--radius-lg, 0.75rem);
  text-align: center;
}

.results-grid__empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.results-grid__empty-text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text, #374151);
  margin: 0 0 0.25rem;
}

.results-grid__empty-hint {
  font-size: 0.875rem;
  color: var(--color-text-muted, #9ca3af);
  margin: 0;
}

/* Preview Modal */
.preview-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-modal__image {
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: var(--radius-md, 0.5rem);
  background: var(--color-bg-secondary, #f3f4f6);
}

.preview-modal__info {
  padding: 0.75rem;
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 0.5rem);
}

.preview-modal__prompt {
  font-size: 0.8125rem;
  color: var(--color-text, #374151);
  margin: 0 0 0.5rem;
  line-height: 1.5;
}

.preview-modal__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
}

.preview-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
