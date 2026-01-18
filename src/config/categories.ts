export interface ProductCategory {
  id: string
  name: string
  icon: string
  keywords: string[]
  suggestedScenes: string[]
  promptEnhancements: string[]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
]

export const getCategoryById = (id: string): ProductCategory | undefined => {
  return categories.find(cat => cat.id === id)
}

export const getCategoryByKeyword = (keyword: string): ProductCategory | undefined => {
  const lowerKeyword = keyword.toLowerCase()
  return categories.find(cat =>
    cat.keywords.some(k => k.toLowerCase().includes(lowerKeyword) || lowerKeyword.includes(k.toLowerCase()))
  )
}

export const getAllKeywords = (): string[] => {
  return categories.flatMap(cat => cat.keywords)
}
