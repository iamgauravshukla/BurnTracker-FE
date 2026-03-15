import axios from 'axios'
import { API_BASE_URL } from './apiBase'
import { getStoredToken } from './auth'

const insightsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

insightsApi.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

function extractMessage(error) {
  return error.response?.data?.message || error.message || 'Unable to load insights.'
}

function pickStatus(score) {
  if (score >= 75) return 'green'
  if (score >= 45) return 'yellow'
  return 'red'
}

function formatCompact(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount || 0)
}

/**
 * Adapt the project-insights response shape to the weekly insights shape
 * expected by AIInsightsSection.
 */
function adaptProjectInsights(data, currency = 'USD') {
  const healthStatus = pickStatus(data.healthScore)
  const runway = data.metrics?.runway
  const netBurn = data.metrics?.netBurn || 0
  const burnRate = data.metrics?.burnRate || 0
  const monthlyIncome = data.metrics?.monthlyIncome || 0
  const currentBalance = data.metrics?.currentBalance || 0
  const totalInvestment = data.metrics?.totalInvestment || 0
  const burnStatus = netBurn <= 0 ? 'green' : runway !== null && runway < 6 ? 'red' : runway !== null && runway < 12 ? 'yellow' : 'green'
  const total = data.taskCompletion?.total || 0
  const completed = data.taskCompletion?.completed || 0
  const overdue = data.taskCompletion?.overdue || 0
  const dueSoon = data.taskCompletion?.dueSoon || 0
  const highPriorityOpen = data.taskCompletion?.highPriorityOpen || 0
  const completionRate = total > 0 ? completed / total : 1
  const taskStatus = completionRate >= 0.7 ? 'green' : completionRate >= 0.4 ? 'yellow' : 'red'
  const warnCount = data.warnings?.length || 0
  const spendingStatus = warnCount === 0 ? 'green' : warnCount <= 2 ? 'yellow' : 'red'
  const strategyStatus = pickStatus(data.healthScore)
  const budgetUtilization = data.budget?.budgetUtilization
  const budgetStatus = data.budget?.exceededAmount > 0 ? 'red' : budgetUtilization !== null && budgetUtilization >= 85 ? 'yellow' : 'green'
  const rightTrackScore = data.guidanceMetrics?.rightTrackScore || data.healthScore
  const refillRate = data.guidanceMetrics?.refillRate || 0
  const survivalRate = data.guidanceMetrics?.survivalRate || 0
  const onTimeRate = data.guidanceMetrics?.onTimeRate || 100
  const marketingStatus = data.marketingSignal?.status || 'green'
  const onboardingStatus = data.onboardingAnalysis?.status || 'green'
  const workRelevanceStatus = data.workRelevance?.status || 'green'

  return {
    summary: data.summary,
    focusAreas: data.focusAreas || [],
    overviewMetrics: [
      { label: 'Right track', value: `${rightTrackScore}/100`, hint: 'Combined survival and execution signal' },
      { label: 'Refill rate', value: `${Math.max(refillRate, 0)}%`, hint: 'How much of spend was refilled by income this month' },
      { label: 'Survival rate', value: `${survivalRate}%`, hint: 'Runway-derived survival pressure signal' },
      { label: 'On-time rate', value: `${onTimeRate}%`, hint: overdue ? `${overdue} overdue` : dueSoon ? `${dueSoon} due soon` : 'Deadlines under control' },
      { label: 'Total investment', value: formatCompact(totalInvestment, currency), hint: 'Initial project capital' },
      { label: 'Current balance', value: formatCompact(currentBalance, currency), hint: 'Cash currently available' },
    ],
    startupHealthScore: {
      status: healthStatus,
      title: 'Startup Health Score',
      score: data.healthScore,
      summary: data.summary || `${data.project} scores ${data.healthScore}/100. ${completed} of ${total} tasks completed.`,
      detail: runway !== null && runway !== undefined ? `${runway.toFixed(1)} months runway` : 'Positive cash flow',
    },
    burnRateAnalysis: {
      status: burnStatus,
      title: 'Burn Rate Analysis',
      weeklyBurn: formatCompact(netBurn, currency),
      summary: `Monthly expenses: ${formatCompact(burnRate, currency)}. Monthly income: ${formatCompact(monthlyIncome, currency)}. Net burn after income: ${formatCompact(netBurn, currency)}.`,
      detail: runway !== null && runway !== undefined
        ? `Estimated runway: ${runway.toFixed(1)} months with ${formatCompact(currentBalance, currency)} in current balance.`
        : `Income is covering expenses. Current balance is ${formatCompact(currentBalance, currency)}.`,
    },
    budgetAnalysis: {
      status: budgetStatus,
      title: 'Budget Position',
      primary: data.budget?.exceededAmount > 0 ? formatCompact(data.budget.exceededAmount, currency) : formatCompact(data.budget?.remainingBudget || 0, currency),
      summary: data.budget?.initialBudget
        ? `Initial budget: ${formatCompact(data.budget.initialBudget, currency)}. Tracked spend: ${formatCompact(data.budget.trackedSpend || 0, currency)}.`
        : 'No initial budget is configured for this project yet.',
      detail: data.budget?.initialBudget
        ? data.budget?.exceededAmount > 0
          ? `Budget exceeded by ${formatCompact(data.budget.exceededAmount, currency)}.`
          : `Remaining budget: ${formatCompact(data.budget.remainingBudget || 0, currency)}${budgetUtilization !== null ? ` • ${budgetUtilization.toFixed(1)}% utilized` : ''}.`
        : 'Set an initial project budget to unlock utilization tracking.',
    },
    spendingWarnings: {
      status: spendingStatus,
      title: 'Spending Warnings',
      items: data.warnings?.length ? data.warnings : ['No critical warnings detected this period.'],
    },
    stuckTasks: {
      status: taskStatus,
      title: 'Execution Risks',
      items: [
        `${completed} of ${total} tasks completed across the board.${overdue ? ` ${overdue} overdue.` : ''}`,
        dueSoon ? `${dueSoon} task${dueSoon === 1 ? '' : 's'} due within the next 72 hours.` : 'No immediate deadline cluster detected.',
        highPriorityOpen ? `${highPriorityOpen} high-priority task${highPriorityOpen === 1 ? '' : 's'} remain open.` : 'No high-priority backlog is building.',
        ...(data.taskCompletion?.overdueTitles?.length ? data.taskCompletion.overdueTitles.map((title) => `Overdue: ${title}`) : []),
      ],
    },
    strategicInsights: {
      status: strategyStatus,
      title: 'Strategic Insights',
      items: data.recommendations?.length ? data.recommendations : ['No recommendations at this time.'],
    },
    marketingSignal: {
      status: marketingStatus,
      title: 'Marketing Pressure',
      primary: formatCompact(data.marketingSignal?.spend || 0, currency),
      summary: data.marketingSignal?.summary || 'No marketing signal available.',
      detail: data.marketingSignal?.detail || 'Marketing pressure analysis will appear here.',
    },
    onboardingAnalysis: {
      status: onboardingStatus,
      title: 'Onboarding Direction',
      summary: data.onboardingAnalysis?.summary || 'No onboarding analysis available.',
      detail: data.onboardingAnalysis?.detail || 'Onboarding direction analysis will appear here.',
    },
    workRelevance: {
      status: workRelevanceStatus,
      title: 'Work Relevance',
      primary: `${data.workRelevance?.score || 100}/100`,
      summary: data.workRelevance?.summary || 'No work relevance analysis available.',
      detail: data.workRelevance?.detail || 'Work relevance analysis will appear here.',
    },
    riskNarrative: {
      whatWentWrong: data.riskNarrative?.whatWentWrong || [],
      whatBreaksNext: data.riskNarrative?.whatBreaksNext || [],
    },
    breakdowns: {
      topCategories: (data.spendingBreakdown?.topCategories || []).map((item) => ({
        label: item.label,
        value: formatCompact(item.value, currency),
      })),
      topVendors: (data.spendingBreakdown?.topVendors || []).map((item) => ({
        label: item.label,
        value: formatCompact(item.value, currency),
      })),
      topClients: (data.incomeBreakdown?.topClients || []).map((item) => ({
        label: item.label,
        value: formatCompact(item.value, currency),
      })),
      vendorRecovery: (data.vendorRecovery || []).map((item) => ({
        label: item.label,
        value: item.recoveryMonths !== null ? `${formatCompact(item.value, currency)} • ~${item.recoveryMonths} mo recovery` : `${formatCompact(item.value, currency)} • no recovery signal`,
      })),
      largestExpense: data.spendingBreakdown?.largestExpense
        ? `${data.spendingBreakdown.largestExpense.label} • ${formatCompact(data.spendingBreakdown.largestExpense.amount, currency)}`
        : null,
      largestIncome: data.incomeBreakdown?.largestIncome
        ? `${data.incomeBreakdown.largestIncome.label} • ${formatCompact(data.incomeBreakdown.largestIncome.amount, currency)}`
        : null,
    },
  }
}

export async function getWeeklyInsights(projectName) {
  try {
    const { data } = await insightsApi.get('/insights/weekly', {
      params: projectName ? { projectName } : {},
    })

    return data
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function getProjectInsights(projectId, currency = 'USD') {
  try {
    const { data } = await insightsApi.get(`/insights/${projectId}`)
    return adaptProjectInsights(data, currency)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}