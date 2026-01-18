// API 相关类型
export interface ApiConfig {
  apiKey: string
  baseUrl: string
  model: string
}

export interface ApiConnectionStatus {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  lastChecked: Date | null
}

// 产品相关类型
export interface ProductInfo {
  name: string
  category: string
  description: string
  features: string[]
  targetAudience: string
  brand: string
  style: string
}

export interface UploadedImage {
  id: string
  file: File
  preview: string
  name: string
  size: number
  uploadedAt: Date
}

export interface ImageAnalysis {
  aspectRatio: number
  isWhiteBackground: boolean
  dominantColors: string[]
  quality: 'high' | 'medium' | 'low'
}

// 场景相关类型
export type SceneType =
  | 'studio-white'
  | 'lifestyle'
  | 'outdoor'
  | 'seasonal'
  | 'luxury'
  | 'minimalist'

export interface Scene {
  id: SceneType
  name: string
  description: string
  icon: string
  previewImage?: string
  defaultSettings: Partial<GenerationSettings>
  promptHints: string[]
  tags: string[]
}

export interface SceneCategory {
  id: string
  name: string
  scenes: Scene[]
}

// 模特相关类型
export type ModelDisplayType = 'none' | 'holding' | 'wearing' | 'using' | 'partial'
export type ModelPartialFocus = 'hands' | 'face' | 'upper_body' | 'full_body'

export interface ModelConfig {
  enabled: boolean
  displayType: ModelDisplayType

  // 基础属性
  gender: 'unspecified' | 'male' | 'female'
  ageGroup: 'young' | 'middle' | 'mature'
  skinTone: 'unspecified' | 'asian' | 'fair' | 'tan' | 'dark'

  // 外观属性
  hairStyle: 'unspecified' | 'short' | 'long' | 'medium' | 'curly' | 'ponytail'
  bodyType: 'unspecified' | 'slim' | 'average' | 'athletic' | 'curvy'
  makeup: 'unspecified' | 'natural' | 'light' | 'glamorous' | 'none'

  // 表现属性
  pose: 'standing' | 'sitting' | 'walking' | 'side' | 'closeup'
  expression: 'smile' | 'natural' | 'cool' | 'friendly' | 'focused'
  clothingStyle: 'auto' | 'casual' | 'business' | 'sporty' | 'fashion' | 'elegant'

  // 局部展示时的聚焦部位
  partialFocus?: ModelPartialFocus
}

export interface ModelRecommendation {
  displayType: ModelDisplayType
  config: Partial<ModelConfig>
  reason: string
}

// 多图融合相关类型
export type FusionMode = 'product_scene' | 'product_model' | 'full'
export type ReferenceImageRole = 'scene' | 'model' | 'style'

export interface ReferenceImage {
  id: string
  file: File
  preview: string  // base64 or blob URL
  role: ReferenceImageRole
  name: string
}

export interface FusionConfig {
  enabled: boolean
  mode: FusionMode
  sceneImage?: ReferenceImage
  modelImage?: ReferenceImage
  styleImage?: ReferenceImage
}

// 一致性系统相关类型
export type ConsistencyMode = 'style' | 'character' | 'color' | 'brand'

export interface ConsistencyConfig {
  enabled: boolean
  mode: ConsistencyMode
  referenceImages: ReferenceImage[]
  strength: number // 0-1, 影响一致性的强度
}

// 生成设置相关类型
export interface GenerationSettings {
  quantity: number
  aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16'
  quality: 'standard' | 'high' | 'ultra'
  style: 'realistic' | 'artistic' | 'commercial'
  lighting: 'natural' | 'studio' | 'dramatic' | 'soft'
  background: 'white' | 'gradient' | 'contextual' | 'transparent'
  enhanceDetails: boolean
  removeBackground: boolean
  addShadow: boolean
  colorCorrection: boolean
}

export interface AdvancedOptions {
  seed?: number
  negativePrompt: string
  guidance: number
  steps: number
}

