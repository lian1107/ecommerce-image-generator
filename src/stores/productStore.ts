import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProductInfo, UploadedImage, ImageAnalysis } from '@/types'
import { APP_CONFIG } from '@/config'
import { sanitizeText, detectXSS } from '@/utils/sanitizer'
import { productInsightEngine } from '@/services/productInsightEngine'

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
  // 判断是否有足够的产品信息用于场景推荐
  // 条件：有产品名称 或 有图片且AI分析出了类别
  const hasProduct = computed(() =>
    productInfo.value.name.trim().length > 0 ||
    (uploadedImages.value.length > 0 && productInfo.value.category.trim().length > 0)
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
    // XSS 防护
    if (detectXSS(name)) {
      console.warn('[Security] Potential XSS detected in product name')
    }
    productInfo.value.name = sanitizeText(name)
  }

  const setProductCategory = (category: string) => {
    if (detectXSS(category)) {
      console.warn('[Security] Potential XSS detected in category')
    }
    productInfo.value.category = sanitizeText(category)
  }

  const setProductDescription = (description: string) => {
    if (detectXSS(description)) {
      console.warn('[Security] Potential XSS detected in description')
    }
    productInfo.value.description = sanitizeText(description)
  }

  const addFeature = (feature: string) => {
    const sanitized = sanitizeText(feature)
    if (sanitized && !productInfo.value.features.includes(sanitized)) {
      if (detectXSS(feature)) {
        console.warn('[Security] Potential XSS detected in feature')
      }
      productInfo.value.features.push(sanitized)
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

      // [Fix] If no images left, reset AI-derived data
      if (uploadedImages.value.length === 0) {
        productInfo.value.features = []
        productInfo.value.materialPrompts = []
        productInfo.value.colorPalette = []
        productInfo.value.sceneDescriptions = undefined // [P0] Reset scene descriptions
        productInfo.value.sizeCategory = undefined      // [NEW] Reset size category
        productInfo.value.sizeReference = undefined     // [NEW] Reset size reference
        productInfo.value.category = '' // Reset category as it's image-dependent
        // We keep name/description/brand as they might be user-entered
      }
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

      // 运行 Product Insight Engine (AI 智能分析)
      // 策略更新: 如果是第一张图片 (Primary)，或者之前的分析数据为空，则运行分析
      const shouldAnalyze = uploadedImages.value.length === 1 || !productInfo.value.materialPrompts || productInfo.value.materialPrompts.length === 0

      if (shouldAnalyze) {
        console.log('[ProductStore] Running Product Insight Engine on', image.name)

        // 准备上下文
        const context = {
          name: productInfo.value.name,
          description: productInfo.value.description
        }

        const insight = await productInsightEngine.analyze(image.preview, context)

        console.log('[ProductStore] Insight Result:', insight)

        // 自动填充信息 (AI-First)
        // 1. 类别 (总是更新，因为之前为空或手动选的可能不准)
        // 但如果用户之前已经有了分类，我们可以选择保留或覆盖。
        //这里为了演示 Category Killer，我们优先使用 AI 识别的
        productInfo.value.category = insight.mappedCategory

        // 2. 卖点 (合并)
        const newFeatures = insight.features.filter(f => !productInfo.value.features.includes(f))
        if (newFeatures.length > 0) {
          productInfo.value.features.push(...newFeatures)
        }

        // 3. 材质 Prompt - 只使用第一个（最好的）prompt，避免重复描述
        // AI 可能生成多个版本，但我们只需要最优的一个
        productInfo.value.materialPrompts = insight.generatedPrompts.slice(0, 1)

        // 4. [NEW] 颜色面板 (Fix Color Accuracy)
        productInfo.value.colorPalette = insight.colorPalette

        // 5. [NEW] 场景特定描述 (Scene-Aware Descriptions)
        // 为每个场景生成针对性的产品描述，避免"一刀切"的描述问题
        productInfo.value.sceneDescriptions = insight.sceneDescriptions

        // 6. [NEW] 产品尺寸信息 (Product Size for Scale Control)
        // 用于在 lifestyle 等场景中保持真实的产品比例
        productInfo.value.sizeCategory = insight.sizeCategory
        productInfo.value.sizeReference = insight.sizeReference
      }

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
