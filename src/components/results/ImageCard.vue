<script setup lang="ts">
import { ref } from 'vue'
import type { GenerationResult } from '@/types'

interface Props {
  result: GenerationResult
  selected?: boolean
  showActions?: boolean
  enableLazyLoad?: boolean
}

const emit = defineEmits<{
  select: [result: GenerationResult]
  download: [result: GenerationResult]
  remove: [result: GenerationResult]
  preview: [result: GenerationResult]
}>()

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  showActions: true,
  enableLazyLoad: true
})

const isLoading = ref(true)
const hasError = ref(false)
const imageRef = ref<HTMLImageElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)

// 懒加载逻辑
const setupLazyLoad = (img: HTMLImageElement) => {
  imageRef.value = img

  // 如果不支持 IntersectionObserver 或不启用懒加载，直接加载图片
  if (!props.enableLazyLoad || !('IntersectionObserver' in window)) {
    const src = img.dataset.src || props.result.imageUrl
    if (src && !img.src) {
      img.src = src
    }
    return
  }

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement
          const src = image.dataset.src

          if (src && !image.src) {
            image.src = src
            image.classList.add('lazy-loading')
          }

          // 加载后停止观察
          if (observer.value) {
            observer.value.unobserve(image)
          }
        }
      })
    },
    {
      rootMargin: '200px', // 提前 200px 开始加载
      threshold: 0.01
    }
  )

  observer.value.observe(img)

  // 如果图片已经在视口内，立即触发加载
  const rect = img.getBoundingClientRect()
  const inViewport = rect.top < window.innerHeight + 200 && rect.bottom > -200
  if (inViewport && img.dataset.src && !img.src) {
    img.src = img.dataset.src
    img.classList.add('lazy-loading')
    observer.value.unobserve(img)
  }
}

const handleLoad = () => {
  isLoading.value = false
  if (imageRef.value) {
    imageRef.value.classList.remove('lazy-loading')
    imageRef.value.classList.add('lazy-loaded')
  }
}

const handleError = () => {
  isLoading.value = false
  hasError.value = true
  if (imageRef.value) {
    imageRef.value.classList.remove('lazy-loading')
    imageRef.value.classList.add('lazy-error')
  }
}

// 清理
const cleanup = () => {
  if (observer.value && imageRef.value) {
    observer.value.unobserve(imageRef.value)
    observer.value.disconnect()
  }
}

// 生命周期
import { onMounted, onBeforeUnmount, watch } from 'vue'

onMounted(() => {
  if (imageRef.value && props.enableLazyLoad) {
    setupLazyLoad(imageRef.value)
  }
})

watch(imageRef, (newRef) => {
  if (newRef && props.enableLazyLoad) {
    setupLazyLoad(newRef)
  }
})

onBeforeUnmount(() => {
  cleanup()
})
</script>

<template>
  <div
    class="image-card"
    :class="{ 'image-card--selected': selected }"
    @click="emit('select', result)"
  >
    <div class="image-card__image-container">
      <!-- 骨架屏占位符 -->
      <div v-if="isLoading" class="image-card__skeleton">
        <div class="skeleton-shimmer"></div>
        <span class="image-card__spinner"></span>
      </div>
      <div v-else-if="hasError" class="image-card__error">
        <span>❌ 加载失败</span>
      </div>
      <img
        ref="imageRef"
        v-show="!isLoading && !hasError"
        :data-src="enableLazyLoad ? result.imageUrl : undefined"
        :src="enableLazyLoad ? undefined : result.imageUrl"
        :alt="result.prompt"
        class="image-card__image"
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
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-card__image.lazy-loading {
  opacity: 0.5;
  filter: blur(4px);
}

.image-card__image.lazy-loaded {
  opacity: 1;
  filter: none;
}

.image-card__image.lazy-error {
  opacity: 0.3;
}

/* 骨架屏占位符 */
.image-card__skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
  overflow: hidden;
}

.skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.6) 50%,
    transparent 100%
  );
  animation: shimmer-slide 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes shimmer-slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

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
