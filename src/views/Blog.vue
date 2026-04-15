<script setup lang="ts">
import { onMounted } from 'vue'
import { useSeo } from '../lib/useSeo'

useSeo({
  title: 'Блог',
  description: 'Блог магазина ONLYPHONES — обзоры Apple техники, гайды по выбору, сравнения и полезные советы.'
})

const posts = [
  {
    id: 1,
    title: 'iPhone 17 Pro — что нового?',
    excerpt: 'Подробный обзор новинки Apple 2025 года. Разбираем все ключевые изменения: новый дизайн, камера, процессор A19 Pro и многое другое.',
    date: '12 апреля 2026',
    category: 'Обзоры',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 2,
    title: 'Как выбрать MacBook в 2025 году',
    excerpt: 'Полный гайд по выбору MacBook: Air или Pro? M4 или M4 Pro? Сравниваем модели и помогаем определиться с покупкой.',
    date: '8 апреля 2026',
    category: 'Гайды',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 3,
    title: 'AirPods Pro 3 vs AirPods 4 — сравнение',
    excerpt: 'Детальное сравнение двух популярных наушников Apple. Шумоподавление, качество звука, автономность и цена — что выбрать?',
    date: '3 апреля 2026',
    category: 'Сравнения',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 4,
    title: '5 причин купить iPad Air M3',
    excerpt: 'Почему iPad Air на чипе M3 — лучший планшет для большинства пользователей. Разбираем производительность, дисплей и возможности.',
    date: '28 марта 2026',
    category: 'Подборки',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    id: 5,
    title: 'Apple Watch Ultra 3 — обзор',
    excerpt: 'Новые функции и дизайн флагманских часов Apple. Увеличенный экран, датчик давления и рекордная автономность.',
    date: '22 марта 2026',
    category: 'Обзоры',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    id: 6,
    title: 'Как проверить iPhone перед покупкой',
    excerpt: 'Полезные советы, которые помогут избежать покупки проблемного устройства. Чек-лист проверки экрана, батареи и не только.',
    date: '15 марта 2026',
    category: 'Советы',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  },
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
  <div class="blog-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-badge">Блог</div>
        <h1 class="hero-title">Новости и статьи</h1>
        <p class="hero-subtitle">
          Обзоры Apple техники, гайды по выбору, сравнения устройств и полезные советы от экспертов ONLYPHONES
        </p>
      </div>
    </section>

    <!-- Posts -->
    <section class="posts animate-on-scroll">
      <div class="section-container">
        <div class="posts-grid">
          <article v-for="(post, i) in posts" :key="post.id" class="post-card" :style="{ animationDelay: i * 0.1 + 's' }">
            <div class="post-image" :style="{ background: post.gradient }">
              <span class="post-category">{{ post.category }}</span>
            </div>
            <div class="post-content">
              <h2 class="post-title">{{ post.title }}</h2>
              <p class="post-excerpt">{{ post.excerpt }}</p>
              <div class="post-footer">
                <span class="post-date">{{ post.date }}</span>
                <a href="#" class="post-link">Читать &rarr;</a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.blog-page {
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
  background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
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
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
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
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 24px;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ===== Posts ===== */
.posts {
  padding: 70px 0 90px;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.post-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.post-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border-color: var(--border-color);
}

.post-image {
  height: 200px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 16px;
  position: relative;
}

.post-category {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.post-content {
  padding: 28px;
}

.post-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 12px;
  line-height: 1.3;
}

.post-excerpt {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-date {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.post-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-blue);
  text-decoration: none;
  transition: all 0.2s ease;
}

.post-link:hover {
  color: var(--accent-blue-hover);
  transform: translateX(4px);
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
@media (max-width: 768px) {
  .hero {
    padding: 60px 0 70px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .posts {
    padding: 50px 0 60px;
  }

  .posts-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .post-image {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 26px;
  }

  .post-content {
    padding: 20px;
  }

  .post-title {
    font-size: 18px;
  }
}
</style>
