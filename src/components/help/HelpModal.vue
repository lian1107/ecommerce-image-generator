<script setup lang="ts">
import BaseModal from '@/components/common/BaseModal.vue'
import CollapseSection from '@/components/common/CollapseSection.vue'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const closeModal = () => {
  emit('update:visible', false)
}

// 版本信息
const version = '1.0.0'
const buildDate = '2026-01-22'
</script>

<template>
  <BaseModal
    :visible="visible"
    title="❓ 帮助中心"
    width="560px"
    :show-footer="true"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="help-content">
      <!-- 快速入门 -->
      <CollapseSection title="🚀 快速入门" icon="" :default-open="true">
        <div class="help-section">
          <p class="help-intro">欢迎使用电商智能生图系统！只需 3 步即可生成专业电商图片：</p>
          <ol class="help-steps">
            <li><strong>配置 API</strong>：点击右上角「⚙️ System Settings」，输入您的 API Key</li>
            <li><strong>上传商品图</strong>：在控制面板上传您的商品图片</li>
            <li><strong>选择场景生成</strong>：选择场景类型，点击「生成」按钮</li>
          </ol>
          <p class="help-tip">💡 提示：首次使用建议从「🚀 快速生成」模式开始体验</p>
        </div>
      </CollapseSection>

      <!-- 功能说明 -->
      <CollapseSection title="📖 功能说明" icon="">
        <div class="help-section">
          <!-- 系统概述 -->
          <div class="feature-overview">
            <p class="overview-text">
              本系统是一个 <strong>AI Agents 智能生图创作平台</strong>，通过多个专业 AI Agent 协同工作，
              为您生成高质量的电商营销图片。
            </p>
          </div>

          <!-- 三种模式说明 -->
          <div class="feature-group">
            <h4 class="group-title">📌 三种创作模式</h4>

            <div class="feature-item">
              <h4>🚀 快速生成</h4>
              <p>适合快速出图的轻量模式。上传商品图片，选择预设场景，一键生成专业电商图。</p>
              <ul class="feature-details">
                <li>✦ 使用左侧「⚙️ 生成设置」控制输出效果</li>
                <li>✦ 可调节：生成数量、图片比例、质量、风格、光照等</li>
              </ul>
            </div>

            <div class="feature-item">
              <h4>✨ 高级生成</h4>
              <p>提供更多自定义选项的进阶模式。支持多图融合、自定义提示词、精细风格调整。</p>
              <ul class="feature-details">
                <li>✦ 同样使用左侧「⚙️ 生成设置」控制输出</li>
                <li>✦ 额外支持：多参考图、自定义 Prompt、高级参数微调</li>
              </ul>
            </div>

            <div class="feature-item">
              <h4>📊 营销企划</h4>
              <p>AI Agents 驱动的全流程营销工作台。多个专业 Agent 协同分析产品、制定策略、批量生成营销素材。</p>
              <ul class="feature-details">
                <li>✦ <strong>独立的生成流程</strong>：不使用左侧「生成设置」面板</li>
                <li>✦ 由 AI Agents 根据营销策略自动规划图片参数</li>
                <li>✦ 包含：产品分析 → 策略制定 → 内容企划 → 批量生成</li>
              </ul>
            </div>
          </div>

          <!-- 生成设置说明 -->
          <div class="feature-group">
            <h4 class="group-title">⚙️ 关于「生成设置」面板</h4>
            <div class="settings-info">
              <table class="settings-table">
                <thead>
                  <tr>
                    <th>模式</th>
                    <th>是否使用生成设置</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🚀 快速生成</td>
                    <td>✅ 使用 — 手动调节参数</td>
                  </tr>
                  <tr>
                    <td>✨ 高级生成</td>
                    <td>✅ 使用 — 手动调节参数</td>
                  </tr>
                  <tr>
                    <td>📊 营销企划</td>
                    <td>❌ 不使用 — AI 自动规划</td>
                  </tr>
                </tbody>
              </table>
              <p class="settings-note">
                💡 营销企划模式下，AI Agents 会根据产品特性和营销策略<strong>自动决定</strong>最佳的图片参数，
                无需手动配置生成设置。
              </p>
            </div>
          </div>
        </div>
      </CollapseSection>

      <!-- 常见问题 -->
      <CollapseSection title="❓ 常见问题" icon="">
        <div class="help-section faq-section">
          <div class="faq-item">
            <h4>Q: 如何获取 API Key？</h4>
            <p>A: 请访问对应 AI 服务商官网注册账号并获取 API Key，然后在系统设置中配置</p>
          </div>
          <div class="faq-item">
            <h4>Q: 支持哪些图片格式？</h4>
            <p>A: 支持 JPG、PNG、WebP 格式，建议图片尺寸不超过 4096x4096</p>
          </div>
          <div class="faq-item">
            <h4>Q: 生成失败怎么办？</h4>
            <p>A: 请检查网络连接和 API Key 是否正确，如问题持续请联系技术支持</p>
          </div>
          <div class="faq-item">
            <h4>Q: 生成的图片可以商用吗？</h4>
            <p>A: 请遵循所使用 AI 服务商的使用条款，不同服务商政策可能有所不同</p>
          </div>
        </div>
      </CollapseSection>

      <!-- 联系我们 -->
      <CollapseSection title="📧 联系我们" icon="">
        <div class="help-section contact-section">
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <div class="contact-info">
              <span class="contact-label">技术支持邮箱</span>
              <a href="mailto:lianff1107@gmail.com" class="contact-value">lianff1107@gmail.com</a>
            </div>
          </div>
          <div class="contact-item">
            <span class="contact-icon">💬</span>
            <div class="contact-info">
              <span class="contact-label">微信号</span>
              <span class="contact-value selectable">hzlian55</span>
            </div>
          </div>
        </div>
      </CollapseSection>

      <!-- 关于 -->
      <CollapseSection title="📋 关于" icon="">
        <div class="help-section about-section">
          <div class="about-item">
            <span class="about-label">版本号</span>
            <span class="about-value">v{{ version }}</span>
          </div>
          <div class="about-item">
            <span class="about-label">更新日期</span>
            <span class="about-value">{{ buildDate }}</span>
          </div>
          <p class="about-desc">
            电商智能生图系统是一款基于 AI 的电商图片生成工具，帮助商家快速创建专业的商品展示图片。
          </p>
        </div>
      </CollapseSection>
    </div>

    <!-- 自定义 footer -->
    <template #footer>
      <div class="help-footer">
        <span class="help-footer-text">感谢您使用电商智能生图系统 ❤️</span>
        <button class="help-close-btn" @click="closeModal">关闭</button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.help-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.help-section {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.help-intro {
  margin: 0 0 0.75rem;
}

.help-steps {
  margin: 0;
  padding-left: 1.25rem;
}

.help-steps li {
  margin-bottom: 0.5rem;
}

.help-steps li:last-child {
  margin-bottom: 0;
}

.help-tip {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.75rem;
  background: var(--color-info-bg, #eff6ff);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: var(--color-info, #3b82f6);
}

/* 功能说明 - 概述 */
.feature-overview {
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--color-primary-bg, #f0f9ff) 0%, var(--color-info-bg, #eff6ff) 100%);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-primary);
}

.overview-text {
  margin: 0;
  line-height: 1.6;
}

/* 功能说明 - 分组 */
.feature-group {
  margin-bottom: 1.5rem;
}

.feature-group:last-child {
  margin-bottom: 0;
}

.group-title {
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

/* 功能说明 - 模式项 */
.feature-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-item h4 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: var(--color-text);
}

.feature-item > p {
  margin: 0 0 0.5rem;
}

.feature-details {
  margin: 0;
  padding-left: 1rem;
  list-style: none;
}

.feature-details li {
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.feature-details li:last-child {
  margin-bottom: 0;
}

/* 功能说明 - 设置表格 */
.settings-info {
  padding: 0.75rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.settings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.settings-table th,
.settings-table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.settings-table th {
  background: var(--color-bg-hover);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.settings-table tbody tr:last-child td {
  border-bottom: none;
}

.settings-note {
  margin: 0;
  padding: 0.5rem 0.75rem;
  background: var(--color-warning-bg, #fffbeb);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: var(--color-warning-text, #92400e);
}

/* FAQ */
.faq-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item h4 {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 600;
}

.faq-item p {
  margin: 0;
  padding-left: 1rem;
}

/* 联系方式 */
.contact-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.contact-icon {
  font-size: 1.5rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.contact-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.contact-value {
  font-size: 0.95rem;
  color: var(--color-text);
  font-weight: 500;
}

.contact-value.selectable {
  user-select: all;
  cursor: text;
}

a.contact-value {
  color: var(--color-primary);
  text-decoration: none;
}

a.contact-value:hover {
  text-decoration: underline;
}

/* 关于 */
.about-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.about-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border-light);
}

.about-label {
  color: var(--color-text-muted);
}

.about-value {
  font-weight: 500;
  color: var(--color-text);
}

.about-desc {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
}

/* Footer */
.help-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
  margin: 0 -1.25rem -1.25rem;
  background: var(--color-bg-secondary);
}

.help-footer-text {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.help-close-btn {
  padding: 0.5rem 1.25rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.help-close-btn:hover {
  background: var(--color-primary-dark);
}

/* 移动端适配 */
@media (max-width: 640px) {
  .help-section {
    font-size: 0.85rem;
  }

  .contact-item {
    padding: 0.625rem;
  }

  .contact-icon {
    font-size: 1.25rem;
  }

  .help-footer {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }

  .help-close-btn {
    width: 100%;
  }
}
</style>

