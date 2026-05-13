import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { Login } from './pages/Login'
import { EmployeeDashboard } from './pages/EmployeeDashboard'
import { ManagerDashboard } from './pages/ManagerDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { ReadOnlyDashboard } from './pages/ReadOnlyDashboard'
import { ROLES, PERMISSIONS, READONLY_DASHBOARD_ROLES, EMPLOYEE_ROLES } from './config/roleConfig'

function ProtectedRoute({ children, allowedRoles = null }) {
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

  // Check if user has permission to access this route
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Login Page */}
      <Route
        path="/"
        element={
          user
            ? userRole === ROLES.ADMIN
              ? <Navigate to="/admin-dashboard" replace />
              : userRole === ROLES.MANAGER
                ? <Navigate to="/manager-dashboard" replace />
                : READONLY_DASHBOARD_ROLES.includes(userRole)
                  ? <Navigate to="/dashboard" replace />
                  : EMPLOYEE_ROLES.includes(userRole)
                    ? <Navigate to="/employee-dashboard" replace />
                    : <Navigate to="/" replace />
            : <Login />
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Manager Dashboard */}
      <Route
        path="/manager-dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.MANAGER]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Read-Only Dashboard (Retail Manager, CEO, HR) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={READONLY_DASHBOARD_ROLES}>
            <ReadOnlyDashboard />
          </ProtectedRoute>
        }
      />

      {/* Employee Dashboard */}
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={EMPLOYEE_ROLES}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
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
