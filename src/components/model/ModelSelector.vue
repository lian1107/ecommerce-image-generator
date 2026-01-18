<template>
  <div class="model-selector">
    <!-- 开关控制 -->
    <div class="model-toggle">
      <label class="toggle-label">
        <input
          type="checkbox"
          :checked="modelStore.isEnabled"
          @change="handleToggle"
        />
        <span class="toggle-text">添加模特</span>
      </label>
      
      <!-- 推荐提示 -->
      <div v-if="modelStore.hasRecommendation && !modelStore.isEnabled" class="recommendation-hint">
        <span class="hint-icon">💡</span>
        <span>根据产品类别，推荐使用{{ modelStore.currentRecommendation?.reason }}</span>
        <button class="apply-btn" @click="applyRecommendation">应用推荐</button>
      </div>
    </div>

    <!-- 模特配置面板 -->
    <div v-if="modelStore.isEnabled" class="model-config">
      <!-- 展示方式 -->
      <div class="config-section">
        <h4 class="section-title">展示方式</h4>
        <div class="display-type-grid">
          <button
            v-for="(label, type) in displayTypes"
            :key="type"
            class="display-type-btn"
            :class="{ active: modelStore.config.displayType === type }"
            @click="setDisplayType(type as ModelDisplayType)"
          >
            <span class="type-icon">{{ getDisplayIcon(type) }}</span>
            <span class="type-label">{{ label }}</span>
          </button>
        </div>
      </div>

      <!-- 局部展示聚焦 -->
      <div v-if="modelStore.config.displayType === 'partial'" class="config-section">
        <h4 class="section-title">聚焦部位</h4>
        <div class="option-grid">
          <button
            v-for="(label, focus) in partialFocusOptions"
            :key="focus"
            class="option-btn"
            :class="{ active: modelStore.config.partialFocus === focus }"
            @click="setPartialFocus(focus as ModelPartialFocus)"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <!-- 基础属性 -->
      <CollapseSection title="基础属性" :default-open="true">
        <div class="attributes-grid">
          <div class="attribute-item">
            <label>性别</label>
            <select v-model="modelStore.config.gender" @change="onConfigChange">
              <option v-for="(label, value) in genderOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="attribute-item">
            <label>年龄段</label>
            <select v-model="modelStore.config.ageGroup" @change="onConfigChange">
              <option v-for="(label, value) in ageGroupOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="attribute-item">
            <label>肤色</label>
            <select v-model="modelStore.config.skinTone" @change="onConfigChange">
              <option v-for="(label, value) in skinToneOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
        </div>
      </CollapseSection>

      <!-- 外观属性 -->
      <CollapseSection title="外观属性">
        <div class="attributes-grid">
          <div class="attribute-item">
            <label>发型</label>
            <select v-model="modelStore.config.hairStyle" @change="onConfigChange">
              <option v-for="(label, value) in hairStyleOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="attribute-item">
            <label>体型</label>
            <select v-model="modelStore.config.bodyType" @change="onConfigChange">
              <option v-for="(label, value) in bodyTypeOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="attribute-item">
            <label>妆容</label>
            <select v-model="modelStore.config.makeup" @change="onConfigChange">
              <option v-for="(label, value) in makeupOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
        </div>
      </CollapseSection>

      <!-- 表现属性 -->
      <CollapseSection title="表现属性">
        <div class="attributes-grid">
          <div class="attribute-item">
            <label>姿势</label>
            <select v-model="modelStore.config.pose" @change="onConfigChange">
              <option v-for="(label, value) in poseOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="attribute-item">
            <label>表情</label>
            <select v-model="modelStore.config.expression" @change="onConfigChange">
              <option v-for="(label, value) in expressionOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="attribute-item">
            <label>服装风格</label>
            <select v-model="modelStore.config.clothingStyle" @change="onConfigChange">
              <option v-for="(label, value) in clothingStyleOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
        </div>
      </CollapseSection>

      <!-- 使用推荐配置提示 -->
      <div v-if="modelStore.isUsingRecommendation" class="using-recommendation">
        <span class="rec-icon">✨</span>
        <span>正在使用推荐配置</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useModelStore, modelAttributeLabels } from '@/stores/modelStore'
import { useProductStore } from '@/stores/productStore'
import { getCategoryByKeyword } from '@/config/categories'
import { CollapseSection } from '@/components/common'
import type { ModelDisplayType, ModelPartialFocus } from '@/types'

const modelStore = useModelStore()
const productStore = useProductStore()

// 监听产品类别变化，自动获取推荐
watch(
  () => productStore.productInfo.category,
  (newCategory) => {
    if (newCategory) {
      // 尝试通过关键词匹配类别
      const category = getCategoryByKeyword(newCategory)
      if (category) {
        modelStore.getRecommendation(category.id)
      }
    }
  },
  { immediate: true }
)

// 展示方式选项
const displayTypes = {
  holding: '手持展示',
  wearing: '穿戴展示',
  using: '使用场景',
  partial: '局部展示'
}

// 属性选项
const genderOptions = modelAttributeLabels.gender
const ageGroupOptions = modelAttributeLabels.ageGroup
const skinToneOptions = modelAttributeLabels.skinTone
const hairStyleOptions = modelAttributeLabels.hairStyle
const bodyTypeOptions = modelAttributeLabels.bodyType
const makeupOptions = modelAttributeLabels.makeup
const poseOptions = modelAttributeLabels.pose
const expressionOptions = modelAttributeLabels.expression
const clothingStyleOptions = modelAttributeLabels.clothingStyle
const partialFocusOptions = modelAttributeLabels.partialFocus

// 图标映射
const getDisplayIcon = (type: string): string => {
  const icons: Record<string, string> = {
    holding: '🤲',
    wearing: '👔',
    using: '🎯',
    partial: '👋'
  }
  return icons[type] || '📷'
}

// 事件处理
const handleToggle = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  modelStore.setEnabled(checked)
  if (checked && modelStore.hasRecommendation) {
    modelStore.applyRecommendation()
  }
}

const setDisplayType = (type: ModelDisplayType) => {
  modelStore.setDisplayType(type)
}

const setPartialFocus = (focus: ModelPartialFocus) => {
  modelStore.setPartialFocus(focus)
}

const onConfigChange = () => {
  // 配置变更时标记不再使用推荐
  modelStore.isUsingRecommendation = false
}

const applyRecommendation = () => {
  modelStore.setEnabled(true)
  modelStore.applyRecommendation()
}
</script>

<style scoped>
.model-selector {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
}

.model-toggle {
  margin-bottom: 16px;
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

.recommendation-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.hint-icon {
  font-size: 16px;
}

.apply-btn {
  margin-left: auto;
  padding: 4px 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.apply-btn:hover {
  background: var(--primary-dark);
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

.display-type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.display-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.display-type-btn:hover {
  border-color: var(--border-hover);
}

.display-type-btn.active {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.type-icon {
  font-size: 24px;
}

.type-label {
  font-size: 12px;
  color: var(--text-primary);
}

.option-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-btn {
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-btn:hover {
  border-color: var(--border-hover);
}

.option-btn.active {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.attribute-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attribute-item label {
  font-size: 12px;
  color: var(--text-secondary);
}

.attribute-item select {
  padding: 8px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
}

.attribute-item select:focus {
  outline: none;
  border-color: var(--primary);
}

.using-recommendation {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 6px;
  font-size: 12px;
  color: var(--success);
}

.rec-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .attributes-grid {
    grid-template-columns: 1fr;
  }
  
  .display-type-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
