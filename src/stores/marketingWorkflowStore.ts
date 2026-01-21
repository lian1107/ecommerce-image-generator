import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AgentOrchestrator } from '@/agents/core/AgentOrchestrator'
import type {
    ProductIntrinsicDNA,
    ArtDirectionDNA
} from '@/types'

// --- Types ---

export type WorkflowStep =
    | 'ANALYSIS'
    | 'STRATEGY'
    | 'CRITIQUING'      // Agent State
    | 'STRATEGY_READY'  // User Review State
    | 'PLANNING'
    | 'GENERATION'
    | 'QUALITY_CHECK'   // Agent State
    | 'COMPLETED'

export interface AgentThought {
    id: string
    agentName: string
    content: string
    timestamp: number
}

export interface ProductAnalysis {
    name: string
    visual_description: string
    key_features_zh: string
    extracted_colors?: string[] // Hex codes
    intrinsic_dna: ProductIntrinsicDNA; // [NEW] 事实层 DNA
}

export interface MarketingRoute {
    route_name: string
    headline_zh: string
    subhead_zh: string
    style_brief_zh: string
    target_audience_zh: string
    visual_elements_zh: string
    art_direction_dna: ArtDirectionDNA; // [NEW] 风格层 DNA
    image_prompts: Array<{ prompt_en: string; summary_zh: string }>
}

export interface ContentPlanItem {
    id: string
    type: 'main_white' | 'main_lifestyle' | 'story_slide'
    ratio: '1:1' | '9:16' | '16:9'
    title_zh: string
    copy_zh: string
    visual_summary_zh: string
    visual_prompt_en: string
    status?: 'pending' | 'generating' | 'reviewing' | 'completed' | 'failed'
    imageUrl?: string
    qaResult?: { pass: boolean; reason: string }
}

export interface ContentPlan {
    plan_name: string
    items: ContentPlanItem[]
}

// --- End Deep Vision DNA ---

// 参考图分类类型
export type ReferenceCategory = 'product' | 'style' | 'brand' | 'model'

// 分类参考图接口
export interface CategoryReference {
    id: string
    preview: string  // base64
    category: ReferenceCategory
    name: string
}

// 分类限制配置
export const CATEGORY_LIMITS: Record<ReferenceCategory, number> = {
    product: 6,
    style: 4,
    brand: 2,
    model: 2
}

// 分类中文标签
export const CATEGORY_LABELS: Record<ReferenceCategory, { name: string; icon: string; hint: string }> = {
    product: { name: '产品图组', icon: '📦', hint: '上传产品的多角度图片，确保AI完整理解产品形态' },
    style: { name: '风格参考', icon: '🎨', hint: '上传您喜欢的视觉风格参考，AI将学习并应用' },
    brand: { name: '品牌VI', icon: '🏢', hint: '上传品牌Logo、色板等，保持品牌一致性' },
    model: { name: '模特/角色', icon: '👤', hint: '上传代言人或目标用户形象参考' }
}

// --- Store ---

