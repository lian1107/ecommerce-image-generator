<template>
  <div class="fusion-panel">
    <!-- 开关控制 -->
    <div class="fusion-toggle">
      <label class="toggle-label">
        <input
          type="checkbox"
          :checked="fusionStore.isEnabled"
          @change="handleToggle"
        />
        <span class="toggle-text">🔀 多图融合</span>
      </label>
      <span class="toggle-hint">将产品与指定场景/模特融合</span>
    </div>

    <!-- 融合配置面板 -->
    <div v-if="fusionStore.isEnabled" class="fusion-config">
      <!-- 融合模式选择 -->
      <div class="config-section">
        <h4 class="section-title">融合模式</h4>
        <div class="mode-grid">
          <button
            v-for="(label, mode) in fusionModes"
            :key="mode"
            class="mode-btn"
            :class="{ active: fusionStore.config.mode === mode }"
            @click="setMode(mode as FusionMode)"
          >
            <span class="mode-icon">{{ getModeIcon(mode) }}</span>
            <span class="mode-label">{{ label }}</span>
          </button>
        </div>
      </div>

      <!-- 参考图上传区域 -->
      <div class="reference-images">
        <!-- 场景参考图 -->
        <div
          v-if="showSceneSlot"
          class="image-slot"
          :class="{ 'has-image': fusionStore.hasSceneImage }"
        >
          <div class="slot-header">
            <span class="slot-icon">🏞️</span>
            <span class="slot-title">场景参考图</span>
          </div>
          
          <div v-if="fusionStore.config.sceneImage" class="slot-preview">
            <img :src="fusionStore.config.sceneImage.preview" alt="场景参考图" />
            <button class="remove-btn" @click="removeImage('scene')">×</button>
          </div>
          
          <label v-else class="slot-upload">
            <input
              type="file"
              accept="image/*"
              @change="e => handleFileUpload(e, 'scene')"
              hidden
            />
            <span class="upload-icon">📤</span>
            <span class="upload-text">点击上传场景图</span>
          </label>
        </div>

        <!-- 模特参考图 -->
        <div
          v-if="showModelSlot"
          class="image-slot"
          :class="{ 'has-image': fusionStore.hasModelImage }"
        >
          <div class="slot-header">
            <span class="slot-icon">👤</span>
            <span class="slot-title">模特参考图</span>
          </div>
          
          <div v-if="fusionStore.config.modelImage" class="slot-preview">
            <img :src="fusionStore.config.modelImage.preview" alt="模特参考图" />
            <button class="remove-btn" @click="removeImage('model')">×</button>
          </div>
          
          <label v-else class="slot-upload">
            <input
              type="file"
              accept="image/*"
              @change="e => handleFileUpload(e, 'model')"
              hidden
            />
            <span class="upload-icon">📤</span>
            <span class="upload-text">点击上传模特图</span>
          </label>
        </div>
      </div>

      <!-- 融合提示 -->
      <div class="fusion-tips">
        <p class="tip-icon">💡</p>
        <p class="tip-text">{{ fusionTip }}</p>
      </div>

      <!-- 生成检查 -->
      <div v-if="!fusionStore.canGenerate" class="fusion-warning">
        <span class="warning-icon">⚠️</span>
        <span>请上传必要的参考图后再生成</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFusionStore, fusionModeLabels } from '@/stores/fusionStore'
import type { FusionMode, ReferenceImageRole } from '@/types'

const fusionStore = useFusionStore()

// 融合模式选项
const fusionModes = fusionModeLabels

// 根据当前模式显示对应的上传槽位
const showSceneSlot = computed(() => 
  fusionStore.config.mode === 'product_scene' || 
  fusionStore.config.mode === 'full'
)

const showModelSlot = computed(() => 
  fusionStore.config.mode === 'product_model' || 
  fusionStore.config.mode === 'full'
)

// 动态提示文本
const fusionTip = computed(() => {
  switch (fusionStore.config.mode) {
    case 'product_scene':
      return 'AI 会将您的产品自然融入到场景参考图中，自动匹配光照和透视。建议使用清晰的环境图。'
    case 'product_model':
      return 'AI 会让参考图中的模特自然地展示您的产品。无需设置姿势，只需上传包含模特的图片。'
    case 'full':
      return '全融合模式会将产品、场景和模特三者完美结合。请确保参考图风格协调。'
    default:
      return '上传参考图后，AI 会自动处理融合细节。'
  }
})

// 模式图标
const getModeIcon = (mode: string): string => {
  const icons: Record<string, string> = {
    product_scene: '🏞️',
    product_model: '👤',
    full: '🎨'
  }
  return icons[mode] || '📷'
}

// 事件处理
const handleToggle = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  fusionStore.setEnabled(checked)
}

const setMode = (mode: FusionMode) => {
  fusionStore.setMode(mode)
}

const handleFileUpload = async (e: Event, role: ReferenceImageRole) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    await fusionStore.addReferenceImage(file, role)
    input.value = '' // 清空以允许再次选择同一文件
  }
}

const removeImage = (role: ReferenceImageRole) => {
  fusionStore.removeReferenceImage(role)
}
</script>

<style scoped>
.fusion-panel {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.fusion-toggle {
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

.fusion-config {
  margin-top: 16px;
}

.config-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: 10px;
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
  font-size: 20px;
}

.mode-label {
  font-size: 11px;
  color: var(--text-primary);
  text-align: center;
}

.reference-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.image-slot {
  background: var(--bg-tertiary);
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 12px;
  transition: all 0.2s;
}

.image-slot.has-image {
  border-style: solid;
  border-color: var(--success);
}

.slot-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.slot-icon {
  font-size: 16px;
}

.slot-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.slot-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.slot-preview img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.9);
}

.slot-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.slot-upload:hover {
  background: rgba(99, 102, 241, 0.05);
}

.upload-icon {
  font-size: 24px;
}

.upload-text {
  font-size: 11px;
  color: var(--text-secondary);
  text-align: center;
}

.fusion-tips {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08));
  border-radius: 8px;
  margin-bottom: 12px;
}

.tip-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.tip-text {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.fusion-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: var(--warning);
}

.warning-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .mode-grid {
    grid-template-columns: 1fr;
  }
  
  .reference-images {
    grid-template-columns: 1fr;
  }
}
</style>
