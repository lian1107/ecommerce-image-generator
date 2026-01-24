// [P1] 增强版产品类型模板系统
export interface CategoryPhotographySettings {
  preferredLighting: 'studio' | 'natural' | 'dramatic' | 'soft'
  preferredAngle: 'front' | 'elevated' | 'side' | 'top-down' | 'dynamic'
  depthOfField: 'shallow' | 'medium' | 'deep'
  backgroundStyle: 'white' | 'gradient' | 'contextual' | 'reflective'
}

export interface CategorySceneRecommendation {
  sceneId: string
  priority: number  // 1-5, 5 being highest
  reason: string    // Why this scene works for this category
  modifiers?: string[] // Scene-specific prompt modifiers
}

export interface ProductCategory {
  id: string
  name: string
  icon: string
  keywords: string[]
  suggestedScenes: string[]
  promptEnhancements: string[]
  // [P1] New fields for enhanced category templates
  photographySettings: CategoryPhotographySettings
  sceneRecommendations: CategorySceneRecommendation[]
  materialKeywords: string[]  // Common materials for this category
  avoidKeywords: string[]     // Things to avoid in prompts
}

export const categories: ProductCategory[] = [
  {
    id: 'electronics',
    name: '数码电子',
    icon: '📱',
    keywords: ['手机', '电脑', '耳机', '相机', '平板', '智能手表', '充电器'],
    suggestedScenes: ['studio-white', 'minimalist', 'lifestyle'],
    promptEnhancements: [
      'sleek metallic surface',
      'reflective screen',
      'modern technology aesthetic',
      'precise edge lighting',
      'clean digital product shot'
    ],
    photographySettings: {
      preferredLighting: 'studio',
      preferredAngle: 'elevated',
      depthOfField: 'medium',
      backgroundStyle: 'gradient'
    },
    sceneRecommendations: [
      { sceneId: 'studio-white', priority: 5, reason: '展示产品细节和工艺', modifiers: ['product focus', 'tech aesthetic'] },
      { sceneId: 'minimalist', priority: 4, reason: '突出现代设计感', modifiers: ['clean lines', 'geometric'] },
      { sceneId: 'lifestyle', priority: 3, reason: '展示使用场景', modifiers: ['desk setup', 'modern workspace'] }
    ],
    materialKeywords: ['aluminum', 'glass', 'plastic', 'metal', 'matte', 'glossy'],
    avoidKeywords: ['vintage', 'rustic', 'organic', 'handmade']
  },
  {
    id: 'fashion',
    name: '服装服饰',
    icon: '👔',
    keywords: ['衣服', '裤子', '裙子', '外套', 'T恤', '帽子', '围巾'],
    suggestedScenes: ['lifestyle', 'studio-white', 'minimalist'],
    promptEnhancements: [
      'fabric texture detail',
      'natural draping',
      'fashion photography style',
      'soft flattering light',
      'stylish presentation'
    ],
    photographySettings: {
      preferredLighting: 'soft',
      preferredAngle: 'front',
      depthOfField: 'shallow',
      backgroundStyle: 'contextual'
    },
    sceneRecommendations: [
      { sceneId: 'lifestyle', priority: 5, reason: '展示穿搭效果', modifiers: ['fashion model', 'styled outfit'] },
      { sceneId: 'studio-white', priority: 4, reason: '清晰展示款式', modifiers: ['flat lay', 'hanging display'] },
      { sceneId: 'minimalist', priority: 3, reason: '突出设计细节', modifiers: ['fabric focus', 'textile detail'] }
    ],
    materialKeywords: ['cotton', 'silk', 'wool', 'linen', 'leather', 'denim', 'polyester'],
    avoidKeywords: ['tech', 'digital', 'electronic', 'mechanical']
  },
  {
    id: 'beauty',
    name: '美妆护肤',
    icon: '💄',
    keywords: ['口红', '护肤品', '化妆品', '香水', '面膜', '精华'],
    suggestedScenes: ['luxury', 'minimalist', 'studio-white'],
    promptEnhancements: [
      'glossy product surface',
      'elegant bottle design',
      'beauty product lighting',
      'luxurious texture',
      'premium cosmetic photography'
    ],
    photographySettings: {
      preferredLighting: 'soft',
      preferredAngle: 'elevated',
      depthOfField: 'shallow',
      backgroundStyle: 'gradient'
    },
    sceneRecommendations: [
      { sceneId: 'luxury', priority: 5, reason: '突出高端品质', modifiers: ['premium packaging', 'elegant'] },
      { sceneId: 'minimalist', priority: 4, reason: '简约高级感', modifiers: ['clean beauty', 'skincare'] },
      { sceneId: 'studio-white', priority: 3, reason: '产品细节展示', modifiers: ['bottle detail', 'texture'] }
    ],
    materialKeywords: ['glass', 'ceramic', 'metal cap', 'frosted', 'transparent', 'rose gold'],
    avoidKeywords: ['industrial', 'rugged', 'outdoor', 'sporty']
  },
  {
    id: 'home',
    name: '家居家装',
    icon: '🏡',
    keywords: ['家具', '灯具', '装饰', '收纳', '床品', '厨具'],
    suggestedScenes: ['lifestyle', 'minimalist', 'studio-white'],
    promptEnhancements: [
      'cozy home atmosphere',
      'interior design context',
      'warm ambient lighting',
      'comfortable living space',
      'home lifestyle photography'
    ],
    photographySettings: {
      preferredLighting: 'natural',
      preferredAngle: 'elevated',
      depthOfField: 'medium',
      backgroundStyle: 'contextual'
    },
    sceneRecommendations: [
      { sceneId: 'lifestyle', priority: 5, reason: '展示家居场景', modifiers: ['interior design', 'room setting'] },
      { sceneId: 'minimalist', priority: 4, reason: '突出产品设计', modifiers: ['Scandinavian', 'modern home'] },
      { sceneId: 'studio-white', priority: 3, reason: '产品独立展示', modifiers: ['product focus', 'clean'] }
    ],
    materialKeywords: ['wood', 'fabric', 'ceramic', 'glass', 'metal', 'rattan', 'marble'],
    avoidKeywords: ['industrial', 'tech', 'digital', 'sporty']
  },
  {
    id: 'food',
    name: '食品饮料',
    icon: '🍔',
    keywords: ['零食', '饮料', '茶叶', '咖啡', '保健品', '调味品'],
    suggestedScenes: ['lifestyle', 'studio-white', 'seasonal'],
    promptEnhancements: [
      'appetizing presentation',
      'food photography lighting',
      'fresh and delicious look',
      'culinary styling',
      'gourmet aesthetic'
    ],
    photographySettings: {
      preferredLighting: 'natural',
      preferredAngle: 'top-down',
      depthOfField: 'shallow',
      backgroundStyle: 'contextual'
    },
    sceneRecommendations: [
      { sceneId: 'lifestyle', priority: 5, reason: '展示美食场景', modifiers: ['food styling', 'appetizing'] },
      { sceneId: 'studio-white', priority: 4, reason: '包装展示', modifiers: ['product packaging', 'clean'] },
      { sceneId: 'seasonal', priority: 3, reason: '节日礼品展示', modifiers: ['gift set', 'festive'] }
    ],
    materialKeywords: ['packaging', 'glass bottle', 'tin', 'paper box', 'fresh', 'organic'],
    avoidKeywords: ['tech', 'digital', 'industrial', 'mechanical']
  },
  {
    id: 'sports',
    name: '运动户外',
    icon: '⚽',
    keywords: ['运动鞋', '运动服', '健身器材', '户外装备', '球类'],
    suggestedScenes: ['outdoor', 'lifestyle', 'studio-white'],
    promptEnhancements: [
      'dynamic action feel',
      'athletic lifestyle',
      'outdoor adventure context',
      'energetic composition',
      'sports photography style'
    ],
    photographySettings: {
      preferredLighting: 'natural',
      preferredAngle: 'dynamic',
      depthOfField: 'medium',
      backgroundStyle: 'contextual'
    },
    sceneRecommendations: [
      { sceneId: 'outdoor', priority: 5, reason: '展示户外使用', modifiers: ['action shot', 'adventure'] },
      { sceneId: 'lifestyle', priority: 4, reason: '运动生活方式', modifiers: ['athletic', 'gym setting'] },
      { sceneId: 'studio-white', priority: 3, reason: '产品细节展示', modifiers: ['product focus', 'technical detail'] }
    ],
    materialKeywords: ['mesh', 'rubber', 'synthetic', 'breathable', 'durable', 'waterproof'],
    avoidKeywords: ['formal', 'elegant', 'luxury', 'delicate']
  },
  {
    id: 'jewelry',
    name: '珠宝首饰',
    icon: '💍',
    keywords: ['戒指', '项链', '手链', '耳环', '手表', '眼镜'],
    suggestedScenes: ['luxury', 'minimalist', 'studio-white'],
    promptEnhancements: [
      'sparkling gemstone',
      'precious metal reflection',
      'jewelry macro photography',
      'elegant luxury lighting',
      'high-end accessory shot'
    ],
    photographySettings: {
      preferredLighting: 'dramatic',
      preferredAngle: 'elevated',
      depthOfField: 'shallow',
      backgroundStyle: 'reflective'
    },
    sceneRecommendations: [
      { sceneId: 'luxury', priority: 5, reason: '突出奢华品质', modifiers: ['sparkle', 'precious'] },
      { sceneId: 'minimalist', priority: 4, reason: '优雅简约展示', modifiers: ['elegant display', 'refined'] },
      { sceneId: 'studio-white', priority: 3, reason: '清晰细节展示', modifiers: ['macro detail', 'craftsmanship'] }
    ],
    materialKeywords: ['gold', 'silver', 'platinum', 'diamond', 'gemstone', 'pearl', 'crystal'],
    avoidKeywords: ['casual', 'sporty', 'outdoor', 'rugged']
  },
  {
    id: 'baby',
    name: '母婴用品',
    icon: '👶',
    keywords: ['婴儿用品', '玩具', '童装', '奶瓶', '纸尿裤'],
    suggestedScenes: ['lifestyle', 'studio-white', 'minimalist'],
    promptEnhancements: [
      'soft pastel colors',
      'gentle nurturing atmosphere',
      'safe and comforting',
      'family-friendly styling',
      'warm parenting context'
    ],
    photographySettings: {
      preferredLighting: 'soft',
      preferredAngle: 'elevated',
      depthOfField: 'medium',
      backgroundStyle: 'contextual'
    },
    sceneRecommendations: [
      { sceneId: 'lifestyle', priority: 5, reason: '温馨家庭场景', modifiers: ['nursery', 'family'] },
      { sceneId: 'studio-white', priority: 4, reason: '产品安全展示', modifiers: ['safe', 'clean'] },
      { sceneId: 'minimalist', priority: 3, reason: '简约温柔风格', modifiers: ['pastel', 'gentle'] }
    ],
    materialKeywords: ['soft', 'cotton', 'safe plastic', 'silicone', 'organic', 'hypoallergenic'],
    avoidKeywords: ['sharp', 'industrial', 'dark', 'dramatic', 'luxury']
  },
  {
    id: 'office',
    name: '办公文具',
    icon: '📎',
    keywords: ['文具', '办公用品', '笔记本', '打印机', '收纳盒'],
    suggestedScenes: ['minimalist', 'studio-white', 'lifestyle'],
    promptEnhancements: [
      'organized workspace',
      'professional office setting',
      'clean desk aesthetic',
      'productive atmosphere',
      'modern office photography'
    ],
    photographySettings: {
      preferredLighting: 'natural',
      preferredAngle: 'elevated',
      depthOfField: 'medium',
      backgroundStyle: 'contextual'
    },
    sceneRecommendations: [
      { sceneId: 'minimalist', priority: 5, reason: '专业简约风格', modifiers: ['desk setup', 'organized'] },
      { sceneId: 'studio-white', priority: 4, reason: '产品清晰展示', modifiers: ['product focus', 'clean'] },
      { sceneId: 'lifestyle', priority: 3, reason: '办公场景展示', modifiers: ['workspace', 'productivity'] }
    ],
    materialKeywords: ['paper', 'metal', 'plastic', 'leather', 'wood', 'cork'],
    avoidKeywords: ['outdoor', 'sporty', 'casual', 'party']
  }
]

