<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Layout components
import { AppNavbar, ControlPanel, Workspace, InfoPanel } from '@/components/layout'

// Business components
import ApiConfigModal from '@/components/api/ApiConfigModal.vue'
import HelpModal from '@/components/help/HelpModal.vue'
import QuickPage from '@/components/pages/QuickPage.vue'
import AdvancedPage from '@/components/pages/AdvancedPage.vue'
import LandingPageV2 from '@/components/pages/LandingPageV2.vue'
import GenerationSettings from '@/components/settings/GenerationSettings.vue'
import PromptPreview from '@/components/prompt/PromptPreview.vue'
import ResultsGrid from '@/components/results/ResultsGrid.vue'
import HistoryList from '@/components/history/HistoryList.vue'
import StatsPanel from '@/components/stats/StatsPanel.vue'
import { MarketingWorkflowPage } from '@/components/marketing-workflow'

// Common components
import { BaseButton, BaseToast } from '@/components/common'

// Composables & Stores
import { useApiStore } from '@/stores/apiStore'
import { useGenerationStore } from '@/stores/generationStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useFusionStore } from '@/stores/fusionStore'
import { usePromptBuilder } from '@/composables/usePromptBuilder'
import { toast } from '@/composables/useToast'
import { useIsMobile, useMobilePanels } from '@/composables/useSwipe'

const apiStore = useApiStore()
const generationStore = useGenerationStore()
const historyStore = useHistoryStore()
const fusionStore = useFusionStore()
const { buildPrompt } = usePromptBuilder()

const isGenerating = ref(false)
const showSettingsModal = ref(false)
const showHelpModal = ref(false)
const currentMode = ref<'landing' | 'quick' | 'advanced' | 'marketing'>('landing')

// Mobile state
const { isMobile } = useIsMobile()
const { controlPanelOpen, infoPanelOpen, toggleControlPanel, toggleInfoPanel } = useMobilePanels()
const mobileMenuOpen = ref(false)

const switchMode = (mode: 'landing' | 'quick' | 'advanced' | 'marketing') => {
    currentMode.value = mode
    // 切换模式时自动控制融合功能的启用状态
    if (mode === 'quick') {
        fusionStore.setEnabled(false)
    }
}

