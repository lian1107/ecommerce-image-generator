import type {
  ProductInfo,
  SceneType,
  GenerationSettings,
  PromptConfig,
  PromptLayer,
  ProductIntrinsicDNA,
  ArtDirectionDNA
} from '@/types'
import { scenes } from '@/config/scenes'
import { semanticEngine } from './semanticEngine'

// 10层分层提示词架构（新增 MODEL 层, DEEP_VISION 层）
export enum PromptLayerType {
  CORE_SUBJECT = 'core_subject',           // 核心主体层
  MODEL = 'model',                          // 模特层
  FUSION = 'fusion',                        // 融合层
  CONSISTENCY = 'consistency',              // 一致性层
  SCENE_CONTEXT = 'scene_context',         // 场景上下文层
  DEEP_VISION = 'deep_vision',              // [NEW] 深度视觉层 (光影/材质/摄影)
  LIGHTING = 'lighting',                    // 光照层
  COMPOSITION = 'composition',              // 构图层
  STYLE = 'style',                          // 风格层
  QUALITY = 'quality',                      // 质量层
  SEMANTIC = 'semantic',                    // 语义增强层
  MARKETING = 'marketing',                  // 营销策略层
  AIDA = 'aida',                            // AIDA 阶段层
  DETAIL = 'detail',                        // 细节层
  COLOR_FIDELITY = 'color_fidelity',        // [NEW] 色彩保真层
  NEGATIVE = 'negative'                     // 负面提示层
}

