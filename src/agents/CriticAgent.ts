import { BaseAgent, type AgentContext, type AgentResult } from './core/BaseAgent'
import { geminiClient } from '@/services/geminiClient'
import { CRITIC_SYSTEM_PROMPT } from '@/prompts/marketingPrompts'
import { CriticFeedbackSchema, validateAgentResponse, type CriticFeedback } from '@/schemas/agentSchemas'

export type { CriticFeedback }

export class CriticAgent extends BaseAgent {
    constructor() {
        super('Critic', 'Brand Compliance Officer')
    }

    async run(context: AgentContext): Promise<AgentResult<CriticFeedback>> {
        this.logThought("Reviewing marketing strategies for brand compliance...")

        const { additionalData } = context
        const strategies = additionalData?.strategies
        const brandContext = additionalData?.brandContext

        if (!strategies) {
            return { success: false, error: "No strategies provided for review" }
        }

        const input = `
Brand Context: ${brandContext || 'None provided'}

Proposed Strategies:
${JSON.stringify(strategies, null, 2)}

Please review these strategies.
`

        try {
            const result = await geminiClient.analyzeWithText({
                systemPrompt: CRITIC_SYSTEM_PROMPT,
                userPrompt: input
            })

            this.logThought("Review received. Validating feedback...")

            // Deep validation with Zod schema
            const validation = validateAgentResponse(CriticFeedbackSchema, result, 'Critic')

            if (!validation.success) {
                throw new Error(validation.error)
            }

            this.logThought(`Validation passed. Score: ${validation.data.score}. Approved: ${validation.data.approved}`)

            return {
                success: true,
                data: validation.data
            }

        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }
}
