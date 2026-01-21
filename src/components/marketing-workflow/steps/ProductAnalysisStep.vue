<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
    useMarketingWorkflowStore, 
    type ProductAnalysis, 
    type MarketingRoute,
    type ReferenceCategory,
    CATEGORY_LIMITS,
    CATEGORY_LABELS 
} from '@/stores/marketingWorkflowStore'
import { DirectorAgent } from '@/agents/DirectorAgent'
import { AgentOrchestrator } from '@/agents/core/AgentOrchestrator'
import { BaseButton } from '@/components/common'

const store = useMarketingWorkflowStore()
const isAnalyzing = ref(false)

// 分类顺序
const categories: ReferenceCategory[] = ['product', 'style', 'brand', 'model']

// Computed
const hasProductImages = computed(() => store.productInput.references.product.length > 0)
const canStart = computed(() => hasProductImages.value && store.productInput.productName.length > 0)

// 检查某分类是否达到上限
const isCategoryFull = (category: ReferenceCategory) => {
    return store.productInput.references[category].length >= CATEGORY_LIMITS[category]
}

// 获取某分类的图片数量
const getCategoryCount = (category: ReferenceCategory) => {
    return store.productInput.references[category].length
}

// Actions
const handleFileUpload = async (event: Event, category: ReferenceCategory) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
        for (let i = 0; i < target.files.length; i++) {
            const file = target.files[i]
            await store.addReference(category, file)
        }
        target.value = '' // Reset input
    }
}

const removeImage = (category: ReferenceCategory, id: string) => {
    store.removeReference(category, id)
}

const runAnalysis = async () => {
    if (!canStart.value) return
    isAnalyzing.value = true
    
    store.initAgentOrchestrator()
    
    const director = new DirectorAgent()
    const orchestrator = AgentOrchestrator.getInstance()
    
    try {
        store.addThought('System', 'Starting Director Agent for Product Analysis...')
        
        // 获取产品图用于分析
        const productImages = store.productInput.references.product.map(r => r.preview)
        
        const result = await orchestrator.runAgent<{
            analysis: ProductAnalysis;
            routes: MarketingRoute[];
        }>(director, {
            userPrompt: store.productInput.productName,
            images: productImages,
            additionalData: {
                brandContext: store.productInput.brandContext
            }
        })
        
        if (result.success && result.data) {
            store.productAnalysis = result.data.analysis
            store.marketingRoutes = result.data.routes
            store.setStep('STRATEGY')
        } else {
            store.addThought('System', `Analysis Failed: ${result.error}`)
        }
        
    } catch (e) {
        console.error(e)
    } finally {
        isAnalyzing.value = false
    }
}
</script>

