import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProductInfo, UploadedImage, ImageAnalysis } from '@/types'
import { APP_CONFIG } from '@/config'

export const useProductStore = defineStore('product', () => {
  // State
  const productInfo = ref<ProductInfo>({
    name: '',
    category: '',
    description: '',
    features: [],
    targetAudience: '',
    brand: '',
    style: ''
  })

  const uploadedImages = ref<UploadedImage[]>([])
  const imageAnalyses = ref<Map<string, ImageAnalysis>>(new Map())
  const isAnalyzing = ref(false)

  // Getters
  const hasProduct = computed(() =>
    productInfo.value.name.trim().length > 0
  )

  const hasImages = computed(() =>
    uploadedImages.value.length > 0
  )

  const imageCount = computed(() =>
    uploadedImages.value.length
  )

  const canAddMoreImages = computed(() =>
    uploadedImages.value.length < APP_CONFIG.upload.maxFiles
  )

  const primaryImage = computed(() =>
    uploadedImages.value[0] || null
  )

  const imageDataUrls = computed(() =>
    uploadedImages.value.map(img => img.preview)
  )

  const productSummary = computed(() => {
    const parts: string[] = []
    if (productInfo.value.name) parts.push(productInfo.value.name)
    if (productInfo.value.brand) parts.push(`by ${productInfo.value.brand}`)
    if (productInfo.value.category) parts.push(`(${productInfo.value.category})`)
    return parts.join(' ')
  })

  // Actions
  const setProductInfo = (info: Partial<ProductInfo>) => {
    productInfo.value = { ...productInfo.value, ...info }
  }

  const setProductName = (name: string) => {
    productInfo.value.name = name
  }

  const setProductCategory = (category: string) => {
    productInfo.value.category = category
  }

  const setProductDescription = (description: string) => {
    productInfo.value.description = description
  }

  const addFeature = (feature: string) => {
    if (!productInfo.value.features.includes(feature)) {
      productInfo.value.features.push(feature)
    }
  }

  const removeFeature = (index: number) => {
    productInfo.value.features.splice(index, 1)
  }

  const setFeatures = (features: string[]) => {
    productInfo.value.features = features
  }

  const addImage = async (file: File): Promise<UploadedImage | null> => {
    if (!canAddMoreImages.value) {
      return null
    }

    // Validate file
    if (!APP_CONFIG.upload.acceptedTypes.includes(file.type)) {
      throw new Error(`不支持的文件类型: ${file.type}`)
    }

    if (file.size > APP_CONFIG.upload.maxFileSize) {
      throw new Error(`文件过大，最大支持 ${APP_CONFIG.upload.maxFileSize / 1024 / 1024}MB`)
    }

    // Create preview
    const preview = await readFileAsDataUrl(file)

    const uploadedImage: UploadedImage = {
      id: generateImageId(),
      file,
      preview,
      name: file.name,
      size: file.size,
      uploadedAt: new Date()
    }

    uploadedImages.value.push(uploadedImage)

    // Analyze image asynchronously
    analyzeImage(uploadedImage)

    return uploadedImage
  }

  const addImages = async (files: File[]): Promise<UploadedImage[]> => {
    const added: UploadedImage[] = []
    for (const file of files) {
      if (!canAddMoreImages.value) break
      try {
        const image = await addImage(file)
        if (image) added.push(image)
      } catch (error) {
        console.error('Failed to add image:', error)
      }
    }
    return added
  }

  const removeImage = (id: string) => {
    const index = uploadedImages.value.findIndex(img => img.id === id)
    if (index !== -1) {
      const image = uploadedImages.value[index]
      // Revoke object URL to free memory
      if (image.preview.startsWith('blob:')) {
        URL.revokeObjectURL(image.preview)
      }
      uploadedImages.value.splice(index, 1)
      imageAnalyses.value.delete(id)
    }
  }

  const clearImages = () => {
    for (const image of uploadedImages.value) {
      if (image.preview.startsWith('blob:')) {
        URL.revokeObjectURL(image.preview)
      }
    }
    uploadedImages.value = []
    imageAnalyses.value.clear()
  }

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const item = uploadedImages.value.splice(fromIndex, 1)[0]
    uploadedImages.value.splice(toIndex, 0, item)
  }

  const analyzeImage = async (image: UploadedImage) => {
    isAnalyzing.value = true

    try {
      const img = new Image()
      img.src = image.preview

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const analysis: ImageAnalysis = {
        aspectRatio: img.width / img.height,
        isWhiteBackground: await checkWhiteBackground(img),
        dominantColors: [], // Could implement color extraction
        quality: determineQuality(img.width, img.height)
      }

      imageAnalyses.value.set(image.id, analysis)
    } catch (error) {
      console.error('Image analysis failed:', error)
    } finally {
      isAnalyzing.value = false
    }
  }

  const getImageAnalysis = (id: string): ImageAnalysis | undefined => {
    return imageAnalyses.value.get(id)
  }

  const clearProduct = () => {
    productInfo.value = {
      name: '',
      category: '',
      description: '',
      features: [],
      targetAudience: '',
      brand: '',
      style: ''
    }
    clearImages()
  }

  // Helper functions
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const generateImageId = (): string => {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const checkWhiteBackground = async (img: HTMLImageElement): Promise<boolean> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return false

    // Sample corners
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    const samplePoints = [
      [5, 5],
      [img.width - 5, 5],
      [5, img.height - 5],
      [img.width - 5, img.height - 5]
    ]

    let whiteCount = 0
    for (const [x, y] of samplePoints) {
      const pixel = ctx.getImageData(x, y, 1, 1).data
      // Check if pixel is close to white
      if (pixel[0] > 240 && pixel[1] > 240 && pixel[2] > 240) {
        whiteCount++
      }
    }

    return whiteCount >= 3
  }

  const determineQuality = (width: number, height: number): 'high' | 'medium' | 'low' => {
    const pixels = width * height
    if (pixels >= 2000000) return 'high'    // >= 2MP
    if (pixels >= 500000) return 'medium'   // >= 0.5MP
    return 'low'
  }

  return {
    // State
    productInfo,
    uploadedImages,
    imageAnalyses,
    isAnalyzing,

    // Getters
    hasProduct,
    hasImages,
    imageCount,
    canAddMoreImages,
    primaryImage,
    imageDataUrls,
    productSummary,

    // Actions
    setProductInfo,
    setProductName,
    setProductCategory,
    setProductDescription,
    addFeature,
    removeFeature,
    setFeatures,
    addImage,
    addImages,
    removeImage,
    clearImages,
    reorderImages,
    getImageAnalysis,
    clearProduct
  }
})
