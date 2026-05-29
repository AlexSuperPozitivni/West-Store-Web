<script setup lang="ts">
import { useSeo } from '../lib/useSeo'
useSeo({ title: 'Политика конфиденциальности', description: 'Политика обработки персональных данных интернет-магазина WEST-STORE.' })
</script>

<template>
  <div class="legal-page">
    <div class="legal-container">
      <h1>Политика конфиденциальности</h1>
      <p class="legal-date">Дата последнего обновления: 29 мая 2026 г.</p>

      <section>
        <h2>1. Общие положения</h2>
        <p>Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей интернет-магазина WEST-STORE (далее — «Магазин»), расположенного по адресу west-store.ru.</p>
        <p>Используя сайт, вы соглашаетесь с условиями данной Политики конфиденциальности.</p>
      </section>

      <section>
        <h2>2. Какие данные мы собираем</h2>
        <ul>
          <li>Имя и фамилия</li>
          <li>Номер телефона</li>
          <li>Адрес электронной почты</li>
          <li>Адрес доставки</li>
          <li>Информация о заказах</li>
        </ul>
      </section>

      <section>
        <h2>3. Цели обработки данных</h2>
        <ul>
          <li>Обработка и выполнение заказов</li>
          <li>Связь с клиентом по вопросам заказа</li>
          <li>Информирование о статусе заказа</li>
          <li>Улучшение качества обслуживания</li>
          <li>Обработка заявок на Trade-In и ремонт</li>
        </ul>
      </section>

      <section>
        <h2>4. Защита данных</h2>
        <p>Мы принимаем все необходимые организационные и технические меры для защиты ваших персональных данных от неправомерного доступа, изменения, раскрытия или уничтожения.</p>
      </section>

      <section>
        <h2>5. Передача данных третьим лицам</h2>
        <p>Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ, а также при необходимости доставки заказа (передача данных службе доставки).</p>
      </section>

      <section>
        <h2>6. Файлы cookie</h2>
        <p>Сайт использует файлы cookie для обеспечения корректной работы корзины покупок и улучшения пользовательского опыта. Вы можете отключить cookie в настройках браузера.</p>
      </section>

      <section>
        <h2>7. Права пользователя</h2>
        <p>Вы имеете право:</p>
        <ul>
          <li>Запросить информацию о хранящихся персональных данных</li>
          <li>Потребовать удаления ваших персональных данных</li>
          <li>Отозвать согласие на обработку персональных данных</li>
        </ul>
        <p>Для реализации этих прав свяжитесь с нами: <a href="tel:+79299556487">+7 (929) 955 6487</a> или <a href="https://t.me/weststore_msk">Telegram</a>.</p>
      </section>

      <section>
        <h2>8. Контактная информация</h2>
        <p>ИП «WEST-STORE»</p>
        <p>Адрес: г. Москва, ул. Барклая 8, магазин 171</p>
        <p>Телефон: <a href="tel:+79299556487">+7 (929) 955 6487</a></p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.legal-page { min-height: 100vh; padding: 40px 0 80px; background: var(--bg-main); }
.legal-container { max-width: 800px; margin: 0 auto; padding: 0 24px; }
h1 { font-size: 28px; font-weight: 700; color: var(--text-dark); margin-bottom: 8px; }
.legal-date { font-size: 13px; color: var(--text-muted); margin-bottom: 32px; }
h2 { font-size: 18px; font-weight: 600; color: var(--text-dark); margin: 28px 0 12px; }
p { font-size: 15px; line-height: 1.7; color: var(--text-main); margin-bottom: 8px; }
ul { padding-left: 24px; margin-bottom: 12px; }
li { font-size: 15px; line-height: 1.7; color: var(--text-main); margin-bottom: 4px; }
a { color: var(--accent-blue); }
section { margin-bottom: 8px; }
</style>
