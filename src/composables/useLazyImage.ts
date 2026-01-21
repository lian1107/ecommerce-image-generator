/**
 * 图片懒加载 Composable
 * 使用 IntersectionObserver API 实现高性能懒加载
 */

import { ref, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'

export interface LazyImageOptions {
  /** 根元素边距，提前加载图片 */
  rootMargin?: string
  /** 可见阈值 (0-1) */
  threshold?: number
  /** 占位图 */
  placeholder?: string
  /** 加载失败时的图片 */
  fallback?: string
}

export interface LazyImageState {
  /** 当前显示的图片URL */
  currentSrc: Ref<string>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误状态 */
  error: Ref<boolean>
  /** 是否已加载 */
  loaded: Ref<boolean>
}

/**
 * 图片懒加载 Hook
 * @param src - 图片源地址
 * @param options - 配置选项
 * @returns 懒加载状态和方法
 */
export function useLazyImage(
  src: Ref<string> | string,
  options: LazyImageOptions = {}
): LazyImageState {
  const {
    rootMargin = '50px',
    threshold = 0.01,
    placeholder = '',
    fallback = ''
  } = options

  const currentSrc = ref(placeholder)
  const loading = ref(true)
  const error = ref(false)
  const loaded = ref(false)

  const imageRef = ref<HTMLImageElement | null>(null)
  const observer = ref<IntersectionObserver | null>(null)

  const srcValue = typeof src === 'string' ? ref(src) : src

  const loadImage = () => {
    if (loaded.value || loading.value || !srcValue.value) return

    loading.value = true
    error.value = false

    const img = new Image()

    img.onload = () => {
      currentSrc.value = srcValue.value
      loading.value = false
      loaded.value = true
      error.value = false
    }

    img.onerror = () => {
      loading.value = false
      error.value = true
      if (fallback) {
        currentSrc.value = fallback
      }
    }

    img.src = srcValue.value
  }

  const setupObserver = (el: HTMLElement) => {
    if (!('IntersectionObserver' in window)) {
      // 不支持 IntersectionObserver，直接加载
      loadImage()
      return
    }

    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage()
            // 加载后取消观察
            if (observer.value && imageRef.value) {
              observer.value.unobserve(imageRef.value)
            }
          }
        })
      },
      {
        rootMargin,
        threshold
      }
    )

    imageRef.value = el as HTMLImageElement
    observer.value.observe(el)
  }

  const cleanup = () => {
    if (observer.value && imageRef.value) {
      observer.value.unobserve(imageRef.value)
      observer.value.disconnect()
      observer.value = null
    }
  }

  // 监听 src 变化
  watch(srcValue, (newSrc) => {
    if (newSrc && newSrc !== currentSrc.value) {
      loaded.value = false
      loading.value = false
      error.value = false
      currentSrc.value = placeholder

      // 如果元素已在视图中，立即加载新图片
      if (imageRef.value) {
        loadImage()
      }
    }
  })

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    currentSrc,
    loading,
    error,
    loaded
  }
}

/**
 * 简化版图片懒加载指令
 * 用于 v-lazy 指令
 */
export const lazyImageDirective = {
  mounted(el: HTMLImageElement, binding: { value: string }) {
    if (!('IntersectionObserver' in window)) {
      el.src = binding.value
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = binding.value

            img.src = src
            img.classList.add('lazy-loading')

            img.onload = () => {
              img.classList.remove('lazy-loading')
              img.classList.add('lazy-loaded')
            }

            img.onerror = () => {
              img.classList.remove('lazy-loading')
              img.classList.add('lazy-error')
            }

            observer.unobserve(img)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    )

    observer.observe(el)

    // 保存 observer 以便清理
    ;(el as any).__lazyObserver__ = observer
  },

  unmounted(el: HTMLImageElement) {
    const observer = (el as any).__lazyObserver__
    if (observer) {
      observer.disconnect()
      delete (el as any).__lazyObserver__
    }
  }
}

/**
 * 批量图片预加载
 * 用于预加载关键图片
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  const promises = urls.map((url) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  })

  return Promise.all(promises)
}

/**
 * 渐进式图片加载
 * 先加载低质量，再加载高质量
 */
export function useProgressiveImage(
  lowQualitySrc: string,
  highQualitySrc: string
) {
  const currentSrc = ref(lowQualitySrc)
  const loading = ref(true)
  const loaded = ref(false)

  onMounted(() => {
    // 立即显示低质量图片
    currentSrc.value = lowQualitySrc

    // 后台加载高质量图片
    const img = new Image()
    img.onload = () => {
      currentSrc.value = highQualitySrc
      loading.value = false
      loaded.value = true
    }
    img.onerror = () => {
      loading.value = false
    }
    img.src = highQualitySrc
  })

  return {
    currentSrc,
    loading,
    loaded
  }
}
