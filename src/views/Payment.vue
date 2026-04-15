<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSeo } from '../lib/useSeo'

useSeo({ title: 'Оплата', description: 'Способы оплаты в ONLYPHONES: наличные, карта, СБП, рассрочка, кредит. Удобная оплата при получении.' })

const activeTab = ref('card')

const paymentMethods = [
  {
    id: 'cash',
    icon: 'cash',
    title: 'Наличные',
    description: 'Оплата при получении',
    details: 'Оплата наличными при получении товара в нашем магазине или курьеру при доставке. Без комиссии.',
    commission: 'Без комиссии',
    commissionClass: 'free'
  },
  {
    id: 'card',
    icon: 'card',
    title: 'Банковская карта',
    description: 'Visa, Mastercard, МИР',
    details: 'Принимаем карты Visa, Mastercard и МИР. Оплата через защищённый платёжный терминал при получении или онлайн.',
    commission: 'Комиссия +10%',
    commissionClass: 'paid'
  },
  {
    id: 'sbp',
    icon: 'sbp',
    title: 'СБП',
    description: 'Система быстрых платежей',
    details: 'Мгновенный перевод по QR-коду или номеру телефона через приложение вашего банка. Работает со всеми банками РФ.',
    commission: 'Без комиссии',
    commissionClass: 'free'
  },
  {
    id: 'transfer',
    icon: 'transfer',
    title: 'Перевод на карту',
    description: 'Сбербанк, Т-Банк, Альфа',
    details: 'Перевод на карту Сбербанк, Т-Банк или Альфа-Банк. Отправьте перевод и пришлите скриншот менеджеру.',
    commission: 'Без комиссии',
    commissionClass: 'free'
  },
  {
    id: 'installment',
    icon: 'installment',
    title: 'Рассрочка',
    description: 'От 3 до 24 месяцев',
    details: 'Оформите рассрочку без переплат на срок от 3 до 24 месяцев. Быстрое одобрение — нужен только паспорт.',
    commission: '0% переплата',
    commissionClass: 'free'
  },
  {
    id: 'credit',
    icon: 'credit',
    title: 'Кредит',
    description: 'Через банки-партнёры',
    details: 'Оформление кредита через наших банков-партнёров. Решение за 5 минут, минимум документов.',
    commission: 'Индивидуально',
    commissionClass: 'neutral'
  }
]

const securityFeatures = [
  { icon: '🔒', title: 'SSL-шифрование', text: 'Все данные передаются по защищённому каналу' },
  { icon: '🛡️', title: 'PCI DSS', text: 'Соответствие стандартам безопасности платежей' },
  { icon: '📋', title: '54-ФЗ', text: 'Выдаём электронный чек по закону РФ' },
  { icon: '🔄', title: 'Возврат средств', text: 'Гарантия возврата в течение 14 дней' },
]

const faq = [
  {
    q: 'Можно ли оплатить при получении?',
    a: 'Да, вы можете оплатить наличными или картой при получении в магазине или курьеру.'
  },
  {
    q: 'Какая комиссия при оплате картой?',
    a: 'Комиссия при оплате банковской картой составляет +10% к стоимости товара. При оплате через СБП или наличными — без комиссии.'
  },
  {
    q: 'Как оформить рассрочку?',
    a: 'Для оформления рассрочки нужен только паспорт. Свяжитесь с нами, и мы поможем подобрать оптимальные условия от 3 до 24 месяцев без переплат.'
  },
  {
    q: 'Безопасно ли оплачивать онлайн?',
    a: 'Абсолютно. Мы используем SSL-шифрование и сертифицированный платёжный шлюз, соответствующий стандартам PCI DSS.'
  },
  {
    q: 'Можно ли получить чек?',
    a: 'Да, мы выдаём электронный чек в соответствии с 54-ФЗ на ваш email или телефон.'
  },
  {
    q: 'Как вернуть деньги за товар?',
    a: 'Возврат средств осуществляется тем же способом, которым была произведена оплата, в течение 14 дней с момента обращения.'
  }
]

