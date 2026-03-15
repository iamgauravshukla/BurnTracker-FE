import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AIInsightsSection from '../components/AIInsightsSection'
import ChatInsightsSection from '../components/ChatInsightsSection'
import DashboardLayout from '../components/DashboardLayout'
import ExpenseTrackerSection from '../components/ExpenseTrackerSection'
import FounderDashboardSection from '../components/FounderDashboardSection'
import IncomeTrackerSection from '../components/IncomeTrackerSection'
import ProjectManagementSection from '../components/ProjectManagementSection'
import SettingsSection from '../components/SettingsSection'
import StrategyMapSection from '../components/StrategyMapSection'
import TaskBoardSection from '../components/TaskBoardSection'
import { getExpenses } from '../services/expenses'
import { getIncome } from '../services/income'
import { getProjects } from '../services/projects'
import { getTaskDeadlineState, getTasks, updateTask } from '../services/tasks'
import { clearStoredToken } from '../services/auth'

const sectionLabels = {
  dashboard: 'Dashboard',
  chat: 'Chat',
  projects: 'Projects',
  strategyMap: 'Strategy Map',
  expenses: 'Expenses',
  income: 'Income',
  tasks: 'Tasks',
  aiInsights: 'AI Insights',
  settings: 'Settings',
}

const sectionToQueryValue = Object.entries(sectionLabels).reduce((accumulator, [key, value]) => {
  accumulator[value] = key
  return accumulator
}, {})

