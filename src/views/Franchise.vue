<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSeo } from '../lib/useSeo'

useSeo({
  title: 'Франшиза',
  description: 'Франшиза ONLYPHONES — откройте магазин Apple техники. Готовая бизнес-модель, поддержка, быстрая окупаемость.'
})

const form = ref({ name: '', phone: '', city: '' })
const submitted = ref(false)

const advantages = [
  { icon: '🏆', title: 'Узнаваемый бренд', text: 'Сильное имя и репутация ONLYPHONES привлекают клиентов с первого дня работы' },
  { icon: '📊', title: 'Готовая бизнес-модель', text: 'Проверенная система продаж, закупок и управления — вам не нужно изобретать с нуля' },
  { icon: '🛡️', title: 'Поддержка 24/7', text: 'Персональный менеджер, помощь в запуске и операционная поддержка на каждом этапе' },
  { icon: '🚀', title: 'Быстрая окупаемость', text: 'Средний срок окупаемости — 3-6 месяцев благодаря высокой маржинальности продукции' },
]

const included = [
  { icon: '🎨', title: 'Брендинг и дизайн', text: 'Фирменный стиль, вывеска, оформление торговой точки под ключ' },
  { icon: '📦', title: 'Поставщики и закупки', text: 'Доступ к проверенным поставщикам с лучшими ценами на Apple технику' },
  { icon: '💻', title: 'CRM система', text: 'Готовая CRM для учёта продаж, клиентов и аналитики бизнеса' },
  { icon: '🎓', title: 'Обучение персонала', text: 'Полное обучение сотрудников продажам и сервису Apple техники' },
  { icon: '📢', title: 'Маркетинг', text: 'Рекламные материалы, стратегия продвижения и поддержка в соцсетях' },
  { icon: '⚖️', title: 'Юридическая поддержка', text: 'Помощь с документами, регистрацией и юридическими вопросами' },
]

const numbers = [
  { value: 'от 2 млн ₽', label: 'Инвестиции' },
  { value: '3-6 мес', label: 'Окупаемость' },
  { value: '10+', label: 'Городов' },
  { value: '30%+', label: 'Маржинальность' },
]

const handleSubmit = () => {
  if (!form.value.name || !form.value.phone || !form.value.city) return
  submitted.value = true
  setTimeout(() => { submitted.value = false; form.value = { name: '', phone: '', city: '' } }, 3000)
}

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
  <div class="franchise-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-badge">Франшиза</div>
        <h1 class="hero-title">Откройте свой<br><span class="highlight">ONLYPHONES</span></h1>
        <p class="hero-subtitle">
          Запустите прибыльный бизнес по продаже Apple техники с поддержкой сильного бренда и проверенной бизнес-моделью
        </p>
        <div class="hero-actions">
          <a href="#form" class="btn-primary">Оставить заявку</a>
          <a href="#advantages" class="btn-secondary">Узнать больше</a>
        </div>
      </div>
    </section>

    <!-- Преимущества -->
    <section id="advantages" class="advantages animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Почему ONLYPHONES</h2>
        <p class="section-subtitle">Преимущества франшизы, которые обеспечат ваш успех</p>
        <div class="advantages-grid">
          <div v-for="(adv, i) in advantages" :key="i" class="advantage-card" :style="{ animationDelay: i * 0.1 + 's' }">
            <span class="advantage-icon">{{ adv.icon }}</span>
            <h3>{{ adv.title }}</h3>
            <p>{{ adv.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Цифры -->
    <section class="numbers animate-on-scroll">
      <div class="section-container">
        <div class="numbers-grid">
          <div v-for="(num, i) in numbers" :key="i" class="number-card">
            <div class="number-value">{{ num.value }}</div>
            <div class="number-label">{{ num.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Что включено -->
    <section class="included animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Что включено</h2>
        <p class="section-subtitle">Полный пакет для запуска и ведения бизнеса</p>
        <div class="included-grid">
          <div v-for="(item, i) in included" :key="i" class="included-card" :style="{ animationDelay: i * 0.08 + 's' }">
            <span class="included-icon">{{ item.icon }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Форма -->
    <section id="form" class="form-section animate-on-scroll">
      <div class="section-container">
        <div class="form-wrapper">
          <div class="form-text">
            <h2>Хотите стать партнёром?</h2>
            <p>Оставьте заявку — мы свяжемся с вами, расскажем подробности и ответим на все вопросы о франшизе ONLYPHONES.</p>
            <div class="form-features">
              <div class="form-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Бесплатная консультация</span>
              </div>
              <div class="form-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Индивидуальный бизнес-план</span>
              </div>
              <div class="form-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Помощь с выбором локации</span>
              </div>
            </div>
          </div>
          <form class="callback-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <input v-model="form.name" type="text" placeholder="Ваше имя" required />
            </div>
            <div class="form-group">
              <input v-model="form.phone" type="tel" placeholder="Телефон" required />
            </div>
            <div class="form-group">
              <input v-model="form.city" type="text" placeholder="Ваш город" required />
            </div>
            <button type="submit" class="btn-submit" :class="{ success: submitted }">
              {{ submitted ? '✓ Заявка отправлена' : 'Отправить заявку' }}
            </button>
            <p class="form-privacy">
              Нажимая кнопку, вы соглашаетесь с
              <a href="#">политикой обработки персональных данных</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.franchise-page {
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
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
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
  background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
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
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 24px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
}

.hero-title .highlight {
  background: linear-gradient(135deg, #34d399, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 640px;
  margin: 0 auto 36px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  padding: 16px 36px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 16px 36px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
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

/* ===== Advantages ===== */
.advantages {
  padding: 70px 0;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.advantage-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid transparent;
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
  font-size: 17px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 10px;
}

.advantage-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

/* ===== Numbers ===== */
.numbers {
  padding: 60px 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.number-card {
  text-align: center;
  padding: 32px 16px;
}

.number-value {
  font-size: 36px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #34d399, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.number-label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

/* ===== Included ===== */
.included {
  padding: 70px 0;
  background: #ffffff;
}

.included-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.included-card {
  background: var(--bg-main);
  border-radius: 16px;
  padding: 32px 28px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.included-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
  border-color: var(--accent-blue);
}

.included-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 16px;
}

.included-card h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 10px;
}

.included-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

/* ===== Form ===== */
.form-section {
  padding: 80px 0;
}

.form-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
}

.form-text h2 {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 16px;
}

.form-text p {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 24px;
}

.form-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-main);
  font-weight: 500;
}

.callback-form {
  background: #ffffff;
  border-radius: 16px;
  padding: 36px;
  border: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 16px;
}

.form-group input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  background: var(--bg-main);
  color: var(--text-dark);
  transition: border-color 0.2s ease;
  outline: none;
}

.form-group input:focus {
  border-color: var(--accent-blue);
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.btn-submit {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-submit.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.form-privacy {
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.5;
}

.form-privacy a {
  color: var(--accent-blue);
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
  .advantages-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .numbers-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .included-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

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

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .section-title {
    font-size: 28px;
  }

  .advantages-grid,
  .included-grid {
    grid-template-columns: 1fr;
  }

  .numbers-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .number-value {
    font-size: 28px;
  }

  .form-wrapper {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .advantages,
  .included,
  .form-section {
    padding: 50px 0;
  }

  .numbers {
    padding: 40px 0;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 26px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }

  .callback-form {
    padding: 24px;
  }

  .number-value {
    font-size: 24px;
  }
}
</style>