const handleStartGeneration = async () => {
    // ... existing logic ...
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
        <!-- Skip to main content link -->
        <a href="#main-content" class="skip-link">跳转到主要内容</a>

        <!-- View 1: Landing Portal (Full Screen) -->
        <LandingPageV2
            v-if="currentMode === 'landing'"
            @enter="switchMode('quick')"
        />

        <!-- View 2: App Workspace (Standard UI) -->
        <div v-else class="app-layout">
            <AppNavbar
                role="banner"
                :active-mode="currentMode"
                @switch-mode="switchMode"
                @open-settings="showSettingsModal = true"
                @open-help="showHelpModal = true"
            />

            <!-- Mobile Hamburger Menu Overlay -->
            <div v-if="isMobile && mobileMenuOpen" class="mobile-menu-overlay" @click="mobileMenuOpen = false" role="presentation">
                <nav class="mobile-menu" @click.stop role="navigation" aria-label="主导航菜单">
                    <button
                        type="button"
                        class="close-btn"
                        @click="mobileMenuOpen = false"
                        aria-label="关闭菜单"
                    >
                        <span aria-hidden="true">✕</span>
                    </button>
                    <div class="menu-items" role="menu">
                        <!-- 模式切换分组 -->
                        <div class="menu-section-title">切换模式</div>
                        <button
                            type="button"
                            role="menuitem"
                            @click="switchMode('quick'); mobileMenuOpen = false"
                            :class="{ active: currentMode === 'quick' }"
                            :aria-current="currentMode === 'quick' ? 'page' : undefined"
                        >
                            🚀 快速生成
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            @click="switchMode('advanced'); mobileMenuOpen = false"
                            :class="{ active: currentMode === 'advanced' }"
                            :aria-current="currentMode === 'advanced' ? 'page' : undefined"
                        >
                            ✨ 高级生成
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            @click="switchMode('marketing'); mobileMenuOpen = false"
                            :class="{ active: currentMode === 'marketing' }"
                            :aria-current="currentMode === 'marketing' ? 'page' : undefined"
                        >
                            📊 营销企划
                        </button>

                        <!-- 分隔线 -->
                        <div class="menu-divider"></div>

                        <!-- 系统功能 -->
                        <button
                            type="button"
                            role="menuitem"
                            @click="showSettingsModal = true; mobileMenuOpen = false"
                        >
                            🔧 API 设置
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            @click="showHelpModal = true; mobileMenuOpen = false"
                        >
                            ❓ 帮助中心
                        </button>
                    </div>
                </nav>
            </div>

            <div class="app__main">
                <ControlPanel role="complementary" aria-label="生成设置" width="320px" :class="{ open: controlPanelOpen }">
                    <!-- 移动端关闭按钮 -->
                    <template v-if="isMobile && controlPanelOpen">
                        <button
                            type="button"
                            class="panel-close-btn panel-close-btn--bottom"
                            @click="toggleControlPanel"
                            aria-label="关闭设置面板"
                        >
                            ✕ 关闭设置
                        </button>
                    </template>
                    <!-- ApiConfigSection removed from here -->
                    <GenerationSettings />
                </ControlPanel>

                <Workspace role="main" id="main-content">
                    <!-- Creation Card (Center Input Area) -->
                    <div class="creation-card">
                        <!-- Page Content -->
                        <div class="page-content">
                            <QuickPage v-show="currentMode === 'quick'" />
                            <AdvancedPage v-if="currentMode === 'advanced'" />
                            <MarketingWorkflowPage v-if="currentMode === 'marketing'" />
                        </div>

                        <!-- Shared Footer -->
                        <div class="creation-footer" v-if="currentMode !== 'marketing'">
                            <PromptPreview />

                            <div class="action-bar">
                                <div class="action-hints">
                                    <p v-if="!apiStore.isConfigured" class="app__generate-hint warning clickable"
                                        @click="showSettingsModal = true">
                                        ⚠️ Configure API Key
                                    </p>
                                    <p v-else-if="!apiStore.connectionStatus.isConnected"
                                        class="app__generate-hint warning clickable" @click="showSettingsModal = true">
                                        ⚠️ Test Connection
                                    </p>
                                </div>

                                <BaseButton variant="primary" size="lg" class="generate-btn"
                                    :loading="generationStore.isGenerating" :disabled="!generationStore.canGenerate"
                                    @click="handleStartGeneration">
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

                <InfoPanel role="complementary" aria-label="历史记录和统计" width="320px" :default-collapsed="false" :class="{ open: infoPanelOpen }">
                    <!-- 移动端关闭按钮 -->
                    <template v-if="isMobile && infoPanelOpen">
                        <button
                            type="button"
                            class="panel-close-btn"
                            @click="toggleInfoPanel"
                            aria-label="关闭历史记录面板"
                        >
                            ← 返回
                        </button>
                    </template>
                    <HistoryList />
                    <StatsPanel />
                </InfoPanel>

                <!-- 移动端面板遮罩 -->
                <div
                    v-if="isMobile && (controlPanelOpen || infoPanelOpen)"
                    class="panel-overlay"
                    @click="controlPanelOpen ? toggleControlPanel() : toggleInfoPanel()"
                ></div>
            </div>

            <!-- Mobile FAB Buttons -->
            <div v-if="isMobile" class="fab-container" role="navigation" aria-label="快捷操作">
                <!-- 非营销模式显示历史和设置按钮 -->
                <template v-if="currentMode !== 'marketing'">
                    <button
                        type="button"
                        class="fab secondary"
                        @click="toggleInfoPanel"
                        aria-label="打开历史记录面板"
                        :aria-expanded="infoPanelOpen"
                    >
                        <span aria-hidden="true">📊</span>
                    </button>
                    <button
                        type="button"
                        class="fab secondary"
                        @click="toggleControlPanel"
                        aria-label="打开设置面板"
                        :aria-expanded="controlPanelOpen"
                    >
                        <span aria-hidden="true">⚙️</span>
                    </button>
                </template>
                <!-- 菜单按钮始终显示 -->
                <button
                    type="button"
                    class="fab primary"
                    @click="mobileMenuOpen = true"
                    aria-label="打开菜单"
                    :aria-expanded="mobileMenuOpen"
                >
                    <span aria-hidden="true">☰</span>
                </button>
            </div>
        </div>

        <!-- Modals -->
        <ApiConfigModal v-model="showSettingsModal" />
        <HelpModal v-model:visible="showHelpModal" />

        <!-- Toast Container -->
        <Teleport to="body">
            <div class="toast-container" role="region" aria-live="polite" aria-label="通知消息">
                <TransitionGroup name="toast">
                    <BaseToast v-for="t in toast.toasts.value" :key="t.id" :type="t.type" :message="t.message"
                        :dismissible="t.dismissible" @dismiss="toast.dismiss(t.id)" />
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
  height: 100dvh; /* 使用动态视口高度，解决移动端地址栏问题 */
  overflow: hidden;
}

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.app__main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ========================================
   移动端布局修复 - 关键样式
   ======================================== */
