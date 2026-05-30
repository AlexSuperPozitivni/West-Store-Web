// Генератор sitemap.xml для west-store.ru
// Тянет товары и категории из API и пишет настоящий XML в корень nginx.
// Запуск на сервере: node /var/www/west-store/client/scripts/gen-sitemap.mjs
// Обновляется по cron (раз в сутки) — карта сайта всегда актуальна.

import { writeFileSync } from 'node:fs'

const BASE = 'https://west-store.ru'
const API = `${BASE}/api`
const OUT = '/var/www/west-store/public/sitemap.xml'

const today = new Date().toISOString().slice(0, 10)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const asArray = (d) => (Array.isArray(d) ? d : d?.data || [])

const fetchJson = async (url) => {
  const r = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`)
  return r.json()
}

const urlTag = (loc, { lastmod = today, changefreq = 'weekly', priority = '0.6' } = {}) =>
  `  <url>\n    <loc>${esc(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`

const run = async () => {
  const [productsRaw, categoriesRaw] = await Promise.all([
    fetchJson(`${API}/products`),
    fetchJson(`${API}/categories`),
  ])
  const products = asArray(productsRaw).filter((p) => p.is_active !== false && p.slug)
  const categories = asArray(categoriesRaw).filter((c) => c.is_active !== false && c.slug)

  const staticPages = [
    ['/', '1.0', 'daily'],
    ['/catalog', '0.9', 'daily'],
    ['/trade-in', '0.6', 'monthly'],
    ['/repair', '0.6', 'monthly'],
    ['/payment', '0.5', 'monthly'],
    ['/about', '0.5', 'monthly'],
    ['/contacts', '0.6', 'monthly'],
    ['/blog', '0.5', 'weekly'],
    ['/franchise', '0.5', 'monthly'],
    ['/privacy', '0.3', 'yearly'],
  ]

  const urls = []
  for (const [path, priority, changefreq] of staticPages) {
    urls.push(urlTag(`${BASE}${path}`, { priority, changefreq }))
  }
  for (const c of categories) {
    urls.push(urlTag(`${BASE}/catalog/${c.slug}`, {
      lastmod: (c.updated_at || today).slice(0, 10),
      changefreq: 'weekly',
      priority: '0.8',
    }))
  }
  for (const p of products) {
    urls.push(urlTag(`${BASE}/product/${p.slug}`, {
      lastmod: (p.updated_at || today).slice(0, 10),
      changefreq: 'weekly',
      priority: '0.7',
    }))
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  writeFileSync(OUT, xml, 'utf8')
  console.log(`sitemap.xml written: ${OUT} (${staticPages.length} static + ${categories.length} categories + ${products.length} products = ${urls.length} urls)`)
}

run().catch((e) => {
  console.error('sitemap generation failed:', e.message)
  process.exit(1)
})
