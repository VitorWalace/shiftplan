import { NavLink } from 'react-router-dom'
import { navItems } from './navItems'

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-muted-200 bg-white md:block">
      <div className="px-6 py-5">
        <span className="text-lg font-bold text-primary-600">ShiftPlan</span>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-muted-600 hover:bg-muted-100 hover:text-muted-900',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
