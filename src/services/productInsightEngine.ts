import { geminiClient } from './geminiClient'

// 场景特定描述类型
export interface SceneDescriptions {
    'studio-white': string    // 纯白棚拍：强调产品本身细节
    'lifestyle': string       // 生活场景：强调使用场景
    'outdoor': string         // 户外场景：强调耐用/运动属性
    'seasonal': string        // 节日主题：强调送礼/节日氛围
    'luxury': string          // 高端奢华：强调品质/工艺
    'minimalist': string      // 极简风格：强调设计/简约美
}

// [NEW] 产品尺寸类别 - 用于比例控制
export type ProductSizeCategory = 'pocket' | 'palm' | 'handheld' | 'tabletop' | 'desktop' | 'furniture' | 'large'

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
    generatedPrompts: string[]    // 直接可用的 Prompt 片段（通用版本）
    sceneDescriptions: SceneDescriptions  // [NEW] 场景特定的产品描述
    // [NEW] 产品尺寸信息 - 用于比例控制
    sizeCategory: ProductSizeCategory     // 尺寸类别
    sizeReference: string                 // 尺寸参照描述 (e.g., "fits in palm", "smartphone-sized")
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
  "mappedCategory": "最接近的系统内部类别Key，只能从以下选项中选择一个：electronics(数码电子)/fashion(服装服饰)/beauty(美妆护肤)/home(家居家装)/food(食品饮料)/sports(运动户外)/jewelry(珠宝首饰)/baby(母婴用品)/office(办公文具)",
  "primaryMaterial": "主要材质",
  "surfaceTexture": "材质表面纹理描述 (英文)",
  "reflectiveness": "反光程度 (high/medium/low/none)",
  "colorPalette": ["主要颜色1", "主要颜色2"],
  "features": ["卖点1", "卖点2", "卖点3"],
  "targetAudience": "推测的目标受众",
  "predictedStyle": "设计风格",
  "suggestedScenes": ["推荐场景Key"],
  "generatedPrompts": ["通用Prompt"],
  "sceneDescriptions": {
    "studio-white": "纯白棚拍版本 - 强调产品本身的材质、工艺、细节",
    "lifestyle": "生活场景版本 - 强调产品在日常生活中的使用体验和温馨感",
    "outdoor": "户外场景版本 - 强调产品的耐用性、运动属性、探险精神",
    "seasonal": "节日主题版本 - 强调产品作为礼物的价值、节日氛围、惊喜感",
    "luxury": "高端奢华版本 - 强调产品的高端品质、精湛工艺、奢华感",
    "minimalist": "极简风格版本 - 强调产品的简约设计、现代美学、功能性"
  },
  "sizeCategory": "从以下选项选择: pocket/palm/handheld/tabletop/desktop/furniture/large",
  "sizeReference": "自然语言描述产品尺寸，用于比例参照"
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



2. **Prompt 生成策略 (Natural Language, Product-Focused)**:
   - Generate prompts using **natural, descriptive English sentences** (not keyword lists)
   - Focus primarily on product characteristics: shape, material, texture, surface finish, condition
   - Use complete sentences with descriptive phrases
   - Include quality descriptors: "pristine", "flawless finish", "premium quality", "mint condition", "factory-fresh"
   - **IMPORTANT**: DO NOT specify exact color names (like 'teal', 'black', 'blue') as colors will be learned from reference images
   - Avoid technical resolution terms (4K/8K) - the system will add these automatically

3. **Scene-Specific Descriptions (场景特定描述) - CRITICAL**:
   - For EACH scene in "sceneDescriptions", generate a UNIQUE product description tailored to that scene's mood and purpose
   - Each description should be 1-2 sentences in English, focusing on DIFFERENT aspects of the product:
     - **studio-white**: Focus on product details, materials, craftsmanship, pristine condition (e.g., "A sleek smartwatch with brushed titanium case and flawless sapphire glass display")
     - **lifestyle**: Focus on usage experience, comfort, daily life integration (e.g., "A comfortable smartwatch that seamlessly fits into your daily routine")
     - **outdoor**: Focus on durability, adventure, active lifestyle (e.g., "A rugged smartwatch built to withstand outdoor adventures")
     - **seasonal**: Focus on gift-giving, celebration, emotional value (e.g., "A perfect gift smartwatch that brings joy to any special occasion")
     - **luxury**: Focus on premium quality, exclusivity, refined aesthetics (e.g., "An exquisite smartwatch showcasing masterful craftsmanship and premium materials")
     - **minimalist**: Focus on clean design, modern aesthetics, essential functionality (e.g., "A beautifully minimal smartwatch with clean lines and thoughtful design")
   - **DO NOT** include lighting, camera angles, or scene descriptions - only describe the PRODUCT itself from different perspectives

