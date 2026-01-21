<script setup lang="ts">

import luxuryImg from '@/assets/demo/luxury.png'
import sneakerImg from '@/assets/demo/sneaker.png'
import coffeeImg from '@/assets/demo/coffee.png'
import brainImg from '@/assets/demo/brain.png'
import { BaseButton } from '@/components/common'

const emit = defineEmits<{
  'enter': []
}>()

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="landing-v2">
    <!-- Section 1: Hero (Full Screen) -->
    <section class="section hero" :style="{ backgroundImage: `url(${luxuryImg})` }">
      <div class="overlay"></div>
      <div class="content">
        <h1 class="title fade-in-up">
          <span class="gradient-text">重塑</span> 电商视觉体验
        </h1>
        <p class="subtitle fade-in-up delay-1">
          Elevate Your Brand. AI 驱动的商业摄影与营销策划工作台。
        </p>
        <div class="actions fade-in-up delay-2">
          <BaseButton 
            variant="primary" 
            size="lg" 
            class="cta-btn glow"
            @click="$emit('enter')"
          >
            进入工作台 (Enter Studio) →
          </BaseButton>
          <button class="learn-more" @click="scrollToSection('features')">
            了解更多 ↓
          </button>
        </div>
      </div>
    </section>

    <!-- Section 2: Features (Scroll Snap) -->
    <section id="features" class="section feature-section">
      <div class="feature-container">
        
        <!-- Feature 1 -->
        <div class="feature-row">
          <div class="feature-text">
            <div class="feature-icon">🚀</div>
            <h2>瞬时商业摄影</h2>
            <p>告别昂贵的摄影棚。只需上传产品图，AI 即可生成影棚级光影的商业大片。</p>
            <ul class="feature-list">
              <li>无需专业摄影技能</li>
              <li>8K 超高清分辨率输出</li>
              <li>智能光影重绘</li>
            </ul>
          </div>
          <div class="feature-visual">
            <img :src="coffeeImg" alt="Lifestyle Coffee" />
          </div>
        </div>

        <!-- Feature 2 -->
        <div class="feature-row reverse">
          <div class="feature-text">
            <div class="feature-icon">✨</div>
            <h2>创意场景融合</h2>
            <p>将您的产品完美融入任何场景。从赛博朋克街头到温馨家居，风格随心切换。</p>
            <ul class="feature-list">
              <li>复杂场景透视自动匹配</li>
              <li>多物体空间关系处理</li>
              <li>高级光影控制</li>
            </ul>
          </div>
          <div class="feature-visual">
            <img :src="sneakerImg" alt="Creative Fusion" />
          </div>
        </div>

        <!-- Feature 3 -->
        <div class="feature-row">
          <div class="feature-text">
            <div class="feature-icon">📊</div>
            <h2>智能营销大脑</h2>
            <p>不仅仅是生图。您的专属 AI 营销总监，从市场分析到视觉策划，一站式搞定。</p>
            <ul class="feature-list">
              <li>竞品分析与策略推荐</li>
              <li>全套营销素材自动规划</li>
              <li>多 Agents 协同工作</li>
            </ul>
          </div>
          <div class="feature-visual">
            <img :src="brainImg" alt="Agent Brain" />
          </div>
        </div>

      </div>
    </section>

    <!-- Section 3: Footer CTA -->
    <section class="section footer-cta">
      <div class="footer-content">
        <h2>准备好开始创作了吗？</h2>
        <p>加入智能电商营销的新时代。</p>
        <BaseButton 
            variant="primary" 
            size="lg" 
            class="cta-btn glow"
            @click="$emit('enter')"
          >
            立即使用 (Start Now)
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Warm Atmospheric Theme */
.landing-v2 {
  width: 100vw;
  height: 100vh;
  overflow-y: scroll;
  scroll-behavior: smooth;
  scroll-snap-type: y mandatory;
  background-color: #fffbf7; /* Fallback */
  color: #4a3b32;
}

