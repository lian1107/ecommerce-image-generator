<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGenerationStore } from '@/stores/generationStore'
import { useSwipe, useIsMobile } from '@/composables/useSwipe'
import { BaseButton, BaseModal } from '@/components/common'
import ImageCard from './ImageCard.vue'
import GenerationProgress from './GenerationProgress.vue'
import type { GenerationResult } from '@/types'

const generationStore = useGenerationStore()
const { isMobile } = useIsMobile()

const previewImage = ref<GenerationResult | null>(null)
const showPreviewModal = ref(false)
const currentPreviewIndex = ref(0)
const previewImageRef = ref<HTMLElement | null>(null)

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
  const index = generationStore.results.findIndex(r => r.id === result.id)
  currentPreviewIndex.value = index !== -1 ? index : 0
  previewImage.value = generationStore.results[currentPreviewIndex.value]
  showPreviewModal.value = true
}

const closePreview = () => {
  showPreviewModal.value = false
  previewImage.value = null
}

const nextImage = () => {
  if (currentPreviewIndex.value < generationStore.results.length - 1) {
    currentPreviewIndex.value++
    previewImage.value = generationStore.results[currentPreviewIndex.value]
  }
}

const previousImage = () => {
  if (currentPreviewIndex.value > 0) {
    currentPreviewIndex.value--
    previewImage.value = generationStore.results[currentPreviewIndex.value]
  }
}

const hasPreviousImage = computed(() => currentPreviewIndex.value > 0)
const hasNextImage = computed(() => currentPreviewIndex.value < generationStore.results.length - 1)

// Touch gesture support for mobile
useSwipe(previewImageRef, {
  onSwipeLeft: () => {
    if (isMobile.value && hasNextImage.value) {
      nextImage()
    }
  },
  onSwipeRight: () => {
    if (isMobile.value && hasPreviousImage.value) {
      previousImage()
    }
  }
})
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
      :title="previewImage ? `预览 ${currentPreviewIndex + 1}/${generationStore.results.length} - ${previewImage.metadata.width}×${previewImage.metadata.height}` : '预览'"
      width="800px"
      :show-footer="false"
    >
      <div v-if="previewImage" class="preview-modal">
        <!-- Navigation Buttons for Desktop -->
        <button
          v-if="!isMobile && hasPreviousImage"
          class="preview-nav preview-nav--left"
          @click="previousImage"
          title="上一张"
        >
          ‹
        </button>
        <button
          v-if="!isMobile && hasNextImage"
          class="preview-nav preview-nav--right"
          @click="nextImage"
          title="下一张"
        >
          ›
        </button>

        <!-- Image with touch support -->
        <div ref="previewImageRef" class="preview-modal__image-container">
          <img
            :src="previewImage.imageUrl"
            :alt="previewImage.prompt"
            class="preview-modal__image"
          />
          <!-- Mobile swipe hint -->
          <div v-if="isMobile" class="swipe-hint">
            {{ hasPreviousImage ? '← ' : '' }}滑动切换{{ hasNextImage ? ' →' : '' }}
          </div>
        </div>
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
  position: relative;
}

.preview-modal__image-container {
  position: relative;
  width: 100%;
  touch-action: pan-y; /* Allow vertical scroll but enable horizontal swipe */
}

.preview-modal__image {
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: var(--radius-md, 0.5rem);
  background: var(--color-bg-secondary, #f3f4f6);
}

/* Navigation buttons for desktop */
.preview-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.preview-nav:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translateY(-50%) scale(1.1);
}

.preview-nav--left {
  left: 1rem;
}

.preview-nav--right {
  right: 1rem;
}

/* Mobile swipe hint */
.swipe-hint {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  pointer-events: none;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* Mobile Responsive */
@media (max-width: 640px) {
  .results-grid__header {
    flex-direction: column;
    align-items: stretch;
  }

  .results-grid__actions {
    width: 100%;
  }

  .results-grid__actions button {
    flex: 1;
    min-width: 0;
    font-size: 0.75rem;
  }

  .results-grid__grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .preview-modal__image {
    max-height: 50vh;
  }

  .preview-modal__actions {
    flex-direction: column;
  }

  .preview-modal__actions button {
    width: 100%;
  }
}
</style>
