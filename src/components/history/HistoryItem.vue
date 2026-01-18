<script setup lang="ts">
import type { HistoryItem } from '@/types'

interface Props {
  item: HistoryItem
}

defineProps<Props>()

const emit = defineEmits<{
  select: [item: HistoryItem]
  delete: [item: HistoryItem]
}>()

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}
</script>

<template>
  <div class="history-item" @click="emit('select', item)">
    <div class="history-item__thumbnails">
      <img
        v-for="(thumbnail, index) in item.thumbnails.slice(0, 4)"
        :key="index"
        :src="thumbnail"
        :alt="`缩略图 ${index + 1}`"
        class="history-item__thumbnail"
      />
      <div v-if="item.thumbnails.length === 0" class="history-item__no-thumbnail">
        🖼️
      </div>
    </div>

    <div class="history-item__info">
      <h4 class="history-item__product">{{ item.productName || '未命名产品' }}</h4>
      <div class="history-item__meta">
        <span class="history-item__scene">{{ item.sceneName }}</span>
        <span class="history-item__count">{{ item.imageCount }}张</span>
      </div>
      <span class="history-item__date">{{ formatDate(item.createdAt) }}</span>
    </div>

    <button
      class="history-item__delete"
      title="删除"
      @click.stop="emit('delete', item)"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.history-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-bg-card, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 0.5rem);
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  border-color: var(--color-primary-light, #93c5fd);
  background: var(--color-bg-hover, #f9fafb);
}

.history-item__thumbnails {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm, 0.25rem);
  overflow: hidden;
  flex-shrink: 0;
}

.history-item__thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-item__no-thumbnail {
  grid-column: span 2;
  grid-row: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary, #f3f4f6);
  font-size: 1.25rem;
}

.history-item__info {
  flex: 1;
  min-width: 0;
}

.history-item__product {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text, #374151);
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-item__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.125rem;
}

.history-item__scene {
  font-size: 0.6875rem;
  color: var(--color-primary, #3b82f6);
  background: var(--color-primary-light, rgba(59, 130, 246, 0.1));
  padding: 0.0625rem 0.375rem;
  border-radius: var(--radius-sm, 0.25rem);
}

.history-item__count {
  font-size: 0.6875rem;
  color: var(--color-text-muted, #9ca3af);
}

.history-item__date {
  font-size: 0.6875rem;
  color: var(--color-text-muted, #9ca3af);
}

.history-item__delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted, #9ca3af);
  border-radius: var(--radius-sm, 0.25rem);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s, background 0.2s;
}

.history-item:hover .history-item__delete {
  opacity: 1;
}

.history-item__delete:hover {
  color: var(--color-danger, #ef4444);
  background: var(--color-error-bg, #fef2f2);
}
</style>
