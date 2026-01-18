import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UsageStats, SceneType } from '@/types'
import { APP_CONFIG } from '@/config'

export const useStatsStore = defineStore('stats', () => {
  // State
  const stats = ref<UsageStats>({
    totalGenerations: 0,
    totalImages: 0,
    successRate: 100,
    averageGenerationTime: 0,
    favoriteScene: null,
    sceneUsage: {
      'studio-white': 0,
      'lifestyle': 0,
      'outdoor': 0,
      'seasonal': 0,
      'luxury': 0,
      'minimalist': 0
    },
    dailyUsage: [],
    lastGeneratedAt: null
  })

  // Internal tracking
  const totalAttempts = ref(0)
  const successfulAttempts = ref(0)
  const totalGenerationTime = ref(0)

  // Getters
  const totalGenerations = computed(() => stats.value.totalGenerations)

  const totalImages = computed(() => stats.value.totalImages)

  const successRate = computed(() => {
    if (totalAttempts.value === 0) return 100
    return Math.round((successfulAttempts.value / totalAttempts.value) * 100)
  })

  const averageTime = computed(() => {
    if (stats.value.totalGenerations === 0) return 0
    return Math.round(totalGenerationTime.value / stats.value.totalGenerations)
  })

  const favoriteScene = computed<SceneType | null>(() => {
    let maxUsage = 0
    let favorite: SceneType | null = null

    for (const [scene, count] of Object.entries(stats.value.sceneUsage)) {
      if (count > maxUsage) {
        maxUsage = count
        favorite = scene as SceneType
      }
    }

    return favorite
  })

  const topScenes = computed(() => {
    return Object.entries(stats.value.sceneUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([scene, count]) => ({ scene: scene as SceneType, count }))
  })

  const recentDailyUsage = computed(() =>
    stats.value.dailyUsage.slice(-7)
  )

  const todayUsage = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayEntry = stats.value.dailyUsage.find(d => d.date === today)
    return todayEntry?.count || 0
  })

  const weeklyTotal = computed(() => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    return stats.value.dailyUsage
      .filter(d => new Date(d.date) >= oneWeekAgo)
      .reduce((sum, d) => sum + d.count, 0)
  })

  const lastGeneratedAt = computed(() =>
    stats.value.lastGeneratedAt ? new Date(stats.value.lastGeneratedAt) : null
  )

  // Actions
  const recordGeneration = (
    imageCount: number,
    duration: number,
    scene: SceneType
  ) => {
    totalAttempts.value++

    if (imageCount > 0) {
      successfulAttempts.value++
      stats.value.totalGenerations++
      stats.value.totalImages += imageCount
      stats.value.lastGeneratedAt = new Date()

      // Update scene usage
      stats.value.sceneUsage[scene]++

      // Update generation time tracking
      totalGenerationTime.value += duration
      stats.value.averageGenerationTime = averageTime.value

      // Update daily usage
      updateDailyUsage()
    }

    // Update success rate
    stats.value.successRate = successRate.value

    // Update favorite scene
    stats.value.favoriteScene = favoriteScene.value
  }

  const updateDailyUsage = () => {
    const today = new Date().toISOString().split('T')[0]

    const existingIndex = stats.value.dailyUsage.findIndex(d => d.date === today)
    if (existingIndex !== -1) {
      stats.value.dailyUsage[existingIndex].count++
    } else {
      stats.value.dailyUsage.push({ date: today, count: 1 })
    }

    // Keep only last 30 days
    if (stats.value.dailyUsage.length > 30) {
      stats.value.dailyUsage = stats.value.dailyUsage.slice(-30)
    }
  }

  const getSceneUsagePercentage = (scene: SceneType): number => {
    const total = Object.values(stats.value.sceneUsage).reduce((a, b) => a + b, 0)
    if (total === 0) return 0
    return Math.round((stats.value.sceneUsage[scene] / total) * 100)
  }

  const resetStats = () => {
    stats.value = {
      totalGenerations: 0,
      totalImages: 0,
      successRate: 100,
      averageGenerationTime: 0,
      favoriteScene: null,
      sceneUsage: {
        'studio-white': 0,
        'lifestyle': 0,
        'outdoor': 0,
        'seasonal': 0,
        'luxury': 0,
        'minimalist': 0
      },
      dailyUsage: [],
      lastGeneratedAt: null
    }
    totalAttempts.value = 0
    successfulAttempts.value = 0
    totalGenerationTime.value = 0
  }

  const exportStats = (): string => {
    return JSON.stringify({
      stats: stats.value,
      totalAttempts: totalAttempts.value,
      successfulAttempts: successfulAttempts.value,
      totalGenerationTime: totalGenerationTime.value
    }, null, 2)
  }

  const importStats = (json: string): boolean => {
    try {
      const data = JSON.parse(json)
      if (data.stats) {
        stats.value = { ...stats.value, ...data.stats }
      }
      if (typeof data.totalAttempts === 'number') {
        totalAttempts.value = data.totalAttempts
      }
      if (typeof data.successfulAttempts === 'number') {
        successfulAttempts.value = data.successfulAttempts
      }
      if (typeof data.totalGenerationTime === 'number') {
        totalGenerationTime.value = data.totalGenerationTime
      }
      return true
    } catch (error) {
      console.error('Failed to import stats:', error)
      return false
    }
  }

  return {
    // State
    stats,

    // Getters
    totalGenerations,
    totalImages,
    successRate,
    averageTime,
    favoriteScene,
    topScenes,
    recentDailyUsage,
    todayUsage,
    weeklyTotal,
    lastGeneratedAt,

    // Actions
    recordGeneration,
    getSceneUsagePercentage,
    resetStats,
    exportStats,
    importStats
  }
}, {
  persist: {
    key: `${APP_CONFIG.storage.prefix}-${APP_CONFIG.storage.keys.stats}`,
    pick: ['stats']
  }
})