const layerWeights: Record<PromptLayerType, number> = {
  [PromptLayerType.CORE_SUBJECT]: 1.5,
  [PromptLayerType.MODEL]: 1.4,
  [PromptLayerType.FUSION]: 1.4,
  [PromptLayerType.CONSISTENCY]: 1.3,
  [PromptLayerType.SCENE_CONTEXT]: 1.2,
  [PromptLayerType.DEEP_VISION]: 1.35,     // High weight for visual control
  [PromptLayerType.LIGHTING]: 1.0,
  [PromptLayerType.COMPOSITION]: 1.0,
  [PromptLayerType.STYLE]: 1.1,
  [PromptLayerType.QUALITY]: 1.3,
  [PromptLayerType.SEMANTIC]: 0.9,
  [PromptLayerType.MARKETING]: 1.25,
  [PromptLayerType.AIDA]: 1.15,
  [PromptLayerType.DETAIL]: 0.8,
  [PromptLayerType.COLOR_FIDELITY]: 1.45,  // Very high weight to ensure color accuracy
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

  // Deep Vision DNA State
  private intrinsicDNA: ProductIntrinsicDNA | null = null
  private artDirectionDNA: ArtDirectionDNA | null = null

  private modelPrompt: string = ''
  private fusionPrompt: string = ''
  private consistencyPrompt: string = ''
  private marketingPrompt: string = ''
  private aidaPrompt: string = ''
  private customLayers: Map<PromptLayerType, string> = new Map()
  private additionalPrompts: string[] = []

  /**
   * Set Deep Vision DNA
   */
  setDeepVision(intrinsic: ProductIntrinsicDNA | null, artDirection: ArtDirectionDNA | null): this {
    this.intrinsicDNA = intrinsic
    this.artDirectionDNA = artDirection
    return this
  }

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
    this.intrinsicDNA = null
    this.artDirectionDNA = null
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
   * 构建深度视觉层 (Deep Vision Layer)
   * 将 Intrinsic DNA (事实) 和 Art Direction DNA (风格) 转化为精确的视觉指令
   */
  private buildDeepVisionLayer(): string {
    const parts: string[] = []

    // 1. Product Intrinsic DNA (Consistency Lock)
    if (this.intrinsicDNA) {
      if (this.intrinsicDNA.material_analysis?.surface_texture) {
        parts.push(`Material Surface: ${this.intrinsicDNA.material_analysis.surface_texture}`)
      }
      if (this.intrinsicDNA.form_factor?.shape_keywords?.length) {
        parts.push(`Form Factor: ${this.intrinsicDNA.form_factor.shape_keywords.join(', ')}`)
      }
      // Note: Brand colors are handled via palette extraction usually, but can be mentioned here
      if (this.intrinsicDNA.brand_color_palette?.length) {
        parts.push(`Brand Colors: ${this.intrinsicDNA.brand_color_palette.join(', ')}`)
      }
    }

    // 2. Art Direction DNA (Style Engine)
    if (this.artDirectionDNA) {
      const {
        lighting_scenario,
        photography_settings,
        color_grading,
        composition_guide,
        optical_mechanics // [NEW] Physical Camera
      } = this.artDirectionDNA

      // Lighting
      if (lighting_scenario) {
        parts.push(`Lighting Style: ${lighting_scenario.style}`)
        parts.push(`Lighting Direction: ${lighting_scenario.direction}`)
        parts.push(`Atmosphere: ${lighting_scenario.atmosphere}`)
      }

      // Photography
      if (photography_settings) {
        parts.push(`Shot Type: ${photography_settings.shot_scale}`)
        parts.push(`Depth of Field: ${photography_settings.depth_of_field}`)
      }

      // Grading
      if (color_grading) {
        parts.push(`Color Grading: ${color_grading.tone}`)
      }

      // Composition
      if (composition_guide) {
        parts.push(`Composition: ${composition_guide.keyword}`)
      }

      // [NEW] Optical Mechanics (Physical Camera)
      if (optical_mechanics) {
        if (optical_mechanics.lens_type) parts.push(`Lens: ${optical_mechanics.lens_type}`)
        if (optical_mechanics.aperture) parts.push(`Aperture: ${optical_mechanics.aperture}`)
        if (optical_mechanics.shutter_speed) parts.push(`Shutter: ${optical_mechanics.shutter_speed}`)
      }
    }

    return parts.join(', ')
  }

  /**
   * 构建场景上下文层
   */
  private buildSceneContextLayer(): string {
    const sceneConfig = scenes[this.scene]
    if (!sceneConfig) return ''

    const parts = [...sceneConfig.promptHints.slice(0, 4)]

    // [NEW] Context Fusion (上下文融合)
    // 根据产品特征和场景类型，注入交互 Prompt
    if (this.product && this.product.features) {
      const features = this.product.features.map(f => f.toLowerCase())
      const sceneId = this.scene.toLowerCase()

      // 示例融合逻辑: 防水产品 + 水场景
      if (features.some(f => f.includes('waterproof') || f.includes('water resistant'))) {
        if (sceneId.includes('pool') || sceneId.includes('beach') || sceneId.includes('rain')) {
          parts.push('water droplets on surface', 'splashing water interaction', 'wet surface reflection')
        }
      }

      // 示例融合逻辑: 户外产品 + 阳光场景
      if (features.some(f => f.includes('solar') || f.includes('outdoor'))) {
        if (sceneId.includes('sun') || sceneId.includes('outdoor')) {
          parts.push('strong natural sunlight', 'dynamic hard shadows', 'lens flare')
        }
      }
    }

    return parts.join(', ')
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

    const enhancements = semanticEngine.generateSemanticEnhancements(this.product, this.product.materialPrompts)
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
   * 构建色彩保真层 (Color Fidelity Layer)
   * [V2] 简化为行为指令，不再列出具体颜色名称
   * 原因：颜色信息现在通过参考图像直接传递给模型
   */
  private buildColorFidelityLayer(): string {
    const isCorrectionEnabled = this.settings?.colorCorrection ?? false

    if (isCorrectionEnabled) {
      // 行为指令：告诉模型从参考图像学习颜色，而不是列出颜色名称
      return 'CRITICAL: Match product colors exactly from reference image, preserve original hues, no color shifts or filters'
    }

    return ''
  }

  /**
   * 构建负面提示层
   */
  private buildNegativeLayer(): string {
    const negatives = [...defaultNegativePrompts]

    // [NEW] Deep Vision Negative Constraints (Brand Taboos)
    if (this.artDirectionDNA && this.artDirectionDNA.negative_constraints) {
      const constraints = this.artDirectionDNA.negative_constraints.forbidden_elements
      if (constraints && constraints.length > 0) {
        negatives.push(...constraints)
      }
    }

    return negatives.join(', ')
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
        name: PromptLayerType.DEEP_VISION,
        content: this.customLayers.get(PromptLayerType.DEEP_VISION) || this.buildDeepVisionLayer(),
        weight: layerWeights[PromptLayerType.DEEP_VISION],
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
        name: PromptLayerType.COLOR_FIDELITY,
        content: this.customLayers.get(PromptLayerType.COLOR_FIDELITY) || this.buildColorFidelityLayer(),
        weight: layerWeights[PromptLayerType.COLOR_FIDELITY],
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
   * 智能组合提示词 (去重与冲突解决)
   */
  private combinePrompt(layers: PromptLayer[]): string {
    const enabledLayers = layers.filter(l => l.enabled && l.name !== PromptLayerType.NEGATIVE)

    // 1. 按权重排序 (高权重优先保留)
    enabledLayers.sort((a, b) => b.weight - a.weight)

    const finalTags: string[] = []
    const seenTags = new Set<string>()

    // 2. 定义冲突逻辑 (Key 出现后，Value 将被屏蔽)
    const conflictMap: Record<string, string[]> = {
      '16k resolution': ['8k resolution', '4k resolution', 'high resolution', 'best quality'],
      '8k resolution': ['4k resolution', 'high resolution', 'best quality'],
      'masterpiece': ['high quality', 'best quality'],
      'studio lighting': ['natural sunlight', 'outdoor', 'natural light'],
      'natural sunlight': ['studio lighting', 'softbox', 'softbox lighting'],
      'outdoor photography': ['studio lighting', 'indoor'],
      'commercial photography': ['amateur', 'snapshot']
    }

    const processContent = (content: string) => {
      // Split by comma, respect parentheses? For simple prompts, comma split is mostly fine.
      const tags = content.split(',').map(t => t.trim()).filter(t => t.length > 0)

      for (const tag of tags) {
        const normalized = tag.toLowerCase()

        // Deduplication
        if (seenTags.has(normalized)) continue

        // Add to result
        finalTags.push(tag)
        seenTags.add(normalized)

        // Add conflicts to seenTags (prevent lower priority layers from adding them)
        if (conflictMap[normalized]) {
          conflictMap[normalized].forEach(blocked => seenTags.add(blocked))
        }

        // Smart fuzzy blocking
        if (normalized.includes('16k')) {
          seenTags.add('8k resolution'); seenTags.add('8k');
        }
        if (normalized.includes('studio lighting')) {
          seenTags.add('natural light');
        }
      }
    }

    // 3. Process Layers (High Priority First)
    for (const layer of enabledLayers) {
      processContent(layer.content)
    }

    // 4. Process Additional Prompts (Lowest Priority)
    if (this.additionalPrompts.length > 0) {
      this.additionalPrompts.forEach(p => processContent(p))
    }

    return finalTags.join(', ')
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
