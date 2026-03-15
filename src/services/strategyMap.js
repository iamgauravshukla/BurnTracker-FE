import api, { extractMessage } from './api'

export const strategyNodeTypes = [
  { value: 'north-star', label: 'North Star' },
  { value: 'initiative', label: 'Initiative' },
  { value: 'metric', label: 'Metric' },
  { value: 'risk', label: 'Risk' },
  { value: 'decision', label: 'Decision' },
]

export const strategyNodeStatuses = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'watch', label: 'Watch' },
  { value: 'blocked', label: 'Blocked' },
]

function createNodeId() {
  return `local-${crypto.randomUUID()}`
}

export function createStrategyNode(overrides = {}) {
  return {
    id: createNodeId(),
    title: '',
    type: 'initiative',
    status: 'planned',
    summary: '',
    owner: '',
    targetDate: '',
    linkedNodeIds: [],
    ...overrides,
  }
}

export async function getStrategyMap(projectId) {
  try {
    const { data } = await api.get('/strategy-map', { params: { projectId } })
    return {
      projectId: data.projectId,
      nodes: Array.isArray(data.nodes) ? data.nodes : [],
      updatedAt: data.updatedAt || null,
    }
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function saveStrategyMap(projectId, nodes) {
  try {
    const { data } = await api.put(`/strategy-map/${projectId}`, { nodes })
    return {
      projectId: data.projectId,
      nodes: Array.isArray(data.nodes) ? data.nodes : [],
      updatedAt: data.updatedAt || null,
    }
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export function buildStarterStrategyMap({ selectedProject, expenses = [], incomeEntries = [], tasks = [] }) {
  if (!selectedProject?.id) {
    return []
  }

  const projectExpenses = expenses.filter((item) => String(item.projectId) === String(selectedProject.id))
  const projectIncome = incomeEntries.filter((item) => String(item.projectId) === String(selectedProject.id))
  const projectTasks = tasks.filter((item) => String(item.projectId) === String(selectedProject.id))
  const overdueTasks = projectTasks.filter((task) => task.status !== 'done' && task.deadline && new Date(task.deadline) < new Date())
  const monthlyExpenseTotal = projectExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const monthlyIncomeTotal = projectIncome.reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const northStar = createStrategyNode({
    title: `Keep ${selectedProject.name} on a durable growth path`,
    type: 'north-star',
    status: 'active',
    summary: 'Tie product execution, revenue momentum, and runway discipline into one operating plan.',
    owner: selectedProject.owner?.name || 'Founder',
  })

  const revenueMetric = createStrategyNode({
    title: `Monthly income tracked: ${monthlyIncomeTotal > 0 ? monthlyIncomeTotal.toLocaleString('en-US') : 'No revenue yet'}`,
    type: 'metric',
    status: monthlyIncomeTotal > 0 ? 'active' : 'watch',
    summary: 'Use this as the operating signal for refill rate and revenue traction.',
    linkedNodeIds: [northStar.id],
  })

  const burnMetric = createStrategyNode({
    title: `Spend tracked: ${monthlyExpenseTotal > 0 ? monthlyExpenseTotal.toLocaleString('en-US') : 'No expenses yet'}`,
    type: 'metric',
    status: monthlyExpenseTotal > 0 ? 'active' : 'planned',
    summary: 'Watch whether expenses are earning growth or just shrinking runway.',
    linkedNodeIds: [northStar.id],
  })

  const executionInitiative = createStrategyNode({
    title: 'Align top work with the next operating milestone',
    type: 'initiative',
    status: projectTasks.length ? 'active' : 'planned',
    summary: 'Map delivery work to revenue, onboarding, retention, or burn-reduction outcomes.',
    owner: 'Ops',
    linkedNodeIds: [northStar.id, revenueMetric.id],
  })

  const riskNode = createStrategyNode({
    title: overdueTasks.length ? `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} threatening execution` : 'Execution risk review',
    type: 'risk',
    status: overdueTasks.length ? 'blocked' : 'watch',
    summary: overdueTasks.length
      ? 'Overdue work is now the clearest operational risk in the plan.'
      : 'No overdue tasks detected, but keep reviewing whether planned work is still relevant.',
    linkedNodeIds: [executionInitiative.id],
  })

  const decisionNode = createStrategyNode({
    title: 'Decide the next founder bet this week',
    type: 'decision',
    status: 'planned',
    summary: 'Choose one concrete bet: grow revenue, cut burn, unblock onboarding, or reduce delivery risk.',
    owner: selectedProject.owner?.name || 'Founder',
    linkedNodeIds: [revenueMetric.id, burnMetric.id, riskNode.id],
  })

  return [northStar, revenueMetric, burnMetric, executionInitiative, riskNode, decisionNode]
}
