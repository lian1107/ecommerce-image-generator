import type { ApiConfig, GenerationResult, GenerationSettings } from '@/types'
import { APP_CONFIG } from '@/config'

// OpenRouter / OpenAI format
// Image in OpenRouter response - matches official API format
export interface OpenRouterImage {
  type?: string  // "image_url"
  image_url?: {
    url: string
  }
  b64_json?: string
  url?: string
}

export interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
      images?: OpenRouterImage[]
    }
    finish_reason?: string
  }>
  error?: {
    code: number
    message: string
  }
}

// Google Native format
export interface GoogleResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
        inlineData?: {
          mimeType: string
          data: string
        }
      }>
    }
    finishReason?: string
  }>
  error?: {
    code: number
    message: string
    status: string
  }
}

export interface AnalyzeTextOptions {
  systemPrompt?: string
  userPrompt: string
  images?: string[]
}

export interface VisionQAOptions {
  image: string
  prompt: string
}

export interface GenerateImageOptions {
  prompt: string
  referenceImages?: string[] // base64 encoded images
  settings: GenerationSettings
  negativePrompt?: string
}

export type ApiProvider = 'google' | 'openrouter'

export class GeminiClient {
  private apiKey: string
  private baseUrl: string
  private model: string  // 向后兼容
  private analysisModel: string   // 图片分析Model
  private generationModel: string // 绘图创作Model
  private timeout: number

  // Helper to determine provider based on Base URL
  private get provider(): ApiProvider {
    if (this.baseUrl.includes('openrouter.ai')) return 'openrouter'
    return 'google'
  }

  constructor(config: Partial<ApiConfig> = {}) {
    this.apiKey = config.apiKey || ''
    this.baseUrl = config.baseUrl || APP_CONFIG.api.defaultBaseUrl
    this.model = config.model || APP_CONFIG.api.defaultModel
    // 双模型默认值
    this.analysisModel = APP_CONFIG.api.defaultImageAnalysisModel
    this.generationModel = APP_CONFIG.api.defaultImageGenerationModel
    this.timeout = APP_CONFIG.api.timeout
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url
  }

  // 向后兼容的 setModel
  setModel(model: string): void {
    this.model = model
    this.generationModel = model
  }

  // 设置图片分析模型
  setAnalysisModel(model: string): void {
    this.analysisModel = model
  }

  // 设置绘图创作模型
  setGenerationModel(model: string): void {
    this.generationModel = model
    this.model = model // 保持向后兼容
  }

  // 获取当前使用的分析模型
  getAnalysisModel(): string {
    return this.analysisModel
  }

  // 获取当前使用的生成模型
  getGenerationModel(): string {
    return this.generationModel
  }

  // Normalize model name based on provider
  private normalizeModelName(model: string): string {
    if (this.provider === 'openrouter') {
      // OpenRouter requires 'google/' prefix for Gemini models
      if (model.startsWith('gemini') && !model.startsWith('google/')) {
        return `google/${model}`
      }
      return model
    } else {
      // Google Native requires NO prefix
      if (model.startsWith('google/')) {
        return model.replace('google/', '')
      }
      return model
    }
  }

  // 获取指定模型的 endpoint
  private getEndpointForModel(modelName: string): string {
    const normalized = this.normalizeModelName(modelName)
    if (this.provider === 'openrouter') {
      return `${this.baseUrl}/chat/completions`
    }
    // Google Native
    return `${this.baseUrl}/models/${normalized}:generateContent?key=${this.apiKey}`
  }

  // Deprecated: Internal use only, relies on shared state
  private getEndpoint(): string {
    return this.getEndpointForModel(this.model)
  }

