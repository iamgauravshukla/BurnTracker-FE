const REMOTE_API_ORIGIN = 'https://burntracker-backend-production.up.railway.app'

function isLocalHostname(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl)
  }

  if (typeof window !== 'undefined' && !isLocalHostname(window.location.hostname)) {
    return `${REMOTE_API_ORIGIN}/api`
  }

  return '/api'
}

export const API_BASE_URL = resolveApiBaseUrl()