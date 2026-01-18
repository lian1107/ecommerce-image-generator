import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiConfig, ApiConnectionStatus } from '@/types'
import { geminiClient } from '@/services/geminiClient'
import { APP_CONFIG } from '@/config'

export const useApiStore = defineStore('api', () => {
  /* State */
  const provider = ref<'google' | 'openrouter'>('openrouter')
  const apiKey = ref('')
  const baseUrl = ref('https://openrouter.ai/api/v1')
  const model = ref('google/gemini-3-pro-image-preview')

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
          { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Exp' },
          { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' }
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
  const setProvider = (newProvider: 'google' | 'openrouter') => {
    provider.value = newProvider
    if (newProvider === 'google') {
      baseUrl.value = 'https://generativelanguage.googleapis.com/v1beta'
      model.value = 'gemini-2.0-flash-exp'
    } else {
      baseUrl.value = 'https://openrouter.ai/api/v1'
      model.value = 'google/gemini-3-pro-image-preview'
    }
    geminiClient.setBaseUrl(baseUrl.value)
    geminiClient.setModel(model.value)

    // Clear connection status on provider switch
    connectionStatus.value.isConnected = false
    connectionStatus.value.error = null
  }

  const setApiKey = (key: string) => {
    apiKey.value = key
    geminiClient.setApiKey(key)
    connectionStatus.value.isConnected = false
    connectionStatus.value.error = null
  }

  const setBaseUrl = (url: string) => {
    baseUrl.value = url
    geminiClient.setBaseUrl(url)
  }

  const setModel = (modelName: string) => {
    model.value = modelName
    geminiClient.setModel(modelName)
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

  const clearConfig = () => {
    apiKey.value = ''
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
    connectionStatus,

    // Getters
    isConfigured,
    config,
    statusText,
    statusColor,
    currentProviderDefaults,

    // Actions
    setProvider,
    setApiKey,
    setBaseUrl,
    setModel,
    testConnection,
    clearConfig
  }
}, {
  persist: {
    key: `${APP_CONFIG.storage.prefix}-${APP_CONFIG.storage.keys.apiConfig}`,
    paths: ['provider', 'apiKey', 'baseUrl', 'model'],
    afterRestore: (ctx) => {
      // Manually sync client after state is restored
      geminiClient.setApiKey(ctx.store.apiKey)
      geminiClient.setBaseUrl(ctx.store.baseUrl)
      geminiClient.setModel(ctx.store.model)
    }
  }

})
