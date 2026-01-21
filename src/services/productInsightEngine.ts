import { geminiClient } from './geminiClient'

export interface ProductInsight {
    categoryName: string          // AI 识别的类别名称
    mappedCategory: string        // 映射到系统的内部 Key
    primaryMaterial: string       // 主要材质
    surfaceTexture: string        // 表面纹理
    reflectiveness: string        // 反光程度
    colorPalette: string[]        // 主要颜色
    features: string[]            // 自动提取的卖点
    targetAudience: string        // 推测的目标人群
    predictedStyle: string        // 推测的设计风格
    suggestedScenes: string[]     // AI 推荐的最佳场景 Key
    generatedPrompts: string[]    // 直接可用的 Prompt 片段
}

export interface UserContext {
    name?: string
    description?: string
}

/**
 * 产品洞察引擎 (Product Insight Engine)
 * 结合视觉分析和用户输入，全面理解产品特征
 * 取代旧的 MaterialAnalyzer 和手动类别选择
 */
export class ProductInsightEngine {

    /**
     * 全自动分析产品图片
     * @param imageDataUrl 图片数据
     * @param context 用户提供的上下文 (名称、描述)
     */
    async analyze(imageDataUrl: string, context?: UserContext): Promise<ProductInsight> {
        const contextPrompt = context
            ? `用户提供的产品信息: 名称="${context.name || ''}", 描述="${context.description || ''}"。请结合这些信息和图片进行分析。`
            : '没有提供额外的产品文本信息。'

        const prompt = `你是一个专业的电商产品分析专家。请仔细分析这张产品图片，并结合用户上下文。

${contextPrompt}



请返回严格的 JSON 格式 (不要包含 Markdown 代码块标记)：

{
  "categoryName": "简短的产品类别名称 (英文)",
  "mappedCategory": "最接近的系统内部类别Key (electronics/fashion/home/beauty/toys/other)",
  "primaryMaterial": "主要材质",
  "surfaceTexture": "材质表面纹理描述 (英文)",
  "reflectiveness": "反光程度 (high/medium/low/none)",
  "colorPalette": ["主要颜色1", "主要颜色2"],
  "features": ["卖点1", "卖点2", "卖点3"],
  "targetAudience": "推测的目标受众",
  "predictedStyle": "设计风格",
  "suggestedScenes": ["推荐场景Key"],
  "generatedPrompts": ["Prompt 1", "Prompt 2"]
}

注意：
1. **Flaw Inversion Protocol (缺陷反转协议) ENABLED**:
   - 你是一个“产品美化专家”。你的任务是将用户拍摄的旧样品照片，转化为**全新出厂**的电商描述。
   - **主动检测并反转**:
     - 看到 "划痕 (scratches)" -> 必须描述为 "**flawless, pristine surface**"
     - 看到 "灰尘 (dust/dirt)" -> 必须描述为 "**clean, polished finish**"
     - 看到 "磨损 (wear)" -> 必须描述为 "**brand new, mint condition**"
     - 看到 "反光不均" -> 必须描述为 "**even studio lighting, smooth high-gloss**"
   - **绝对禁止**在 'features' 或 'generatedPrompts' 中出现以下词汇：
     - NO: scratched, scratches, damaged, old, used, worn, dusty, dirty, broken, cracked, fingerprint.
   - 如果产品看起来很旧，请描述它“原本应该有的样子”（理想状态）。



2. **Prompt 生成策略 (STRICT SCOPE - Subject Only, NO COLORS)**:
   - **禁止** 包含任何光照 (lighting), 场景 (background), 相机 (camera/lens), 分辨率 (4k/8k), 或 **颜色名称** 的描述。
   - **原因**: 颜色将由参考图像直接传递给模型，文字描述颜色会导致冲突。
   - **聚焦** 于产品主体 (Subject): 描述形状、材质、质感和完美状态。
   - **必须包含**: "pristine condition", "flawless execution", "mint condition", "factory-fresh" 等状态词。
   - **示例**: "Close-up of a smartwatch with smooth matte silicone strap and pristine glass screen, metallic accents, BRAND NEW condition."
   - **禁止**: 不要写具体颜色名称如 'teal', 'black', 'blue' 等。模型会从参考图像中学习颜色。
`

        try {
            console.log('[ProductInsightEngine] Analyzing product...', { hasContext: !!context })

            const result = await geminiClient.analyzeWithText({
                userPrompt: prompt,
                images: [imageDataUrl]
            })

            if (this.isValidInsight(result)) {
                console.log('[ProductInsightEngine] Analysis complete:', result)
                // 确保 mappedCategory 有效
                if (!['electronics', 'fashion', 'home', 'beauty', 'toys', 'other'].includes(result.mappedCategory)) {
                    result.mappedCategory = 'other'
                }
                return result
            }

            console.warn('[ProductInsightEngine] Invalid result format, using defaults')
            return this.getDefaultInsight()

        } catch (error) {
            console.error('[ProductInsightEngine] Analysis failed:', error)
            return this.getDefaultInsight()
        }
    }

    private isValidInsight(result: any): result is ProductInsight {
        return (
            result &&
            typeof result.categoryName === 'string' &&
            typeof result.mappedCategory === 'string' &&
            Array.isArray(result.features) &&
            Array.isArray(result.generatedPrompts)
        )
    }

    private getDefaultInsight(): ProductInsight {
        return {
            categoryName: 'General Product',
            mappedCategory: 'other',
            primaryMaterial: 'other',
            surfaceTexture: 'clean surface',
            reflectiveness: 'medium',
            colorPalette: [],
            features: [],
            targetAudience: 'General consumers',
            predictedStyle: 'Modern',
            suggestedScenes: ['studio-white'],
            generatedPrompts: ['professional product photography']
        }
    }
}

export const productInsightEngine = new ProductInsightEngine()
