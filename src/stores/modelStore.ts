import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ModelConfig, ModelDisplayType, ModelRecommendation, ModelPartialFocus } from '@/types'

// 默认模特配置
const defaultModelConfig: ModelConfig = {
    enabled: false,
    displayType: 'none',

    // 基础属性
    gender: 'unspecified',
    ageGroup: 'young',
    skinTone: 'unspecified',

    // 外观属性
    hairStyle: 'unspecified',
    bodyType: 'unspecified',
    makeup: 'unspecified',

    // 表现属性
    pose: 'standing',
    expression: 'smile',
    clothingStyle: 'auto',

    partialFocus: undefined
}

// 产品类别的模特推荐配置
const categoryRecommendations: Record<string, ModelRecommendation> = {
    electronics: {
        displayType: 'holding',
        config: {
            gender: 'unspecified',
            ageGroup: 'young',
            expression: 'smile',
            clothingStyle: 'fashion',
            pose: 'standing'
        },
        reason: '数码产品适合手持展示，突出产品尺寸和易用性'
    },
    fashion: {
        displayType: 'wearing',
        config: {
            gender: 'unspecified',
            ageGroup: 'young',
            expression: 'natural',
            clothingStyle: 'auto',
            pose: 'standing',
            bodyType: 'slim'
        },
        reason: '服装产品需要穿戴展示，体现上身效果'
    },
    beauty: {
        displayType: 'partial',
        config: {
            gender: 'female',
            ageGroup: 'young',
            makeup: 'glamorous',
            expression: 'natural',
            partialFocus: 'face'
        },
        reason: '美妆产品适合面部特写，展示使用效果'
    },
    home: {
        displayType: 'using',
        config: {
            gender: 'unspecified',
            ageGroup: 'young',
            expression: 'friendly',
            clothingStyle: 'casual',
            pose: 'sitting'
        },
        reason: '家居产品适合生活场景展示，营造温馨氛围'
    },
    food: {
        displayType: 'holding',
        config: {
            gender: 'unspecified',
            ageGroup: 'young',
            expression: 'smile',
            clothingStyle: 'casual',
            pose: 'standing'
        },
        reason: '食品适合手持展示，增加食欲感'
    },
    sports: {
        displayType: 'wearing',
        config: {
            gender: 'unspecified',
            ageGroup: 'young',
            bodyType: 'athletic',
            clothingStyle: 'sporty',
            expression: 'focused',
            pose: 'standing'
        },
        reason: '运动产品需要展示穿戴效果和运动感'
    },
    jewelry: {
        displayType: 'partial',
        config: {
            gender: 'female',
            ageGroup: 'young',
            makeup: 'light',
            expression: 'natural',
            clothingStyle: 'elegant',
            partialFocus: 'hands'
        },
        reason: '珠宝首饰适合局部特写，展示佩戴效果'
    },
    baby: {
        displayType: 'using',
        config: {
            gender: 'female',
            ageGroup: 'young',
            expression: 'friendly',
            clothingStyle: 'casual',
            pose: 'sitting'
        },
        reason: '母婴产品适合使用场景展示，传递关爱感'
    },
    office: {
        displayType: 'using',
        config: {
            gender: 'unspecified',
            ageGroup: 'young',
            expression: 'focused',
            clothingStyle: 'business',
            pose: 'sitting'
        },
        reason: '办公用品适合工作场景展示，体现专业感'
    }
}

// 展示类型的中文名称
export const displayTypeLabels: Record<ModelDisplayType, string> = {
    none: '无模特',
    holding: '手持展示',
    wearing: '穿戴展示',
    using: '使用场景',
    partial: '局部展示'
}

// 属性选项的中文标签
export const modelAttributeLabels = {
    gender: {
        unspecified: '不指定',
        male: '男性',
        female: '女性'
    },
    ageGroup: {
        young: '青年 (18-30)',
        middle: '中年 (30-45)',
        mature: '成熟 (45+)'
    },
    skinTone: {
        unspecified: '不指定',
        asian: '亚洲肤色',
        fair: '白皙',
        tan: '小麦色',
        dark: '深色'
    },
    hairStyle: {
        unspecified: '不指定',
        short: '短发',
        long: '长发',
        medium: '中长发',
        curly: '卷发',
        ponytail: '马尾'
    },
    bodyType: {
        unspecified: '不指定',
        slim: '纤细',
        average: '标准',
        athletic: '运动型',
        curvy: '丰满'
    },
    makeup: {
        unspecified: '不指定',
        natural: '自然妆',
        light: '淡妆',
        glamorous: '精致妆容',
        none: '素颜'
    },
    pose: {
        standing: '站立',
        sitting: '坐姿',
        walking: '行走',
        side: '侧身',
        closeup: '特写'
    },
    expression: {
        smile: '微笑',
        natural: '自然',
        cool: '时尚冷酷',
        friendly: '亲和力',
        focused: '专注'
    },
    clothingStyle: {
        auto: '自动匹配',
        casual: '休闲',
        business: '商务',
        sporty: '运动',
        fashion: '时尚',
        elegant: '优雅'
    },
    partialFocus: {
        hands: '手部',
        face: '面部',
        upper_body: '上半身',
        full_body: '全身'
    }
}

