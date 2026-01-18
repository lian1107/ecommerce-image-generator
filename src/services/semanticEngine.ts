import type { SemanticMatch, SceneType, ProductInfo } from '@/types'
import { getCategoryByKeyword } from '@/config/categories'
import { scenes } from '@/config/scenes'

// 语义关键词映射表
const semanticMappings: Record<string, {
  category: string
  relatedTerms: string[]
  visualCues: string[]
  sceneHints: SceneType[]
}> = {
  // 材质相关
  '金属': {
    category: 'material',
    relatedTerms: ['metallic', 'steel', 'aluminum', 'chrome'],
    visualCues: ['reflective surface', 'metallic sheen', 'polished finish'],
    sceneHints: ['minimalist', 'studio-white']
  },
  '皮革': {
    category: 'material',
    relatedTerms: ['leather', 'genuine leather', 'faux leather'],
    visualCues: ['leather texture', 'premium material', 'natural grain'],
    sceneHints: ['luxury', 'lifestyle']
  },
  '木质': {
    category: 'material',
    relatedTerms: ['wooden', 'timber', 'oak', 'walnut'],
    visualCues: ['wood grain', 'natural wood', 'warm wood tones'],
    sceneHints: ['lifestyle', 'minimalist']
  },
  '玻璃': {
    category: 'material',
    relatedTerms: ['glass', 'crystal', 'transparent'],
    visualCues: ['transparent material', 'glass reflection', 'crystal clear'],
    sceneHints: ['minimalist', 'luxury']
  },
  '陶瓷': {
    category: 'material',
    relatedTerms: ['ceramic', 'porcelain', 'pottery'],
    visualCues: ['ceramic finish', 'smooth glaze', 'handcrafted feel'],
    sceneHints: ['lifestyle', 'studio-white']
  },
  '布料': {
    category: 'material',
    relatedTerms: ['fabric', 'textile', 'cloth', 'cotton'],
    visualCues: ['soft fabric texture', 'textile detail', 'natural draping'],
    sceneHints: ['lifestyle', 'studio-white']
  },

  // 风格相关
  '现代': {
    category: 'style',
    relatedTerms: ['modern', 'contemporary', 'sleek'],
    visualCues: ['modern design', 'clean lines', 'contemporary aesthetic'],
    sceneHints: ['minimalist', 'studio-white']
  },
  '复古': {
    category: 'style',
    relatedTerms: ['vintage', 'retro', 'classic', 'antique'],
    visualCues: ['vintage style', 'retro aesthetic', 'classic elegance'],
    sceneHints: ['lifestyle', 'luxury']
  },
  '简约': {
    category: 'style',
    relatedTerms: ['minimal', 'simple', 'clean'],
    visualCues: ['minimalist design', 'simple elegance', 'uncluttered'],
    sceneHints: ['minimalist', 'studio-white']
  },
  '奢华': {
    category: 'style',
    relatedTerms: ['luxury', 'premium', 'high-end', 'exclusive'],
    visualCues: ['luxury aesthetic', 'premium quality', 'opulent feel'],
    sceneHints: ['luxury']
  },

  // 颜色相关
  '黑色': {
    category: 'color',
    relatedTerms: ['black', 'dark', 'ebony'],
    visualCues: ['deep black', 'dark tone', 'noir aesthetic'],
    sceneHints: ['luxury', 'minimalist']
  },
  '白色': {
    category: 'color',
    relatedTerms: ['white', 'pure', 'ivory'],
    visualCues: ['pure white', 'clean white', 'bright and clean'],
    sceneHints: ['studio-white', 'minimalist']
  },
  '金色': {
    category: 'color',
    relatedTerms: ['gold', 'golden', 'champagne'],
    visualCues: ['golden tone', 'luxurious gold', 'warm gold shimmer'],
    sceneHints: ['luxury', 'seasonal']
  },

  // 用途相关
  '户外': {
    category: 'usage',
    relatedTerms: ['outdoor', 'adventure', 'camping', 'hiking'],
    visualCues: ['outdoor setting', 'adventure lifestyle', 'nature backdrop'],
    sceneHints: ['outdoor']
  },
  '办公': {
    category: 'usage',
    relatedTerms: ['office', 'work', 'professional', 'business'],
    visualCues: ['office environment', 'professional setting', 'workspace'],
    sceneHints: ['minimalist', 'lifestyle']
  },
  '家居': {
    category: 'usage',
    relatedTerms: ['home', 'living', 'interior', 'domestic'],
    visualCues: ['home setting', 'living space', 'cozy interior'],
    sceneHints: ['lifestyle']
  },
  '运动': {
    category: 'usage',
    relatedTerms: ['sports', 'athletic', 'fitness', 'active'],
    visualCues: ['athletic style', 'dynamic energy', 'active lifestyle'],
    sceneHints: ['outdoor', 'lifestyle']
  }
}

export class SemanticEngine {
  private mappings: typeof semanticMappings

  constructor() {
    this.mappings = semanticMappings
  }

