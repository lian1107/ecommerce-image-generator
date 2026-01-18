<template>
  <div class="consistency-panel">
    <!-- 开关控制 -->
    <div class="consistency-toggle">
      <label class="toggle-label">
        <input
          type="checkbox"
          :checked="consistencyStore.isEnabled"
          @change="handleToggle"
        />
        <span class="toggle-text">🎨 一致性系统</span>
      </label>
      <span class="toggle-hint">保持风格、角色或色调的一致性</span>
    </div>

    <!-- 配置面板 -->
    <div v-if="consistencyStore.isEnabled" class="consistency-config">
      <!-- 模式选择 -->
      <div class="config-section">
        <h4 class="section-title">一致性模式</h4>
        <div class="mode-grid">
          <button
            v-for="(label, mode) in consistencyModes"
            :key="mode"
            class="mode-btn"
            :class="{ active: consistencyStore.config.mode === mode }"
            @click="setMode(mode as ConsistencyMode)"
          >
            <span class="mode-icon">{{ getModeIcon(mode) }}</span>
            <span class="mode-label">{{ label }}</span>
          </button>
        </div>
      </div>

      <!-- 参考图库 -->
      <div class="reference-gallery">
        <div class="gallery-header">
          <h4 class="section-title">参考图库 ({{ consistencyStore.config.referenceImages.length }}/14)</h4>
          <label class="add-btn" :class="{ disabled: isMaxImages }">
            <input
              type="file"
              accept="image/*"
              multiple
              @change="handleFileUpload"
              :disabled="isMaxImages"
              hidden
            />
            <span>+ 添加图片</span>
          </label>
        </div>

        <div class="image-grid">
          <!-- 图片列表 -->
          <div 
            v-for="img in consistencyStore.config.referenceImages" 
            :key="img.id"
            class="gallery-item"
          >
            <img :src="img.preview" :alt="img.name" />
            <button class="remove-btn" @click="removeImage(img.id)">×</button>
          </div>

          <!-- 空状态提示 -->
          <div v-if="consistencyStore.config.referenceImages.length === 0" class="empty-state">
            <span class="empty-icon">📂</span>
            <span class="empty-text">请上传参考图片<br>支持上传多张</span>
          </div>
        </div>
      </div>

      <!-- 强度控制 -->
      <div class="strength-control">
        <div class="control-header">
          <span class="control-label">一致性强度</span>
          <span class="control-value">{{ Math.round(consistencyStore.config.strength * 100) }}%</span>
        </div>
        <input 
          type="range" 
          v-model.number="consistencyStore.config.strength" 
          min="0" 
          max="1" 
          step="0.1"
          class="strength-slider"
        >
      </div>

      <!-- 提示信息 -->
      <div class="consistency-tips">
        <p class="tip-icon">💡</p>
        <p class="tip-text">{{ modeTip }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsistencyStore, consistencyModeLabels } from '@/stores/consistencyStore'
import type { ConsistencyMode } from '@/types'

const consistencyStore = useConsistencyStore()
const consistencyModes = consistencyModeLabels

const isMaxImages = computed(() => consistencyStore.config.referenceImages.length >= 14)

const getModeIcon = (mode: string): string => {
  const icons: Record<string, string> = {
    style: '🎨',
    character: '👤',
    color: '🌈',
    brand: '🏢'
  }
  return icons[mode] || '🖼️'
}

const modeTip = computed(() => {
  switch (consistencyStore.config.mode) {
    case 'style':
      return 'AI 会学习参考图的艺术风格、笔触和光影，并应用到生成的图片中。'
    case 'character':
      return 'AI 会保持参考图中人物的面部特征、发型和体型特征。建议上传同一人物的多角度照片。'
    case 'color':
      return 'AI 会严格遵循参考图的配色方案和色调平衡。'
    case 'brand':
      return 'AI 会遵循参考图体现的品牌视觉识别系统（VI）。'
    default:
      return '上传参考图以保持一致性。'
  }
})

const handleToggle = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  consistencyStore.setEnabled(checked)
}

const setMode = (mode: ConsistencyMode) => {
  consistencyStore.setMode(mode)
}

const handleFileUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (files) {
    for (let i = 0; i < files.length; i++) {
      await consistencyStore.addReferenceImage(files[i])
    }
    input.value = ''
  }
}

const removeImage = (id: string) => {
  consistencyStore.removeReferenceImage(id)
}
</script>

<style scoped>
.consistency-panel {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.consistency-toggle {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
}

.toggle-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
}

.toggle-text {
  font-size: 15px;
}

.toggle-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 28px;
}

.consistency-config {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

/* Mode Grid */
.mode-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: var(--border-hover);
}

.mode-btn.active {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.mode-icon {
  font-size: 18px;
}

.mode-label {
  font-size: 10px;
  color: var(--text-primary);
  text-align: center;
  white-space: nowrap;
}

/* Gallery */
.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.add-btn {
  font-size: 12px;
  color: var(--primary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(99, 102, 241, 0.1);
  transition: all 0.2s;
}

.add-btn:hover:not(.disabled) {
  background: rgba(99, 102, 241, 0.2);
}

.add-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  min-height: 80px;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--bg-tertiary);
  border: 2px dashed var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  gap: 8px;
}

.empty-icon {
  font-size: 24px;
}

.empty-text {
  font-size: 12px;
  text-align: center;
  line-height: 1.4;
}

/* Strength Slider */
.strength-control {
  padding: 0 4px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.strength-slider {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  accent-color: var(--primary);
}

/* Tips */
.consistency-tips {
  display: flex;
  gap: 8px;
  padding: 10px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08));
  border-radius: 8px;
}

.tip-icon {
  font-size: 14px;
}

.tip-text {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .mode-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .image-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
