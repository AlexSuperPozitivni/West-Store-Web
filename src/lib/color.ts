export const toColorToken = (value: string) => {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!base) return ''

  const ascii = base.replace(/[^a-z0-9-]/g, '')
  return ascii || base
}

const RU_COLOR_MAP: Record<string, string> = {
  'белый': '#f5f5f5',
  'белая': '#f5f5f5',
  'белое': '#f5f5f5',
  'черный': '#111827',
  'чёрный': '#111827',
  'черная': '#111827',
  'чёрная': '#111827',
  'серый': '#9ca3af',
  'серебро': '#cbd5e1',
  'серебристый': '#cbd5e1',
  'графит': '#4b5563',
  'красный': '#ef4444',
  'красная': '#ef4444',
  'синий': '#3b82f6',
  'голубой': '#38bdf8',
  'зеленый': '#22c55e',
  'зелёный': '#22c55e',
  'зеленая': '#22c55e',
  'зелёная': '#22c55e',
  'желтый': '#facc15',
  'розовый': '#f472b6',
  'фиолетовый': '#a855f7',
  'оранжевый': '#f97316'
}

// Маркетинговые названия цветов (Apple/Samsung и т.д.) — проверяются по вхождению
// подстроки в нормализованную строку. Порядок важен: специфичные раньше общих.
const COLOR_RULES: [string[], string][] = [
  // Apple titanium / маркетинговые
  [['сияющ', 'звезд', 'starlight', 'сияние'], '#e8ddc7'],
  [['темная ноч', 'темной ноч', 'midnight', 'полуноч'], '#1d2330'],
  [['натуральн', 'природн', 'natural'], '#c4bcae'],
  [['пустынн', 'песочн', 'desert', 'sand'], '#c1a079'],
  [['титан', 'titanium'], '#c4bcae'],
  [['космос', 'space', 'сланц', 'slate'], '#5b6470'],
  [['ультрамарин', 'ultramarine'], '#4255bd'],
  [['бирюз', 'teal', 'turquoise'], '#19a7a0'],
  [['небесн', 'sky'], '#7cc6f0'],
  [['лаванд', 'сирен', 'lavender'], '#b9a7e6'],
  [['коралл', 'coral'], '#ff7a66'],
  [['мятн', 'mint'], '#9fe7c7'],
  [['золот', 'gold'], '#e3c08d'],
  [['кремов', 'беж', 'cream', 'beige'], '#e9dcc3'],
  [['графит', 'graphite'], '#4b5563'],
  // Базовые
  [['серебр', 'silver'], '#cbd5e1'],
  [['черн', 'чёрн', 'black', 'jet'], '#111827'],
  [['бел', 'white'], '#f5f5f5'],
  [['красн', 'red'], '#ef4444'],
  [['зелен', 'зелён', 'green'], '#22c55e'],
  [['голуб', 'sky-blue', 'light blue'], '#38bdf8'],
  [['син', 'blue'], '#3b82f6'],
  [['желт', 'жёлт', 'yellow'], '#facc15'],
  [['оранж', 'orange'], '#f97316'],
  [['розов', 'pink'], '#f472b6'],
  [['фиолет', 'пурпур', 'purple', 'violet'], '#a855f7'],
  [['сер', 'gray', 'grey'], '#9ca3af'],
]

export const resolveColorStyle = (value: string) => {
  const v = value.trim().toLowerCase()
  if (!v) return undefined

  if (v.startsWith('#') || v.startsWith('rgb') || v.startsWith('hsl')) {
    return { backgroundColor: value }
  }

  const normalized = v
    .replace(/ё/g, 'е')
    .replace(/[«»"'`()]/g, ' ')
    .replace(/[_,./]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const mapped = RU_COLOR_MAP[v] || RU_COLOR_MAP[normalized]
  if (mapped) return { backgroundColor: mapped }

  for (const [needles, color] of COLOR_RULES) {
    if (needles.some((n) => normalized.includes(n))) {
      return { backgroundColor: color }
    }
  }

  // Никогда не оставляем пустой кружок — нейтральный серый как запасной вариант
  return { backgroundColor: '#d1d5db' }
}
