<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()
</script>

<template>
  <div class="quantity-selector">
    <div class="quantity-header">
      <label class="quantity-selector__label">生成数量</label>
      <span class="quantity-value">{{ settingsStore.quantity }} 张</span>
    </div>
    
    <div class="slider-container">
      <input 
        type="range" 
        :value="settingsStore.quantity"
        @input="e => settingsStore.setQuantity(Number((e.target as HTMLInputElement).value))"
        min="1" 
        max="9" 
        step="1"
        class="quantity-slider"
        :style="{ '--progress': `${(settingsStore.quantity - 1) / 8 * 100}%` }"
      >
      <div class="slider-markers">
        <span v-for="i in 9" :key="i" class="marker" :class="{ active: i <= settingsStore.quantity }"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quantity-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quantity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity-selector__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text, #374151);
}

.quantity-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
}

.slider-container {
  position: relative;
  padding: 10px 0;
}

.quantity-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: var(--color-border, #e5e7eb);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.quantity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: var(--color-primary, #3b82f6);
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  cursor: grab;
  margin-top: -6px; /* center thumb */
  position: relative;
  z-index: 2;
}

.quantity-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.1);
}

.quantity-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  background: linear-gradient(
    to right, 
    var(--color-primary, #3b82f6) 0%, 
    var(--color-primary, #3b82f6) var(--progress, 0%), 
    var(--color-border, #e5e7eb) var(--progress, 0%), 
    var(--color-border, #e5e7eb) 100%
  );
  border-radius: 3px;
}

/* Markers */
.slider-markers {
  display: flex;
  justify-content: space-between;
  margin-top: -16px; /* Move up to align with track */
  padding: 0 2px;
  pointer-events: none;
}

.marker {
  width: 2px;
  height: 6px;
  background: white; /* Cut through the track */
  border-radius: 1px;
  z-index: 1;
  opacity: 0.5;
}
</style>