// 营销套图相关类型
export interface MarketingSlot {
  id: string
  name: string
  description: string // 默认场景/环境描述
  focus: string // 用户填写的焦点描述 (e.g., "showing the texture")
  aspectRatio: GenerationSettings['aspectRatio']
  referenceImage?: ReferenceImage // 可选的特定参考图
  isGenerating?: boolean
  resultImage?: string
}

export interface MarketingTemplate {
  id: string
  name: string
  description: string
  icon: string
  slots: MarketingSlot[]
}

// 提示词相关类型
export interface PromptLayer {
  name: string
  content: string
  weight: number
  enabled: boolean
}

export interface PromptConfig {
  layers: PromptLayer[]
  finalPrompt: string
  negativePrompt: string
  metadata: {
    scene: SceneType
    product: string
    generatedAt: Date
  }
}

export interface SemanticMatch {
  keyword: string
  category: string
  suggestions: string[]
  confidence: number
}

// 生成结果相关类型
export interface GenerationResult {
  id: string
  imageUrl: string
  thumbnailUrl: string
  prompt: string
  settings: GenerationSettings
  scene: SceneType
  createdAt: Date
  metadata: {
    width: number
    height: number
    model: string
    seed?: number
  }
}

export interface GenerationProgress {
  status: 'idle' | 'preparing' | 'generating' | 'processing' | 'completed' | 'error'
  progress: number
  currentStep: string
  totalSteps: number
  estimatedTime?: number
  error?: string
}

export interface GenerationTask {
  id: string
  status: GenerationProgress['status']
  results: GenerationResult[]
  startedAt: Date
  completedAt?: Date
  prompt: PromptConfig
  settings: GenerationSettings
}

// 历史记录相关类型
export interface HistoryItem {
  id: string
  task: GenerationTask
  createdAt: Date
  productName: string
  sceneName: string
  imageCount: number
  thumbnails: string[]
}

export interface HistoryFilter {
  dateRange?: [Date, Date]
  scene?: SceneType
  searchQuery?: string
}

// 模板相关类型
export interface Template {
  id: string
  name: string
  description: string
  category: string
  scene: SceneType
  settings: Partial<GenerationSettings>
  promptTemplate: string
  previewImage: string
  tags: string[]
  usageCount: number
  createdAt: Date
}

// 统计相关类型
export interface UsageStats {
  totalGenerations: number
  totalImages: number
  successRate: number
  averageGenerationTime: number
  favoriteScene: SceneType | null
  sceneUsage: Record<SceneType, number>
  dailyUsage: Array<{
    date: string
    count: number
  }>
  lastGeneratedAt: Date | null
}

// 通知相关类型
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration: number
  dismissible: boolean
}

// 质量检测相关类型
export interface QualityCheckResult {
  passed: boolean
  checks: {
    aspectRatio: {
      passed: boolean
      value: number
      recommended: string
    }
    whiteBackground: {
      passed: boolean
      confidence: number
    }
    resolution: {
      passed: boolean
      width: number
      height: number
      minRequired: number
    }
    fileSize: {
      passed: boolean
      size: number
      maxAllowed: number
    }
  }
  suggestions: string[]
}

// 组件 Props 类型
export interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

export interface BaseInputProps {
  modelValue: string
  type?: 'text' | 'password' | 'email' | 'number'
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
}

export interface BaseModalProps {
  visible: boolean
  title?: string
  width?: string
  closable?: boolean
  maskClosable?: boolean
}

// 事件类型
export interface ImageUploadEvent {
  files: File[]
  previews: string[]
}

export interface SceneSelectEvent {
  scene: Scene
  previousScene?: Scene
}

export interface GenerationStartEvent {
  prompt: PromptConfig
  settings: GenerationSettings
  images: UploadedImage[]
}

export interface GenerationCompleteEvent {
  task: GenerationTask
  results: GenerationResult[]
  duration: number
}
