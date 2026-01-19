<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMarketingWorkflowStore, type ContentPlan } from '@/stores/marketingWorkflowStore'
import { PlannerAgent } from '@/agents/PlannerAgent'
import { AgentOrchestrator } from '@/agents/core/AgentOrchestrator'
import { BaseButton } from '@/components/common'

const store = useMarketingWorkflowStore()
const isPlanning = ref(false)
const planSize = ref(8) // Default 8

const hasPlan = computed(() => !!store.contentPlan)
const selectedStrategy = computed(() => 
    store.selectedRouteIndex >= 0 ? store.marketingRoutes[store.selectedRouteIndex] : null
)

const startPlanning = async () => {
    if (!selectedStrategy.value) return
    
    isPlanning.value = true
    const planner = new PlannerAgent()
    const orchestrator = AgentOrchestrator.getInstance()
    
    try {
        store.setStep('PLANNING')
        store.addThought('Planner', `Drafting ${planSize.value}-item content plan based on selected strategy...`)
        
        const result = await orchestrator.runAgent<ContentPlan>(planner, {
            additionalData: {
                selectedStrategy: selectedStrategy.value,
                itemCount: planSize.value
            }
        })
        
        if (result.success && result.data) {
            store.contentPlan = result.data
            store.addThought('Planner', 'Content plan ready for review.')
        } else {
            store.addThought('Planner', `Planning failed: ${result.error}`)
        }
    } catch (e) {
        console.error(e)
    } finally {
        isPlanning.value = false
    }
}

const proceedToGeneration = () => {
    store.setStep('GENERATION')
}

// Helper to get ratio icon
const getRatioIcon = (ratio: string) => {
    if (ratio === '1:1') return '🔲'
    if (ratio === '9:16') return '📱'
    return '🖥️'
}
</script>

<template>
  <div class="step-content">
      <div class="header">
          <h2>3. 内容企划 (Content Planning)</h2>
          <p class="subtitle">根据您的策略生成完整的营销故事线。</p>
      </div>
      
      <!-- Initial State: No Plan -->
      <div v-if="!hasPlan" class="initial-action">
          <div class="strategy-summary" v-if="selectedStrategy">
              <h3>策略: {{ selectedStrategy.route_name }}</h3>
              <p>{{ selectedStrategy.subhead_zh }}</p>
          </div>
          
          <div class="control-group">
            <label>生成数量 (Sets):</label>
            <select v-model="planSize" class="size-select">
                <option :value="4">4 张 (迷你套图)</option>
                <option :value="6">6 张 (标准故事)</option>
                <option :value="8">8 张 (完整营销包)</option>
                <option :value="10">10 张 (扩展营销包)</option>
            </select>
          </div>

          <BaseButton 
             variant="primary" 
             size="lg"
             :loading="isPlanning"
             @click="startPlanning"
          >
             🤖 生成企划案 (Generate Plan)
          </BaseButton>
      </div>
      
      <!-- Plan View -->
      <div v-else class="plan-view">
           <div class="plan-header">
               <div class="plan-title-group">
                   <h3>{{ store.contentPlan?.plan_name }}</h3>
                   <span class="badge">{{ store.contentPlan?.items.length }} Items</span>
               </div>
               <div class="actions-top">
                   <select v-model="planSize" class="size-select-sm">
                        <option :value="4">4 张</option>
                        <option :value="6">6 张</option>
                        <option :value="8">8 张</option>
                        <option :value="10">10 张</option>
                    </select>
                   <BaseButton size="sm" @click="startPlanning">重新生成 (Regenerate)</BaseButton>
               </div>
           </div>
           
           <div class="plan-grid">
               <div 
                 v-for="(item, index) in store.contentPlan?.items" 
                 :key="item.id"
                 class="plan-item"
               >
                   <div class="item-header">
                       <span class="item-id">#{{ index + 1 }}</span>
                       <span class="item-type">{{ item.type }}</span>
                       <span class="item-ratio" :title="item.ratio">{{ getRatioIcon(item.ratio) }}</span>
                   </div>
                   
                   <div class="item-body">
                       <h4>{{ item.title_zh }}</h4>
                       <p class="copy">{{ item.copy_zh }}</p>
                       <div class="visual-desc">
                           <strong>画面:</strong> {{ item.visual_summary_zh }}
                       </div>
                   </div>
               </div>
           </div>
           
           <div class="actions">
               <BaseButton 
                 variant="primary" 
                 size="lg"
                 @click="proceedToGeneration"
               >
                 确认并开始批量生成 (Confirm & Generate) 🚀
               </BaseButton>
           </div>
      </div>
  </div>
</template>

<style scoped>
.step-content {
    max-width: 1000px;
    margin: 0 auto;
}

.header {
    text-align: center;
    margin-bottom: 2rem;
}

.subtitle {
    color: var(--color-text-secondary);
}

.initial-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 3rem;
    background: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
    text-align: center;
}

.strategy-summary {
    max-width: 600px;
}

.control-group {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.size-select {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    background: var(--color-bg-input);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    font-size: 1rem;
}

.size-select-sm {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: var(--color-bg-input);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    margin-right: 0.5rem;
}

.plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.plan-title-group {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.badge {
    background: var(--color-primary);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.plan-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.plan-item {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.item-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.5rem;
}

.item-type {
    text-transform: uppercase;
    font-weight: 600;
}

.item-body h4 {
    color: var(--color-primary);
    margin-bottom: 0.5rem;
    font-size: 1rem;
}

.copy {
    font-size: 0.9rem;
    color: var(--color-text);
    margin-bottom: 0.75rem;
    line-height: 1.4;
}

.visual-desc {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    background: rgba(0,0,0,0.1);
    padding: 6px;
    border-radius: 4px;
}

.actions {
    display: flex;
    justify-content: center;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
}
</style>
