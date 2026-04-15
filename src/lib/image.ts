const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || (typeof window !== 'undefined' ? window.location.origin + '/storage' : '/storage')

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/slides/')) return path
  const cleanPath = path.replace(/^\/storage\//, '')
  return `${STORAGE_URL}/${cleanPath}`
}
