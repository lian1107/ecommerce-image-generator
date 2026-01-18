import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HistoryItem, GenerationTask, HistoryFilter, SceneType } from '@/types'
import { APP_CONFIG } from '@/config'

export const useHistoryStore = defineStore('history', () => {
  // State
  const items = ref<HistoryItem[]>([])
  const filter = ref<HistoryFilter>({})
  const lastCleanupCheck = ref<Date | null>(null)

  // Getters
  const totalItems = computed(() => items.value.length)

  const filteredItems = computed(() => {
    let result = [...items.value]

    // Filter by date range
    if (filter.value.dateRange) {
      const [start, end] = filter.value.dateRange
      result = result.filter(item => {
        const date = new Date(item.createdAt)
        return date >= start && date <= end
      })
    }

    // Filter by scene
    if (filter.value.scene) {
      result = result.filter(item => item.task.prompt.metadata.scene === filter.value.scene)
    }

    // Filter by search query
    if (filter.value.searchQuery) {
      const query = filter.value.searchQuery.toLowerCase()
      result = result.filter(item =>
        item.productName.toLowerCase().includes(query) ||
        item.sceneName.toLowerCase().includes(query)
      )
    }

    return result
  })

  const recentItems = computed(() =>
    items.value.slice(0, 10)
  )

  const isEmpty = computed(() => items.value.length === 0)

  const hasReachedLimit = computed(() =>
    items.value.length >= APP_CONFIG.history.maxItems
  )

  const oldestItem = computed(() =>
    items.value[items.value.length - 1] || null
  )

  const itemsByScene = computed(() => {
    const byScene: Record<SceneType, HistoryItem[]> = {
      'studio-white': [],
      'lifestyle': [],
      'outdoor': [],
      'seasonal': [],
      'luxury': [],
      'minimalist': []
    }

    for (const item of items.value) {
      const scene = item.task.prompt.metadata.scene
      if (scene in byScene) {
        byScene[scene].push(item)
      }
    }

    return byScene
  })

  // Actions
  const addToHistory = (
    task: GenerationTask,
    productName: string,
    sceneName: string
  ) => {
    // Generate thumbnails from first few results
    const thumbnails = task.results.slice(0, 4).map(r => r.thumbnailUrl)

    const historyItem: HistoryItem = {
      id: `history_${Date.now()}`,
      task,
      createdAt: new Date(),
      productName,
      sceneName,
      imageCount: task.results.length,
      thumbnails
    }

    // Add to beginning
    items.value.unshift(historyItem)

    // Enforce max items limit
    if (items.value.length > APP_CONFIG.history.maxItems) {
      items.value = items.value.slice(0, APP_CONFIG.history.maxItems)
    }

    // Check for cleanup
    checkAndCleanup()
  }

  const removeItem = (id: string) => {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  const clearHistory = () => {
    items.value = []
  }

  const setFilter = (newFilter: Partial<HistoryFilter>) => {
    filter.value = { ...filter.value, ...newFilter }
  }

  const clearFilter = () => {
    filter.value = {}
  }

  const searchHistory = (query: string) => {
    filter.value.searchQuery = query
  }

  const filterByScene = (scene: SceneType | undefined) => {
    filter.value.scene = scene
  }

  const filterByDateRange = (start: Date, end: Date) => {
    filter.value.dateRange = [start, end]
  }

  const getItemById = (id: string): HistoryItem | undefined => {
    return items.value.find(item => item.id === id)
  }

  const checkAndCleanup = () => {
    const now = new Date()

    // Only check once per day
    if (lastCleanupCheck.value) {
      const lastCheck = new Date(lastCleanupCheck.value)
      if (isNaN(lastCheck.getTime())) {
        lastCleanupCheck.value = null // Invalid date, reset
        return
      }

      const timeSinceLastCheck = now.getTime() - lastCheck.getTime()
      if (timeSinceLastCheck < APP_CONFIG.history.cleanupCheckInterval) {
        return
      }
    }

    lastCleanupCheck.value = now
    cleanupOldItems()
  }

  const cleanupOldItems = () => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - APP_CONFIG.history.autoCleanupDays)

    const originalLength = items.value.length
    items.value = items.value.filter(item =>
      new Date(item.createdAt) > cutoffDate
    )

    const removedCount = originalLength - items.value.length
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old history items`)
    }
  }

  const exportHistory = (): string => {
    return JSON.stringify(items.value, null, 2)
  }

  const importHistory = (json: string): boolean => {
    try {
      const imported = JSON.parse(json) as HistoryItem[]
      if (!Array.isArray(imported)) {
        return false
      }

      // Validate and merge
      for (const item of imported) {
        if (item.id && item.task && item.createdAt) {
          // Check if already exists
          if (!items.value.find(i => i.id === item.id)) {
            items.value.push({
              ...item,
              createdAt: new Date(item.createdAt)
            })
          }
        }
      }

      // Sort by date
      items.value.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      // Enforce limit
      if (items.value.length > APP_CONFIG.history.maxItems) {
        items.value = items.value.slice(0, APP_CONFIG.history.maxItems)
      }

      return true
    } catch (error) {
      console.error('Failed to import history:', error)
      return false
    }
  }

  const duplicateToGeneration = (id: string): GenerationTask | null => {
    const item = getItemById(id)
    if (!item) return null

    return {
      ...item.task,
      id: `task_${Date.now()}`,
      startedAt: new Date(),
      completedAt: undefined,
      status: 'idle'
    }
  }

  return {
    // State
    items,
    filter,
    lastCleanupCheck,

    // Getters
    totalItems,
    filteredItems,
    recentItems,
    isEmpty,
    hasReachedLimit,
    oldestItem,
    itemsByScene,

    // Actions
    addToHistory,
    removeItem,
    clearHistory,
    setFilter,
    clearFilter,
    searchHistory,
    filterByScene,
    filterByDateRange,
    getItemById,
    checkAndCleanup,
    cleanupOldItems,
    exportHistory,
    importHistory,
    duplicateToGeneration
  }
}, {
  persist: {
    key: `${APP_CONFIG.storage.prefix}-${APP_CONFIG.storage.keys.history}`,
    paths: ['items', 'lastCleanupCheck']
  }

})