@media (max-width: 640px) {
  .app {
    overflow: auto;
  }

  .app-layout {
    overflow: auto;
  }

  .app__main {
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
  }
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

/* 移动端卡片和按钮优化 */
@media (max-width: 640px) {
  .creation-card {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.75rem;
  }

  .creation-title {
    font-size: 1.25rem;
  }

  .creation-grid {
    grid-template-columns: 1fr !important;
    gap: 1rem !important;
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

/* 移动端操作栏优化 */
@media (max-width: 640px) {
  .action-bar {
    flex-direction: column;
    gap: 0.75rem;
  }
}

.generate-btn {
  min-width: 200px;
  font-size: 1.125rem;
}

/* 移动端按钮全宽 */
@media (max-width: 640px) {
  .generate-btn {
    width: 100%;
    min-width: auto;
  }
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

/* ========================================
   移动端样式
   ======================================== */

/* 移动端菜单遮罩 */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 60px;
}

.mobile-menu {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 90%;
  width: 300px;
  box-shadow: var(--shadow-lg);
  position: relative;
}

.mobile-menu .close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-muted);
  padding: 0.25rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mobile-menu .menu-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-menu .menu-items button {
  padding: 1rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.mobile-menu .menu-items button:hover,
.mobile-menu .menu-items button:active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.mobile-menu .menu-items button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* 菜单分组标题 */
.mobile-menu .menu-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
}

.mobile-menu .menu-section-title:first-child {
  margin-top: 0;
}

/* 菜单分隔线 */
.mobile-menu .menu-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0.75rem 0;
}

/* FAB按钮容器（在responsive.css中已定义基础样式） */
@media (min-width: 641px) {
  .fab-container {
    display: none;
  }

  .panel-close-btn {
    display: none !important;
  }

  .panel-overlay {
    display: none !important;
  }
}

/* 面板关闭按钮和遮罩（移动端） */
@media (max-width: 640px) {
  /* 面板关闭按钮 */
  .panel-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 1rem;
    background: var(--color-bg-card);
    border: none;
    border-bottom: 1px solid var(--color-border);
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-primary);
    cursor: pointer;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .panel-close-btn:active {
    background: var(--color-bg-hover);
  }

  /* 底部面板的关闭按钮 */
  .panel-close-btn--bottom {
    border-bottom: none;
    border-top: 1px solid var(--color-border);
    margin-top: 1rem;
    position: relative;
  }

  /* 点击遮罩关闭面板 */
  .panel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 50;
  }
}
</style>
