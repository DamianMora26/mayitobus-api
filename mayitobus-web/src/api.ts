import axios from 'axios'
import type { ApiError, AuthUser } from './types'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const user = readStoredUser()

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }

  return config
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

export function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('mayitobus_user')

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    localStorage.removeItem('mayitobus_user')
    return null
  }
}

export function storeUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem('mayitobus_user', JSON.stringify(user))
    setAuthToken(user.token)
    return
  }

  localStorage.removeItem('mayitobus_user')
  setAuthToken(null)
}

export function getApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; fields?: Record<string, string> } | undefined
    const fieldMessage = data?.fields ? Object.values(data.fields)[0] : undefined
    const status = error.response?.status

    if (!error.response) {
      return {
        message: 'No se pudo conectar con la API. Revisa que Docker este ejecutandose y que la red sea correcta.',
      }
    }

    if (status === 401) {
      return { message: 'Sesion vencida o credenciales invalidas. Vuelve a iniciar sesion.', status }
    }

    if (status === 403) {
      return { message: 'Tu usuario no tiene permiso para realizar esta accion.', status }
    }

    if (status && status >= 500) {
      return { message: 'La API tuvo un problema interno. Revisa la consola del backend.', status }
    }

    return {
      message: fieldMessage ?? data?.message ?? 'No se pudo completar la operacion. Revisa los datos capturados.',
      fields: data?.fields,
      status,
    }
  }

  return { message: 'Ocurrio un error inesperado' }
}