const openFaq = ref<number | null>(null)

const toggleFaq = (i: number) => {
  openFaq.value = openFaq.value === i ? null : i
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
  <div class="payment-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-orb hero-orb-1"></div>
        <div class="hero-orb hero-orb-2"></div>
        <div class="hero-orb hero-orb-3"></div>
      </div>
      <div class="hero-container">
        <div class="hero-badge">Оплата</div>
        <h1 class="hero-title">Удобные способы<br><span class="highlight">оплаты для вас</span></h1>
        <p class="hero-subtitle">
          Наличные, банковские карты, СБП, переводы, рассрочка и кредит — выбирайте удобный способ
        </p>

        <!-- Floating card icons -->
        <div class="hero-cards">
          <div class="floating-card fc-visa">
            <svg viewBox="0 0 48 32" width="48" height="32">
              <rect width="48" height="32" rx="4" fill="#1A1F71"/>
              <text x="24" y="20" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold" font-family="sans-serif">VISA</text>
            </svg>
          </div>
          <div class="floating-card fc-mc">
            <svg viewBox="0 0 48 32" width="48" height="32">
              <rect width="48" height="32" rx="4" fill="#000"/>
              <circle cx="19" cy="16" r="9" fill="#EB001B" opacity="0.9"/>
              <circle cx="29" cy="16" r="9" fill="#F79E1B" opacity="0.9"/>
            </svg>
          </div>
          <div class="floating-card fc-mir">
            <svg viewBox="0 0 48 32" width="48" height="32">
              <rect width="48" height="32" rx="4" fill="#fff"/>
              <text x="24" y="20" text-anchor="middle" fill="#0F754E" font-size="11" font-weight="bold" font-family="sans-serif">МИР</text>
            </svg>
          </div>
          <div class="floating-card fc-sbp">
            <svg viewBox="0 0 48 32" width="48" height="32">
              <rect width="48" height="32" rx="4" fill="#fff"/>
              <text x="24" y="20" text-anchor="middle" fill="#5B2D8E" font-size="10" font-weight="bold" font-family="sans-serif">СБП</text>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Способы оплаты -->
    <section class="methods animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Способы оплаты</h2>
        <p class="section-subtitle">Выберите наиболее удобный для вас вариант</p>

        <div class="methods-grid">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            class="method-card"
            :class="{ active: activeTab === method.id }"
            @click="activeTab = method.id"
          >
            <div class="method-icon-wrap">
              <!-- Cash -->
              <svg v-if="method.icon === 'cash'" class="method-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="6" width="20" height="12" rx="2"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M6 12h.01M18 12h.01"/>
              </svg>
              <!-- Card -->
              <svg v-if="method.icon === 'card'" class="method-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <path d="M2 10h20"/>
                <path d="M6 15h4"/>
              </svg>
              <!-- SBP -->
              <svg v-if="method.icon === 'sbp'" class="method-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 7v4a1 1 0 001 1h3m10-5v4a1 1 0 01-1 1h-3M7 12v4a1 1 0 001 1h3m0-5h2m-2 0v5m2-5v4a1 1 0 001 1h3"/>
                <path d="M12 3v4m0 10v4"/>
              </svg>
              <!-- Transfer -->
              <svg v-if="method.icon === 'transfer'" class="method-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 8l4 4-4 4M7 16l-4-4 4-4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12H9M3 12h6" stroke-linecap="round"/>
              </svg>
              <!-- Installment -->
              <svg v-if="method.icon === 'installment'" class="method-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="16" rx="2"/>
                <path d="M3 10h18"/>
                <path d="M8 14h2m4 0h2"/>
              </svg>
              <!-- Credit -->
              <svg v-if="method.icon === 'credit'" class="method-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1a11 11 0 0111 11M12 1A11 11 0 011 12" stroke-dasharray="3 3"/>
              </svg>
            </div>

            <div class="method-info">
              <h3>{{ method.title }}</h3>
              <p class="method-desc">{{ method.description }}</p>
            </div>

            <span class="method-commission" :class="method.commissionClass">
              {{ method.commission }}
            </span>
          </div>
        </div>

        <!-- Details panel -->
        <Transition name="detail-fade" mode="out-in">
          <div class="detail-panel" :key="activeTab">
            <div class="detail-inner">
              <div class="detail-icon-side">
                <div class="detail-icon-circle">
                  <svg v-if="activeTab === 'cash'" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5">
                    <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>
                  </svg>
                  <svg v-if="activeTab === 'card'" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>
                  </svg>
                  <svg v-if="activeTab === 'sbp'" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.5">
                    <path d="M3 7v4a1 1 0 001 1h3m10-5v4a1 1 0 01-1 1h-3M7 12v4a1 1 0 001 1h3m0-5h2m-2 0v5m2-5v4a1 1 0 001 1h3"/><path d="M12 3v4m0 10v4"/>
                  </svg>
                  <svg v-if="activeTab === 'transfer'" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5">
                    <path d="M17 8l4 4-4 4M7 16l-4-4 4-4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H9M3 12h6" stroke-linecap="round"/>
                  </svg>
                  <svg v-if="activeTab === 'installment'" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 14h2m4 0h2"/>
                  </svg>
                  <svg v-if="activeTab === 'credit'" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5">
                    <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/><circle cx="12" cy="12" r="3"/><path d="M12 1a11 11 0 0111 11M12 1A11 11 0 011 12" stroke-dasharray="3 3"/>
                  </svg>
                </div>
              </div>
              <div class="detail-text">
                <h3>{{ paymentMethods.find(m => m.id === activeTab)?.title }}</h3>
                <p>{{ paymentMethods.find(m => m.id === activeTab)?.details }}</p>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </section>

    <!-- Безопасность -->
    <section class="security animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Безопасность платежей</h2>
        <p class="section-subtitle">Ваши данные под надёжной защитой</p>
        <div class="security-grid">
          <div v-for="(feat, i) in securityFeatures" :key="i" class="security-card">
            <span class="security-icon">{{ feat.icon }}</span>
            <h3>{{ feat.title }}</h3>
            <p>{{ feat.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Сравнительная таблица -->
    <section class="comparison animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Сравнение способов оплаты</h2>
        <p class="section-subtitle">Наглядно о комиссиях и особенностях</p>
        <div class="table-wrapper">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Способ оплаты</th>
                <th>Комиссия</th>
                <th>Скорость</th>
                <th>Где доступно</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Наличные</strong></td>
                <td><span class="badge badge-green">0%</span></td>
                <td>Мгновенно</td>
                <td>Магазин, курьер</td>
              </tr>
              <tr>
                <td><strong>Банковская карта</strong></td>
                <td><span class="badge badge-orange">+10%</span></td>
                <td>Мгновенно</td>
                <td>Магазин, курьер, онлайн</td>
              </tr>
              <tr>
                <td><strong>СБП</strong></td>
                <td><span class="badge badge-green">0%</span></td>
                <td>1-2 минуты</td>
                <td>Везде</td>
              </tr>
              <tr>
                <td><strong>Перевод на карту</strong></td>
                <td><span class="badge badge-green">0%</span></td>
                <td>5-30 минут</td>
                <td>Везде</td>
              </tr>
              <tr>
                <td><strong>Рассрочка</strong></td>
                <td><span class="badge badge-green">0%</span></td>
                <td>Оформление 15 мин</td>
                <td>Магазин</td>
              </tr>
              <tr>
                <td><strong>Кредит</strong></td>
                <td><span class="badge badge-gray">По ставке</span></td>
                <td>Оформление 15 мин</td>
                <td>Магазин</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="faq animate-on-scroll">
      <div class="section-container">
        <h2 class="section-title">Частые вопросы</h2>
        <p class="section-subtitle">Ответы на популярные вопросы об оплате</p>
        <div class="faq-list">
          <div
            v-for="(item, i) in faq"
            :key="i"
            class="faq-item"
            :class="{ open: openFaq === i }"
            @click="toggleFaq(i)"
          >
            <div class="faq-question">
              <span>{{ item.q }}</span>
              <svg class="faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <Transition name="faq-expand">
              <div v-if="openFaq === i" class="faq-answer">
                <p>{{ item.a }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta animate-on-scroll">
      <div class="section-container">
        <div class="cta-card">
          <h2>Остались вопросы по оплате?</h2>
          <p>Свяжитесь с нами — поможем выбрать удобный способ оплаты и оформить заказ</p>
          <div class="cta-actions">
            <a href="https://t.me/weststore_msk" target="_blank" class="cta-btn cta-telegram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </a>
            <a href="https://wa.me/79299556487" target="_blank" class="cta-btn cta-whatsapp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <a href="tel:+79299556487" class="cta-btn cta-phone">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Позвонить
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.payment-page {
  background: var(--bg-main);
}

/* ===== Hero ===== */
.hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%);
  padding: 80px 0 100px;
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.hero-orb-1 {
  width: 500px;
  height: 500px;
  background: rgba(99, 102, 241, 0.2);
  top: -20%;
  right: -10%;
  animation: orbFloat1 10s ease-in-out infinite;
}

.hero-orb-2 {
  width: 400px;
  height: 400px;
  background: rgba(16, 185, 129, 0.12);
  bottom: -30%;
  left: -5%;
  animation: orbFloat2 8s ease-in-out infinite;
}

.hero-orb-3 {
  width: 300px;
  height: 300px;
  background: rgba(245, 158, 11, 0.1);
  top: 30%;
  left: 40%;
  animation: orbFloat3 12s ease-in-out infinite;
}

@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 20px) scale(1.1); }
}
@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -30px) scale(1.05); }
}
@keyframes orbFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, -20px) scale(0.95); }
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
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 24px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(4px);
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 20px;
}

