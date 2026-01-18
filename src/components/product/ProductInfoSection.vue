<script setup lang="ts">
import { computed } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { BaseInput, BaseSelect, BaseTextarea, CollapseSection } from '@/components/common'
import ImageUploader from './ImageUploader.vue'
import { categories } from '@/config/categories'

const productStore = useProductStore()

const categoryOptions = computed(() =>
  categories.map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`
  }))
)

const handleNameChange = (value: string | number) => {
  productStore.setProductName(String(value))
}

const handleCategoryChange = (value: string | number) => {
  productStore.setProductCategory(String(value))
}

const handleDescriptionChange = (value: string) => {
  productStore.setProductDescription(value)
}
</script>

<template>
  <CollapseSection title="产品信息" icon="📦" :default-open="true">
    <div class="product-info">
      <ImageUploader />

      <div class="product-info__fields">
        <BaseInput
          :model-value="productStore.productInfo.name"
          label="产品名称"
          placeholder="例如：iPhone 15 Pro Max"
          @update:model-value="handleNameChange"
        />

        <BaseSelect
          :model-value="productStore.productInfo.category"
          :options="categoryOptions"
          label="产品类别"
          placeholder="选择类别"
          @update:model-value="handleCategoryChange"
        />

        <BaseTextarea
          :model-value="productStore.productInfo.description"
          label="产品描述"
          placeholder="简要描述产品特点..."
          :rows="3"
          :maxlength="500"
          @update:model-value="handleDescriptionChange"
        />
      </div>

      <div v-if="productStore.hasProduct" class="product-info__summary">
        <span class="product-info__summary-label">当前产品:</span>
        <span class="product-info__summary-value">{{ productStore.productSummary }}</span>
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

.product-info__summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 0.5rem);
  font-size: 0.875rem;
}

.product-info__summary-label {
  color: var(--color-text-muted, #9ca3af);
  flex-shrink: 0;
}

.product-info__summary-value {
  color: var(--color-text, #374151);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
