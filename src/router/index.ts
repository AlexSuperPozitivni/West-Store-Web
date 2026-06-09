import { createRouter, createWebHistory } from 'vue-router'

// Lazy-loaded public pages (split out of the initial bundle)
const Home = () => import('../views/Home.vue')
const CategoryList = () => import('../views/CategoryList.vue')
const ProductDetail = () => import('../views/ProductDetail.vue')
const Cart = () => import('../views/Cart.vue')
const Search = () => import('../views/Search.vue')
const TradeIn = () => import('../views/TradeIn.vue')
const Repair = () => import('../views/Repair.vue')
const Payment = () => import('../views/Payment.vue')
const About = () => import('../views/About.vue')
const Contacts = () => import('../views/Contacts.vue')
const Blog = () => import('../views/Blog.vue')
const Franchise = () => import('../views/Franchise.vue')
const Login = () => import('../views/Login.vue')
const Privacy = () => import('../views/Privacy.vue')
const NotFound = () => import('../views/NotFound.vue')

// Lazy-loaded admin pages (only loaded when admin navigates there)
const Dashboard = () => import('../views/Admin/Dashboard.vue')
const Categories = () => import('../views/Admin/Categories.vue')
const Products = () => import('../views/Admin/Products.vue')
const Media = () => import('../views/Admin/Media.vue')
const Sliders = () => import('../views/Admin/Sliders.vue')
const ActivityLog = () => import('../views/Admin/ActivityLog.vue')
const Orders = () => import('../views/Admin/Orders.vue')
const Analytics = () => import('../views/Admin/Analytics.vue')
const Customers = () => import('../views/Admin/Customers.vue')
const Promocodes = () => import('../views/Admin/Promocodes.vue')
const Pages = () => import('../views/Admin/Pages.vue')
const Requests = () => import('../views/Admin/Requests.vue')
const Import = () => import('../views/Admin/Import.vue')
const Seo = () => import('../views/Admin/Seo.vue')
const Settings = () => import('../views/Admin/Settings.vue')

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
  { path: '/privacy', name: 'Privacy', component: Privacy },

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
  { path: '/admin/seo', name: 'Seo', component: Seo, meta: { requiresAuth: true } },
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
