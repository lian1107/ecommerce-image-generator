/**
 * 加密工具 - API Key 安全存储
 * 使用 Web Crypto API 进行加密
 */

/**
 * 生成基于用户指纹的密钥
 * 注意：这不是完全安全的，但比明文存储好得多
 */
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('ecommerce-image-gen-salt-2024'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 获取浏览器指纹作为密钥基础
 */
function getBrowserFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width + 'x' + screen.height,
    navigator.hardwareConcurrency || 0
  ]
  return components.join('|')
}

/**
 * 加密文本
 * @param plaintext - 明文
 * @returns 加密后的Base64字符串
 */
export async function encryptText(plaintext: string): Promise<string> {
  try {
    const fingerprint = getBrowserFingerprint()
    const key = await deriveKey(fingerprint)
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)

    // 生成随机 IV
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // 加密
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    )

    // 组合 IV 和密文
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encrypted), iv.length)

    // 转换为 Base64
    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('[Crypto] Encryption failed:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * 解密文本
 * @param encryptedBase64 - 加密的Base64字符串
 * @returns 解密后的明文
 */
export async function decryptText(encryptedBase64: string): Promise<string> {
  try {
    const fingerprint = getBrowserFingerprint()
    const key = await deriveKey(fingerprint)

    // 从 Base64 解码
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))

    // 提取 IV 和密文
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    // 解密
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encrypted
    )

    // 解码为文本
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('[Crypto] Decryption failed:', error)
    throw new Error('Failed to decrypt data - data may be corrupted')
  }
}

/**
 * 安全存储类
 * 提供加密的localStorage包装
 */
export class SecureStorage {
  private prefix: string

  constructor(prefix = 'secure_') {
    this.prefix = prefix
  }

  /**
   * 存储加密数据
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const encrypted = await encryptText(value)
      localStorage.setItem(this.prefix + key, encrypted)
    } catch (error) {
      console.error(`[SecureStorage] Failed to set ${key}:`, error)
      throw error
    }
  }

  /**
   * 读取并解密数据
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const encrypted = localStorage.getItem(this.prefix + key)
      if (!encrypted) return null

      return await decryptText(encrypted)
    } catch (error) {
      console.error(`[SecureStorage] Failed to get ${key}:`, error)
      // 如果解密失败，可能是数据损坏，删除它
      this.removeItem(key)
      return null
    }
  }

  /**
   * 删除数据
   */
  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  /**
   * 清空所有加密数据
   */
  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }

  /**
   * 检查key是否存在
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null
  }
}

/**
 * 全局安全存储实例
 */
export const secureStorage = new SecureStorage('enc_')

/**
 * API Key 特定的安全存储
 */
export class ApiKeyStorage {
  private storage: SecureStorage

  constructor() {
    this.storage = new SecureStorage('apikey_')
  }

  /**
   * 保存 API Key
   */
  async save(provider: string, apiKey: string): Promise<void> {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API Key cannot be empty')
    }

    // 警告：提醒用户不要在公共设备上使用
    if (!this.isPrivateDevice()) {
      console.warn('[Security] You appear to be on a public/shared device. API Keys will be stored encrypted but may still be at risk.')
    }

    await this.storage.setItem(provider, apiKey)
  }

  /**
   * 读取 API Key
   */
  async load(provider: string): Promise<string | null> {
    return await this.storage.getItem(provider)
  }

  /**
   * 删除 API Key
   */
  remove(provider: string): void {
    this.storage.removeItem(provider)
  }

  /**
   * 清空所有 API Keys
   */
  clear(): void {
    this.storage.clear()
  }

  /**
   * 检测是否为私人设备（启发式）
   */
  private isPrivateDevice(): boolean {
    // 简单的启发式检测
    // 检查是否有持久化存储权限
    if (navigator.storage && navigator.storage.estimate) {
      return true
    }
    // 检查是否在隐私模式
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      return true
    } catch {
      return false
    }
  }
}

/**
 * 全局 API Key 存储实例
 */
export const apiKeyStorage = new ApiKeyStorage()

/**
 * 混淆 API Key 显示
 * 用于UI显示，只显示前几位和后几位
 */
export function obfuscateApiKey(apiKey: string, showFirst = 6, showLast = 4): string {
  if (!apiKey || apiKey.length <= showFirst + showLast) {
    return apiKey
  }

  const first = apiKey.substring(0, showFirst)
  const last = apiKey.substring(apiKey.length - showLast)
  const middle = '*'.repeat(Math.min(apiKey.length - showFirst - showLast, 20))

  return `${first}${middle}${last}`
}

/**
 * 验证 API Key 格式（基本验证）
 */
export function validateApiKeyFormat(apiKey: string, provider: 'google' | 'openrouter'): boolean {
  if (!apiKey || typeof apiKey !== 'string') return false

  switch (provider) {
    case 'google':
      // Google API Key 格式: AIza...
      return /^AIza[0-9A-Za-z-_]{35}$/.test(apiKey)
    case 'openrouter':
      // OpenRouter API Key 格式: sk-or-v1-...
      return /^sk-or-v1-[0-9a-f]{64}$/.test(apiKey)
    default:
      return apiKey.length >= 20 // 最基本的长度检查
  }
}

export default {
  encryptText,
  decryptText,
  secureStorage,
  apiKeyStorage,
  obfuscateApiKey,
  validateApiKeyFormat
}
