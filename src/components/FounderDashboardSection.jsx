import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import { useCurrency } from '../contexts/CurrencyContext'
import { buildFounderDashboardData } from '../services/founderDashboard'

ChartJS.register(
  ArcElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
)

const chartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        boxWidth: 12,
        color: '#64748b',
        usePointStyle: true,
      },
    },
  },
  scales: {
    x: {
      border: { display: false },
      grid: { display: false },
      ticks: { color: '#94a3b8' },
    },
    y: {
      border: { display: false },
      grid: { color: '#e2e8f0' },
      ticks: {
        color: '#94a3b8',
        callback: (value) => `$${Number(value) / 1000}k`,
      },
    },
  },
}

const doughnutOptions = {
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
        color: '#64748b',
        usePointStyle: true,
      },
    },
  },
}

function WidgetCard({ hint, label, value }) {
  return (
    <article className="rounded-[1.75rem] border border-slate-100 bg-gradient-to-br from-white via-[#f9fafb] to-[#eef2ff] p-5 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{hint}</p>
    </article>
  )
}

function BudgetMetricCard({ hint, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-gradient-to-br from-white via-[#fef3c7] to-[#fffbeb] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  )
}

function SignalCard({ detail, label, status, summary }) {
  const styles = {
    green: 'border-emerald-100 bg-emerald-50/60 text-emerald-700',
    yellow: 'border-amber-100 bg-amber-50/70 text-amber-700',
    red: 'border-rose-100 bg-rose-50/80 text-rose-700',
  }

  return (
    <article className="rounded-[1.75rem] border border-slate-100 bg-white/90 p-5 shadow-[0_16px_35px_rgba(148,163,184,0.16)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Signal</p>
        <span className={[
          'rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
          styles[status] || styles.yellow,
        ].join(' ')}>
          {status}
        </span>
      </div>
      <h3 className="mt-3 text-2xl font-semibold text-slate-950">{label}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{summary}</p>
      <p className="mt-3 text-sm leading-7 text-slate-500">{detail}</p>
    </article>
  )
}

function SnapshotCard({ snapshots }) {
  return (
    <article className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Monthly view</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">All expenses per month</h3>
        </div>
        <span className="rounded-full border border-slate-100 bg-[#f9fafb] px-3 py-1 text-xs font-medium text-slate-700">
          6 months
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {snapshots.map((snapshot) => (
          <div className="grid grid-cols-[72px_1fr_1fr_1fr] items-center gap-3 rounded-[1.2rem] border border-slate-100 bg-[#f9fafb] px-4 py-3 text-sm" key={snapshot.label}>
            <span className="font-medium text-slate-900">{snapshot.label}</span>
            <span className="text-slate-500">Income {snapshot.income}</span>
            <span className="text-slate-500">Spend {snapshot.expenses}</span>
            <span className={snapshot.status === 'covered' ? 'font-medium text-emerald-700' : 'font-medium text-rose-700'}>
              {snapshot.net}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}

function VendorRecoveryCard({ items }) {
  return (
    <article className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Cost breakdown</p>
      <h3 className="mt-2 text-2xl font-semibold text-slate-950">Vendor recovery pressure</h3>
      <div className="mt-6 space-y-3">
        {items.length ? items.map((item) => (
          <div className="rounded-[1.3rem] border border-slate-100 bg-[#f9fafb] px-4 py-4" key={item.name}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-950">{item.name}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{item.meta}</p>
              </div>
              <strong className="text-sm font-semibold text-slate-950">{item.amount}</strong>
            </div>
          </div>
        )) : (
          <div className="rounded-[1.3rem] border border-dashed border-slate-200 bg-[#f9fafb] px-4 py-8 text-sm text-slate-500">
            Vendor-level cost pressure appears here once spending data is logged.
          </div>
        )}
      </div>
    </article>
  )
}

function ActivityCard({ emptyMessage, items, title, type }) {
  return (
    <article className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Card</p>
      <h3 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h3>
      <div className="mt-6 space-y-4">
        {items.length ? items.map((item) => (
          <div className="rounded-[1.35rem] border border-slate-100 bg-[#f9fafb] px-4 py-4" key={item.title || item.name}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-950">{item.title || item.name}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail || item.meta || item.owner}</p>
              </div>
              {type === 'money' ? (
                <strong className="text-sm font-semibold text-slate-950">{item.amount}</strong>
              ) : type === 'tasks' ? (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-700">
                  {item.priority}
                </span>
              ) : null}
            </div>
          </div>
        )) : (
          <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-[#f9fafb] px-4 py-6 text-sm text-slate-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </article>
  )
}

function ChartEmptyState({ message, title }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-[#f9fafb] px-6 text-center text-sm leading-7 text-slate-500">
      <div>
        <p className="font-medium text-slate-700">{title}</p>
        <p className="mt-2">{message}</p>
      </div>
    </div>
  )
}

export default function FounderDashboardSection({ expenses, incomeEntries, projects, selectedProject, tasks }) {
  const { currency } = useCurrency()

  if (!projects.length) {
    return (
      <section className="rounded-[2rem] border border-slate-100 bg-white/90 p-8 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Founder dashboard</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">No project data yet.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          Create your first project to unlock portfolio metrics, recent activity, runway tracking, and execution visibility.
        </p>
      </section>
    )
  }

  const dashboard = buildFounderDashboardData(selectedProject, projects, expenses, incomeEntries, tasks, currency)

  const lineData = {
    labels: dashboard.lineChart.labels,
    datasets: [
      {
        label: 'Income',
        data: dashboard.lineChart.incomeSeries,
        borderColor: '#0f172a',
        backgroundColor: 'rgba(15, 23, 42, 0.06)',
        pointBackgroundColor: '#0f172a',
        pointBorderWidth: 0,
        tension: 0.35,
        fill: false,
      },
      {
        label: 'Expenses',
        data: dashboard.lineChart.expenseSeries,
        borderColor: '#94a3b8',
        backgroundColor: 'rgba(148, 163, 184, 0.10)',
        pointBackgroundColor: '#94a3b8',
        pointBorderWidth: 0,
        tension: 0.35,
        fill: false,
      },
    ],
  }

  const doughnutData = {
    labels: dashboard.expenseCategories.map((item) => item.label),
    datasets: [
      {
        data: dashboard.expenseCategories.map((item) => item.value),
        backgroundColor: ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1'],
        borderColor: '#ffffff',
        borderWidth: 6,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2.3rem] border border-slate-100 bg-gradient-to-r from-[#eef2ff] via-white to-[#fef3c7] p-6 text-slate-900 shadow-[0_24px_70px_rgba(148,163,184,0.28)] lg:p-8">
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#e0f2fe]/50 blur-3xl" />
          <div className="absolute bottom-[-4rem] left-24 h-40 w-40 rounded-full bg-[#fee2e2]/60 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Founder dashboard</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-[3rem]">
              {selectedProject ? `${dashboard.focus.name} financial cockpit.` : "Portfolio financial cockpit."}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{dashboard.focus.description}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.45rem] border border-white/70 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Right track</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{dashboard.healthSummary.rightTrackScore}%</p>
              </div>
              <div className="rounded-[1.45rem] border border-white/70 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Refill rate</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{dashboard.healthSummary.refillRate}%</p>
              </div>
              <div className="rounded-[1.45rem] border border-white/70 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">On-time rate</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{dashboard.healthSummary.onTimeRate}%</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-[1.65rem] border border-white/70 bg-white/90 px-5 py-5 shadow-sm backdrop-blur-sm lg:min-w-[18rem]">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Current focus</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{dashboard.focus.name}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              A tighter view for finance, activity, and operating risk across the selected scope.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
        {dashboard.widgets.map((widget) => (
          <WidgetCard hint={widget.hint} key={widget.label} label={widget.label} value={widget.value} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <SignalCard
          detail={dashboard.marketingSpend.hint}
          label="Marketing Pressure"
          status={dashboard.marketingSpend.raw === 0 ? 'green' : dashboard.healthSummary.refillRate < 100 ? 'red' : 'yellow'}
          summary={`${dashboard.marketingSpend.total} of marketing spend is currently being carried by the business.`}
        />
        <SignalCard
          detail={dashboard.onboardingDirection.detail}
          label={dashboard.onboardingDirection.title}
          status={dashboard.onboardingDirection.status}
          summary={dashboard.onboardingDirection.summary}
        />
        <SignalCard
          detail={dashboard.workRelevance.detail}
          label={dashboard.workRelevance.title}
          status={dashboard.workRelevance.status}
          summary={dashboard.workRelevance.summary}
        />
      </section>

      <section className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Budget report</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Initial budget vs tracked spend</h3>
          </div>
          <p className="text-sm text-slate-500">
            {dashboard.budgetReport.hasBudget
              ? 'Leftover fund and overrun are calculated from the initial project budget.'
              : 'Set an initial budget in the project to unlock leftover and exceeded reporting.'}
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BudgetMetricCard
            hint="Configured opening budget for the current scope"
            label="Initial budget"
            value={dashboard.budgetReport.initialBudget}
          />
          <BudgetMetricCard
            hint="Total expenses logged so far"
            label="Tracked spend"
            value={dashboard.budgetReport.trackedSpend}
          />
          <BudgetMetricCard
            hint={dashboard.budgetReport.hasBudget ? 'Budget still available before you hit the cap' : 'Requires an initial budget to calculate'}
            label="Leftover fund"
            value={dashboard.budgetReport.leftoverFund}
          />
          <BudgetMetricCard
            hint={dashboard.budgetReport.hasBudget ? 'Amount spent above the initial budget' : 'Requires an initial budget to calculate'}
            label="Exceeded by"
            value={dashboard.budgetReport.exceededAmount}
          />
          <BudgetMetricCard
            hint="How much of the budget is already consumed"
            label="Utilization"
            value={dashboard.budgetReport.utilization}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Charts</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Expense and refill trend</h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-[#fafafa] px-3 py-1 text-xs font-medium text-slate-700">
              6 months
            </span>
          </div>
          <div className="mt-6 h-[320px]">
            {dashboard.hasFinancialData ? (
              <Line data={lineData} options={chartOptions} />
            ) : (
              <ChartEmptyState message="Add income or expense entries to populate the six-month trend chart." title="No financial trend data yet" />
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Charts</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Cost breakdown by category</h3>
          </div>
          <div className="mt-6 h-[320px]">
            {dashboard.expenseCategories.length ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <ChartEmptyState message="Expense categories appear here after you log project spending." title="No expense categories yet" />
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SnapshotCard snapshots={dashboard.monthlySnapshots} />
        <VendorRecoveryCard items={dashboard.vendorCostBreakdown} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-4">
        <ActivityCard emptyMessage="No high-priority tasks are visible yet." items={dashboard.highPriorityTasks} title="Tasks on the edge" type="tasks" />
        <ActivityCard emptyMessage="No stuck-task guidance yet." items={dashboard.stuckTaskGuidance} title="Stuck tasks" type="alerts" />
        <ActivityCard emptyMessage="No founder alerts yet." items={dashboard.founderAlerts} title="What can go wrong next" type="alerts" />
        <ActivityCard emptyMessage="No income has been logged for this scope yet." items={dashboard.recentIncome} title="Recent refill sources" type="money" />
      </section>
    </div>
  )
}