export const useModelStore = defineStore('model', () => {
    // 状态
    const config = ref<ModelConfig>({ ...defaultModelConfig })
    const currentRecommendation = ref<ModelRecommendation | null>(null)
    const isUsingRecommendation = ref(false)

    // 计算属性
    const isEnabled = computed(() => config.value.enabled)

    const displayTypeLabel = computed(() =>
        displayTypeLabels[config.value.displayType]
    )

    const hasRecommendation = computed(() => currentRecommendation.value !== null)

    // 方法
    const setEnabled = (enabled: boolean) => {
        config.value.enabled = enabled
        if (enabled) {
            // 启用时，如果 displayType 是 none，设置默认值
            if (config.value.displayType === 'none') {
                config.value.displayType = 'holding'  // 默认手持展示
            }
        } else {
            config.value.displayType = 'none'
        }
    }

    const setDisplayType = (type: ModelDisplayType) => {
        config.value.displayType = type
        isUsingRecommendation.value = false
    }

    const setPartialFocus = (focus: ModelPartialFocus) => {
        config.value.partialFocus = focus
    }

    const updateConfig = (updates: Partial<ModelConfig>) => {
        config.value = { ...config.value, ...updates }
        isUsingRecommendation.value = false
    }

    const resetConfig = () => {
        config.value = { ...defaultModelConfig }
        isUsingRecommendation.value = false
    }

    // 获取类别推荐
    const getRecommendation = (categoryId: string): ModelRecommendation | null => {
        const recommendation = categoryRecommendations[categoryId]
        if (recommendation) {
            currentRecommendation.value = recommendation
            return recommendation
        }
        currentRecommendation.value = null
        return null
    }

    // 应用推荐配置
    const applyRecommendation = () => {
        if (!currentRecommendation.value) return

        const rec = currentRecommendation.value
        config.value = {
            ...defaultModelConfig,
            enabled: true,
            displayType: rec.displayType,
            ...rec.config
        }
        isUsingRecommendation.value = true
    }

    // 生成模特提示词
    const buildModelPrompt = (): string => {
        if (!config.value.enabled || config.value.displayType === 'none') {
            return ''
        }

        const parts: string[] = []
        const c = config.value

        // 真实比例和尺寸的强调提示词
        parts.push('realistic proportions')
        parts.push('accurate product scale relative to human body')
        parts.push('natural perspective')

        // 展示方式（加强比例描述）
        const displayDescriptions: Record<ModelDisplayType, string> = {
            none: '',
            holding: 'a model naturally holding the product with realistic hand-to-product size ratio',
            wearing: 'a model wearing the product with accurate fit and proportions',
            using: 'a model naturally using the product in context with realistic scale',
            partial: `close-up shot of model's ${c.partialFocus || 'hands'} with the product at accurate size`
        }
        parts.push(displayDescriptions[c.displayType])

        // 性别
        if (c.gender !== 'unspecified') {
            parts.push(c.gender === 'male' ? 'male model' : 'female model')
        }

        // 年龄
        const ageDescriptions: Record<string, string> = {
            young: 'young adult',
            middle: 'middle-aged',
            mature: 'mature elegant'
        }
        parts.push(ageDescriptions[c.ageGroup] || '')

        // 肤色
        if (c.skinTone !== 'unspecified') {
            const skinDescriptions: Record<string, string> = {
                asian: 'Asian',
                fair: 'fair skin',
                tan: 'tan skin',
                dark: 'dark skin'
            }
            parts.push(skinDescriptions[c.skinTone] || '')
        }

        // 发型
        if (c.hairStyle !== 'unspecified') {
            parts.push(`${c.hairStyle} hair`)
        }

        // 体型
        if (c.bodyType !== 'unspecified') {
            const bodyDescriptions: Record<string, string> = {
                slim: 'slim figure',
                average: 'average build',
                athletic: 'athletic build',
                curvy: 'curvy figure'
            }
            parts.push(bodyDescriptions[c.bodyType] || '')
        }

        // 妆容
        if (c.makeup !== 'unspecified' && c.makeup !== 'none') {
            const makeupDescriptions: Record<string, string> = {
                natural: 'natural makeup',
                light: 'light makeup',
                glamorous: 'glamorous makeup'
            }
            parts.push(makeupDescriptions[c.makeup] || '')
        }

        // 表情
        const expressionDescriptions: Record<string, string> = {
            smile: 'warm smile',
            natural: 'natural expression',
            cool: 'cool confident look',
            friendly: 'friendly approachable look',
            focused: 'focused expression'
        }
        parts.push(expressionDescriptions[c.expression] || '')

        // 姿势
        const poseDescriptions: Record<string, string> = {
            standing: 'standing pose',
            sitting: 'seated pose',
            walking: 'walking pose',
            side: 'side profile',
            closeup: 'close-up shot'
        }
        parts.push(poseDescriptions[c.pose] || '')

        // 服装风格
        if (c.clothingStyle !== 'auto') {
            const clothingDescriptions: Record<string, string> = {
                casual: 'casual outfit',
                business: 'business attire',
                sporty: 'sporty athletic wear',
                fashion: 'fashionable trendy outfit',
                elegant: 'elegant sophisticated attire'
            }
            parts.push(clothingDescriptions[c.clothingStyle] || '')
        }

        // 过滤空值并组合
        return parts.filter(p => p.trim()).join(', ')
    }

    return {
        // 状态
        config,
        currentRecommendation,
        isUsingRecommendation,

        // 计算属性
        isEnabled,
        displayTypeLabel,
        hasRecommendation,

        // 方法
        setEnabled,
        setDisplayType,
        setPartialFocus,
        updateConfig,
        resetConfig,
        getRecommendation,
        applyRecommendation,
        buildModelPrompt
    }
})
