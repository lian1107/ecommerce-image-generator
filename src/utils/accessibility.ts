/**
 * 可访问性工具函数
 * 遵循 WCAG 2.1 AA 标准
 */

import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

/**
 * ARIA 角色常量
 */
export const ARIA_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  SEARCH: 'search',
  FORM: 'form',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  ALERT: 'alert',
  STATUS: 'status',
  PROGRESSBAR: 'progressbar',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  MENUBAR: 'menubar',
  LISTBOX: 'listbox',
  OPTION: 'option',
  COMBOBOX: 'combobox',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  TREE: 'tree',
  TREEITEM: 'treeitem'
} as const

/**
 * 键盘事件键码常量
 */
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
} as const

/**
 * WCAG 2.1 色彩对比度标准
 */
export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,    // 普通文本 AA 级
  AA_LARGE: 3,       // 大文本 AA 级
  AAA_NORMAL: 7,     // 普通文本 AAA 级
  AAA_LARGE: 4.5     // 大文本 AAA 级
} as const

/**
 * 计算相对亮度（Relative Luminance）
 * 根据 WCAG 2.1 规范
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const s = val / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * 计算色彩对比度
 * @param color1 - 第一个颜色（hex 格式，如 #ffffff）
 * @param color2 - 第二个颜色（hex 格式）
 * @returns 对比度（1-21）
 */
export function getContrastRatio(color1: string, color2: string): number {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : { r: 0, g: 0, b: 0 }
  }

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 检查色彩对比度是否符合 WCAG 标准
 * @param color1 - 前景色
 * @param color2 - 背景色
 * @param level - AA 或 AAA
 * @param largeText - 是否为大文本（>=18pt 或 >=14pt 粗体）
 */
export function meetsContrastRequirement(
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA',
  largeText = false
): boolean {
  const ratio = getContrastRatio(color1, color2)

  if (level === 'AA') {
    return largeText ? ratio >= CONTRAST_RATIOS.AA_LARGE : ratio >= CONTRAST_RATIOS.AA_NORMAL
  }

  return largeText ? ratio >= CONTRAST_RATIOS.AAA_LARGE : ratio >= CONTRAST_RATIOS.AAA_NORMAL
}

/**
 * 生成唯一的 ID（用于 aria-labelledby, aria-describedby）
 */
