<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useActivityLog } from '../../lib/useActivityLog'

const { log } = useActivityLog()

const STORAGE_KEY = 'admin_seo'
const activeTab = ref('global')

const globalSeo = ref({
  siteTitle: 'WEST-STORE — Apple в Москве',
  metaDescription: 'Интернет-магазин Apple техники в Москве. iPhone, MacBook, iPad, AirPods, Apple Watch по лучшим ценам.',
  metaKeywords: 'apple, iphone, macbook, ipad, airpods, watch, москва, купить, west-store',
  ogImage: '/logo_new.png',
  ogSiteName: 'WEST-STORE',
  googleAnalyticsId: '',
  yandexMetrikaId: '',
  yandexVerification: '',
  googleVerification: '',
})

interface PageSeo {
  title: string
  description: string
  keywords: string
}

const defaultPages: Record<string, PageSeo> = {
  home: { title: 'Главная', description: 'WEST-STORE — интернет-магазин Apple техники в Москве. Лучшие цены, доставка, гарантия.', keywords: '' },
  catalog: { title: 'Каталог', description: 'Каталог товаров WEST-STORE. iPhone, MacBook, iPad, AirPods и другая техника.', keywords: '' },
  'trade-in': { title: 'Trade-In', description: 'Обменяйте старую технику на новую с выгодой. Лучшие цены на выкуп в Москве.', keywords: '' },
  repair: { title: 'Ремонт', description: 'Профессиональный ремонт Apple техники в Москве. Бесплатная диагностика.', keywords: '' },
  payment: { title: 'Доставка и оплата', description: 'Условия доставки и оплаты в WEST-STORE. Быстрая доставка по Москве.', keywords: '' },
  about: { title: 'О магазине', description: 'О магазине WEST-STORE. Мы продаём Apple технику с 2012 года.', keywords: '' },
  contacts: { title: 'Контакты', description: 'Контакты WEST-STORE. Москва, ул. Барклая 8. Телефон: +7 929 955 6487.', keywords: '' },
  blog: { title: 'Блог', description: 'Блог WEST-STORE. Новости Apple, обзоры, советы.', keywords: '' },
}

const pages = ref<Record<string, PageSeo>>(JSON.parse(JSON.stringify(defaultPages)))
const editingPage = ref<string | null>(null)

const pageLabels: Record<string, string> = {
  home: 'Главная', catalog: 'Каталог', 'trade-in': 'Trade-In', repair: 'Ремонт',
  payment: 'Доставка и оплата', about: 'О магазине', contacts: 'Контакты', blog: 'Блог',
}

// Google preview
const previewTitle = computed(() => {
  if (editingPage.value && pages.value[editingPage.value]) {
    const p = pages.value[editingPage.value]
    return p.title ? `${p.title} | ${globalSeo.value.siteTitle}` : globalSeo.value.siteTitle
  }
  return globalSeo.value.siteTitle
})

const previewDescription = computed(() => {
  if (editingPage.value && pages.value[editingPage.value]) {
    return pages.value[editingPage.value].description || globalSeo.value.metaDescription
  }
  return globalSeo.value.metaDescription
})

const previewUrl = computed(() => {
  if (editingPage.value) {
    return editingPage.value === 'home' ? 'https://west-store.ru' : `https://west-store.ru/${editingPage.value}`
  }
  return 'https://west-store.ru'
})

const descLength = computed(() => previewDescription.value.length)
const descStatus = computed(() => {
  if (descLength.value === 0) return 'empty'
  if (descLength.value < 80) return 'short'
  if (descLength.value > 160) return 'long'
  return 'good'
})

const titleLength = computed(() => previewTitle.value.length)
const titleStatus = computed(() => {
  if (titleLength.value === 0) return 'empty'
  if (titleLength.value > 60) return 'long'
  return 'good'
})

