import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GenerationSettings, AdvancedOptions } from '@/types'
import { APP_CONFIG } from '@/config'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<GenerationSettings>({
    quantity: APP_CONFIG.generation.defaultQuantity,
    aspectRatio: APP_CONFIG.generation.defaultAspectRatio,
    quality: APP_CONFIG.generation.defaultQuality,
    style: 'commercial',
    lighting: 'studio',
    background: 'white',
    enhanceDetails: true,
    removeBackground: false,
    addShadow: true,
    colorCorrection: false
  })

  const advancedOptions = ref<AdvancedOptions>({
    negativePrompt: '',
    guidance: 7.5,
    steps: 30,
    seed: undefined
  })

  const showAdvancedOptions = ref(false)

  // Getters
  const quantity = computed(() => settings.value.quantity)

  const aspectRatio = computed(() => settings.value.aspectRatio)

  const quality = computed(() => settings.value.quality)

  const aspectRatioOptions = computed(() => [
    { value: '1:1', label: '1:1 正方形', description: '适合电商主图' },
    { value: '4:3', label: '4:3 横向', description: '适合详情图' },
    { value: '3:4', label: '3:4 纵向', description: '适合移动端' },
    { value: '16:9', label: '16:9 宽屏', description: '适合Banner' },
    { value: '9:16', label: '9:16 竖屏', description: '适合短视频封面' }
  ])

  const qualityOptions = computed(() => [
    { value: 'standard', label: '标准', description: '快速生成' },
    { value: 'high', label: '高清', description: '推荐选项' },
    { value: 'ultra', label: '超清', description: '最佳质量' }
  ])

  const quantityOptions = computed(() => [
    { value: 1, label: '1张' },
    { value: 3, label: '3张' },
    { value: 6, label: '6张' },
    { value: 9, label: '9张' }
  ])

  const styleOptions = computed(() => [
    { value: 'realistic', label: '写实', description: '真实感' },
    { value: 'artistic', label: '艺术', description: '创意风格' },
    { value: 'commercial', label: '商业', description: '专业电商' }
  ])

  const lightingOptions = computed(() => [
    { value: 'natural', label: '自然光', description: '柔和自然' },
    { value: 'studio', label: '影棚光', description: '专业均匀' },
    { value: 'dramatic', label: '戏剧光', description: '对比强烈' },
    { value: 'soft', label: '柔光', description: '温和细腻' }
  ])

  const backgroundOptions = computed(() => [
    { value: 'white', label: '纯白', description: '电商标准' },
    { value: 'gradient', label: '渐变', description: '现代感' },
    { value: 'contextual', label: '场景', description: '环境融合' },
    { value: 'transparent', label: '透明', description: '可合成' }
  ])

  // Actions
  const setQuantity = (value: number) => {
    settings.value.quantity = value
  }

  const setAspectRatio = (value: GenerationSettings['aspectRatio']) => {
    settings.value.aspectRatio = value
  }

  const setQuality = (value: GenerationSettings['quality']) => {
    settings.value.quality = value
  }

  const setStyle = (value: GenerationSettings['style']) => {
    settings.value.style = value
  }

  const setLighting = (value: GenerationSettings['lighting']) => {
    settings.value.lighting = value
  }

  const setBackground = (value: GenerationSettings['background']) => {
    settings.value.background = value
  }

  const toggleEnhanceDetails = () => {
    settings.value.enhanceDetails = !settings.value.enhanceDetails
  }

  const toggleRemoveBackground = () => {
    settings.value.removeBackground = !settings.value.removeBackground
  }

  const toggleAddShadow = () => {
    settings.value.addShadow = !settings.value.addShadow
  }

  const toggleColorCorrection = () => {
    settings.value.colorCorrection = !settings.value.colorCorrection
  }

  const setAdvancedOption = <K extends keyof AdvancedOptions>(
    key: K,
    value: AdvancedOptions[K]
  ) => {
    advancedOptions.value[key] = value
  }

  const setNegativePrompt = (prompt: string) => {
    advancedOptions.value.negativePrompt = prompt
  }

  const setSeed = (seed: number | undefined) => {
    advancedOptions.value.seed = seed
  }

  const randomizeSeed = () => {
    advancedOptions.value.seed = Math.floor(Math.random() * 2147483647)
  }

  const clearSeed = () => {
    advancedOptions.value.seed = undefined
  }

  const toggleAdvancedOptions = () => {
    showAdvancedOptions.value = !showAdvancedOptions.value
  }

  const applySceneDefaults = (sceneDefaults: Partial<GenerationSettings>) => {
    settings.value = { ...settings.value, ...sceneDefaults }
  }

  const resetToDefaults = () => {
    settings.value = {
      quantity: APP_CONFIG.generation.defaultQuantity,
      aspectRatio: APP_CONFIG.generation.defaultAspectRatio,
      quality: APP_CONFIG.generation.defaultQuality,
      style: 'commercial',
      lighting: 'studio',
      background: 'white',
      enhanceDetails: true,
      removeBackground: false,
      addShadow: true,
      colorCorrection: false
    }
    advancedOptions.value = {
      negativePrompt: '',
      guidance: 7.5,
      steps: 30,
      seed: undefined
    }
  }

  const exportSettings = (): string => {
    return JSON.stringify({
      settings: settings.value,
      advancedOptions: advancedOptions.value
    }, null, 2)
  }

  const importSettings = (json: string) => {
    try {
      const data = JSON.parse(json)
      if (data.settings) {
        settings.value = { ...settings.value, ...data.settings }
      }
      if (data.advancedOptions) {
        advancedOptions.value = { ...advancedOptions.value, ...data.advancedOptions }
      }
    } catch (error) {
      console.error('Failed to import settings:', error)
    }
  }

  return {
    // State
    settings,
    advancedOptions,
    showAdvancedOptions,

    // Getters
    quantity,
    aspectRatio,
    quality,
    aspectRatioOptions,
    qualityOptions,
    quantityOptions,
    styleOptions,
    lightingOptions,
    backgroundOptions,

    // Actions
    setQuantity,
    setAspectRatio,
    setQuality,
    setStyle,
    setLighting,
    setBackground,
    toggleEnhanceDetails,
    toggleRemoveBackground,
    toggleAddShadow,
    toggleColorCorrection,
    setAdvancedOption,
    setNegativePrompt,
    setSeed,
    randomizeSeed,
    clearSeed,
    toggleAdvancedOptions,
    applySceneDefaults,
    resetToDefaults,
    exportSettings,
    importSettings
  }
}, {
  persist: {
    key: `${APP_CONFIG.storage.prefix}-${APP_CONFIG.storage.keys.settings}`,
    pick: ['settings', 'advancedOptions']
  }
})
