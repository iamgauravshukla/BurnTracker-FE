import api, { extractMessage, normalize, normalizeList } from './api'

function normalizeProject(project) {
  const normalized = normalize(project)

  return {
    ...normalized,
    owner: normalized.owner ? normalize(normalized.owner) : null,
    collaborators: normalizeList(normalized.collaborators),
  }
}

export async function getProjects() {
  try {
    const { data } = await api.get('/projects')
    return Array.isArray(data) ? data.map(normalizeProject) : []
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function getProjectById(projectId) {
  try {
    const { data } = await api.get(`/projects/${projectId}`)
    return normalizeProject(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function createProject(projectData) {
  try {
    const { data } = await api.post('/projects', projectData)
    return normalizeProject(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function updateProject(projectId, projectData) {
  try {
    const { data } = await api.put(`/projects/${projectId}`, projectData)
    return normalizeProject(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function searchProjectUsers(projectId, query) {
  try {
    const { data } = await api.get(`/projects/${projectId}/collaborators/search`, { params: { query } })
    return normalizeList(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function inviteProjectCollaborator(projectId, payload) {
  try {
    const { data } = await api.post(`/projects/${projectId}/collaborators`, payload)
    return normalizeProject(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function updateProjectCollaboratorRole(projectId, collaboratorId, role) {
  try {
    const { data } = await api.patch(`/projects/${projectId}/collaborators/${collaboratorId}`, { role })
    return normalizeProject(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function removeProjectCollaborator(projectId, collaboratorId) {
  try {
    const { data } = await api.delete(`/projects/${projectId}/collaborators/${collaboratorId}`)
    return normalizeProject(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function deleteProject(projectId) {
  try {
    await api.delete(`/projects/${projectId}`)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateRunwayEstimate(project) {
  const spent = Math.max(project.totalInvestment - project.currentBalance, 0)

  if (spent <= 0) {
    return 'Not enough burn data yet'
  }

  const monthsRemaining = (project.currentBalance / spent) * 12

  if (!Number.isFinite(monthsRemaining) || monthsRemaining <= 0) {
    return 'Runway depleted'
  }

  return `${monthsRemaining.toFixed(1)} months`
}