<template>
  <div class="step-content">
      <div class="input-section">
          <h2>1. 产品分析 (Product Analysis)</h2>
          <p class="subtitle">上传产品多角度图片和参考素材，Director Agent (视觉总监) 将进行深度分析。</p>
          
          <!-- 参考图库区域 -->
          <div class="reference-library">
              <div 
                v-for="category in categories" 
                :key="category"
                class="category-section"
                :class="{ 'full-width': category === 'product' }"
              >
                  <div class="category-header">
                      <span class="category-icon">{{ CATEGORY_LABELS[category].icon }}</span>
                      <span class="category-name">{{ CATEGORY_LABELS[category].name }}</span>
                      <span class="category-count">
                          {{ getCategoryCount(category) }}/{{ CATEGORY_LIMITS[category] }}
                      </span>
                      <label class="add-btn" :class="{ disabled: isCategoryFull(category) }">
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            @change="(e) => handleFileUpload(e, category)"
                            :disabled="isCategoryFull(category)"
                            hidden 
                          />
                          <span>+ 添加</span>
                      </label>
                  </div>
                  
                  <div class="image-grid" :class="{ 'grid-large': category === 'product' }">
                      <!-- 已上传图片 -->
                      <div 
                        v-for="img in store.productInput.references[category]" 
                        :key="img.id"
                        class="image-item"
                      >
                          <img :src="img.preview" :alt="img.name" />
                          <button class="remove-btn" @click="removeImage(category, img.id)">×</button>
                      </div>
                      
                      <!-- 空状态 -->
                      <div 
                        v-if="store.productInput.references[category].length === 0" 
                        class="empty-slot"
                      >
                          <span class="empty-icon">{{ CATEGORY_LABELS[category].icon }}</span>
                          <span class="empty-text">{{ CATEGORY_LABELS[category].hint }}</span>
                      </div>
                  </div>
              </div>
          </div>
          
          <!-- 产品信息输入 -->
          <div class="info-section">
              <div class="form-row">
                  <div class="form-group flex-2">
                      <label>产品名称 <span class="required">*</span></label>
                      <input 
                        v-model="store.productInput.productName" 
                        type="text" 
                        placeholder="例如：W-KING 便携户外K歌音响"
                        class="base-input"
                      />
                  </div>
                  
                  <div class="form-group flex-3">
                      <label>品牌背景 / Slogan (选填)</label>
                      <input 
                        v-model="store.productInput.brandContext" 
                        type="text" 
                        placeholder="例如：随时随地，自由歌唱"
                        class="base-input"
                      />
                  </div>
              </div>
              
              <div class="action-bar">
                  <div class="validation-hint" v-if="!hasProductImages">
                      ⚠️ 请至少上传1张产品图片
                  </div>
                  <BaseButton 
                    variant="primary" 
                    size="lg"
                    :disabled="!canStart || isAnalyzing"
                    :loading="isAnalyzing"
                    @click="runAnalysis"
                  >
                    {{ isAnalyzing ? '正在分析中...' : '🤖 开始分析与策略生成' }}
                  </BaseButton>
              </div>
          </div>
      </div>
  </div>
</template>

<style scoped>
.step-content {
    max-width: 1000px;
    margin: 0 auto;
}

h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.subtitle {
    color: var(--color-text-secondary);
    margin-bottom: 1.5rem;
}

/* 参考图库 */
.reference-library {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.category-section {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1rem;
}

.category-section.full-width {
    grid-column: 1 / -1;
}

.category-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
}

.category-icon {
    font-size: 1.1rem;
}

.category-name {
    font-weight: 600;
    font-size: 0.9rem;
}

.category-count {
    color: var(--color-text-secondary);
    font-size: 0.8rem;
    margin-left: auto;
}

.add-btn {
    font-size: 0.75rem;
    color: var(--color-primary);
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

/* 图片网格 */
.image-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    min-height: 60px;
}

.image-grid.grid-large {
    grid-template-columns: repeat(6, 1fr);
}

.image-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--color-border);
}

.image-item img {
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
    opacity: 0;
    transition: opacity 0.2s;
}

.image-item:hover .remove-btn {
    opacity: 1;
}

.empty-slot {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--color-bg-tertiary);
    border: 2px dashed var(--color-border);
    border-radius: 6px;
    color: var(--color-text-secondary);
    gap: 0.5rem;
}

.empty-icon {
    font-size: 1.5rem;
    opacity: 0.5;
}

.empty-text {
    font-size: 0.75rem;
    text-align: center;
    line-height: 1.4;
}

/* 产品信息 */
.info-section {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1.25rem;
}

.form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group.flex-2 {
    flex: 2;
}

.form-group.flex-3 {
    flex: 3;
}

.form-group label {
    font-size: 0.85rem;
    font-weight: 500;
}

.required {
    color: var(--color-error);
}

.base-input {
    padding: 0.75rem;
    background: var(--color-bg-input);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text);
}

.base-input:focus {
    border-color: var(--color-primary);
    outline: none;
}

.action-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
}

.validation-hint {
    color: var(--color-warning);
    font-size: 0.85rem;
}

@media (max-width: 768px) {
    .reference-library {
        grid-template-columns: 1fr;
    }
    .category-section.full-width {
        grid-column: 1;
    }
    .image-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    .image-grid.grid-large {
        grid-template-columns: repeat(4, 1fr);
    }
    .form-row {
        flex-direction: column;
    }
}
</style>
