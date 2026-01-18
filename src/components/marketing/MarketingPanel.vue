<script setup lang="ts">
import { computed } from 'vue'
import { useMarketingStore } from '@/stores/marketingStore'
import { useConsistencyStore } from '@/stores/consistencyStore'
import { BaseSelect, BaseButton } from '@/components/common'
import SlotCard from './SlotCard.vue'

const marketingStore = useMarketingStore()
const consistencyStore = useConsistencyStore()

const templateOptions = computed(() => 
  marketingStore.templates.map(t => ({
    value: t.id,
    label: `${t.icon} ${t.name}`,
    description: t.description
  }))
)

// 当不需要显示描述时，只传 Value/Label
// BaseSelect 的 options 接口通常只要 value/label
// 我们在 UI 上可以展示 description

const handleGenerate = async () => {
  // TODO: Implement generation logic
  console.log('Start Batch Generation')
}
</script>

<template>
  <div class="marketing-panel">
    <!-- Template Selector -->
    <div class="panel-section">
      <h3 class="section-title">Workflow Template</h3>
      <BaseSelect
        :model-value="marketingStore.activeTemplateId"
        :options="templateOptions"
        label="Select Template"
        @update:model-value="(v) => marketingStore.loadTemplate(v as string)"
      />
      <p class="template-desc">{{ marketingStore.activeTemplate?.description }}</p>
    </div>

    <!-- Consistency Status -->
    <div class="consistency-status active" v-if="consistencyStore.config.enabled">
      <div class="status-icon">✨</div>
      <div class="status-content">
        <strong>Consistency System Active:</strong> 
        Using {{ consistencyStore.config.referenceImages.length }} reference images based on "{{ consistencyStore.config.mode }}" mode.
      </div>
    </div>

    <!-- Optimization Hint (Only show if disabled) -->
    <div class="consistency-hint" v-else>
      <div class="hint-icon">💡</div>
      <div class="hint-content">
        <strong>Pro Tip:</strong> Enable 
        <span class="link" @click="$emit('switch-tab', 'consistency')">Consistency System</span> 
        to ensure your product looks identical across all shots.
      </div>
    </div>

    <!-- Slots List -->
    <div class="panel-section slots-section">
      <div class="section-header">
        <h3 class="section-title">Shot List ({{ marketingStore.currentSlots.length }})</h3>
        <span class="badge">Auto-Director</span>
      </div>
      
      <div class="slots-grid">
        <SlotCard
          v-for="slot in marketingStore.currentSlots"
          :key="slot.id"
          :slot-data="slot"
          @update:focus="(val: string) => marketingStore.updateSlotFocus(slot.id, val)"
          @update:description="(val: string) => marketingStore.updateSlotDescription(slot.id, val)"
        />
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <BaseButton 
        variant="primary" 
        size="lg" 
        full-width
        :loading="marketingStore.isGenerating"
        @click="handleGenerate"
      >
        🎥 Generate Marketing Set
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.marketing-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text, #111827);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.template-desc {
  font-size: 0.875rem;
  color: var(--color-text-muted, #6b7280);
  margin-top: -0.25rem;
}

.consistency-hint,
.consistency-status {
  padding: 0.75rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  font-size: 0.875rem;
  border-radius: var(--radius-md, 0.5rem);
}

.consistency-hint {
  background: var(--color-primary-light, rgba(59, 130, 246, 0.05));
  border: 1px dashed var(--color-primary, #3b82f6);
}

.consistency-status {
  background: linear-gradient(to right, rgba(168, 85, 247, 0.05), rgba(99, 102, 241, 0.05));
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.status-icon {
  font-size: 1.2rem;
}

.link {
  color: var(--color-primary, #3b82f6);
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

.slots-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  font-size: 0.75rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}
</style>
