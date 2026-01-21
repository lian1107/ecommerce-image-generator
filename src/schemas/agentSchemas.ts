import { z } from 'zod'

// --- Intrinsic DNA Schema (Product Analysis) ---
const MaterialAnalysisSchema = z.object({
  surface_texture: z.string().min(1, 'Surface texture is required'),
  reflectivity: z.string().min(1, 'Reflectivity is required')
})

const FormFactorSchema = z.object({
  shape_keywords: z.array(z.string()).min(1, 'At least one shape keyword is required')
})

const IntrinsicDNASchema = z.object({
  material_analysis: MaterialAnalysisSchema,
  form_factor: FormFactorSchema,
  brand_color_palette: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')).min(1)
})

// --- Art Direction DNA Schema ---
const LightingScenarioSchema = z.object({
  style: z.string().min(1),
  direction: z.string().min(1),
  atmosphere: z.string().min(1)
})

const OpticalMechanicsSchema = z.object({
  lens_type: z.string().min(1),
  aperture: z.string().min(1),
  shutter_speed: z.string().min(1)
})

const NegativeConstraintsSchema = z.object({
  forbidden_elements: z.array(z.string())
})

const PhotographySettingsSchema = z.object({
  shot_scale: z.string().min(1),
  depth_of_field: z.string().min(1)
})

const CompositionGuideSchema = z.object({
  keyword: z.string().min(1)
})

const ColorGradingSchema = z.object({
  tone: z.string().min(1)
})

const ArtDirectionDNASchema = z.object({
  lighting_scenario: LightingScenarioSchema,
  optical_mechanics: OpticalMechanicsSchema,
  negative_constraints: NegativeConstraintsSchema,
  photography_settings: PhotographySettingsSchema,
  composition_guide: CompositionGuideSchema,
  color_grading: ColorGradingSchema
})

// --- Product Analysis Schema ---
const ProductAnalysisSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  visual_description: z.string().min(10, 'Visual description too short'),
  key_features_zh: z.string().min(10, 'Key features too short'),
  extracted_colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')).optional(),
  intrinsic_dna: IntrinsicDNASchema
})

// --- Marketing Route Schema ---
const ImagePromptSchema = z.object({
  prompt_en: z.string().min(20, 'Prompt too short'),
  summary_zh: z.string().min(5, 'Summary too short')
})

const MarketingRouteSchema = z.object({
  route_name: z.string().min(1),
  headline_zh: z.string().min(1),
  subhead_zh: z.string().min(1),
  style_brief_zh: z.string().min(10),
  target_audience_zh: z.string().min(5),
  visual_elements_zh: z.string().min(10),
  art_direction_dna: ArtDirectionDNASchema,
  image_prompts: z.array(ImagePromptSchema).min(3, 'At least 3 image prompts required')
})

// --- Director Agent Response Schema ---
export const DirectorResponseSchema = z.object({
  product_analysis: ProductAnalysisSchema,
  marketing_routes: z.array(MarketingRouteSchema).min(3, 'At least 3 marketing routes required')
})

// --- Content Plan Schema ---
const ContentPlanItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['main_white', 'main_lifestyle', 'story_slide']),
  ratio: z.enum(['1:1', '9:16', '16:9']),
  title_zh: z.string().min(1),
  copy_zh: z.string().min(1),
  visual_summary_zh: z.string().min(1),
  visual_prompt_en: z.string().min(20, 'Prompt too short')
})

export const ContentPlanSchema = z.object({
  plan_name: z.string().min(1),
  items: z.array(ContentPlanItemSchema).min(1, 'At least 1 item required')
})

// --- Critic Feedback Schema ---
export const CriticFeedbackSchema = z.object({
  approved: z.boolean(),
  critique: z.string().min(1),
  score: z.number().min(0).max(100)
})

// --- Vision QA Schema ---
export const VisionQAResultSchema = z.object({
  pass: z.boolean(),
  reason: z.string().min(1)
})

// Type exports
export type DirectorResponse = z.infer<typeof DirectorResponseSchema>
export type ContentPlan = z.infer<typeof ContentPlanSchema>
export type CriticFeedback = z.infer<typeof CriticFeedbackSchema>
export type VisionQAResult = z.infer<typeof VisionQAResultSchema>

// Validation helper function
export function validateAgentResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  agentName: string
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
      return {
        success: false,
        error: `${agentName} response validation failed: ${errorMessages}`
      }
    }
    return {
      success: false,
      error: `${agentName} response validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
