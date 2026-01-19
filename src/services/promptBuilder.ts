import type {
  ProductInfo,
  SceneType,
  GenerationSettings,
  PromptConfig,
  PromptLayer
} from '@/types'
import { scenes } from '@/config/scenes'
import { semanticEngine } from './semanticEngine'

// 10层分层提示词架构（新增 MODEL 层）
export enum PromptLayerType {
  CORE_SUBJECT = 'core_subject',           // 核心主体层
  MODEL = 'model',                          // 模特层
  FUSION = 'fusion',                        // 融合层（新增）
  CONSISTENCY = 'consistency',              // 一致性层（新增）
  SCENE_CONTEXT = 'scene_context',         // 场景上下文层
  LIGHTING = 'lighting',                    // 光照层
  COMPOSITION = 'composition',              // 构图层
  STYLE = 'style',                          // 风格层
  QUALITY = 'quality',                      // 质量层
  SEMANTIC = 'semantic',                    // 语义增强层
  MARKETING = 'marketing',                  // 营销策略层 (新增)
  AIDA = 'aida',                            // AIDA 阶段层 (新增)
  DETAIL = 'detail',                        // 细节层
  NEGATIVE = 'negative'                     // 负面提示层
}

const layerWeights: Record<PromptLayerType, number> = {
  [PromptLayerType.CORE_SUBJECT]: 1.5,
  [PromptLayerType.MODEL]: 1.4,
  [PromptLayerType.FUSION]: 1.4,           // 融合层权重较高
  [PromptLayerType.CONSISTENCY]: 1.3,      // 一致性层权重较高
  [PromptLayerType.SCENE_CONTEXT]: 1.2,
  [PromptLayerType.LIGHTING]: 1.0,
  [PromptLayerType.COMPOSITION]: 1.0,
  [PromptLayerType.STYLE]: 1.1,
  [PromptLayerType.QUALITY]: 1.3,
  [PromptLayerType.SEMANTIC]: 0.9,
  [PromptLayerType.MARKETING]: 1.25,       // 营销层权重
  [PromptLayerType.AIDA]: 1.15,            // AIDA层权重
  [PromptLayerType.DETAIL]: 0.8,
  [PromptLayerType.NEGATIVE]: 1.0
}

const defaultNegativePrompts = [
  'blurry', 'low quality', 'distorted', 'watermark', 'text overlay',
  'cropped', 'out of frame', 'duplicate', 'ugly', 'deformed',
  'bad anatomy', 'extra limbs', 'poorly drawn',
  'unrealistic proportions', 'oversized product', 'wrong scale',
  'disproportionate', 'giant product', 'tiny hands'
]

export class PromptBuilder {
  private product: ProductInfo | null = null
  private scene: SceneType = 'studio-white'
  private settings: GenerationSettings | null = null

  private modelPrompt: string = ''  // 模特提示词
  private fusionPrompt: string = '' // 融合提示词
  private consistencyPrompt: string = '' // 一致性提示词
  private marketingPrompt: string = '' // 营销策略提示词
  private aidaPrompt: string = '' // AIDA提示词
  private customLayers: Map<PromptLayerType, string> = new Map()
  private additionalPrompts: string[] = []

  /**
   * 设置产品信息
   */
  setProduct(product: ProductInfo): this {
    this.product = product
    return this
  }

  /**
   * 设置场景类型
   */
  setScene(scene: SceneType): this {
    this.scene = scene
    return this
  }

  /**
   * 设置生成设置
   */
  setSettings(settings: GenerationSettings): this {
    this.settings = settings
    return this
  }

  /**
   * 添加自定义层内容
   */
  setLayerContent(layer: PromptLayerType, content: string): this {
    this.customLayers.set(layer, content)
    return this
  }

  /**
   * 添加额外提示词
   */
  addPrompt(prompt: string): this {
    this.additionalPrompts.push(prompt)
    return this
  }

  /**
   * 设置模特提示词（从 modelStore 获取）
   */
  setModelPrompt(prompt: string): this {
    this.modelPrompt = prompt
    return this
  }

  setFusionPrompt(prompt: string): this {
    this.fusionPrompt = prompt
    return this
  }

  setConsistencyPrompt(prompt: string): this {
    this.consistencyPrompt = prompt
    return this
  }

  setMarketingPrompt(prompt: string): this {
    this.marketingPrompt = prompt
    return this
  }

  setAidaPrompt(prompt: string): this {
    this.aidaPrompt = prompt
    return this
  }

  /**
   * 重置构建器
   */
  reset(): this {
    this.product = null
    this.scene = 'studio-white'
    this.settings = null
    this.modelPrompt = ''
    this.fusionPrompt = ''
    this.consistencyPrompt = ''
    this.marketingPrompt = ''
    this.aidaPrompt = ''
    this.customLayers.clear()
    this.additionalPrompts = []
    return this
  }

