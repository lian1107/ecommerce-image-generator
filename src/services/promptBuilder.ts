import type {
  ProductInfo,
  SceneType,
  GenerationSettings,
  PromptConfig,
  PromptLayer,
  ProductIntrinsicDNA,
  ArtDirectionDNA,
  ProductSizeCategory
} from '@/types'
import { scenes } from '@/config/scenes'
import { semanticEngine } from './semanticEngine'
import { getCategoryById, getCategorySceneModifiers } from '@/config/categories'

// 分层提示词架构（新增 MODEL 层, DEEP_VISION 层, SCALE 层）
export enum PromptLayerType {
  CORE_SUBJECT = 'core_subject',           // 核心主体层
  MODEL = 'model',                          // 模特层
  FUSION = 'fusion',                        // 融合层
  CONSISTENCY = 'consistency',              // 一致性层
  SCENE_CONTEXT = 'scene_context',         // 场景上下文层
  DEEP_VISION = 'deep_vision',              // 深度视觉层 (光影/材质/摄影)
  SCALE = 'scale',                          // [NEW] 比例控制层 - 确保产品尺寸真实
  LIGHTING = 'lighting',                    // 光照层
  COMPOSITION = 'composition',              // 构图层
  STYLE = 'style',                          // 风格层
  QUALITY = 'quality',                      // 质量层
  SEMANTIC = 'semantic',                    // 语义增强层
  MARKETING = 'marketing',                  // 营销策略层
  AIDA = 'aida',                            // AIDA 阶段层
  DETAIL = 'detail',                        // 细节层
  COLOR_FIDELITY = 'color_fidelity',        // 色彩保真层
  NEGATIVE = 'negative'                     // 负面提示层
}

