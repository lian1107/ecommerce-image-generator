<script setup lang="ts">
import { ref } from 'vue'
import { useHistoryStore } from '@/stores/historyStore'
import { BaseInput, BaseButton, CollapseSection } from '@/components/common'
import HistoryItem from './HistoryItem.vue'
import type { HistoryItem as HistoryItemType } from '@/types'

const historyStore = useHistoryStore()

const searchQuery = ref('')

const handleSearch = (value: string | number) => {
  searchQuery.value = String(value)
  historyStore.searchHistory(String(value))
}

const handleItemSelect = (item: HistoryItemType) => {
  // Could emit event or navigate to details
  console.log('Selected history item:', item.id)
}

const handleItemDelete = (item: HistoryItemType) => {
  historyStore.removeItem(item.id)
}

const clearAllHistory = () => {
  if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
    historyStore.clearHistory()
  }
}
</script>

<template>
  <CollapseSection title="历史记录" icon="📜" :default-open="false">
    <div class="history-list">
      <div class="history-list__header">
        <BaseInput
          :model-value="searchQuery"
          type="search"
          placeholder="搜索历史..."
          @update:model-value="handleSearch"
        />
        <BaseButton
          v-if="!historyStore.isEmpty"
          variant="ghost"
          size="sm"
          @click="clearAllHistory"
        >
          清空
        </BaseButton>
      </div>

      <div v-if="historyStore.isEmpty" class="history-list__empty">
        <span class="history-list__empty-icon">📭</span>
        <p class="history-list__empty-text">暂无历史记录</p>
      </div>

      <div v-else class="history-list__items">
        <HistoryItem
          v-for="item in historyStore.filteredItems"
          :key="item.id"
          :item="item"
          @select="handleItemSelect"
          @delete="handleItemDelete"
        />
      </div>

      <div v-if="!historyStore.isEmpty" class="history-list__footer">
        <span class="history-list__count">
          共 {{ historyStore.totalItems }} 条记录
        </span>
        <span class="history-list__limit">
          最多保留 50 条，30天自动清理
        </span>
      </div>
    </div>
  </CollapseSection>
</template>

<style scoped>
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-list__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-list__header :deep(.base-input-wrapper) {
  flex: 1;
}

.history-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  text-align: center;
}

.history-list__empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.history-list__empty-text {
  font-size: 0.875rem;
  color: var(--color-text-muted, #9ca3af);
  margin: 0;
}

.history-list__items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.history-list__items::-webkit-scrollbar {
  width: 4px;
}

.history-list__items::-webkit-scrollbar-track {
  background: transparent;
}

.history-list__items::-webkit-scrollbar-thumb {
  background: var(--color-border, #d1d5db);
  border-radius: 2px;
}

.history-list__footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  color: var(--color-text-muted, #9ca3af);
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
}
</style>