  /**
   * 构建核心主体层
   */
  private buildCoreSubjectLayer(): string {
    if (!this.product) return 'professional product photography'

    const parts: string[] = []

    // 产品名称
    parts.push(`professional product photography of ${this.product.name}`)

    // 品牌
    if (this.product.brand) {
      parts.push(`by ${this.product.brand}`)
    }

    // 核心描述
    if (this.product.description) {
      const shortDesc = this.product.description.slice(0, 100)
      parts.push(shortDesc)
    }

    return parts.join(', ')
  }

  /**
   * 构建场景上下文层
   */
  private buildSceneContextLayer(): string {
    const sceneConfig = scenes[this.scene]
    if (!sceneConfig) return ''

    const hints = sceneConfig.promptHints.slice(0, 4)
    return hints.join(', ')
  }

  /**
   * 构建光照层
   */
  private buildLightingLayer(): string {
    const lightingMap: Record<string, string> = {
      'natural': 'natural daylight, soft ambient lighting',
      'studio': 'professional studio lighting, three-point lighting setup',
      'dramatic': 'dramatic rim lighting, high contrast, moody atmosphere',
      'soft': 'soft diffused lighting, gentle shadows, even illumination'
    }

    const lighting = this.settings?.lighting || 'studio'
    return lightingMap[lighting] || lightingMap['studio']
  }

  /**
   * 构建构图层
   */
  private buildCompositionLayer(): string {
    const parts: string[] = ['centered composition', 'product focus']

    const aspectRatio = this.settings?.aspectRatio || '1:1'
    const ratioDescriptions: Record<string, string> = {
      '1:1': 'square format',
      '4:3': 'landscape orientation',
      '3:4': 'portrait orientation',
      '16:9': 'wide cinematic format',
      '9:16': 'vertical mobile format'
    }

    parts.push(ratioDescriptions[aspectRatio] || 'square format')

    return parts.join(', ')
  }

  /**
   * 构建风格层
   */
  private buildStyleLayer(): string {
    const styleMap: Record<string, string> = {
      'realistic': 'photorealistic, true to life, authentic look',
      'artistic': 'artistic interpretation, creative styling, aesthetic appeal',
      'commercial': 'commercial photography style, e-commerce ready, professional'
    }

    const style = this.settings?.style || 'commercial'
    return styleMap[style] || styleMap['commercial']
  }

  /**
   * 构建质量层
   */
  private buildQualityLayer(): string {
    const qualityMap: Record<string, string> = {
      'standard': 'high quality, sharp details, good resolution',
      'high': '8K quality, ultra sharp, professional grade, pristine details',
      'ultra': '16K resolution, masterpiece quality, exceptional clarity, flawless execution'
    }

    const quality = this.settings?.quality || 'high'
    const baseQuality = qualityMap[quality] || qualityMap['high']

    const extras: string[] = []
    if (this.settings?.enhanceDetails) {
      extras.push('enhanced micro details')
    }
    if (this.settings?.addShadow) {
      extras.push('natural product shadows')
    }

    return [baseQuality, ...extras].join(', ')
  }

  /**
   * 构建语义增强层
   */
  private buildSemanticLayer(): string {
    if (!this.product) return ''

    const enhancements = semanticEngine.generateSemanticEnhancements(this.product)
    return enhancements.slice(0, 5).join(', ')
  }

  /**
   * 构建细节层
   */
  private buildDetailLayer(): string {
    if (!this.product) return ''

    const parts: string[] = []

    // 产品特性
    if (this.product.features.length > 0) {
      parts.push(...this.product.features.slice(0, 3))
    }

    // 产品风格
    if (this.product.style) {
      parts.push(`${this.product.style} style`)
    }

    // 目标受众风格
    if (this.product.targetAudience) {
      parts.push(`appealing to ${this.product.targetAudience}`)
    }

    return parts.join(', ')
  }

  /**
   * 构建负面提示层
   */
  private buildNegativeLayer(): string {
    return defaultNegativePrompts.join(', ')
  }