  async testConnection(): Promise<{ success: boolean; message: string; model?: string }> {
    if (!this.apiKey) {
      return { success: false, message: this.provider === 'openrouter' ? 'OpenRouter API Key 未配置' : 'Google API Key 未配置' }
    }

    try {
      if (this.provider === 'openrouter') {
        // OpenRouter Test
        const response = await fetch(
          `${this.baseUrl.replace(/\/chat\/completions$/, '').replace(/\/api\/v1$/, '/api/v1')}/models`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'HTTP-Referer': 'http://localhost:5173',
              'X-Title': encodeURIComponent(APP_CONFIG.appName),
              'Content-Type': 'application/json'
            }
          }
        )

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          return { success: false, message: error.error?.message || `OpenRouter 连接失败: ${response.status}` }
        }
        return { success: true, message: 'OpenRouter 连接成功', model: this.generationModel }

      } else {
        // Google Native Test
        const response = await fetch(
          `${this.baseUrl}/models?key=${this.apiKey}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        )

        if (!response.ok) {
          const error = await response.json()
          return { success: false, message: error.error?.message || `Google API 连接失败: ${response.status}` }
        }

        const data = await response.json()
        const hasImageModel = data.models?.some((m: { name: string }) =>
          m.name.includes('image') || m.name.includes('gemini')
        )
        return {
          success: true,
          message: hasImageModel ? 'Google API 连接成功' : 'API 连接成功 (未找到特定模型)',
          model: this.generationModel
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '网络连接失败'
      }
    }
  }

  /**
   * Analyze text/images for Agent Logic (Director, Planner)
   * 使用 analysisModel (图片分析Model)
   */
  async analyzeWithText(options: AnalyzeTextOptions): Promise<any> {
    const { systemPrompt, userPrompt, images } = options
    const targetModel = this.analysisModel // Use local variable

    // Construct the prompt
    let fullPrompt = userPrompt
    if (systemPrompt) {
      fullPrompt = `${systemPrompt}\n\nUser Input:\n${userPrompt}`
    }

    console.log(`[GeminiClient] analyzeWithText using analysisModel: ${targetModel}`)

    try {
      let responseData: any

      if (this.provider === 'openrouter') {
        // --- OpenRouter Format ---
        const content: any[] = []

        // Add images first if present
        if (images && images.length > 0) {
          for (const img of images) {
            content.push({
              type: 'image_url',
              image_url: { url: img }
            })
          }
        }

        // Add text prompt
        content.push({ type: 'text', text: fullPrompt })

        const requestBody = {
          model: this.normalizeModelName(targetModel),
          messages: [{ role: 'user', content }],
          temperature: 0.7,
          top_p: 0.95
        }

        const response = await fetch(this.getEndpointForModel(targetModel), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': encodeURIComponent(APP_CONFIG.appName)
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error?.message || 'Text analysis failed')
        }

        responseData = await response.json()
        const text = responseData.choices?.[0]?.message?.content || ''

        // Extract text from array content if needed
        let textContent = ''
        if (Array.isArray(text)) {
          for (const part of text) {
            if (part.type === 'text' && part.text) {
              textContent += part.text
            }
          }
        } else {
          textContent = text
        }

        // Attempt JSON Parse with safety checks
        try {
          // Try to extract JSON from code blocks first
          const codeBlockMatch = textContent.match(/```json\n([\s\S]*?)\n```/)
          if (codeBlockMatch && codeBlockMatch[1]) {
            try {
              return JSON.parse(codeBlockMatch[1])
            } catch (e) {
              console.warn('Failed to parse JSON from code block, trying other methods')
            }
          }

          // Try to match raw JSON object
          const jsonObjectMatch = textContent.match(/\{[\s\S]*\}/)
          if (jsonObjectMatch && jsonObjectMatch[0]) {
            try {
              return JSON.parse(jsonObjectMatch[0])
            } catch (e) {
              console.warn('Failed to parse raw JSON object, trying full text')
            }
          }

          // Try to parse entire content as JSON
          return JSON.parse(textContent)
        } catch (e) {
          console.warn('Failed to parse JSON from AI response, returning raw text', textContent.substring(0, 200))
          return textContent
        }

      } else {
        // --- Google Native Format ---
        const payload: any = {
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
          }
        }

        // Add images if present
        if (images && images.length > 0) {
          const parts = []
          for (const img of images) {
            const base64Data = img.replace(/^data:image\/\w+;base64,/, '')
            parts.push({
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            })
          }
          parts.push({ text: fullPrompt })
          payload.contents[0].parts = parts
        }

        const response = await fetch(this.getEndpointForModel(targetModel), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error?.message || 'Text analysis failed')
        }

        responseData = await response.json()
        const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text || ''

        // Attempt JSON Parse with safety checks
        try {
          // Try to extract JSON from code blocks first
          const codeBlockMatch = text.match(/```json\n([\s\S]*?)\n```/)
          if (codeBlockMatch && codeBlockMatch[1]) {
            try {
              return JSON.parse(codeBlockMatch[1])
            } catch (e) {
              console.warn('Failed to parse JSON from code block, trying other methods')
            }
          }

          // Try to match raw JSON object
          const jsonObjectMatch = text.match(/\{[\s\S]*\}/)
          if (jsonObjectMatch && jsonObjectMatch[0]) {
            try {
              return JSON.parse(jsonObjectMatch[0])
            } catch (e) {
              console.warn('Failed to parse raw JSON object, trying full text')
            }
          }

          // Try to parse entire content as JSON
          return JSON.parse(text)
        } catch (e) {
          console.warn('Failed to parse JSON from AI response, returning raw text', text.substring(0, 200))
          return text
        }
      }

    } catch (error) {
      console.error("Analysis Error:", error)
      throw error
    }
  }

  /**
   * Vision QA Analysis
   */
  async analyzeImage(image: string, prompt: string): Promise<{ pass: boolean; reason: string }> {
    try {
      const result = await this.analyzeWithText({
        userPrompt: prompt,
        images: [image]
      })

      // Expected result is JSON: { pass: boolean, reason: string }
      if (typeof result === 'object' && 'pass' in result) {
        return result
      }
      return { pass: false, reason: "Invalid QA Response Format" }
    } catch (e) {
      return { pass: false, reason: "QA Service Failed" }
    }
  }

  async generateImage(options: GenerateImageOptions): Promise<GenerationResult[]> {
    if (!this.apiKey) {
      throw new Error('API Key 未配置')
    }

    const targetModel = this.generationModel // Use local variable

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      let responseData: any

      if (this.provider === 'openrouter') {
        // --- OpenRouter Logic ---
        responseData = await this.generateOpenRouter(options, targetModel, controller.signal)
      } else {
        // --- Google Native Logic ---
        responseData = await this.generateGoogle(options, targetModel, controller.signal)
      }

      clearTimeout(timeoutId)
      return this.parseResponse(responseData, options.prompt, options.settings)

    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时，请重试')
      }
      throw error
    }
  }

  private async generateOpenRouter(options: GenerateImageOptions, model: string, signal: AbortSignal) {
    const { prompt, referenceImages } = options
    const messages: any[] = []

    const content: any[] = [{ type: 'text', text: prompt }]

    if (referenceImages && referenceImages.length > 0) {
      for (const imageData of referenceImages) {
        content.push({
          type: 'image_url',
          image_url: { url: imageData }
        })
      }
    }

    messages.push({ role: 'user', content })

    console.log(`[GeminiClient] generateOpenRouter using generationModel: ${model}`)

    const requestBody = {
      model: this.normalizeModelName(model),
      messages: messages,
      temperature: 1.0,
      top_p: 0.95,
      // Required for image generation
      modalities: ['text', 'image']
    }

    const response = await fetch(this.getEndpointForModel(model), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': encodeURIComponent(APP_CONFIG.appName)
      },
      body: JSON.stringify(requestBody),
      signal
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `OpenRouter Error: ${response.status}`)
    }

    return await response.json()
  }

  private async generateGoogle(options: GenerateImageOptions, model: string, signal: AbortSignal) {
    const { prompt, referenceImages } = options
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = []

    if (referenceImages && referenceImages.length > 0) {
      for (const imageData of referenceImages) {
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        })
      }
    }

    parts.push({ text: prompt })

    const requestBody = {
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'], // Assuming Gemini 2.0+ support
        temperature: 1.0,
        topP: 0.95,
        topK: 40
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
      ]
    }

    console.log(`[GeminiClient] generateGoogle using generationModel: ${model}`)

    const response = await fetch(this.getEndpointForModel(model), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `Google API Error: ${response.status}`)
    }

    return await response.json()
  }

  private parseResponse(
    response: any,
    prompt: string,
    settings: GenerationSettings
  ): GenerationResult[] {
    const results: GenerationResult[] = []

    if (this.provider === 'openrouter') {
      // --- Parse OpenRouter ---
      const openRouterResp = response as OpenRouterResponse
      if (!openRouterResp.choices?.length) throw new Error('API return no choices')

      const message = openRouterResp.choices[0].message
      const content = message?.content || ''
      const images = message?.images || []

      // Debug: log the FULL response to understand its structure
      console.log('=== OpenRouter Full Response ===')
      console.log('Full response:', JSON.stringify(response, null, 2).substring(0, 2000))
      console.log('Message keys:', message ? Object.keys(message) : 'no message')
      console.log('Images array:', images)
      console.log('Content:', typeof content === 'string' ? content.substring(0, 200) : content)

      // 0. First check message.images array (OpenRouter image generation format)
      if (images.length > 0) {
        for (const image of images) {
          let imageUrl = ''
          // Official format: image.image_url.url (snake_case)
          if (image.image_url?.url) {
            imageUrl = image.image_url.url
          } else if (image.url) {
            imageUrl = image.url
          } else if (image.b64_json) {
            imageUrl = `data:image/png;base64,${image.b64_json}`
          }
          if (imageUrl) {
            results.push(this.createResult(imageUrl, prompt, settings))
          }
        }
      }

      // 1. Check if content is an array (multimodal response with images)
      if (Array.isArray(content)) {
        for (const part of content) {
          // Check for image_url format (OpenRouter image response)
          if (part.type === 'image_url' && part.image_url?.url) {
            results.push(this.createResult(part.image_url.url, prompt, settings))
          }
        }
      }

      // 2. Check if content is a string
      if (typeof content === 'string' && content.length > 0) {
        // 2a. Try base64 data URLs first
        const base64Regex = /(data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+)/g
        let match
        while ((match = base64Regex.exec(content)) !== null) {
          results.push(this.createResult(match[1], prompt, settings))
        }

        // 2b. Try markdown images with data URLs
        const markdownDataRegex = /!\[.*?\]\((data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+)\)/g
        while ((match = markdownDataRegex.exec(content)) !== null) {
          results.push(this.createResult(match[1], prompt, settings))
        }

        // 2c. Try markdown images or HTTP URLs
        if (results.length === 0) {
          const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+\.(png|jpg|jpeg|webp|gif))/gi
          while ((match = imageRegex.exec(content)) !== null) {
            const imageUrl = match[1] || match[2]
            if (imageUrl && this.isValidImageUrl(imageUrl)) {
              results.push(this.createResult(imageUrl, prompt, settings))
            }
          }
        }

        // 2d. Fallback: Content itself is a URL
        if (results.length === 0 && content.trim().startsWith('http')) {
          results.push(this.createResult(content.trim(), prompt, settings))
        }
      }

      if (results.length === 0) {
        console.warn("OpenRouter returned content but no images found:", typeof content === 'string' ? content.substring(0, 100) : JSON.stringify(content).substring(0, 100))
        throw new Error('OpenRouter returned response but no images found. Check console for details.')
      }

    } else {
      // --- Parse Google Native ---
      const googleResp = response as GoogleResponse
      if (!googleResp.candidates?.length) throw new Error('Google API return no candidates')

      for (const candidate of googleResp.candidates) {
        if (!candidate.content?.parts) continue
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
            results.push(this.createResult(imageUrl, prompt, settings))
          }
        }
      }

      if (results.length === 0) {
        throw new Error('Google API did not return image data')
      }
    }

    return results
  }

  private isValidImageUrl(url: string): boolean {
    return !!url && (url.includes('png') || url.includes('jpg') || url.includes('webp') || url.includes('r2.dev') || url.includes('googleapis') || url.includes('generated'))
  }

  private createResult(imageUrl: string, prompt: string, settings: GenerationSettings): GenerationResult {
    return {
      id: this.generateId(),
      imageUrl,
      thumbnailUrl: imageUrl,
      prompt,
      settings,
      scene: 'studio-white',
      createdAt: new Date(),
      metadata: {
        width: this.getWidthFromAspectRatio(settings.aspectRatio),
        height: this.getHeightFromAspectRatio(settings.aspectRatio),
        model: this.model
      }
    }
  }

  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getWidthFromAspectRatio(ratio: string): number {
    const widths: Record<string, number> = {
      '1:1': 1024, '4:3': 1024, '3:4': 768, '16:9': 1280, '9:16': 720
    }
    return widths[ratio] || 1024
  }

  private getHeightFromAspectRatio(ratio: string): number {
    const heights: Record<string, number> = {
      '1:1': 1024, '4:3': 768, '3:4': 1024, '16:9': 720, '9:16': 1280
    }
    return heights[ratio] || 1024
  }

  // Batch generation with concurrency control
  async generateBatch(
    options: GenerateImageOptions,
    quantity: number,
    onProgress?: (current: number, total: number) => void
  ): Promise<GenerationResult[]> {
    const CONCURRENCY_LIMIT = 4 // Process 4 images concurrently
    const allResults: GenerationResult[] = []
    const errors: string[] = []
    let completed = 0

    // Create task queue
    const queue = Array.from({ length: quantity }, (_, i) => i)

    // Worker function that processes tasks from the queue
    const worker = async (): Promise<void> => {
      while (queue.length > 0) {
        // 检查是否已经收集够数量的图片
        if (allResults.length >= quantity) {
          break
        }

        const index = queue.shift()
        if (index === undefined) break

        try {
          const results = await this.generateImage(options)
          // 只取需要的数量，避免超出请求的数量
          const remaining = quantity - allResults.length
          const toAdd = results.slice(0, remaining)
          allResults.push(...toAdd)

          console.log(`Batch: API returned ${results.length} images, added ${toAdd.length}, total now ${allResults.length}/${quantity}`)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          console.error(`Batch generation error ${index + 1}:`, errorMsg)
          errors.push(errorMsg)
        }

        completed++
        onProgress?.(completed, quantity)

        // Add small delay to avoid rate limiting
        if (queue.length > 0 && allResults.length < quantity) {
          await this.delay(200)
        }
      }
    }

    // Create worker pool with concurrency limit
    const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, quantity) }, () => worker())

    // Wait for all workers to complete
    await Promise.allSettled(workers)

    if (allResults.length === 0 && errors.length > 0) {
      throw new Error(`生成失败: ${errors[0]}`)
    }

    // 确保只返回请求的数量
    const finalResults = allResults.slice(0, quantity)

    // Log performance summary
    console.log(`Batch generation completed: ${finalResults.length}/${quantity} succeeded, ${errors.length} failed`)

    return finalResults
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const geminiClient = new GeminiClient()