.hero-title .highlight {
  background: linear-gradient(135deg, #a5b4fc, #6ee7b7, #fcd34d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.65);
  max-width: 600px;
  margin: 0 auto 48px;
  line-height: 1.6;
}

/* Floating card icons */
.hero-cards {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.floating-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  animation: cardFloat 4s ease-in-out infinite;
}

.floating-card:nth-child(1) { animation-delay: 0s; }
.floating-card:nth-child(2) { animation-delay: 0.5s; }
.floating-card:nth-child(3) { animation-delay: 1s; }
.floating-card:nth-child(4) { animation-delay: 1.5s; }

.floating-card:hover {
  transform: translateY(-4px) scale(1.05);
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.25);
}

@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
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

/* ===== Methods ===== */
.methods {
  padding: 80px 0 40px;
}

.methods-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.method-card {
  background: #ffffff;
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
}

.method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

.method-card.active {
  border-color: var(--accent-blue);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.12);
}

.method-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.method-card.active .method-icon-wrap {
  background: rgba(37, 99, 235, 0.1);
}

.method-card.active .method-icon {
  stroke: var(--accent-blue);
}

.method-info {
  flex: 1;
  min-width: 0;
}

.method-info h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.method-desc {
  font-size: 13px;
  color: var(--text-muted);
}

