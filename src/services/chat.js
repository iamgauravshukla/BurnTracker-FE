import axios from 'axios'
import { getStoredToken } from './auth'

const chatApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

chatApi.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

function extractMessage(error) {
  return error.response?.data?.message || error.message || 'Unable to parse message.'
}

function computeSummary(actions) {
  if (!actions?.length) return 'No actions detected.'
  return actions
    .map((action) => {
      if (action.type === 'expense') {
        return `Expense: ${action.category}${action.amount ? ` $${action.amount}` : ''}${action.vendor ? ` · ${action.vendor}` : ''}`
      }
      if (action.type === 'income') {
        return `Income:${action.amount ? ` $${action.amount}` : ''}${action.client ? ` from ${action.client}` : ''}${action.source ? ` (${action.source})` : ''}`
      }
      if (action.type === 'task') {
        return `Task: "${action.title}"${action.deadline ? ` due ${new Date(action.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : ''}`
      }
      return `Action: ${action.type}`
    })
    .join(' · ')
}

/**
 * Parse a chat message.
 * When execute is true and projectId is provided, the backend also creates
 * the corresponding DB records and returns { actions, executed }.
 */
export async function parseChatInput(payload) {
  try {
    const { data } = await chatApi.post('/chat/parse', payload)
    // Normalise both response shapes:
    // - parse-only → plain array of actions
    // - execute mode → { actions, executed }
    const actions = Array.isArray(data) ? data : (data.actions || [])
    const executed = Array.isArray(data) ? null : (data.executed || null)
    return { summary: computeSummary(actions), actions, executed }
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function parseDocumentInChat(file, projectId, firmName = '') {
  const token = getStoredToken()
  const formData = new FormData()
  formData.append('file', file)
  if (projectId) formData.append('projectId', projectId)
  if (firmName) formData.append('firmName', firmName)

  try {
    const { data } = await chatApi.post('/chat/parse-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    return {
      summary: data.summary || computeSummary(data.actions || []),
      actions: data.actions || [],
      executed: data.executed || null,
      documentType: data.documentType || 'document',
    }
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}