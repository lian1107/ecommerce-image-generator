import { ref, readonly } from 'vue'
import type { Toast, ToastType } from '@/types'

const toasts = ref<Toast[]>([])
let toastId = 0

const defaultDuration = 3000

export function useToast() {
  const show = (
    message: string,
    type: ToastType = 'info',
    options: { duration?: number; dismissible?: boolean } = {}
  ) => {
    const id = `toast_${++toastId}`
    const duration = options.duration ?? defaultDuration
    const dismissible = options.dismissible ?? true

    const toast: Toast = {
      id,
      type,
      message,
      duration,
      dismissible
    }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }

    return id
  }

  const success = (message: string, options?: { duration?: number; dismissible?: boolean }) => {
    return show(message, 'success', options)
  }

  const error = (message: string, options?: { duration?: number; dismissible?: boolean }) => {
    return show(message, 'error', { duration: 5000, ...options })
  }

  const warning = (message: string, options?: { duration?: number; dismissible?: boolean }) => {
    return show(message, 'warning', options)
  }

  const info = (message: string, options?: { duration?: number; dismissible?: boolean }) => {
    return show(message, 'info', options)
  }

  const dismiss = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const dismissAll = () => {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll
  }
}

// Create a singleton instance for global use
const globalToast = useToast()

export const toast = {
  success: globalToast.success,
  error: globalToast.error,
  warning: globalToast.warning,
  info: globalToast.info,
  dismiss: globalToast.dismiss,
  dismissAll: globalToast.dismissAll,
  toasts: globalToast.toasts
}
