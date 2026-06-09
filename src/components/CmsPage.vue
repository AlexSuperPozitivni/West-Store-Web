<script setup lang="ts">
import { watch } from 'vue'
import { RouterLink } from 'vue-router'
import { usePageContent } from '../lib/pageContent'
import { useDynamicSeo } from '../lib/useSeo'

const props = defineProps<{ slug: string }>()

const { content } = usePageContent(props.slug)
const { setSeo } = useDynamicSeo()

watch(content, (c) => {
  if (!c) return
  setSeo({
    title: c.seo?.metaTitle || c.pageTitle,
    description: c.seo?.metaDescription || '',
  })
}, { immediate: true })
</script>

<template>
  <div class="cms-page" v-if="content">
    <!-- Hero -->
    <section class="cms-hero">
      <div class="cms-hero-inner">
        <span v-if="content.hero.badge" class="cms-badge">{{ content.hero.badge }}</span>
        <h1 class="cms-title">{{ content.hero.title }}</h1>
        <div v-if="content.hero.subtitle" class="cms-subtitle" v-html="content.hero.subtitle"></div>
        <div class="cms-hero-actions">
          <RouterLink v-if="content.hero.buttonPrimary" to="/catalog" class="cms-btn cms-btn-primary">
            {{ content.hero.buttonPrimary }}
          </RouterLink>
          <RouterLink v-if="content.hero.buttonSecondary" to="/contacts" class="cms-btn cms-btn-secondary">
            {{ content.hero.buttonSecondary }}
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Sections -->
    <section
      v-for="section in content.sections.filter(s => s.visible !== false)"
      :key="section.id"
      class="cms-section"
    >
      <div class="cms-section-inner">
        <h2 v-if="section.title" class="cms-section-title">{{ section.title }}</h2>
        <div v-if="section.description" class="cms-section-desc" v-html="section.description"></div>

        <div class="cms-grid" v-if="section.items && section.items.length">
          <div v-for="(item, i) in section.items" :key="i" class="cms-card">
            <div v-if="item.icon" class="cms-card-icon">{{ item.icon }}</div>
            <h3 v-if="item.title" class="cms-card-title">{{ item.title }}</h3>
            <div v-if="item.text" class="cms-card-text" v-html="item.text"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cms-page { background: var(--bg-main, #f5f6f8); }

/* Hero */
.cms-hero {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 72px 20px 80px;
  text-align: center;
}

.cms-hero-inner {
  max-width: 820px;
  margin: 0 auto;
}

.cms-badge {
  display: inline-block;
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 22px;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.cms-title {
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin: 0 0 18px;
}

.cms-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.6;
  margin-bottom: 28px;
}

.cms-hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

.cms-btn {
  display: inline-block;
  padding: 14px 32px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.2s;
}

.cms-btn-primary { background: #2563eb; color: #fff; }
.cms-btn-primary:hover { background: #1d4ed8; }
.cms-btn-secondary { background: rgba(255, 255, 255, 0.12); color: #fff; border: 1px solid rgba(255, 255, 255, 0.25); }
.cms-btn-secondary:hover { background: rgba(255, 255, 255, 0.2); }

/* Sections */
.cms-section { padding: 56px 20px; }
.cms-section:nth-child(even) { background: #ffffff; }

.cms-section-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.cms-section-title {
  font-size: 30px;
  font-weight: 800;
  color: #111827;
  text-align: center;
  margin: 0 0 10px;
}

.cms-section-desc {
  font-size: 16px;
  color: #6b7280;
  text-align: center;
  line-height: 1.6;
  max-width: 760px;
  margin: 0 auto 36px;
}

.cms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.cms-card {
  background: var(--bg-main, #f5f6f8);
  border: 1px solid #eceef1;
  border-radius: 18px;
  padding: 28px 24px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.cms-section:nth-child(even) .cms-card { background: #f7f8fa; }

.cms-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.07);
  transform: translateY(-3px);
}

.cms-card-icon {
  font-size: 40px;
  line-height: 1;
  margin-bottom: 16px;
}

.cms-card-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
}

.cms-card-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

.cms-card-text :deep(ul) { margin: 6px 0; padding-left: 18px; }
.cms-card-text :deep(a), .cms-subtitle :deep(a), .cms-section-desc :deep(a) { color: #2563eb; }

@media (max-width: 640px) {
  .cms-hero { padding: 52px 16px 56px; }
  .cms-title { font-size: 30px; }
  .cms-subtitle { font-size: 16px; }
  .cms-section { padding: 40px 16px; }
  .cms-section-title { font-size: 24px; }
}
</style>
