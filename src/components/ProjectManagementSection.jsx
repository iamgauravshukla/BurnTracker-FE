import { useEffect, useMemo, useState } from 'react'
import { useCurrency } from '../contexts/CurrencyContext'
import {
  calculateRunwayEstimate,
  createProject,
  formatCurrency,
  inviteProjectCollaborator,
  removeProjectCollaborator,
  searchProjectUsers,
  updateProjectCollaboratorRole,
  updateProject,
} from '../services/projects'

const initialFormData = {
  name: '',
  description: '',
  firmName: '',
  totalInvestment: '',
  currentBalance: '',
}

function EditIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function InviteIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19 8v6M16 11h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function OpenIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function TeamIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function ActionButton({ children, onClick, tone = 'secondary' }) {
  const styles =
    tone === 'primary'
      ? 'bg-slate-950 text-white hover:bg-slate-800 shadow-[0_12px_24px_rgba(15,23,42,0.18)]'
      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'

  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
        styles,
      ].join(' ')}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function ShareProjectModal({ onClose, onProjectUpdated, project }) {
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isInvitingUserId, setIsInvitingUserId] = useState('')
  const [isSavingCollaboratorId, setIsSavingCollaboratorId] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!project?.id) {
      return undefined
    }

    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) {
      setMatches([])
      setIsSearching(false)
      return undefined
    }

    let cancelled = false
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true)
      setError('')

      try {
        const users = await searchProjectUsers(project.id, trimmedQuery)
        if (!cancelled) {
          setMatches(users)
        }
      } catch (searchError) {
        if (!cancelled) {
          setError(searchError.message)
          setMatches([])
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false)
        }
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [project?.id, query])

  async function handleInvite(user) {
    setIsInvitingUserId(user.id)
    setError('')

    try {
      const updatedProject = await inviteProjectCollaborator(project.id, { userId: user.id, role: inviteRole })
      onProjectUpdated(updatedProject)
      setQuery('')
      setMatches([])
    } catch (inviteError) {
      setError(inviteError.message)
    } finally {
      setIsInvitingUserId('')
    }
  }

  async function handleRoleChange(collaboratorId, role) {
    setIsSavingCollaboratorId(collaboratorId)
    setError('')

    try {
      const updatedProject = await updateProjectCollaboratorRole(project.id, collaboratorId, role)
      onProjectUpdated(updatedProject)
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setIsSavingCollaboratorId('')
    }
  }

  async function handleRemove(collaboratorId) {
    if (!window.confirm('Remove this collaborator from the project?')) {
      return
    }

    setIsSavingCollaboratorId(collaboratorId)
    setError('')

    try {
      const updatedProject = await removeProjectCollaborator(project.id, collaboratorId)
      onProjectUpdated(updatedProject)
    } catch (removeError) {
      setError(removeError.message)
    } finally {
      setIsSavingCollaboratorId('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/18 px-4 py-10 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-100 bg-white/95 p-8 shadow-[0_28px_80px_rgba(148,163,184,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Project sharing</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950">Invite collaborators to {project.name}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Search existing users by email or name. Added members will see this project in their dashboard the next time they log in.
            </p>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[1.6rem] border border-slate-100 bg-[#fafafa] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Search active users</p>
            <input
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type an email or user name"
              value={query}
            />

            <label className="mt-4 block space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Invite role</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
                onChange={(event) => setInviteRole(event.target.value)}
                value={inviteRole}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>

            <div className="mt-4 space-y-3">
              {isSearching ? <p className="text-sm text-slate-500">Searching users…</p> : null}
              {!isSearching && query.trim().length >= 2 && !matches.length && !error ? (
                <p className="text-sm text-slate-500">No matching active users found.</p>
              ) : null}
              {matches.map((user) => (
                <div className="flex items-center justify-between gap-3 rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3" key={user.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">{user.name || user.email}</p>
                    <p className="truncate text-sm text-slate-500">{user.email}</p>
                  </div>
                  <button
                    className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isInvitingUserId === user.id}
                    onClick={() => handleInvite(user)}
                    type="button"
                  >
                    {isInvitingUserId === user.id ? 'Inviting…' : 'Invite'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(148,163,184,0.12)]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current access</p>
            <div className="mt-4 rounded-[1.3rem] border border-slate-100 bg-[#fafafa] px-4 py-4">
              <p className="text-sm font-semibold text-slate-950">Owner</p>
              <p className="mt-1 text-sm text-slate-600">{project.owner?.name || project.owner?.email || 'Project owner'}</p>
              {project.owner?.email ? <p className="text-sm text-slate-500">{project.owner.email}</p> : null}
            </div>

            <div className="mt-4 space-y-3">
              {(project.collaborators || []).length ? (
                project.collaborators.map((collaborator) => (
                  <div className="rounded-[1.3rem] border border-slate-100 bg-[#fafafa] px-4 py-4" key={collaborator.id || collaborator.email}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950">{collaborator.name || collaborator.email}</p>
                        <p className="mt-1 text-sm text-slate-500">{collaborator.email}</p>
                      </div>
                      <button
                        className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSavingCollaboratorId === collaborator.id}
                        onClick={() => handleRemove(collaborator.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <select
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
                        disabled={isSavingCollaboratorId === collaborator.id}
                        onChange={(event) => handleRoleChange(collaborator.id, event.target.value)}
                        value={collaborator.role || 'editor'}
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <span className="text-xs text-slate-500">
                        {collaborator.role === 'viewer' ? 'Can view dashboards and records only.' : 'Can add and update shared work.'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.3rem] border border-dashed border-slate-200 bg-[#fafafa] px-4 py-8 text-center text-sm text-slate-500">
                  No collaborators added yet.
                </div>
              )}
            </div>
          </section>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}
      </div>
    </div>
  )
}

function EditProjectModal({ onClose, onSave, project }) {
  const [form, setForm] = useState({
    name: project.name || '',
    description: project.description || '',
    firmName: project.firmName || '',
    totalInvestment: project.totalInvestment ?? '',
    currentBalance: project.currentBalance ?? '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setSaveError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setSaveError('')
    try {
      const updated = await updateProject(project.id, form)
      onSave(updated)
    } catch (error) {
      setSaveError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/18 px-4 py-10 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-100 bg-white/95 p-8 shadow-[0_28px_80px_rgba(148,163,184,0.35)]">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Edit project</p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-950">Update startup info</h3>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Project name</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
              name="name"
              onChange={handleChange}
              required
              value={form.name}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
              name="description"
              onChange={handleChange}
              value={form.description}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Firm name{' '}
              <span className="font-normal text-slate-400">(optional — used to detect self-funded credits)</span>
            </span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
              name="firmName"
              onChange={handleChange}
              placeholder="Acme Corp"
              value={form.firmName}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Total investment</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                min="0"
                name="totalInvestment"
                onChange={handleChange}
                step="0.01"
                type="number"
                value={form.totalInvestment}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Current balance</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                min="0"
                name="currentBalance"
                onChange={handleChange}
                step="0.01"
                type="number"
                value={form.currentBalance}
              />
            </label>
          </div>

          {saveError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{saveError}</div>
          ) : null}

          <div className="flex gap-3 pt-1">
            <button
              className="flex-1 rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-white"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectManagementSection({ onOpenProject, projects, setProjects }) {
  const { currency } = useCurrency()
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingProject, setEditingProject] = useState(null)
  const [sharingProjectId, setSharingProjectId] = useState('')

  const sharingProject = useMemo(
    () => projects.find((project) => project.id === sharingProjectId) || null,
    [projects, sharingProjectId],
  )

  const projectCards = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        formattedTotalInvestment: formatCurrency(project.totalInvestment, currency),
        formattedCurrentBalance: formatCurrency(project.currentBalance, currency),
        runwayEstimate: calculateRunwayEstimate(project),
      })),
    [projects, currency],
  )

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const newProject = await createProject(formData)
      setProjects((current) => [newProject, ...current])
      setFormData(initialFormData)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEditSave(updated) {
    setProjects((current) => current.map((p) => (p.id === updated.id ? updated : p)))
    setEditingProject(null)
  }

  return (
  <div className="space-y-6">
      {editingProject ? (
        <EditProjectModal
          onClose={() => setEditingProject(null)}
          onSave={handleEditSave}
          project={editingProject}
        />
      ) : null}
      {sharingProject ? (
        <ShareProjectModal
          onClose={() => setSharingProjectId('')}
          onProjectUpdated={(updatedProject) => {
            setProjects((current) => current.map((project) => (project.id === updatedProject.id ? updatedProject : project)))
          }}
          project={sharingProject}
        />
      ) : null}
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Create startup project</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Add a new startup</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Track investment, current balance, and runway from one clean project management view.
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Project name</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                name="name"
                onChange={handleChange}
                placeholder="Nova Labs"
                required
                value={formData.name}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                name="description"
                onChange={handleChange}
                placeholder="AI-powered finance tooling for founders"
                required
                value={formData.description}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Firm name <span className="font-normal text-slate-400">(optional)</span></span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                name="firmName"
                onChange={handleChange}
                placeholder="Acme Corp — used to detect self-funded bank credits"
                value={formData.firmName}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Total investment</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  min="0"
                  name="totalInvestment"
                  onChange={handleChange}
                  placeholder="500000"
                  required
                  step="0.01"
                  type="number"
                  value={formData.totalInvestment}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Current balance</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  min="0"
                  name="currentBalance"
                  onChange={handleChange}
                  placeholder="320000"
                  required
                  step="0.01"
                  type="number"
                  value={formData.currentBalance}
                />
              </label>
            </div>

            <button
              className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Creating…' : 'Create startup project'}
            </button>
            {error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
            ) : null}
          </form>
        </article>

        <article className="rounded-[2rem] border border-slate-100 bg-white/90 p-6 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Project list</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Startups</h2>
              <p className="mt-2 text-sm text-slate-500">Open each company workspace, update funding context, or manage who can collaborate.</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-[#fafafa] px-3 py-1 text-xs font-medium text-slate-700">
              {projectCards.length} total
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {projectCards.length ? (
              projectCards.map((project) => (
                <article
                  className="rounded-[1.7rem] border border-slate-100 bg-gradient-to-br from-white via-[#f9fafb] to-[#eef2ff] p-5 text-left transition hover:border-slate-200 hover:shadow-[0_16px_35px_rgba(148,163,184,0.18)]"
                  key={project.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Startup</p>
                        <span
                          className={[
                            'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
                            project.accessLevel === 'owner'
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border border-sky-200 bg-sky-50 text-sky-700',
                          ].join(' ')}
                        >
                          {project.accessLevel === 'owner' ? 'Owner' : 'Shared'}
                        </span>
                        {project.currentUserRole && project.currentUserRole !== 'owner' ? (
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                            {project.currentUserRole}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 truncate text-xl font-semibold text-slate-950">{project.name}</h3>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      <TeamIcon />
                      {project.memberCount || 1} members
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{project.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    {project.accessLevel === 'shared' && project.owner?.name ? (
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Shared by {project.owner.name}</span>
                    ) : null}
                    {project.accessLevel === 'owner' ? (
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700">
                        You control access and setup
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    {project.firmName ? (
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Firm name</span>
                        <strong className="font-semibold text-slate-950">{project.firmName}</strong>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Total investment</span>
                      <strong className="font-semibold text-slate-950">{project.formattedTotalInvestment}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Current balance</span>
                      <strong className="font-semibold text-slate-950">{project.formattedCurrentBalance}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Runway estimate</span>
                      <strong className="font-semibold text-slate-950">{project.runwayEstimate}</strong>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200/70 pt-4">
                    <ActionButton onClick={() => onOpenProject(project.id)} tone="primary">
                      <OpenIcon />
                      
                    </ActionButton>
                    {project.accessLevel === 'owner' ? (
                      <>
                        <ActionButton onClick={() => setEditingProject(project)}>
                          <EditIcon />
                          Edit project
                        </ActionButton>
                        <ActionButton onClick={() => setSharingProjectId(project.id)}>
                          <InviteIcon />
                          Invite users
                        </ActionButton>
                      </>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="md:col-span-2 rounded-[1.6rem] border border-dashed border-slate-200 bg-[#fafafa] px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">No startup projects yet</p>
                <p className="mt-2 text-sm text-slate-500">Create your first project to start tracking capital and runway.</p>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}