<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useSeo } from '../lib/useSeo'

useSeo({ title: 'Страница не найдена' })
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <span class="error-code">404</span>
      <h1 class="error-title">Страница не найдена</h1>
      <p class="error-subtitle">Возможно, она была удалена или вы ввели неверный адрес</p>
      <div class="error-actions">
        <RouterLink to="/" class="btn btn-primary">На главную</RouterLink>
        <RouterLink to="/catalog" class="btn btn-secondary">В каталог</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #fff;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 480px;
}

.error-code {
  font-size: 150px;
  font-weight: 800;
  line-height: 1;
  color: #e5e7eb;
  display: block;
  margin-bottom: 16px;
  letter-spacing: -4px;
}

.error-title {
  font-size: 28px;
  font-weight: 700;
  color: #111;
  margin: 0 0 12px;
}

.error-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 36px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-primary {
  background: var(--accent-blue, #2563eb);
  color: #fff;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #fff;
  color: #111;
  border: 1.5px solid #d1d5db;
}

.btn-secondary:hover {
  border-color: #111;
}

@media (max-width: 480px) {
  .error-code {
    font-size: 120px;
  }

  .error-title {
    font-size: 22px;
  }

  .error-subtitle {
    font-size: 14px;
  }

  .error-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
