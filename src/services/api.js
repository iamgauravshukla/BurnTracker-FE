import axios from 'axios'
import { API_BASE_URL } from './apiBase'
import { clearStoredToken, getStoredToken } from './auth'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

/**
 * Extract a human-readable message from an axios error.
 * Handles validation error arrays returned as { errors: [{msg}] }.
 */
export function extractMessage(error) {
  const data = error.response?.data
  if (data?.errors?.length) {
    return data.errors[0].msg
  }
  return data?.message || error.message || 'Something went wrong.'
}

/**
 * Normalize a backend record to ensure it has an `id` field.
 * Mongoose returns a virtual `id` but we guard for raw ObjectId strings too.
 */
export function normalize(item) {
  if (!item || typeof item !== 'object') return item
  return { ...item, id: item.id || (item._id ? String(item._id) : undefined) }
}

export function normalizeList(items) {
  return Array.isArray(items) ? items.map(normalize) : []
}

export function getRecordActorName(item) {
  if (!item || typeof item !== 'object') {
    return ''
  }

  if (typeof item.createdByName === 'string' && item.createdByName.trim()) {
    return item.createdByName.trim()
  }

  if (typeof item.createdByEmail === 'string' && item.createdByEmail.trim()) {
    return item.createdByEmail.trim()
  }

  return ''
}

export default api
