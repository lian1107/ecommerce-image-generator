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
  private model: string
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
    this.timeout = APP_CONFIG.api.timeout
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url
  }

  setModel(model: string): void {
    this.model = model
  }

  private getEndpoint(): string {
    if (this.provider === 'openrouter') {
      return `${this.baseUrl}/chat/completions`
    }
    // Google Native
    return `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`
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
        return { success: true, message: 'OpenRouter 连接成功', model: this.model }

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
          model: this.model
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '网络连接失败'
      }
    }
  }

  async generateImage(options: GenerateImageOptions): Promise<GenerationResult[]> {
    if (!this.apiKey) {
      throw new Error('API Key 未配置')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      let responseData: any

      if (this.provider === 'openrouter') {
        // --- OpenRouter Logic ---
        responseData = await this.generateOpenRouter(options, controller.signal)
      } else {
        // --- Google Native Logic ---
        responseData = await this.generateGoogle(options, controller.signal)
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

  private async generateOpenRouter(options: GenerateImageOptions, signal: AbortSignal) {
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

    const requestBody = {
      model: this.model,
      messages: messages,
      temperature: 1.0,
      top_p: 0.95,
      // Required for image generation
      modalities: ['text', 'image']
    }

    const response = await fetch(this.getEndpoint(), {
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

  private async generateGoogle(options: GenerateImageOptions, signal: AbortSignal) {
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
      }
    }

    const response = await fetch(this.getEndpoint(), {
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

  // Keep batch support
  async generateBatch(
    options: GenerateImageOptions,
    quantity: number,
    onProgress?: (current: number, total: number) => void
  ): Promise<GenerationResult[]> {
    const allResults: GenerationResult[] = []
    const errors: string[] = []

    for (let i = 0; i < quantity; i++) {
      onProgress?.(i + 1, quantity)
      try {
        const results = await this.generateImage(options)
        allResults.push(...results)
      } catch (error) {
        console.error(`Batch generation error ${i + 1}:`, error)
        errors.push(error instanceof Error ? error.message : 'Unknown error')
      }
      if (i < quantity - 1) await this.delay(500)
    }

    if (allResults.length === 0 && errors.length > 0) {
      throw new Error(`生成失败: ${errors[0]}`)
    }

    return allResults
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const geminiClient = new GeminiClient()
