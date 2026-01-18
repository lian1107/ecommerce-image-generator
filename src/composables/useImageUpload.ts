import { ref, computed } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { APP_CONFIG } from '@/config'

export function useImageUpload() {
  const productStore = useProductStore()

  const isDragging = ref(false)
  const uploadError = ref<string | null>(null)

  const images = computed(() => productStore.uploadedImages)
  const imageCount = computed(() => productStore.imageCount)
  const canAddMore = computed(() => productStore.canAddMoreImages)
  const maxFiles = APP_CONFIG.upload.maxFiles

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = true
  }

  const handleDragLeave = () => {
    isDragging.value = false
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = false
    uploadError.value = null

    const files = Array.from(e.dataTransfer?.files || [])
    await uploadFiles(files)
  }

  const uploadFiles = async (files: File[]) => {
    uploadError.value = null

    const imageFiles = files.filter(f =>
      APP_CONFIG.upload.acceptedTypes.includes(f.type)
    )

    if (imageFiles.length === 0) {
      uploadError.value = '请选择有效的图片文件 (JPG, PNG, WebP)'
      return
    }

    try {
      await productStore.addImages(imageFiles)
    } catch (error) {
      uploadError.value = error instanceof Error ? error.message : '上传失败'
    }
  }

  const uploadFile = async (file: File) => {
    uploadError.value = null

    if (!APP_CONFIG.upload.acceptedTypes.includes(file.type)) {
      uploadError.value = `不支持的文件类型: ${file.type}`
      return null
    }

    if (file.size > APP_CONFIG.upload.maxFileSize) {
      uploadError.value = `文件过大，最大支持 ${APP_CONFIG.upload.maxFileSize / 1024 / 1024}MB`
      return null
    }

    try {
      return await productStore.addImage(file)
    } catch (error) {
      uploadError.value = error instanceof Error ? error.message : '上传失败'
      return null
    }
  }

  const removeImage = (id: string) => {
    productStore.removeImage(id)
  }

  const clearImages = () => {
    productStore.clearImages()
  }

  const reorderImages = (fromIndex: number, toIndex: number) => {
    productStore.reorderImages(fromIndex, toIndex)
  }

  return {
    isDragging,
    uploadError,
    images,
    imageCount,
    canAddMore,
    maxFiles,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    uploadFiles,
    uploadFile,
    removeImage,
    clearImages,
    reorderImages
  }
}
