import { computed, watch } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { useSceneStore } from '@/stores/sceneStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useGenerationStore } from '@/stores/generationStore'
import { useModelStore } from '@/stores/modelStore'
import { useFusionStore } from '@/stores/fusionStore'
import { useConsistencyStore } from '@/stores/consistencyStore'

export function usePromptBuilder() {
  const productStore = useProductStore()
  const sceneStore = useSceneStore()
  const settingsStore = useSettingsStore()
  const generationStore = useGenerationStore()
  const modelStore = useModelStore()
  const fusionStore = useFusionStore()
  const consistencyStore = useConsistencyStore()

  const canBuildPrompt = computed(() =>
    productStore.hasImages || productStore.hasProduct
  )

  const currentPrompt = computed(() => generationStore.finalPrompt)

  const promptLayers = computed(() =>
    generationStore.promptConfig?.layers || []
  )

  const isEditing = computed(() => generationStore.isEditingPrompt)

  const buildPrompt = () => {
    if (canBuildPrompt.value) {
      generationStore.buildPrompt()
    }
  }

  const setEditedPrompt = (prompt: string) => {
    generationStore.setEditedPrompt(prompt)
  }

  const toggleEditing = () => {
    generationStore.togglePromptEditing()
  }

  const resetToGenerated = () => {
    generationStore.resetPromptToGenerated()
  }

  // Auto-rebuild prompt when dependencies change (including model and fusion config)
  watch(
    [
      () => productStore.productInfo,
      () => sceneStore.selectedSceneId,
      () => settingsStore.settings,
      () => modelStore.config,
      () => fusionStore.config,
      () => consistencyStore.config
    ],
    () => {
      if (canBuildPrompt.value && !isEditing.value) {
        buildPrompt()
      }
    },
    { deep: true }
  )

  return {
    canBuildPrompt,
    currentPrompt,
    promptLayers,
    isEditing,
    buildPrompt,
    setEditedPrompt,
    toggleEditing,
    resetToGenerated
  }
}
