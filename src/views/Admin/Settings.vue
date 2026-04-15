<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useActivityLog } from '../../lib/useActivityLog'

const { log } = useActivityLog()

const STORAGE_KEY = 'admin_settings'
const activeTab = ref('contacts')

// --- Default values ---
const defaults = {
  contacts: {
    storeName: 'ONLYPHONES',
    phone: '+7 (929) 955 6487',
    phoneSecondary: '',
    email: '',
    address: '',
    weekdaysFrom: '10:00',
    weekdaysTo: '21:00',
    weekendsFrom: '11:00',
    weekendsTo: '20:00'
  },
  social: {
    telegram: { value: '@weststore_msk', enabled: true },
    whatsapp: { value: '+7 929 955 6487', enabled: true },
    instagram: { value: 'https://www.instagram.com/onlyphones_ru/', enabled: true },
    avito: { value: 'https://www.avito.ru/brands/i314221442', enabled: true },
    vk: { value: '', enabled: false },
    youtube: { value: '', enabled: false }
  },
  store: {
    currency: '₽',
    minOrderAmount: 0,
    freeDeliveryThreshold: 0,
    deliveryCost: 0,
    cartEnabled: true,
    preordersEnabled: false,
    maintenanceMode: false
  },
  seo: {
    siteTitle: 'ONLYPHONES — Apple в Москве',
    metaDescription: '',
    metaKeywords: '',
    googleAnalyticsId: '',
    yandexMetrikaId: ''
  },
  notifications: {
    orderEmail: '',
    telegramBotToken: '',
    telegramChatId: '',
    emailEnabled: false,
    telegramEnabled: false
  }
}

// --- Reactive state ---
const contacts = ref({ ...defaults.contacts })
const social = ref(JSON.parse(JSON.stringify(defaults.social)))
const store = ref({ ...defaults.store })
const seo = ref({ ...defaults.seo })
const notifications = ref({ ...defaults.notifications })

// --- Load / Save ---
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (data.contacts) Object.assign(contacts.value, data.contacts)
    if (data.social) {
      for (const key of Object.keys(defaults.social) as (keyof typeof defaults.social)[]) {
        if (data.social[key]) Object.assign(social.value[key], data.social[key])
      }
    }
    if (data.store) Object.assign(store.value, data.store)
    if (data.seo) Object.assign(seo.value, data.seo)
    if (data.notifications) Object.assign(notifications.value, data.notifications)
  } catch {
    // ignore corrupt data
  }
}

function saveSection(section: string, data: any) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all[section] = JSON.parse(JSON.stringify(data))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    log('update', 'Настройки', `Раздел: ${section}`)
    ElMessage.success('Настройки сохранены')
  } catch {
    ElMessage.error('Ошибка сохранения')
  }
}

function resetAll() {
  ElMessageBox.confirm(
    'Все настройки будут сброшены к значениям по умолчанию. Продолжить?',
    'Сбросить все настройки',
    { confirmButtonText: 'Сбросить', cancelButtonText: 'Отмена', type: 'warning' }
  ).then(() => {
    contacts.value = { ...defaults.contacts }
    social.value = JSON.parse(JSON.stringify(defaults.social))
    store.value = { ...defaults.store }
    seo.value = { ...defaults.seo }
    notifications.value = { ...defaults.notifications }
    localStorage.removeItem(STORAGE_KEY)
    log('update', 'Настройки', 'Сброс всех настроек')
    ElMessage.success('Настройки сброшены')
  }).catch(() => {})
}

onMounted(loadSettings)

