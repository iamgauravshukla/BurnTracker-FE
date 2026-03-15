import { useEffect, useMemo, useState } from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import { getRecordActorName } from '../services/api'
import {
  createExpense,
  deleteExpense,
  expenseCategories,
  formatExpenseAmount,
  getExpenseMonths,
  getExpensesForProject,
  normalizeExpenseDepartment,
  updateExpense,
} from '../services/expenses'

const initialFormData = {
  amount: '',
  category: 'development',
  department: 'Regular',
  vendor: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}

const initialFilters = {
  month: 'all',
  category: 'all',
  vendor: '',
}

export default function ExpenseTrackerSection({ expenses, isLoadingData, onSelectProject, projects, selectedProject, setExpenses }) {
  const { currency } = useCurrency()
  const canManageExpenses = selectedProject?.currentUserRole !== 'viewer'
  const [formData, setFormData] = useState(initialFormData)
  const [filters, setFilters] = useState(initialFilters)
  const [editingExpenseId, setEditingExpenseId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      date: new Date().toISOString().slice(0, 10),
    }))
    setEditingExpenseId('')
  }, [selectedProject?.id])

  const projectExpenses = useMemo(() => getExpensesForProject(expenses, selectedProject?.id), [expenses, selectedProject?.id])

  const availableMonths = useMemo(() => getExpenseMonths(projectExpenses), [projectExpenses])

  const currentMonthSpend = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)

    return projectExpenses
      .filter((expense) => expense.date.startsWith(currentMonth))
      .reduce((total, expense) => total + expense.amount, 0)
  }, [projectExpenses])

  const filteredExpenses = useMemo(() => {
    return projectExpenses.filter((expense) => {
      const matchesMonth = filters.month === 'all' || expense.date.startsWith(filters.month)
      const matchesCategory = filters.category === 'all' || expense.category === filters.category
      const matchesVendor =
        !filters.vendor || expense.vendor.toLowerCase().includes(filters.vendor.trim().toLowerCase())

      return matchesMonth && matchesCategory && matchesVendor
    })
  }, [filters, projectExpenses])

  function handleFormChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedProject || !canManageExpenses) return

    setIsSubmitting(true)
    setFormError('')

    try {
      if (editingExpenseId) {
        const updatedExpense = await updateExpense(editingExpenseId, {
          ...formData,
          projectId: selectedProject.id,
        })
        setExpenses((current) => current.map((expense) => (expense.id === editingExpenseId ? updatedExpense : expense)))
      } else {
        const newExpense = await createExpense({
          ...formData,
          projectId: selectedProject.id,
        })
        setExpenses((current) => [newExpense, ...current])
      }

      setFormData((current) => ({
        ...initialFormData,
        category: current.category,
        date: new Date().toISOString().slice(0, 10),
      }))
      setEditingExpenseId('')
    } catch (submitError) {
      setFormError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEdit(expense) {
    if (!canManageExpenses) return
    setEditingExpenseId(expense.id)
    setFormError('')
    setFormData({
      amount: String(expense.amount),
      category: expense.category,
      department: normalizeExpenseDepartment(expense.department),
      vendor: expense.vendor || '',
      date: expense.date ? expense.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: expense.notes || '',
    })
  }

  async function handleDelete(expenseId) {
    if (!canManageExpenses) return
    if (!window.confirm('Delete this expense?')) return

    try {
      await deleteExpense(expenseId)
      setExpenses((current) => current.filter((expense) => expense.id !== expenseId))

      if (editingExpenseId === expenseId) {
        setEditingExpenseId('')
        setFormData(initialFormData)
      }
    } catch (deleteError) {
      setFormError(deleteError.message)
    }
  }

  function handleCancelEdit() {
    setEditingExpenseId('')
    setFormError('')
    setFormData({
      ...initialFormData,
      date: new Date().toISOString().slice(0, 10),
    })
  }

  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <section className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-6 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Expenses</p>
          <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.15rem]">Select a startup first</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Expenses are tracked per startup. Open a project to add, edit, and analyze spending for that specific company.
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
              Create a project in the Projects section before tracking expenses.
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
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Logged expenses</p>
          <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-slate-950">{projectExpenses.length}</p>
          <p className="mt-2 text-sm text-slate-500">Total expense entries for this startup.</p>
        </article>

        <article className="rounded-[1.45rem] border border-[#e8ddff] bg-[linear-gradient(180deg,#f4efff_0%,#fbf9ff_100%)] p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Current month spend</p>
          <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-slate-950">{formatExpenseAmount(currentMonthSpend, currency)}</p>
          <p className="mt-2 text-sm text-slate-500">Tracked expenses dated in the current month.</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{editingExpenseId ? 'Edit expense' : 'Add expense'}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
              {canManageExpenses ? (editingExpenseId ? 'Update expense entry' : 'Track operating spend') : 'Read-only expense access'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {canManageExpenses
                ? `Record every expense against ${selectedProject.name} so dashboards, burn tracking, and runway stay current.`
                : `You have viewer access on ${selectedProject.name}. Expense history is visible, but only owners and editors can change it.`}
            </p>
          </div>

          {canManageExpenses ? <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Amount</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                min="0"
                name="amount"
                onChange={handleFormChange}
                placeholder="1250.00"
                required
                step="0.01"
                type="number"
                value={formData.amount}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Category</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  name="category"
                  onChange={handleFormChange}
                  value={formData.category}
                >
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Department</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  name="department"
                  onChange={handleFormChange}
                  placeholder="Engineering"
                  required
                  value={formData.department}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Vendor</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  name="vendor"
                  onChange={handleFormChange}
                  placeholder="AWS"
                  required
                  value={formData.vendor}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Date</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  name="date"
                  onChange={handleFormChange}
                  required
                  type="date"
                  value={formData.date}
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Notes</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                name="notes"
                onChange={handleFormChange}
                placeholder="Monthly infrastructure bill for staging and production clusters"
                value={formData.notes}
              />
            </label>

            <div className="flex gap-3">
              <button
                className="flex-1 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Saving…' : editingExpenseId ? 'Save changes' : 'Add expense'}
              </button>
              {editingExpenseId ? (
                <button
                  className="rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={handleCancelEdit}
                  type="button"
                >
                  Cancel
                </button>
              ) : null}
            </div>
            {formError ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p>
            ) : null}
          </form> : <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-200 bg-[#fafafa] px-5 py-8 text-sm text-slate-500">This project is read-only for your account. Ask the owner to upgrade your role to editor if you need to log or update expenses.</div>}
        </article>

        <article className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Expense table</p>
              <h2 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.03em] text-slate-950">Expenses</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Month</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  name="month"
                  onChange={handleFilterChange}
                  value={filters.month}
                >
                  <option value="all">All months</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Category</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  name="category"
                  onChange={handleFilterChange}
                  value={filters.category}
                >
                  <option value="all">All categories</option>
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Vendor</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  name="vendor"
                  onChange={handleFilterChange}
                  placeholder="Search vendor"
                  value={filters.vendor}
                />
              </label>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.35rem] border border-[#e8edf7]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#eef1f7]">
                <thead className="bg-[#f7f9ff]">
                  <tr>
                    {['Date', 'Vendor', 'Category', 'Department', 'Amount', ...(canManageExpenses ? ['Actions'] : [])].map((column) => (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-slate-400" key={column} scope="col">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef1f7] bg-white">
                  {filteredExpenses.length ? (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                          {new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-950">
                          <div className="space-y-1">
                            <p className="whitespace-nowrap font-medium">{expense.vendor}</p>
                            {getRecordActorName(expense) ? (
                              <span className="inline-flex rounded-full border border-slate-200 bg-[#f9fafb] px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                Added by {getRecordActorName(expense)}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500 capitalize">{expense.category}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">{normalizeExpenseDepartment(expense.department)}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-950">{formatExpenseAmount(expense.amount, currency)}</td>
                        {canManageExpenses ? <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                              onClick={() => handleEdit(expense)}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                              onClick={() => handleDelete(expense.id)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </td> : null}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={canManageExpenses ? 6 : 5}>
                        No expenses found for the current filters.
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