import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

const ACCESS_KEY = 'pichanga.accessToken'
const REFRESH_KEY = 'pichanga.refreshToken'

export const tokenStore = {
  getAccess(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ACCESS_KEY)
  },
  getRefresh(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_KEY)
  },
  set(access: string, refresh: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.getRefresh()
  if (!refreshToken) return null
  try {
    const { data } = await axios.post<{
      accessToken: string
      refreshToken: string
    }>(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken })
    tokenStore.set(data.accessToken, data.refreshToken)
    return data.accessToken
  } catch {
    tokenStore.clear()
    return null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string | string[] }>) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }
    const status = error?.response?.status
    const url = original?.url ?? ''

    // 401 con refresh disponible y request no es de auth → intentar refresh
    if (
      status === 401 &&
      !original?._retry &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/refresh') &&
      !url.includes('/auth/register') &&
      tokenStore.getRefresh()
    ) {
      original._retry = true
      refreshing = refreshing ?? refreshAccessToken()
      const newToken = await refreshing
      refreshing = null
      if (newToken) {
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
      // Si falló refresh, redirigir a login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    const raw = error?.response?.data?.message
    const backendMessage = Array.isArray(raw) ? raw.join(' · ') : raw

    const messages: Record<number, string> = {
      400: backendMessage || 'Los datos enviados no son válidos.',
      401: 'Tu sesión expiró. Por favor vuelve a iniciar sesión.',
      403: 'No tienes permiso para realizar esta acción.',
      404: 'No encontramos lo que buscabas.',
      409: backendMessage || 'Ya existe un registro con esos datos.',
      422: backendMessage || 'Revisa los campos del formulario.',
      429: 'Demasiados intentos. Espera un momento e intenta de nuevo.',
      500: 'Ocurrió un error en el servidor. Intenta de nuevo.',
    }

    const message = status
      ? messages[status] || backendMessage || 'Ocurrió un error inesperado.'
      : 'Sin conexión a internet. Verifica tu red.'

    toast.error(message, { position: 'top-right' })
    return Promise.reject(error)
  }
)

export default api
