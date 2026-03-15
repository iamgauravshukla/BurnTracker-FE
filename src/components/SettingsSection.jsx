import { useState } from 'react'
import { changePassword } from '../services/auth'
import { useCurrency } from '../contexts/CurrencyContext'
import { CURRENCIES } from '../services/currency'
import { deleteProject } from '../services/projects'

function SettingsSurface({ children, className = '' }) {
  return (
    <section className={[
      'rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm lg:p-6',
      className,
    ].join(' ')}>
      {children}
    </section>
  )
}

function SettingsMetric({ hint, label, value }) {
  return (
    <article className="rounded-[1.35rem] border border-[#dfe8ff] bg-[linear-gradient(180deg,#edf4ff_0%,#f9fbff_100%)] p-5 shadow-[0_8px_18px_rgba(148,163,184,0.08)]">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{hint}</p>
    </article>
  )
}

export default function SettingsSection({ projects = [], setProjects }) {
  const { currency, setCurrency } = useCurrency()

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const [deleteTargetId, setDeleteTargetId] = useState('')
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')
  const [isDeletingProject, setIsDeletingProject] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const deleteTarget = projects.find((p) => p.id === deleteTargetId) || null

  function openDeleteModal(projectId) {
    setDeleteTargetId(projectId)
    setDeleteConfirmInput('')
    setDeleteError('')
  }

  function closeDeleteModal() {
    setDeleteTargetId('')
    setDeleteConfirmInput('')
    setDeleteError('')
  }

  async function handleDeleteProject(event) {
    event.preventDefault()
    if (!deleteTarget) return
    if (deleteConfirmInput !== deleteTarget.name) {
      setDeleteError('Project name does not match. Please type it exactly.')
      return
    }
    setIsDeletingProject(true)
    setDeleteError('')
    try {
      await deleteProject(deleteTarget.id)
      if (setProjects) setProjects((current) => current.filter((p) => p.id !== deleteTarget.id))
      closeDeleteModal()
    } catch (error) {
      setDeleteError(error.message)
    } finally {
      setIsDeletingProject(false)
    }
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target
    setPasswordForm((current) => ({ ...current, [name]: value }))
    setPasswordError('')
    setPasswordSuccess('')
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    setIsChangingPassword(true)

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordSuccess('Password updated successfully.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setPasswordError(error.message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const selectedCurrencyInfo = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]
  const passwordState = passwordSuccess ? 'Updated' : 'Protected'

  return (
    <div className="space-y-6">
      <SettingsSurface>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Settings</p>
        <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.15rem]">Workspace settings</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          Manage your display currency and account security from here. Changes take effect immediately.
        </p>
      </SettingsSurface>

      <section className="grid gap-4 md:grid-cols-3">
        <SettingsMetric hint="Formatting applied across dashboard, expenses, income, and insights." label="Active currency" value={currency} />
        <SettingsMetric hint="Projects currently available for tracking, reporting, and analysis." label="Tracked projects" value={String(projects.length)} />
        <SettingsMetric hint="Your account credentials are protected and can be updated below." label="Security" value={passwordState} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <SettingsSurface>
            <div className="max-w-lg">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Display currency</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Currency preference</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                All monetary values in expenses, income, and dashboard widgets will be formatted in your chosen currency. Stored amounts are not converted.
              </p>

              <div className="mt-6 space-y-3">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Select currency</span>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                    onChange={(event) => setCurrency(event.target.value)}
                    value={currency}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#e8edf7] bg-[linear-gradient(90deg,#f3f6ff_0%,#fff8ef_100%)] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Active format</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(12500)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Applied instantly across the workspace</p>
                  </div>
                  <div className="rounded-2xl border border-[#e8edf7] bg-[#f7f9ff] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Selection</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{selectedCurrencyInfo.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{selectedCurrencyInfo.symbol} · {currency}</p>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSurface>

          <SettingsSurface>
            <div className="max-w-lg">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Security</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Change password</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Enter your current password to verify your identity, then choose a new password of at least 8 characters.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Current password</span>
                  <input
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                    name="currentPassword"
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    required
                    type="password"
                    value={passwordForm.currentPassword}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">New password</span>
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                    minLength={8}
                    name="newPassword"
                    onChange={handlePasswordChange}
                    placeholder="At least 8 characters"
                    required
                    type="password"
                    value={passwordForm.newPassword}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Confirm new password</span>
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                    name="confirmPassword"
                    onChange={handlePasswordChange}
                    placeholder="Re-enter your new password"
                    required
                    type="password"
                    value={passwordForm.confirmPassword}
                  />
                </label>

                {passwordError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{passwordError}</div>
                ) : null}

                {passwordSuccess ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordSuccess}</div>
                ) : null}

                <button
                  className="rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isChangingPassword}
                  type="submit"
                >
                  {isChangingPassword ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </div>
          </SettingsSurface>
        </div>

        <SettingsSurface className="border-rose-100">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Project administration</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">Manage tracked startups</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Review the projects available in your workspace. Deleting a project permanently removes all linked expenses, income, tasks, and documents.
            </p>

            {projects.length ? (
              <div className="mt-6 space-y-3">
                {projects.map((project) => (
                  <div className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-[#e8edf7] bg-[#f7f9ff] px-4 py-4" key={project.id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">{project.name}</p>
                      {project.description ? (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-400">{project.description}</p>
                      ) : null}
                    </div>
                    <button
                      className="flex-shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                      onClick={() => openDeleteModal(project.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.35rem] border border-dashed border-[#dfe8ff] bg-[#f7f9ff] px-4 py-8 text-sm text-slate-500">
                No projects yet.
              </div>
            )}
          </div>
        </SettingsSurface>
      </section>

      {/* Delete confirmation modal */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/18 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.7rem] border border-[#edf0f6] bg-white/98 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.16)]">
            <p className="text-xs uppercase tracking-[0.22em] text-rose-500">Permanent action</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">Delete &ldquo;{deleteTarget.name}&rdquo;?</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              This will permanently delete the project along with all its expenses, income entries, and tasks. Type the project name to confirm.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleDeleteProject}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Type <strong>{deleteTarget.name}</strong> to confirm
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  onChange={(e) => { setDeleteConfirmInput(e.target.value); setDeleteError('') }}
                  placeholder={deleteTarget.name}
                  value={deleteConfirmInput}
                />
              </label>

              {deleteError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{deleteError}</div>
              ) : null}

              <div className="flex gap-3 pt-1">
                <button
                  className="flex-1 rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-white"
                  onClick={closeDeleteModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 rounded-2xl bg-rose-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isDeletingProject || deleteConfirmInput !== deleteTarget.name}
                  type="submit"
                >
                  {isDeletingProject ? 'Deleting…' : 'Delete project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

    </div>
  )
}
