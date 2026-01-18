<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { APP_CONFIG } from '@/config'

const productStore = useProductStore()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const errorMessage = ref('')

const acceptTypes = APP_CONFIG.upload.acceptedTypes.join(',')
const maxSizeMB = APP_CONFIG.upload.maxFileSize / 1024 / 1024

const canUpload = computed(() => productStore.canAddMoreImages)
const remainingSlots = computed(() => APP_CONFIG.upload.maxFiles - productStore.imageCount)

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  await processFiles(files)
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  await processFiles(files)
  target.value = '' // Reset input
}

const processFiles = async (files: File[]) => {
  errorMessage.value = ''

  const imageFiles = files.filter(f => f.type.startsWith('image/'))
  if (imageFiles.length === 0) {
    errorMessage.value = '请选择图片文件'
    return
  }

  try {
    await productStore.addImages(imageFiles)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '上传失败'
  }
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const removeImage = (id: string) => {
  productStore.removeImage(id)
}
</script>

<template>
  <div class="image-uploader">
    <div
      v-if="canUpload"
      class="upload-zone"
      :class="{ 'upload-zone--dragging': isDragging }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="triggerFileSelect"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="acceptTypes"
        multiple
        hidden
        @change="handleFileSelect"
      />
      <div class="upload-zone__icon">📷</div>
      <p class="upload-zone__title">拖拽图片到这里上传</p>
      <p class="upload-zone__hint">
        或点击选择文件 (最多{{ APP_CONFIG.upload.maxFiles }}张，单张最大{{ maxSizeMB }}MB)
      </p>
      <p v-if="remainingSlots < APP_CONFIG.upload.maxFiles" class="upload-zone__remaining">
        还可上传 {{ remainingSlots }} 张
      </p>
    </div>

    <p v-if="errorMessage" class="upload-error">{{ errorMessage }}</p>

    <div v-if="productStore.hasImages" class="uploaded-images">
      <div
        v-for="(image, index) in productStore.uploadedImages"
        :key="image.id"
        class="uploaded-image"
      >
        <img :src="image.preview" :alt="image.name" class="uploaded-image__preview" />
        <div class="uploaded-image__overlay">
          <span class="uploaded-image__badge">{{ index + 1 }}</span>
          <button
            class="uploaded-image__remove"
            @click.stop="removeImage(image.id)"
            title="删除"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="uploaded-image__info">
          <span class="uploaded-image__name">{{ image.name }}</span>
          <span class="uploaded-image__size">{{ (image.size / 1024).toFixed(1) }}KB</span>
        </div>
      </div>

      <div
        v-if="canUpload"
        class="add-more"
        @click="triggerFileSelect"
      >
        <span class="add-more__icon">+</span>
        <span class="add-more__text">添加</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upload-zone {
  border: 2px dashed var(--color-border, #d1d5db);
  border-radius: var(--radius-lg, 0.75rem);
  padding: 2rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.upload-zone:hover {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-primary-light, rgba(59, 130, 246, 0.05));
}

.upload-zone--dragging {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-primary-light, rgba(59, 130, 246, 0.1));
}

.upload-zone__icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.upload-zone__title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text, #374151);
  margin: 0 0 0.25rem;
}

.upload-zone__hint {
  font-size: 0.8125rem;
  color: var(--color-text-muted, #9ca3af);
  margin: 0;
}

.upload-zone__remaining {
  font-size: 0.75rem;
  color: var(--color-primary, #3b82f6);
  margin: 0.5rem 0 0;
}

.upload-error {
  font-size: 0.8125rem;
  color: var(--color-danger, #ef4444);
  margin: 0;
}

.uploaded-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.uploaded-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md, 0.5rem);
  overflow: hidden;
  background: var(--color-bg-secondary, #f3f4f6);
}

.uploaded-image__preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.uploaded-image__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent 50%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.375rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.uploaded-image:hover .uploaded-image__overlay {
  opacity: 1;
}

.uploaded-image__badge {
  background: var(--color-primary, #3b82f6);
  color: white;
  font-size: 0.6875rem;
  font-weight: 600;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uploaded-image__remove {
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-danger, #ef4444);
  transition: transform 0.2s;
}

.uploaded-image__remove:hover {
  transform: scale(1.1);
}

.uploaded-image__info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.375rem 0.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.uploaded-image__name {
  font-size: 0.6875rem;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.uploaded-image__size {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.7);
}

.add-more {
  aspect-ratio: 1;
  border: 2px dashed var(--color-border, #d1d5db);
  border-radius: var(--radius-md, 0.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.add-more:hover {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-primary-light, rgba(59, 130, 246, 0.05));
}

.add-more__icon {
  font-size: 1.5rem;
  color: var(--color-text-muted, #9ca3af);
}

.add-more__text {
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
}
</style>
