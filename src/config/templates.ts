import type { Template, SceneType, GenerationSettings } from '@/types'

export const templates: Template[] = [
  {
    id: 'ecommerce-main',
    name: '电商主图标准版',
    description: '适用于淘宝、京东等平台的标准商品主图',
    category: 'ecommerce',
    scene: 'studio-white',
    settings: {
      aspectRatio: '1:1',
      quality: 'high',
      background: 'white',
      lighting: 'studio',
      style: 'commercial'
    },
    promptTemplate: 'Professional e-commerce product photography of {product}, pure white background, studio lighting, centered composition, high-end commercial style, clean and minimal, soft shadows, 8K quality',
    previewImage: '',
    tags: ['电商', '主图', '标准'],
    usageCount: 0,
    createdAt: new Date()
  },
  {
    id: 'lifestyle-home',
    name: '家居生活场景',
    description: '温馨家居环境，展示产品使用场景',
    category: 'lifestyle',
    scene: 'lifestyle',
    settings: {
      aspectRatio: '4:3',
      quality: 'high',
      background: 'contextual',
      lighting: 'natural',
      style: 'realistic'
    },
    promptTemplate: '{product} in a cozy modern living room, natural daylight through large windows, warm and inviting atmosphere, lifestyle photography, realistic home environment, comfortable interior design',
    previewImage: '',
    tags: ['生活', '家居', '场景'],
    usageCount: 0,
    createdAt: new Date()
  },
  {
    id: 'luxury-premium',
    name: '高端奢华展示',
    description: '奢华质感，适合高端品牌产品',
    category: 'luxury',
    scene: 'luxury',
    settings: {
      aspectRatio: '1:1',
      quality: 'ultra',
      background: 'gradient',
      lighting: 'dramatic',
      style: 'artistic'
    },
    promptTemplate: 'Luxury product photography of {product}, elegant dark gradient background, dramatic rim lighting, premium aesthetic, sophisticated composition, opulent atmosphere, high-end brand style',
    previewImage: '',
    tags: ['高端', '奢华', '品牌'],
    usageCount: 0,
    createdAt: new Date()
  },
  {
    id: 'outdoor-adventure',
    name: '户外探险风格',
    description: '自然户外环境，适合运动户外产品',
    category: 'outdoor',
    scene: 'outdoor',
    settings: {
      aspectRatio: '16:9',
      quality: 'high',
      background: 'contextual',
      lighting: 'natural',
      style: 'realistic'
    },
    promptTemplate: '{product} in an outdoor adventure setting, beautiful natural landscape, golden hour lighting, dynamic outdoor photography, adventurous lifestyle, scenic mountain or forest backdrop',
    previewImage: '',
    tags: ['户外', '运动', '自然'],
    usageCount: 0,
    createdAt: new Date()
  },
  {
    id: 'minimalist-modern',
    name: '极简现代风格',
    description: '简约设计感，突出产品本身',
    category: 'minimalist',
    scene: 'minimalist',
    settings: {
      aspectRatio: '1:1',
      quality: 'high',
      background: 'gradient',
      lighting: 'soft',
      style: 'commercial'
    },
    promptTemplate: 'Minimalist product photography of {product}, clean geometric background, soft gradient, ample negative space, modern sleek aesthetic, subtle shadows, contemporary design style',
    previewImage: '',
    tags: ['极简', '现代', '简约'],
    usageCount: 0,
    createdAt: new Date()
  },
  {
    id: 'festival-celebration',
    name: '节日促销主题',
    description: '节日氛围，适合促销活动使用',
    category: 'seasonal',
    scene: 'seasonal',
    settings: {
      aspectRatio: '1:1',
      quality: 'high',
      background: 'contextual',
      lighting: 'dramatic',
      style: 'artistic'
    },
    promptTemplate: '{product} in a festive celebration setting, holiday decorations, warm celebratory lighting, gift-giving atmosphere, seasonal elements, special occasion mood, promotional style',
    previewImage: '',
    tags: ['节日', '促销', '活动'],
    usageCount: 0,
    createdAt: new Date()
  },
  {
    id: 'fashion-editorial',
    name: '时尚杂志风格',
    description: '时尚大片风格，适合服装配饰',
    category: 'fashion',
    scene: 'lifestyle',
    settings: {
      aspectRatio: '3:4',
      quality: 'ultra',
      background: 'contextual',
      lighting: 'dramatic',
      style: 'artistic'
    },
    promptTemplate: 'Fashion editorial photography featuring {product}, high-fashion aesthetic, dramatic artistic lighting, stylish urban backdrop, magazine cover quality, trendy and chic atmosphere',
    previewImage: '',
    tags: ['时尚', '杂志', '大片'],
    usageCount: 0,
    createdAt: new Date()
  },
  {
    id: 'tech-product',
    name: '科技产品展示',
    description: '现代科技感，适合数码电子产品',
    category: 'tech',
    scene: 'minimalist',
    settings: {
      aspectRatio: '16:9',
      quality: 'high',
      background: 'gradient',
      lighting: 'studio',
      style: 'commercial'
    },
    promptTemplate: 'Modern technology product photography of {product}, sleek dark gradient background, precise edge lighting, futuristic tech aesthetic, clean digital product shot, reflective surfaces',
    previewImage: '',
    tags: ['科技', '数码', '电子'],
    usageCount: 0,
    createdAt: new Date()
  }
]

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(t => t.id === id)
}

export const getTemplatesByScene = (scene: SceneType): Template[] => {
  return templates.filter(t => t.scene === scene)
}

export const getTemplatesByCategory = (category: string): Template[] => {
  return templates.filter(t => t.category === category)
}

export const getTemplatesByTag = (tag: string): Template[] => {
  return templates.filter(t => t.tags.includes(tag))
}

export const applyTemplate = (template: Template, productName: string): string => {
  return template.promptTemplate.replace('{product}', productName)
}
