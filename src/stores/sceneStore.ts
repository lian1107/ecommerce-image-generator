import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Scene, SceneType } from '@/types'
import { scenes, sceneList, getSceneById } from '@/config/scenes'
import { semanticEngine } from '@/services/semanticEngine'
import { useProductStore } from './productStore'

export const useSceneStore = defineStore('scene', () => {
  // State
  const selectedSceneId = ref<SceneType>('studio-white')
  const previousSceneId = ref<SceneType | null>(null)
  const customScenePrompt = ref('')

  // Getters
  const selectedScene = computed<Scene | undefined>(() =>
    getSceneById(selectedSceneId.value)
  )

  const allScenes = computed(() => sceneList)

  const scenePromptHints = computed(() =>
    selectedScene.value?.promptHints || []
  )

  const sceneDefaultSettings = computed(() =>
    selectedScene.value?.defaultSettings || {}
  )

  const sceneTags = computed(() =>
    selectedScene.value?.tags || []
  )

  const recommendedScene = computed<SceneType>(() => {
    const productStore = useProductStore()
    if (!productStore.hasProduct) return 'studio-white'

    return semanticEngine.recommendScene(productStore.productInfo)
  })

  const isRecommendedScene = computed(() =>
    selectedSceneId.value === recommendedScene.value
  )

  // Actions
  const selectScene = (sceneId: SceneType) => {
    if (sceneId !== selectedSceneId.value) {
      previousSceneId.value = selectedSceneId.value
      selectedSceneId.value = sceneId
      customScenePrompt.value = ''
    }
  }

  const selectRecommendedScene = () => {
    selectScene(recommendedScene.value)
  }

  const setCustomScenePrompt = (prompt: string) => {
    customScenePrompt.value = prompt
  }

  const clearCustomPrompt = () => {
    customScenePrompt.value = ''
  }

  const revertToPreviousScene = () => {
    if (previousSceneId.value) {
      const temp = selectedSceneId.value
      selectedSceneId.value = previousSceneId.value
      previousSceneId.value = temp
    }
  }

  const getSceneMatchScore = (sceneId: SceneType): number => {
    const productStore = useProductStore()
    if (!productStore.hasProduct) return 0.5

    const result = semanticEngine.matchProductToScene(
      productStore.productInfo,
      sceneId
    )
    return result.matchScore
  }

  const getSceneMatchInfo = (sceneId: SceneType) => {
    const productStore = useProductStore()
    if (!productStore.hasProduct) {
      return {
        matchScore: 0.5,
        suggestions: [],
        warnings: []
      }
    }

    return semanticEngine.matchProductToScene(
      productStore.productInfo,
      sceneId
    )
  }

  const getScenesWithMatchScores = computed(() => {
    return sceneList.map(scene => ({
      ...scene,
      matchScore: getSceneMatchScore(scene.id),
      isRecommended: scene.id === recommendedScene.value
    }))
  })

  return {
    // State
    selectedSceneId,
    previousSceneId,
    customScenePrompt,

    // Getters
    selectedScene,
    allScenes,
    scenePromptHints,
    sceneDefaultSettings,
    sceneTags,
    recommendedScene,
    isRecommendedScene,
    getScenesWithMatchScores,

    // Actions
    selectScene,
    selectRecommendedScene,
    setCustomScenePrompt,
    clearCustomPrompt,
    revertToPreviousScene,
    getSceneMatchScore,
    getSceneMatchInfo
  }
})
