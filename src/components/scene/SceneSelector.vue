<script setup lang="ts">
import { useSceneStore } from '@/stores/sceneStore'
import { CollapseSection } from '@/components/common'
import SceneCard from './SceneCard.vue'
import type { Scene } from '@/types'

const sceneStore = useSceneStore()

const handleSceneSelect = (scene: Scene) => {
  sceneStore.selectScene(scene.id)
}
</script>

<template>
  <CollapseSection title="场景选择" icon="🎬" :default-open="true">
    <div class="scene-selector">
      <div v-if="sceneStore.recommendedScene && !sceneStore.isRecommendedScene" class="scene-selector__recommendation">
        <span class="scene-selector__recommendation-icon">💡</span>
        <span class="scene-selector__recommendation-text">
          根据产品信息，推荐使用
          <button
            class="scene-selector__recommendation-btn"
            @click="sceneStore.selectRecommendedScene"
          >
            {{ sceneStore.allScenes.find(s => s.id === sceneStore.recommendedScene)?.name }}
          </button>
          场景
        </span>
      </div>

      <div class="scene-selector__grid">
        <SceneCard
          v-for="sceneItem in sceneStore.getScenesWithMatchScores"
          :key="sceneItem.id"
          :scene="sceneItem"
          :selected="sceneStore.selectedSceneId === sceneItem.id"
          :recommended="sceneItem.isRecommended"
          :match-score="sceneItem.matchScore"
          @select="handleSceneSelect"
        />
      </div>

      <div v-if="sceneStore.selectedScene" class="scene-selector__current">
        <div class="scene-selector__current-header">
          <span class="scene-selector__current-icon">{{ sceneStore.selectedScene.icon }}</span>
          <span class="scene-selector__current-name">{{ sceneStore.selectedScene.name }}</span>
        </div>
        <div class="scene-selector__hints">
          <span class="scene-selector__hints-label">场景特点:</span>
          <div class="scene-selector__hints-list">
            <span
              v-for="hint in sceneStore.scenePromptHints.slice(0, 4)"
              :key="hint"
              class="scene-selector__hint"
            >
              {{ hint }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </CollapseSection>
</template>

<style scoped>
.scene-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.scene-selector__recommendation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: var(--color-info-bg, #eff6ff);
  border: 1px solid var(--color-info-border, #93c5fd);
  border-radius: var(--radius-md, 0.5rem);
}

.scene-selector__recommendation-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.scene-selector__recommendation-text {
  font-size: 0.8125rem;
  color: var(--color-info-text, #1e40af);
}

.scene-selector__recommendation-btn {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--color-primary, #3b82f6);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 2px;
}

.scene-selector__recommendation-btn:hover {
  text-decoration-style: solid;
}

.scene-selector__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.scene-selector__current {
  padding: 0.75rem;
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 0.5rem);
}

.scene-selector__current-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.scene-selector__current-icon {
  font-size: 1.125rem;
}

.scene-selector__current-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text, #374151);
}

.scene-selector__hints {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.scene-selector__hints-label {
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
}

.scene-selector__hints-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.scene-selector__hint {
  font-size: 0.6875rem;
  color: var(--color-text, #374151);
  background: var(--color-bg-card, #ffffff);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm, 0.25rem);
  border: 1px solid var(--color-border, #e5e7eb);
}
</style>
