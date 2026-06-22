import { NavLink } from 'react-router-dom'
import { navItems } from './navItems'

export function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-muted-200 bg-white md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
              isActive ? 'text-primary-700' : 'text-muted-500',
            ].join(' ')
          }
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
