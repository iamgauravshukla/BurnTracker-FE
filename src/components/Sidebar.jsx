const navigationItems = [
  'Dashboard',
  'Chat',
  'Projects',
  'Expenses',
  'Income',
  'Tasks',
  'AI Insights',
  'Settings',
]

function iconClass(isActive) {
  return isActive ? 'text-slate-900' : 'text-slate-400'
}

function GridIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function FolderIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H10l2 2h5.5A2.5 2.5 0 0 1 20 10.5v7A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function WalletIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h10A2.5 2.5 0 0 1 19 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 4 15.5z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15 12h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    </svg>
  )
}

function ArrowUpIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M12 18V6m0 0-4 4m4-4 4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function FileIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M8 4.5h5l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19V6a1.5 1.5 0 0 1 1-1.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13 4.5V9h4.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function SparkleIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="m12 3 1.8 4.8L18.5 9l-4.7 1.2L12 15l-1.8-4.8L5.5 9l4.7-1.2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  )
}

function ChatIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8A2.5 2.5 0 0 1 17.5 17H13l-4 3v-3H6.5A2.5 2.5 0 0 1 4 14.5z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  )
}

function CogIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="m19 12 1.5-1.2-1.5-2.6-1.9.4a6.9 6.9 0 0 0-1.6-.9L15 5.8h-3l-.5 1.9a6.9 6.9 0 0 0-1.6.9l-1.9-.4-1.5 2.6L8 12l-1.5 1.2 1.5 2.6 1.9-.4c.5.4 1 .7 1.6.9l.5 1.9h3l.5-1.9c.6-.2 1.1-.5 1.6-.9l1.9.4 1.5-2.6Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function MenuIcon({ className = 'h-5 w-5' }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  )
}

function CloseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  )
}

const icons = {
  Dashboard: GridIcon,
  Chat: ChatIcon,
  Projects: FolderIcon,
  Expenses: WalletIcon,
  Income: ArrowUpIcon,
  Tasks: CheckIcon,
  'AI Insights': SparkleIcon,
  Settings: CogIcon,
}

function SidebarItem({ isActive, isCollapsed, item, onClick, taskCount }) {
  const Icon = icons[item]

  return (
    <button
      className={[
        'group flex w-full items-center gap-3 rounded-[1.1rem] px-3.5 py-3 text-left text-sm transition duration-200',
        isActive
          ? 'bg-gradient-to-r from-white to-[#f5f3ff] text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.10)]'
          : 'text-slate-500 hover:bg-white/70 hover:text-slate-900',
        isCollapsed ? 'justify-center' : '',
      ].join(' ')}
      onClick={onClick}
      type="button"
    >
      <span className={[
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition',
        isActive
          ? 'bg-gradient-to-tr from-[#fef3c7] via-[#e0f2fe] to-[#f5f3ff] text-slate-900'
          : 'bg-[#f1f5f9] text-slate-500 group-hover:bg-[#e5e7eb] group-hover:text-slate-900',
      ].join(' ')}>
        <Icon className={['h-[18px] w-[18px] shrink-0', iconClass(isActive)].join(' ')} />
      </span>
      <span className={isCollapsed ? 'hidden' : 'inline'}>{item}</span>
      {!isCollapsed && item === 'Tasks' && taskCount != null ? (
        <span className={['ml-auto rounded-full px-2 py-0.5 text-[11px]', isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'].join(' ')}>
          {taskCount}
        </span>
      ) : null}
    </button>
  )
}

function SidebarContent({ activeItem, isCollapsed, onItemSelect, onToggleMobile, taskCount }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#e0f2fe_0%,#f5d0fe_45%,#fee2e2_100%)] text-sm font-semibold text-slate-900 shadow-[0_18px_40px_rgba(148,163,184,0.45)]">
            SX
          </div>
          <div className={isCollapsed ? 'hidden' : 'block'}>
            <p className="text-sm font-semibold text-slate-900">StartupTracker</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">Founder Ops</p>
          </div>
        </div>

        <button
          aria-label="Close sidebar"
          className="rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-500 shadow-sm transition hover:bg-white lg:hidden"
          onClick={onToggleMobile}
          type="button"
        >
          <CloseIcon />
        </button>
      </div>

      <div className={isCollapsed ? 'hidden' : 'px-5 pt-6 text-[11px] uppercase tracking-[0.24em] text-slate-400'}>
        Navigation
      </div>

      <nav className="flex-1 space-y-2 px-4 py-4">
        {navigationItems.map((item) => (
          <SidebarItem
            isActive={activeItem === item}
            isCollapsed={isCollapsed}
            item={item}
            key={item}
            onClick={() => onItemSelect(item)}
            taskCount={item === 'Tasks' ? taskCount : null}
          />
        ))}
      </nav>

      <div className="border-t border-slate-100 px-4 py-4">
        <div className={['rounded-[1.6rem] border border-slate-100 bg-gradient-to-br from-white via-[#f9fafb] to-[#e0f2fe] p-4 shadow-sm', isCollapsed ? 'text-center' : ''].join(' ')}>
          <p className={isCollapsed ? 'hidden' : 'text-xs uppercase tracking-[0.22em] text-slate-400'}>Weekly health</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">92%</p>
          <p className={isCollapsed ? 'hidden' : 'mt-2 text-xs leading-5 text-slate-500'}>Tasks, cash, and reporting are aligned with your current operating plan.</p>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ activeItem, isCollapsed, isMobileOpen, onItemSelect, onToggleCollapse, onToggleMobile, taskCount }) {
  return (
    <>
      <button
        aria-label="Open sidebar"
        className="fixed left-5 top-5 z-40 rounded-2xl border border-slate-200 bg-white/90 p-3 text-slate-700 shadow-[0_16px_32px_rgba(15,23,42,0.16)] backdrop-blur lg:hidden"
        onClick={onToggleMobile}
        type="button"
      >
        <MenuIcon />
      </button>

      {isMobileOpen ? (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-900/10 backdrop-blur-[2px] lg:hidden"
          onClick={onToggleMobile}
          type="button"
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 border-r border-slate-100 bg-gradient-to-b from-white via-[#f9fafb] to-[#eff6ff] shadow-[0_20px_60px_rgba(148,163,184,0.35)] transition-all duration-300',
          isCollapsed ? 'lg:w-28' : 'lg:w-80',
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 lg:translate-x-0',
        ].join(' ')}
      >
        <SidebarContent
          activeItem={activeItem}
          isCollapsed={isCollapsed}
          onItemSelect={onItemSelect}
          onToggleMobile={onToggleMobile}
          taskCount={taskCount}
        />

        <button
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-4 top-8 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_12px_30px_rgba(148,163,184,0.35)] transition hover:bg-slate-50 lg:flex"
          onClick={onToggleCollapse}
          type="button"
        >
          <svg aria-hidden="true" className={['h-4 w-4 transition-transform', isCollapsed ? 'rotate-180' : ''].join(' ')} fill="none" viewBox="0 0 24 24">
            <path d="M15 6 9 12l6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
        </button>
      </aside>
    </>
  )
}