<script setup lang="ts">
import { computed } from 'vue'
import type { MarketingSlot } from '@/types'

const props = defineProps<{
  slotData: MarketingSlot
}>()

// Emits are used directly in template via $emit
// defineEmits is macro, so we don't need to assign it if not used in script
// Emits definitions
defineEmits<{
  'update': [slot: MarketingSlot]
  'generate': [slot: MarketingSlot]
  'use-consistency': []
  'update:focus': [value: string]
  'update:description': [value: string]
}>()

const placeholderText = computed(() => {
  if (props.slotData.id.includes('main')) return 'e.g. pure white background'
  if (props.slotData.id.includes('detail')) return 'e.g. showing the texture'
  return 'Specific focus for this shot'
})
</script>

<template>
  <div class="slot-card">
    <div class="slot-header">
      <span class="slot-name">{{ props.slotData.name }}</span>
      <span class="slot-ratio">{{ props.slotData.aspectRatio }}</span>
    </div>

    <div class="slot-content">
      <!-- Environment/Description (Context) -->
      <div class="input-group">
        <label>Environment / Context</label>
        <textarea 
          class="slot-textarea" 
          :value="props.slotData.description"
          @input="$emit('update:description', ($event.target as HTMLTextAreaElement).value)"
          rows="2"
        ></textarea>
      </div>

      <!-- Focus (Subject Focus) -->
      <div class="input-group focus-group">
        <label>🎯 Focus Point <span class="optional">(Optional)</span></label>
        <input 
          type="text"
          class="slot-input" 
          :value="props.slotData.focus"
          @input="$emit('update:focus', ($event.target as HTMLInputElement).value)"
          :placeholder="placeholderText"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.slot-card {
  background: var(--color-bg-secondary, #f9fafb);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-lg, 0.75rem);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.slot-card:hover {
  border-color: var(--color-primary-light, #93c5fd);
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slot-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text, #111827);
}

.slot-ratio {
  font-size: 0.75rem;
  padding: 2px 6px;
  background: var(--color-bg-tertiary, #f3f4f6);
  border-radius: 4px;
  color: var(--color-text-muted, #6b7280);
  font-weight: 500;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.input-group label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted, #6b7280);
}

.optional {
  font-weight: 400;
  opacity: 0.8;
}

.slot-textarea,
.slot-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 0.5rem);
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s;
  font-family: inherit;
}

.slot-textarea:focus,
.slot-input:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 2px var(--color-primary-light, rgba(59, 130, 246, 0.1));
}

.focus-group .slot-input {
  border-left: 3px solid var(--color-primary, #3b82f6);
}
</style>
