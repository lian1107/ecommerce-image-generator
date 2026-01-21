/**
 * Debounce function - delays execution until after wait milliseconds have passed
 * since the last invocation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (timeout !== null) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * Throttle function - ensures a function is called at most once in a specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Request deduplicator - prevents duplicate async requests
 * Returns the same promise for concurrent identical requests
 */
export class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>()

  /**
   * Execute an async function, deduplicating concurrent calls with the same key
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    timeoutMs: number = 60000
  ): Promise<T> {
    // If there's already a pending request with this key, return it
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>
    }

    // Create new request
    const promise = fn()
      .finally(() => {
        // Clean up after completion (success or error)
        this.pending.delete(key)
      })

    // Store in pending map
    this.pending.set(key, promise)

    // Set timeout to prevent memory leaks from stuck requests
    setTimeout(() => {
      if (this.pending.has(key)) {
        this.pending.delete(key)
      }
    }, timeoutMs)

    return promise
  }

  /**
   * Check if a request with this key is currently pending
   */
  isPending(key: string): boolean {
    return this.pending.has(key)
  }

  /**
   * Clear a specific pending request
   */
  clear(key: string): void {
    this.pending.delete(key)
  }

  /**
   * Clear all pending requests
   */
  clearAll(): void {
    this.pending.clear()
  }
}
