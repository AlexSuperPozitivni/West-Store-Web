<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useActivityLog } from '../../lib/useActivityLog'

const { log } = useActivityLog()

const STORAGE_KEY = 'admin_pages_content'

interface SectionItem {
  icon: string
  title: string
  text: string
}

interface Section {
  id: string
  title: string
  description: string
  visible: boolean
  items: SectionItem[]
}

interface PageContent {
  id: string
  name: string
  path: string
  pageTitle: string
  hero: {
    badge: string
    title: string
    subtitle: string
    buttonPrimary: string
    buttonSecondary: string
  }
  sections: Section[]
  seo: {
    metaTitle: string
    metaDescription: string
  }
}

const getDefaults = (): PageContent[] => [
  {
    id: 'trade-in',
    name: 'Trade-In',
    path: '/trade-in',
    pageTitle: 'Trade-In',
    hero: {
      badge: 'Trade-In',
      title: 'Обменяйте старую технику на новую с выгодой',
      subtitle: 'Мы готовы выкупить ваши старые гаджеты или обменять на новые на самых выгодных условиях в Москве',
      buttonPrimary: 'Оценить устройство',
      buttonSecondary: 'Как это работает'
    },
    sections: [
      {
        id: 'advantages',
        title: 'Преимущества',
        description: '',
        visible: true,
        items: [
          { icon: '⚡', title: 'Быстрая оценка', text: 'Узнайте стоимость за 5 минут' },
          { icon: '💰', title: 'Лучшие цены', text: 'Самые выгодные условия в Москве' },
          { icon: '🔄', title: 'Обмен с доплатой', text: 'Сдайте старое — получите новое' }
        ]
      },
      {
        id: 'devices',
        title: 'Какие устройства принимаем',
        description: 'Принимаем технику Apple, Samsung и другие бренды в любом состоянии',
        visible: true,
        items: [
          { icon: '📱', title: 'iPhone', text: 'Все модели iPhone от 8 до 17 Pro Max' },
          { icon: '📋', title: 'iPad', text: 'iPad, iPad Air, iPad Pro, iPad mini' },
          { icon: '⌚', title: 'Apple Watch', text: 'Watch Series 4 и новее, Ultra' },
          { icon: '💻', title: 'MacBook', text: 'MacBook Air, MacBook Pro все поколения' },
          { icon: '📲', title: 'Samsung', text: 'Galaxy S, Galaxy Z, Galaxy Tab' },
          { icon: '🎧', title: 'AirPods', text: 'AirPods, AirPods Pro, AirPods Max' }
        ]
      },
      {
        id: 'steps',
        title: 'Как это работает',
        description: 'Три простых шага для обмена вашего устройства',
        visible: true,
        items: [
          { icon: '💻', title: 'Рассчитайте стоимость', text: 'Опишите ваш гаджет — модель, состояние, комплектацию. Мы оценим его и предложим лучшую цену.' },
          { icon: '🏪', title: 'Принесите устройство', text: 'Приходите к нам в магазин — наш специалист осмотрит устройство и подтвердит оценку на месте.' },
          { icon: '💸', title: 'Получите деньги', text: 'Техосмотр специалистом на месте. Моментальная выплата наличными или обмен с доплатой на новое устройство.' }
        ]
      }
    ],
    seo: {
      metaTitle: 'Trade-In — Обмен техники | ONLYPHONES',
      metaDescription: 'Обменяйте старую технику Apple на новую с выгодой. Быстрая оценка, лучшие цены в Москве.'
    }
  },
  {
    id: 'repair',
    name: 'Ремонт',
    path: '/repair',
    pageTitle: 'Ремонт техники Apple',
    hero: {
      badge: 'Сервисный центр',
      title: 'Ремонт техники Apple в Москве',
      subtitle: 'Профессиональный ремонт iPhone, iPad, MacBook, Apple Watch и другой техники. Бесплатная диагностика и гарантия на все работы.',
      buttonPrimary: 'Оставить заявку',
      buttonSecondary: 'Наши услуги'
    },
    sections: [
      {
        id: 'guarantees',
        title: 'Гарантии',
        description: '',
        visible: true,
        items: [
          { icon: '🔧', title: 'Оригинальные запчасти', text: 'Используем только сертифицированные комплектующие' },
          { icon: '⏱️', title: 'Быстрый ремонт', text: 'Большинство ремонтов за 1-2 часа' },
          { icon: '💯', title: 'Бесплатная диагностика', text: 'Точная стоимость до начала работ' }
        ]
      },
      {
        id: 'services',
        title: 'Наши услуги',
        description: 'Ремонтируем все устройства Apple с гарантией качества',
        visible: true,
        items: [
          { icon: '📱', title: 'iPhone', text: 'Замена экрана, батареи, Face ID, камеры, разъёма, восстановление после воды' },
          { icon: '📋', title: 'iPad', text: 'Замена дисплея, батареи, разъёма, кнопки Home, динамика, корпуса' },
          { icon: '💻', title: 'MacBook', text: 'Замена матрицы, клавиатуры, батареи, ремонт материнской платы, SSD, чистка' },
          { icon: '⌚', title: 'Apple Watch', text: 'Замена экрана, батареи, кнопки, тачскрина, восстановление после воды' },
          { icon: '🎧', title: 'AirPods', text: 'Замена батареи, ремонт кейса, динамика, зарядки, микрофона' },
          { icon: '🖥️', title: 'iMac / Mac', text: 'Замена HDD/SSD, апгрейд RAM, ремонт блока питания, дисплея, обслуживание' }
        ]
      },
      {
        id: 'steps',
        title: 'Как проходит ремонт',
        description: 'Прозрачный процесс от диагностики до выдачи',
        visible: true,
        items: [
          { icon: '🔍', title: 'Рассчитайте стоимость', text: 'Опишите проблему — мы проведём бесплатную диагностику и сообщим точную стоимость ремонта.' },
          { icon: '🏪', title: 'Принесите устройство', text: 'Если цена устраивает — приходите к нам в сервис. Наш мастер примет устройство и начнёт работу.' },
          { icon: '✅', title: 'Получите исправный девайс', text: 'Быстрый и качественный ремонт. Гарантия на все виды работ от 3 до 12 месяцев.' }
        ]
      }
    ],
    seo: {
      metaTitle: 'Ремонт Apple в Москве | ONLYPHONES',
      metaDescription: 'Профессиональный ремонт iPhone, iPad, MacBook. Бесплатная диагностика, гарантия до 12 месяцев.'
    }
  },
  {
    id: 'payment',
    name: 'Оплата',
    path: '/payment',
    pageTitle: 'Оплата и доставка',
    hero: {
      badge: 'Оплата',
      title: 'Удобные способы оплаты',
      subtitle: 'Выберите подходящий способ оплаты. Наличные, карта, СБП, рассрочка — всё для вашего удобства.',
      buttonPrimary: 'Перейти к покупкам',
      buttonSecondary: 'Частые вопросы'
    },
    sections: [
      {
        id: 'methods',
        title: 'Способы оплаты',
        description: 'Принимаем все популярные способы оплаты',
        visible: true,
        items: [
          { icon: '💵', title: 'Наличные', text: 'Оплата наличными при получении товара в магазине или курьеру. Без комиссии.' },
          { icon: '💳', title: 'Банковская карта', text: 'Visa, Mastercard, МИР. Комиссия +10%.' },
          { icon: '📲', title: 'СБП', text: 'Мгновенный перевод по QR-коду или номеру телефона. Без комиссии.' },
          { icon: '🏦', title: 'Перевод на карту', text: 'Сбербанк, Т-Банк, Альфа-Банк. Без комиссии.' },
          { icon: '📅', title: 'Рассрочка', text: 'От 3 до 24 месяцев. 0% переплата.' },
          { icon: '🏷️', title: 'Кредит', text: 'Через банки-партнёры. Решение за 5 минут.' }
        ]
      },
      {
        id: 'security',
        title: 'Безопасность платежей',
        description: 'Ваши данные под надёжной защитой',
        visible: true,
        items: [
          { icon: '🔒', title: 'SSL-шифрование', text: 'Все данные передаются по защищённому каналу' },
          { icon: '🛡️', title: 'PCI DSS', text: 'Соответствие стандартам безопасности платежей' },
          { icon: '📋', title: '54-ФЗ', text: 'Выдаём электронный чек по закону РФ' },
          { icon: '🔄', title: 'Возврат средств', text: 'Гарантия возврата в течение 14 дней' }
        ]
      }
    ],
    seo: {
      metaTitle: 'Оплата и доставка | ONLYPHONES',
      metaDescription: 'Удобные способы оплаты: наличные, карта, СБП, рассрочка. Доставка по Москве и России.'
    }
  },
  {
    id: 'about',
    name: 'О магазине',
    path: '/about',
    pageTitle: 'О магазине ONLYPHONES',
    hero: {
      badge: 'О нас',
      title: 'ONLYPHONES — магазин техники Apple в Москве',
      subtitle: 'Продаём оригинальную технику Apple с гарантией. Работаем с 2020 года, тысячи довольных клиентов.',
      buttonPrimary: 'Перейти в каталог',
      buttonSecondary: 'Связаться с нами'
    },
    sections: [
      {
        id: 'about-info',
        title: 'О компании',
        description: 'Надёжный магазин техники Apple в Москве',
        visible: true,
        items: [
          { icon: '🏪', title: 'Розничный магазин', text: 'Удобное расположение в центре Москвы, можно посмотреть и протестировать технику' },
          { icon: '✅', title: 'Оригинальная техника', text: 'Только сертифицированная продукция Apple с официальной гарантией' },
          { icon: '🚀', title: 'Быстрая доставка', text: 'Доставка по Москве в день заказа, по России — от 1 до 3 дней' }
        ]
      },
      {
        id: 'why-us',
        title: 'Почему выбирают нас',
        description: '',
        visible: true,
        items: [
          { icon: '💰', title: 'Лучшие цены', text: 'Конкурентные цены и регулярные акции' },
          { icon: '🛡️', title: 'Гарантия', text: 'Официальная гарантия на всю продукцию' },
          { icon: '👨‍💼', title: 'Поддержка', text: 'Консультация и помощь после покупки' },
          { icon: '🔄', title: 'Trade-In', text: 'Обмен старой техники на новую с доплатой' }
        ]
      }
    ],
    seo: {
      metaTitle: 'О магазине ONLYPHONES | Техника Apple в Москве',
      metaDescription: 'ONLYPHONES — магазин оригинальной техники Apple в Москве. Гарантия, доставка, trade-in, ремонт.'
    }
  }
]

