<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMarketingWorkflowStore, type ProductAnalysis, type MarketingRoute } from '@/stores/marketingWorkflowStore'
import { DirectorAgent } from '@/agents/DirectorAgent'
import { AgentOrchestrator } from '@/agents/core/AgentOrchestrator'
import { BaseButton } from '@/components/common'

const store = useMarketingWorkflowStore()
const isAnalyzing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Computed
const hasFiles = computed(() => !!store.productInput.referenceImage)
const canStart = computed(() => hasFiles.value && store.productInput.productName.length > 0)

// Actions
const triggerFileUpload = () => {
    fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
        const reader = new FileReader()
        reader.onload = (e) => {
             store.productInput.referenceImage = e.target?.result as string
        }
        reader.readAsDataURL(target.files[0])
    }
}

const runAnalysis = async () => {
    if (!canStart.value) return
    isAnalyzing.value = true
    
    // Simulate Workflow State Change
    store.initAgentOrchestrator() // Ensure logger is hooked
    
    const director = new DirectorAgent()
    const orchestrator = AgentOrchestrator.getInstance()
    
    try {
        store.addThought('System', 'Starting Director Agent for Product Analysis...')
        
        const result = await orchestrator.runAgent<{
            analysis: ProductAnalysis;
            routes: MarketingRoute[];
        }>(director, {
            userPrompt: store.productInput.productName,
            images: store.productInput.referenceImage ? [store.productInput.referenceImage] : [],
            additionalData: {
                brandContext: store.productInput.brandContext
            }
        })
        
        if (result.success && result.data) {
            store.productAnalysis = result.data.analysis
            store.marketingRoutes = result.data.routes
            store.setStep('STRATEGY') // Move to next step
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
          <p class="subtitle">上传您的产品图片并提供基本信息，Director Agent (视觉总监) 将对其进行深度分析。</p>
          
          <div class="form-grid">
              <!-- Image Upload -->
              <div class="upload-zone" @click="triggerFileUpload" :class="{ 'has-image': hasFiles }">
                  <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" hidden />
                  <div v-if="store.productInput.referenceImage" class="preview-wrapper">
                      <img :src="store.productInput.referenceImage" alt="Preview" />
                  </div>
                  <div v-else class="placeholder">
                      <span class="icon">📷</span>
                      <span>点击上传产品图片</span>
                  </div>
              </div>
              
              <!-- Text Inputs -->
              <div class="text-inputs">
                  <div class="form-group">
                      <label>产品名称 (Product Name)</label>
                      <input 
                        v-model="store.productInput.productName" 
                        type="text" 
                        placeholder="例如：智能咖啡机"
                        class="base-input"
                      />
                  </div>
                  
                  <div class="form-group">
                      <label>品牌背景 / Slogan (选填)</label>
                      <textarea 
                        v-model="store.productInput.brandContext" 
                        placeholder="例如：品牌专注于极简主义和可持续发展..."
                        class="base-input textarea"
                        rows="4"
                      ></textarea>
                  </div>
                  
                  <BaseButton 
                    variant="primary" 
                    :disabled="!canStart || isAnalyzing"
                    :loading="isAnalyzing"
                    @click="runAnalysis"
                    class="analyze-btn"
                  >
                    {{ isAnalyzing ? '正在分析中...' : '开始分析与策略生成' }}
                  </BaseButton>
              </div>
          </div>
      </div>
  </div>
</template>

<style scoped>
.step-content {
    max-width: 900px;
    margin: 0 auto;
}

h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.subtitle {
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.upload-zone {
    aspect-ratio: 1;
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.2s;
    background: var(--color-bg-secondary);
}

.upload-zone:hover {
    border-color: var(--color-primary);
    background: var(--color-bg-hover);
}

.preview-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: var(--color-text-secondary);
}

.icon {
    font-size: 2rem;
}

.text-inputs {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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

.textarea {
    resize: vertical;
}

.analyze-btn {
    margin-top: auto;
}
</style>
