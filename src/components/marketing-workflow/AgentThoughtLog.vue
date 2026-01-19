<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useMarketingWorkflowStore } from '@/stores/marketingWorkflowStore'

const store = useMarketingWorkflowStore()
const logContainer = ref<HTMLElement | null>(null)

const thoughts = computed(() => store.agentThoughts)

// Auto-scroll to bottom when new logs arrive
watch(thoughts, async () => {
  await nextTick()
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}, { deep: true })

const formatTime = (ts: number) => {
  return new Date(ts).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="agent-log">
    <div class="agent-log__header">
      <span class="agent-log__title">🤖 Agent Intelligence Log</span>
      <span class="agent-log__status" v-if="thoughts.length > 0">Active</span>
    </div>
    
    <div class="agent-log__content" ref="logContainer">
      <div v-if="thoughts.length === 0" class="agent-log__empty">
        Waiting for tasks...
      </div>
      
      <div 
        v-for="thought in thoughts" 
        :key="thought.id" 
        class="log-entry"
      >
        <div class="log-entry__meta">
          <span class="log-entry__time">[{{ formatTime(thought.timestamp) }}]</span>
          <span class="log-entry__agent">{{ thought.agentName }}</span>
        </div>
        <div class="log-entry__message">{{ thought.content }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agent-log {
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  border-radius: var(--radius-md);
  border: 1px solid #333;
  overflow: hidden;
  height: 100%;
  min-height: 200px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
}

.agent-log__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #252526;
  border-bottom: 1px solid #333;
}

.agent-log__title {
  color: #e0e0e0;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.agent-log__status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-success);
  font-size: 0.75rem;
}

.agent-log__status::before {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

.agent-log__content {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #d4d4d4;
}

.agent-log__empty {
  color: #666;
  font-style: italic;
  text-align: center;
  margin-top: 1rem;
}

.log-entry {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;
  border-bottom: 1px solid #2a2a2a;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry__meta {
  display: flex;
  gap: 8px;
  font-size: 0.75rem;
  color: #888;
}

.log-entry__agent {
  color: #4ec9b0;
  font-weight: 600;
}

.log-entry__message {
  line-height: 1.4;
  word-break: break-word;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>
