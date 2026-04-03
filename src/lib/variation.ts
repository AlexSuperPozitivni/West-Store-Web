export interface ProductVariation {
  id?: number | null
  attributes?: Record<string, string>
  price?: number | string | null
  regular_price?: number | string | null
  in_stock?: boolean
  is_purchasable?: boolean
  is_preorder?: boolean
  availability?: string | null
  image?: string | null
}

export interface ProductWithVariations {
  price?: number | string | null
  price_max?: number | string | null
  in_stock?: boolean
  is_preorder?: boolean
  variations?: ProductVariation[] | null
}

export interface ProductStateResolved {
  variation: ProductVariation | null
  price: number
  priceMax: number
  inStock: boolean
  isPreorder: boolean
  canBuy: boolean
}

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, '').replace(',', '.')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

const variationMatches = (variation: ProductVariation, selected: Record<string, string>) => {
  const attrs = variation.attributes || {}
  const entries = Object.entries(attrs).filter(([, value]) => !!value)
  if (entries.length === 0) return false
  return entries.every(([name, value]) => selected[name] === value)
}

export const findMatchingVariation = (
  variations: ProductVariation[] | null | undefined,
  selected: Record<string, string>
): ProductVariation | null => {
  if (!variations || variations.length === 0) return null

  const matched = variations
    .filter((variation) => variationMatches(variation, selected))
    .sort((a, b) => {
      const aCount = Object.keys(a.attributes || {}).length
      const bCount = Object.keys(b.attributes || {}).length
      return bCount - aCount
    })

  return matched[0] || null
}

export const resolveProductState = (
  product: ProductWithVariations | null | undefined,
  selected: Record<string, string>
): ProductStateResolved => {
  const basePrice = toNumber(product?.price, 0)
  const basePriceMax = Math.max(basePrice, toNumber(product?.price_max, basePrice))
  const baseInStock = product?.in_stock ?? true
  const basePreorder = product?.is_preorder ?? false
  const variations = product?.variations || []

  const match = findMatchingVariation(variations, selected)
  if (!match) {
    return {
      variation: null,
      price: basePrice,
      priceMax: basePriceMax,
      inStock: baseInStock,
      isPreorder: basePreorder,
      canBuy: baseInStock || basePreorder
    }
  }

  const vPrice = toNumber(match.price, basePrice)
  const vRegular = toNumber(match.regular_price, vPrice)
  const inStock = match.in_stock ?? baseInStock
  const preorder = match.is_preorder ?? (!inStock && (match.is_purchasable ?? false))

  return {
    variation: match,
    price: vPrice,
    priceMax: Math.max(vPrice, vRegular),
    inStock,
    isPreorder: preorder,
    canBuy: inStock || preorder
  }
}
