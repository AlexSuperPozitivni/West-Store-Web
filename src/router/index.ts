import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import NotFound from '../views/NotFound.vue'
import Search from '../views/Search.vue'
import Login from '../views/Login.vue'
import CategoryList from '../views/CategoryList.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import TradeIn from '../views/TradeIn.vue'
import Repair from '../views/Repair.vue'
import Payment from '../views/Payment.vue'
import About from '../views/About.vue'
import Contacts from '../views/Contacts.vue'
import Blog from '../views/Blog.vue'
import Franchise from '../views/Franchise.vue'
import Dashboard from '../views/Admin/Dashboard.vue'
import Categories from '../views/Admin/Categories.vue'
import Products from '../views/Admin/Products.vue'
import Media from '../views/Admin/Media.vue'
import Sliders from '../views/Admin/Sliders.vue'
import ActivityLog from '../views/Admin/ActivityLog.vue'
import Orders from '../views/Admin/Orders.vue'
import Analytics from '../views/Admin/Analytics.vue'
import Customers from '../views/Admin/Customers.vue'
import Promocodes from '../views/Admin/Promocodes.vue'
import Pages from '../views/Admin/Pages.vue'
import Requests from '../views/Admin/Requests.vue'
import Import from '../views/Admin/Import.vue'
import Settings from '../views/Admin/Settings.vue'

const routes = [
  // Публичные маршруты
  { path: '/', name: 'Home', component: Home },
  { path: '/catalog', name: 'CategoryList', component: CategoryList },
  { path: '/catalog/:slug', name: 'CategoryProducts', component: CategoryList },
  { path: '/product/:slug', name: 'ProductDetail', component: ProductDetail },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/trade-in', name: 'TradeIn', component: TradeIn },
  { path: '/repair', name: 'Repair', component: Repair },
  { path: '/payment', name: 'Payment', component: Payment },
  { path: '/about', name: 'About', component: About },
  { path: '/contacts', name: 'Contacts', component: Contacts },
  { path: '/blog', name: 'Blog', component: Blog },
  { path: '/franchise', name: 'Franchise', component: Franchise },
  { path: '/search', name: 'Search', component: Search },

  // Авторизация
  { path: '/login', name: 'Login', component: Login },

  // Админка (требует авторизации)
  { path: '/admin', redirect: '/admin/dashboard', meta: { requiresAuth: true } },
  { path: '/admin/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/admin/categories', name: 'Categories', component: Categories, meta: { requiresAuth: true } },
  { path: '/admin/products', name: 'Products', component: Products, meta: { requiresAuth: true } },
  { path: '/admin/media', name: 'Media', component: Media, meta: { requiresAuth: true } },
  { path: '/admin/sliders', name: 'Sliders', component: Sliders, meta: { requiresAuth: true } },
  { path: '/admin/activity-log', name: 'ActivityLog', component: ActivityLog, meta: { requiresAuth: true } },
  { path: '/admin/orders', name: 'Orders', component: Orders, meta: { requiresAuth: true } },
  { path: '/admin/analytics', name: 'Analytics', component: Analytics, meta: { requiresAuth: true } },
  { path: '/admin/customers', name: 'Customers', component: Customers, meta: { requiresAuth: true } },
  { path: '/admin/promocodes', name: 'Promocodes', component: Promocodes, meta: { requiresAuth: true } },
  { path: '/admin/pages', name: 'Pages', component: Pages, meta: { requiresAuth: true } },
  { path: '/admin/requests', name: 'Requests', component: Requests, meta: { requiresAuth: true } },
  { path: '/admin/import', name: 'Import', component: Import, meta: { requiresAuth: true } },
  { path: '/admin/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true } },

  // 404
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to) => {
  const isAuthenticated = localStorage.getItem('admin_auth') === 'true'

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  }

  if (to.path === '/login' && isAuthenticated) {
    return '/admin/dashboard'
  }

  return true
})

export default router
