import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { LoginPage } from './features/auth/pages/LoginPage'
import { LandingPage } from './features/landing/pages/LandingPage'
import { SchedulePage } from './features/schedule/pages/SchedulePage'
import { EmployeesPage } from './features/employees/pages/EmployeesPage'
import { SettingsPage } from './features/settings/pages/SettingsPage'
import { BillingPage } from './features/billing/pages/BillingPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="escala" replace />} />
          <Route path="escala" element={<SchedulePage />} />
          <Route path="equipe" element={<EmployeesPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="assinatura" element={<BillingPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
