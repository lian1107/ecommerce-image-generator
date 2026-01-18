<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore'
import { BaseSelect, CollapseSection } from '@/components/common'
import QuantitySelector from './QuantitySelector.vue'
import AdvancedOptions from './AdvancedOptions.vue'

const settingsStore = useSettingsStore()
</script>

<template>
  <CollapseSection title="生成设置" icon="⚙️" :default-open="true">
    <div class="generation-settings">
      <QuantitySelector />

      <div class="generation-settings__grid">
        <BaseSelect
          :model-value="settingsStore.settings.aspectRatio"
          :options="settingsStore.aspectRatioOptions"
          label="图片比例"
          @update:model-value="(v) => settingsStore.setAspectRatio(v as any)"
        />

        <BaseSelect
          :model-value="settingsStore.settings.quality"
          :options="settingsStore.qualityOptions"
          label="图片质量"
          @update:model-value="(v) => settingsStore.setQuality(v as any)"
        />

        <BaseSelect
          :model-value="settingsStore.settings.style"
          :options="settingsStore.styleOptions"
          label="风格"
          @update:model-value="(v) => settingsStore.setStyle(v as any)"
        />

        <BaseSelect
          :model-value="settingsStore.settings.lighting"
          :options="settingsStore.lightingOptions"
          label="光照"
          @update:model-value="(v) => settingsStore.setLighting(v as any)"
        />
      </div>

      <div class="generation-settings__toggles">
        <label class="toggle-option">
          <input
            type="checkbox"
            :checked="settingsStore.settings.enhanceDetails"
            @change="settingsStore.toggleEnhanceDetails"
          />
          <span class="toggle-option__label">增强细节</span>
        </label>

        <label class="toggle-option">
          <input
            type="checkbox"
            :checked="settingsStore.settings.addShadow"
            @change="settingsStore.toggleAddShadow"
          />
          <span class="toggle-option__label">添加阴影</span>
        </label>

        <label class="toggle-option">
          <input
            type="checkbox"
            :checked="settingsStore.settings.colorCorrection"
            @change="settingsStore.toggleColorCorrection"
          />
          <span class="toggle-option__label">颜色校正</span>
        </label>
      </div>

      <AdvancedOptions />
    </div>
  </CollapseSection>
</template>

<style scoped>
.generation-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.generation-settings__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.generation-settings__toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.toggle-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.toggle-option input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-primary, #3b82f6);
  cursor: pointer;
}

.toggle-option__label {
  color: var(--color-text, #374151);
}
</style>
