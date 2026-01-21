import { BaseAgent, type AgentContext, type AgentResult } from './core/BaseAgent'
import { geminiClient } from '@/services/geminiClient'
import { z } from 'zod'

// Define QA Feedback schema for validation
const QAFeedbackSchema = z.object({
    pass: z.boolean(),
    technical_score: z.number().min(0).max(10),
    aesthetic_score: z.number().min(0).max(10),
    issues: z.array(z.string()),
    reason: z.string().min(1)
})

export type QAFeedback = z.infer<typeof QAFeedbackSchema>

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
You are a strict Image Quality Assurance AI for e-commerce product images.

Criteria: ${criteria}
Original Generation Prompt: "${prompt}"

Analyze this image for:
1. **Technical Quality**: Glitches, artifacts, deformities (hands, text, objects), resolution, focus
2. **Text Rendering**: Accuracy of any text (if intended in the image)
3. **Prompt Adherence**: Does the image match the original generation prompt?
4. **Visual Appeal**: Composition, lighting, color accuracy

Output JSON ONLY in this exact format:
{
  "pass": boolean (true only if technical_score >= 7 AND aesthetic_score >= 6),
  "technical_score": number (0-10, based on technical quality),
  "aesthetic_score": number (0-10, based on visual appeal),
  "issues": string[] (list specific issues found, empty array if none),
  "reason": "Brief summary of the assessment (1-2 sentences)"
}
`
        try {
            this.logThought("Calling Gemini Vision API for quality analysis...")

            const result = await geminiClient.analyzeWithText({
                userPrompt: qaPrompt,
                images: [image]
            })

            this.logThought("Validating QA response...")

            // Validate with Zod schema
            const parseResult = QAFeedbackSchema.safeParse(result)

            if (!parseResult.success) {
                // If validation fails, create a fallback response
                const errorMsg = parseResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
                this.logThought(`Validation failed: ${errorMsg}. Using fallback.`)

                // Attempt to extract partial data
                const partialData = result as any
                return {
                    success: true,
                    data: {
                        pass: partialData.pass === true,
                        technical_score: typeof partialData.technical_score === 'number' ? partialData.technical_score : 5,
                        aesthetic_score: typeof partialData.aesthetic_score === 'number' ? partialData.aesthetic_score : 5,
                        issues: Array.isArray(partialData.issues) ? partialData.issues : [],
                        reason: typeof partialData.reason === 'string' ? partialData.reason : 'QA validation incomplete'
                    }
                }
            }

            const feedback = parseResult.data
            this.logThought(`QA Result: ${feedback.pass ? 'PASS ✓' : 'FAIL ✗'} (Tech: ${feedback.technical_score}/10, Aesthetic: ${feedback.aesthetic_score}/10)`)

            if (feedback.issues.length > 0) {
                this.logThought(`Issues found: ${feedback.issues.join(', ')}`)
            }

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
