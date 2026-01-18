import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FusionConfig, FusionMode, ReferenceImage, ReferenceImageRole } from '@/types'

// 融合模式的中文标签
export const fusionModeLabels: Record<FusionMode, string> = {
    product_scene: '产品 + 场景',
    product_model: '产品 + 模特',
    full: '产品 + 场景 + 模特'
}

// 图片角色的中文标签
export const roleLabels: Record<ReferenceImageRole, string> = {
    scene: '场景参考图',
    model: '模特参考图',
    style: '风格参考图'
}

export const useFusionStore = defineStore('fusion', () => {
    // 状态
    const config = ref<FusionConfig>({
        enabled: false,
        mode: 'product_scene',
        sceneImage: undefined,
        modelImage: undefined,
        styleImage: undefined
    })

    // 计算属性
    const isEnabled = computed(() => config.value.enabled)

    const hasSceneImage = computed(() => !!config.value.sceneImage)
    const hasModelImage = computed(() => !!config.value.modelImage)
    const hasStyleImage = computed(() => !!config.value.styleImage)

    const canGenerate = computed(() => {
        if (!config.value.enabled) return true // 不启用融合时不影响生成

        switch (config.value.mode) {
            case 'product_scene':
                return hasSceneImage.value
            case 'product_model':
                return hasModelImage.value
            case 'full':
                return hasSceneImage.value && hasModelImage.value
            default:
                return false
        }
    })

    const referenceImages = computed((): ReferenceImage[] => {
        const images: ReferenceImage[] = []
        if (config.value.sceneImage) images.push(config.value.sceneImage)
        if (config.value.modelImage) images.push(config.value.modelImage)
        if (config.value.styleImage) images.push(config.value.styleImage)
        return images
    })

    // 方法
    const setEnabled = (enabled: boolean) => {
        config.value.enabled = enabled
    }

    const setMode = (mode: FusionMode) => {
        config.value.mode = mode
    }

    const addReferenceImage = async (file: File, role: ReferenceImageRole): Promise<ReferenceImage> => {
        // 读取文件为 base64
        const preview = await readFileAsDataUrl(file)

        const image: ReferenceImage = {
            id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview,
            role,
            name: file.name
        }

        // 根据角色设置到对应位置
        switch (role) {
            case 'scene':
                config.value.sceneImage = image
                break
            case 'model':
                config.value.modelImage = image
                break
            case 'style':
                config.value.styleImage = image
                break
        }

        return image
    }

    const removeReferenceImage = (role: ReferenceImageRole) => {
        switch (role) {
            case 'scene':
                config.value.sceneImage = undefined
                break
            case 'model':
                config.value.modelImage = undefined
                break
            case 'style':
                config.value.styleImage = undefined
                break
        }
    }

    const clearAllReferenceImages = () => {
        config.value.sceneImage = undefined
        config.value.modelImage = undefined
        config.value.styleImage = undefined
    }

    const reset = () => {
        config.value = {
            enabled: false,
            mode: 'product_scene',
            sceneImage: undefined,
            modelImage: undefined,
            styleImage: undefined
        }
    }

    // 生成融合提示词
    const buildFusionPrompt = (): string => {
        if (!config.value.enabled) return ''

        const parts: string[] = []

        // 基础融合指令
        parts.push('seamlessly blend the product into the reference image')
        parts.push('match lighting and perspective of reference')
        parts.push('maintain consistent color grading')
        parts.push('photorealistic integration')

        switch (config.value.mode) {
            case 'product_scene':
                parts.push('place product naturally in the scene background')
                parts.push('adjust product scale to fit scene perspective')
                break
            case 'product_model':
                parts.push('model holding or using the product naturally')
                parts.push('realistic hand-product interaction')
                break
            case 'full':
                parts.push('integrate product with model in the scene')
                parts.push('cohesive composition with all elements')
                break
        }

        return parts.join(', ')
    }

    // 辅助函数
    const readFileAsDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    return {
        // 状态
        config,

        // 计算属性
        isEnabled,
        hasSceneImage,
        hasModelImage,
        hasStyleImage,
        canGenerate,
        referenceImages,

        // 方法
        setEnabled,
        setMode,
        addReferenceImage,
        removeReferenceImage,
        clearAllReferenceImages,
        reset,
        buildFusionPrompt
    }
})
