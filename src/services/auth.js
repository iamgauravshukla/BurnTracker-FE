import axios from 'axios'
import { API_BASE_URL } from './apiBase'

export const TOKEN_STORAGE_KEY = 'burnTrackerToken'
const LEGACY_TOKEN_STORAGE_KEY = 'startupTrackerToken'

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

function extractMessage(error) {
  return error.response?.data?.message || error.message || 'Something went wrong.'
}

export function getStoredToken() {
  const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY)

  if (currentToken) {
    return currentToken
  }

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY)
  if (legacyToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, legacyToken)
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY)
  }

  return legacyToken
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY)
}

export async function loginUser(credentials) {
  try {
    const { data } = await authApi.post('/auth/login', credentials)

    if (data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
    }

    return data
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function registerUser(payload) {
  try {
    const { data } = await authApi.post('/auth/register', payload)
    return data
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function changePassword(currentPassword, newPassword) {
  const token = getStoredToken()
  try {
    const { data } = await authApi.put(
      '/auth/change-password',
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return data
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}