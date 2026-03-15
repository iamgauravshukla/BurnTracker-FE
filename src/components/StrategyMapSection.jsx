import { useEffect, useMemo, useState } from 'react'
import {
  buildStarterStrategyMap,
  createStrategyNode,
  getStrategyMap,
  saveStrategyMap,
  strategyNodeStatuses,
  strategyNodeTypes,
} from '../services/strategyMap'

const typeOrder = ['north-star', 'initiative', 'metric', 'risk', 'decision']

const typeMeta = {
  'north-star': { label: 'North Star', accent: 'border-violet-200 bg-violet-50 text-violet-700' },
  initiative: { label: 'Initiatives', accent: 'border-sky-200 bg-sky-50 text-sky-700' },
  metric: { label: 'Metrics', accent: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  risk: { label: 'Risks', accent: 'border-rose-200 bg-rose-50 text-rose-700' },
  decision: { label: 'Decisions', accent: 'border-amber-200 bg-amber-50 text-amber-700' },
}

const statusMeta = {
  planned: 'border-slate-200 bg-slate-50 text-slate-600',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  watch: 'border-amber-200 bg-amber-50 text-amber-700',
  blocked: 'border-rose-200 bg-rose-50 text-rose-700',
}

const initialDraft = {
  title: '',
  type: 'initiative',
  status: 'planned',
  summary: '',
  owner: '',
  targetDate: '',
  linkedNodeIds: [],
}

function MetricCard({ hint, label, value }) {
  return (
    <article className="rounded-[1.45rem] border border-[#dfe8ff] bg-[linear-gradient(180deg,#edf4ff_0%,#f9fbff_100%)] p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </article>
  )
}

function MapNodeCard({ canManage, node, nodes, onDelete, onToggleLink, onUpdate }) {
  const linkedNodes = node.linkedNodeIds.map((id) => nodes.find((item) => item.id === id)).filter(Boolean)

  return (
    <article className="rounded-[1.3rem] border border-[#edf0f6] bg-white p-4 shadow-[0_8px_18px_rgba(148,163,184,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={[
            'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
            typeMeta[node.type]?.accent || typeMeta.initiative.accent,
          ].join(' ')}>
            {typeMeta[node.type]?.label || node.type}
          </span>
          <input
            className="mt-3 w-full border-0 bg-transparent p-0 text-base font-semibold text-slate-950 outline-none"
            disabled={!canManage}
            onChange={(event) => onUpdate(node.id, { title: event.target.value })}
            value={node.title}
          />
        </div>
        {canManage ? (
          <button
            className="rounded-full border border-rose-200 px-2.5 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
            onClick={() => onDelete(node.id)}
            type="button"
          >
            Remove
          </button>
        ) : null}
      </div>

      <textarea
        className="mt-3 min-h-20 w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 disabled:opacity-70"
        disabled={!canManage}
        onChange={(event) => onUpdate(node.id, { summary: event.target.value })}
        placeholder="Why this node matters to the startup plan"
        value={node.summary}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select
          className={[
            'rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100',
            statusMeta[node.status] || statusMeta.planned,
          ].join(' ')}
          disabled={!canManage}
          onChange={(event) => onUpdate(node.id, { status: event.target.value })}
          value={node.status}
        >
          {strategyNodeStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <input
          className="rounded-xl border border-slate-200 bg-[#fafafa] px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 disabled:opacity-70"
          disabled={!canManage}
          onChange={(event) => onUpdate(node.id, { owner: event.target.value })}
          placeholder="Owner"
          value={node.owner}
        />
      </div>

      <label className="mt-3 block space-y-2">
        <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Target date</span>
        <input
          className="w-full rounded-xl border border-slate-200 bg-[#fafafa] px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 disabled:opacity-70"
          disabled={!canManage}
          onChange={(event) => onUpdate(node.id, { targetDate: event.target.value })}
          type="date"
          value={node.targetDate ? node.targetDate.slice(0, 10) : ''}
        />
      </label>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Connected to</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {linkedNodes.length ? linkedNodes.map((linkedNode) => (
            <span className="rounded-full border border-slate-200 bg-[#f9fafb] px-3 py-1 text-xs text-slate-600" key={`${node.id}-${linkedNode.id}`}>
              {linkedNode.title}
            </span>
          )) : <span className="text-sm text-slate-400">No strategic links yet.</span>}
        </div>
      </div>

      {canManage ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Toggle link</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {nodes.filter((item) => item.id !== node.id).map((candidate) => {
              const isLinked = node.linkedNodeIds.includes(candidate.id)

              return (
                <button
                  className={[
                    'rounded-full border px-3 py-1 text-xs transition',
                    isLinked
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  ].join(' ')}
                  key={`${node.id}-${candidate.id}`}
                  onClick={() => onToggleLink(node.id, candidate.id)}
                  type="button"
                >
                  {candidate.title}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </article>
  )
}

export default function StrategyMapSection({ expenses, incomeEntries, onSelectProject, projects, selectedProject, tasks }) {
  const canManageStrategy = selectedProject?.currentUserRole !== 'viewer'
  const [nodes, setNodes] = useState([])
  const [draft, setDraft] = useState(initialDraft)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSeeded, setIsSeeded] = useState(false)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadMap() {
      if (!selectedProject?.id) {
        setNodes([])
        setError('')
        setSaveMessage('')
        setIsSeeded(false)
        return
      }

      setIsLoading(true)
      setError('')
      setSaveMessage('')

      try {
        const response = await getStrategyMap(selectedProject.id)
        const seededNodes = response.nodes.length
          ? response.nodes
          : buildStarterStrategyMap({ selectedProject, expenses, incomeEntries, tasks })

        if (!cancelled) {
          setNodes(seededNodes)
          setIsSeeded(response.nodes.length === 0)
          setDraft(initialDraft)
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

    loadMap()

    return () => {
      cancelled = true
    }
  }, [expenses, incomeEntries, selectedProject?.id, tasks])

  const groupedNodes = useMemo(() => {
    return typeOrder.reduce((accumulator, type) => {
      accumulator[type] = nodes.filter((node) => node.type === type)
      return accumulator
    }, {})
  }, [nodes])

  const summary = useMemo(() => {
    return {
      totalNodes: nodes.length,
      activeNodes: nodes.filter((node) => node.status === 'active').length,
      riskNodes: nodes.filter((node) => node.type === 'risk').length,
      connections: nodes.reduce((sum, node) => sum + node.linkedNodeIds.length, 0),
    }
  }, [nodes])

  function handleDraftChange(event) {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
  }

  function handleCreateNode(event) {
    event.preventDefault()

    if (!draft.title.trim()) {
      return
    }

    const nextNode = createStrategyNode({
      ...draft,
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      owner: draft.owner.trim(),
    })

    setNodes((current) => [...current, nextNode])
    setDraft(initialDraft)
    setSaveMessage('')
  }

  function updateNode(nodeId, patch) {
    setNodes((current) => current.map((node) => (node.id === nodeId ? { ...node, ...patch } : node)))
    setSaveMessage('')
  }

  function deleteNode(nodeId) {
    setNodes((current) => current
      .filter((node) => node.id !== nodeId)
      .map((node) => ({
        ...node,
        linkedNodeIds: node.linkedNodeIds.filter((linkedId) => linkedId !== nodeId),
      })))
    setSaveMessage('')
  }

  function toggleLink(nodeId, linkedNodeId) {
    setNodes((current) => current.map((node) => {
      if (node.id !== nodeId) {
        return node
      }

      const nextLinkedIds = node.linkedNodeIds.includes(linkedNodeId)
        ? node.linkedNodeIds.filter((id) => id !== linkedNodeId)
        : [...node.linkedNodeIds, linkedNodeId]

      return {
        ...node,
        linkedNodeIds: nextLinkedIds,
      }
    }))
    setSaveMessage('')
  }

  async function handleSave() {
    if (!selectedProject?.id) {
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await saveStrategyMap(selectedProject.id, nodes)
      setNodes(response.nodes)
      setIsSeeded(false)
      setSaveMessage('Strategy map saved successfully.')
    } catch (saveError) {
      setError(saveError.message)
      setSaveMessage('')
    } finally {
      setIsSaving(false)
    }
  }

  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <section className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-6 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Strategy Map</p>
          <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.15rem]">Select a startup first</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Strategy maps are scoped per startup so goals, risks, initiatives, and finance signals stay tied to the right company.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.length ? projects.map((project) => (
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
          )) : (
            <div className="rounded-[1.8rem] border border-dashed border-slate-200 bg-white/90 p-8 text-sm text-slate-500 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
              Create a project in the Projects section before building a strategy map.
            </div>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-[#e8edf7] bg-[linear-gradient(135deg,#f5f8ff_0%,#fffdf8_48%,#fbf6ff_100%)] p-5 shadow-[0_14px_32px_rgba(148,163,184,0.12)] lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Strategy Map</p>
            <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.15rem]">{selectedProject.name} strategy map</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Turn goals, finance signals, execution bets, and operating risks into one connected planning surface. This is the first step toward a true founder mind map.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isSeeded ? <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">Starter map generated from project data</span> : null}
            <button
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving || !canManageStrategy}
              onClick={handleSave}
              type="button"
            >
              {isSaving ? 'Saving…' : canManageStrategy ? 'Save strategy map' : 'Read-only'}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard hint="All mapped strategic nodes" label="Nodes" value={summary.totalNodes} />
        <MetricCard hint="Work and bets already in motion" label="Active" value={summary.activeNodes} />
        <MetricCard hint="Explicitly mapped threats" label="Risks" value={summary.riskNodes} />
        <MetricCard hint="Links between goals and decisions" label="Connections" value={summary.connections} />
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {saveMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{saveMessage}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Add node</p>
            <h3 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.03em] text-slate-950">Map the next strategic block</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Add goals, initiatives, risks, metrics, and founder decisions. Keep the map restrictive so it reflects what actually matters.
            </p>
          </div>

          {canManageStrategy ? (
            <form className="mt-8 space-y-4" onSubmit={handleCreateNode}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  name="title"
                  onChange={handleDraftChange}
                  placeholder="Reduce burn without slowing delivery"
                  required
                  value={draft.title}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Type</span>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                    name="type"
                    onChange={handleDraftChange}
                    value={draft.type}
                  >
                    {strategyNodeTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Status</span>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                    name="status"
                    onChange={handleDraftChange}
                    value={draft.status}
                  >
                    {strategyNodeStatuses.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Owner</span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                    name="owner"
                    onChange={handleDraftChange}
                    placeholder="Founder"
                    value={draft.owner}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Target date</span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                    name="targetDate"
                    onChange={handleDraftChange}
                    type="date"
                    value={draft.targetDate}
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Summary</span>
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                  name="summary"
                  onChange={handleDraftChange}
                  placeholder="What makes this strategically important right now?"
                  value={draft.summary}
                />
              </label>

              <button
                className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                type="submit"
              >
                Add strategy node
              </button>
            </form>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-200 bg-[#fafafa] px-5 py-8 text-sm text-slate-500">
              This strategy map is read-only for your account. Owners and editors can update goals, links, and strategic risks.
            </div>
          )}
        </article>

        <article className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Map guide</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">How to use this board</h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-[#fafafa] px-3 py-1 text-xs font-medium text-slate-700">
              MVP
            </span>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
            <p>North Star: the business outcome you are protecting or pursuing.</p>
            <p>Initiative: the concrete stream of work that should move that outcome.</p>
            <p>Metric: the operating signal that tells you whether the work is working.</p>
            <p>Risk: the thing most likely to break growth, delivery, or runway.</p>
            <p>Decision: a founder choice that changes direction, resource allocation, or priority.</p>
          </div>

            <div className="mt-6 rounded-[1.35rem] border border-[#e8edf7] bg-[#f7f9ff] px-5 py-5 text-sm text-slate-500">
            The next upgrade from this board is a draggable node canvas. For now, this keeps the map structured and connected without adding fragile interaction complexity.
          </div>
        </article>
      </section>

      {isLoading ? (
        <section className="grid gap-6 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="h-64 animate-pulse rounded-[1.8rem] border border-[#edf0f6] bg-white/95" key={index} />
          ))}
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-5">
          {typeOrder.map((type) => (
            <article className="rounded-[1.75rem] border border-[#edf0f6] bg-white/95 p-5 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm" key={type}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Lane</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{typeMeta[type].label}</h3>
                </div>
                <span className={[
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  typeMeta[type].accent,
                ].join(' ')}>
                  {groupedNodes[type]?.length || 0}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {groupedNodes[type]?.length ? groupedNodes[type].map((node) => (
                  <MapNodeCard
                    canManage={canManageStrategy}
                    key={node.id}
                    node={node}
                    nodes={nodes}
                    onDelete={deleteNode}
                    onToggleLink={toggleLink}
                    onUpdate={updateNode}
                  />
                )) : (
                  <div className="rounded-[1.3rem] border border-dashed border-[#dfe8ff] bg-[#f7f9ff] px-4 py-10 text-center text-sm text-slate-500">
                    No {typeMeta[type].label.toLowerCase()} added yet.
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
