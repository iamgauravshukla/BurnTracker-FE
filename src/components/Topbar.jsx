import { useEffect, useRef, useState } from 'react'
import { formatTaskDeadline, getTaskDeadlineState } from '../services/tasks'

function formatTodayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M15.5 17h-7V11a3.5 3.5 0 1 1 7 0z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

export default function Topbar({ activeItem, canManageTasks = true, isMarkingTaskId, notifications = [], onLogout, onMarkTaskDone }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const panelRef = useRef(null)
  const todayLabel = formatTodayLabel()

  useEffect(() => {
    setIsNotificationsOpen(false)
  }, [activeItem])

  useEffect(() => {
    function handleClickOutside(event) {
      if (!panelRef.current?.contains(event.target)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-20 isolate relative px-3 pt-3 sm:px-5 lg:px-6 lg:pt-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full rounded-b-[2rem] bg-[linear-gradient(180deg,rgba(244,246,255,0.98)_0%,rgba(248,250,255,0.92)_45%,rgba(249,250,251,0)_100%)] backdrop-blur-xl"
      />
      <div className="flex w-full min-w-0 flex-col gap-3 rounded-[1.6rem] border border-[#eceff5] bg-white/92 px-3 py-2.5 shadow-[0_10px_30px_rgba(148,163,184,0.12)] backdrop-blur-xl sm:px-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 w-full flex-1 items-center gap-3 md:w-auto md:gap-4">
          <div className="hidden rounded-2xl border border-[#edf0f6] bg-[#fbfcff] px-3 py-2 text-xs font-medium text-slate-500 sm:inline-flex sm:items-center sm:gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#dff7e8] text-[10px] font-semibold text-emerald-700">
              •
            </span>
            <span>Overview</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
            <span className="hidden sm:inline">{todayLabel}</span>
          </div>

          <div className="relative min-w-0 flex-1">
            <input
              className="h-9 w-full rounded-2xl border border-[#edf0f6] bg-[#fbfcff] pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#d9def0] focus:bg-white focus:ring-4 focus:ring-[#eef2ff]"
              placeholder="Search in workspace"
              type="search"
            />
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="m15.5 15.5 3 3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                <circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center justify-between gap-2 md:w-auto md:justify-end md:gap-3">
          <div className="hidden rounded-[1.25rem] border border-[#eceff5] bg-[linear-gradient(90deg,#f3f6ff_0%,#fff8ef_100%)] px-4 py-2.5 md:block">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Workspace pulse</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{notifications.length ? `${notifications.length} deadlines need attention` : 'Everything is on track'}</p>
          </div>

          <div className="relative" ref={panelRef}>
            <button
              className="relative flex items-center justify-center rounded-[1.05rem] border border-[#eceff5] bg-white p-2.5 text-slate-600 transition hover:bg-slate-50"
              onClick={() => setIsNotificationsOpen((current) => !current)}
              type="button"
            >
              <BellIcon />
              {notifications.length ? (
                <span className="absolute right-2 top-2 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                  {notifications.length}
                </span>
              ) : null}
            </button>

            {isNotificationsOpen ? (
              <div className="absolute right-0 top-full z-30 mt-3 w-[min(22rem,calc(100vw-1.5rem))] rounded-[1.4rem] border border-slate-100 bg-white p-4 shadow-[0_24px_60px_rgba(148,163,184,0.35)] sm:w-[25rem] sm:rounded-[1.8rem]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Notifications</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950">Upcoming task deadlines</h2>
                  </div>
                  <span className="rounded-full border border-[#eadfce] bg-white px-3 py-1 text-xs font-medium text-slate-700">
                    {notifications.length}
                  </span>
                </div>

                <div className="mt-4 max-h-[24rem] space-y-3 overflow-y-auto pr-1">
                  {notifications.length ? (
                    notifications.map((task) => {
                      const deadlineState = getTaskDeadlineState(task)

                      return (
                        <article className="rounded-[1.3rem] border border-[#eadfce] bg-white p-4" key={task.id}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-950">{task.title}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{task.projectName || 'Selected project'}</p>
                            </div>
                            <span
                              className={[
                                'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
                                deadlineState === 'overdue'
                                  ? 'border border-rose-200 bg-rose-50 text-rose-700'
                                  : 'border border-sky-200 bg-sky-50 text-sky-700',
                              ].join(' ')}
                            >
                              {deadlineState === 'overdue' ? 'Overdue' : 'Due soon'}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">Due {formatTaskDeadline(task.deadline)}</p>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="rounded-full border border-slate-100 bg-[#f9fafb] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                              {task.priority}
                            </span>
                            {canManageTasks ? (
                              <button
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isMarkingTaskId === task.id}
                                onClick={() => onMarkTaskDone(task.id)}
                                type="button"
                              >
                                <CheckIcon />
                                {isMarkingTaskId === task.id ? 'Updating…' : 'Mark as done'}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">Read-only</span>
                            )}
                          </div>
                        </article>
                      )
                    })
                  ) : (
                      <div className="rounded-[1.3rem] border border-dashed border-slate-200 bg-[#f9fafb] px-4 py-10 text-center text-sm text-slate-500">
                      No overdue or due-soon tasks for the selected project.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <button
            className="rounded-[1.05rem] bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 md:px-4"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}