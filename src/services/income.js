import api, { extractMessage, normalize, normalizeList } from './api'

export const incomeSources = ['consulting', 'freelance', 'product sales', 'affiliate', 'saas revenue']

export async function getIncome(projectId) {
  try {
    const { data } = await api.get('/income', { params: { projectId } })
    return normalizeList(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function createIncome(incomeData) {
  try {
    const { data } = await api.post('/income', incomeData)
    return normalize(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function updateIncome(incomeId, incomeData) {
  try {
    const { data } = await api.put(`/income/${incomeId}`, incomeData)
    return normalize(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function deleteIncome(incomeId) {
  try {
    await api.delete(`/income/${incomeId}`)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export function getIncomeForProject(incomeEntries, projectId) {
  if (!projectId) {
    return []
  }

  return incomeEntries
    .filter((incomeEntry) => incomeEntry.projectId === projectId)
    .sort((first, second) => new Date(second.date) - new Date(first.date))
}

export function formatIncomeAmount(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}