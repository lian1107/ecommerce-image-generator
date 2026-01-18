<script setup lang="ts">
import { ref } from 'vue'
import type { GenerationResult } from '@/types'

interface Props {
  result: GenerationResult
  selected?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  showActions: true
})

const emit = defineEmits<{
  select: [result: GenerationResult]
  download: [result: GenerationResult]
  remove: [result: GenerationResult]
  preview: [result: GenerationResult]
}>()

const isLoading = ref(true)
const hasError = ref(false)

const handleLoad = () => {
  isLoading.value = false
}

const handleError = () => {
  isLoading.value = false
  hasError.value = true
}
</script>

<template>
  <div
    class="image-card"
    :class="{ 'image-card--selected': selected }"
    @click="emit('select', result)"
  >
    <div class="image-card__image-container">
      <div v-if="isLoading" class="image-card__loading">
        <span class="image-card__spinner"></span>
      </div>
      <div v-else-if="hasError" class="image-card__error">
        <span>加载失败</span>
      </div>
      <img
        v-show="!isLoading && !hasError"
        :src="result.imageUrl"
        :alt="result.prompt"
        class="image-card__image"
        loading="lazy"
        @load="handleLoad"
        @error="handleError"
      />

      <div class="image-card__selection">
        <span class="image-card__checkbox" :class="{ 'image-card__checkbox--checked': selected }">
          <svg v-if="selected" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>
    </div>

    <div v-if="showActions" class="image-card__actions">
      <button
        class="image-card__action"
        title="预览"
        @click.stop="emit('preview', result)"
      >
        🔍
      </button>
      <button
        class="image-card__action"
        title="下载"
        @click.stop="emit('download', result)"
      >
        ⬇️
      </button>
      <button
        class="image-card__action image-card__action--danger"
        title="删除"
        @click.stop="emit('remove', result)"
      >
        🗑️
      </button>
    </div>

    <div class="image-card__info">
      <span class="image-card__dimension">
        {{ result.metadata.width }}×{{ result.metadata.height }}
      </span>
      <span class="image-card__time">
        {{ new Date(result.createdAt).toLocaleTimeString() }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.image-card {
  position: relative;
  background: var(--color-bg-card, #ffffff);
  border: 2px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-lg, 0.75rem);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-card:hover {
  border-color: var(--color-primary-light, #93c5fd);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.image-card--selected {
  border-color: var(--color-primary, #3b82f6);
}

.image-card__image-container {
  position: relative;
  aspect-ratio: 1;
  background: var(--color-bg-secondary, #f3f4f6);
}

.image-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-card__loading,
.image-card__error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary, #f3f4f6);
}

.image-card__spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border, #d1d5db);
  border-top-color: var(--color-primary, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.image-card__error {
  font-size: 0.8125rem;
  color: var(--color-text-muted, #9ca3af);
}

.image-card__selection {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
}

.image-card__checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--color-border, #d1d5db);
  border-radius: 4px;
  transition: all 0.2s;
}

.image-card__checkbox--checked {
  background: var(--color-primary, #3b82f6);
  border-color: var(--color-primary, #3b82f6);
  color: white;
}

.image-card__actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-card:hover .image-card__actions {
  opacity: 1;
}

.image-card__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: var(--radius-sm, 0.25rem);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s, transform 0.2s;
}

.image-card__action:hover {
  background: white;
  transform: scale(1.1);
}

.image-card__action--danger:hover {
  background: var(--color-error-bg, #fef2f2);
}

.image-card__info {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  font-size: 0.6875rem;
  color: var(--color-text-muted, #9ca3af);
}
</style>
