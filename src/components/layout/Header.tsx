import { useAuth } from '../../features/auth/AuthContext'

export function Header() {
  const { user, signOut } = useAuth()
  const initial = user?.email?.charAt(0).toUpperCase()

  return (
    <header className="flex h-14 items-center justify-between border-b border-muted-200 bg-white px-4 md:px-6">
      <span className="text-sm font-semibold text-primary-600 md:hidden">ShiftPlan</span>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            {initial}
          </span>
          <span className="hidden text-sm text-muted-600 sm:inline">{user?.email}</span>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-lg border border-muted-200 px-3 py-1.5 text-sm font-medium text-muted-700 transition-colors hover:bg-muted-100"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
