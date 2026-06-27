import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/cards', label: 'Cards', icon: '💳' },
  { to: '/wallet', label: 'My Wallet', icon: '👛' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r border-gray-800 bg-gray-950/50 flex flex-col">
        <div className="px-6 py-6 border-b border-gray-800">
          <div className="text-white font-bold text-lg">CY Cards</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Malaysian card tracker</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 text-[10px] text-gray-600 border-t border-gray-800">
          Phase 1 · localhost only
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
