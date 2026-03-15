import api, { extractMessage, normalize, normalizeList } from './api'

export const taskPriorities = ['low', 'medium', 'high']
export const taskDueSoonWindowHours = 72

export const taskPriorityLabels = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority',
}

function padDatePart(value) {
  return String(value).padStart(2, '0')
}

export function createDefaultTaskDeadline() {
  const nextHour = new Date()
  nextHour.setMinutes(0, 0, 0)
  nextHour.setHours(nextHour.getHours() + 1)

  return [
    nextHour.getFullYear(),
    padDatePart(nextHour.getMonth() + 1),
    padDatePart(nextHour.getDate()),
  ].join('-') + `T${padDatePart(nextHour.getHours())}:${padDatePart(nextHour.getMinutes())}`
}

export function formatTaskDeadline(deadline) {
  if (!deadline) {
    return 'No deadline'
  }

  const parsed = new Date(deadline)

  if (Number.isNaN(parsed.getTime())) {
    return 'No deadline'
  }

  const hasExplicitTime = parsed.getHours() !== 0 || parsed.getMinutes() !== 0

  return parsed.toLocaleString(
    'en-US',
    hasExplicitTime
      ? {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }
      : {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        },
  )
}

export function getTaskDeadlineState(task, now = new Date(), dueSoonWindowHours = taskDueSoonWindowHours) {
  if (!task?.deadline || task.status === 'done') {
    return 'default'
  }

  const deadline = new Date(task.deadline)

  if (Number.isNaN(deadline.getTime())) {
    return 'default'
  }

  if (deadline.getTime() < now.getTime()) {
    return 'overdue'
  }

  const dueSoonLimit = now.getTime() + dueSoonWindowHours * 60 * 60 * 1000

  if (deadline.getTime() <= dueSoonLimit) {
    return 'due-soon'
  }

  return 'default'
}

export function getTasksForProject(tasks, projectId) {
  if (!projectId) {
    return []
  }

  return tasks
    .filter((task) => task.projectId === projectId || String(task.projectId) === String(projectId))
    .sort((first, second) => new Date(first.deadline) - new Date(second.deadline))
}

export async function getTasks(projectId) {
  try {
    const { data } = await api.get('/tasks', { params: { projectId } })
    return normalizeList(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function createTask(taskData) {
  try {
    const { data } = await api.post('/tasks', taskData)
    return normalize(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function updateTaskPriority(taskId, priority) {
  try {
    const { data } = await api.patch(`/tasks/${taskId}`, { priority })
    return normalize(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function updateTask(taskId, taskData) {
  try {
    const { data } = await api.put(`/tasks/${taskId}`, taskData)
    return normalize(data)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}

export async function deleteTask(taskId) {
  try {
    await api.delete(`/tasks/${taskId}`)
  } catch (error) {
    throw new Error(extractMessage(error))
  }
}