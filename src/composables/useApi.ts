import { computed } from 'vue'
import { useApiStore } from '@/stores/apiStore'
import { useGenerationStore } from '@/stores/generationStore'

export function useApi() {
  const apiStore = useApiStore()
  const generationStore = useGenerationStore()

  const isConfigured = computed(() => apiStore.isConfigured)
  const isConnected = computed(() => apiStore.connectionStatus.isConnected)
  const isLoading = computed(() => apiStore.connectionStatus.isLoading)
  const error = computed(() => apiStore.connectionStatus.error)

  const canGenerate = computed(() =>
    isConfigured.value &&
    isConnected.value &&
    !generationStore.isGenerating
  )

  const testConnection = async () => {
    return await apiStore.testConnection()
  }

  const setApiKey = (key: string) => {
    apiStore.setApiKey(key)
  }

  return {
    isConfigured,
    isConnected,
    isLoading,
    error,
    canGenerate,
    testConnection,
    setApiKey
  }
}