export default function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [expenses, setExpenses] = useState([])
  const [incomeEntries, setIncomeEntries] = useState([])
  const [tasks, setTasks] = useState([])
  const [markingTaskId, setMarkingTaskId] = useState('')
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const currentSection = searchParams.get('section') || 'dashboard'
  const selectedProjectId = searchParams.get('project') || ''
  const activeItem = sectionLabels[currentSection] || 'Dashboard'

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId],
  )
  const canManageSelectedProjectTasks = selectedProject?.currentUserRole !== 'viewer'

  const notificationTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== 'done')
      .filter((task) => {
        const state = getTaskDeadlineState(task)
        return state === 'overdue' || state === 'due-soon'
      })
      .sort((first, second) => new Date(first.deadline) - new Date(second.deadline))
      .slice(0, 6)
      .map((task) => ({ ...task, projectName: selectedProject?.name || '' }))
  }, [selectedProject?.name, tasks])

  // Fetch projects on mount
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getProjects()
        if (!cancelled) setProjects(data)
      } catch (error) {
        if (!cancelled) setGlobalError(error.message)
      } finally {
        if (!cancelled) setIsLoadingProjects(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  // Fetch project-scoped data whenever the selected project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setExpenses([])
      setIncomeEntries([])
      setTasks([])
      return
    }

    let cancelled = false
    setIsLoadingData(true)

    async function load() {
      try {
        const [expenseData, incomeData, taskData] = await Promise.all([
          getExpenses(selectedProjectId),
          getIncome(selectedProjectId),
          getTasks(selectedProjectId),
        ])

        if (!cancelled) {
          setExpenses(expenseData)
          setIncomeEntries(incomeData)
          setTasks(taskData)
        }
      } catch (error) {
        if (!cancelled) setGlobalError(error.message)
      } finally {
        if (!cancelled) setIsLoadingData(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [selectedProjectId])

  function handleLogout() {
    clearStoredToken()
    navigate('/login', { replace: true })
  }

  function handleSectionChange(item) {
    const section = sectionToQueryValue[item] || 'dashboard'
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set('section', section)
    setSearchParams(nextSearchParams)
  }

  function handleOpenProject(projectId, section = 'dashboard') {
    const nextSearchParams = new URLSearchParams()
    nextSearchParams.set('section', section)
    nextSearchParams.set('project', projectId)
    setSearchParams(nextSearchParams)
  }

  async function handleMarkTaskDone(taskId) {
    if (!canManageSelectedProjectTasks) {
      return
    }

    setMarkingTaskId(taskId)
    setGlobalError('')

    try {
      const updatedTask = await updateTask(taskId, { status: 'done' })
      setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)))
    } catch (error) {
      setGlobalError(error.message)
    } finally {
      setMarkingTaskId('')
    }
  }

  function renderPlaceholderSection() {
    return (
      <div className="space-y-6">
        <section className="rounded-[1.7rem] border border-[#edf0f6] bg-white/95 p-6 shadow-[0_10px_24px_rgba(148,163,184,0.10)] backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{activeItem}</p>
          <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[2.15rem]">{activeItem} workspace</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            This section is ready inside the reusable SaaS shell. Add your specific {activeItem.toLowerCase()} tables, charts, workflows, or automation panels here next.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {['Summary card', 'Primary workflow', 'Recent items'].map((title) => (
            <article className="rounded-[1.5rem] border border-[#e8edf7] bg-[linear-gradient(180deg,#f7f9ff_0%,#ffffff_100%)] p-6 shadow-[0_10px_24px_rgba(148,163,184,0.10)]" key={title}>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Block</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">Use this area to extend the same clean UI system into the {activeItem.toLowerCase()} module.</p>
            </article>
          ))}
        </section>
      </div>
    )
  }

  if (isLoadingProjects) {
    return (
      <DashboardLayout activeItem={activeItem} canManageTasks={canManageSelectedProjectTasks} onLogout={handleLogout} onSelectItem={handleSectionChange}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-slate-500">Loading workspace…</p>
        </div>
      </DashboardLayout>
    )
  }

  let content = (
    <FounderDashboardSection
      expenses={expenses}
      incomeEntries={incomeEntries}
      projects={projects}
      selectedProject={selectedProject}
      tasks={tasks}
    />
  )

  if (currentSection === 'projects') {
    content = <ProjectManagementSection onOpenProject={handleOpenProject} projects={projects} setProjects={setProjects} />
  } else if (currentSection === 'strategyMap') {
    content = (
      <StrategyMapSection
        expenses={expenses}
        incomeEntries={incomeEntries}
        onSelectProject={(projectId) => handleOpenProject(projectId, 'strategyMap')}
        projects={projects}
        selectedProject={selectedProject}
        tasks={tasks}
      />
    )
  } else if (currentSection === 'chat') {
    content = (
      <ChatInsightsSection
        projects={projects}
        selectedProject={selectedProject}
        setExpenses={setExpenses}
        setIncomeEntries={setIncomeEntries}
        setTasks={setTasks}
      />
    )
  } else if (currentSection === 'expenses') {
    content = (
      <ExpenseTrackerSection
        expenses={expenses}
        isLoadingData={isLoadingData}
        onSelectProject={(projectId) => handleOpenProject(projectId, 'expenses')}
        projects={projects}
        selectedProject={selectedProject}
        setExpenses={setExpenses}
      />
    )
  } else if (currentSection === 'income') {
    content = (
      <IncomeTrackerSection
        incomeEntries={incomeEntries}
        isLoadingData={isLoadingData}
        onSelectProject={(projectId) => handleOpenProject(projectId, 'income')}
        projects={projects}
        selectedProject={selectedProject}
        setIncomeEntries={setIncomeEntries}
      />
    )
  } else if (currentSection === 'tasks') {
    content = (
      <TaskBoardSection
        isLoadingData={isLoadingData}
        onSelectProject={(projectId) => handleOpenProject(projectId, 'tasks')}
        projects={projects}
        selectedProject={selectedProject}
        setTasks={setTasks}
        tasks={tasks}
      />
    )
  } else if (currentSection === 'aiInsights') {
    content = <AIInsightsSection projects={projects} selectedProject={selectedProject} />
  } else if (currentSection === 'settings') {
    content = <SettingsSection projects={projects} setProjects={setProjects} />
  } else if (currentSection !== 'dashboard') {
    content = renderPlaceholderSection()
  }

  return (
    <DashboardLayout
      activeItem={activeItem}
      canManageTasks={canManageSelectedProjectTasks}
      isMarkingTaskId={markingTaskId}
      notifications={notificationTasks}
      onLogout={handleLogout}
      onMarkTaskDone={handleMarkTaskDone}
      onSelectItem={handleSectionChange}
      taskCount={selectedProjectId ? tasks.filter((t) => t.status !== 'done').length : null}
    >
      {globalError ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-white/95 px-4 py-3 text-sm text-rose-700 shadow-[0_8px_20px_rgba(244,63,94,0.06)]">
          {globalError}
        </div>
      ) : null}
      {content}
    </DashboardLayout>
  )
}