// Product SEO template
const productSeoTemplate = ref({
  titleTemplate: '{name} — купить в WEST-STORE',
  descriptionTemplate: '{name} — купить за {price} ₽ в WEST-STORE. Доставка по Москве, гарантия.',
})

// Load/Save
function loadSeo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (data.global) Object.assign(globalSeo.value, data.global)
    if (data.pages) {
      for (const key of Object.keys(defaultPages)) {
        if (data.pages[key]) Object.assign(pages.value[key], data.pages[key])
      }
    }
    if (data.productTemplate) Object.assign(productSeoTemplate.value, data.productTemplate)
  } catch { /* ignore */ }
}

function saveGlobal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all.global = JSON.parse(JSON.stringify(globalSeo.value))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    log('update', 'SEO', 'Глобальные настройки')
    ElMessage.success('SEO настройки сохранены')
  } catch { ElMessage.error('Ошибка сохранения') }
}

function savePages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all.pages = JSON.parse(JSON.stringify(pages.value))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    log('update', 'SEO', 'Мета-теги страниц')
    ElMessage.success('Мета-теги страниц сохранены')
  } catch { ElMessage.error('Ошибка сохранения') }
}

function saveProductTemplate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? JSON.parse(raw) : {}
    all.productTemplate = JSON.parse(JSON.stringify(productSeoTemplate.value))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    log('update', 'SEO', 'Шаблон SEO товаров')
    ElMessage.success('Шаблон сохранён')
  } catch { ElMessage.error('Ошибка сохранения') }
}

onMounted(loadSeo)
</script>

