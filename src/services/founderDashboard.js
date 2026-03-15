import { calculateRunwayEstimate, formatCurrency } from './projects'
import { normalizeExpenseDepartment } from './expenses'

const ONBOARDING_KEYWORDS = ['onboarding', 'onboard', 'activation', 'launch', 'listing']

function getLastSixMonths() {
  const months = []

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - offset)

    months.push({
      key: date.toISOString().slice(0, 7),
      label: date.toLocaleString('en-US', { month: 'short' }),
    })
  }

  return months
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function average(values) {
  if (!values.length) {
    return 0
  }

  return values.reduce((total, value) => total + value, 0) / values.length
}

function matchesKeywords(value, keywords = ONBOARDING_KEYWORDS) {
  const normalized = String(value || '').toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword))
}

function sumExpenses(expenses) {
  return expenses.reduce((total, expense) => total + toNumber(expense.amount), 0)
}

function sumIncome(incomeEntries) {
  return incomeEntries.reduce((total, incomeEntry) => total + toNumber(incomeEntry.amount), 0)
}

function getScopedExpenses(expenses, selectedProject) {
  if (!selectedProject) {
    return [...expenses].sort((first, second) => new Date(second.date) - new Date(first.date))
  }

  return expenses
    .filter((expense) => expense.projectId === selectedProject.id || String(expense.projectId) === String(selectedProject.id))
    .sort((first, second) => new Date(second.date) - new Date(first.date))
}

function getScopedIncome(incomeEntries, selectedProject) {
  if (!selectedProject) {
    return [...incomeEntries].sort((first, second) => new Date(second.date) - new Date(first.date))
  }

  return incomeEntries
    .filter((incomeEntry) => incomeEntry.projectId === selectedProject.id || String(incomeEntry.projectId) === String(selectedProject.id))
    .sort((first, second) => new Date(second.date) - new Date(first.date))
}

function getScopedTasks(tasks, selectedProject) {
  if (!selectedProject) {
    return [...tasks]
  }

  return tasks.filter((task) => task.projectId === selectedProject.id || String(task.projectId) === String(selectedProject.id))
}

function buildExpenseSeries(expenses, months) {
  return months.map(({ key }) => {
    return Math.round(
      expenses
        .filter((expense) => expense.date.startsWith(key))
        .reduce((total, expense) => total + toNumber(expense.amount), 0),
    )
  })
}

function buildIncomeSeries(incomeEntries, months) {
  return months.map(({ key }) => {
    return Math.round(
      incomeEntries
        .filter((incomeEntry) => incomeEntry.date.startsWith(key))
        .reduce((total, incomeEntry) => total + toNumber(incomeEntry.amount), 0),
    )
  })
}

function buildExpenseCategories(expenses) {
  const grouped = expenses.reduce((accumulator, expense) => {
    const nextValue = (accumulator.get(expense.category) || 0) + toNumber(expense.amount)
    accumulator.set(expense.category, nextValue)
    return accumulator
  }, new Map())

  return Array.from(grouped.entries())
    .map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value: Math.round(value),
    }))
    .sort((first, second) => second.value - first.value)
    .slice(0, 5)
}

function buildVendorCosts(expenses, recoveryBase) {
  const grouped = expenses.reduce((accumulator, expense) => {
    const current = accumulator.get(expense.vendor) || {
      vendor: expense.vendor,
      amount: 0,
      categories: new Set(),
      departments: new Set(),
    }

    current.amount += toNumber(expense.amount)
    current.categories.add(expense.category)
    current.departments.add(normalizeExpenseDepartment(expense.department))
    accumulator.set(expense.vendor, current)
    return accumulator
  }, new Map())

  return Array.from(grouped.values())
    .map((item) => ({
      vendor: item.vendor,
      amount: Math.round(item.amount),
      categories: Array.from(item.categories),
      departments: Array.from(item.departments),
      recoveryMonths: recoveryBase > 0 ? Number((item.amount / recoveryBase).toFixed(1)) : null,
    }))
    .sort((first, second) => second.amount - first.amount)
    .slice(0, 5)
}