const pages = ref<PageContent[]>([])
const selectedPageId = ref<string>('')
const saving = ref(false)

const selectedPage = computed(() => pages.value.find(p => p.id === selectedPageId.value) || null)

const loadPages = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      pages.value = JSON.parse(stored)
    } else {
      pages.value = getDefaults()
    }
  } catch {
    pages.value = getDefaults()
  }
  if (pages.value.length > 0 && !selectedPageId.value) {
    selectedPageId.value = pages.value[0].id
  }
}

const selectPage = (id: string) => {
  selectedPageId.value = id
}

const savePage = () => {
  saving.value = true
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages.value))
    ElMessage.success('Изменения сохранены')
    if (selectedPage.value) {
      log('update', 'Страница', selectedPage.value.name)
    }
  } catch {
    ElMessage.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

const resetToDefaults = async () => {
  try {
    await ElMessageBox.confirm(
      'Все изменения будут сброшены к значениям по умолчанию. Продолжить?',
      'Сброс к стандартным значениям',
      { confirmButtonText: 'Сбросить', cancelButtonText: 'Отмена', type: 'warning' }
    )
    pages.value = getDefaults()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages.value))
    ElMessage.success('Контент сброшен к стандартным значениям')
    log('reset', 'Страницы', 'Сброс всех страниц к значениям по умолчанию')
  } catch {
    // cancelled
  }
}

