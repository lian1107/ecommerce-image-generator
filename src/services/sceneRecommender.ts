import type { ProductInfo, SceneType } from '@/types'
import { getCategoryById, getCategorySceneRecommendations, type CategorySceneRecommendation } from '@/config/categories'
import { scenes } from '@/config/scenes'

/**
 * 场景推荐结果
 */
export interface SceneRecommendation {
  sceneId: SceneType
  score: number          // 0-100 推荐分数
  reason: string         // 推荐原因
  isTopPick: boolean     // 是否为首选
  categoryMatch: boolean // 是否与产品类别匹配
}

/**
 * [P2] 智能场景推荐服务
 * 根据产品特征、类别和用户偏好推荐最佳场景
 */
export class SceneRecommender {

  /**
   * 获取产品的场景推荐
   * @param product 产品信息
   * @param limit 返回的推荐数量（默认3）
   */
  getRecommendations(product: ProductInfo, limit: number = 3): SceneRecommendation[] {
    const recommendations: SceneRecommendation[] = []

    // 获取产品类别的推荐
    const categoryRecommendations = this.getCategoryBasedRecommendations(product)

    // 获取基于特性的推荐
    const featureRecommendations = this.getFeatureBasedRecommendations(product)

    // 合并并计算最终分数
    const allSceneIds = new Set<SceneType>([
      ...Object.keys(scenes) as SceneType[]
    ])

    for (const sceneId of allSceneIds) {
      const catRec = categoryRecommendations.find(r => r.sceneId === sceneId)
      const featRec = featureRecommendations.find(r => r.sceneId === sceneId)

      let score = 50 // 基础分数
      const reasons: string[] = []

      // 类别匹配加分
      if (catRec) {
        score += catRec.priority * 10 // priority 1-5 -> +10 to +50
        reasons.push(catRec.reason)
      }

      // 特性匹配加分
      if (featRec) {
        score += featRec.score
        if (featRec.reason) reasons.push(featRec.reason)
      }

      // 确保分数在 0-100 范围内
      score = Math.min(100, Math.max(0, score))

      recommendations.push({
        sceneId,
        score,
        reason: reasons.length > 0 ? reasons[0] : this.getDefaultReason(sceneId),
        isTopPick: false,
        categoryMatch: !!catRec
      })
    }

    // 按分数排序
    recommendations.sort((a, b) => b.score - a.score)

    // 标记首选
    if (recommendations.length > 0) {
      recommendations[0].isTopPick = true
    }

    return recommendations.slice(0, limit)
  }

  /**
   * 获取基于类别的推荐
   */
  private getCategoryBasedRecommendations(product: ProductInfo): CategorySceneRecommendation[] {
    if (!product.category) return []
    return getCategorySceneRecommendations(product.category)
  }

  /**
   * 获取基于产品特性的推荐
   */
  private getFeatureBasedRecommendations(product: ProductInfo): Array<{
    sceneId: SceneType
    score: number
    reason: string
  }> {
    const recommendations: Array<{
      sceneId: SceneType
      score: number
      reason: string
    }> = []

    const features = (product.features || []).map(f => f.toLowerCase())
    const description = (product.description || '').toLowerCase()
    const name = (product.name || '').toLowerCase()
    const combinedText = `${name} ${description} ${features.join(' ')}`

    // 高端/奢侈品检测
    if (this.containsKeywords(combinedText, ['luxury', 'premium', 'high-end', '高端', '奢华', '精品'])) {
      recommendations.push({
        sceneId: 'luxury',
        score: 20,
        reason: '产品定位高端，推荐奢华场景'
      })
    }

    // 户外/运动检测
    if (this.containsKeywords(combinedText, ['outdoor', 'sport', 'adventure', '户外', '运动', '探险', 'waterproof', '防水'])) {
      recommendations.push({
        sceneId: 'outdoor',
        score: 25,
        reason: '产品适合户外使用'
      })
    }

    // 家居/生活检测
    if (this.containsKeywords(combinedText, ['home', 'cozy', 'comfort', '家居', '舒适', '居家', 'daily', '日常'])) {
      recommendations.push({
        sceneId: 'lifestyle',
        score: 20,
        reason: '产品适合生活场景展示'
      })
    }

    // 礼品/节日检测
    if (this.containsKeywords(combinedText, ['gift', 'holiday', 'celebration', '礼品', '节日', '送礼', 'christmas', '圣诞'])) {
      recommendations.push({
        sceneId: 'seasonal',
        score: 25,
        reason: '产品适合作为礼品展示'
      })
    }

    // 简约/设计感检测
    if (this.containsKeywords(combinedText, ['minimal', 'simple', 'modern', '极简', '简约', '设计感', 'elegant', '优雅'])) {
      recommendations.push({
        sceneId: 'minimalist',
        score: 20,
        reason: '产品设计简约现代'
      })
    }

    // 电商主图检测（默认推荐）
    if (this.containsKeywords(combinedText, ['商品', '产品', '电商', 'product', 'e-commerce', 'main image'])) {
      recommendations.push({
        sceneId: 'studio-white',
        score: 15,
        reason: '适合标准电商主图展示'
      })
    }

    return recommendations
  }

  /**
   * 检查文本是否包含关键词
   */
  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(kw => text.includes(kw.toLowerCase()))
  }

  /**
   * 获取场景的默认推荐原因
   */
  private getDefaultReason(sceneId: SceneType): string {
    const scene = scenes[sceneId]
    return scene?.description || '适合展示产品'
  }

  /**
   * 获取最佳匹配场景
   */
  getBestScene(product: ProductInfo): SceneType {
    const recommendations = this.getRecommendations(product, 1)
    return recommendations.length > 0 ? recommendations[0].sceneId : 'studio-white'
  }

  /**
   * 检查场景是否适合产品
   */
  isSceneSuitable(product: ProductInfo, sceneId: SceneType): boolean {
    const recommendations = this.getRecommendations(product, 6)
    const rec = recommendations.find(r => r.sceneId === sceneId)
    return rec ? rec.score >= 60 : false
  }

  /**
   * 获取场景不适合的原因（如果不适合的话）
   */
  getSceneWarning(product: ProductInfo, sceneId: SceneType): string | null {
    if (!product.category) return null

    const category = getCategoryById(product.category)
    if (!category) return null

    // 检查是否有明显不匹配
    const recommendations = this.getRecommendations(product, 6)
    const rec = recommendations.find(r => r.sceneId === sceneId)

    if (rec && rec.score < 40) {
      return `${scenes[sceneId].name}可能不是${category.name}类产品的最佳选择，推荐尝试其他场景`
    }

    return null
  }
}

// 导出单例
export const sceneRecommender = new SceneRecommender()
