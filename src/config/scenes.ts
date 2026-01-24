import type { Scene, SceneType } from '@/types'

export const scenes: Record<SceneType, Scene> = {
  'studio-white': {
    id: 'studio-white',
    name: '纯白棚拍',
    description: '专业电商白底图，干净简洁，适合主图展示',
    icon: '📷',
    defaultSettings: {
      background: 'white',
      lighting: 'studio',
      style: 'commercial'
    },
    promptHints: [
      'a pure white seamless background creating clean e-commerce presentation',
      'professional three-point studio lighting that creates soft diffused highlights',
      'centered composition at a slightly elevated angle showcasing product clearly'
    ],
    tags: ['电商主图', '白底图', '产品展示']
  },
  'lifestyle': {
    id: 'lifestyle',
    name: '生活场景',
    description: '真实生活环境展示，增强产品代入感',
    icon: '🏠',
    defaultSettings: {
      background: 'contextual',
      lighting: 'natural',
      style: 'realistic'
    },
    promptHints: [
      'a warm and inviting natural home environment with authentic lifestyle context',
      'soft natural daylight streaming through windows creating gentle ambient lighting',
      'lifestyle composition showing the product in realistic everyday use',
      'cozy interior setting with complementary decor elements and natural textures',
      'product shown at realistic scale proportional to surrounding furniture and environment'
    ],
    tags: ['场景图', '生活方式', '氛围感']
  },
  'outdoor': {
    id: 'outdoor',
    name: '户外场景',
    description: '户外自然环境，适合运动、户外用品',
    icon: '🌲',
    defaultSettings: {
      background: 'contextual',
      lighting: 'natural',
      style: 'realistic'
    },
    promptHints: [
      'a dynamic natural outdoor environment with scenic nature backdrop',
      'golden hour lighting with warm natural sunlight creating dramatic atmosphere',
      'adventure lifestyle composition emphasizing product in action context',
      'sharp focus on product with natural depth of field and environmental storytelling',
      'product displayed at true-to-life scale within the natural outdoor setting'
    ],
    tags: ['户外', '运动', '自然']
  },
  'seasonal': {
    id: 'seasonal',
    name: '节日主题',
    description: '节日氛围图，适合促销活动',
    icon: '🎄',
    defaultSettings: {
      background: 'contextual',
      lighting: 'dramatic',
      style: 'artistic'
    },
    promptHints: [
      'a festive atmosphere with seasonal decorations and celebration elements',
      'warm holiday lighting creating magical ambiance and special occasion mood',
      'gift-giving context with elegant seasonal styling and holiday themes',
      'dramatic composition emphasizing the joy and spirit of the celebration',
      'product presented at appropriate scale relative to holiday decorations and setting'
    ],
    tags: ['节日', '促销', '活动']
  },
  'luxury': {
    id: 'luxury',
    name: '高端奢华',
    description: '奢华质感，适合高端品牌展示',
    icon: '💎',
    defaultSettings: {
      background: 'gradient',
      lighting: 'dramatic',
      style: 'artistic',
      quality: 'ultra'
    },
    promptHints: [
      'an elegant dark gradient background with subtle reflections emphasizing luxury',
      'dramatic rim lighting highlighting premium materials and craftsmanship textures',
      'sophisticated composition conveying exclusivity and refined aesthetic',
      'opulent atmosphere capturing every luxurious detail'
    ],
    tags: ['高端', '奢侈品', '品质感']
  },
  'minimalist': {
    id: 'minimalist',
    name: '极简风格',
    description: '简约设计感，突出产品本身',
    icon: '⬜',
    defaultSettings: {
      background: 'gradient',
      lighting: 'soft',
      style: 'commercial'
    },
    promptHints: [
      'a minimalist design with clean aesthetic and generous negative space',
      'simple composition with geometric simplicity emphasizing modern elegance',
      'soft diffused lighting creating subtle shadows without distraction',
      'modern and sleek presentation focusing entirely on product form and function'
    ],
    tags: ['极简', '现代', '简约']
  }
}

export const sceneList: Scene[] = Object.values(scenes)

export const getSceneById = (id: SceneType): Scene | undefined => {
  return scenes[id]
}

export const getScenesByTag = (tag: string): Scene[] => {
  return sceneList.filter(scene => scene.tags.includes(tag))
}
