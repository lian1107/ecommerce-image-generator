<script setup lang="ts">
import BaseModal from '@/components/common/BaseModal.vue'
import ApiConfigSection from '@/components/api/ApiConfigSection.vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<template>
  <BaseModal
    :visible="modelValue"
    title="System Settings"
    width="600px"
    @close="handleClose"
    @update:visible="val => emit('update:modelValue', val)"
  >
    <div class="api-modal-content">
      <div class="modal-section">
        <h3 class="section-title">Connection Settings</h3>
        <p class="section-desc">Configure your AI provider API key and endpoint.</p>
        <ApiConfigSection />
      </div>
    </div>
    
    <template #footer>
      <div class="modal-footer">
         <p class="footer-hint">Settings are automatically saved.</p>
         <button class="done-btn" @click="handleClose">Done</button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.api-modal-content {
  padding: 1rem 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-dark);
}

.section-desc {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-hint {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.done-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.done-btn:hover {
  background: var(--color-primary-dark);
}
</style>