function buildMonthlySnapshots(months, incomeSeries, expenseSeries, currency) {
  return months.map((month, index) => {
    const income = incomeSeries[index] || 0
    const expenses = expenseSeries[index] || 0
    const net = income - expenses

    return {
      label: month.label,
      income: formatCurrency(income, currency),
      expenses: formatCurrency(expenses, currency),
      net: formatCurrency(net, currency),
      status: net >= 0 ? 'covered' : 'burning',
    }
  })
}

function getPriorityRank(priority) {
  if (priority === 'high') return 3
  if (priority === 'medium') return 2
  return 1
}

function buildHighPriorityTasks(tasks) {
  return tasks
    .filter((task) => task.status !== 'done')
    .sort((first, second) => {
      const priorityDelta = getPriorityRank(second.priority) - getPriorityRank(first.priority)
      if (priorityDelta !== 0) {
        return priorityDelta
      }

      return new Date(first.deadline) - new Date(second.deadline)
    })
    .slice(0, 3)
    .map((task) => ({
      title: task.title,
      owner: task.status === 'in-progress' ? 'In progress' : 'To do',
      priority: task.priority || 'medium',
    }))
}

function buildTaskSignals(tasks) {
  const now = Date.now()
  const actionableTasks = tasks.filter((task) => task.status !== 'done')
  const overdueTasks = actionableTasks.filter((task) => task.deadline && new Date(task.deadline).getTime() < now)
  const dueSoonTasks = actionableTasks.filter((task) => {
    if (!task.deadline) return false
    const deadline = new Date(task.deadline).getTime()
    return deadline >= now && deadline <= now + 72 * 60 * 60 * 1000
  })
  const onTimeEligible = tasks.filter((task) => task.deadline)
  const onTimeCount = onTimeEligible.filter((task) => task.status === 'done' || new Date(task.deadline).getTime() >= now).length
  const onTimeRate = onTimeEligible.length ? Math.round((onTimeCount / onTimeEligible.length) * 100) : 100

  return {
    overdueTasks,
    dueSoonTasks,
    onTimeRate,
  }
}

function buildOnboardingDirection(tasks, expenses, currency) {
  const onboardingTasks = tasks.filter((task) => matchesKeywords(`${task.title} ${task.description || ''}`))
  const overdueOnboarding = onboardingTasks.filter((task) => task.status !== 'done' && task.deadline && new Date(task.deadline) < new Date())
  const onboardingSpend = expenses.filter((expense) => matchesKeywords(`${expense.vendor} ${expense.notes || ''} ${expense.category || ''}`))
  const spendTotal = onboardingSpend.reduce((total, item) => total + toNumber(item.amount), 0)
  const status = overdueOnboarding.length ? 'red' : onboardingTasks.length ? 'yellow' : 'green'

  return {
    status,
    title: 'Onboarding Direction',
    summary: onboardingTasks.length
      ? `${onboardingTasks.length} onboarding-related task${onboardingTasks.length === 1 ? '' : 's'} are being tracked.`
      : 'No onboarding plan is visible in the current workstream.',
    detail: overdueOnboarding.length
      ? `${overdueOnboarding.length} onboarding item${overdueOnboarding.length === 1 ? '' : 's'} already slipped. This usually shows go-live or activation risk.`
      : spendTotal > 0
        ? `${formatCurrency(spendTotal, currency)} has already been committed to onboarding-related work or listings.`
        : 'If onboarding matters this month, the operating plan is still too quiet.',
  }
}

