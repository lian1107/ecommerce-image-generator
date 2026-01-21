<script setup lang="ts">
import { useProductStore } from '@/stores/productStore'
import { BaseInput, BaseTextarea, CollapseSection } from '@/components/common'
import ImageUploader from './ImageUploader.vue'

const productStore = useProductStore()

const handleNameChange = (value: string | number) => {
  productStore.setProductName(String(value))
}

const handleDescriptionChange = (value: string) => {
  productStore.setProductDescription(value)
  // 当描述更新时，触发重新分析 (Hybrid Intelligence)
  if (productStore.primaryImage) {
    // Debounce checks can be added here if needed
    // Currently relying on user action to update
  }
}
</script>

<template>
  <CollapseSection title="产品信息" icon="📦" :default-open="true">
    <div class="product-info">
      <ImageUploader />

      <!-- AI 智能分析结果展示 (Hybrid Intelligence) -->
      <div v-if="productStore.hasImages" class="analysis-card" :class="{ 'analysis-card--analyzing': productStore.isAnalyzing }">
        <div class="analysis-header">
          <span class="analysis-title">✨ AI 产品洞察</span>
          <span v-if="productStore.isAnalyzing" class="analysis-status status-analyzing">
            <span class="loading-dot"></span> 深度分析中...
          </span>
          <span v-else class="analysis-status status-complete">✓ 分析完成</span>
        </div>

        <div v-if="!productStore.isAnalyzing && productStore.productInfo.category" class="analysis-tags">
          <div class="tag-group">
            <span class="tag-label">类别:</span>
            <span class="tag-value tag-category">{{ productStore.productInfo.category }}</span>
          </div>
          
          <div class="tag-group" v-if="productStore.productInfo.features.length > 0">
            <span class="tag-label">卖点:</span>
            <div class="feature-list">
              <span v-for="feat in productStore.productInfo.features.slice(0, 3)" :key="feat" class="tag-value tag-feature">
                {{ feat }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="product-info__fields">
        <BaseInput
          :model-value="productStore.productInfo.name"
          label="产品名称"
          placeholder="例如：iPhone 15 Pro Max"
          @update:model-value="handleNameChange"
        />

        <BaseTextarea
          :model-value="productStore.productInfo.description"
          label="产品描述"
          placeholder="简要描述产品特点，AI 将结合此描述优化分析结果..."
          :rows="3"
          :maxlength="500"
          @update:model-value="handleDescriptionChange"
        />
      </div>
    </div>
  </CollapseSection>
</template>

<style scoped>
.product-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-info__fields {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

/* AI Analysis Card Styles */
.analysis-card {
  background: linear-gradient(to right, #f0f9ff, #e0f2fe);
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.analysis-card--analyzing {
  background: #f9fafb;
  border-color: #e5e7eb;
  opacity: 0.8;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.analysis-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0369a1;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.analysis-status {
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.status-analyzing {
  color: #d97706;
}

.status-complete {
  color: #059669;
}

.loading-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

.analysis-tags {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tag-group {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.tag-label {
  color: #64748b;
  white-space: nowrap;
  margin-top: 0.125rem;
}

.tag-value {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-category {
  background: #fff;
  color: #0284c7;
  border: 1px solid #bae6fd;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag-feature {
  background: #fff;
  color: #475569;
  border: 1px solid #cbd5e1;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
</style>
