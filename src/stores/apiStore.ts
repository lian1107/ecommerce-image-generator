import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiConfig, ApiConnectionStatus } from '@/types'
import { geminiClient } from '@/services/geminiClient'
import { APP_CONFIG } from '@/config'
import { apiKeyStorage, obfuscateApiKey, validateApiKeyFormat } from '@/utils/crypto'

export const useApiStore = defineStore('api', () => {
  /* State */
  const provider = ref<'google' | 'openrouter'>('openrouter')
  const apiKey = ref('')
  const baseUrl = ref('https://openrouter.ai/api/v1')

  // 双模型配置
  const imageAnalysisModel = ref(APP_CONFIG.api.defaultImageAnalysisModel)   // 图片分析Model
  const imageGenerationModel = ref(APP_CONFIG.api.defaultImageGenerationModel) // 绘图创作Model

  // 向后兼容: model 作为 generationModel 的别名
  const model = computed(() => imageGenerationModel.value)

  const connectionStatus = ref<ApiConnectionStatus>({
    isConnected: false,
    isLoading: false,
    error: null,
    lastChecked: null
  })


  // Getters
  const isConfigured = computed(() => apiKey.value.trim().length > 0)

  const config = computed<ApiConfig>(() => ({
    apiKey: apiKey.value,
    baseUrl: baseUrl.value,
    model: model.value
  }))

  /**
   * 获取混淆后的 API Key（用于UI显示）
   * 例如：AIzaSy******************ab12
   */
  const obfuscatedApiKey = computed(() => {
    if (!apiKey.value) return ''
    return obfuscateApiKey(apiKey.value)
  })

  /* Computed Status */
  const statusText = computed(() => {
    if (connectionStatus.value.isLoading) return 'Testing...'
    if (connectionStatus.value.isConnected) return 'Connected'
    if (connectionStatus.value.error) return 'Error'
    return 'Not Connected'
  })

  const statusColor = computed(() => {
    if (connectionStatus.value.isLoading) return 'warning'
    if (connectionStatus.value.isConnected) return 'success'
    if (connectionStatus.value.error) return 'error'
    return 'default'
  })

  const currentProviderDefaults = computed(() => {
    if (provider.value === 'google') {
      return {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        models: [
          { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview' },
          { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image' }
        ]
      }
    }
    return {
      baseUrl: 'https://openrouter.ai/api/v1',
      models: [
        { value: 'google/gemini-3-pro-image-preview', label: 'Google Gemini 3 Pro (Preview)' },
        { value: 'google/gemini-2.5-flash-image', label: 'Google Gemini 2.5 Flash' }
      ]
    }
  })

  // Actions
  const setProvider = async (newProvider: 'google' | 'openrouter') => {
    provider.value = newProvider
    if (newProvider === 'google') {
      baseUrl.value = 'https://generativelanguage.googleapis.com/v1beta'
      imageAnalysisModel.value = APP_CONFIG.api.defaultImageAnalysisModel
      imageGenerationModel.value = APP_CONFIG.api.defaultImageGenerationModel
    } else {
      baseUrl.value = 'https://openrouter.ai/api/v1'
      // OpenRouter 需要 'google/' 前缀
      imageAnalysisModel.value = `google/${APP_CONFIG.api.defaultImageAnalysisModel}`
      imageGenerationModel.value = `google/${APP_CONFIG.api.defaultImageGenerationModel}`
    }
    // 同步到 geminiClient
    geminiClient.setBaseUrl(baseUrl.value)
    geminiClient.setAnalysisModel(imageAnalysisModel.value)
    geminiClient.setGenerationModel(imageGenerationModel.value)

    // 加载新 provider 的加密 API Key
    await loadApiKey()

    // Clear connection status on provider switch
    connectionStatus.value.isConnected = false
    connectionStatus.value.error = null
  }

  /**
   * 设置并加密保存 API Key
   * @param key - API Key
   * @param skipValidation - 是否跳过格式验证
   */
  const setApiKey = async (key: string, skipValidation = false) => {
    const trimmedKey = key.trim()

    // 格式验证（可选）
    if (!skipValidation && trimmedKey) {
      const isValid = validateApiKeyFormat(trimmedKey, provider.value)
      if (!isValid) {
        console.warn(`[Security] API Key 格式可能不正确 (${provider.value})`)
      }
    }

    apiKey.value = trimmedKey
    geminiClient.setApiKey(trimmedKey)
    connectionStatus.value.isConnected = false
    connectionStatus.value.error = null

    // 加密保存到 localStorage
    if (trimmedKey) {
      try {
        await apiKeyStorage.save(provider.value, trimmedKey)
        console.log('[Security] API Key 已加密保存')
      } catch (error) {
        console.error('[Security] Failed to save encrypted API Key:', error)
      }
    } else {
      // 如果是空字符串，删除存储的 key
      apiKeyStorage.remove(provider.value)
    }
  }

  const setBaseUrl = (url: string) => {
    baseUrl.value = url
    geminiClient.setBaseUrl(url)
  }

  // 向后兼容的 setModel (设置生成模型)
  const setModel = (modelName: string) => {
    imageGenerationModel.value = modelName
    geminiClient.setGenerationModel(modelName)
  }

  // 设置图片分析模型
  const setImageAnalysisModel = (modelName: string) => {
    imageAnalysisModel.value = modelName
    geminiClient.setAnalysisModel(modelName)
  }

  // 设置绘图创作模型
  const setImageGenerationModel = (modelName: string) => {
    imageGenerationModel.value = modelName
    geminiClient.setGenerationModel(modelName)
  }

  const testConnection = async (): Promise<boolean> => {
    if (!isConfigured.value) {
      connectionStatus.value.error = 'API Key 未配置'
      return false
    }

    connectionStatus.value.isLoading = true
    connectionStatus.value.error = null

    try {
      geminiClient.setApiKey(apiKey.value)
      const result = await geminiClient.testConnection()

      connectionStatus.value.isConnected = result.success
      connectionStatus.value.error = result.success ? null : result.message
      connectionStatus.value.lastChecked = new Date()

      return result.success
    } catch (error) {
      connectionStatus.value.isConnected = false
      connectionStatus.value.error = error instanceof Error ? error.message : '连接测试失败'
      return false
    } finally {
      connectionStatus.value.isLoading = false
    }
  }

  /**
   * 从加密存储加载 API Key
   */
  const loadApiKey = async () => {
    try {
      const savedKey = await apiKeyStorage.load(provider.value)
      if (savedKey) {
        apiKey.value = savedKey
        geminiClient.setApiKey(savedKey)
        console.log('[Security] API Key 已从加密存储加载')
      }
    } catch (error) {
      console.error('[Security] Failed to load encrypted API Key:', error)
    }
  }

  /**
   * 清除配置（包括加密存储的 API Key）
   */
  const clearConfig = () => {
    apiKey.value = ''
    apiKeyStorage.remove(provider.value)
    connectionStatus.value = {
      isConnected: false,
      isLoading: false,
      error: null,
      lastChecked: null
    }
  }

  return {
    // State
    provider,
    apiKey,
    baseUrl,
    model,
    imageAnalysisModel,
    imageGenerationModel,
    connectionStatus,

    // Getters
    isConfigured,
    config,
    statusText,
    statusColor,
    currentProviderDefaults,
    obfuscatedApiKey,

    // Actions
    setProvider,
    setApiKey,
    setBaseUrl,
    setModel,
    setImageAnalysisModel,
    setImageGenerationModel,
    testConnection,
    loadApiKey,
    clearConfig
  }
}, {
  persist: {
    key: `${APP_CONFIG.storage.prefix}-${APP_CONFIG.storage.keys.apiConfig}`,
    // 注意：apiKey 不在此处持久化，而是通过加密存储单独处理
    paths: ['provider', 'baseUrl', 'imageAnalysisModel', 'imageGenerationModel'],
    afterRestore: async (ctx) => {
      // 从加密存储加载 API Key
      try {
        const savedKey = await apiKeyStorage.load(ctx.store.provider)
        if (savedKey) {
          ctx.store.apiKey = savedKey
          geminiClient.setApiKey(savedKey)
          console.log('[Security] API Key 从加密存储恢复')
        }
      } catch (error) {
        console.error('[Security] Failed to restore encrypted API Key:', error)
      }

      // 同步双模型配置到 client
      geminiClient.setBaseUrl(ctx.store.baseUrl)
      geminiClient.setAnalysisModel(ctx.store.imageAnalysisModel)
      geminiClient.setGenerationModel(ctx.store.imageGenerationModel)
    }
  }

})
