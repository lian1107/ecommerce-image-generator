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
      'pure white background',
      'professional studio lighting',
      'product photography',
      'clean and minimal',
      'high-end e-commerce style',
      'soft shadows',
      'centered composition'
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
      'lifestyle photography',
      'natural home environment',
      'warm and inviting atmosphere',
      'realistic setting',
      'product in use context',
      'natural daylight',
      'cozy interior'
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
      'outdoor photography',
      'natural environment',
      'adventure lifestyle',
      'nature background',
      'dynamic outdoor setting',
      'golden hour lighting',
      'scenic backdrop'
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
      'festive atmosphere',
      'holiday decorations',
      'celebration mood',
      'seasonal elements',
      'warm holiday lighting',
      'gift-giving context',
      'special occasion'
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
      'luxury product photography',
      'premium aesthetic',
      'elegant composition',
      'sophisticated lighting',
      'high-end materials texture',
      'refined and exclusive',
      'opulent atmosphere'
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
      'minimalist design',
      'clean aesthetic',
      'simple composition',
      'negative space',
      'modern and sleek',
      'subtle shadows',
      'geometric simplicity'
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
