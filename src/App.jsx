import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { Login } from './pages/Login'
import { EmployeeDashboard } from './pages/EmployeeDashboard'
import { ManagerDashboard } from './pages/ManagerDashboard'

function ProtectedRoute({ children, requiredRole = null }) {
  const { user, userRole, loading, authError } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-red-50 border border-red-200 text-red-800 rounded-lg p-6">
          {authError}
        </div>
      </div>
    )
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    )
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  const { user, userRole, loading } = useAuth()
  const { t } = useLanguage()

  return (
    <Routes>
      <Route
        path="/"
        element={
          loading
            ? (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
              </div>
            )
            : user
              ? (userRole === 'manager'
                ? <Navigate to="/manager-dashboard" replace />
                : userRole === 'employee'
                  ? <Navigate to="/employee-dashboard" replace />
                  : <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-600">{t.loadingProfile}</div></div>)
              : <Login />
        }
      />
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager-dashboard"
        element={
          <ProtectedRoute requiredRole="manager">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </LanguageProvider>
  )
}
