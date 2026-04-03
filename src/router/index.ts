import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import CategoryList from '../views/CategoryList.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import Categories from '../views/Admin/Categories.vue'
import Products from '../views/Admin/Products.vue'
import Media from '../views/Admin/Media.vue'
import Sliders from '../views/Admin/Sliders.vue'

const routes = [
  // Публичные маршруты
  { path: '/', name: 'Home', component: Home },
  { path: '/catalog', name: 'CategoryList', component: CategoryList },
  { path: '/catalog/:slug', name: 'CategoryProducts', component: CategoryList },
  { path: '/product/:slug', name: 'ProductDetail', component: ProductDetail },
  { path: '/cart', name: 'Cart', component: Cart },
  
  // Авторизация
  { path: '/login', name: 'Login', component: Login },
  
  // Админка (требует авторизации)
  { path: '/admin', redirect: '/admin/products', meta: { requiresAuth: true } },
  { path: '/admin/categories', name: 'Categories', component: Categories, meta: { requiresAuth: true } },
  { path: '/admin/products', name: 'Products', component: Products, meta: { requiresAuth: true } },
  { path: '/admin/media', name: 'Media', component: Media, meta: { requiresAuth: true } },
  { path: '/admin/sliders', name: 'Sliders', component: Sliders, meta: { requiresAuth: true } }
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
    return '/admin/products'
  }
  
  return true
})

export default router




