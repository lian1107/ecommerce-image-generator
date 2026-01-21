/**
 * XSS 防护工具
 * 清理用户输入，防止跨站脚本攻击
 */

/**
 * HTML 实体编码映射表
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
}

/**
 * 转义 HTML 特殊字符
 * @param str - 需要转义的字符串
 * @returns 转义后的安全字符串
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return ''
  return str.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * 反转义 HTML 实体
 * @param str - 需要反转义的字符串
 * @returns 反转义后的字符串
 */
export function unescapeHtml(str: string): string {
  if (typeof str !== 'string') return ''

  const reverseEntities: Record<string, string> = {}
  for (const [key, value] of Object.entries(HTML_ENTITIES)) {
    reverseEntities[value] = key
  }

  return str.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, (entity) =>
    reverseEntities[entity] || entity
  )
}

/**
 * 清理用户输入文本
 * 移除潜在危险字符但保持可读性
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return ''

  return text
    // 移除 null 字符
    .replace(/\0/g, '')
    // 移除控制字符（保留换行和制表符）
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // 移除 Unicode 双向覆盖字符（防止视觉欺骗）
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
    // 限制连续换行
    .replace(/\n{4,}/g, '\n\n\n')
    // 移除前后空白
    .trim()
}

/**
 * 清理URL，防止 javascript: 和 data: 协议
 * @param url - 需要清理的URL
 * @returns 安全的URL或空字符串
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return ''

  const trimmed = url.trim().toLowerCase()

  // 检查危险协议
  const dangerousProtocols = [
    'javascript:',
    'data:text/html',
    'vbscript:',
    'file:',
    'about:'
  ]

  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return ''
    }
  }

  // 允许的协议
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:image']
  const hasAllowedProtocol = allowedProtocols.some(protocol =>
    trimmed.startsWith(protocol)
  )

  // 相对路径也允许
  if (hasAllowedProtocol || trimmed.startsWith('/') || trimmed.startsWith('./')) {
    return url.trim()
  }

  return ''
}

/**
 * 清理 JSON 字符串，防止注入
 * @param jsonString - JSON字符串
 * @returns 安全的JSON字符串
 */
export function sanitizeJson(jsonString: string): string {
  if (typeof jsonString !== 'string') return '{}'

  try {
    // 尝试解析并重新序列化
    const parsed = JSON.parse(jsonString)
    return JSON.stringify(parsed)
  } catch {
    return '{}'
  }
}

/**
 * 深度清理对象中的所有字符串值
 * @param obj - 需要清理的对象
 * @param options - 清理选项
 * @returns 清理后的对象
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: {
    escapeHtml?: boolean
    sanitizeUrls?: boolean
    maxDepth?: number
  } = {}
): T {
  const {
    escapeHtml: shouldEscapeHtml = true,
    sanitizeUrls: shouldSanitizeUrls = true,
    maxDepth = 10
  } = options

  function sanitizeValue(value: any, depth: number): any {
    if (depth > maxDepth) return value

    if (typeof value === 'string') {
      let result = sanitizeText(value)
      if (shouldEscapeHtml) {
        result = escapeHtml(result)
      }
      return result
    }

    if (Array.isArray(value)) {
      return value.map(item => sanitizeValue(item, depth + 1))
    }

    if (value !== null && typeof value === 'object') {
      const sanitized: Record<string, any> = {}
      for (const [key, val] of Object.entries(value)) {
        const sanitizedKey = sanitizeText(key)
        sanitized[sanitizedKey] = sanitizeValue(val, depth + 1)
      }
      return sanitized
    }

    return value
  }

  return sanitizeValue(obj, 0) as T
}

/**
 * 安全的 innerHTML 替代方案
 * 使用 textContent 或 createElement 代替
 */
export function safeSetInnerHTML(element: HTMLElement, content: string): void {
  // 清空元素
  element.textContent = ''

  // 解析并创建安全的DOM节点
  const escapedContent = escapeHtml(content)
  element.textContent = escapedContent
}

/**
 * 创建安全的文本节点
 */
export function createSafeTextNode(text: string): Text {
  return document.createTextNode(sanitizeText(text))
}

/**
 * 验证并清理文件名
 * @param filename - 文件名
 * @returns 安全的文件名
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return 'file'

  return filename
    // 移除路径分隔符
    .replace(/[/\\]/g, '')
    // 移除特殊字符
    .replace(/[<>:"|?*\x00-\x1F]/g, '')
    // 移除前后空白和点
    .replace(/^[\s.]+|[\s.]+$/g, '')
    // 限制长度
    .substring(0, 255)
    || 'file' // 如果清理后为空，使用默认名
}

/**
 * Content Security Policy 策略生成器
 * 用于配置 CSP 头部
 */
export function generateCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Vue需要eval
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://generativelanguage.googleapis.com https://openrouter.ai",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}

/**
 * 检测潜在的XSS攻击
 * @param input - 用户输入
 * @returns 是否可能包含XSS攻击
 */
export function detectXSS(input: string): boolean {
  if (typeof input !== 'string') return false

  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick=, onerror=, etc.
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<img[^>]+src[^>]*>/gi,
    /eval\(/gi,
    /expression\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi
  ]

  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * 生成随机 nonce 用于 CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

export default {
  escapeHtml,
  unescapeHtml,
  sanitizeText,
  sanitizeUrl,
  sanitizeJson,
  sanitizeObject,
  safeSetInnerHTML,
  createSafeTextNode,
  sanitizeFilename,
  generateCSP,
  detectXSS,
  generateNonce
}