export const useMarketingWorkflowStore = defineStore('marketingWorkflow', () => {

    // State
    const currentStep = ref<WorkflowStep>('ANALYSIS')
    const agentThoughts = ref<AgentThought[]>([])

    // 初始化空参考图库
    const createEmptyReferences = () => ({
        product: [] as CategoryReference[],
        style: [] as CategoryReference[],
        brand: [] as CategoryReference[],
        model: [] as CategoryReference[]
    })

    // Data State - 扩展为多分类参考图库
    const productInput = ref({
        productName: '',
        brandContext: '',
        references: createEmptyReferences()
    })

    const productAnalysis = ref<ProductAnalysis | null>(null)
    const marketingRoutes = ref<MarketingRoute[]>([])
    const selectedRouteIndex = ref<number>(-1)

    const contentPlan = ref<ContentPlan | null>(null)

    // Computed - 检查是否有产品参考图
    const hasProductReferences = computed(() => productInput.value.references.product.length > 0)

    // 获取所有参考图的总数
    const totalReferences = computed(() => {
        const refs = productInput.value.references
        return refs.product.length + refs.style.length + refs.brand.length + refs.model.length
    })

    // Actions

    function addThought(agentName: string, content: string) {
        agentThoughts.value.push({
            id: Date.now().toString() + Math.random(),
            agentName,
            content,
            timestamp: Date.now()
        })
    }

    function initAgentOrchestrator() {
        AgentOrchestrator.getInstance().setLogHandler(addThought)
    }

    // 添加参考图到指定分类
    async function addReference(category: ReferenceCategory, file: File): Promise<CategoryReference | null> {
        const limit = CATEGORY_LIMITS[category]
        if (productInput.value.references[category].length >= limit) {
            return null
        }

        const preview = await readFileAsDataUrl(file)
        const ref: CategoryReference = {
            id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            preview,
            category,
            name: file.name
        }

        productInput.value.references[category].push(ref)
        return ref
    }

    // 移除参考图
    function removeReference(category: ReferenceCategory, id: string) {
        const index = productInput.value.references[category].findIndex(r => r.id === id)
        if (index !== -1) {
            productInput.value.references[category].splice(index, 1)
        }
    }

    // 清空某分类的参考图
    function clearCategoryReferences(category: ReferenceCategory) {
        productInput.value.references[category] = []
    }

    // 获取用于生成的参考图（智能选择）
    function getReferencesForGeneration(itemType?: string, promptText?: string): string[] {
        const refs: string[] = []

        // 1. 产品图始终包含（核心一致性）
        refs.push(...productInput.value.references.product.map(r => r.preview))

        // 2. 根据内容类型选择性添加风格参考
        if (itemType === 'main_lifestyle' || itemType === 'story_slide') {
            refs.push(...productInput.value.references.style.map(r => r.preview))
        }

        // 3. 如果 prompt 包含人物相关词汇，添加模特参考
        if (promptText && (promptText.includes('model') || promptText.includes('person') || promptText.includes('people'))) {
            refs.push(...productInput.value.references.model.map(r => r.preview))
        }

        // 限制最多5张避免API过载
        return refs.slice(0, 5)
    }

    function resetProcess() {
        currentStep.value = 'ANALYSIS'
        agentThoughts.value = []
        productInput.value = {
            productName: '',
            brandContext: '',
            references: createEmptyReferences()
        }
        productAnalysis.value = null
        marketingRoutes.value = []
        selectedRouteIndex.value = -1
        contentPlan.value = null
    }

    function setStep(step: WorkflowStep) {
        currentStep.value = step
    }

    // Agent Execution Actions
    async function startAnalysis() {
        try {
            setStep('ANALYSIS')
            addThought('System', 'Starting product analysis...')

            // Validate inputs
            if (!productInput.value.productName) {
                throw new Error('Product name is required')
            }
            if (!hasProductReferences.value) {
                throw new Error('At least one product reference image is required')
            }

            // Import DirectorAgent
            const { DirectorAgent } = await import('@/agents/DirectorAgent')
            const { AgentOrchestrator } = await import('@/agents/core/AgentOrchestrator')

            const orchestrator = AgentOrchestrator.getInstance()
            const directorAgent = new DirectorAgent()

            // Prepare context
            const context = {
                userPrompt: productInput.value.productName,
                images: productInput.value.references.product.map(ref => ref.preview),
                additionalData: {
                    brandContext: productInput.value.brandContext
                }
            }

            // Run Director Agent (Cast result data to expected type)
            const result = await orchestrator.runAgent(directorAgent, context)

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to analyze product')
            }

            // Explicitly cast data to expected structure to fix TS access errors
            const data = result.data as any

            // Save results
            productAnalysis.value = data.analysis
            marketingRoutes.value = data.routes

            addThought('System', `Analysis complete. Generated ${marketingRoutes.value.length} marketing routes.`)

            // Move to critiquing step
            setStep('CRITIQUING')
            await generateStrategies()

        } catch (error: any) {
            addThought('System', `Error: ${error.message}`)
            console.error('Analysis error:', error)
            throw error
        }
    }

    async function generateStrategies() {
        try {
            addThought('System', 'Reviewing strategies for brand compliance...')

            // Import CriticAgent
            const { CriticAgent } = await import('@/agents/CriticAgent')
            const { AgentOrchestrator } = await import('@/agents/core/AgentOrchestrator')

            const orchestrator = AgentOrchestrator.getInstance()
            const criticAgent = new CriticAgent()

            // Prepare context
            const context = {
                userPrompt: '',
                additionalData: {
                    strategies: marketingRoutes.value,
                    brandContext: productInput.value.brandContext
                }
            }

            // Run Critic Agent
            const result = await orchestrator.runAgent(criticAgent, context)

            if (!result.success || !result.data) {
                addThought('System', 'Strategy review failed, but continuing...')
            } else {
                const feedback = result.data as any
                addThought('Critic', `${feedback.critique} (Score: ${feedback.score}/100)`)

                if (!feedback.approved && feedback.score < 60) {
                    addThought('System', 'Warning: Strategies may need improvement, but you can still proceed.')
                }
            }

            // Move to strategy ready (user selection)
            setStep('STRATEGY_READY')
            addThought('System', 'Please select a marketing route to continue.')

        } catch (error: any) {
            addThought('System', `Review error: ${error.message}`)
            console.error('Strategy review error:', error)
            // Don't throw - allow user to proceed even if review fails
            setStep('STRATEGY_READY')
        }
    }

    async function generateContentPlan() {
        try {
            setStep('PLANNING')
            addThought('System', 'Generating detailed content plan...')

            // Validate selection
            if (selectedRouteIndex.value === -1) {
                throw new Error('Please select a marketing route first')
            }

            const selectedStrategy = marketingRoutes.value[selectedRouteIndex.value]
            if (!selectedStrategy) {
                throw new Error('Selected route not found')
            }

            // Import PlannerAgent
            const { PlannerAgent } = await import('@/agents/PlannerAgent')
            const { AgentOrchestrator } = await import('@/agents/core/AgentOrchestrator')

            const orchestrator = AgentOrchestrator.getInstance()
            const plannerAgent = new PlannerAgent()

            // Prepare context
            const context = {
                userPrompt: '',
                additionalData: {
                    selectedStrategy,
                    itemCount: 8 // Default to 8 items
                }
            }

            // Run Planner Agent
            const result = await orchestrator.runAgent(plannerAgent, context)

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to generate content plan')
            }

            // Save result (Explicit cast)
            contentPlan.value = result.data as ContentPlan
            addThought('System', `Content plan generated: ${contentPlan.value.items.length} items ready.`)

            // Move to generation step
            setStep('GENERATION')

        } catch (error: any) {
            addThought('System', `Planning error: ${error.message}`)
            console.error('Content planning error:', error)
            throw error
        }
    }

    // 辅助函数
    function readFileAsDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    return {
        // State
        currentStep,
        agentThoughts,
        productInput,
        productAnalysis,
        marketingRoutes,
        selectedRouteIndex,
        contentPlan,

        // Computed
        hasProductReferences,
        totalReferences,

        // Actions
        addThought,
        initAgentOrchestrator,
        addReference,
        removeReference,
        clearCategoryReferences,
        getReferencesForGeneration,
        resetProcess,
        setStep,
        startAnalysis,
        generateStrategies,
        generateContentPlan
    }
})
