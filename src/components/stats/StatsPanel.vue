<script setup lang="ts">
import { useStatsStore } from '@/stores/statsStore'
import { scenes } from '@/config/scenes'
import { CollapseSection } from '@/components/common'

const statsStore = useStatsStore()

const getSceneName = (sceneId: string) => {
  return scenes[sceneId as keyof typeof scenes]?.name || sceneId
}
</script>

<template>
  <CollapseSection title="使用统计" icon="📊" :default-open="false">
    <div class="stats-panel">
      <div class="stats-panel__grid">
        <div class="stats-panel__stat">
          <span class="stats-panel__stat-value">{{ statsStore.totalGenerations }}</span>
          <span class="stats-panel__stat-label">总生成次数</span>
        </div>
        <div class="stats-panel__stat">
          <span class="stats-panel__stat-value">{{ statsStore.totalImages }}</span>
          <span class="stats-panel__stat-label">总图片数</span>
        </div>
        <div class="stats-panel__stat">
          <span class="stats-panel__stat-value">{{ statsStore.successRate }}%</span>
          <span class="stats-panel__stat-label">成功率</span>
        </div>
        <div class="stats-panel__stat">
          <span class="stats-panel__stat-value">{{ statsStore.averageTime }}s</span>
          <span class="stats-panel__stat-label">平均耗时</span>
        </div>
      </div>

      <div v-if="statsStore.favoriteScene" class="stats-panel__favorite">
        <span class="stats-panel__favorite-label">最常用场景</span>
        <span class="stats-panel__favorite-value">
          {{ getSceneName(statsStore.favoriteScene) }}
        </span>
      </div>

      <div class="stats-panel__scenes">
        <h4 class="stats-panel__scenes-title">场景使用分布</h4>
        <div class="stats-panel__scene-list">
          <div
            v-for="scene in statsStore.topScenes"
            :key="scene.scene"
            class="stats-panel__scene"
          >
            <div class="stats-panel__scene-info">
              <span class="stats-panel__scene-name">{{ getSceneName(scene.scene) }}</span>
              <span class="stats-panel__scene-count">{{ scene.count }}次</span>
            </div>
            <div class="stats-panel__scene-bar">
              <div
                class="stats-panel__scene-fill"
                :style="{ width: `${statsStore.getSceneUsagePercentage(scene.scene)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-panel__recent">
        <span class="stats-panel__recent-label">今日生成</span>
        <span class="stats-panel__recent-value">{{ statsStore.todayUsage }}次</span>
        <span class="stats-panel__recent-label">本周生成</span>
        <span class="stats-panel__recent-value">{{ statsStore.weeklyTotal }}次</span>
      </div>

      <div v-if="statsStore.lastGeneratedAt" class="stats-panel__last">
        <span class="stats-panel__last-label">上次生成</span>
        <span class="stats-panel__last-value">
          {{ statsStore.lastGeneratedAt.toLocaleString() }}
        </span>
      </div>
    </div>
  </CollapseSection>
</template>

<style scoped>
.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stats-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.stats-panel__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 0.5rem);
}

.stats-panel__stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary, #3b82f6);
}

.stats-panel__stat-label {
  font-size: 0.6875rem;
  color: var(--color-text-muted, #9ca3af);
}

.stats-panel__favorite {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  background: var(--color-primary-light, rgba(59, 130, 246, 0.1));
  border-radius: var(--radius-md, 0.5rem);
}

.stats-panel__favorite-label {
  font-size: 0.8125rem;
  color: var(--color-text-muted, #6b7280);
}

.stats-panel__favorite-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
}

.stats-panel__scenes {
  padding-top: 0.5rem;
}

.stats-panel__scenes-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted, #9ca3af);
  margin: 0 0 0.5rem;
}

.stats-panel__scene-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stats-panel__scene {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stats-panel__scene-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.stats-panel__scene-name {
  color: var(--color-text, #374151);
}

.stats-panel__scene-count {
  color: var(--color-text-muted, #9ca3af);
}

.stats-panel__scene-bar {
  height: 4px;
  background: var(--color-bg-secondary, #e5e7eb);
  border-radius: 2px;
  overflow: hidden;
}

.stats-panel__scene-fill {
  height: 100%;
  background: var(--color-primary, #3b82f6);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.stats-panel__recent {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.25rem 0.75rem;
  font-size: 0.8125rem;
}

.stats-panel__recent-label {
  color: var(--color-text-muted, #6b7280);
}

.stats-panel__recent-value {
  color: var(--color-text, #374151);
  font-weight: 500;
  text-align: right;
}

.stats-panel__last {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.stats-panel__last-label {
  color: var(--color-text-muted, #9ca3af);
}

.stats-panel__last-value {
  color: var(--color-text-muted, #6b7280);
}
</style>