  /**
   * 构建所有层
   */
  private buildAllLayers(): PromptLayer[] {
    const layers: PromptLayer[] = [
      {
        name: PromptLayerType.CORE_SUBJECT,
        content: this.customLayers.get(PromptLayerType.CORE_SUBJECT) || this.buildCoreSubjectLayer(),
        weight: layerWeights[PromptLayerType.CORE_SUBJECT],
        enabled: true
      },
      {
        name: PromptLayerType.MODEL,
        content: this.customLayers.get(PromptLayerType.MODEL) || this.modelPrompt,
        weight: layerWeights[PromptLayerType.MODEL],
        enabled: this.modelPrompt.length > 0
      },
      {
        name: PromptLayerType.FUSION,
        content: this.fusionPrompt,
        weight: layerWeights[PromptLayerType.FUSION],
        enabled: this.fusionPrompt.length > 0
      },
      {
        name: PromptLayerType.CONSISTENCY,
        content: this.consistencyPrompt,
        weight: layerWeights[PromptLayerType.CONSISTENCY],
        enabled: this.consistencyPrompt.length > 0
      },
      {
        name: PromptLayerType.SCENE_CONTEXT,
        content: this.customLayers.get(PromptLayerType.SCENE_CONTEXT) || this.buildSceneContextLayer(),
        weight: layerWeights[PromptLayerType.SCENE_CONTEXT],
        enabled: true
      },
      {
        name: PromptLayerType.LIGHTING,
        content: this.customLayers.get(PromptLayerType.LIGHTING) || this.buildLightingLayer(),
        weight: layerWeights[PromptLayerType.LIGHTING],
        enabled: true
      },
      {
        name: PromptLayerType.COMPOSITION,
        content: this.customLayers.get(PromptLayerType.COMPOSITION) || this.buildCompositionLayer(),
        weight: layerWeights[PromptLayerType.COMPOSITION],
        enabled: true
      },
      {
        name: PromptLayerType.STYLE,
        content: this.customLayers.get(PromptLayerType.STYLE) || this.buildStyleLayer(),
        weight: layerWeights[PromptLayerType.STYLE],
        enabled: true
      },
      {
        name: PromptLayerType.QUALITY,
        content: this.customLayers.get(PromptLayerType.QUALITY) || this.buildQualityLayer(),
        weight: layerWeights[PromptLayerType.QUALITY],
        enabled: true
      },
      {
        name: PromptLayerType.SEMANTIC,
        content: this.customLayers.get(PromptLayerType.SEMANTIC) || this.buildSemanticLayer(),
        weight: layerWeights[PromptLayerType.SEMANTIC],
        enabled: true
      },
      {
        name: PromptLayerType.MARKETING,
        content: this.customLayers.get(PromptLayerType.MARKETING) || this.marketingPrompt,
        weight: layerWeights[PromptLayerType.MARKETING],
        enabled: this.marketingPrompt.length > 0
      },
      {
        name: PromptLayerType.AIDA,
        content: this.customLayers.get(PromptLayerType.AIDA) || this.aidaPrompt,
        weight: layerWeights[PromptLayerType.AIDA],
        enabled: this.aidaPrompt.length > 0
      },
      {
        name: PromptLayerType.DETAIL,
        content: this.customLayers.get(PromptLayerType.DETAIL) || this.buildDetailLayer(),
        weight: layerWeights[PromptLayerType.DETAIL],
        enabled: true
      },
      {
        name: PromptLayerType.NEGATIVE,
        content: this.customLayers.get(PromptLayerType.NEGATIVE) || this.buildNegativeLayer(),
        weight: layerWeights[PromptLayerType.NEGATIVE],
        enabled: true
      }
    ]

    return layers.filter(layer => layer.content.trim().length > 0)
  }

  /**
   * 组合最终提示词
   */
  private combinePrompt(layers: PromptLayer[]): string {
    const enabledLayers = layers.filter(l => l.enabled && l.name !== PromptLayerType.NEGATIVE)

    // 按权重排序
    enabledLayers.sort((a, b) => b.weight - a.weight)

    // 组合提示词
    const parts = enabledLayers.map(l => l.content)

    // 添加额外提示词
    if (this.additionalPrompts.length > 0) {
      parts.push(...this.additionalPrompts)
    }

    return parts.join(', ')
  }

  /**
   * 构建完整的提示词配置
   */
  build(): PromptConfig {
    const layers = this.buildAllLayers()
    const finalPrompt = this.combinePrompt(layers)

    const negativeLayer = layers.find(l => l.name === PromptLayerType.NEGATIVE)
    const negativePrompt = negativeLayer?.content || ''

    return {
      layers,
      finalPrompt,
      negativePrompt,
      metadata: {
        scene: this.scene,
        product: this.product?.name || '',
        generatedAt: new Date()
      }
    }
  }

  /**
   * 快速构建提示词（不返回完整配置）
   */
  buildPrompt(): string {
    const config = this.build()
    return config.finalPrompt
  }

  /**
   * 预览提示词（格式化输出）
   */
  preview(): string {
    const layers = this.buildAllLayers()
    const lines: string[] = ['=== 提示词预览 ===', '']

    for (const layer of layers) {
      if (layer.enabled && layer.content) {
        lines.push(`[${layer.name}] (权重: ${layer.weight})`)
        lines.push(layer.content)
        lines.push('')
      }
    }

    lines.push('=== 最终提示词 ===')
    lines.push(this.combinePrompt(layers))

    return lines.join('\n')
  }
}

// Factory function for creating new builder instances
export const createPromptBuilder = (): PromptBuilder => {
  return new PromptBuilder()
}

// Export singleton for simple use cases
export const promptBuilder = new PromptBuilder()
