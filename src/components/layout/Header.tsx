import { useAuth } from '../../features/auth/AuthContext'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-muted-200 bg-white px-4 md:px-6">
      <span className="text-sm font-semibold text-primary-600 md:hidden">ShiftPlan</span>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-muted-600">{user?.email}</span>
        <button
          type="button"
          onClick={signOut}
          className="rounded-md border border-muted-200 px-3 py-1.5 text-sm font-medium text-muted-700 hover:bg-muted-100"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
