import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const backendMessage = error?.response?.data?.message

    const messages: Record<number, string> = {
      400: backendMessage || 'Los datos enviados no son válidos.',
      401: 'Tu sesión expiró. Por favor vuelve a iniciar sesión.',
      403: 'No tienes permiso para realizar esta acción.',
      404: 'No encontramos lo que buscabas.',
      409: backendMessage || 'Ya existe un registro con esos datos.',
      422: backendMessage || 'Revisa los campos del formulario.',
      500: 'Ocurrió un error en el servidor. Intenta de nuevo.',
    }

    const message = status
      ? messages[status] || 'Ocurrió un error inesperado.'
      : 'Sin conexión a internet. Verifica tu red.'

    toast.error(message, { position: 'top-right' })
    return Promise.reject(error)
  }
)

export default api
