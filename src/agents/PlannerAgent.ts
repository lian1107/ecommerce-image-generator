import { BaseAgent, type AgentContext, type AgentResult } from './core/BaseAgent'
import { geminiClient } from '@/services/geminiClient'
import { CONTENT_PLANNER_SYSTEM_PROMPT } from '@/prompts/marketingPrompts'
import type { ContentPlan } from '@/stores/marketingWorkflowStore'

export class PlannerAgent extends BaseAgent {
    constructor() {
        super('Planner', 'Content Strategist')
    }

    async run(context: AgentContext): Promise<AgentResult<ContentPlan>> {
        this.logThought("Drafting detailed content plan...")

        const { additionalData } = context
        const selectedStrategy = additionalData?.selectedStrategy

        if (!selectedStrategy) {
            return { success: false, error: "No strategy selected" }
        }

        const input = `
Selected Marketing Strategy:
${JSON.stringify(selectedStrategy, null, 2)}

Requirements:
1. Generate exactly ${additionalData?.itemCount || 8} items.
2. Ensure a coherent story flow suitable for this quantity.
`

        try {
            const result = await geminiClient.analyzeWithText({
                systemPrompt: CONTENT_PLANNER_SYSTEM_PROMPT,
                userPrompt: input
            })

            this.logThought("Content plan generated. Parsing structure...")

            // Basic Validation
            if (!result.items || !Array.isArray(result.items)) {
                throw new Error("Invalid Content Plan format")
            }

            return {
                success: true,
                data: result as ContentPlan
            }

        } catch (error: any) {
            this.logThought(`Planning failed: ${error.message}`)
            return {
                success: false,
                error: error.message
            }
        }
    }
}