.method-commission {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
}

.method-commission.free {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.method-commission.paid {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.method-commission.neutral {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

/* ===== Detail panel ===== */
.detail-panel {
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 40px;
  border: 1px solid var(--border-color);
}

.detail-inner {
  display: flex;
  align-items: center;
  gap: 32px;
}

.detail-icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-text h3 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.detail-text p {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.7;
}

.detail-fade-enter-active,
.detail-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.detail-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.detail-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== Security ===== */
.security {
  padding: 80px 0;
  background: #ffffff;
}

.security-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.security-card {
  background: var(--bg-main);
  border-radius: var(--radius-md);
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
}

.security-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
}

.security-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 16px;
}

.security-card h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.security-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* ===== Comparison Table ===== */
.comparison {
  padding: 80px 0;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.comparison-table th {
  background: #1a1a2e;
  color: #ffffff;
  padding: 16px 24px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.comparison-table td {
  padding: 16px 24px;
  font-size: 14px;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
}

.comparison-table tbody tr {
  transition: background 0.15s ease;
}

.comparison-table tbody tr:hover {
  background: rgba(37, 99, 235, 0.03);
}

.comparison-table tbody tr:last-child td {
  border-bottom: none;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-green {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.badge-orange {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.badge-gray {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

/* ===== FAQ ===== */
.faq {
  padding: 80px 0;
  background: #ffffff;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  background: var(--bg-main);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.faq-item:hover {
  border-color: var(--border-color);
}

.faq-item.open {
  border-color: var(--accent-blue);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.08);
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-dark);
  gap: 16px;
}

.faq-arrow {
  flex-shrink: 0;
  transition: transform 0.3s ease;
  color: var(--text-muted);
}

.faq-item.open .faq-arrow {
  transform: rotate(180deg);
  color: var(--accent-blue);
}

.faq-answer {
  padding: 0 24px 20px;
}

.faq-answer p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
}

.faq-expand-enter-active,
.faq-expand-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow: hidden;
}

.faq-expand-enter-from,
.faq-expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* ===== CTA ===== */
.cta {
  padding: 0 0 80px;
}

.cta-card {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: var(--radius-lg);
  padding: 60px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
  border-radius: 50%;
}

.cta-card h2 {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 12px;
  position: relative;
}

.cta-card p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 32px;
  position: relative;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  color: #ffffff;
}

.cta-btn:hover {
  transform: translateY(-2px);
}

.cta-telegram {
  background: #0088cc;
  box-shadow: 0 4px 16px rgba(0, 136, 204, 0.3);
}

.cta-telegram:hover {
  box-shadow: 0 8px 24px rgba(0, 136, 204, 0.4);
}

.cta-whatsapp {
  background: #25d366;
  box-shadow: 0 4px 16px rgba(37, 211, 102, 0.3);
}

.cta-whatsapp:hover {
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4);
}

.cta-phone {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

.cta-phone:hover {
  background: rgba(255, 255, 255, 0.15);
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
  .methods-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .security-grid {
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

  .hero-cards {
    gap: 12px;
  }

  .floating-card {
    padding: 8px 14px;
  }

  .section-title {
    font-size: 28px;
  }

  .methods-grid,
  .security-grid {
    grid-template-columns: 1fr;
  }

  .detail-inner {
    flex-direction: column;
    text-align: center;
  }

  .detail-panel {
    padding: 28px;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 12px 16px;
    font-size: 13px;
  }

  .cta-card {
    padding: 40px 24px;
  }

  .cta-card h2 {
    font-size: 24px;
  }

  .cta-actions {
    flex-direction: column;
    align-items: center;
  }

  .cta-btn {
    width: 100%;
    justify-content: center;
  }

  .methods,
  .security,
  .comparison,
  .faq,
  .cta {
    padding: 50px 0;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 26px;
  }

  .method-card {
    padding: 18px;
  }

  .method-commission {
    position: static;
    margin-top: 8px;
    display: inline-block;
  }

  .method-card {
    flex-wrap: wrap;
  }

  .faq-question {
    padding: 16px 18px;
    font-size: 14px;
  }

  .faq-answer {
    padding: 0 18px 16px;
  }
}
</style>
