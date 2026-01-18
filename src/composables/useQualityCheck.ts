import { ref } from 'vue'
import type { QualityCheckResult, UploadedImage } from '@/types'
import { APP_CONFIG } from '@/config'

export function useQualityCheck() {
  const isChecking = ref(false)
  const lastResult = ref<QualityCheckResult | null>(null)

  const checkImage = async (image: UploadedImage): Promise<QualityCheckResult> => {
    isChecking.value = true

    try {
      const img = new Image()
      img.src = image.preview

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('图片加载失败'))
      })

      const aspectRatio = img.width / img.height
      const isWhiteBackground = await checkWhiteBackground(img)
      const minResolution = Math.min(img.width, img.height)

      const result: QualityCheckResult = {
        passed: true,
        checks: {
          aspectRatio: {
            passed: aspectRatio >= 0.5 && aspectRatio <= 2,
            value: aspectRatio,
            recommended: aspectRatio < 1 ? '3:4 或 1:1' : '4:3 或 1:1'
          },
          whiteBackground: {
            passed: true, // Not a hard requirement
            confidence: isWhiteBackground ? 0.9 : 0.3
          },
          resolution: {
            passed: minResolution >= APP_CONFIG.upload.minWidth,
            width: img.width,
            height: img.height,
            minRequired: APP_CONFIG.upload.minWidth
          },
          fileSize: {
            passed: image.size <= APP_CONFIG.upload.maxFileSize,
            size: image.size,
            maxAllowed: APP_CONFIG.upload.maxFileSize
          }
        },
        suggestions: []
      }

      // Generate suggestions
      if (!result.checks.aspectRatio.passed) {
        result.suggestions.push(
          `图片比例 (${aspectRatio.toFixed(2)}) 可能不太适合电商展示，建议使用 ${result.checks.aspectRatio.recommended}`
        )
      }

      if (!result.checks.resolution.passed) {
        result.suggestions.push(
          `图片分辨率较低 (${img.width}×${img.height})，建议使用至少 ${APP_CONFIG.upload.minWidth}×${APP_CONFIG.upload.minHeight} 的图片`
        )
      }

      if (result.checks.whiteBackground.confidence < 0.5) {
        result.suggestions.push(
          '图片似乎没有白色背景，如需电商主图效果，建议使用白底图片'
        )
      }

      // Determine overall pass status
      result.passed =
        result.checks.aspectRatio.passed &&
        result.checks.resolution.passed &&
        result.checks.fileSize.passed

      lastResult.value = result
      return result
    } finally {
      isChecking.value = false
    }
  }

  const checkWhiteBackground = async (img: HTMLImageElement): Promise<boolean> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return false

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    // Sample corners
    const cornerSize = Math.min(20, Math.floor(img.width * 0.05))
    const corners = [
      [0, 0], // top-left
      [img.width - cornerSize, 0], // top-right
      [0, img.height - cornerSize], // bottom-left
      [img.width - cornerSize, img.height - cornerSize] // bottom-right
    ]

    let whitePixelCount = 0
    let totalPixels = 0

    for (const [x, y] of corners) {
      const imageData = ctx.getImageData(x, y, cornerSize, cornerSize)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Check if pixel is close to white (RGB > 240)
        if (r > 240 && g > 240 && b > 240) {
          whitePixelCount++
        }
        totalPixels++
      }
    }

    // If more than 70% of corner pixels are white, consider it white background
    return (whitePixelCount / totalPixels) > 0.7
  }

  const checkAspectRatio = (width: number, height: number): {
    ratio: number
    isSquare: boolean
    isPortrait: boolean
    isLandscape: boolean
    recommendation: string
  } => {
    const ratio = width / height

    return {
      ratio,
      isSquare: Math.abs(ratio - 1) < 0.1,
      isPortrait: ratio < 0.9,
      isLandscape: ratio > 1.1,
      recommendation:
        ratio < 0.75 ? '9:16 竖屏'
          : ratio < 0.9 ? '3:4 纵向'
            : ratio < 1.1 ? '1:1 正方形'
              : ratio < 1.4 ? '4:3 横向'
                : '16:9 宽屏'
    }
  }

  const getQualityLevel = (width: number, height: number): 'low' | 'medium' | 'high' => {
    const pixels = width * height
    if (pixels >= 4000000) return 'high'    // >= 4MP
    if (pixels >= 1000000) return 'medium'  // >= 1MP
    return 'low'
  }

  return {
    isChecking,
    lastResult,
    checkImage,
    checkWhiteBackground,
    checkAspectRatio,
    getQualityLevel
  }
}
