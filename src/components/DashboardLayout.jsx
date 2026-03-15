import { useEffect, useState } from 'react'
import MainContent from './MainContent'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout({ activeItem = 'Dashboard', canManageTasks, children, isMarkingTaskId, notifications, onLogout, onMarkTaskDone, onSelectItem, taskCount }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [activeItem])

  function handleSelect(item) {
    onSelectItem(item)
    setIsMobileOpen(false)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f6fb] text-slate-900">
      <Sidebar
        activeItem={activeItem}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onItemSelect={handleSelect}
        onToggleCollapse={() => setIsCollapsed((current) => !current)}
        onToggleMobile={() => setIsMobileOpen((current) => !current)}
        taskCount={taskCount}
      />

      <div className={['min-h-screen min-w-0 transition-all duration-300', isCollapsed ? 'lg:pl-28' : 'lg:pl-80'].join(' ')}>
        <Topbar
          activeItem={activeItem}
          canManageTasks={canManageTasks}
          isMarkingTaskId={isMarkingTaskId}
          notifications={notifications}
          onLogout={onLogout}
          onMarkTaskDone={onMarkTaskDone}
        />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  )
}