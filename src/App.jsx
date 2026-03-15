import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { getStoredToken } from './services/auth'

export default function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to={getStoredToken() ? '/dashboard' : '/login'} />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />
      <Route
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
        path="/dashboard"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}