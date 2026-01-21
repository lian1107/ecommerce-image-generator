<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMarketingWorkflowStore } from '@/stores/marketingWorkflowStore'
import { VisionQAAgent, type QAFeedback } from '@/agents/VisionQAAgent'
import { AgentOrchestrator } from '@/agents/core/AgentOrchestrator'
import { geminiClient } from '@/services/geminiClient'
import { createPromptBuilder, PromptLayerType } from '@/services/promptBuilder'
import { BaseButton } from '@/components/common'

const store = useMarketingWorkflowStore()
const isProcessing = ref(false)
const progress = ref(0)
const totalItems = computed(() => store.contentPlan?.items.length || 0)

const startBatchProcess = async () => {
    if (!store.contentPlan) return
    isProcessing.value = true
    progress.value = 0
    
    const orchestrator = AgentOrchestrator.getInstance()
    const qaAgent = new VisionQAAgent()
    
    store.addThought('System', `Starting batch generation for ${totalItems.value} items via Deep Vision Engine...`)
    
    // Get DNA for Deep Vision
    const intrinsicDNA = store.productAnalysis?.intrinsic_dna || null
    const selectedRoute = store.marketingRoutes[store.selectedRouteIndex]
    const artDirectionDNA = selectedRoute?.art_direction_dna || null

    for (const [index, item] of store.contentPlan.items.entries()) {
        item.status = 'generating'
        store.addThought('Generator', `Generating Item #${index + 1}: ${item.title_zh}...`)
        
        try {
            // 1. Generate Image with Deep Vision Prompt Builder
            const referenceImages = store.getReferencesForGeneration(item.type, item.visual_prompt_en)
            
            store.addThought('Generator', `Applying Visual DNA: ${artDirectionDNA?.lighting_scenario?.style || 'Standard'}`)
            
            // Construct Deep Vision Prompt
            const settings = {
                aspectRatio: item.ratio,
                style: 'commercial',
                lighting: 'studio',
                quality: 'high',
                quantity: 1,
                background: 'white',
                enhanceDetails: true,
                removeBackground: false,
                addShadow: false,
                colorCorrection: true
            }

            const builder = createPromptBuilder()
                .setDeepVision(intrinsicDNA, artDirectionDNA)
                // Use the Agent's visual prompt as the core subject description
                .setLayerContent(PromptLayerType.CORE_SUBJECT, item.visual_prompt_en)
                // We can also inject settings to ensure builder adds quality keywords
                .setSettings(settings as any)
            
            const finalPrompt = builder.build().finalPrompt
            
            const results = await geminiClient.generateImage({
                prompt: finalPrompt,
                referenceImages: referenceImages,
                settings: settings as any
            })
            
            if (results && results.length > 0) {
                const imageUrl = results[0].imageUrl
                item.imageUrl = imageUrl
                item.status = 'reviewing'
                
                // 2. Vision QA
                store.addThought('VisionQA', `Inspecting Item #${index + 1}...`)
                const qaResult = await orchestrator.runAgent<QAFeedback>(qaAgent, {
                    images: [imageUrl],
                    additionalData: {
                        originalPrompt: item.visual_prompt_en
                    }
                })
                
                if (qaResult.success && qaResult.data) {
                    item.qaResult = {
                        pass: qaResult.data.pass,
                        reason: qaResult.data.reason
                    }
                    if (qaResult.data.pass) {
                         item.status = 'completed'
                         store.addThought('VisionQA', `Item #${index + 1} PASSED.`)
                    } else {
                         item.status = 'failed' // Or 'retry' in advanced implementation
                         store.addThought('VisionQA', `Item #${index + 1} FAILED: ${qaResult.data.reason}`)
                    }
                }
            }
            
        } catch (e: any) {
            console.error(e)
            item.status = 'failed'
            store.addThought('System', `Error on Item #${index + 1}: ${e.message}`)
        }
        
        progress.value = index + 1
    }
    
    isProcessing.value = false
    store.setStep('COMPLETED')
    store.addThought('System', 'Batch processing completed.')
}

const getStatusColor = (status?: string) => {
    switch(status) {
        case 'completed': return 'var(--color-success)'
        case 'failed': return 'var(--color-error)'
        case 'generating': return 'var(--color-primary)'
        case 'reviewing': return 'var(--color-warning)'
        default: return 'var(--color-text-secondary)'
    }
}
</script>

<template>
  <div class="step-content">
      <div class="header">
          <h2>4. Batch Generation & QA</h2>
          <p class="subtitle">Auto-generating images with built-in Agentic Quality Assurance.</p>
      </div>
      
      <div class="progress-section" v-if="isProcessing || progress > 0">
          <div class="progress-bar">
              <div class="fill" :style="{ width: (progress / totalItems) * 100 + '%' }"></div>
          </div>
          <div class="progress-text">{{ progress }} / {{ totalItems }} Completed</div>
      </div>
      
      <div v-else class="initial-action">
          <BaseButton 
             variant="primary" 
             size="lg"
             @click="startBatchProcess"
          >
             Start Generation Loop
          </BaseButton>
      </div>
      
      <!-- Results Grid -->
      <div class="results-grid" v-if="store.contentPlan?.items">
          <div 
             v-for="(item, index) in store.contentPlan.items" 
             :key="item.id"
             class="result-card"
          >
              <div class="result-image-area">
                  <img v-if="item.imageUrl" :src="item.imageUrl" loading="lazy" />
                  <div v-else class="placeholder">
                      {{ item.status || 'Pending' }}
                  </div>
                  
                   <!-- Status Badge -->
                  <div class="status-badge" :style="{ background: getStatusColor(item.status) }">
                      {{ item.status }}
                  </div>
              </div>
              
              <div class="result-info">
                  <h4>#{{ index + 1 }} {{ item.title_zh }}</h4>
                  <div v-if="item.qaResult" class="qa-info" :class="{ pass: item.qaResult.pass }">
                      <strong>QA:</strong> {{ item.qaResult.pass ? 'PASS' : 'FAIL' }} <br/>
                      <span class="reason">{{ item.qaResult.reason }}</span>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<style scoped>
.step-content {
    max-width: 1200px;
    margin: 0 auto;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.progress-section {
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.progress-bar {
    height: 8px;
    background: var(--color-bg-secondary);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.fill {
    height: 100%;
    background: var(--color-primary);
    transition: width 0.3s ease;
}

.progress-text {
    text-align: center;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
}

.initial-action {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.result-card {
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--color-border);
}

.result-image-area {
    aspect-ratio: 1; /* Default to square for grid, maybe adjust later */
    position: relative;
    background: #000;
}

.result-image-area img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
}

.status-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    color: white;
    text-transform: uppercase;
    font-weight: 600;
}

.result-info {
    padding: 1rem;
}

.result-info h4 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.qa-info {
    font-size: 0.8rem;
    padding: 6px;
    border-radius: 4px;
    background: rgba(255,0,0,0.1);
    color: var(--color-error);
}

.qa-info.pass {
    background: rgba(0,255,0,0.1);
    color: var(--color-success);
}

.reason {
    opacity: 0.8;
}
</style>
