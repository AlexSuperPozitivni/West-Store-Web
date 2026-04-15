import { watch } from 'vue'
import { useRoute } from 'vue-router'

interface SeoOptions {
  title: string
  description?: string
  ogImage?: string
}

const SITE_NAME = 'ONLYPHONES — Apple в Москве'

const setMeta = (name: string, content: string) => {
  let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    if (name.startsWith('og:')) {
      el.setAttribute('property', name)
    } else {
      el.setAttribute('name', name)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export const useSeo = (options: SeoOptions) => {
  const apply = () => {
    document.title = options.title ? `${options.title} | ${SITE_NAME}` : SITE_NAME

    if (options.description) {
      setMeta('description', options.description)
      setMeta('og:description', options.description)
    }

    setMeta('og:title', options.title || SITE_NAME)
    setMeta('og:type', 'website')

    if (options.ogImage) {
      setMeta('og:image', options.ogImage)
    }
  }

  apply()
}

export const useDynamicSeo = () => {
  const route = useRoute()

  const setSeo = (options: SeoOptions) => {
    document.title = options.title ? `${options.title} | ${SITE_NAME}` : SITE_NAME

    if (options.description) {
      setMeta('description', options.description)
      setMeta('og:description', options.description)
    }

    setMeta('og:title', options.title || SITE_NAME)

    if (options.ogImage) {
      setMeta('og:image', options.ogImage)
    }
  }

  return { setSeo }
}