.section {
  width: 100%;
  min-height: 100vh;
  position: relative;
  scroll-snap-align: start;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Hero Styles */
.hero {
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(74, 59, 50, 0.1), rgba(74, 59, 50, 0.4));
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  padding: 0 2rem;
  color: white; /* Hero text stays white */
}

.title {
  font-size: 5rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.gradient-text {
  /* Warm Gold/Orange Gradient for "Reimagine" */
  background: linear-gradient(135deg, #F6D365 0%, #FDA085 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 3rem;
  font-weight: 400;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.learn-more {
  background: none;
  border: none;
  color: white;
  opacity: 0.8;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.3s;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.learn-more:hover {
  opacity: 1;
}

/* Buttons */
.cta-btn {
  font-size: 1.25rem !important;
  padding: 1.25rem 3rem !important;
  border-radius: 999px !important;
  border: none !important;
  background: linear-gradient(135deg, #F6D365 0%, #FDA085 100%) !important;
  color: #4a3b32 !important;
  font-weight: 700 !important;
  transition: transform 0.2s, box-shadow 0.2s !important;
}

.cta-btn:hover {
  transform: scale(1.05);
}

.glow {
  box-shadow: 0 4px 20px rgba(253, 160, 133, 0.4);
}

/* Feature Section */
.feature-section {
  /* Soft Warm Gradient Background */
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF9F4 100%);
  padding: 4rem 0;
  position: relative;
}

/* Decorative Background Blobs for Atmosphere */
.feature-section::before {
  content: '';
  position: absolute;
  top: 10%;
  left: -10%;
  width: 40vw;
  height: 40vw;
  background: radial-gradient(circle, rgba(253, 160, 133, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.feature-section::after {
  content: '';
  position: absolute;
  bottom: 10%;
  right: -10%;
  width: 40vw;
  height: 40vw;
  background: radial-gradient(circle, rgba(246, 211, 101, 0.05) 0%, transparent 70%);
  pointer-events: none;
}


.feature-container {
  max-width: 1200px;
  width: 100%;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 8rem;
  z-index: 2; /* Above blobs */
}

.feature-row {
  display: flex;
  align-items: center;
  gap: 5rem;
}

.feature-row.reverse {
  flex-direction: row-reverse;
}

.feature-text {
  flex: 1;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  /* Add a subtle background to icons */
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.feature-text h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #4A3B32; /* Warm Dark Brown */
  letter-spacing: -0.01em;
}

.feature-text p {
  font-size: 1.125rem;
  color: #7D6B5D; /* Warm Grey/Brown */
  line-height: 1.7;
  margin-bottom: 2rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #5D524A;
  font-weight: 500;
  font-size: 1.05rem;
}

.feature-list li::before {
  content: "✦"; /* Star instead of checkmark for aesthetic */
  color: #FDA085;
  font-size: 1.2rem;
}

.feature-visual {
  flex: 1;
  position: relative;
}

.feature-visual img {
  width: 100%;
  border-radius: 24px;
  /* Warmer, softer shadow */
  box-shadow: 0 25px 50px -12px rgba(74, 59, 50, 0.15);
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.feature-visual:hover img {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 35px 60px -15px rgba(74, 59, 50, 0.2);
}

/* Footer CTA */
.footer-cta {
  background: linear-gradient(135deg, #FFF9F4 0%, #FFF0E6 100%);
  flex-direction: column;
  position: relative;
}

.footer-content {
  text-align: center;
  z-index: 2;
}

.footer-content h2 {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  color: #4A3B32;
  font-weight: 800;
}

.footer-content p {
  font-size: 1.5rem;
  color: #7D6B5D;
  margin-bottom: 3.5rem;
}

/* Reuse decorative blobs for footer but different */
.footer-cta::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(253, 160, 133, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

/* Animations */
.fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .title { font-size: 3rem; }
  .feature-row, .feature-row.reverse { flex-direction: column; text-align: center; gap: 2rem; }
  .feature-list { align-items: center; }
}
</style>
