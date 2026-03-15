import { useMemo, useState } from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import { getRecordActorName } from '../services/api'
import { createIncome, formatIncomeAmount, getIncomeForProject, incomeSources } from '../services/income'

const initialFormData = {
  amount: '',
  source: 'consulting',
  client: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}

export default function IncomeTrackerSection({ incomeEntries, isLoadingData, onSelectProject, projects, selectedProject, setIncomeEntries }) {
  const { currency } = useCurrency()
  const canManageIncome = selectedProject?.currentUserRole !== 'viewer'

  const firmName = selectedProject?.firmName || ''

  function isSelfFunded(entry) {
    if (entry.source === 'self_funding') return true
    if (!firmName) return false
    return entry.client.toLowerCase().includes(firmName.toLowerCase())
  }
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const projectIncome = useMemo(() => getIncomeForProject(incomeEntries, selectedProject?.id), [incomeEntries, selectedProject?.id])

  const currentMonthIncome = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)

    return projectIncome
      .filter((incomeEntry) => !isSelfFunded(incomeEntry) && incomeEntry.date.startsWith(currentMonth))
      .reduce((total, incomeEntry) => total + incomeEntry.amount, 0)
  }, [projectIncome])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedProject || !canManageIncome) return

    setIsSubmitting(true)
    setFormError('')

    try {
      const newIncome = await createIncome({
        ...formData,
        projectId: selectedProject.id,
      })
      setIncomeEntries((current) => [newIncome, ...current])
      setFormData({
        ...initialFormData,
        source: formData.source,
        date: new Date().toISOString().slice(0, 10),
      })
    } catch (submitError) {
      setFormError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <section className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-6 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Income</p>
          <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.15rem]">Select a startup first</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Income is tracked per startup. Choose a project to log revenue and keep financial reporting tied to the right company.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.length ? (
            projects.map((project) => (
              <button
                className="rounded-[1.5rem] border border-[#e8edf7] bg-[linear-gradient(180deg,#f7f9ff_0%,#ffffff_100%)] p-6 text-left shadow-[0_10px_24px_rgba(148,163,184,0.10)] transition hover:border-[#dfe8ff] hover:bg-white"
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                type="button"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Startup</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">{project.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{project.description}</p>
              </button>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#dfe8ff] bg-white/95 p-8 text-sm text-slate-500 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
              Create a project in the Projects section before tracking income.
            </div>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.45rem] border border-[#dfe8ff] bg-[linear-gradient(180deg,#edf4ff_0%,#f9fbff_100%)] p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Selected startup</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">{selectedProject.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{selectedProject.description}</p>
        </article>

        <article className="rounded-[1.45rem] border border-[#ffe7dc] bg-[linear-gradient(180deg,#fff3ec_0%,#fffaf7_100%)] p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Logged income</p>
          <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-slate-950">{projectIncome.length}</p>
          <p className="mt-2 text-sm text-slate-500">Total income entries for this startup.</p>
        </article>

        <article className="rounded-[1.45rem] border border-[#e8ddff] bg-[linear-gradient(180deg,#f4efff_0%,#fbf9ff_100%)] p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Current month income</p>
          <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-slate-950">{formatIncomeAmount(currentMonthIncome, currency)}</p>
          <p className="mt-2 text-sm text-slate-500">Tracked revenue dated in the current month.</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Add income</p>
            <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.03em] text-slate-950">{canManageIncome ? 'Track incoming revenue' : 'Read-only income access'}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {canManageIncome
                ? `Record each income event for ${selectedProject.name} so monthly revenue, net burn, and trend lines stay grounded in real entries.`
                : `You have viewer access on ${selectedProject.name}. Income data is visible, but only owners and editors can add new entries.`}
            </p>
          </div>

          {canManageIncome ? <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Amount</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                min="0"
                name="amount"
                onChange={handleChange}
                placeholder="4200.00"
                required
                step="0.01"
                type="number"
                value={formData.amount}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Source</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  name="source"
                  onChange={handleChange}
                  value={formData.source}
                >
                  {incomeSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Client</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  name="client"
                  onChange={handleChange}
                  placeholder="Acme Ventures"
                  required
                  value={formData.client}
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Date</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                name="date"
                onChange={handleChange}
                required
                type="date"
                value={formData.date}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Notes</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                name="notes"
                onChange={handleChange}
                placeholder="Quarterly consulting retainer received"
                value={formData.notes}
              />
            </label>

            <button
              className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Saving…' : 'Add income'}
            </button>
            {formError ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p>
            ) : null}
          </form> : <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-200 bg-[#fafafa] px-5 py-8 text-sm text-slate-500">This project is read-only for your account. Ask the owner to switch your role to editor if you need to log revenue.</div>}
        </article>

        <article className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Income table</p>
            <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.03em] text-slate-950">Income</h2>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.35rem] border border-[#e8edf7]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#eef1f7]">
                <thead className="bg-[#f7f9ff]">
                  <tr>
                    {['Date', 'Source', 'Client', 'Amount'].map((column) => (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-slate-400" key={column} scope="col">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f7] bg-white">
                  {projectIncome.length ? (
                    projectIncome.map((incomeEntry) => (
                      <tr key={incomeEntry.id}>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                          {new Date(incomeEntry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm capitalize">
                          {isSelfFunded(incomeEntry) ? (
                            <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">Self-funded</span>
                          ) : (
                            <span className="text-slate-500">{incomeEntry.source}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-950">
                          <div className="space-y-1">
                            <p className="whitespace-nowrap font-medium">{incomeEntry.client}</p>
                            {getRecordActorName(incomeEntry) ? (
                              <span className="inline-flex rounded-full border border-slate-200 bg-[#f9fafb] px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                Added by {getRecordActorName(incomeEntry)}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">{formatIncomeAmount(incomeEntry.amount, currency)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan="4">
                        No income entries logged yet for this startup.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}