import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AgentOrchestrator } from '@/agents/core/AgentOrchestrator'

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
}

export interface MarketingRoute {
    route_name: string
    headline_zh: string
    subhead_zh: string
    style_brief_zh: string
    target_audience_zh: string
    visual_elements_zh: string
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

// --- Store ---

export const useMarketingWorkflowStore = defineStore('marketingWorkflow', () => {

    // State
    const currentStep = ref<WorkflowStep>('ANALYSIS')
    const agentThoughts = ref<AgentThought[]>([])

    // Data State
    const productInput = ref({
        productName: '',
        brandContext: '',
        referenceImage: null as string | null // base64
    })

    const productAnalysis = ref<ProductAnalysis | null>(null)
    const marketingRoutes = ref<MarketingRoute[]>([])
    const selectedRouteIndex = ref<number>(-1)

    const contentPlan = ref<ContentPlan | null>(null)

    // Actions

    function addThought(agentName: string, content: string) {
        agentThoughts.value.push({
            id: Date.now().toString() + Math.random(),
            agentName,
            content,
            timestamp: Date.now()
        })
        // Auto-scroll logic could be handled in UI component watching this array
    }

    function initAgentOrchestrator() {
        AgentOrchestrator.getInstance().setLogHandler(addThought)
    }

    function resetProcess() {
        currentStep.value = 'ANALYSIS'
        agentThoughts.value = []
        productAnalysis.value = null
        marketingRoutes.value = []
        selectedRouteIndex.value = -1
        contentPlan.value = null
    }

    function setStep(step: WorkflowStep) {
        currentStep.value = step
    }

    // Placeholder Actions (Implementation in later phases)
    async function startAnalysis() {
        // Phase 3 implementation
    }

    async function generateStrategies() {
        // Phase 3 implementation
    }

    async function generateContentPlan() {
        // Phase 4 implementation
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

        // Actions
        addThought,
        initAgentOrchestrator,
        resetProcess,
        setStep,
        startAnalysis,
        generateStrategies,
        generateContentPlan
    }
})
