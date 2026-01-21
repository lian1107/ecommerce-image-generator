import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MarketingTemplate, MarketingSlot } from '@/types'
import { useProductStore } from '@/stores/productStore'
import { useConsistencyStore } from '@/stores/consistencyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { PromptBuilder, PromptLayerType } from '@/services/promptBuilder'
import { geminiClient } from '@/services/geminiClient'

// 预设模版数据
const PRESET_TEMPLATES: MarketingTemplate[] = [
    {
        id: 'amazon_listing',
        name: 'Amazon Listing Set',
        description: 'High-conversion image set for Amazon product pages.',
        icon: '🛒',
        slots: [
            {
                id: 'slot_main',
                name: '1. Main Image',
                description: 'Pure white background studio shot, front view, 85% fill',
                focus: '',
                aspectRatio: '1:1'
            },
            {
                id: 'slot_lifestyle',
                name: '2. Lifestyle',
                description: 'In a modern living room setting, soft natural lighting',
                focus: '',
                aspectRatio: '1:1'
            },
            {
                id: 'slot_detail',
                name: '3. Detail Shot',
                description: 'Macro shot showing texture and craftsmanship, depth of field',
                focus: 'showing the material texture',
                aspectRatio: '1:1'
            },
            {
                id: 'slot_feature',
                name: '4. Feature',
                description: 'Demonstrating key functionality or usage',
                focus: '',
                aspectRatio: '1:1'
            },
            {
                id: 'slot_scale',
                name: '5. Scale/Context',
                description: 'Next to common objects to show scale',
                focus: '',
                aspectRatio: '1:1'
            }
        ]
    },
    {
        id: 'social_story',
        name: 'Social Media Story',
        description: 'Aesthetic vertical images for Instagram/TikTok stories.',
        icon: '📱',
        slots: [
            {
                id: 'slot_cover',
                name: '1. Aesthetic Cover',
                description: 'Moody lighting, creative composition, emotional appeal',
                focus: '',
                aspectRatio: '9:16'
            },
            {
                id: 'slot_model',
                name: '2. On Model / Hand',
                description: 'Held by a hand or worn by a model, lifestyle feel',
                focus: '',
                aspectRatio: '9:16'
            },
            {
                id: 'slot_flatlay',
                name: '3. Creative Flatlay',
                description: 'Flat layouts with matching props, overhead view',
                focus: '',
                aspectRatio: '9:16'
            }
        ]
    }
]

export const useMarketingStore = defineStore('marketing', () => {
    // State
    const activeTemplateId = ref<string>('amazon_listing')
    const currentSlots = ref<MarketingSlot[]>([])
    const isGenerating = ref(false)

    // Initialize with default template
    if (currentSlots.value.length === 0) {
        const defaultTemplate = PRESET_TEMPLATES.find(t => t.id === 'amazon_listing')
        if (defaultTemplate) {
            currentSlots.value = JSON.parse(JSON.stringify(defaultTemplate.slots))
        }
    }

    // Getters
    const activeTemplate = computed(() =>
        PRESET_TEMPLATES.find(t => t.id === activeTemplateId.value)
    )

    const templates = computed(() => PRESET_TEMPLATES)

    // Actions
    const loadTemplate = (templateId: string) => {
        const template = PRESET_TEMPLATES.find(t => t.id === templateId)
        if (template) {
            activeTemplateId.value = templateId
            // Deep copy slots to allow editing
            currentSlots.value = JSON.parse(JSON.stringify(template.slots))
        }
    }

    const updateSlotFocus = (slotId: string, focus: string) => {
        const slot = currentSlots.value.find(s => s.id === slotId)
        if (slot) {
            slot.focus = focus
        }
    }

    const updateSlotDescription = (slotId: string, description: string) => {
        const slot = currentSlots.value.find(s => s.id === slotId)
        if (slot) {
            slot.description = description
        }
    }

    const generateSet = async () => {
        if (isGenerating.value) return
        isGenerating.value = true

        const productStore = useProductStore()
        const consistencyStore = useConsistencyStore()
        const settingsStore = useSettingsStore()

        // Reset generating state
        currentSlots.value.forEach(s => {
            s.isGenerating = true
            s.resultImage = undefined
        })

        try {
            for (const slot of currentSlots.value) {
                // Create fresh builder for each slot
                const builder = new PromptBuilder()
                    .setProduct(productStore.productInfo)
                    .setSettings(settingsStore.settings)

                // 1. Consistency Layer
                if (consistencyStore.isEnabled) {
                    builder.setLayerContent(
                        PromptLayerType.CONSISTENCY,
                        consistencyStore.buildConsistencyPrompt() // Ensure this returns string
                    )
                }

                // 2. Scene/Context Layer
                if (slot.description) {
                    builder.setLayerContent(
                        PromptLayerType.SCENE_CONTEXT,
                        slot.description
                    )
                }

                // 3. Focus/Detail Layer
                if (slot.focus) {
                    // Add explicit focus instruction
                    builder.setLayerContent(
                        PromptLayerType.DETAIL,
                        `Focus specifically on: ${slot.focus}. Ensure this aspect is the visual center.`
                    )
                }

                // Build prompt (Use public method)
                const fullPrompt = builder.buildPrompt()

                // Prepare reference images
                // [FIX] Always include the primary product image for color/subject consistency
                const allReferenceImages: string[] = []

                // 1. Add the primary product image (critical for color accuracy)
                if (productStore.primaryImage?.preview) {
                    allReferenceImages.push(productStore.primaryImage.preview)
                }

                // 2. Add consistency store images if enabled
                if (consistencyStore.isEnabled) {
                    const consistencyImages = consistencyStore.config.referenceImages.map(img => img.preview)
                    allReferenceImages.push(...consistencyImages)
                }

                const referenceImages = allReferenceImages.length > 0 ? allReferenceImages : undefined

                // Generate
                try {
                    const results = await geminiClient.generateImage({
                        prompt: fullPrompt,
                        referenceImages: referenceImages,
                        // Override settings with slot ratio
                        settings: {
                            ...settingsStore.settings,
                            aspectRatio: slot.aspectRatio
                        },
                        negativePrompt: settingsStore.advancedOptions?.negativePrompt || ''
                    })

                    if (results && results.length > 0) {
                        slot.resultImage = results[0].imageUrl // Use imageUrl
                    }
                } catch (err) {
                    console.error(`Failed to generate slot ${slot.id}:`, err)
                } finally {
                    slot.isGenerating = false
                }
            }
        } finally {
            isGenerating.value = false
            // Ensure all slots are marked done if something crashed
            currentSlots.value.forEach(s => s.isGenerating = false)
        }
    }

    return {
        activeTemplateId,
        currentSlots,
        isGenerating,
        activeTemplate,
        templates,
        loadTemplate,
        updateSlotFocus,
        updateSlotDescription,
        generateSet
    }
})