<template>
  <div class="seo-page">
    <div class="page-header">
      <div class="header-content">
        <h2>SEO-управление</h2>
        <span class="subtitle">Мета-теги, аналитика, поисковая оптимизация</span>
      </div>
    </div>

    <div class="tabs-bar">
      <button :class="['tab-btn', { active: activeTab === 'global' }]" @click="activeTab = 'global'">Глобальные</button>
      <button :class="['tab-btn', { active: activeTab === 'pages' }]" @click="activeTab = 'pages'">Страницы</button>
      <button :class="['tab-btn', { active: activeTab === 'products' }]" @click="activeTab = 'products'">Товары</button>
      <button :class="['tab-btn', { active: activeTab === 'analytics' }]" @click="activeTab = 'analytics'">Аналитика</button>
    </div>

    <!-- Global SEO -->
    <div v-show="activeTab === 'global'" class="seo-card">
      <h3 class="section-title">Глобальные SEO-настройки</h3>

      <div class="form-group">
        <label class="form-label">Название сайта (Site Title)</label>
        <el-input v-model="globalSeo.siteTitle" placeholder="WEST-STORE — Apple в Москве" />
        <span class="form-hint">Добавляется ко всем страницам через " | "</span>
      </div>

      <div class="form-group">
        <label class="form-label">Meta Description (по умолчанию)</label>
        <el-input v-model="globalSeo.metaDescription" type="textarea" :rows="3" placeholder="Описание сайта для поисковых систем" />
        <span :class="['char-counter', descStatus]">{{ globalSeo.metaDescription.length }} / 160 символов
          <template v-if="globalSeo.metaDescription.length > 160"> — слишком длинное!</template>
          <template v-else-if="globalSeo.metaDescription.length < 80 && globalSeo.metaDescription.length > 0"> — лучше от 80 символов</template>
        </span>
      </div>

      <div class="form-group">
        <label class="form-label">Meta Keywords</label>
        <el-input v-model="globalSeo.metaKeywords" type="textarea" :rows="2" placeholder="apple, iphone, macbook, москва" />
        <span class="form-hint">Через запятую. Используется Яндексом.</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">OG Site Name</label>
          <el-input v-model="globalSeo.ogSiteName" placeholder="WEST-STORE" />
        </div>
        <div class="form-group">
          <label class="form-label">OG Image (по умолчанию)</label>
          <el-input v-model="globalSeo.ogImage" placeholder="/logo_new.png" />
          <span class="form-hint">Картинка при шаринге в соцсетях (1200x630px рекомендуется)</span>
        </div>
      </div>

      <!-- Google Preview -->
      <div class="preview-section">
        <h4 class="preview-label">Превью в Google</h4>
        <div class="google-preview">
          <div class="gp-url">west-store.ru</div>
          <div class="gp-title">{{ globalSeo.siteTitle }}</div>
          <div class="gp-desc">{{ globalSeo.metaDescription || 'Описание не задано' }}</div>
        </div>
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="saveGlobal">Сохранить</el-button>
      </div>
    </div>

    <!-- Pages SEO -->
    <div v-show="activeTab === 'pages'" class="seo-card">
      <h3 class="section-title">SEO по страницам</h3>
      <p class="section-desc">Настройте мета-теги для каждой страницы сайта. Если оставить пустым — используются глобальные значения.</p>

      <div class="pages-grid">
        <div v-for="(page, key) in pages" :key="key" :class="['page-card', { editing: editingPage === key }]" @click="editingPage = editingPage === key ? null : key">
          <div class="page-card-header">
            <span class="page-name">{{ pageLabels[key] || key }}</span>
            <span class="page-url">/{{ key === 'home' ? '' : key }}</span>
            <span :class="['page-status', page.description ? 'filled' : 'empty']">
              {{ page.description ? 'Настроено' : 'По умолчанию' }}
            </span>
          </div>

          <div v-if="editingPage === key" class="page-card-body" @click.stop>
            <div class="form-group">
              <label class="form-label">Title</label>
              <el-input v-model="page.title" :placeholder="defaultPages[key]?.title" />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <el-input v-model="page.description" type="textarea" :rows="2" :placeholder="defaultPages[key]?.description" />
              <span :class="['char-counter', page.description.length > 160 ? 'long' : (page.description.length > 0 && page.description.length < 80 ? 'short' : 'good')]">
                {{ page.description.length }} / 160
              </span>
            </div>
            <div class="form-group">
              <label class="form-label">Keywords</label>
              <el-input v-model="page.keywords" placeholder="ключевые, слова" />
            </div>

            <!-- Preview -->
            <div class="google-preview mini">
              <div class="gp-url">west-store.ru{{ key === 'home' ? '' : '/' + key }}</div>
              <div class="gp-title">{{ page.title || defaultPages[key]?.title }} | {{ globalSeo.siteTitle }}</div>
              <div class="gp-desc">{{ page.description || defaultPages[key]?.description || globalSeo.metaDescription }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="savePages">Сохранить все страницы</el-button>
      </div>
    </div>

    <!-- Products SEO -->
    <div v-show="activeTab === 'products'" class="seo-card">
      <h3 class="section-title">SEO шаблон товаров</h3>
      <p class="section-desc">Шаблон для автогенерации мета-тегов товаров. Используйте переменные: <code>{name}</code>, <code>{price}</code>, <code>{category}</code></p>

      <div class="form-group">
        <label class="form-label">Шаблон Title</label>
        <el-input v-model="productSeoTemplate.titleTemplate" placeholder="{name} — купить в WEST-STORE" />
      </div>

      <div class="form-group">
        <label class="form-label">Шаблон Description</label>
        <el-input v-model="productSeoTemplate.descriptionTemplate" type="textarea" :rows="2" placeholder="{name} — купить за {price} ₽ в WEST-STORE. Доставка по Москве." />
      </div>

      <div class="preview-section">
        <h4 class="preview-label">Пример для "iPhone 16 Pro 256GB" (134 990 ₽)</h4>
        <div class="google-preview mini">
          <div class="gp-url">west-store.ru/product/iphone-16-pro-256gb</div>
          <div class="gp-title">{{ productSeoTemplate.titleTemplate.replace('{name}', 'iPhone 16 Pro 256GB').replace('{price}', '134 990').replace('{category}', 'iPhone') }}</div>
          <div class="gp-desc">{{ productSeoTemplate.descriptionTemplate.replace('{name}', 'iPhone 16 Pro 256GB').replace('{price}', '134 990').replace('{category}', 'iPhone') }}</div>
        </div>
      </div>

      <div class="info-box">
        <strong>JSON-LD Schema</strong> автоматически генерируется для каждого товара с данными: название, цена, наличие, бренд, SKU, изображение.
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="saveProductTemplate">Сохранить</el-button>
      </div>
    </div>

    <!-- Analytics -->
    <div v-show="activeTab === 'analytics'" class="seo-card">
      <h3 class="section-title">Аналитика и верификация</h3>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Яндекс.Метрика ID</label>
          <el-input v-model="globalSeo.yandexMetrikaId" placeholder="12345678" />
          <span class="form-hint">Создайте счётчик на <a href="https://metrika.yandex.ru" target="_blank">metrika.yandex.ru</a></span>
        </div>
        <div class="form-group">
          <label class="form-label">Google Analytics ID</label>
          <el-input v-model="globalSeo.googleAnalyticsId" placeholder="G-XXXXXXXXXX" />
          <span class="form-hint">Создайте в <a href="https://analytics.google.com" target="_blank">Google Analytics</a></span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Яндекс.Вебмастер (верификация)</label>
          <el-input v-model="globalSeo.yandexVerification" placeholder="a1b2c3d4e5f6" />
          <span class="form-hint">Код из Яндекс.Вебмастер для подтверждения сайта</span>
        </div>
        <div class="form-group">
          <label class="form-label">Google Search Console</label>
          <el-input v-model="globalSeo.googleVerification" placeholder="abc123..." />
          <span class="form-hint">Код из Google Search Console</span>
        </div>
      </div>

      <div class="info-box">
        <strong>Текущие SEO-компоненты:</strong>
        <ul class="checklist">
          <li class="done">Canonical URLs — автоматически</li>
          <li class="done">Open Graph теги (og:title, og:description, og:image)</li>
          <li class="done">Twitter Cards (summary_large_image)</li>
          <li class="done">JSON-LD Product Schema (цена, наличие, бренд)</li>
          <li class="done">Schema.org BreadcrumbList</li>
          <li class="done">robots.txt с правилами</li>
          <li class="done">PWA manifest.json</li>
          <li class="done">Lazy loading изображений</li>
          <li class="done">font-display: swap</li>
        </ul>
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="saveGlobal">Сохранить</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seo-page { padding: 20px 0; }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 24px; padding: 22px 28px;
  background: var(--card-bg, #ffffff); border-left: 4px solid #8b5cf6;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); border-radius: 8px;
}
.header-content h2 { font-size: 22px; color: var(--text-primary, #303133); font-weight: 600; margin: 0; }
.subtitle { font-size: 12px; color: var(--text-muted, #909399); margin-top: 4px; display: block; }

.tabs-bar {
  display: flex; gap: 4px; margin-bottom: 24px;
  background: var(--card-bg, #ffffff); border-radius: 10px;
  padding: 6px; box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08));
  overflow-x: auto;
}
.tab-btn {
  padding: 10px 20px; border: none; background: transparent;
  border-radius: 8px; font-size: 14px; font-weight: 500;
  color: var(--text-muted, #909399); cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.tab-btn:hover { color: var(--text-primary, #303133); background: var(--bg-secondary, #f5f7fa); }
.tab-btn.active { background: #8b5cf6; color: #fff; }

.seo-card {
  background: var(--card-bg, #ffffff); border-radius: 12px;
  box-shadow: 0 2px 12px var(--shadow, rgba(0,0,0,0.08)); padding: 28px 32px;
}
.section-title { font-size: 18px; font-weight: 600; color: var(--text-primary, #303133); margin: 0 0 8px; }
.section-desc { font-size: 13px; color: var(--text-muted, #909399); margin: 0 0 24px; line-height: 1.5; }
.section-desc code { background: #f0f0f2; padding: 2px 6px; border-radius: 4px; font-size: 12px; }

.form-group { margin-bottom: 18px; flex: 1; min-width: 0; }
.form-label { display: block; font-size: 13px; font-weight: 500; color: var(--text-primary, #303133); margin-bottom: 6px; }
.form-hint { display: block; font-size: 12px; color: var(--text-muted, #909399); margin-top: 4px; }
.form-hint a { color: #8b5cf6; }
.form-row { display: flex; gap: 16px; }

.char-counter { display: block; font-size: 12px; margin-top: 4px; font-weight: 500; }
.char-counter.good { color: #67c23a; }
.char-counter.short { color: #e6a23c; }
.char-counter.long { color: #f56c6c; }
.char-counter.empty { color: var(--text-muted, #909399); }

/* Google Preview */
.preview-section { margin: 24px 0 8px; }
.preview-label { font-size: 13px; font-weight: 600; color: var(--text-muted, #909399); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

.google-preview {
  background: #fff; border: 1px solid #dfe1e5; border-radius: 10px; padding: 16px 20px;
  max-width: 600px; font-family: Arial, sans-serif;
}
.google-preview.mini { margin-top: 12px; }
.gp-url { font-size: 12px; color: #202124; margin-bottom: 2px; }
.gp-title { font-size: 18px; color: #1a0dab; line-height: 1.3; margin-bottom: 4px; cursor: pointer; }
.gp-title:hover { text-decoration: underline; }
.gp-desc { font-size: 13px; color: #4d5156; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Pages */
.pages-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }

.page-card {
  border: 1px solid var(--border, #ebeef5); border-radius: 10px;
  cursor: pointer; transition: all 0.15s; overflow: hidden;
}
.page-card:hover { border-color: #8b5cf6; }
.page-card.editing { border-color: #8b5cf6; box-shadow: 0 0 0 1px rgba(139,92,246,0.2); }

.page-card-header {
  display: flex; align-items: center; gap: 12px; padding: 14px 18px;
}
.page-name { font-size: 14px; font-weight: 600; color: var(--text-primary, #303133); }
.page-url { font-size: 12px; color: var(--text-muted, #909399); font-family: monospace; }
.page-status { margin-left: auto; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; }
.page-status.filled { background: rgba(103,194,58,0.1); color: #67c23a; }
.page-status.empty { background: rgba(144,147,153,0.1); color: #909399; }

.page-card-body {
  padding: 0 18px 18px; border-top: 1px solid var(--border, #ebeef5);
  margin-top: 0; cursor: default;
}
.page-card-body .form-group { margin-top: 14px; margin-bottom: 0; }

/* Info box */
.info-box {
  background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.15);
  border-radius: 10px; padding: 18px 22px; margin-top: 20px;
  font-size: 14px; color: var(--text-primary, #303133);
}
.info-box strong { display: block; margin-bottom: 8px; }

.checklist { list-style: none; padding: 0; margin: 0; }
.checklist li { padding: 4px 0; font-size: 13px; color: var(--text-main, #333); }
.checklist li.done::before { content: '✓ '; color: #67c23a; font-weight: 700; }
.checklist li.todo::before { content: '○ '; color: #e6a23c; }

.form-actions { margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border, #ebeef5); display: flex; justify-content: flex-end; }

@media (max-width: 700px) {
  .form-row { flex-direction: column; gap: 0; }
  .seo-card { padding: 20px 16px; }
  .tabs-bar { gap: 2px; padding: 4px; }
  .tab-btn { padding: 8px 14px; font-size: 13px; }
  .page-card-header { flex-wrap: wrap; gap: 6px; }
}
</style>
