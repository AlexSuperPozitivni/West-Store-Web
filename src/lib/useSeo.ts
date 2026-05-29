import { onUnmounted } from 'vue'

interface SeoOptions {
  title: string
  description?: string
  ogImage?: string
  canonical?: string
  type?: string
  jsonLd?: Record<string, any>
}

const SITE_NAME = 'WEST-STORE — Apple в Москве'
const SITE_URL = 'https://west-store.ru'

const setMeta = (name: string, content: string) => {
  const attr = name.startsWith('og:') || name.startsWith('article:') ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const setLink = (rel: string, href: string) => {
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const setJsonLd = (data: Record<string, any>) => {
  let el = document.querySelector('script[data-seo-jsonld]')
  if (!el) {
    el = document.createElement('script')
    el.setAttribute('type', 'application/ld+json')
    el.setAttribute('data-seo-jsonld', '')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

const removeJsonLd = () => {
  const el = document.querySelector('script[data-seo-jsonld]')
  if (el) el.remove()
}

const applyOptions = (options: SeoOptions) => {
  const fullTitle = options.title ? `${options.title} | ${SITE_NAME}` : SITE_NAME
  document.title = fullTitle

  const desc = options.description || ''
  if (desc) {
    setMeta('description', desc)
    setMeta('og:description', desc)
    setMeta('twitter:description', desc)
  }

  setMeta('og:title', fullTitle)
  setMeta('og:type', options.type || 'website')
  setMeta('og:site_name', 'WEST-STORE')
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', fullTitle)

  if (options.ogImage) {
    const img = options.ogImage.startsWith('http') ? options.ogImage : `${SITE_URL}${options.ogImage}`
    setMeta('og:image', img)
    setMeta('twitter:image', img)
  }

  // Canonical URL
  const canonical = options.canonical || `${SITE_URL}${window.location.pathname}`
  setMeta('og:url', canonical)
  setLink('canonical', canonical)

  // JSON-LD
  if (options.jsonLd) {
    setJsonLd(options.jsonLd)
  }
}

export const useSeo = (options: SeoOptions) => {
  applyOptions(options)

  onUnmounted(() => {
    removeJsonLd()
  })
}

export const useDynamicSeo = () => {
  const setSeo = (options: SeoOptions) => {
    applyOptions(options)
  }

  onUnmounted(() => {
    removeJsonLd()
  })

  return { setSeo }
}

export { SITE_URL, SITE_NAME }
