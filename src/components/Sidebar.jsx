const navigationItems = [
  'Dashboard',
  'Chat',
  'Projects',
  'Strategy Map',
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

function MindMapIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.4 7.4 7.1 16M13.6 7.4l3.3 8.6M8 18.5h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
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
  'Strategy Map': MindMapIcon,
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
        'group flex w-full items-center gap-2.5 rounded-[0.9rem] px-3 py-2.5 text-left text-[13px] transition duration-200',
        isActive
          ? 'border border-[#ece8ff] bg-[linear-gradient(90deg,#f3f6ff_0%,#faf7ff_100%)] text-slate-900 shadow-[0_8px_18px_rgba(148,163,184,0.14)]'
          : 'text-slate-500 hover:bg-[#f7f8fc] hover:text-slate-900',
        isCollapsed ? 'justify-center' : '',
      ].join(' ')}
      onClick={onClick}
      type="button"
    >
      <span className={[
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.85rem] transition',
        isActive
          ? 'bg-[linear-gradient(135deg,#dfeaff_0%,#efe6ff_52%,#ffe7df_100%)] text-slate-900'
          : 'bg-[#f3f5f9] text-slate-500 group-hover:bg-[#ebeef5] group-hover:text-slate-900',
      ].join(' ')}>
        <Icon className={['h-4 w-4 shrink-0', iconClass(isActive)].join(' ')} />
      </span>
      <span className={isCollapsed ? 'hidden' : 'inline'}>{item}</span>
      {!isCollapsed && item === 'Tasks' && taskCount != null ? (
        <span className={['ml-auto rounded-full px-2 py-0.5 text-[11px]', isActive ? 'bg-slate-900 text-white' : 'bg-[#eef2ff] text-slate-600'].join(' ')}>
          {taskCount}
        </span>
      ) : null}
    </button>
  )
}

function SidebarContent({ activeItem, isCollapsed, onItemSelect, onToggleMobile, taskCount }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100/80 px-4 py-4 lg:px-5 lg:py-5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[#ebe8ff] bg-[linear-gradient(135deg,#6c4cff_0%,#7b61ff_100%)] text-sm font-semibold text-white lg:h-12 lg:w-12 lg:rounded-[1.1rem]">
            BT
          </div>
          <div className={isCollapsed ? 'hidden' : 'block'}>
            <p className="text-sm font-semibold text-slate-900">BurnTracker</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">Founder ops</p>
          </div>
        </div>

        <button
          aria-label="Close sidebar"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 lg:hidden"
          onClick={onToggleMobile}
          type="button"
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-4 lg:px-4 lg:py-5">
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

      <div className="border-t border-slate-100 px-3 py-3 lg:px-4 lg:py-4">
        <div className={['rounded-[1.45rem] border border-[#eef1f7] bg-[linear-gradient(180deg,#fcfdff_0%,#f4f7ff_100%)] p-4', isCollapsed ? 'text-center' : ''].join(' ')}>
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
        className="fixed left-3 top-3 z-40 rounded-[1.1rem] border border-slate-200 bg-white p-2.5 text-slate-700 shadow-[0_10px_24px_rgba(148,163,184,0.18)] backdrop-blur lg:hidden"
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
          'fixed inset-y-0 left-0 z-40 border-r border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_55%,#f6f8ff_100%)] shadow-[0_16px_40px_rgba(148,163,184,0.18)] transition-all duration-300',
          isCollapsed ? 'lg:w-28' : 'lg:w-80',
          isMobileOpen ? 'translate-x-0 w-64 max-w-[85vw]' : '-translate-x-full w-64 max-w-[85vw] lg:translate-x-0',
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
          className="absolute -right-4 top-8 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgba(148,163,184,0.18)] transition hover:bg-slate-50 lg:flex"
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