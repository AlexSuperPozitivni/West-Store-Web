import { ref, computed } from 'vue'
import { api } from './api'

interface SocialItem { value: string; enabled: boolean }

interface SiteContacts {
  storeName?: string
  phone?: string
  phoneSecondary?: string
  email?: string
  address?: string
  weekdaysFrom?: string
  weekdaysTo?: string
  weekendsFrom?: string
  weekendsTo?: string
}

interface SiteSocial {
  telegram?: SocialItem
  whatsapp?: SocialItem
  instagram?: SocialItem
  avito?: SocialItem
  vk?: SocialItem
  youtube?: SocialItem
}

// Загружаем настройки сайта один раз и кешируем на уровне модуля.
const raw = ref<Record<string, any>>({})
let started = false

const load = () => {
  if (started) return
  started = true
  api.get('/settings').then(res => { raw.value = res.data || {} }).catch(() => {})
}

// tel: ссылка — оставляем только цифры и +
export const telHref = (phone?: string) => phone ? 'tel:' + phone.replace(/[^\d+]/g, '') : ''

// Ссылка на Telegram из «@user» / «user» / полной ссылки
export const tgHref = (val?: string) => {
  if (!val) return ''
  if (val.startsWith('http')) return val
  return 'https://t.me/' + val.replace(/^@/, '')
}

// Ссылка на WhatsApp из номера
export const waHref = (val?: string) => {
  if (!val) return ''
  if (val.startsWith('http')) return val
  return 'https://wa.me/' + val.replace(/[^\d]/g, '')
}

export function useSettings() {
  load()
  const contacts = computed<SiteContacts>(() => raw.value.contacts || {})
  const social = computed<SiteSocial>(() => raw.value.social || {})
  return { contacts, social }
}
