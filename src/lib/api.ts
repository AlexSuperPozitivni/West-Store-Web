import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin + '/api' : '/api')
const APP_URL = import.meta.env.VITE_APP_URL || API_URL.replace(/\/api\/?$/, '')

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

let csrfReady = false

export const ensureCsrf = async () => {
  if (csrfReady) return

  await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })

  csrfReady = true
}
