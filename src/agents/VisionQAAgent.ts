import { BaseAgent, type AgentContext, type AgentResult } from './core/BaseAgent'
import { geminiClient } from '@/services/geminiClient'

export interface QAFeedback {
    pass: boolean;
    technical_score: number;
    aesthetic_score: number;
    issues: string[];
    reason: string;
}

export class VisionQAAgent extends BaseAgent {
    constructor() {
        super('VisionQA', 'Quality Assurance Specialist')
    }

    async run(context: AgentContext): Promise<AgentResult<QAFeedback>> {
        const { images, additionalData } = context
        const image = images?.[0]
        const prompt = additionalData?.originalPrompt || ''
        const criteria = additionalData?.criteria || 'Standard E-commerce Quality'

        if (!image) return { success: false, error: "No image to check" }

        this.logThought("Inspecting image quality...")

        // Specific Prompt for QA
        const qaPrompt = `
You are a stricter Image Quality Assurance AI.
Criteria: ${criteria}
Original Generation Prompt: "${prompt}"

Analyze this image for:
1. Glitches, artifacts, deformities (hands, text, objects).
2. Text rendering accuracy (if any text is intended).
3. Adherence to the prompt.

Output JSON ONLY:
{
  "pass": boolean,
  "technical_score": number (0-10),
  "aesthetic_score": number (0-10),
  "issues": string[],
  "reason": "summary string"
}
`
        try {
            await geminiClient.analyzeImage(image, qaPrompt)

            // analyzeImage usually returns simpler format {pass, reason}, 
            // but here we want the rich JSON if possible. 
            // So we might need to bypass analyzeImage wrapper if we want rich data, 
            // OR rely on analyzeWithText directly.
            // Let's use analyzeWithText directly for the rich JSON.

            const richResult = await geminiClient.analyzeWithText({
                userPrompt: qaPrompt,
                images: [image]
            })

            const feedback = richResult as QAFeedback
            this.logThought(`QA Result: ${feedback.pass ? 'PASS' : 'FAIL'} (${feedback.reason})`)

            return {
                success: true,
                data: feedback
            }

        } catch (error: any) {
            this.logThought(`QA Process Failed: ${error.message}`)
            return { success: false, error: error.message }
        }
    }
}
