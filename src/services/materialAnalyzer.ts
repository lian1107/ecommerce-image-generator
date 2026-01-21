import type { MaterialAnalysisResult } from '@/types'
import { geminiClient } from './geminiClient'

/**
 * 材质分析服务
 * 使用 AI 智能识别产品图片的材质特征，生成准确的 prompt 增强词
 * 使用 analysisModel (图片分析Model) 进行分析
 */
export class MaterialAnalyzer {
    /**
     * 分析产品图片的材质特征
     * @param imageDataUrl - 产品图片的 base64 data URL
     * @returns 材质分析结果
     */
    async analyze(imageDataUrl: string): Promise<MaterialAnalysisResult> {
        const prompt = `你是一个专业的产品摄影师和材质分析专家。请仔细分析这张产品图片的材质特征。

请返回以下 JSON 格式（不要包含任何其他文字，只返回纯 JSON）：

{
  "primaryMaterial": "材质类型，只能是以下之一: metal, plastic, fabric, glass, wood, ceramic, leather, rubber, paper, other",
  "surfaceTexture": "表面纹理的简短英文描述，例如: smooth matte finish, brushed aluminum, soft cotton weave",
  "reflectiveness": "反光程度，只能是: high, medium, low, none",
  "colorPalette": ["主色1", "主色2", "主色3"],
  "suggestedPrompts": [
    "针对这个材质的专业摄影描述1",
    "针对这个材质的专业摄影描述2", 
    "针对这个材质的专业摄影描述3"
  ]
}

suggestedPrompts 示例：
- 对于金属产品: "sleek metallic surface", "reflective chrome finish", "precision machined edges"
- 对于布料产品: "soft fabric texture", "natural cotton weave", "comfortable textile material"
- 对于木质产品: "natural wood grain", "warm timber tones", "organic wood texture"
- 对于玻璃产品: "crystal clear transparency", "smooth glass surface", "elegant glass finish"
- 对于塑料产品: "clean plastic housing", "modern polymer finish", "durable ABS material"

请针对图片中产品的实际材质给出准确的描述，不要假设材质。`

        try {
            console.log('[MaterialAnalyzer] Analyzing product material...')

            const result = await geminiClient.analyzeWithText({
                userPrompt: prompt,
                images: [imageDataUrl]
            })

            // 验证返回结果格式
            if (this.isValidResult(result)) {
                console.log('[MaterialAnalyzer] Analysis complete:', result)
                return result as MaterialAnalysisResult
            }

            // 如果返回格式不正确，返回默认值
            console.warn('[MaterialAnalyzer] Invalid result format, using defaults')
            return this.getDefaultResult()

        } catch (error) {
            console.error('[MaterialAnalyzer] Analysis failed:', error)
            return this.getDefaultResult()
        }
    }

    /**
     * 验证分析结果格式是否正确
     */
    private isValidResult(result: any): result is MaterialAnalysisResult {
        return (
            result &&
            typeof result === 'object' &&
            typeof result.primaryMaterial === 'string' &&
            typeof result.surfaceTexture === 'string' &&
            typeof result.reflectiveness === 'string' &&
            Array.isArray(result.colorPalette) &&
            Array.isArray(result.suggestedPrompts)
        )
    }

    /**
     * 获取默认分析结果（当分析失败时使用）
     */
    private getDefaultResult(): MaterialAnalysisResult {
        return {
            primaryMaterial: 'other',
            surfaceTexture: 'product surface',
            reflectiveness: 'medium',
            colorPalette: [],
            suggestedPrompts: [
                'professional product photography',
                'clean product shot',
                'commercial quality image'
            ]
        }
    }

    /**
     * 根据材质类型获取推荐的场景
     */
    getRecommendedScenes(material: string): string[] {
        const sceneMap: Record<string, string[]> = {
            metal: ['studio-white', 'minimalist', 'luxury'],
            plastic: ['studio-white', 'lifestyle', 'minimalist'],
            fabric: ['lifestyle', 'studio-white', 'seasonal'],
            glass: ['luxury', 'minimalist', 'studio-white'],
            wood: ['lifestyle', 'minimalist', 'outdoor'],
            ceramic: ['lifestyle', 'studio-white', 'luxury'],
            leather: ['luxury', 'lifestyle', 'minimalist'],
            rubber: ['outdoor', 'lifestyle', 'studio-white'],
            paper: ['lifestyle', 'minimalist', 'studio-white'],
            other: ['studio-white', 'lifestyle', 'minimalist']
        }

        return sceneMap[material] || sceneMap['other']
    }
}

// 导出单例实例
export const materialAnalyzer = new MaterialAnalyzer()
