<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApiStore } from '@/stores/apiStore'
import { BaseButton, BaseInput, BaseSelect } from '@/components/common'

const apiStore = useApiStore()

const localApiKey = ref(apiStore.apiKey)
const showApiKey = ref(false)
const isTestingConnection = ref(false)

const maskedApiKey = computed(() => {
  if (!localApiKey.value) return ''
  if (showApiKey.value) return localApiKey.value
  return localApiKey.value.slice(0, 8) + '••••••••' + localApiKey.value.slice(-4)
})

const handleApiKeyChange = (value: string | number) => {
  localApiKey.value = String(value)
}

const saveApiKey = () => {
  apiStore.setApiKey(localApiKey.value)
}

const testConnection = async () => {
  saveApiKey()
  isTestingConnection.value = true
  await apiStore.testConnection()
  isTestingConnection.value = false
}

const toggleShowApiKey = () => {
  showApiKey.value = !showApiKey.value
}

const statusClass = computed(() => ({
  'api-status': true,
  'api-status--connected': apiStore.connectionStatus.isConnected,
  'api-status--loading': apiStore.connectionStatus.isLoading,
  'api-status--error': apiStore.connectionStatus.error && !apiStore.connectionStatus.isLoading
}))
</script>

<template>
  <div class="api-config">
    <!-- Provider Selection -->
    <div class="api-config__provider-selector">
      <label class="provider-option">
        <input 
          type="radio" 
          name="provider" 
          value="google" 
          :checked="apiStore.provider === 'google'"
          @change="apiStore.setProvider('google')"
        >
        <span class="provider-option__label" :class="{ 'active': apiStore.provider === 'google' }">
          Google AI Studio
        </span>
      </label>
      <label class="provider-option">
        <input 
          type="radio" 
          name="provider" 
          value="openrouter" 
          :checked="apiStore.provider === 'openrouter'"
          @change="apiStore.setProvider('openrouter')"
        >
        <span class="provider-option__label" :class="{ 'active': apiStore.provider === 'openrouter' }">
          OpenRouter
        </span>
      </label>
    </div>

    <div class="api-config__field">
      <BaseInput
        :model-value="showApiKey ? localApiKey : maskedApiKey"
        :type="showApiKey ? 'text' : 'password'"
        :label="apiStore.provider === 'google' ? 'Google API Key' : 'OpenRouter API Key'"
        :placeholder="apiStore.provider === 'google' ? 'AIza...' : 'sk-or-...'"
        @update:model-value="handleApiKeyChange"
        @blur="saveApiKey"
      >
        <template #suffix>
          <button
            class="api-config__toggle-visibility"
            @click="toggleShowApiKey"
            type="button"
            :title="showApiKey ? '隐藏' : '显示'"
          >
            <svg v-if="showApiKey" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </template>
      </BaseInput>
      <p class="api-config__hint">
        前往 
        <a v-if="apiStore.provider === 'google'" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Google AI Studio</a>
        <a v-else href="https://openrouter.ai/keys" target="_blank" rel="noopener">OpenRouter</a> 
        获取 API Key
      </p>
    </div>

    <div class="api-config__status">
      <div :class="statusClass">
        <span class="api-status__dot"></span>
        <span class="api-status__text">{{ apiStore.statusText }}</span>
      </div>
      <span v-if="apiStore.connectionStatus.lastChecked" class="api-config__last-check">
        上次检查: {{ new Date(apiStore.connectionStatus.lastChecked).toLocaleTimeString() }}
      </span>
    </div>

    <p v-if="apiStore.connectionStatus.error" class="api-config__error">
      {{ apiStore.connectionStatus.error }}
    </p>

    <div class="api-config__field">
      <BaseSelect
        :model-value="apiStore.model"
        :options="apiStore.currentProviderDefaults.models"
        label="Model"
        @update:model-value="(v) => apiStore.setModel(String(v))"
      />
    </div>

    <BaseButton
      :loading="isTestingConnection"
      :disabled="!localApiKey"
      variant="outline"
      size="sm"
      block
      @click="testConnection"
    >
      {{ isTestingConnection ? 'Testing...' : 'Test Connection' }}
    </BaseButton>
  </div>
</template>

<style scoped>
.api-config {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.api-config__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.api-config__hint {
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
  margin: 0;
}

.api-config__hint a {
  color: var(--color-primary, #3b82f6);
  text-decoration: none;
}

.api-config__hint a:hover {
  text-decoration: underline;
}

.api-config__toggle-visibility {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted, #9ca3af);
  cursor: pointer;
  border-radius: var(--radius-sm, 0.25rem);
}

.api-config__toggle-visibility:hover {
  color: var(--color-text, #374151);
}

.api-config__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.api-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.api-status__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-text-muted, #9ca3af);
}

.api-status--connected .api-status__dot {
  background: var(--color-success, #10b981);
}

.api-status--loading .api-status__dot {
  background: var(--color-warning, #f59e0b);
  animation: pulse 1.5s infinite;
}

.api-status--error .api-status__dot {
  background: var(--color-danger, #ef4444);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.api-status__text {
  font-size: 0.875rem;
  color: var(--color-text, #374151);
}

.api-config__last-check {
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
}

.api-config__error {
  font-size: 0.8125rem;
  color: var(--color-danger, #ef4444);
  background: var(--color-error-bg, #fef2f2);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm, 0.375rem);
  margin: 0;
}

.api-config__provider-selector {
  display: flex;
  background: var(--color-bg-secondary, #f3f4f6);
  padding: 0.25rem;
  border-radius: var(--radius-md, 0.5rem);
  gap: 0.25rem;
}

.provider-option {
  flex: 1;
  position: relative;
  cursor: pointer;
  margin: 0;
}

.provider-option input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.provider-option__label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted, #6b7280);
  border-radius: var(--radius-sm, 0.375rem);
  transition: all 0.2s ease;
}

.provider-option__label:hover {
  color: var(--color-text, #374151);
}

.provider-option__label.active {
  background: var(--color-bg-card, #ffffff);
  color: var(--color-primary, #3b82f6);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 600;
}
</style>