function buildWorkRelevance(tasks) {
  const openTasks = tasks.filter((task) => task.status !== 'done')
  const lowPriorityOpen = openTasks.filter((task) => task.priority === 'low').length
  const tasksWithoutDeadline = openTasks.filter((task) => !task.deadline).length
  const relevanceRisk = openTasks.length ? Math.round(((lowPriorityOpen + tasksWithoutDeadline) / openTasks.length) * 100) : 0
  const status = relevanceRisk >= 50 ? 'red' : relevanceRisk >= 25 ? 'yellow' : 'green'

  return {
    status,
    title: 'Work Fallacy',
    summary: relevanceRisk >= 50
      ? 'Too much open work looks weakly tied to immediate survival, revenue, or delivery.'
      : relevanceRisk >= 25
        ? 'Some founder attention is drifting into lower-value work.'
        : 'Most active work still looks relevant to current survival and delivery goals.',
    detail: `${lowPriorityOpen} low-priority open task${lowPriorityOpen === 1 ? '' : 's'} and ${tasksWithoutDeadline} task${tasksWithoutDeadline === 1 ? '' : 's'} without deadlines are diluting focus.`,
    score: 100 - relevanceRisk,
  }
}

function buildFounderAlerts({ averageMonthlyBurn, budgetUtilization, latestExpenses, latestIncome, marketingSpend, taskSignals, workRelevance, currency }) {
  const alerts = []

  if (latestExpenses > latestIncome) {
    alerts.push({
      title: 'Cash is leaving faster than it is refilling',
      detail: `This month is burning ${formatCurrency(latestExpenses - latestIncome, currency)} more than it refilled.`,
    })
  }

  if (budgetUtilization >= 85) {
    alerts.push({
      title: 'Budget is close to its edge',
      detail: `${budgetUtilization.toFixed(1)}% of the initial budget is already consumed.`,
    })
  }

  if (taskSignals.overdueTasks.length) {
    alerts.push({
      title: 'Execution is already slipping',
      detail: `${taskSignals.overdueTasks.length} task${taskSignals.overdueTasks.length === 1 ? '' : 's'} are overdue and likely to create downstream misses.`,
    })
  }

  if (marketingSpend > 0 && latestIncome === 0) {
    alerts.push({
      title: 'Marketing spend has no visible refill yet',
      detail: `${formatCurrency(marketingSpend, currency)} was spent on marketing without matching recorded income this month.`,
    })
  }

  if (workRelevance.status === 'red') {
    alerts.push({
      title: 'Work relevance is weakening',
      detail: workRelevance.detail,
    })
  }

  if (!alerts.length && averageMonthlyBurn > 0) {
    alerts.push({
      title: 'No immediate founder alarm',
      detail: 'The current inputs do not show an acute financial or execution break, but keep checking burn and overdue work weekly.',
    })
  }

  return alerts.slice(0, 4)
}

function isSelfFunded(incomeEntry, firmName) {
  if (incomeEntry.source === 'self_funding') return true
  if (!firmName) return false
  return incomeEntry.client.toLowerCase().includes(firmName.toLowerCase())
}

