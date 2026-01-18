<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore'
import { BaseTextarea, BaseRange, BaseButton } from '@/components/common'

const settingsStore = useSettingsStore()
</script>

<template>
  <div class="advanced-options">
    <button
      class="advanced-options__toggle"
      @click="settingsStore.toggleAdvancedOptions"
    >
      <span class="advanced-options__toggle-icon">
        {{ settingsStore.showAdvancedOptions ? '▼' : '▶' }}
      </span>
      <span>高级选项</span>
    </button>

    <Transition name="slide">
      <div v-if="settingsStore.showAdvancedOptions" class="advanced-options__content">
        <BaseTextarea
          :model-value="settingsStore.advancedOptions.negativePrompt"
          label="负面提示词"
          placeholder="描述不想出现的内容..."
          :rows="2"
          hint="用于排除不需要的元素"
          @update:model-value="settingsStore.setNegativePrompt"
        />

        <BaseRange
          :model-value="settingsStore.advancedOptions.guidance"
          :min="1"
          :max="20"
          :step="0.5"
          label="引导强度"
          @update:model-value="(v) => settingsStore.setAdvancedOption('guidance', v)"
        />

        <BaseRange
          :model-value="settingsStore.advancedOptions.steps"
          :min="10"
          :max="50"
          :step="5"
          label="生成步数"
          unit="步"
          @update:model-value="(v) => settingsStore.setAdvancedOption('steps', v)"
        />

        <div class="advanced-options__seed">
          <div class="advanced-options__seed-header">
            <label class="advanced-options__seed-label">随机种子</label>
            <div class="advanced-options__seed-actions">
              <BaseButton
                variant="ghost"
                size="sm"
                @click="settingsStore.randomizeSeed"
              >
                🎲 随机
              </BaseButton>
              <BaseButton
                v-if="settingsStore.advancedOptions.seed !== undefined"
                variant="ghost"
                size="sm"
                @click="settingsStore.clearSeed"
              >
                清除
              </BaseButton>
            </div>
          </div>
          <p class="advanced-options__seed-value">
            {{ settingsStore.advancedOptions.seed ?? '随机' }}
          </p>
          <p class="advanced-options__seed-hint">
            设置固定种子可复现相同结果
          </p>
        </div>

        <div class="advanced-options__actions">
          <BaseButton
            variant="outline"
            size="sm"
            @click="settingsStore.resetToDefaults"
          >
            重置为默认
          </BaseButton>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.advanced-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.advanced-options__toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  background: none;
  border: none;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted, #6b7280);
  cursor: pointer;
  transition: color 0.2s;
}

.advanced-options__toggle:hover {
  color: var(--color-text, #374151);
}

.advanced-options__toggle-icon {
  font-size: 0.625rem;
  transition: transform 0.2s;
}

.advanced-options__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: var(--radius-md, 0.5rem);
}

.advanced-options__seed {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.advanced-options__seed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.advanced-options__seed-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text, #374151);
}

.advanced-options__seed-actions {
  display: flex;
  gap: 0.25rem;
}

.advanced-options__seed-value {
  font-size: 0.9375rem;
  font-family: monospace;
  color: var(--color-primary, #3b82f6);
  margin: 0;
}

.advanced-options__seed-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
  margin: 0;
}

.advanced-options__actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  max-height: 400px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