  /**
   * 分析产品描述，提取语义关键词
   */
  analyzeProduct(productInfo: ProductInfo): SemanticMatch[] {
    const matches: SemanticMatch[] = []
    const searchText = `${productInfo.name} ${productInfo.description} ${productInfo.features.join(' ')}`.toLowerCase()

    // 搜索所有语义映射
    for (const [keyword, mapping] of Object.entries(this.mappings)) {
      const keywordLower = keyword.toLowerCase()
      if (searchText.includes(keywordLower)) {
        matches.push({
          keyword,
          category: mapping.category,
          suggestions: mapping.visualCues,
          confidence: this.calculateConfidence(searchText, keywordLower)
        })
      }
    }

    // 按置信度排序
    return matches.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * 计算关键词匹配置信度
   */
  private calculateConfidence(text: string, keyword: string): number {
    const occurrences = (text.match(new RegExp(keyword, 'gi')) || []).length
    const textLength = text.split(/\s+/).length
    return Math.min(1, (occurrences * 10) / textLength + 0.3)
  }

  /**
   * 根据产品信息推荐最佳场景
   */
  recommendScene(productInfo: ProductInfo): SceneType {
    const matches = this.analyzeProduct(productInfo)

    // 统计场景推荐次数
    const sceneScores: Record<SceneType, number> = {
      'studio-white': 0,
      'lifestyle': 0,
      'outdoor': 0,
      'seasonal': 0,
      'luxury': 0,
      'minimalist': 0
    }

    for (const match of matches) {
      const mapping = this.mappings[match.keyword]
      if (mapping) {
        for (const scene of mapping.sceneHints) {
          sceneScores[scene] += match.confidence
        }
      }
    }

    // 根据产品类别调整权重
    const category = getCategoryByKeyword(productInfo.category)
    if (category) {
      for (const suggestedScene of category.suggestedScenes) {
        if (suggestedScene in sceneScores) {
          sceneScores[suggestedScene as SceneType] += 0.5
        }
      }
    }

    // 找出得分最高的场景
    let bestScene: SceneType = 'studio-white'
    let maxScore = 0

    for (const [scene, score] of Object.entries(sceneScores)) {
      if (score > maxScore) {
        maxScore = score
        bestScene = scene as SceneType
      }
    }

    return bestScene
  }

  /**
   * 生成语义增强的提示词片段
   */
  generateSemanticEnhancements(productInfo: ProductInfo): string[] {
    const matches = this.analyzeProduct(productInfo)
    const enhancements: string[] = []

    // 收集所有视觉提示
    for (const match of matches.slice(0, 5)) {
      enhancements.push(...match.suggestions)
    }

    // 根据产品类别添加增强
    const category = getCategoryByKeyword(productInfo.category)
    if (category) {
      enhancements.push(...category.promptEnhancements.slice(0, 3))
    }

    // 去重并返回
    return [...new Set(enhancements)]
  }

  /**
   * 获取场景相关的提示词
   */
  getScenePromptHints(sceneType: SceneType): string[] {
    const scene = scenes[sceneType]
    return scene ? scene.promptHints : []
  }

  /**
   * 智能匹配产品特征和场景特征
   */
  matchProductToScene(productInfo: ProductInfo, sceneType: SceneType): {
    matchScore: number
    suggestions: string[]
    warnings: string[]
  } {
    const scene = scenes[sceneType]
    const productMatches = this.analyzeProduct(productInfo)

    let matchScore = 0.5 // 基础分
    const suggestions: string[] = []
    const warnings: string[] = []

    // 检查场景适配性
    for (const match of productMatches) {
      const mapping = this.mappings[match.keyword]
      if (mapping?.sceneHints.includes(sceneType)) {
        matchScore += 0.1
        suggestions.push(`产品的${match.keyword}特性与${scene.name}场景很搭配`)
      }
    }

    // 检查产品类别适配性
    const category = getCategoryByKeyword(productInfo.category)
    if (category) {
      if (category.suggestedScenes.includes(sceneType)) {
        matchScore += 0.2
      } else {
        warnings.push(`${category.name}类产品通常更适合${category.suggestedScenes.map(s => scenes[s as SceneType]?.name).join('、')}场景`)
      }
    }

    return {
      matchScore: Math.min(1, matchScore),
      suggestions,
      warnings
    }
  }

  /**
   * 获取相关的语义词汇
   */
  getRelatedTerms(keyword: string): string[] {
    const mapping = this.mappings[keyword]
    return mapping ? mapping.relatedTerms : []
  }

  /**
   * 批量分析多个关键词
   */
  analyzeKeywords(keywords: string[]): Map<string, SemanticMatch> {
    const results = new Map<string, SemanticMatch>()

    for (const keyword of keywords) {
      const mapping = this.mappings[keyword]
      if (mapping) {
        results.set(keyword, {
          keyword,
          category: mapping.category,
          suggestions: mapping.visualCues,
          confidence: 1.0
        })
      }
    }

    return results
  }
}

// Export singleton instance
export const semanticEngine = new SemanticEngine()
