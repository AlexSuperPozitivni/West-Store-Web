<script setup lang="ts">
import { onMounted } from 'vue'
import { useSeo } from '../lib/useSeo'

useSeo({
  title: 'О магазине',
  description: 'ONLYPHONES — магазин Apple техники в Москве. Оригинальная продукция, гарантия качества, профессиональная консультация.'
})

const advantages = [
  { icon: '✅', title: 'Оригинальная продукция', text: 'Только сертифицированные товары от официальных поставщиков. Каждый товар проходит проверку подлинности.' },
  { icon: '🛡️', title: 'Гарантия качества', text: 'Официальная гарантия на всю продукцию. Обмен и возврат в соответствии с законодательством РФ.' },
  { icon: '💬', title: 'Профессиональная консультация', text: 'Наши специалисты помогут подобрать устройство под ваши задачи и бюджет.' },
  { icon: '🚚', title: 'Удобная доставка', text: 'Доставка по Москве и всей России. Самовывоз из магазина в удобное для вас время.' },
]

const observeElements = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el))
}

onMounted(() => {
  observeElements()
})
</script>

<template>
  <div class="about-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-badge">О нас</div>
        <h1 class="hero-title">ONLYPHONES</h1>
        <p class="hero-subtitle">
          Ваш надёжный магазин оригинальной техники в Москве. Продаём, обмениваем и обслуживаем устройства Apple, Samsung, DJI, Dyson и другие топовые бренды.
        </p>
      </div>
    </section>

    <!-- Story -->
    <section class="story animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Наша история</h2>
        <p class="section-subtitle">Как мы стали одним из лучших магазинов техники в Москве</p>
        <div class="story-content">
          <div class="story-card">
            <span class="story-icon">🏪</span>
            <h3>Магазин с душой</h3>
            <p>ONLYPHONES — это магазин для тех, кто ценит качество и надёжность. Мы начинали как небольшая точка продаж Apple техники, а сегодня предлагаем широкий ассортимент устройств от лучших мировых брендов.</p>
          </div>
          <div class="story-card">
            <span class="story-icon">🎯</span>
            <h3>Наша миссия</h3>
            <p>Мы стремимся сделать покупку техники простой, безопасной и приятной. Каждый клиент получает индивидуальный подход, честные цены и полную поддержку после покупки.</p>
          </div>
          <div class="story-card">
            <span class="story-icon">📦</span>
            <h3>Что мы продаём</h3>
            <p>iPhone, iPad, MacBook, Apple Watch, AirPods, Samsung Galaxy, DJI дроны, Dyson и многое другое. Только оригинальная продукция с гарантией от производителя.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Advantages -->
    <section class="advantages animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Почему выбирают нас</h2>
        <p class="section-subtitle">Четыре причины покупать технику в ONLYPHONES</p>
        <div class="advantages-grid">
          <div v-for="(adv, i) in advantages" :key="i" class="advantage-card" :style="{ animationDelay: i * 0.1 + 's' }">
            <span class="advantage-icon">{{ adv.icon }}</span>
            <h3>{{ adv.title }}</h3>
            <p>{{ adv.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Location -->
    <section class="location animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Наш магазин</h2>
        <p class="section-subtitle">Приходите к нам — будем рады вас видеть</p>
        <div class="location-grid">
          <div class="location-card">
            <span class="location-icon">📍</span>
            <h3>Адрес</h3>
            <p>г. Москва, ул. Барклая 8, магазин 171</p>
          </div>
          <div class="location-card">
            <span class="location-icon">🕙</span>
            <h3>Время работы</h3>
            <p>10:00 – 21:00 ежедневно</p>
          </div>
          <div class="location-card">
            <span class="location-icon">📞</span>
            <h3>Телефон</h3>
            <p><a href="tel:+79299556487">+7 (929) 955 6487</a></p>
          </div>
          <div class="location-card">
            <span class="location-icon">✈️</span>
            <h3>Telegram</h3>
            <p><a href="https://t.me/weststore_msk" target="_blank" rel="noopener">@weststore_msk</a></p>
          </div>
          <div class="location-card">
            <span class="location-icon">💬</span>
            <h3>WhatsApp</h3>
            <p><a href="https://wa.me/79299556487" target="_blank" rel="noopener">+7 (929) 955 6487</a></p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  background: var(--bg-main);
}

/* ===== Hero ===== */
.hero {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 80px 0 90px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 24px;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #ffffff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ===== Sections ===== */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-dark);
  text-align: center;
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 16px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 48px;
}

/* ===== Story ===== */
.story {
  padding: 80px 0;
  background: #ffffff;
}

.story-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.story-card {
  background: var(--bg-main);
  border-radius: var(--radius-lg);
  padding: 40px 28px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.story-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
}

.story-icon {
  font-size: 44px;
  display: block;
  margin-bottom: 20px;
}

.story-card h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 12px;
}

.story-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
}

/* ===== Advantages ===== */
.advantages {
  padding: 80px 0;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.advantage-card {
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 36px 28px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.advantage-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border-color: var(--border-color);
}

.advantage-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 16px;
}

.advantage-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 10px;
}

.advantage-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 360px;
}

/* ===== Location ===== */
.location {
  padding: 80px 0;
  background: #ffffff;
}

.location-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.location-card {
  background: var(--bg-main);
  border-radius: var(--radius-md);
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.location-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

.location-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 16px;
}

.location-card h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.location-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

.location-card a {
  color: var(--accent-blue);
  text-decoration: none;
  transition: color 0.2s ease;
}

.location-card a:hover {
  color: var(--accent-blue-hover);
  text-decoration: underline;
}

/* ===== Scroll Animations ===== */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .location-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 60px 0 70px;
  }

  .hero-title {
    font-size: 40px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .section-title {
    font-size: 28px;
  }

  .story-content,
  .advantages-grid,
  .location-grid {
    grid-template-columns: 1fr;
  }

  .story,
  .advantages,
  .location {
    padding: 50px 0;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 32px;
  }
}
</style>
