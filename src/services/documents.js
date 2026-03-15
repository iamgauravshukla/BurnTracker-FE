import axios from 'axios'
import { API_BASE_URL } from './apiBase'
import { getStoredToken } from './auth'

const documentsApi = axios.create({
  baseURL: API_BASE_URL,
})

documentsApi.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

function extractMessage(error) {
  const data = error.response?.data
  if (data?.errors?.length) return data.errors[0].msg
  return data?.message || error.message || 'Unable to upload document.'
}

export async function uploadDocument(file, projectId) {
  const formData = new FormData()
  formData.append('file', file)
  if (projectId) {
    formData.append('projectId', projectId)
  }

  try {
    const { data } = await documentsApi.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return data
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}