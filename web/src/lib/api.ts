import axios, { AxiosError } from 'axios'
import type { ApiErrorBody } from './types'

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333').replace(/\/$/, '')

export const TOKEN_STORAGE_KEY = '@helpdesk:token'
export const USER_STORAGE_KEY = '@helpdesk:user'

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = readStorage(TOKEN_STORAGE_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Chamado pelo AuthContext para limpar a sessão quando a API responder 401. */
let onUnauthorized: (() => void) | undefined
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const isLoginAttempt = error.config?.url?.startsWith('/sessions')
    if (error.response?.status === 401 && !isLoginAttempt) onUnauthorized?.()
    return Promise.reject(error)
  },
)

/** Mensagem legível para toasts e alertas, a partir de qualquer erro da API. */
export function getErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.') {
  if (error instanceof AxiosError) {
    if (!error.response) return 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    return (error.response.data as ApiErrorBody | undefined)?.message ?? fallback
  }
  return fallback
}

export function avatarUrl(avatar: string | null | undefined) {
  return avatar ? `${API_URL}/uploads/${avatar}` : undefined
}

// localStorage pode estar indisponível (modo privado, bloqueio do navegador).
export function readStorage(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // sem persistência: a sessão vale só até recarregar a página
  }
}
