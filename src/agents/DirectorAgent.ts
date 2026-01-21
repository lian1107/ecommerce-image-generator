import { BaseAgent, type AgentContext, type AgentResult } from './core/BaseAgent'
import { geminiClient } from '@/services/geminiClient'
import { DIRECTOR_SYSTEM_PROMPT } from '@/prompts/marketingPrompts'
import type { ProductAnalysis, MarketingRoute } from '@/stores/marketingWorkflowStore'
import { DirectorResponseSchema, validateAgentResponse } from '@/schemas/agentSchemas'

export class DirectorAgent extends BaseAgent {
    constructor() {
        super('Director', 'Visual Marketing Director')
    }

    async run(context: AgentContext): Promise<AgentResult<{
        analysis: ProductAnalysis;
        routes: MarketingRoute[];
    }>> {
        this.logThought("Analyzing inputs and brand context...")

        const { userPrompt, images, additionalData } = context
        const brandInfo = additionalData?.brandContext || ''

        // Construct the prompt input
        const fullInput = `
Products Name: ${userPrompt}
Brand/Context Info: ${brandInfo}

Please analyze this product and generate marketing strategies.
`

        try {
            this.logThought("Drafting marketing strategies (calling Gemini)...")

            const result = await geminiClient.analyzeWithText({
                systemPrompt: DIRECTOR_SYSTEM_PROMPT,
                userPrompt: fullInput,
                images: images || []
            })

            this.logThought("Strategy draft received. Validating structure...")

            // Deep validation with Zod schema
            const validation = validateAgentResponse(DirectorResponseSchema, result, 'Director')

            if (!validation.success) {
                throw new Error(validation.error)
            }

            this.logThought("Validation passed. Returning validated data.")

            return {
                success: true,
                data: {
                    analysis: validation.data.product_analysis,
                    routes: validation.data.marketing_routes
                }
            }

        } catch (error: any) {
            this.logThought(`Error during strategy generation: ${error.message}`)
            return {
                success: false,
                error: error.message
            }
        }
    }
}
