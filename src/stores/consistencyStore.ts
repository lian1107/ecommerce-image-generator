import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ConsistencyConfig, ConsistencyMode, ReferenceImage } from '@/types'

// 一致性模式的中文标签
export const consistencyModeLabels: Record<ConsistencyMode, string> = {
    style: '风格一致性',
    character: '角色一致性',
    color: '色调一致性',
    brand: '品牌一致性'
}

export const useConsistencyStore = defineStore('consistency', () => {
    // 状态
    const config = ref<ConsistencyConfig>({
        enabled: false,
        mode: 'style',
        referenceImages: [],
        strength: 0.8
    })

    // 计算属性
    const isEnabled = computed(() => config.value.enabled)

    const hasReferenceImages = computed(() => config.value.referenceImages.length > 0)

    const canGenerate = computed(() => {
        if (!config.value.enabled) return true
        return hasReferenceImages.value
    })

    // 方法
    const setEnabled = (enabled: boolean) => {
        config.value.enabled = enabled
    }

    const setMode = (mode: ConsistencyMode) => {
        config.value.mode = mode
    }

    const setStrength = (strength: number) => {
        config.value.strength = Math.max(0, Math.min(1, strength))
    }

    const addReferenceImage = async (file: File): Promise<ReferenceImage | null> => {
        if (config.value.referenceImages.length >= 14) {
            // TODO: Notify user about limit
            return null
        }

        const preview = await readFileAsDataUrl(file)

        // Role defaults to 'style', but can be adjusted logically if needed
        // Actually for consistency store, role is less critical than the image itself, 
        // but we can map mode to role: style->style, character->model, etc.
        let role: ReferenceImage['role'] = 'style'
        if (config.value.mode === 'character') role = 'model'

        const image: ReferenceImage = {
            id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview,
            role, // This role is more for internal tracking
            name: file.name
        }

        config.value.referenceImages.push(image)
        return image
    }

    const removeReferenceImage = (id: string) => {
        const index = config.value.referenceImages.findIndex(img => img.id === id)
        if (index !== -1) {
            config.value.referenceImages.splice(index, 1)
        }
    }

    const clearReferenceImages = () => {
        config.value.referenceImages = []
    }

    const reset = () => {
        config.value = {
            enabled: false,
            mode: 'style',
            referenceImages: [],
            strength: 0.8
        }
    }

    // 生成一致性提示词
    const buildConsistencyPrompt = (): string => {
        if (!config.value.enabled || !hasReferenceImages.value) return ''

        const parts: string[] = []

        // 基础指令
        parts.push(`use provided reference images for ${config.value.mode} consistency`)

        // 根据模式添加特定指令
        switch (config.value.mode) {
            case 'style':
                parts.push('strictly maintain the artistic style, brushwork, and lighting of reference images')
                parts.push('adapt product to the reference style')
                break
            case 'character':
                parts.push('maintain character identity, facial features, and body structure from references')
                parts.push('ensure character looks exactly like the person in reference images')
                break
            case 'color':
                parts.push('match the exact color palette and tonal balance of reference images')
                parts.push('use dominant colors from references')
                break
            case 'brand':
                parts.push('adhere to the brand visual identity shown in references')
                parts.push('maintain consistent sophisticated commercial look')
                break
        }

        // 强度控制 (through prompt emphasis)
        if (config.value.strength > 0.8) {
            parts.push('high fidelity to references')
        } else if (config.value.strength < 0.5) {
            parts.push('loose inspiration from references')
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
        config,
        isEnabled,
        hasReferenceImages,
        canGenerate,

        setEnabled,
        setMode,
        setStrength,
        addReferenceImage,
        removeReferenceImage,
        clearReferenceImages,
        reset,
        buildConsistencyPrompt
    }
})
