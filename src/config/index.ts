export * from './scenes'
export * from './categories'
export * from './templates'

export const APP_CONFIG = {
  appName: '电商智能生图系统',
  version: '1.0.0',

  api: {
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-3-pro-image-preview',
    timeout: 120000,
    maxRetries: 3
  },

  upload: {
    maxFiles: 3,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    minWidth: 256,
    minHeight: 256,
    maxWidth: 4096,
    maxHeight: 4096
  },

  generation: {
    defaultQuantity: 1 as const,
    maxQuantity: 9,
    defaultAspectRatio: '1:1' as const,
    defaultQuality: 'high' as const
  },

  history: {
    maxItems: 50,
    autoCleanupDays: 30,
    cleanupCheckInterval: 24 * 60 * 60 * 1000 // 24小时
  },

  storage: {
    prefix: 'ecommerce-image-gen',
    keys: {
      apiConfig: 'api-config',
      history: 'history',
      stats: 'stats',
      settings: 'settings'
    }
  }
}
