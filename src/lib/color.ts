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

export const resolveColorStyle = (value: string) => {
  const v = value.trim().toLowerCase()
  if (!v) return undefined

  if (v.startsWith('#') || v.startsWith('rgb') || v.startsWith('hsl')) {
    return { backgroundColor: value }
  }

  const normalized = v
    .replace(/ё/g, 'е')
    .replace(/[()]/g, ' ')
    .replace(/[_,./]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const mapped = RU_COLOR_MAP[v] || RU_COLOR_MAP[normalized]
  if (mapped) return { backgroundColor: mapped }

  // Handle compound values: "темно-зеленый", "красный/черный", etc.
  const tokens = normalized
    .split(/[\s\-\/]+/)
    .map((t) => t.trim())
    .filter(Boolean)

  const tokenMap: Record<string, string> = {
    'черн': '#111827',
    'красн': '#ef4444',
    'зелен': '#22c55e',
    'син': '#3b82f6',
    'голуб': '#38bdf8',
    'желт': '#facc15',
    'оранж': '#f97316',
    'розов': '#f472b6',
    'фиолет': '#a855f7',
    'серебр': '#cbd5e1',
    'сер': '#9ca3af',
    'графит': '#4b5563',
    'бел': '#f5f5f5'
  }

  for (const token of tokens) {
    for (const key of Object.keys(tokenMap)) {
      if (token.startsWith(key)) {
        return { backgroundColor: tokenMap[key] }
      }
    }
  }

  // English fallback for common names
  const en = normalized
  if (en.includes('black')) return { backgroundColor: '#111827' }
  if (en.includes('red')) return { backgroundColor: '#ef4444' }
  if (en.includes('green')) return { backgroundColor: '#22c55e' }
  if (en.includes('blue')) return { backgroundColor: '#3b82f6' }
  if (en.includes('white')) return { backgroundColor: '#f5f5f5' }
  if (en.includes('silver')) return { backgroundColor: '#cbd5e1' }
  if (en.includes('gray') || en.includes('grey')) return { backgroundColor: '#9ca3af' }
  if (en.includes('pink')) return { backgroundColor: '#f472b6' }
  if (en.includes('yellow')) return { backgroundColor: '#facc15' }
  if (en.includes('orange')) return { backgroundColor: '#f97316' }

  return mapped ? { backgroundColor: mapped } : undefined
}
