import { ref, onMounted } from 'vue'
import { api } from './api'

export interface SectionItem {
  icon: string
  title: string
  text: string
}

export interface Section {
  id: string
  title: string
  description: string
  visible: boolean
  items: SectionItem[]
}

export interface PageContent {
  id: string
  name: string
  path: string
  pageTitle: string
  hero: {
    badge: string
    title: string
    subtitle: string
    buttonPrimary: string
    buttonSecondary: string
  }
  sections: Section[]
  seo: {
    metaTitle: string
    metaDescription: string
  }
}

// Единый источник контента редактируемых страниц.
// Используется и админкой (Pages.vue), и публичными страницами (CmsPage.vue).
export const PAGE_DEFAULTS: PageContent[] = [
  {
    id: 'trade-in',
    name: 'Trade-In',
    path: '/trade-in',
    pageTitle: 'Trade-In',
    hero: {
      badge: 'Trade-In',
      title: 'Обменяйте старую технику на новую с выгодой',
      subtitle: 'Мы готовы выкупить ваши старые гаджеты или обменять на новые на самых выгодных условиях в Москве',
      buttonPrimary: 'Оценить устройство',
      buttonSecondary: 'Как это работает'
    },
    sections: [
      {
        id: 'advantages',
        title: 'Преимущества',
        description: '',
        visible: true,
        items: [
          { icon: '⚡', title: 'Быстрая оценка', text: 'Узнайте стоимость за 5 минут' },
          { icon: '💰', title: 'Лучшие цены', text: 'Самые выгодные условия в Москве' },
          { icon: '🔄', title: 'Обмен с доплатой', text: 'Сдайте старое — получите новое' }
        ]
      },
      {
        id: 'devices',
        title: 'Какие устройства принимаем',
        description: 'Принимаем технику Apple, Samsung и другие бренды в любом состоянии',
        visible: true,
        items: [
          { icon: '📱', title: 'iPhone', text: 'Все модели iPhone от 8 до 17 Pro Max' },
          { icon: '📋', title: 'iPad', text: 'iPad, iPad Air, iPad Pro, iPad mini' },
          { icon: '⌚', title: 'Apple Watch', text: 'Watch Series 4 и новее, Ultra' },
          { icon: '💻', title: 'MacBook', text: 'MacBook Air, MacBook Pro все поколения' },
          { icon: '📲', title: 'Samsung', text: 'Galaxy S, Galaxy Z, Galaxy Tab' },
          { icon: '🎧', title: 'AirPods', text: 'AirPods, AirPods Pro, AirPods Max' }
        ]
      },
      {
        id: 'steps',
        title: 'Как это работает',
        description: 'Три простых шага для обмена вашего устройства',
        visible: true,
        items: [
          { icon: '💻', title: 'Рассчитайте стоимость', text: 'Опишите ваш гаджет — модель, состояние, комплектацию. Мы оценим его и предложим лучшую цену.' },
          { icon: '🏪', title: 'Принесите устройство', text: 'Приходите к нам в магазин — наш специалист осмотрит устройство и подтвердит оценку на месте.' },
          { icon: '💸', title: 'Получите деньги', text: 'Техосмотр специалистом на месте. Моментальная выплата наличными или обмен с доплатой на новое устройство.' }
        ]
      }
    ],
    seo: {
      metaTitle: 'Trade-In — Обмен техники | WEST-STORE',
      metaDescription: 'Обменяйте старую технику Apple на новую с выгодой. Быстрая оценка, лучшие цены в Москве.'
    }
  },
  {
    id: 'repair',
    name: 'Ремонт',
    path: '/repair',
    pageTitle: 'Ремонт техники Apple',
    hero: {
      badge: 'Сервисный центр',
      title: 'Ремонт техники Apple в Москве',
      subtitle: 'Профессиональный ремонт iPhone, iPad, MacBook, Apple Watch и другой техники. Бесплатная диагностика и гарантия на все работы.',
      buttonPrimary: 'Оставить заявку',
      buttonSecondary: 'Наши услуги'
    },
    sections: [
      {
        id: 'guarantees',
        title: 'Гарантии',
        description: '',
        visible: true,
        items: [
          { icon: '🔧', title: 'Оригинальные запчасти', text: 'Используем только сертифицированные комплектующие' },
          { icon: '⏱️', title: 'Быстрый ремонт', text: 'Большинство ремонтов за 1-2 часа' },
          { icon: '💯', title: 'Бесплатная диагностика', text: 'Точная стоимость до начала работ' }
        ]
      },
      {
        id: 'services',
        title: 'Наши услуги',
        description: 'Ремонтируем все устройства Apple с гарантией качества',
        visible: true,
        items: [
          { icon: '📱', title: 'iPhone', text: 'Замена экрана, батареи, Face ID, камеры, разъёма, восстановление после воды' },
          { icon: '📋', title: 'iPad', text: 'Замена дисплея, батареи, разъёма, кнопки Home, динамика, корпуса' },
          { icon: '💻', title: 'MacBook', text: 'Замена матрицы, клавиатуры, батареи, ремонт материнской платы, SSD, чистка' },
          { icon: '⌚', title: 'Apple Watch', text: 'Замена экрана, батареи, кнопки, тачскрина, восстановление после воды' },
          { icon: '🎧', title: 'AirPods', text: 'Замена батареи, ремонт кейса, динамика, зарядки, микрофона' },
          { icon: '🖥️', title: 'iMac / Mac', text: 'Замена HDD/SSD, апгрейд RAM, ремонт блока питания, дисплея, обслуживание' }
        ]
      },
      {
        id: 'steps',
        title: 'Как проходит ремонт',
        description: 'Прозрачный процесс от диагностики до выдачи',
        visible: true,
        items: [
          { icon: '🔍', title: 'Рассчитайте стоимость', text: 'Опишите проблему — мы проведём бесплатную диагностику и сообщим точную стоимость ремонта.' },
          { icon: '🏪', title: 'Принесите устройство', text: 'Если цена устраивает — приходите к нам в сервис. Наш мастер примет устройство и начнёт работу.' },
          { icon: '✅', title: 'Получите исправный девайс', text: 'Быстрый и качественный ремонт. Гарантия на все виды работ от 3 до 12 месяцев.' }
        ]
      }
    ],
    seo: {
      metaTitle: 'Ремонт Apple в Москве | WEST-STORE',
      metaDescription: 'Профессиональный ремонт iPhone, iPad, MacBook. Бесплатная диагностика, гарантия до 12 месяцев.'
    }
  },
  {
    id: 'payment',
    name: 'Оплата',
    path: '/payment',
    pageTitle: 'Оплата и доставка',
    hero: {
      badge: 'Оплата',
      title: 'Удобные способы оплаты',
      subtitle: 'Выберите подходящий способ оплаты. Наличные, карта, СБП, рассрочка — всё для вашего удобства.',
      buttonPrimary: 'Перейти к покупкам',
      buttonSecondary: 'Частые вопросы'
    },
    sections: [
      {
        id: 'methods',
        title: 'Способы оплаты',
        description: 'Принимаем все популярные способы оплаты',
        visible: true,
        items: [
          { icon: '💵', title: 'Наличные', text: 'Оплата наличными при получении товара в магазине или курьеру. Без комиссии.' },
          { icon: '💳', title: 'Банковская карта', text: 'Visa, Mastercard, МИР. Комиссия +10%.' },
          { icon: '📲', title: 'СБП', text: 'Мгновенный перевод по QR-коду или номеру телефона. Без комиссии.' },
          { icon: '🏦', title: 'Перевод на карту', text: 'Сбербанк, Т-Банк, Альфа-Банк. Без комиссии.' },
          { icon: '📅', title: 'Рассрочка', text: 'От 3 до 24 месяцев. 0% переплата.' },
          { icon: '🏷️', title: 'Кредит', text: 'Через банки-партнёры. Решение за 5 минут.' }
        ]
      },
      {
        id: 'security',
        title: 'Безопасность платежей',
        description: 'Ваши данные под надёжной защитой',
        visible: true,
        items: [
          { icon: '🔒', title: 'SSL-шифрование', text: 'Все данные передаются по защищённому каналу' },
          { icon: '🛡️', title: 'PCI DSS', text: 'Соответствие стандартам безопасности платежей' },
          { icon: '📋', title: '54-ФЗ', text: 'Выдаём электронный чек по закону РФ' },
          { icon: '🔄', title: 'Возврат средств', text: 'Гарантия возврата в течение 14 дней' }
        ]
      }
    ],
    seo: {
      metaTitle: 'Оплата и доставка | WEST-STORE',
      metaDescription: 'Удобные способы оплаты: наличные, карта, СБП, рассрочка. Доставка по Москве и России.'
    }
  },
  {
    id: 'about',
    name: 'О магазине',
    path: '/about',
    pageTitle: 'О магазине WEST-STORE',
    hero: {
      badge: 'О нас',
      title: 'WEST-STORE — магазин техники Apple в Москве',
      subtitle: 'Продаём оригинальную технику Apple с гарантией. Работаем с 2020 года, тысячи довольных клиентов.',
      buttonPrimary: 'Перейти в каталог',
      buttonSecondary: 'Связаться с нами'
    },
    sections: [
      {
        id: 'about-info',
        title: 'О компании',
        description: 'Надёжный магазин техники Apple в Москве',
        visible: true,
        items: [
          { icon: '🏪', title: 'Розничный магазин', text: 'Удобное расположение в центре Москвы, можно посмотреть и протестировать технику' },
          { icon: '✅', title: 'Оригинальная техника', text: 'Только сертифицированная продукция Apple с официальной гарантией' },
          { icon: '🚀', title: 'Быстрая доставка', text: 'Доставка по Москве в день заказа, по России — от 1 до 3 дней' }
        ]
      },
      {
        id: 'why-us',
        title: 'Почему выбирают нас',
        description: '',
        visible: true,
        items: [
          { icon: '💰', title: 'Лучшие цены', text: 'Конкурентные цены и регулярные акции' },
          { icon: '🛡️', title: 'Гарантия', text: 'Официальная гарантия на всю продукцию' },
          { icon: '👨‍💼', title: 'Поддержка', text: 'Консультация и помощь после покупки' },
          { icon: '🔄', title: 'Trade-In', text: 'Обмен старой техники на новую с доплатой' }
        ]
      }
    ],
    seo: {
      metaTitle: 'О магазине WEST-STORE | Техника Apple в Москве',
      metaDescription: 'WEST-STORE — магазин оригинальной техники Apple в Москве. Гарантия, доставка, trade-in, ремонт.'
    }
  }
]

export const getPageDefault = (slug: string): PageContent | null =>
  PAGE_DEFAULTS.find(p => p.id === slug) || null

// Загружает контент страницы с сервера, с откатом на дефолт (если на сервере пусто).
export function usePageContent(slug: string) {
  const fallback = getPageDefault(slug)
  const content = ref<PageContent | null>(fallback)

  const load = async () => {
    try {
      const res = await api.get(`/pages/${slug}`)
      if (res.data && res.data.content) {
        content.value = { ...(fallback || {} as any), ...res.data.content }
      }
    } catch {
      // 404 / ошибка — остаёмся на дефолте
    }
  }

  onMounted(load)
  return { content }
}
