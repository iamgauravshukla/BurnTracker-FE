import api, { extractMessage, normalize, normalizeList } from './api'

export const expenseCategories = [
  'development',
  'marketing',
  'travel',
  'equipment',
  'infrastructure',
  'subscriptions',
]

export function normalizeExpenseDepartment(department) {
  return typeof department === 'string' && department.trim() ? department.trim() : 'Regular'
}

export async function getExpenses(projectId) {
  try {
    const { data } = await api.get('/expenses', { params: { projectId } })
    return normalizeList(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function createExpense(expenseData) {
  try {
    const { data } = await api.post('/expenses', expenseData)
    return normalize(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function updateExpense(expenseId, expenseData) {
  try {
    const { data } = await api.put(`/expenses/${expenseId}`, expenseData)
    return normalize(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function deleteExpense(expenseId) {
  try {
    await api.delete(`/expenses/${expenseId}`)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export function getExpensesForProject(expenses, projectId) {
  if (!projectId) {
    return []
  }

  return expenses
    .filter((expense) => expense.projectId === projectId)
    .map((expense) => ({ ...expense, department: normalizeExpenseDepartment(expense.department) }))
    .sort((first, second) => new Date(second.date) - new Date(first.date))
}

export function formatExpenseAmount(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getExpenseMonths(expenses) {
  const months = new Set(expenses.map((expense) => expense.date.slice(0, 7)))
  return Array.from(months).sort().reverse()
}