import { DndContext, DragOverlay, PointerSensor, closestCorners, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useState } from 'react'
import { getRecordActorName } from '../services/api'
import {
  createDefaultTaskDeadline,
  createTask,
  formatTaskDeadline,
  getTaskDeadlineState,
  getTasksForProject,
  taskPriorities,
  taskPriorityLabels,
  updateTask,
  updateTaskPriority,
} from '../services/tasks'

const initialFormData = {
  title: '',
  description: '',
  deadline: createDefaultTaskDeadline(),
  priority: 'medium',
}

const boardColumns = [
  { id: 'high', title: taskPriorityLabels.high, eyebrow: 'Priority lane', emptyMessage: 'Drop a high-priority task here.' },
  { id: 'medium', title: taskPriorityLabels.medium, eyebrow: 'Priority lane', emptyMessage: 'Drop a medium-priority task here.' },
  { id: 'low', title: taskPriorityLabels.low, eyebrow: 'Priority lane', emptyMessage: 'Drop a low-priority task here.' },
  { id: 'done', title: 'Done', eyebrow: 'Completion lane', emptyMessage: 'Completed tasks will appear here.' },
]

function CheckIcon({ className = 'h-4 w-4' }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function TaskCard({ canManageTasks = true, isUpdating, onMarkDone, overlay = false, task }) {
  const isCompleted = task.status === 'done'
  const actorName = getRecordActorName(task)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: overlay || isCompleted || !canManageTasks,
  })

  const style = overlay
    ? undefined
    : {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.45 : 1,
      }

  return (
    <article
      className={[
        'rounded-[1.5rem] border border-slate-100 bg-white/95 p-4 shadow-[0_16px_35px_rgba(148,163,184,0.14)] backdrop-blur-sm',
        overlay ? 'rotate-1 shadow-xl' : isCompleted || !canManageTasks ? '' : 'cursor-grab active:cursor-grabbing',
      ].join(' ')}
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{task.title}</p>
        {getTaskDeadlineState(task) === 'overdue' ? (
          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-700">
            Overdue
          </span>
        ) : getTaskDeadlineState(task) === 'due-soon' ? (
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">
            Due soon
          </span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{task.description}</p>
      {actorName ? (
        <div className="mt-3">
          <span className="inline-flex rounded-full border border-slate-200 bg-[#f9fafb] px-3 py-1 text-[11px] font-medium text-slate-600">
            {isCompleted ? 'Completed from work by' : 'Assigned by'} {actorName}
          </span>
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="rounded-full border border-slate-100 bg-[#f9fafb] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-600">
          {isCompleted ? 'Completed' : taskPriorityLabels[task.priority]}
        </span>
        <span className="text-right text-xs font-medium text-slate-400">{formatTaskDeadline(task.deadline)}</span>
      </div>

      {!isCompleted && !overlay && canManageTasks ? (
        <div className="mt-4 flex justify-end">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isUpdating}
            onClick={(event) => {
              event.stopPropagation()
              onMarkDone(task.id)
            }}
            type="button"
          >
            <CheckIcon />
            {isUpdating ? 'Updating…' : 'Mark done'}
          </button>
        </div>
      ) : null}
    </article>
  )
}

function TaskColumn({ canManageTasks, column, isUpdatingTaskId, tasks, onMarkDone }) {
  const { isOver, setNodeRef } = useDroppable({ id: column.id })

  return (
    <section
      className={[
        'rounded-[1.9rem] border bg-white/90 p-5 shadow-[0_18px_40px_rgba(148,163,184,0.16)] transition backdrop-blur-sm',
        isOver ? 'border-slate-400 ring-4 ring-slate-100' : 'border-slate-100',
      ].join(' ')}
      ref={setNodeRef}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{column.eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">{column.title}</h3>
        </div>
        <span className="rounded-full border border-slate-100 bg-[#f9fafb] px-3 py-1 text-xs font-medium text-slate-700">
          {tasks.length}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {tasks.length ? (
          tasks.map((task) => (
            <TaskCard
              canManageTasks={canManageTasks}
              isUpdating={isUpdatingTaskId === task.id}
              key={task.id}
              onMarkDone={onMarkDone}
              task={task}
            />
          ))
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-[#f9fafb] px-4 py-10 text-center text-sm text-slate-500">
            {column.emptyMessage}
          </div>
        )}
      </div>
    </section>
  )
}

function CreateTaskModal({ formData, isOpen, isSubmitting, onChange, onClose, onSubmit, taskError }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/18 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-100 bg-white/95 p-6 shadow-[0_28px_80px_rgba(148,163,184,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Create task</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">New board task</h2>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-600 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
              name="title"
              onChange={onChange}
              placeholder="Ship investor update"
              required
              value={formData.title}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
              name="description"
              onChange={onChange}
              placeholder="Summarize runway, burn, revenue growth, and next milestone risks"
              required
              value={formData.description}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Deadline</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                name="deadline"
                onChange={onChange}
                required
                type="datetime-local"
                value={formData.deadline}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Priority</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-[#fafafa] px-4 py-3.5 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                name="priority"
                onChange={onChange}
                value={formData.priority}
              >
                {taskPriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {taskPriorityLabels[priority]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Creating…' : 'Create task'}
          </button>
          {taskError ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{taskError}</p>
          ) : null}
        </form>
      </div>
    </div>
  )
}

export default function TaskBoardSection({ isLoadingData, onSelectProject, projects, selectedProject, setTasks, tasks }) {
  const canManageTasks = selectedProject?.currentUserRole !== 'viewer'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [activeTask, setActiveTask] = useState(null)
  const [markingTaskId, setMarkingTaskId] = useState('')
  const [taskError, setTaskError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const projectTasks = useMemo(() => getTasksForProject(tasks, selectedProject?.id), [tasks, selectedProject?.id])
  const openTasks = useMemo(() => projectTasks.filter((task) => task.status !== 'done'), [projectTasks])
  const doneTasks = useMemo(() => projectTasks.filter((task) => task.status === 'done'), [projectTasks])
  const completedTaskCount = projectTasks.length - openTasks.length

  const groupedTasks = useMemo(() => {
    const grouped = taskPriorities.reduce((accumulator, priority) => {
      accumulator[priority] = openTasks.filter((task) => task.priority === priority)
      return accumulator
    }, {})
    grouped.done = doneTasks
    return grouped
  }, [doneTasks, openTasks])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleCreateTask(event) {
    event.preventDefault()

    if (!selectedProject || !canManageTasks) return

    setIsSubmitting(true)
    setTaskError('')

    try {
      const nextTask = await createTask({
        ...formData,
        projectId: selectedProject.id,
      })

      setTasks((current) => [nextTask, ...current])
      setFormData({
        ...initialFormData,
        deadline: createDefaultTaskDeadline(),
        priority: formData.priority,
      })
      setIsModalOpen(false)
    } catch (submitError) {
      setTaskError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDragStart(event) {
    setActiveTask(event.active.data.current?.task || null)
  }

  async function handleMarkDone(taskId) {
    if (!canManageTasks) return
    setMarkingTaskId(taskId)

    try {
      const updatedTask = await updateTask(taskId, { status: 'done' })
      setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)))
    } catch {
      // inline action failed silently; task remains in current column
    } finally {
      setMarkingTaskId('')
    }
  }

  async function handleDragEnd(event) {
    if (!canManageTasks) {
      setActiveTask(null)
      return
    }

    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const task = active.data.current?.task

    if (!task) return

    if (over.id === 'done') {
      if (task.status === 'done') return

      try {
        const updatedTask = await updateTask(task.id, { status: 'done' })
        if (updatedTask) {
          setTasks((current) => current.map((item) => (item.id === task.id ? updatedTask : item)))
        }
      } catch {
        // drag failed silently — the board will retain original order
      }

      return
    }

    if (!taskPriorities.includes(over.id) || task.priority === over.id) return

    try {
      const updatedTask = await updateTask(task.id, { priority: over.id, status: 'todo' })
      if (updatedTask) {
        setTasks((current) => current.map((item) => (item.id === task.id ? updatedTask : item)))
      }
    } catch {
      // drag failed silently — the board will retain original order
    }
  }

  function handleDragCancel() {
    setActiveTask(null)
  }

  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-100 bg-white/90 p-8 shadow-[0_18px_40px_rgba(148,163,184,0.18)] backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Tasks</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">Select a startup first</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            The Kanban board is scoped per startup so delivery priorities stay tied to the right company and roadmap.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.length ? (
            projects.map((project) => (
              <button
                className="rounded-[1.8rem] border border-slate-100 bg-white/90 p-6 text-left shadow-[0_16px_35px_rgba(148,163,184,0.16)] transition hover:border-slate-200 hover:bg-white"
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
            <div className="rounded-[1.8rem] border border-dashed border-slate-200 bg-white/90 p-8 text-sm text-slate-500 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
              Create a project in the Projects section before managing tasks.
            </div>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[2rem] border border-slate-100 bg-gradient-to-r from-[#eef2ff] via-white to-[#fef3c7] p-6 shadow-[0_20px_50px_rgba(148,163,184,0.2)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Kanban board</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">{selectedProject.name} execution board</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            {canManageTasks
              ? 'Organize work by priority. Drag task cards across columns to update urgency instantly for the selected startup.'
              : 'You have viewer access on this project. Task status and priority are visible, but only owners and editors can change them.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-[1.4rem] border border-white/80 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
            {openTasks.length} open tasks{completedTaskCount ? ` · ${completedTaskCount} done` : ''}
          </div>
          {canManageTasks ? (
            <button
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={() => setIsModalOpen(true)}
              type="button"
            >
              Create Task
            </button>
          ) : null}
        </div>
      </section>

      <DndContext
        collisionDetection={closestCorners}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <section className="grid gap-6 2xl:grid-cols-4 xl:grid-cols-2">
          {boardColumns.map((column) => (
            <TaskColumn
              canManageTasks={canManageTasks}
              column={column}
              isUpdatingTaskId={markingTaskId}
              key={column.id}
              onMarkDone={handleMarkDone}
              tasks={groupedTasks[column.id] || []}
            />
          ))}
        </section>

        <DragOverlay>
          {activeTask ? <TaskCard canManageTasks={canManageTasks} overlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        formData={formData}
        isOpen={isModalOpen && canManageTasks}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        taskError={taskError}
      />
    </div>
  )
}