import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  GenerationResult,
  GenerationProgress,
  GenerationTask,
  PromptConfig
} from '@/types'
import { geminiClient } from '@/services/geminiClient'
import { createPromptBuilder } from '@/services/promptBuilder'
import { useApiStore } from './apiStore'
import { useProductStore } from './productStore'
import { useSceneStore } from './sceneStore'
import { useSettingsStore } from './settingsStore'
import { useHistoryStore } from './historyStore'
import { useStatsStore } from './statsStore'
import { useModelStore } from './modelStore'
import { useFusionStore } from './fusionStore'
import { useConsistencyStore } from './consistencyStore'

export const useGenerationStore = defineStore('generation', () => {
  // State
  const currentTask = ref<GenerationTask | null>(null)
  const results = ref<GenerationResult[]>([])
  const selectedResults = ref<Set<string>>(new Set())

  const progress = ref<GenerationProgress>({
    status: 'idle',
    progress: 0,
    currentStep: '',
    totalSteps: 0
  })

  const promptConfig = ref<PromptConfig | null>(null)
  const editedPrompt = ref('')
  const isEditingPrompt = ref(false)

  // Getters
  const isGenerating = computed(() =>
    ['preparing', 'generating', 'processing'].includes(progress.value.status)
  )

  const isIdle = computed(() => progress.value.status === 'idle')

  const hasResults = computed(() => results.value.length > 0)

  const resultCount = computed(() => results.value.length)

  const selectedCount = computed(() => selectedResults.value.size)

  const hasSelectedResults = computed(() => selectedResults.value.size > 0)

  const selectedResultsList = computed(() =>
    results.value.filter(r => selectedResults.value.has(r.id))
  )

  const canGenerate = computed(() => {
    const apiStore = useApiStore()
    const productStore = useProductStore()
    const fusionStore = useFusionStore()
    const consistencyStore = useConsistencyStore()

    const basicChecks = apiStore.isConfigured &&
      apiStore.connectionStatus.isConnected &&
      productStore.hasImages &&
      !isGenerating.value

    if (!basicChecks) return false

    // Check advanced feature requirements
    if (fusionStore.isEnabled && !fusionStore.canGenerate) return false
    if (consistencyStore.isEnabled && !consistencyStore.canGenerate) return false

    return true
  })

  const finalPrompt = computed(() => {
    if (isEditingPrompt.value && editedPrompt.value) {
      return editedPrompt.value
    }
    return promptConfig.value?.finalPrompt || ''
  })

  // Actions
  const buildPrompt = (): PromptConfig => {
    const productStore = useProductStore()
    const sceneStore = useSceneStore()
    const settingsStore = useSettingsStore()
    const modelStore = useModelStore()
    const fusionStore = useFusionStore()
    const consistencyStore = useConsistencyStore()

    const builder = createPromptBuilder()
      .setProduct(productStore.productInfo)
      .setScene(sceneStore.selectedSceneId)
      .setSettings(settingsStore.settings)

    if (fusionStore.isEnabled) {
      builder.setFusionPrompt(fusionStore.buildFusionPrompt())
    }

    if (consistencyStore.isEnabled) {
      builder.setConsistencyPrompt(consistencyStore.buildConsistencyPrompt())
    }

    // Add model prompt if enabled (only if not using fusion model mode)
    // 如果启用了融合且模式包含模特(product_model 或 full)，则跳过常规模特 prompt，避免冲突
    const isFusionModelMode = fusionStore.isEnabled &&
      (fusionStore.config.mode === 'product_model' || fusionStore.config.mode === 'full')

    if (modelStore.isEnabled && !isFusionModelMode) {
      const modelPrompt = modelStore.buildModelPrompt()
      console.log('=== Model Prompt Debug ===')
      console.log('Model enabled:', modelStore.isEnabled)
      console.log('Display type:', modelStore.config.displayType)
      console.log('Model prompt:', modelPrompt)
      if (modelPrompt) {
        builder.setModelPrompt(modelPrompt)
      }
    }

    // Add custom scene prompt if any
    if (sceneStore.customScenePrompt) {
      builder.addPrompt(sceneStore.customScenePrompt)
    }

    const config = builder.build()
    promptConfig.value = config
    editedPrompt.value = config.finalPrompt

    return config
  }

  const setEditedPrompt = (prompt: string) => {
    editedPrompt.value = prompt
  }

  const togglePromptEditing = () => {
    isEditingPrompt.value = !isEditingPrompt.value
  }

  const resetPromptToGenerated = () => {
    if (promptConfig.value) {
      editedPrompt.value = promptConfig.value.finalPrompt
    }
  }

  const startGeneration = async (): Promise<boolean> => {
    const productStore = useProductStore()
    const settingsStore = useSettingsStore()
    const sceneStore = useSceneStore()
    const historyStore = useHistoryStore()
    const statsStore = useStatsStore()

    if (!canGenerate.value) {
      return false
    }

    // Build or use edited prompt
    const config = promptConfig.value || buildPrompt()
    let prompt = finalPrompt.value

    // Initialize task
    const task: GenerationTask = {
      id: `task_${Date.now()}`,
      status: 'preparing',
      results: [],
      startedAt: new Date(),
      prompt: config,
      settings: settingsStore.settings
    }

    currentTask.value = task
    results.value = []
    selectedResults.value.clear()

    // Update progress
    const quantity = settingsStore.quantity
    progress.value = {
      status: 'preparing',
      progress: 0,
      currentStep: '准备生成...',
      totalSteps: quantity
    }

    try {
      progress.value.status = 'generating'
      progress.value.currentStep = '正在生成图片...'

      // Generate images
      // 组合产品图和融合参考图
      const fusionStore = useFusionStore()
      const consistencyStore = useConsistencyStore()
      let allReferenceImages = [...productStore.imageDataUrls]

      // 如果启用了融合，添加融合参考图
      if (fusionStore.isEnabled) {
        for (const refImg of fusionStore.referenceImages) {
          allReferenceImages.push(refImg.preview)
        }
      }

      // 如果启用了一致性系统，添加一致性参考图和指令
      if (consistencyStore.isEnabled) {
        for (const refImg of consistencyStore.config.referenceImages) {
          allReferenceImages.push(refImg.preview)
        }
      }

      const generatedResults = await geminiClient.generateBatch(
        {
          prompt,
          referenceImages: allReferenceImages,
          settings: settingsStore.settings,
          negativePrompt: settingsStore.advancedOptions.negativePrompt
        },
        quantity,
        (current, total) => {
          progress.value.progress = (current / total) * 100
          progress.value.currentStep = `正在生成第 ${current}/${total} 张图片...`
        }
      )

      // Update results with scene info
      for (const result of generatedResults) {
        result.scene = sceneStore.selectedSceneId
      }

      results.value = generatedResults
      task.results = generatedResults
      task.status = 'completed'
      task.completedAt = new Date()

      progress.value = {
        status: 'completed',
        progress: 100,
        currentStep: '生成完成',
        totalSteps: quantity
      }

      // Add to history
      historyStore.addToHistory(task, productStore.productInfo.name, sceneStore.selectedScene?.name || '')

      // Update stats
      const duration = (task.completedAt.getTime() - task.startedAt.getTime()) / 1000
      statsStore.recordGeneration(
        generatedResults.length,
        duration,
        sceneStore.selectedSceneId
      )

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败'

      progress.value = {
        status: 'error',
        progress: 0,
        currentStep: errorMessage,
        totalSteps: quantity,
        error: errorMessage
      }

      task.status = 'error'
      statsStore.recordGeneration(0, 0, sceneStore.selectedSceneId)

      return false
    }
  }

  const cancelGeneration = () => {
    if (isGenerating.value) {
      progress.value = {
        status: 'idle',
        progress: 0,
        currentStep: '已取消',
        totalSteps: 0
      }

      if (currentTask.value) {
        currentTask.value.status = 'error'
      }
    }
  }

  const selectResult = (id: string) => {
    selectedResults.value.add(id)
  }

  const deselectResult = (id: string) => {
    selectedResults.value.delete(id)
  }

  const toggleResultSelection = (id: string) => {
    if (selectedResults.value.has(id)) {
      selectedResults.value.delete(id)
    } else {
      selectedResults.value.add(id)
    }
  }

  const selectAllResults = () => {
    results.value.forEach(r => selectedResults.value.add(r.id))
  }

  const deselectAllResults = () => {
    selectedResults.value.clear()
  }

  const removeResult = (id: string) => {
    const index = results.value.findIndex(r => r.id === id)
    if (index !== -1) {
      results.value.splice(index, 1)
      selectedResults.value.delete(id)
    }
  }

  const downloadResult = async (id: string) => {
    const result = results.value.find(r => r.id === id)
    if (!result) return

    try {
      const link = document.createElement('a')
      link.href = result.imageUrl
      link.download = `generated_${result.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const downloadSelectedResults = async () => {
    for (const id of selectedResults.value) {
      await downloadResult(id)
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const downloadAllResults = async () => {
    for (const result of results.value) {
      await downloadResult(result.id)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const clearResults = () => {
    results.value = []
    selectedResults.value.clear()
    currentTask.value = null
    progress.value = {
      status: 'idle',
      progress: 0,
      currentStep: '',
      totalSteps: 0
    }
  }

  const resetProgress = () => {
    progress.value = {
      status: 'idle',
      progress: 0,
      currentStep: '',
      totalSteps: 0
    }
  }

  return {
    // State
    currentTask,
    results,
    selectedResults,
    progress,
    promptConfig,
    editedPrompt,
    isEditingPrompt,

    // Getters
    isGenerating,
    isIdle,
    hasResults,
    resultCount,
    selectedCount,
    hasSelectedResults,
    selectedResultsList,
    canGenerate,
    finalPrompt,

    // Actions
    buildPrompt,
    setEditedPrompt,
    togglePromptEditing,
    resetPromptToGenerated,
    startGeneration,
    cancelGeneration,
    selectResult,
    deselectResult,
    toggleResultSelection,
    selectAllResults,
    deselectAllResults,
    removeResult,
    downloadResult,
    downloadSelectedResults,
    downloadAllResults,
    clearResults,
    resetProgress
  }
})
