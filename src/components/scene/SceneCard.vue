<script setup lang="ts">
import { computed } from 'vue'
import type { Scene } from '@/types'

interface Props {
  scene: Scene
  selected?: boolean
  recommended?: boolean
  matchScore?: number
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  recommended: false,
  matchScore: 0
})

const emit = defineEmits<{
  select: [scene: Scene]
}>()

const matchPercentage = computed(() => Math.round(props.matchScore * 100))
</script>

<template>
  <div
    class="scene-card"
    :class="{
      'scene-card--selected': selected,
      'scene-card--recommended': recommended
    }"
    @click="emit('select', scene)"
  >
    <div class="scene-card__header">
      <span class="scene-card__icon">{{ scene.icon }}</span>
      <span v-if="recommended" class="scene-card__badge">推荐</span>
    </div>
    <h4 class="scene-card__name">{{ scene.name }}</h4>
    <p class="scene-card__description">{{ scene.description }}</p>
    <div v-if="matchScore > 0" class="scene-card__match">
      <div class="scene-card__match-bar">
        <div
          class="scene-card__match-fill"
          :style="{ width: `${matchPercentage}%` }"
        ></div>
      </div>
      <span class="scene-card__match-value">{{ matchPercentage }}% 匹配</span>
    </div>
    <div class="scene-card__tags">
      <span v-for="tag in scene.tags.slice(0, 2)" :key="tag" class="scene-card__tag">
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.scene-card {
  padding: 1rem;
  background: var(--color-bg-card, #ffffff);
  border: 2px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-lg, 0.75rem);
  cursor: pointer;
  transition: all 0.2s ease;
}

.scene-card:hover {
  border-color: var(--color-primary-light, #93c5fd);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.scene-card--selected {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-primary-light, rgba(59, 130, 246, 0.05));
}

.scene-card--recommended {
  border-color: var(--color-success, #10b981);
}

.scene-card--recommended.scene-card--selected {
  border-color: var(--color-primary, #3b82f6);
}

.scene-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.scene-card__icon {
  font-size: 1.5rem;
}

.scene-card__badge {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-success, #10b981);
  background: var(--color-success-bg, #ecfdf5);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm, 0.25rem);
}

.scene-card__name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text, #111827);
  margin: 0 0 0.25rem;
}

.scene-card__description {
  font-size: 0.8125rem;
  color: var(--color-text-muted, #6b7280);
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.scene-card__match {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.scene-card__match-bar {
  flex: 1;
  height: 4px;
  background: var(--color-bg-secondary, #e5e7eb);
  border-radius: 2px;
  overflow: hidden;
}

.scene-card__match-fill {
  height: 100%;
  background: var(--color-primary, #3b82f6);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.scene-card__match-value {
  font-size: 0.6875rem;
  color: var(--color-primary, #3b82f6);
  font-weight: 500;
  white-space: nowrap;
}

.scene-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.scene-card__tag {
  font-size: 0.6875rem;
  color: var(--color-text-muted, #9ca3af);
  background: var(--color-bg-secondary, #f3f4f6);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm, 0.25rem);
}
</style>
