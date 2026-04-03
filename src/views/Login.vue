<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api, ensureCsrf } from '../lib/api'

const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  console.log('Login attempt:', form.value)
  
  if (!form.value.email.trim()) {
    ElMessage.error('Введите email')
    return
  }
  if (!form.value.password.trim()) {
    ElMessage.error('Введите пароль')
    return
  }

  loading.value = true
  
  try {
    await ensureCsrf()
    const response = await api.post('/auth/login', form.value)
    
    console.log('Login response:', response.data)

    if (response.data.success) {
      localStorage.setItem('admin_auth', 'true')
      localStorage.setItem('admin_user', JSON.stringify(response.data.user))
      
      ElMessage.success('Вход выполнен успешно')
      
      setTimeout(() => {
        router.push('/admin/products')
      }, 500)
    } else {
      ElMessage.error(response.data.message || 'Ошибка входа')
    }
  } catch (e: any) {
    console.error('Login error:', e)
    console.error('Error response:', e.response?.data)
    ElMessage.error(e.response?.data?.message || 'Неверный email или пароль')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>West Store</h1>
        <p>Авторизация</p>
      </div>

      <el-form @submit.prevent="handleLogin" class="login-form">
        <el-form-item label="Email">
          <el-input 
            v-model="form.email" 
            type="email" 
            placeholder="admin@west-store.ru"
            autocomplete="email"
          />
        </el-form-item>

        <el-form-item label="Пароль">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="••••••••"
            autocomplete="current-password"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button 
          type="primary" 
          @click="handleLogin"
          class="login-btn"
          :loading="loading"
        >
          {{ loading ? 'Вход...' : 'Войти' }}
        </el-button>
      </el-form>

      <div class="login-footer">
        <router-link to="/" class="back-link">< На главную</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 32px;
  color: #303133;
  margin: 0 0 10px 0;
}

.login-header p {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.back-link {
  color: #409EFF;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.back-link:hover {
  color: #66b1ff;
}
</style>
