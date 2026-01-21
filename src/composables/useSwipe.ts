/**
 * 触摸手势 Composable - 支持滑动切换
 * 用于移动端图片浏览、轮播等场景
 */

import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

export interface SwipeOptions {
  /** 触发滑动的最小距离（px） */
  threshold?: number
  /** 触发滑动的最大时间（ms） */
  timeout?: number
  /** 是否启用 */
  enabled?: boolean
}

export interface SwipeCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export function useSwipe(
  target: Ref<HTMLElement | null>,
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
) {
  const {
    threshold = 50,
    timeout = 300,
    enabled = true
  } = options

  const startX = ref(0)
  const startY = ref(0)
  const startTime = ref(0)
  const isSwiping = ref(false)

  const handleTouchStart = (e: TouchEvent) => {
    if (!enabled) return

    const touch = e.touches[0]
    startX.value = touch.clientX
    startY.value = touch.clientY
    startTime.value = Date.now()
    isSwiping.value = true
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!enabled || !isSwiping.value) return

    // Prevent default to avoid scrolling while swiping
    const touch = e.touches[0]
    const diffX = Math.abs(touch.clientX - startX.value)
    const diffY = Math.abs(touch.clientY - startY.value)

    // If horizontal swipe is more significant, prevent vertical scroll
    if (diffX > diffY && diffX > threshold / 2) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!enabled || !isSwiping.value) return

    const touch = e.changedTouches[0]
    const endX = touch.clientX
    const endY = touch.clientY
    const endTime = Date.now()

    const diffX = endX - startX.value
    const diffY = endY - startY.value
    const diffTime = endTime - startTime.value

    isSwiping.value = false

    // Check if swipe is valid (distance and time)
    if (diffTime > timeout) return

    const absDiffX = Math.abs(diffX)
    const absDiffY = Math.abs(diffY)

    // Determine swipe direction
    if (absDiffX > threshold && absDiffX > absDiffY) {
      // Horizontal swipe
      if (diffX > 0) {
        callbacks.onSwipeRight?.()
      } else {
        callbacks.onSwipeLeft?.()
      }
    } else if (absDiffY > threshold && absDiffY > absDiffX) {
      // Vertical swipe
      if (diffY > 0) {
        callbacks.onSwipeDown?.()
      } else {
        callbacks.onSwipeUp?.()
      }
    }
  }

  onMounted(() => {
    if (!target.value) return

    const element = target.value
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
  })

  onBeforeUnmount(() => {
    if (!target.value) return

    const element = target.value
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
  })

  return {
    isSwiping
  }
}

/**
 * 移动端检测 Composable
 */
export function useIsMobile() {
  const isMobile = ref(false)
  const isTablet = ref(false)

  const checkDevice = () => {
    const width = window.innerWidth
    isMobile.value = width <= 640
    isTablet.value = width > 640 && width <= 1024
  }

  onMounted(() => {
    checkDevice()
    window.addEventListener('resize', checkDevice)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', checkDevice)
  })

  return {
    isMobile,
    isTablet,
    isMobileOrTablet: ref(isMobile.value || isTablet.value)
  }
}

/**
 * 移动端面板控制 Composable
 */
export function useMobilePanels() {
  const controlPanelOpen = ref(false)
  const infoPanelOpen = ref(false)

  const toggleControlPanel = () => {
    controlPanelOpen.value = !controlPanelOpen.value
    if (controlPanelOpen.value) {
      infoPanelOpen.value = false
    }
  }

  const toggleInfoPanel = () => {
    infoPanelOpen.value = !infoPanelOpen.value
    if (infoPanelOpen.value) {
      controlPanelOpen.value = false
    }
  }

  const closeAllPanels = () => {
    controlPanelOpen.value = false
    infoPanelOpen.value = false
  }

  return {
    controlPanelOpen,
    infoPanelOpen,
    toggleControlPanel,
    toggleInfoPanel,
    closeAllPanels
  }
}