const tabs = [
  { name: 'contacts', label: 'Контакты' },
  { name: 'social', label: 'Соц. сети' },
  { name: 'store', label: 'Магазин' },
  { name: 'seo', label: 'SEO' },
  { name: 'notifications', label: 'Уведомления' }
]
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <div class="header-content">
        <h2>Настройки</h2>
        <span class="subtitle">Управление параметрами магазина</span>
      </div>
      <button class="reset-btn" @click="resetAll">Сбросить всё</button>
    </div>

    <!-- Tabs -->
    <div class="tabs-bar">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="['tab-btn', { active: activeTab === tab.name }]"
        @click="activeTab = tab.name"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Контакты -->
    <div v-show="activeTab === 'contacts'" class="settings-card">
      <h3 class="section-title">Контакты</h3>

      <div class="form-group">
        <label class="form-label">Название магазина</label>
        <el-input v-model="contacts.storeName" placeholder="ONLYPHONES" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Основной телефон</label>
          <el-input v-model="contacts.phone" placeholder="+7 (XXX) XXX XXXX" />
        </div>
        <div class="form-group">
          <label class="form-label">Дополнительный телефон</label>
          <el-input v-model="contacts.phoneSecondary" placeholder="Необязательно" />
          <span class="form-hint">Отображается в шапке и подвале сайта</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Email</label>
        <el-input v-model="contacts.email" placeholder="info@onlyphones.ru" />
      </div>

      <div class="form-group">
        <label class="form-label">Адрес</label>
        <el-input
          v-model="contacts.address"
          type="textarea"
          :rows="2"
          placeholder="Адрес магазина"
        />
      </div>

      <h4 class="subsection-title">Время работы</h4>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Будни: с</label>
          <el-input v-model="contacts.weekdaysFrom" placeholder="10:00" />
        </div>
        <div class="form-group">
          <label class="form-label">до</label>
          <el-input v-model="contacts.weekdaysTo" placeholder="21:00" />
        </div>
        <div class="form-group">
          <label class="form-label">Выходные: с</label>
          <el-input v-model="contacts.weekendsFrom" placeholder="11:00" />
        </div>
        <div class="form-group">
          <label class="form-label">до</label>
          <el-input v-model="contacts.weekendsTo" placeholder="20:00" />
        </div>
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="saveSection('contacts', contacts)">Сохранить</el-button>
      </div>
    </div>

    <!-- Социальные сети -->
    <div v-show="activeTab === 'social'" class="settings-card">
      <h3 class="section-title">Социальные сети</h3>

      <div class="social-row">
        <div class="social-field">
          <label class="form-label">Telegram</label>
          <el-input v-model="social.telegram.value" placeholder="@username" />
          <span class="form-hint">Имя пользователя или ссылка</span>
        </div>
        <el-switch v-model="social.telegram.enabled" active-text="Вкл" inactive-text="Выкл" />
      </div>

      <div class="social-row">
        <div class="social-field">
          <label class="form-label">WhatsApp</label>
          <el-input v-model="social.whatsapp.value" placeholder="+7 XXX XXX XXXX" />
          <span class="form-hint">Номер для WhatsApp чата</span>
        </div>
        <el-switch v-model="social.whatsapp.enabled" active-text="Вкл" inactive-text="Выкл" />
      </div>

      <div class="social-row">
        <div class="social-field">
          <label class="form-label">Instagram</label>
          <el-input v-model="social.instagram.value" placeholder="https://instagram.com/..." />
        </div>
        <el-switch v-model="social.instagram.enabled" active-text="Вкл" inactive-text="Выкл" />
      </div>

      <div class="social-row">
        <div class="social-field">
          <label class="form-label">Avito</label>
          <el-input v-model="social.avito.value" placeholder="https://avito.ru/..." />
        </div>
        <el-switch v-model="social.avito.enabled" active-text="Вкл" inactive-text="Выкл" />
      </div>

      <div class="social-row">
        <div class="social-field">
          <label class="form-label">VK</label>
          <el-input v-model="social.vk.value" placeholder="https://vk.com/..." />
          <span class="form-hint">Необязательно</span>
        </div>
        <el-switch v-model="social.vk.enabled" active-text="Вкл" inactive-text="Выкл" />
      </div>

      <div class="social-row">
        <div class="social-field">
          <label class="form-label">YouTube</label>
          <el-input v-model="social.youtube.value" placeholder="https://youtube.com/..." />
          <span class="form-hint">Необязательно</span>
        </div>
        <el-switch v-model="social.youtube.enabled" active-text="Вкл" inactive-text="Выкл" />
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="saveSection('social', social)">Сохранить</el-button>
      </div>
    </div>

    <!-- Магазин -->
    <div v-show="activeTab === 'store'" class="settings-card">
      <h3 class="section-title">Магазин</h3>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Символ валюты</label>
          <el-input v-model="store.currency" placeholder="₽" style="max-width: 120px" />
        </div>
        <div class="form-group">
          <label class="form-label">Мин. сумма заказа</label>
          <el-input v-model.number="store.minOrderAmount" type="number" placeholder="0">
            <template #append>{{ store.currency }}</template>
          </el-input>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Бесплатная доставка от</label>
          <el-input v-model.number="store.freeDeliveryThreshold" type="number" placeholder="0">
            <template #append>{{ store.currency }}</template>
          </el-input>
          <span class="form-hint">0 = бесплатная доставка всегда</span>
        </div>
        <div class="form-group">
          <label class="form-label">Стоимость доставки</label>
          <el-input v-model.number="store.deliveryCost" type="number" placeholder="0">
            <template #append>{{ store.currency }}</template>
          </el-input>
        </div>
      </div>

      <div class="toggle-group">
        <div class="toggle-row">
          <div class="toggle-info">
            <label class="form-label">Корзина</label>
            <span class="form-hint">Включить возможность добавления товаров в корзину</span>
          </div>
          <el-switch v-model="store.cartEnabled" active-text="Вкл" inactive-text="Выкл" />
        </div>

        <div class="toggle-row">
          <div class="toggle-info">
            <label class="form-label">Предзаказы</label>
            <span class="form-hint">Разрешить предзаказ товаров, которых нет в наличии</span>
          </div>
          <el-switch v-model="store.preordersEnabled" active-text="Вкл" inactive-text="Выкл" />
        </div>

        <div class="toggle-row maintenance">
          <div class="toggle-info">
            <label class="form-label">Режим обслуживания</label>
            <span class="form-hint warning-hint">Сайт будет недоступен для посетителей</span>
          </div>
          <el-switch
            v-model="store.maintenanceMode"
            active-text="Вкл"
            inactive-text="Выкл"
            active-color="#f56c6c"
          />
        </div>
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="saveSection('store', store)">Сохранить</el-button>
      </div>
    </div>

    <!-- SEO -->
    <div v-show="activeTab === 'seo'" class="settings-card">
      <h3 class="section-title">SEO</h3>

      <div class="form-group">
        <label class="form-label">Заголовок сайта (title)</label>
        <el-input v-model="seo.siteTitle" placeholder="ONLYPHONES — Apple в Москве" />
        <span class="form-hint">Отображается во вкладке браузера и в результатах поиска</span>
      </div>

      <div class="form-group">
        <label class="form-label">Meta description</label>
        <el-input
          v-model="seo.metaDescription"
          type="textarea"
          :rows="3"
          placeholder="Краткое описание сайта для поисковых систем (до 160 символов)"
        />
        <span class="form-hint">{{ seo.metaDescription.length }} / 160 символов</span>
      </div>

      <div class="form-group">
        <label class="form-label">Meta keywords</label>
        <el-input
          v-model="seo.metaKeywords"
          type="textarea"
          :rows="2"
          placeholder="apple, iphone, macbook, москва"
        />
        <span class="form-hint">Через запятую. Не влияет на Google, но используется Яндексом</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Google Analytics ID</label>
          <el-input v-model="seo.googleAnalyticsId" placeholder="G-XXXXXXXXXX" />
          <span class="form-hint">Необязательно</span>
        </div>
        <div class="form-group">
          <label class="form-label">Яндекс.Метрика ID</label>
          <el-input v-model="seo.yandexMetrikaId" placeholder="12345678" />
          <span class="form-hint">Необязательно</span>
        </div>
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="saveSection('seo', seo)">Сохранить</el-button>
      </div>
    </div>

    <!-- Уведомления -->
    <div v-show="activeTab === 'notifications'" class="settings-card">
      <h3 class="section-title">Уведомления</h3>

      <div class="toggle-row" style="margin-bottom: 20px">
        <div class="toggle-info">
          <label class="form-label">Email-уведомления</label>
          <span class="form-hint">Отправлять уведомления о новых заказах на email</span>
        </div>
        <el-switch v-model="notifications.emailEnabled" active-text="Вкл" inactive-text="Выкл" />
      </div>

      <div class="form-group">
        <label class="form-label">Email для уведомлений</label>
        <el-input
          v-model="notifications.orderEmail"
          placeholder="orders@onlyphones.ru"
          :disabled="!notifications.emailEnabled"
        />
      </div>

      <div class="divider" />

      <div class="toggle-row" style="margin-bottom: 20px">
        <div class="toggle-info">
          <label class="form-label">Telegram-уведомления</label>
          <span class="form-hint">Отправлять уведомления о заказах в Telegram</span>
        </div>
        <el-switch v-model="notifications.telegramEnabled" active-text="Вкл" inactive-text="Выкл" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Bot Token</label>
          <el-input
            v-model="notifications.telegramBotToken"
            placeholder="123456:ABC-DEF..."
            :disabled="!notifications.telegramEnabled"
            show-password
          />
          <span class="form-hint">Получите у @BotFather</span>
        </div>
        <div class="form-group">
          <label class="form-label">Chat ID</label>
          <el-input
            v-model="notifications.telegramChatId"
            placeholder="-100123456789"
            :disabled="!notifications.telegramEnabled"
          />
          <span class="form-hint">ID чата или группы для уведомлений</span>
        </div>
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="saveSection('notifications', notifications)">Сохранить</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page { padding: 20px 0; }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; padding: 25px 30px;
  background: var(--card-bg, #ffffff); border-left: 4px solid #409EFF;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); border-radius: 8px;
}
.header-content h2 { font-size: 24px; color: var(--text-primary, #303133); font-weight: 500; margin: 0; }
.subtitle { font-size: 12px; color: var(--text-muted, #909399); margin-top: 5px; display: block; }

.reset-btn {
  padding: 8px 20px; border: 1px solid #f56c6c; color: #f56c6c;
  background: transparent; border-radius: 6px; cursor: pointer;
  font-size: 13px; font-weight: 500; transition: all 0.2s;
}
.reset-btn:hover { background: #f56c6c; color: #fff; }

/* Tabs */
.tabs-bar {
  display: flex; gap: 4px; margin-bottom: 24px;
  background: var(--card-bg, #ffffff); border-radius: 10px;
  padding: 6px; box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08));
  overflow-x: auto;
}
.tab-btn {
  padding: 10px 20px; border: none; background: transparent;
  border-radius: 8px; font-size: 14px; font-weight: 500;
  color: var(--text-muted, #909399); cursor: pointer; transition: all 0.2s;
  white-space: nowrap;
}
.tab-btn:hover { color: var(--text-primary, #303133); background: var(--bg-secondary, #f5f7fa); }
.tab-btn.active {
  background: #409EFF; color: #fff;
}

/* Cards */
.settings-card {
  background: var(--card-bg, #ffffff); border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08));
  padding: 28px 32px;
}
.section-title {
  font-size: 18px; font-weight: 600;
  color: var(--text-primary, #303133); margin: 0 0 24px 0;
  padding-bottom: 12px; border-bottom: 1px solid var(--border, #ebeef5);
}
.subsection-title {
  font-size: 15px; font-weight: 600;
  color: var(--text-primary, #303133); margin: 24px 0 12px 0;
}

/* Form */
.form-group {
  margin-bottom: 18px; flex: 1; min-width: 0;
}
.form-label {
  display: block; font-size: 13px; font-weight: 500;
  color: var(--text-primary, #303133); margin-bottom: 6px;
}
.form-hint {
  display: block; font-size: 12px; color: var(--text-muted, #909399); margin-top: 4px;
}
.warning-hint { color: #f56c6c; font-weight: 500; }

.form-row {
  display: flex; gap: 16px;
}

/* Social rows */
.social-row {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 16px 0; border-bottom: 1px solid var(--border, #f0f2f5);
}
.social-row:last-of-type { border-bottom: none; }
.social-field { flex: 1; min-width: 0; }

/* Toggle rows */
.toggle-group { margin-top: 24px; }
.toggle-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 0; border-bottom: 1px solid var(--border, #f0f2f5);
}
.toggle-row:last-child { border-bottom: none; }
.toggle-row.maintenance { background: rgba(245,108,108,0.05); border-radius: 8px; padding: 14px 16px; margin-top: 8px; }
.toggle-info { flex: 1; }
.toggle-info .form-label { margin-bottom: 2px; }

.divider {
  height: 1px; background: var(--border, #ebeef5); margin: 20px 0;
}

/* Actions */
.form-actions {
  margin-top: 28px; padding-top: 20px;
  border-top: 1px solid var(--border, #ebeef5);
  display: flex; justify-content: flex-end;
}

@media (max-width: 700px) {
  .form-row { flex-direction: column; gap: 0; }
  .settings-card { padding: 20px 16px; }
  .page-header { flex-direction: column; gap: 12px; align-items: flex-start; }
  .tabs-bar { gap: 2px; padding: 4px; }
  .tab-btn { padding: 8px 14px; font-size: 13px; }
  .social-row { flex-direction: column; gap: 10px; }
}
</style>