export const getCategoryById = (id: string): ProductCategory | undefined => {
  return categories.find(cat => cat.id === id)
}

export const getCategoryByKeyword = (keyword: string): ProductCategory | undefined => {
  if (!keyword) return undefined

  const lowerKeyword = keyword.toLowerCase()

  // 首先尝试通过类别 ID 精确匹配（支持 AI 分析返回的 mappedCategory）
  const byId = categories.find(cat => cat.id.toLowerCase() === lowerKeyword)
  if (byId) return byId

  // 然后通过类别名称匹配
  const byName = categories.find(cat => cat.name.toLowerCase().includes(lowerKeyword))
  if (byName) return byName

  // 最后通过关键词匹配
  return categories.find(cat =>
    cat.keywords.some(k => k.toLowerCase().includes(lowerKeyword) || lowerKeyword.includes(k.toLowerCase()))
  )
}

export const getAllKeywords = (): string[] => {
  return categories.flatMap(cat => cat.keywords)
}

/**
 * [P1] 获取类别的摄影设置
 */
export const getCategoryPhotographySettings = (categoryId: string): CategoryPhotographySettings | undefined => {
  const category = getCategoryById(categoryId)
  return category?.photographySettings
}

/**
 * [P1] 获取类别的场景推荐（按优先级排序）
 */
export const getCategorySceneRecommendations = (categoryId: string): CategorySceneRecommendation[] => {
  const category = getCategoryById(categoryId)
  if (!category) return []
  return [...category.sceneRecommendations].sort((a, b) => b.priority - a.priority)
}

/**
 * [P1] 获取特定场景的类别修饰词
 */
export const getCategorySceneModifiers = (categoryId: string, sceneId: string): string[] => {
  const category = getCategoryById(categoryId)
  if (!category) return []
  const recommendation = category.sceneRecommendations.find(r => r.sceneId === sceneId)
  return recommendation?.modifiers || []
}

/**
 * [P1] 检查关键词是否应该避免
 */
export const shouldAvoidKeyword = (categoryId: string, keyword: string): boolean => {
  const category = getCategoryById(categoryId)
  if (!category) return false
  const lowerKeyword = keyword.toLowerCase()
  return category.avoidKeywords.some(avoid => lowerKeyword.includes(avoid.toLowerCase()))
}

/**
 * [P1] 获取类别的材质关键词
 */
export const getCategoryMaterialKeywords = (categoryId: string): string[] => {
  const category = getCategoryById(categoryId)
  return category?.materialKeywords || []
}
