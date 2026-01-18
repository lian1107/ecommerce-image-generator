<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Layout components
import { AppNavbar, ControlPanel, Workspace, InfoPanel } from '@/components/layout'

// Business components
import ApiConfigModal from '@/components/api/ApiConfigModal.vue'
import QuickPage from '@/components/pages/QuickPage.vue'
import AdvancedPage from '@/components/pages/AdvancedPage.vue'
import GenerationSettings from '@/components/settings/GenerationSettings.vue'
import PromptPreview from '@/components/prompt/PromptPreview.vue'
import ResultsGrid from '@/components/results/ResultsGrid.vue'
import HistoryList from '@/components/history/HistoryList.vue'
import StatsPanel from '@/components/stats/StatsPanel.vue'

// Common components
import { BaseButton, BaseToast } from '@/components/common'

// Composables & Stores
import { useApiStore } from '@/stores/apiStore'
import { useGenerationStore } from '@/stores/generationStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useFusionStore } from '@/stores/fusionStore'
import { usePromptBuilder } from '@/composables/usePromptBuilder'
import { toast } from '@/composables/useToast'

const apiStore = useApiStore()
const generationStore = useGenerationStore()
const historyStore = useHistoryStore()
const fusionStore = useFusionStore()
const { buildPrompt } = usePromptBuilder()

const isGenerating = ref(false)
const showSettingsModal = ref(false)
const currentMode = ref<'quick' | 'advanced'>('quick')

const switchMode = (mode: 'quick' | 'advanced') => {
  currentMode.value = mode
  // 切换模式时自动控制融合功能的启用状态
  if (mode === 'quick') {
    fusionStore.setEnabled(false)
  }
}

const handleStartGeneration = async () => {
  if (!apiStore.isConfigured) {
    showSettingsModal.value = true
    toast.warning('Please configure API Key first')
    return
  }

  if (!apiStore.connectionStatus.isConnected) {
    showSettingsModal.value = true
    toast.warning('Please test API connection first')
    return
  }

  // Build prompt before generation
  buildPrompt()

  isGenerating.value = true

  try {
    const success = await generationStore.startGeneration()

    if (success) {
      toast.success(`Successfully generated ${generationStore.resultCount} images`)
    } else {
      toast.error('Generation failed')
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Generation Error')
  } finally {
    isGenerating.value = false
  }
}

onMounted(() => {
  historyStore.checkAndCleanup()

  if (apiStore.isConfigured && !apiStore.connectionStatus.isConnected) {
    apiStore.testConnection()
  }
})
</script>

<template>
  <div class="app">
    <AppNavbar @open-settings="showSettingsModal = true" />

    <div class="app__main">
      <ControlPanel width="320px">
        <!-- ApiConfigSection removed from here -->
        <GenerationSettings />
      </ControlPanel>

      <Workspace>
        <!-- Creation Card (Center Input Area) -->
        <div class="creation-card">
          <!-- Mode Tabs -->
          <div class="mode-tabs">
            <button 
              class="mode-tab" 
              :class="{ active: currentMode === 'quick' }"
              @click="switchMode('quick')"
            >
              🚀 快速生成
            </button>
            <button 
              class="mode-tab" 
              :class="{ active: currentMode === 'advanced' }"
              @click="switchMode('advanced')"
            >
              ✨ 高级生成
            </button>
          </div>

          <!-- Page Content -->
          <div class="page-content">
            <QuickPage v-show="currentMode === 'quick'" />
            <AdvancedPage v-if="currentMode === 'advanced'" />
          </div>

          <!-- Shared Footer -->
          <div class="creation-footer">
            <PromptPreview />
            
            <div class="action-bar">
              <div class="action-hints">
                 <p v-if="!apiStore.isConfigured" class="app__generate-hint warning clickable" @click="showSettingsModal = true">
                  ⚠️ Configure API Key
                </p>
                <p v-else-if="!apiStore.connectionStatus.isConnected" class="app__generate-hint warning clickable" @click="showSettingsModal = true">
                  ⚠️ Test Connection
                </p>
              </div>

              <BaseButton
                variant="primary"
                size="lg"
                class="generate-btn"
                :loading="generationStore.isGenerating"
                :disabled="!generationStore.canGenerate"
                @click="handleStartGeneration"
              >
                {{ generationStore.isGenerating ? 'Generating...' : 'Generate Images' }}
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Results are now below the inputs -->
        <div class="results-section">
          <h3 class="section-title">Generation Results</h3>
          <ResultsGrid />
        </div>
      </Workspace>

      <InfoPanel width="320px" :default-collapsed="false">
        <HistoryList />
        <StatsPanel />
      </InfoPanel>
    </div>

    <!-- Modals -->
    <ApiConfigModal v-model="showSettingsModal" />

    <!-- Toast Container -->
    <Teleport to="body">
      <div class="toast-container">
        <TransitionGroup name="toast">
          <BaseToast
            v-for="t in toast.toasts.value"
            :key="t.id"
            :type="t.type"
            :message="t.message"
            :dismissible="t.dismissible"
            @dismiss="toast.dismiss(t.id)"
          />
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app__main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.panel-title {
  font-size: 1.125rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border-light);
}

/* Mode Tabs */
.mode-tabs {
  display: flex;
  gap: 12px;
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: 24px;
}

.mode-tab {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tab:hover {
  color: var(--color-primary);
  background: var(--color-bg-hover);
}

.mode-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* Creation Card Styles */
.creation-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.creation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.creation-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-dark);
}

.creation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 1100px) {
  .creation-grid {
    grid-template-columns: 1fr;
  }
}

.creation-footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border-light);
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.generate-btn {
  min-width: 200px;
  font-size: 1.125rem;
}

.app__generate-hint.warning {
  color: var(--color-warning-text);
  background: var(--color-warning-bg);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.app__generate-hint.clickable {
  cursor: pointer;
  text-decoration: underline;
}

.app__generate-hint.clickable:hover {
  filter: brightness(0.95);
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  color: var(--color-text);
}

/* Toast Container */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast-container > * {
  pointer-events: auto;
}

/* Toast Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
