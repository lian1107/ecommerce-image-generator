<script setup lang="ts">
import { BaseButton } from '@/components/common'
import luxuryImg from '@/assets/demo/luxury.png'
import sneakerImg from '@/assets/demo/sneaker.png'
import coffeeImg from '@/assets/demo/coffee.png'

defineEmits<{
  'start': [mode: 'quick']
}>()
</script>

<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__content">
        <h1 class="hero__title">
          <span class="gradient-text">Unleash</span> Your Brand's Visual Potential
        </h1>
        <p class="hero__subtitle">
            释放品牌的视觉潜能。我们为您提供全流程的电商视觉解决方案，从瞬时摄影到完整的营销企划。
        </p>
        <div class="hero__actions">
          <BaseButton 
             variant="primary" 
             size="lg" 
             class="start-btn"
             @click="$emit('start', 'quick')"
          >
             立即开始 (Start Creating) 🚀
          </BaseButton>
        </div>
      </div>
      <div class="hero__visual">
        <img :src="luxuryImg" alt="Luxury Perfume" class="hero-img" />
        <div class="hero-blob"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
        <div class="feature-card">
            <div class="icon">🚀</div>
            <h3>Quick Gen (快速生成)</h3>
            <p>Instant studio quality. Just upload and prompt. Zero technical skills required.</p>
        </div>
        <div class="feature-card">
            <div class="icon">✨</div>
            <h3>Advanced Fusion (高级融合)</h3>
            <p>Professional compositing with precise lighting and shadow control for perfect product placement.</p>
        </div>
        <div class="feature-card">
            <div class="icon">📊</div>
            <h3>Agent Brain (营销企划)</h3>
            <p>Your Virtual Creative Director. Strategy, Copywriting, and Visuals in one intelligent loop.</p>
        </div>
    </section>

    <!-- Showcase Section -->
    <section class="showcase">
        <h2>Built with our AI</h2>
        <div class="gallery">
            <div class="gallery-item">
                <img :src="sneakerImg" alt="Cyber Sneaker" />
                <div class="caption">Cyberpunk Fusion</div>
            </div>
            <div class="gallery-item">
                <img :src="coffeeImg" alt="Cozy Coffee" />
                <div class="caption">Lifestyle Scene</div>
            </div>
             <div class="gallery-item">
                <img :src="luxuryImg" alt="Luxury Perfume" />
                <div class="caption">Studio Photography</div>
            </div>
        </div>
    </section>
  </div>
</template>

<style scoped>
.landing-page {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    color: var(--color-text);
    overflow-y: auto;
}

/* Hero */
.hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4rem;
    min-height: 60vh;
    margin-bottom: 4rem;
}

.hero__content {
    flex: 1;
    max-width: 600px;
}

.hero__title {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    font-family: var(--font-serif);
}

.gradient-text {
    background: linear-gradient(135deg, var(--color-primary) 0%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero__subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin-bottom: 2.5rem;
    line-height: 1.6;
}

.start-btn {
    font-size: 1.1rem;
    padding: 1rem 2.5rem;
}

.hero__visual {
    flex: 1;
    position: relative;
    display: flex;
    justify-content: center;
}

.hero-img {
    width: 100%;
    max-width: 500px;
    border-radius: 24px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
    position: relative;
    z-index: 2;
    transition: transform 0.3s ease;
}

.hero-img:hover {
    transform: translateY(-10px);
}

.hero-blob {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 120%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(168, 85, 247, 0.1) 70%, transparent 100%);
    z-index: 1;
    filter: blur(60px);
}

/* Features */
.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 6rem;
}

.feature-card {
    background: var(--color-bg-card);
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid var(--color-border);
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
}

.icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.feature-card h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: var(--color-text-dark);
}

.feature-card p {
    color: var(--color-text-secondary);
    line-height: 1.5;
}

/* Showcase */
.showcase {
    text-align: center;
    margin-bottom: 4rem;
}

.showcase h2 {
    font-size: 2rem;
    margin-bottom: 3rem;
}

.gallery {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.gallery-item {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    aspect-ratio: 1;
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.gallery-item:hover img {
    transform: scale(1.05);
}

.caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    color: white;
    padding: 1.5rem 1rem 1rem;
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.gallery-item:hover .caption {
    transform: translateY(0);
}

@media (max-width: 1000px) {
    .hero {
        flex-direction: column;
        text-align: center;
        gap: 2rem;
    }
    
    .hero__content {
        max-width: 100%;
    }

    .gallery {
        grid-template-columns: 1fr;
    }
}
</style>