let idCounter = 0
export function generateId(prefix = 'a11y'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`
}

/**
 * 键盘焦点陷阱（用于模态框等）
 * 确保焦点只在指定元素内循环
 */
export function useFocusTrap(elementRef: Ref<HTMLElement | null>, active: Ref<boolean>) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!active.value || !elementRef.value) return
    if (e.key !== KEYS.TAB) return

    const focusableElements = elementRef.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const focusableArray = Array.from(focusableElements)
    const firstFocusable = focusableArray[0]
    const lastFocusable = focusableArray[focusableArray.length - 1]

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable?.focus()
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return { handleKeyDown }
}

/**
 * 焦点管理 - 保存和恢复焦点
 */
export function useFocusManagement() {
  let previousFocus: HTMLElement | null = null

  const saveFocus = () => {
    previousFocus = document.activeElement as HTMLElement
  }

  const restoreFocus = () => {
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus()
      previousFocus = null
    }
  }

  return { saveFocus, restoreFocus }
}

/**
 * 键盘导航处理器
 * 用于列表、菜单等
 */
export interface KeyboardNavigationOptions {
  items: Ref<HTMLElement[]>
  currentIndex: Ref<number>
  loop?: boolean // 是否循环导航
  orientation?: 'vertical' | 'horizontal'
  onSelect?: (index: number) => void
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const { items, currentIndex, loop = true, orientation = 'vertical', onSelect } = options

  const handleKeyDown = (e: KeyboardEvent) => {
    const nextKey = orientation === 'vertical' ? KEYS.ARROW_DOWN : KEYS.ARROW_RIGHT
    const prevKey = orientation === 'vertical' ? KEYS.ARROW_UP : KEYS.ARROW_LEFT

    switch (e.key) {
      case nextKey:
        e.preventDefault()
        if (currentIndex.value < items.value.length - 1) {
          currentIndex.value++
        } else if (loop) {
          currentIndex.value = 0
        }
        items.value[currentIndex.value]?.focus()
        break

      case prevKey:
        e.preventDefault()
        if (currentIndex.value > 0) {
          currentIndex.value--
        } else if (loop) {
          currentIndex.value = items.value.length - 1
        }
        items.value[currentIndex.value]?.focus()
        break

      case KEYS.HOME:
        e.preventDefault()
        currentIndex.value = 0
        items.value[0]?.focus()
        break

      case KEYS.END:
        e.preventDefault()
        currentIndex.value = items.value.length - 1
        items.value[currentIndex.value]?.focus()
        break

      case KEYS.ENTER:
      case KEYS.SPACE:
        e.preventDefault()
        onSelect?.(currentIndex.value)
        break

      case KEYS.ESCAPE:
        e.preventDefault()
        ;(document.activeElement as HTMLElement)?.blur()
        break
    }
  }

  return { handleKeyDown }
}

/**
 * 屏幕阅读器专用文本（视觉隐藏）
 * 使用此类创建仅供屏幕阅读器读取的文本
 */
export const SR_ONLY_CLASS = 'sr-only'

/**
 * 创建屏幕阅读器通知
 * 使用 ARIA Live Region 向用户通知信息
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const liveRegion = document.getElementById('a11y-live-region')

  if (liveRegion) {
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.textContent = message

    // 清空消息，以便下次相同消息也能触发
    setTimeout(() => {
      liveRegion.textContent = ''
    }, 1000)
  }
}

/**
 * 初始化可访问性 Live Region
 * 应在应用启动时调用
 */
export function initAccessibilityLiveRegion() {
  if (document.getElementById('a11y-live-region')) return

  const liveRegion = document.createElement('div')
  liveRegion.id = 'a11y-live-region'
  liveRegion.className = SR_ONLY_CLASS
  liveRegion.setAttribute('aria-live', 'polite')
  liveRegion.setAttribute('aria-atomic', 'true')
  document.body.appendChild(liveRegion)
}

/**
 * 检查元素是否可聚焦
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled') || element.getAttribute('tabindex') === '-1') {
    return false
  }

  const focusableSelectors = [
    'a[href]',
    'button',
    'input',
    'select',
    'textarea',
    '[tabindex]'
  ]

  return focusableSelectors.some(selector => element.matches(selector))
}

/**
 * 获取可聚焦元素
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  return Array.from(container.querySelectorAll<HTMLElement>(selector))
}

/**
 * 跳转到主内容（Skip to main content）
 */
export function skipToMain() {
  const main = document.querySelector('main') || document.querySelector('[role="main"]')
  if (main instanceof HTMLElement) {
    main.setAttribute('tabindex', '-1')
    main.focus()
    // 移除 tabindex 避免破坏正常焦点流
    setTimeout(() => main.removeAttribute('tabindex'), 100)
  }
}

/**
 * 可访问性验证工具（开发环境）
 */
export function validateAccessibility(element: HTMLElement): string[] {
  const issues: string[] = []

  // 检查是否有 alt 属性（图片）
  if (element.tagName === 'IMG' && !element.hasAttribute('alt')) {
    issues.push('Image missing alt attribute')
  }

  // 检查按钮是否有可访问的名称
  if (element.tagName === 'BUTTON' && !element.textContent?.trim() && !element.getAttribute('aria-label')) {
    issues.push('Button missing accessible name')
  }

  // 检查输入是否有标签
  if (element.tagName === 'INPUT' && !element.getAttribute('aria-label') && !element.id) {
    issues.push('Input missing label or aria-label')
  }

  // 检查链接是否有文本
  if (element.tagName === 'A' && !element.textContent?.trim() && !element.getAttribute('aria-label')) {
    issues.push('Link missing accessible name')
  }

  return issues
}

/**
 * 减少动画（prefers-reduced-motion）
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 监听减少动画偏好变化
 */
export function usePrefersReducedMotion() {
  const reducedMotion = ref(prefersReducedMotion())

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  const updatePreference = () => {
    reducedMotion.value = mediaQuery.matches
  }

  onMounted(() => {
    mediaQuery.addEventListener('change', updatePreference)
  })

  onBeforeUnmount(() => {
    mediaQuery.removeEventListener('change', updatePreference)
  })

  return reducedMotion
}

export default {
  ARIA_ROLES,
  KEYS,
  CONTRAST_RATIOS,
  getContrastRatio,
  meetsContrastRequirement,
  generateId,
  useFocusTrap,
  useFocusManagement,
  useKeyboardNavigation,
  announceToScreenReader,
  initAccessibilityLiveRegion,
  isFocusable,
  getFocusableElements,
  skipToMain,
  validateAccessibility,
  prefersReducedMotion,
  usePrefersReducedMotion
}
