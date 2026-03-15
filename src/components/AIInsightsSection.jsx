import { useEffect, useState } from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import { getProjectInsights } from '../services/insights'

const statusStyles = {
  green: {
    accent: 'bg-emerald-500',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    ring: 'ring-emerald-100',
    label: 'Good',
  },
  yellow: {
    accent: 'bg-amber-500',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    ring: 'ring-amber-100',
    label: 'Caution',
  },
  red: {
    accent: 'bg-rose-500',
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    ring: 'ring-rose-100',
    label: 'Risk',
  },
}

function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.yellow

  return (
    <span className={['rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em]', style.badge].join(' ')}>
      {style.label}
    </span>
  )
}

function InsightCard({ children, status, title }) {
  const style = statusStyles[status] || statusStyles.yellow

  return (
    <article className={['rounded-[1.75rem] border border-[#edf0f6] bg-white/95 p-6 shadow-[0_10px_24px_rgba(148,163,184,0.10)] ring-1 backdrop-blur-sm', style.ring].join(' ')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={['h-3 w-3 rounded-full', style.accent].join(' ')} />
          <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-5">{children}</div>
    </article>
  )
}

function OverviewMetric({ hint, label, value }) {
  return (
    <article className="rounded-[1.3rem] border border-[#e8edf7] bg-[linear-gradient(180deg,#f7f9ff_0%,#ffffff_100%)] px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.08)] backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </article>
  )
}

function BreakdownList({ emptyMessage, items, title }) {
  return (
    <article className="rounded-[1.75rem] border border-[#edf0f6] bg-white/95 p-6 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Breakdown</p>
      <h3 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h3>
      <div className="mt-5 space-y-3">
        {items.length ? items.map((item) => (
          <div className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-[#e8edf7] bg-[#f7f9ff] px-4 py-4" key={`${title}-${item.label}`}>
            <span className="text-sm font-medium text-slate-900">{item.label}</span>
            <span className="text-sm text-slate-500">{item.value}</span>
          </div>
        )) : (
          <div className="rounded-[1.3rem] border border-dashed border-slate-200 bg-[#f9fafb] px-4 py-8 text-sm text-slate-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </article>
  )
}

export default function AIInsightsSection({ projects, selectedProject }) {
  const { currency } = useCurrency()
  const [insights, setInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadInsights() {
      if (!selectedProject?.id) {
        setInsights(null)
        setError('')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const data = await getProjectInsights(selectedProject.id, currency)

        if (!cancelled) {
          setInsights(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadInsights()

    return () => {
      cancelled = true
    }
  }, [currency, selectedProject?.id])

  return (
    <div className="space-y-6">
      <section className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">AI Insights</p>
            <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.15rem]">Weekly founder analysis</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              A backend-generated weekly summary covering startup health, burn risk, spending warnings, blocked work, and strategic next steps.
            </p>
            {insights?.summary ? <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{insights.summary}</p> : null}
          </div>

          <div className="rounded-[1.35rem] border border-[#e8edf7] bg-[linear-gradient(90deg,#f3f6ff_0%,#fff8ef_100%)] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Scope</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{selectedProject?.name || 'No project selected'}</p>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!selectedProject ? (
        <section className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-6 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
          <h3 className="text-2xl font-semibold text-slate-950">Project-specific insights only</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            {projects.length
              ? 'Select a project to load insights from its real expenses, income, and task data.'
              : 'Create a project first, then select it to generate insights from its real expenses, income, and task data.'}
          </p>
        </section>
      ) : null}

      {selectedProject && isLoading ? (
        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="h-56 animate-pulse rounded-[1.8rem] border border-[#edf0f6] bg-white/95 shadow-[0_10px_24px_rgba(148,163,184,0.08)]" key={index} />
          ))}
        </section>
      ) : selectedProject && insights ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {insights.overviewMetrics.map((metric) => (
              <OverviewMetric hint={metric.hint} key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <InsightCard status={insights.startupHealthScore.status} title={insights.startupHealthScore.title}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-semibold tracking-tight text-slate-950">{insights.startupHealthScore.score}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{insights.startupHealthScore.summary}</p>
                </div>
                <p className="max-w-[10rem] text-right text-xs uppercase tracking-[0.16em] text-slate-400">
                  {insights.startupHealthScore.detail}
                </p>
              </div>
              {insights.focusAreas?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {insights.focusAreas.map((item) => (
                    <span className="rounded-full border border-[#e8edf7] bg-[#f7f9ff] px-3 py-1 text-xs font-medium text-slate-600" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </InsightCard>

            <InsightCard status={insights.burnRateAnalysis.status} title={insights.burnRateAnalysis.title}>
              <p className="text-[2rem] font-semibold tracking-tight text-slate-950">{insights.burnRateAnalysis.weeklyBurn}</p>
              <p className="mt-3 text-sm leading-7 text-slate-500">{insights.burnRateAnalysis.summary}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{insights.burnRateAnalysis.detail}</p>
            </InsightCard>

            <InsightCard status={insights.budgetAnalysis.status} title={insights.budgetAnalysis.title}>
              <p className="text-[2rem] font-semibold tracking-tight text-slate-950">{insights.budgetAnalysis.primary}</p>
              <p className="mt-3 text-sm leading-7 text-slate-500">{insights.budgetAnalysis.summary}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{insights.budgetAnalysis.detail}</p>
            </InsightCard>

            <InsightCard status={insights.spendingWarnings.status} title={insights.spendingWarnings.title}>
              <div className="space-y-3">
                {insights.spendingWarnings.items.map((item) => (
                  <div className="rounded-[1.2rem] border border-[#e8edf7] bg-[#f7f9ff] px-4 py-4 text-sm leading-6 text-slate-700" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </InsightCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <InsightCard status={insights.marketingSignal.status} title={insights.marketingSignal.title}>
              <p className="text-[2rem] font-semibold tracking-tight text-slate-950">{insights.marketingSignal.primary}</p>
              <p className="mt-3 text-sm leading-7 text-slate-500">{insights.marketingSignal.summary}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{insights.marketingSignal.detail}</p>
            </InsightCard>

            <InsightCard status={insights.onboardingAnalysis.status} title={insights.onboardingAnalysis.title}>
              <p className="text-sm leading-7 text-slate-500">{insights.onboardingAnalysis.summary}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{insights.onboardingAnalysis.detail}</p>
            </InsightCard>

            <InsightCard status={insights.workRelevance.status} title={insights.workRelevance.title}>
              <p className="text-[2rem] font-semibold tracking-tight text-slate-950">{insights.workRelevance.primary}</p>
              <p className="mt-3 text-sm leading-7 text-slate-500">{insights.workRelevance.summary}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{insights.workRelevance.detail}</p>
            </InsightCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <InsightCard status={insights.stuckTasks.status} title={insights.stuckTasks.title}>
              <div className="space-y-3">
                {insights.stuckTasks.items.map((item) => (
                  <div className="rounded-[1.2rem] border border-[#e8edf7] bg-[#f7f9ff] px-4 py-4 text-sm leading-6 text-slate-700" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </InsightCard>

            <InsightCard status={insights.strategicInsights.status} title={insights.strategicInsights.title}>
              <div className="space-y-3">
                {insights.strategicInsights.items.map((item) => (
                  <div className="rounded-[1.2rem] border border-[#e8edf7] bg-[#f7f9ff] px-4 py-4 text-sm leading-6 text-slate-700" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </InsightCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <BreakdownList
              emptyMessage="No explicit failure pattern detected yet."
              items={insights.riskNarrative.whatWentWrong.map((item) => ({ label: item, value: 'Now' }))}
              title="What went wrong"
            />
            <BreakdownList
              emptyMessage="No next-break signal detected yet."
              items={insights.riskNarrative.whatBreaksNext.map((item) => ({ label: item, value: 'Next' }))}
              title="What breaks next"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <BreakdownList emptyMessage="No material expense concentration detected this month." items={insights.breakdowns.topCategories} title="Top spending categories" />
            <BreakdownList emptyMessage="No material income concentration detected this month." items={insights.breakdowns.topClients} title="Top income clients" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <BreakdownList emptyMessage="No vendor concentration detected this month." items={insights.breakdowns.topVendors} title="Top vendors this month" />
            <BreakdownList emptyMessage="No vendor recovery pressure detected yet." items={insights.breakdowns.vendorRecovery} title="Vendor recovery pressure" />
          </section>

          {(insights.breakdowns.largestExpense || insights.breakdowns.largestIncome) ? (
            <section className="grid gap-4 md:grid-cols-2">
              {insights.breakdowns.largestExpense ? (
                <article className="rounded-[1.5rem] border border-[#edf0f6] bg-white/95 p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Largest expense</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{insights.breakdowns.largestExpense}</p>
                </article>
              ) : null}
              {insights.breakdowns.largestIncome ? (
                <article className="rounded-[1.5rem] border border-[#edf0f6] bg-white/95 p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Largest income</p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{insights.breakdowns.largestIncome}</p>
                </article>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  )
}