const addItem = (section: Section) => {
  section.items.push({ icon: '📌', title: 'Новый элемент', text: 'Описание' })
}

const removeItem = (section: Section, index: number) => {
  section.items.splice(index, 1)
}

onMounted(loadPages)
</script>

<template>
  <div class="pages-admin">
    <div class="page-header">
      <div class="header-content">
        <h2>Управление страницами</h2>
        <span class="subtitle">Редактирование контента страниц сайта</span>
      </div>
      <div class="header-actions">
        <el-button @click="resetToDefaults">Сбросить всё</el-button>
        <el-button type="primary" :loading="saving" @click="savePage">
          Сохранить изменения
        </el-button>
      </div>
    </div>

    <div class="pages-layout">
      <!-- Sidebar: Page list -->
      <aside class="pages-sidebar">
        <div class="sidebar-title">Страницы</div>
        <div
          v-for="page in pages"
          :key="page.id"
          :class="['page-item', { active: selectedPageId === page.id }]"
          @click="selectPage(page.id)"
        >
          <div class="page-item-name">{{ page.name }}</div>
          <div class="page-item-path">{{ page.path }}</div>
        </div>
      </aside>

      <!-- Main: Content editor -->
      <main class="pages-editor" v-if="selectedPage">
        <!-- Page title -->
        <div class="editor-card">
          <div class="card-title">Заголовок страницы</div>
          <el-input v-model="selectedPage.pageTitle" placeholder="Заголовок страницы" size="large" />
        </div>

        <!-- Hero section -->
        <div class="editor-card">
          <div class="card-title">Hero-секция</div>
          <div class="card-desc">Верхний блок страницы с заголовком и кнопками</div>
          <div class="field-group">
            <label>Бейдж</label>
            <el-input v-model="selectedPage.hero.badge" placeholder="Например: Trade-In" />
          </div>
          <div class="field-group">
            <label>Заголовок</label>
            <el-input v-model="selectedPage.hero.title" placeholder="Главный заголовок" type="textarea" :rows="2" />
          </div>
          <div class="field-group">
            <label>Подзаголовок</label>
            <el-input v-model="selectedPage.hero.subtitle" placeholder="Описание под заголовком" type="textarea" :rows="3" />
          </div>
          <div class="field-row">
            <div class="field-group">
              <label>Кнопка основная</label>
              <el-input v-model="selectedPage.hero.buttonPrimary" placeholder="Текст кнопки" />
            </div>
            <div class="field-group">
              <label>Кнопка дополнительная</label>
              <el-input v-model="selectedPage.hero.buttonSecondary" placeholder="Текст кнопки" />
            </div>
          </div>
        </div>

        <!-- Sections -->
        <div v-for="section in selectedPage.sections" :key="section.id" class="editor-card">
          <div class="card-header-row">
            <div>
              <div class="card-title">{{ section.title }}</div>
              <div class="card-desc">Секция #{{ section.id }}</div>
            </div>
            <el-switch
              v-model="section.visible"
              active-text="Видима"
              inactive-text="Скрыта"
              inline-prompt
            />
          </div>

          <div class="field-group">
            <label>Заголовок секции</label>
            <el-input v-model="section.title" placeholder="Заголовок" />
          </div>
          <div class="field-group">
            <label>Описание секции</label>
            <el-input v-model="section.description" placeholder="Описание (необязательно)" type="textarea" :rows="2" />
          </div>

          <div class="items-label">
            Элементы ({{ section.items.length }})
            <el-button size="small" @click="addItem(section)">+ Добавить</el-button>
          </div>

          <div class="items-list">
            <div v-for="(item, idx) in section.items" :key="idx" class="item-card">
              <div class="item-top">
                <div class="item-icon-field">
                  <label>Иконка</label>
                  <el-input v-model="item.icon" class="icon-input" />
                </div>
                <div class="item-title-field">
                  <label>Название</label>
                  <el-input v-model="item.title" placeholder="Название" />
                </div>
                <el-button
                  size="small"
                  type="danger"
                  plain
                  class="item-remove-btn"
                  @click="removeItem(section, idx)"
                  title="Удалить элемент"
                >
                  &times;
                </el-button>
              </div>
              <div class="item-bottom">
                <label>Текст</label>
                <el-input v-model="item.text" placeholder="Описание элемента" type="textarea" :rows="2" />
              </div>
            </div>
          </div>
        </div>

        <!-- SEO -->
        <div class="editor-card">
          <div class="card-title">SEO</div>
          <div class="card-desc">Мета-теги для поисковых систем</div>
          <div class="field-group">
            <label>Meta Title</label>
            <el-input v-model="selectedPage.seo.metaTitle" placeholder="Заголовок для поиска" />
          </div>
          <div class="field-group">
            <label>Meta Description</label>
            <el-input v-model="selectedPage.seo.metaDescription" placeholder="Описание для поиска" type="textarea" :rows="3" />
          </div>
        </div>

        <!-- Save button at bottom -->
        <div class="editor-footer">
          <el-button @click="resetToDefaults">Сбросить всё</el-button>
          <el-button type="primary" :loading="saving" size="large" @click="savePage">
            Сохранить изменения
          </el-button>
        </div>
      </main>

      <main class="pages-editor empty-editor" v-else>
        <div class="empty-state">
          <p>Выберите страницу для редактирования</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.pages-admin {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 25px 30px;
  background: var(--card-bg, #ffffff);
  border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px var(--shadow, rgba(0, 0, 0, 0.08));
  border-radius: 8px;
}

.header-content h2 {
  font-size: 24px;
  color: var(--text-primary, #303133);
  font-weight: 500;
  margin: 0;
}

.subtitle {
  font-size: 12px;
  color: var(--text-muted, #909399);
  margin-top: 5px;
  display: block;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* Layout */
.pages-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  align-items: start;
}

/* Sidebar */
.pages-sidebar {
  background: var(--card-bg, #ffffff);
  border-radius: 10px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0, 0, 0, 0.06));
  overflow: hidden;
  position: sticky;
  top: 20px;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted, #909399);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px 20px 10px;
}

.page-item {
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.2s, border-left 0.2s;
  border-left: 3px solid transparent;
}

.page-item:hover {
  background: var(--bg-secondary, #f5f7fa);
}

.page-item.active {
  background: var(--bg-secondary, #f0f5ff);
  border-left-color: #409EFF;
}

.page-item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.page-item-path {
  font-size: 12px;
  color: var(--text-muted, #909399);
  margin-top: 2px;
}

/* Editor */
.pages-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-editor {
  min-height: 300px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-muted, #909399);
  font-size: 15px;
  background: var(--card-bg, #ffffff);
  border-radius: 10px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0, 0, 0, 0.06));
}

.editor-card {
  background: var(--card-bg, #ffffff);
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 8px var(--shadow, rgba(0, 0, 0, 0.06));
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  color: var(--text-muted, #909399);
  margin-bottom: 16px;
}

.card-header-row .card-title {
  margin-bottom: 2px;
}

.card-header-row .card-desc {
  margin-bottom: 0;
}

.field-group {
  margin-bottom: 14px;
}

.field-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary, #606266);
  margin-bottom: 6px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Items */
.items-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-card {
  background: var(--bg-secondary, #f5f7fa);
  border-radius: 8px;
  padding: 14px;
  border: 1px solid var(--border-light, #ebeef5);
}

.item-top {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin-bottom: 10px;
}

.item-icon-field {
  width: 70px;
  flex-shrink: 0;
}

.item-icon-field label,
.item-title-field label,
.item-bottom label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted, #909399);
  margin-bottom: 4px;
}

.item-title-field {
  flex: 1;
}

.icon-input {
  width: 70px;
}

.item-remove-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 18px;
  line-height: 1;
}

.item-bottom label {
  margin-bottom: 4px;
}

/* Footer */
.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .pages-layout {
    grid-template-columns: 1fr;
  }

  .pages-sidebar {
    position: static;
  }

  .field-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