export function buildFounderDashboardData(selectedProject, projects, expenses, incomeEntries, tasks = [], currency = 'USD') {
  const portfolioInvestment = projects.reduce((total, project) => total + toNumber(project.totalInvestment), 0)
  const portfolioBalance = projects.reduce((total, project) => total + toNumber(project.currentBalance), 0)

  const focus = selectedProject || {
    id: 'portfolio-overview',
    name: 'Founder portfolio',
    description:
      'A consolidated founder view across startup projects, cash, operating risk, and execution priorities.',
    totalInvestment: portfolioInvestment,
    currentBalance: portfolioBalance,
  }

  const scopedExpenses = getScopedExpenses(expenses, selectedProject)
  const scopedIncome = getScopedIncome(incomeEntries, selectedProject)
  const regularIncome = scopedIncome.filter((e) => !isSelfFunded(e, focus.firmName))
  const selfFundedIncome = scopedIncome.filter((e) => isSelfFunded(e, focus.firmName))
  const scopedTasks = getScopedTasks(tasks, selectedProject)
  const months = getLastSixMonths()
  const expenseSeries = buildExpenseSeries(scopedExpenses, months)
  const incomeSeries = buildIncomeSeries(regularIncome, months)
  const hasStoredExpenses = expenseSeries.some((value) => value > 0)
  const hasStoredIncome = incomeSeries.some((value) => value > 0)
  const latestIncome = incomeSeries[incomeSeries.length - 1] || 0
  const latestExpenses = expenseSeries[expenseSeries.length - 1] || 0
  const netBurn = latestExpenses - latestIncome
  const lastThreeMonthsExpenses = expenseSeries.slice(-3)
  const averageMonthlyBurn = Math.round(
    lastThreeMonthsExpenses.reduce((total, value) => total + value, 0) / lastThreeMonthsExpenses.length,
  )
  const runwayLabel =
    averageMonthlyBurn > 0
      ? `${(toNumber(focus.currentBalance) / averageMonthlyBurn).toFixed(1)} months`
      : calculateRunwayEstimate(focus)

  const expenseCategories = buildExpenseCategories(scopedExpenses)
  const marketingSpend = scopedExpenses
    .filter((expense) => expense.category === 'marketing')
    .reduce((total, expense) => total + toNumber(expense.amount), 0)
  const taskSignals = buildTaskSignals(scopedTasks)
  const refillRate = latestExpenses > 0 ? Math.round((latestIncome / latestExpenses) * 100) : latestIncome > 0 ? 100 : 0
  const survivalRate = netBurn <= 0
    ? 100
    : clamp(Math.round(((toNumber(focus.currentBalance) / Math.max(averageMonthlyBurn || netBurn, 1)) / 12) * 100), 0, 100)

  const recentExpenses = scopedExpenses.slice(0, 3).map((expense) => ({
    name: expense.vendor,
    amount: formatCurrency(toNumber(expense.amount), currency),
    meta: `${normalizeExpenseDepartment(expense.department)} • ${expense.category}`,
  }))

  const recentIncome = regularIncome.slice(0, 3).map((incomeEntry) => ({
    name: incomeEntry.client,
    amount: formatCurrency(toNumber(incomeEntry.amount), currency),
    meta: incomeEntry.source,
  }))

  const totalTrackedExpenses = sumExpenses(scopedExpenses)
  const totalTrackedIncome = sumIncome(regularIncome)
  const totalSelfFunded = sumIncome(selfFundedIncome)
  const openTasks = scopedTasks.filter((task) => task.status !== 'done').length
  const initialBudget = toNumber(focus.totalInvestment)
  const leftoverFund = Math.max(initialBudget - totalTrackedExpenses, 0)
  const exceededAmount = Math.max(totalTrackedExpenses - initialBudget, 0)
  const budgetUtilization = initialBudget > 0 ? (totalTrackedExpenses / initialBudget) * 100 : 0
  const rightTrackScore = Math.round(average([
    clamp(refillRate, 0, 100),
    clamp(survivalRate, 0, 100),
    clamp(taskSignals.onTimeRate, 0, 100),
    clamp(100 - Math.max(budgetUtilization - 100, 0), 0, 100),
  ]))
  const vendorCostBreakdown = buildVendorCosts(scopedExpenses, latestIncome || Math.round(average(incomeSeries.slice(-3))) || 0)
  const onboardingDirection = buildOnboardingDirection(scopedTasks, scopedExpenses, currency)
  const workRelevance = buildWorkRelevance(scopedTasks)
  const monthlySnapshots = buildMonthlySnapshots(months, incomeSeries, expenseSeries, currency)

  const founderAlerts = buildFounderAlerts({
    averageMonthlyBurn,
    budgetUtilization,
    latestExpenses,
    latestIncome,
    marketingSpend,
    taskSignals,
    workRelevance,
    currency,
  })

  const stuckTaskGuidance = taskSignals.overdueTasks.slice(0, 4).map((task) => ({
    title: task.title,
    detail: `What went wrong: deadline slipped while still ${task.status === 'in-progress' ? 'in progress' : 'not started'}. What breaks next: dependent work or cash timing may slip if this keeps dragging.`,
  }))

  return {
    focus,
    hasFinancialData: hasStoredExpenses || hasStoredIncome,
    healthSummary: {
      rightTrackScore,
      refillRate,
      survivalRate,
      onTimeRate: taskSignals.onTimeRate,
    },
    widgets: [
      {
        label: 'Total Investment',
        value: formatCurrency(toNumber(focus.totalInvestment), currency),
        hint: 'Initial capital committed to this startup',
      },
      {
        label: 'Burn Rate',
        value: formatCurrency(averageMonthlyBurn || 0, currency),
        hint: hasStoredExpenses ? 'Average monthly burn from tracked expenses' : 'No expense data recorded yet',
      },
      {
        label: 'Refill Rate',
        value: `${Math.max(refillRate, 0)}%`,
        hint: latestExpenses > 0 ? 'How much of this month’s spend was refilled by income' : 'No monthly spend recorded yet',
      },
      {
        label: 'Survival Rate',
        value: `${survivalRate}%`,
        hint: 'A rough survival signal derived from runway pressure',
      },
      {
        label: 'On-time Rate',
        value: `${taskSignals.onTimeRate}%`,
        hint: 'Tasks not currently slipping against deadlines',
      },
      {
        label: 'Right Track',
        value: `${rightTrackScore}%`,
        hint: 'Combined signal from burn, survival, budget, and execution',
      },
      {
        label: 'Monthly Income',
        value: formatCurrency(latestIncome, currency),
        hint: hasStoredIncome ? 'Tracked income in the current month' : 'No income data recorded yet',
      },
      {
        label: 'Monthly Expenses',
        value: formatCurrency(latestExpenses, currency),
        hint: hasStoredExpenses ? 'Tracked expenses in the current month' : 'No expenses recorded in this month',
      },
      { label: 'Net Burn', value: formatCurrency(netBurn, currency), hint: 'Expenses minus income' },
      { label: 'Runway', value: runwayLabel, hint: 'Estimated remaining runway' },
      ...(totalSelfFunded > 0 ? [{ label: 'Self-funded Capital', value: formatCurrency(totalSelfFunded, currency), hint: 'Capital injected from the founding firm — kept separate from revenue' }] : []),
    ],
    lineChart: {
      labels: months.map((month) => month.label),
      incomeSeries,
      expenseSeries,
    },
    expenseCategories,
    budgetReport: {
      initialBudget: formatCurrency(initialBudget, currency),
      trackedSpend: formatCurrency(totalTrackedExpenses, currency),
      leftoverFund: formatCurrency(leftoverFund, currency),
      exceededAmount: formatCurrency(exceededAmount, currency),
      hasBudget: initialBudget > 0,
      utilization: initialBudget > 0 ? `${budgetUtilization.toFixed(1)}%` : 'No budget set',
    },
    monthlySnapshots,
    marketingSpend: {
      raw: marketingSpend,
      total: formatCurrency(marketingSpend, currency),
      hint: marketingSpend > 0 ? 'Marketing spend needs a clear payback path.' : 'No marketing expense logged yet.',
    },
    vendorCostBreakdown: vendorCostBreakdown.map((item) => ({
      name: item.vendor,
      amount: formatCurrency(item.amount, currency),
      meta: `${item.categories.join(', ')}${item.recoveryMonths !== null ? ` • recovery ~${item.recoveryMonths} month${item.recoveryMonths === 1 ? '' : 's'}` : ' • no recovery signal yet'}`,
    })),
    onboardingDirection,
    workRelevance,
    recentExpenses,
    recentIncome,
    highPriorityTasks: buildHighPriorityTasks(scopedTasks),
    stuckTaskGuidance,
    founderAlerts,
    aiAlerts: founderAlerts,
  }
}