const layerWeights: Record<PromptLayerType, number> = {
  [PromptLayerType.CORE_SUBJECT]: 1.5,
  [PromptLayerType.MODEL]: 1.4,
  [PromptLayerType.FUSION]: 1.4,
  [PromptLayerType.CONSISTENCY]: 1.3,
  [PromptLayerType.SCENE_CONTEXT]: 1.2,
  [PromptLayerType.DEEP_VISION]: 1.35,     // High weight for visual control
  [PromptLayerType.SCALE]: 1.4,            // [NEW] High weight for realistic proportions
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
   * 构建核心主体层 - 指令式句子（Gemini 官方最佳实践）
   * [P0] 支持场景感知的产品描述
   */
  private buildCoreSubjectLayer(): string {
    // 确定产品名称（优先级：用户输入 > AI分析类别 > 通用描述）
    let productName = ''

    // 1. 优先使用用户输入的产品名称
    if (this.product?.name && this.product.name.trim().length > 0) {
      productName = this.product.name.trim()
    }
    // 2. 如果用户没输入，尝试使用 AI 分析的类别
    else if (this.product?.category && this.product.category.trim().length > 0) {
      // 将类别转换为更自然的描述
      const categoryMap: Record<string, string> = {
        'electronics': 'electronic device',
        'fashion': 'fashion item',
        'beauty': 'beauty product',
        'home': 'home product',
        'food': 'food product',
        'sports': 'sports equipment',
        'jewelry': 'jewelry piece',
        'baby': 'baby product',
        'office': 'office supply'
      }
      productName = categoryMap[this.product.category] || 'the product'
    }
    // 3. 兜底：使用通用描述
    else {
      productName = 'the product'
    }

    // 构建指令式句子
    let instruction = `professional product photograph of ${productName}`

    // 添加品牌信息
    if (this.product?.brand && this.product.brand.trim().length > 0) {
      instruction += ` by ${this.product.brand.trim()}`
    }

    // [P0] 使用场景感知的产品描述（优先级最高）
    // 这会根据不同场景强调产品的不同方面
    const sceneDescription = this.getSceneSpecificDescription()
    if (sceneDescription) {
      instruction += `, ${sceneDescription}`
    }
    // 否则使用通用描述（向后兼容）
    else if (this.product?.description && this.product.description.trim().length > 0) {
      const shortDesc = this.product.description.slice(0, 80).trim()
      if (shortDesc) {
        instruction += `, featuring ${shortDesc}`
      }
    }

    // 注意：不在这里加 "Create a"，combinePrompt() 会统一处理
    return instruction
  }

  /**
   * [P0] 获取场景特定的产品描述
   * 根据当前场景返回针对性的产品描述
   */
  private getSceneSpecificDescription(): string | null {
    if (!this.product?.sceneDescriptions) {
      return null
    }

    const sceneDesc = this.product.sceneDescriptions[this.scene]
    if (sceneDesc && sceneDesc.trim().length > 0) {
      // 清理描述，确保格式正确
      return sceneDesc.trim().replace(/^[Aa]\s+/, '') // 移除开头的 "A " 或 "a "
    }

    return null
  }

  /**
   * 构建深度视觉层 (Deep Vision Layer)
   * 将 Intrinsic DNA (事实) 和 Art Direction DNA (风格) 转化为精确的视觉指令
   * 使用自然语言句子（Gemini 最佳实践）
   */
  private buildDeepVisionLayer(): string {
    const sentences: string[] = []

    // 1. Product Intrinsic DNA (Consistency Lock)
    if (this.intrinsicDNA) {
      const materialParts: string[] = []

      if (this.intrinsicDNA.material_analysis?.surface_texture) {
        materialParts.push(`featuring ${this.intrinsicDNA.material_analysis.surface_texture} surface texture`)
      }
      if (this.intrinsicDNA.form_factor?.shape_keywords?.length) {
        materialParts.push(`with ${this.intrinsicDNA.form_factor.shape_keywords.join(' and ')} form factor`)
      }

      if (materialParts.length > 0) {
        sentences.push(`The product ${materialParts.join(', ')}.`)
      }
    }

    // 2. Art Direction DNA (Style Engine)
    if (this.artDirectionDNA) {
      const {
        lighting_scenario,
        photography_settings,
        color_grading,
        composition_guide,
        optical_mechanics
      } = this.artDirectionDNA

      // Lighting - 检查场景是否已包含光照描述，避免冲突
      if (lighting_scenario) {
        const sceneConfig = scenes[this.scene]
        const sceneHints = sceneConfig?.promptHints.join(' ').toLowerCase() || ''

        // 如果场景已有光照描述，完全跳过 Deep Vision 的光照输出
        // 因为 artDirectionDNA 的氛围可能与场景不匹配（如纯白棚拍不应显示 "warm & organic"）
        const sceneHasLighting = sceneHints.includes('lighting') ||
                                  sceneHints.includes('sunlight') ||
                                  sceneHints.includes('golden hour') ||
                                  sceneHints.includes('daylight') ||
                                  sceneHints.includes('rim lighting')

        // 只有场景没有光照描述时，才输出 Deep Vision 的光照设置
        if (!sceneHasLighting) {
          sentences.push(
            `Use ${lighting_scenario.style.toLowerCase()} lighting coming from ${lighting_scenario.direction.toLowerCase()} creating a ${lighting_scenario.atmosphere.toLowerCase()} atmosphere.`
          )
        }
        // 场景已有光照时，不再输出额外的氛围描述，避免"warm & organic"出现在纯白棚拍中
      }

      // Photography Settings
      if (photography_settings) {
        sentences.push(
          `Capture with ${photography_settings.shot_scale.toLowerCase()} shot using ${photography_settings.depth_of_field.toLowerCase()} depth of field.`
        )
      }

      // Color Grading
      if (color_grading && color_grading.tone) {
        sentences.push(`Apply ${color_grading.tone.toLowerCase()} color grading.`)
      }

      // Optical Mechanics - 组合成一句
      if (optical_mechanics) {
        const opticalParts: string[] = []
        if (optical_mechanics.lens_type) opticalParts.push(optical_mechanics.lens_type)
        if (optical_mechanics.aperture) opticalParts.push(`at ${optical_mechanics.aperture} aperture`)

        if (opticalParts.length > 0) {
          sentences.push(`Shoot with ${opticalParts.join(' ')} for natural bokeh effect.`)
        }
      }

      // Composition Guide
      if (composition_guide && composition_guide.keyword) {
        sentences.push(`Use ${composition_guide.keyword.toLowerCase()} composition style.`)
      }
    }

    return sentences.join(' ')
  }

  /**
   * 构建场景上下文层 - 返回完整短语
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
          parts.push('water droplets on surface showing water resistance', 'splashing water interaction', 'wet surface with natural reflections')
        }
      }

      // 示例融合逻辑: 户外产品 + 阳光场景
      if (features.some(f => f.includes('solar') || f.includes('outdoor'))) {
        if (sceneId.includes('sun') || sceneId.includes('outdoor')) {
          parts.push('strong natural sunlight highlighting outdoor capabilities', 'dynamic shadows for depth', 'subtle lens flare for atmosphere')
        }
      }
    }

    // 返回组合后的短语（combinePrompt 会处理成句子）
    return parts.join(', ')
  }

  /**
   * 构建光照层 - 使用专业摄影术语（Gemini 最佳实践）
   * 智能避免与场景光照描述冲突
   */
  private buildLightingLayer(): string {
    // 检查场景是否已包含光照描述
    const sceneConfig = scenes[this.scene]
    if (sceneConfig) {
      const sceneHints = sceneConfig.promptHints.join(' ').toLowerCase()
      // 如果场景已有详细光照描述，跳过通用光照
      if (sceneHints.includes('golden hour') ||
          sceneHints.includes('sunlight') ||
          sceneHints.includes('daylight') ||
          sceneHints.includes('holiday lighting') ||
          sceneHints.includes('studio lighting') ||       // 纯白棚拍
          sceneHints.includes('rim lighting') ||          // 高端奢华
          sceneHints.includes('diffused lighting')) {     // 极简风格
        return '' // 场景已包含光照，不重复添加
      }
    }

    // 否则使用通用光照设置
    const lightingMap: Record<string, string> = {
      'natural': 'natural daylight with soft ambient lighting creating gentle highlights',
      'studio': 'professional three-point studio lighting setup that creates soft diffused highlights and eliminates harsh shadows',
      'dramatic': 'dramatic rim lighting with high contrast and moody atmosphere emphasizing product contours',
      'soft': 'soft diffused lighting from large softbox creating gentle shadows and even illumination'
    }

    const lighting = this.settings?.lighting || 'studio'
    return lightingMap[lighting] || lightingMap['studio']
  }

  /**
   * [NEW] 构建比例控制层 - 确保产品在场景中的真实比例
   * 特别重要：lifestyle/outdoor 等场景需要产品与环境保持真实比例
   */
  private buildScaleLayer(): string {
    // 只在需要真实比例的场景中添加比例描述
    const scenesNeedingScale: SceneType[] = ['lifestyle', 'outdoor', 'seasonal']

    if (!scenesNeedingScale.includes(this.scene)) {
      // studio-white, luxury, minimalist 场景允许产品占据更大画面比例
      return ''
    }

    const parts: string[] = []

    // 1. 尺寸描述（来自 AI 分析）
    if (this.product?.sizeReference) {
      parts.push(`The product is ${this.product.sizeReference}`)
    }

    // 2. 根据尺寸类别添加比例指令
    const sizeCategory = this.product?.sizeCategory || 'handheld'
    const scaleInstructions = this.getScaleInstructions(sizeCategory)
    if (scaleInstructions) {
      parts.push(scaleInstructions)
    }

    // 3. 添加通用真实比例指令
    parts.push('maintaining realistic scale relative to surrounding environment and furniture')

    return parts.join(', ')
  }

  /**
   * 根据尺寸类别获取比例指令
   */
  private getScaleInstructions(sizeCategory: ProductSizeCategory): string {
    const instructions: Record<ProductSizeCategory, string> = {
      'pocket': 'appearing very small in the scene, easily fits in a pocket',
      'palm': 'appearing compact and palm-sized in the scene',
      'handheld': 'appearing as a small handheld item relative to furniture',
      'tabletop': 'appearing as a moderate-sized tabletop object',
      'desktop': 'appearing as a desktop-sized item',
      'furniture': 'appearing at furniture scale in the room',
      'large': 'appearing as a large prominent item in the space'
    }
    return instructions[sizeCategory] || instructions['handheld']
  }

  /**
   * 构建构图层 - 使用摄影术语描述构图
   * 智能避免与场景配置中的构图描述重复
   */
  private buildCompositionLayer(): string {
    const parts: string[] = []

    // 检查场景是否已包含构图描述
    const sceneConfig = scenes[this.scene]
    const sceneHints = sceneConfig?.promptHints.join(' ').toLowerCase() || ''
    const sceneHasComposition = sceneHints.includes('composition') ||
                                 sceneHints.includes('elevated angle') ||
                                 sceneHints.includes('centered')

    // 只有场景没有构图描述时，才添加通用构图
    if (!sceneHasComposition) {
      parts.push('centered composition at a slightly elevated angle to showcase product details')
    }

    // 画幅比例（这个不会重复，场景配置中没有）
    const aspectRatio = this.settings?.aspectRatio || '1:1'
    const ratioDescriptions: Record<string, string> = {
      '1:1': 'square format for social media',
      '4:3': 'landscape orientation for wide product display',
      '3:4': 'portrait orientation emphasizing product height',
      '16:9': 'wide cinematic format for hero images',
      '9:16': 'vertical mobile format for stories'
    }

    const ratioDesc = ratioDescriptions[aspectRatio] || 'square format'
    parts.push(ratioDesc)

    return parts.join(', ')
  }

  /**
   * 构建风格层 - 详细描述风格特征
   */
  private buildStyleLayer(): string {
    const styleMap: Record<string, string> = {
      'realistic': 'photorealistic rendering with true-to-life colors and authentic natural look',
      'artistic': 'artistic interpretation with creative styling and strong aesthetic appeal',
      'commercial': 'commercial photography style optimized for e-commerce with professional presentation'
    }

    const style = this.settings?.style || 'commercial'
    return styleMap[style] || styleMap['commercial']
  }

  /**
   * 构建质量层 - 保留技术参数（Hyper-Specific 原则）
   */
  private buildQualityLayer(): string {
    const qualityMap: Record<string, string> = {
      'standard': 'high quality with sharp details and good resolution',
      'high': 'ultra-high resolution (8K quality) with sharp focus on product details and textures',
      'ultra': 'exceptional 16K resolution with masterpiece quality, pristine clarity, and flawless execution of every detail'
    }

    const quality = this.settings?.quality || 'high'
    const baseQuality = qualityMap[quality] || qualityMap['high']

    const extras: string[] = [baseQuality]

    if (this.settings?.enhanceDetails) {
      extras.push('enhanced micro details capturing material textures')
    }
    if (this.settings?.addShadow) {
      extras.push('natural product shadows adding depth and dimension')
    }

    return extras.join(', ')
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
   * 构建细节层 - 使用自然语言句子
   * [P1] 集成类别特定增强
   */
  private buildDetailLayer(): string {
    if (!this.product) return ''

    const sentences: string[] = []

    // 产品特性 - 改为完整句子
    if (this.product.features && this.product.features.length > 0) {
      const features = this.product.features.slice(0, 3)
      if (features.length === 1) {
        sentences.push(`The product features ${features[0]}.`)
      } else if (features.length === 2) {
        sentences.push(`The product features ${features[0]} and ${features[1]}.`)
      } else {
        const lastFeature = features.pop()
        sentences.push(`The product features ${features.join(', ')}, and ${lastFeature}.`)
      }
    }

    // 产品风格
    if (this.product.style) {
      sentences.push(`Styled in ${this.product.style.toLowerCase()} aesthetic.`)
    }

    // 目标受众
    if (this.product.targetAudience) {
      sentences.push(`Designed to appeal to ${this.product.targetAudience.toLowerCase()}.`)
    }

    // [P1] 添加类别特定的场景修饰词
    const categoryModifiers = this.getCategorySceneEnhancements()
    if (categoryModifiers) {
      sentences.push(categoryModifiers)
    }

    return sentences.join(' ')
  }

  /**
   * [P1] 获取类别特定的场景增强
   * 根据产品类别和当前场景返回针对性的修饰词
   */
  private getCategorySceneEnhancements(): string | null {
    if (!this.product?.category) return null

    const category = getCategoryById(this.product.category)
    if (!category) return null

    // 获取当前场景的类别修饰词
    const modifiers = getCategorySceneModifiers(this.product.category, this.scene)
    if (modifiers.length === 0) {
      // 如果没有场景特定修饰词，使用通用类别增强（限制数量避免过长）
      const generalEnhancements = category.promptEnhancements.slice(0, 2)
      if (generalEnhancements.length > 0) {
        return `Emphasizing ${generalEnhancements.join(' and ')}.`
      }
      return null
    }

    // 使用场景特定的修饰词
    return `With ${modifiers.join(' and ')} emphasis.`
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
        name: PromptLayerType.SCALE,
        content: this.customLayers.get(PromptLayerType.SCALE) || this.buildScaleLayer(),
        weight: layerWeights[PromptLayerType.SCALE],
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
   * 智能组合提示词 - 自然语言段落版本
   * 遵循 Gemini 官方最佳实践：使用句子结构，保留技术细节
   */
  private combinePrompt(layers: PromptLayer[]): string {
    const enabledLayers = layers.filter(l => l.enabled && l.name !== PromptLayerType.NEGATIVE)

    // 按语义分组（保留层级架构的优势）
    const groups: Record<string, string[]> = {
      instruction: [],   // CORE_SUBJECT - 指令层
      subject: [],       // MODEL, FUSION, CONSISTENCY - 主体层
      environment: [],   // SCENE_CONTEXT, LIGHTING, COMPOSITION - 环境层
      technical: [],     // DEEP_VISION, QUALITY, COLOR_FIDELITY - 技术层
      enhancement: []    // SEMANTIC, MARKETING, AIDA, DETAIL - 增强层
    }

    // 根据层类型分组
    for (const layer of enabledLayers) {
      const content = layer.content.trim()
      if (!content) continue

      switch (layer.name) {
        case PromptLayerType.CORE_SUBJECT:
          groups.instruction.push(content)
          break
        case PromptLayerType.MODEL:
        case PromptLayerType.FUSION:
        case PromptLayerType.CONSISTENCY:
          groups.subject.push(content)
          break
        case PromptLayerType.SCENE_CONTEXT:
        case PromptLayerType.LIGHTING:
        case PromptLayerType.COMPOSITION:
        case PromptLayerType.SCALE:  // [NEW] 比例控制放在环境组
          groups.environment.push(content)
          break
        case PromptLayerType.DEEP_VISION:
        case PromptLayerType.QUALITY:
        case PromptLayerType.COLOR_FIDELITY:
          groups.technical.push(content)
          break
        default:
          groups.enhancement.push(content)
      }
    }

    // 构建自然语言段落
    const sentences: string[] = []

    // 辅助函数：清理并组合多个内容
    const cleanAndJoin = (items: string[], separator: string = '. '): string => {
      return items
        .map(s => s.trim().replace(/\.+$/, '').replace(/\s+/g, ' '))
        .filter(s => s.length > 0)
        .join(separator)
    }

    // 1. 指令句 - 确保以 "Create a..." 开头（Gemini 官方最佳实践）
    if (groups.instruction.length > 0) {
      let instruction = groups.instruction[0].trim().replace(/\.+$/, '')
      if (!instruction.toLowerCase().startsWith('create')) {
        instruction = `Create a ${instruction}`
      }
      sentences.push(`${instruction}.`)
    }

    // 2. 主体描述句
    if (groups.subject.length > 0) {
      const combined = cleanAndJoin(groups.subject, '. ')
      if (combined) sentences.push(`${combined}.`)
    }

    // 3. 环境设置句 - 使用 "Use" 连接
    if (groups.environment.length > 0) {
      const envContent = cleanAndJoin(groups.environment, ', ')
      if (envContent) sentences.push(`Use ${envContent}.`)
    }

    // 4. 技术规格句（保留技术细节：8K、光照参数等）
    if (groups.technical.length > 0) {
      const combined = cleanAndJoin(groups.technical, '. ')
      if (combined) sentences.push(`${combined}.`)
    }

    // 5. 增强细节句
    if (groups.enhancement.length > 0) {
      const combined = cleanAndJoin(groups.enhancement, ', ')
      if (combined) sentences.push(`${combined}.`)
    }

    // 6. 自定义提示词
    if (this.additionalPrompts.length > 0) {
      const combined = cleanAndJoin(this.additionalPrompts, '. ')
      if (combined) sentences.push(`${combined}.`)
    }

    // 组合成最终 prompt - 用空格分隔句子，清理多余空格和句号
    return sentences.join(' ').replace(/\s+/g, ' ').replace(/\.{2,}/g, '.').trim()
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
