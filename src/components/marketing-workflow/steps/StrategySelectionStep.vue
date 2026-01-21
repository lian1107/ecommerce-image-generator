<script setup lang="ts">
import { ref } from 'vue'
import { useMarketingWorkflowStore } from '@/stores/marketingWorkflowStore'
import { CriticAgent, type CriticFeedback } from '@/agents/CriticAgent'
import { AgentOrchestrator } from '@/agents/core/AgentOrchestrator'
import { BaseButton } from '@/components/common'

const store = useMarketingWorkflowStore()
const isCritiquing = ref(false)

const selectRoute = async (index: number) => {
    store.selectedRouteIndex = index
    
    // Auto-trigger Critic Agent on selection
    await runCriticCheck()
}

const runCriticCheck = async () => {
    isCritiquing.value = true
    const critic = new CriticAgent()
    const orchestrator = AgentOrchestrator.getInstance()
    
    const selectedRoute = store.marketingRoutes[store.selectedRouteIndex]
    
    try {
        store.setStep('CRITIQUING')
        store.addThought('Critic', `Reviewing route: "${selectedRoute.route_name}"...`)
        
        const result = await orchestrator.runAgent<CriticFeedback>(critic, {
            additionalData: {
                brandContext: store.productInput.brandContext,
                strategies: [selectedRoute] // Criticize single selected strategy for depth
            }
        })
        
        if (result.success && result.data?.approved) {
             store.addThought('Critic', `Strategy approved! Score: ${result.data.score}`)
             store.setStep('STRATEGY_READY')
        } else {
             store.addThought('Critic', `Concerns raised: ${result.data?.critique}`)
             // In full implementation, we would offer edit options or auto-regen here.
             // For now, allow proceed but with warning.
             store.setStep('STRATEGY_READY') 
        }
        
    } catch (e) {
        console.error(e)
    } finally {
        isCritiquing.value = false
    }
}

const proceedToPlanning = () => {
    store.setStep('PLANNING')
}
</script>

<template>
  <div class="step-content">
      <div class="header">
          <h2>2. Strategy Selection</h2>
          <p class="subtitle">The Director Agent proposed 3 visual strategies. Select one to proceed.</p>
      </div>
      
      <div class="routes-grid">
          <div 
            v-for="(route, index) in store.marketingRoutes" 
            :key="index"
            class="route-card"
            :class="{ active: store.selectedRouteIndex === index }"
            @click="selectRoute(index)"
          >
              <div class="route-header">
                  <h3>{{ route.route_name }}</h3>
                  <span class="tag">{{ route.headline_zh }}</span>
              </div>
              
              <div class="route-body">
                  <p class="description">{{ route.style_brief_zh }}</p>
                  
                  <div class="meta-info">
                      <strong>🎯 Audience:</strong> {{ route.target_audience_zh }}
                  </div>
                  
                   <div class="visual-specs">
                       <strong>🎨 Elements:</strong> {{ route.visual_elements_zh }}
                  </div>

                  <!-- Deep Vision DNA Display -->
                  <div class="dna-block" v-if="route.art_direction_dna">
                      <div class="dna-item">
                          <span class="dna-icon">💡</span>
                          <span>{{ route.art_direction_dna.lighting_scenario?.style }}</span>
                      </div>
                      <div class="dna-item">
                          <span class="dna-icon">📷</span>
                          <span>{{ route.art_direction_dna.photography_settings?.shot_scale }}</span>
                      </div>
                      <div class="dna-item">
                          <span class="dna-icon">🍭</span>
                          <span>{{ route.art_direction_dna.color_grading?.tone }}</span>
                      </div>
                      <!-- Deep Vision 2.0 -->
                      <div class="dna-item" v-if="route.art_direction_dna.optical_mechanics">
                          <span class="dna-icon">👁️</span>
                          <span>{{ route.art_direction_dna.optical_mechanics.lens_type }}</span>
                      </div>
                       <div class="dna-item dna-taboo" v-if="route.art_direction_dna.negative_constraints?.forbidden_elements?.length">
                          <span class="dna-icon">🚫</span>
                          <span>No: {{ route.art_direction_dna.negative_constraints.forbidden_elements[0] }}...</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      <div class="actions" v-if="store.currentStep === 'STRATEGY_READY'">
          <div class="critic-summary">
              ✅ Strategy Ready for Content Planning
          </div>
          <BaseButton 
             variant="primary" 
             size="lg"
             @click="proceedToPlanning"
          >
             Confirm Strategy & Start Planning
          </BaseButton>
      </div>
  </div>
</template>

<style scoped>
.step-content {
    max-width: 1000px;
    margin: 0 auto;
}

.header {
    margin-bottom: 2rem;
    text-align: center;
}

.subtitle {
    color: var(--color-text-secondary);
}

.routes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.route-card {
    background: var(--color-bg-secondary);
    border: 2px solid transparent;
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
}

.route-card:hover {
    background: var(--color-bg-hover);
    transform: translateY(-2px);
}

.route-card.active {
    border-color: var(--color-primary);
    background: var(--color-bg-card);
    box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.2);
}

.route-header {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
}

.route-header h3 {
    margin-bottom: 0.5rem;
    color: var(--color-primary);
}

.tag {
    font-size: 0.85rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
}

.route-body {
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: var(--color-text);
}

.meta-info, .visual-specs {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    background: rgba(0,0,0,0.2);
    padding: 8px;
    border-radius: 4px;
}

.actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
    animation: fadeIn 0.5s ease;
}

.critic-summary {
    color: var(--color-success);
    font-weight: 600;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.dna-block {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--color-border);
    flex-wrap: wrap;
}

.dna-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    background: var(--color-bg-tertiary);
    padding: 4px 8px;
    border-radius: 4px;
    color: var(--color-text-secondary);
}

.dna-taboo {
    background: rgba(255, 0, 0, 0.1);
    color: var(--color-error);
}
</style>
