<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import {
  Box,
  Picture,
  PictureFilled,
  SwitchButton,
  ArrowDown,
  Fold,
  Expand
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(true)
const activeSubmenu = ref<string | null>(null)

const isAuthenticated = computed(() => {
  return localStorage.getItem('admin_auth') === 'true'
})

const isAdminPage = computed(() => {
  return route.path.startsWith('/admin') && isAuthenticated.value
})

const toggleSubmenu = (name: string) => {
  activeSubmenu.value = activeSubmenu.value === name ? null : name
}

const handleLogout = () => {
  localStorage.removeItem('admin_auth')
  localStorage.removeItem('admin_user')
  router.push('/')
}

const menuItems = [
  {
    section: 'АДМИНИСТРИРОВАНИЕ',
    items: [
      {
        name: 'Каталог',
        icon: Box,
        path: null,
        submenu: [
          { name: 'Товары', path: '/admin/products' },
          { name: 'Категории', path: '/admin/categories' }
        ]
      },
      { name: 'Слайдер', icon: PictureFilled, path: '/admin/sliders', submenu: null },
      { name: 'Медиа', icon: Picture, path: '/admin/media', submenu: null }
    ]
  },
  {
    section: 'ПОЛЬЗОВАТЕЛЬ',
    items: [
      { name: 'Выход', icon: SwitchButton, path: null, submenu: null, isLogout: true }
    ]
  }
]

const isActive = (path: string) => {
  return route.path === path
}

const isSubmenuActive = (item: any) => {
  return Array.isArray(item.submenu) && item.submenu.some((sub: any) => sub.path === route.path)
}

const syncSubmenuWithRoute = () => {
  const allItems = menuItems.flatMap((section) => section.items)
  const matched = allItems.find((item) => isSubmenuActive(item))
  activeSubmenu.value = matched ? matched.name : null
}

watch(
  () => route.path,
  () => {
    syncSubmenuWithRoute()
  }
)

onMounted(() => {
  syncSubmenuWithRoute()
})

const showScrollTop = ref(false)

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

const launchConfetti = (event: MouseEvent, type: string) => {
  const palettes: Record<string, string[]> = {
    instagram: ['#E1306C', '#833AB4', '#F77737', '#FCAF45', '#ffffff'],
    telegram:  ['#0088cc', '#29b6f6', '#54a9eb', '#ffffff'],
    whatsapp:  ['#25d366', '#128C7E', '#a5e6c0', '#ffffff'],
  }
  const palette = palettes[type] || ['#ff0', '#f0f', '#0ff']
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div')
    const size = Math.random() * 7 + 4
    const isCircle = Math.random() > 0.4
    p.style.cssText = `
      position:fixed;width:${size}px;height:${size}px;
      background:${palette[Math.floor(Math.random() * palette.length)]};
      border-radius:${isCircle ? '50%' : '2px'};
      left:${cx}px;top:${cy}px;pointer-events:none;z-index:99999;
      transform:translate(-50%,-50%);
    `
    document.body.appendChild(p)
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * 90 + 40
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist
    const rot = Math.random() * 360
    p.animate([
      { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0) rotate(${rot}deg)`, opacity: 0 }
    ], { duration: 600 + Math.random() * 400, easing: 'cubic-bezier(0,.9,.57,1)' }).onfinish = () => p.remove()
  }
}
</script>

<template>
  <div v-if="isAdminPage" class="admin-layout">
    <aside :class="['sidebar', { collapsed: !sidebarOpen }]">
      <div class="user-profile">
        <div class="avatar">OP</div>
        <div class="user-info" v-if="sidebarOpen">
          <div class="user-name">Onlyphones</div>
          <div class="user-status">
            <span class="status-dot"></span>
            Панель администратора
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div v-for="(section, idx) in menuItems" :key="idx" class="nav-section">
          <div class="section-title" v-if="sidebarOpen">{{ section.section }}</div>

          <div v-for="(item, i) in section.items" :key="i" class="nav-item">
            <div
              v-if="item.submenu"
              :class="[
                'nav-link',
                'has-submenu',
                { active: activeSubmenu === item.name || isSubmenuActive(item) }
              ]"
              @click="toggleSubmenu(item.name)"
            >
              <span class="nav-icon">
                <el-icon><component :is="item.icon" /></el-icon>
              </span>
              <span class="nav-text" v-if="sidebarOpen">{{ item.name }}</span>
              <el-icon v-if="sidebarOpen" class="nav-arrow" :class="{ open: activeSubmenu === item.name }">
                <ArrowDown />
              </el-icon>
            </div>

            <RouterLink
              v-else-if="!item.isLogout"
              :to="item.path"
              :class="['nav-link', { active: isActive(item.path) }]"
            >
              <span class="nav-icon">
                <el-icon><component :is="item.icon" /></el-icon>
              </span>
              <span class="nav-text" v-if="sidebarOpen">{{ item.name }}</span>
            </RouterLink>

            <div
              v-if="item.isLogout"
              class="nav-link logout"
              @click="handleLogout"
            >
              <span class="nav-icon">
                <el-icon><component :is="item.icon" /></el-icon>
              </span>
              <span class="nav-text" v-if="sidebarOpen">{{ item.name }}</span>
            </div>

            <div v-if="item.submenu && activeSubmenu === item.name" class="submenu">
              <RouterLink
                v-for="sub in item.submenu"
                :key="sub.path"
                :to="sub.path"
                :class="['submenu-link', { active: isActive(sub.path) }]"
              >
                {{ sub.name }}
              </RouterLink>
            </div>
          </div>
        </div>
      </nav>

      <button class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen" aria-label="Свернуть меню">
        <el-icon v-if="sidebarOpen"><Fold /></el-icon>
        <el-icon v-else><Expand /></el-icon>
      </button>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="breadcrumb">
          Админ
          <span class="separator">></span>
          <span class="current">{{ route.name || 'Dashboard' }}</span>
        </div>
      </header>

      <div class="page-content">
        <router-view />
      </div>
    </main>
  </div>

  <div v-else class="public-layout flex flex-col min-h-screen">
    <Header />

    <main class="flex-grow public-main">
      <router-view />
    </main>

    <Footer />

    <Transition name="scroll-top">
      <button v-if="showScrollTop" class="scroll-top-btn" @click="scrollToTop" aria-label="Наверх">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </button>
    </Transition>

    <div class="social-float-group">
      <a href="https://www.instagram.com/onlyphones_ru/" target="_blank" rel="noopener noreferrer"
         class="social-float insta-float" aria-label="Instagram"
         @mouseenter="launchConfetti($event, 'instagram')">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      </a>
      <a href="https://t.me/onlyphones" target="_blank" rel="noopener noreferrer"
         class="social-float tg-float" aria-label="Telegram"
         @mouseenter="launchConfetti($event, 'telegram')">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      </a>
      <a href="https://wa.me/79099512345" target="_blank" rel="noopener noreferrer"
         class="social-float wa-float" aria-label="WhatsApp"
         @mouseenter="launchConfetti($event, 'whatsapp')">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  </div>
</template>

<style scoped>
/* ===== Public Header ===== */
.public-header {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #409EFF;
  text-decoration: none;
  transition: color 0.3s;
}

.logo:hover {
  color: #66b1ff;
}

.public-nav {
  display: flex;
  gap: 25px;
  align-items: center;
}

.public-nav a {
  color: #606266;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.public-nav a:hover {
  color: #409EFF;
}

.cart-link {
  background: #f5f7fa;
  padding: 8px 16px;
  border-radius: 6px;
}

.admin-link {
  background: #67c23a;
  color: #fff !important;
  padding: 8px 16px;
  border-radius: 6px;
}

.login-link {
  background: #409EFF;
  color: #fff !important;
  padding: 8px 16px;
  border-radius: 6px;
}

.public-layout {
  min-height: 100vh;
  background: var(--bg-main);
}

.public-main {
  padding-top: 0;
}

.social-float-group {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.social-float {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.social-float:hover {
  transform: scale(1.12);
}

.wa-float {
  background: #25d366;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.45);
}
.wa-float:hover {
  box-shadow: 0 6px 26px rgba(37, 211, 102, 0.6);
}

.tg-float {
  background: #0088cc;
  box-shadow: 0 4px 20px rgba(0, 136, 204, 0.4);
}
.tg-float:hover {
  box-shadow: 0 6px 26px rgba(0, 136, 204, 0.55);
}

.insta-float {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  box-shadow: 0 4px 20px rgba(188, 24, 136, 0.38);
}
.insta-float:hover {
  box-shadow: 0 6px 26px rgba(188, 24, 136, 0.55);
}

/* ===== Scroll to top ===== */
.scroll-top-btn {
  position: fixed;
  bottom: 28px;
  left: 28px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1a1a2e;
  color: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.22);
  z-index: 9998;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}

.scroll-top-btn:hover {
  background: #26242d;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.scroll-top-btn:active {
  transform: translateY(0);
}

.scroll-top-enter-active,
.scroll-top-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 768px) {
  .scroll-top-btn {
    bottom: max(16px, env(safe-area-inset-bottom));
    left: 14px;
    width: 42px;
    height: 42px;
  }
}

@media (max-width: 768px) {
  .social-float-group {
    bottom: max(16px, env(safe-area-inset-bottom));
    right: 14px;
    gap: 8px;
  }
  .social-float {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .social-float-group {
    gap: 6px;
  }
  .social-float {
    width: 44px;
    height: 44px;
  }
  .social-float svg {
    width: 22px;
    height: 22px;
  }
}

/* ===== Admin Styles (existing) ===== */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
}

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #2b3542 0%, #1e252f 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
}

.sidebar.collapsed {
  width: 70px;
}

.user-profile {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 12px;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.user-name {
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #9ca3af;
  font-size: 12px;
  margin-top: 2px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.sidebar-nav {
  flex: 1;
  padding: 15px 0;
}

.nav-section {
  margin-bottom: 20px;
}

.section-title {
  padding: 8px 20px;
  color: #6b7280;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  gap: 12px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.nav-link.active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, transparent 100%);
  color: #ffffff;
  border-left: 3px solid #667eea;
}

.nav-link.logout {
  color: #f87171;
}

.nav-link.logout:hover {
  background: rgba(248, 113, 113, 0.1);
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
}

.nav-arrow {
  font-size: 10px;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.nav-arrow.open {
  transform: rotate(180deg);
}

.has-submenu {
  cursor: pointer;
}

.submenu {
  background: rgba(0, 0, 0, 0.2);
  padding: 5px 0;
}

.submenu-link {
  display: block;
  padding: 10px 20px 10px 56px;
  color: #9ca3af;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s ease;
}

.submenu-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.03);
}

.submenu-link.active {
  color: #667eea;
}

.sidebar-toggle {
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: rgba(0, 0, 0, 0.3);
  color: #ffffff;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed ~ .main-content {
  margin-left: 70px;
}

.top-bar {
  background: #ffffff;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.breadcrumb .separator {
  color: #d1d5db;
}

.breadcrumb .current {
  color: #1f2937;
  font-weight: 500;
}

.page-content {
  flex: 1;
  padding: 30px;
}

.sidebar::-webkit-scrollbar {
  width: 5px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
</style>