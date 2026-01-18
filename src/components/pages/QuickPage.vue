<template>
  <div class="quick-page">
    <div class="page-header">
      <h2 class="page-title">快速生成</h2>
      <p class="page-subtitle">选择产品、场景和模特，快速生成营销图片</p>
    </div>
    
    <div class="creation-grid">
      <div class="creation-section left-section">
        <ProductInfoSection />
      </div>
      <div class="creation-section right-section">
        <SceneSelector />
        <ModelSelector />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductInfoSection from '@/components/product/ProductInfoSection.vue'
import SceneSelector from '@/components/scene/SceneSelector.vue'
import { ModelSelector } from '@/components/model'
</script>

<style scoped>
.quick-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  margin-bottom: 8px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-dark);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.creation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1100px) {
  .creation-grid {
    grid-template-columns: 1fr;
  }
}

.creation-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
