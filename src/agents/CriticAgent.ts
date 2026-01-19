import { BaseAgent, type AgentContext, type AgentResult } from './core/BaseAgent'
import { geminiClient } from '@/services/geminiClient'
import { CRITIC_SYSTEM_PROMPT } from '@/prompts/marketingPrompts'

export interface CriticFeedback {
    approved: boolean;
    critique: string;
    score: number;
}

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

            this.logThought(`Review complete. Score: ${result.score}. Approved: ${result.approved}`)

            return {
                success: true,
                data: result as CriticFeedback
            }

        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }
}