4. **Product Size Analysis (产品尺寸分析) - IMPORTANT FOR REALISTIC SCALE**:
   - Analyze the product's physical size based on visual cues and product type
   - **sizeCategory** - Choose ONE from:
     - "pocket": Very small, fits in pocket (earbuds, USB drive, lipstick, key chain)
     - "palm": Fits in palm of hand (smartphone, small cosmetic bottle, power bank, mini fan)
     - "handheld": Held in one or two hands (tablet, book, water bottle, small speaker)
     - "tabletop": Sits on table, smaller than furniture (lamp, coffee maker, small plant, desk organizer)
     - "desktop": Larger tabletop items (monitor, printer, large vase)
     - "furniture": Furniture-sized (chair, small table, floor lamp)
     - "large": Very large items (sofa, bed, large appliances)
   - **sizeReference** - Write a natural English phrase describing relative size:
     - Examples: "fits comfortably in one palm", "about the size of a smartphone", "small enough to carry in a pocket", "a compact desktop accessory"
   - This helps AI generate images with REALISTIC product proportions in lifestyle scenes
`

        try {
            console.log('[ProductInsightEngine] Analyzing product...', { hasContext: !!context })

            const result = await geminiClient.analyzeWithText({
                userPrompt: prompt,
                images: [imageDataUrl]
            })

            if (this.isValidInsight(result)) {
                console.log('[ProductInsightEngine] Analysis complete:', result)
                // 确保 mappedCategory 有效 - 与 categories.ts 中的 ID 保持一致
                const validCategories = ['electronics', 'fashion', 'beauty', 'home', 'food', 'sports', 'jewelry', 'baby', 'office']
                if (!validCategories.includes(result.mappedCategory)) {
                    console.warn(`[ProductInsightEngine] Invalid category "${result.mappedCategory}", defaulting to "electronics"`)
                    result.mappedCategory = 'electronics' // 默认使用电子产品类别，因为它最通用
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
        const isBasicValid = (
            result &&
            typeof result.categoryName === 'string' &&
            typeof result.mappedCategory === 'string' &&
            Array.isArray(result.features) &&
            Array.isArray(result.generatedPrompts)
        )

        // 如果缺少 sceneDescriptions，自动补充默认值
        if (isBasicValid && !result.sceneDescriptions) {
            result.sceneDescriptions = this.generateDefaultSceneDescriptions(result)
        }

        // 如果缺少尺寸信息，自动补充默认值
        if (isBasicValid) {
            const validSizes = ['pocket', 'palm', 'handheld', 'tabletop', 'desktop', 'furniture', 'large']
            if (!result.sizeCategory || !validSizes.includes(result.sizeCategory)) {
                result.sizeCategory = this.inferSizeFromCategory(result.mappedCategory)
            }
            if (!result.sizeReference || typeof result.sizeReference !== 'string') {
                result.sizeReference = this.getDefaultSizeReference(result.sizeCategory)
            }
        }

        return isBasicValid
    }

    /**
     * 根据产品类别推断默认尺寸
     */
    private inferSizeFromCategory(category: string): ProductSizeCategory {
        const categoryToSize: Record<string, ProductSizeCategory> = {
            'electronics': 'handheld',
            'fashion': 'handheld',
            'beauty': 'palm',
            'home': 'tabletop',
            'food': 'handheld',
            'sports': 'handheld',
            'jewelry': 'pocket',
            'baby': 'handheld',
            'office': 'handheld'
        }
        return categoryToSize[category] || 'handheld'
    }

    /**
     * 获取尺寸类别的默认参照描述
     */
    private getDefaultSizeReference(sizeCategory: ProductSizeCategory): string {
        const sizeReferences: Record<ProductSizeCategory, string> = {
            'pocket': 'a compact pocket-sized item',
            'palm': 'fits comfortably in one palm',
            'handheld': 'a handheld product easy to carry',
            'tabletop': 'a tabletop item of moderate size',
            'desktop': 'a desktop-sized product',
            'furniture': 'a furniture-scale item',
            'large': 'a large product'
        }
        return sizeReferences[sizeCategory] || 'a handheld product'
    }

    /**
     * 基于通用描述生成默认的场景描述
     */
    private generateDefaultSceneDescriptions(result: any): SceneDescriptions {
        const basePrompt = result.generatedPrompts?.[0] || 'professional product'
        return {
            'studio-white': basePrompt,
            'lifestyle': basePrompt,
            'outdoor': basePrompt,
            'seasonal': basePrompt,
            'luxury': basePrompt,
            'minimalist': basePrompt
        }
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
            generatedPrompts: ['professional product photography'],
            sceneDescriptions: {
                'studio-white': 'a professional product with clean finish and precise details',
                'lifestyle': 'a versatile product designed for everyday comfort and use',
                'outdoor': 'a durable product built for active outdoor adventures',
                'seasonal': 'a thoughtful gift that brings joy to any celebration',
                'luxury': 'a premium product showcasing exceptional quality and craftsmanship',
                'minimalist': 'a beautifully designed product with clean modern aesthetics'
            },
            sizeCategory: 'handheld',
            sizeReference: 'a compact handheld product'
        }
    }
}

export const productInsightEngine = new ProductInsightEngine()
