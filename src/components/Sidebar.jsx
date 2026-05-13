import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLES, READONLY_DASHBOARD_ROLES, EMPLOYEE_ROLES } from '../config/roleConfig'

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userRole } = useAuth()

  const current = `${location.pathname}${location.search}`
  const isActive = (path) => current === path

  let navItems = []

  if (userRole === ROLES.ADMIN) {
    navItems = [
      { path: '/admin-dashboard?tab=users', label: 'User Management', icon: '👥' },
      { path: '/admin-dashboard?tab=leave', label: 'Leave Management', icon: '📋' },
    ]
  } else if (userRole === ROLES.MANAGER) {
    navItems = [
      { path: '/manager-dashboard?tab=overview', label: 'Dashboard', icon: '📊' },
      { path: '/manager-dashboard?tab=requests', label: 'Leave Requests', icon: '📋' },
      { path: '/manager-dashboard?tab=employees', label: 'Employees', icon: '👥' },
    ]
  } else if (READONLY_DASHBOARD_ROLES.includes(userRole)) {
    navItems = [
      { path: '/dashboard?tab=employees', label: 'Employees', icon: '👥' },
      { path: '/dashboard?tab=leaves', label: 'Leave Requests', icon: '📋' },
    ]
  } else if (EMPLOYEE_ROLES.includes(userRole)) {
    navItems = [
      { path: '/employee-dashboard?tab=overview', label: 'Dashboard', icon: '📊' },
      { path: '/employee-dashboard?tab=requests', label: 'Leave Requests', icon: '📋' },
    ]
  }

  return (
    <aside className="w-full lg:w-64 bg-card-bg lg:border-r border-border-color lg:min-h-screen">
      <div className="p-3 sm:p-4 lg:p-6 space-y-3">
        <h2 className="text-base lg:text-lg font-bold text-primary">Navigation</h2>
        <nav className="flex lg:block gap-2 overflow-x-auto pb-1 lg:pb-0 whitespace-nowrap">
          {navItems.map((item, index) => (
            <button
              key={`${item.path}-${index}`}
              onClick={() => navigate(item.path)}
              className={`w-auto lg:w-full text-left px-3 sm:px-4 py-2.5 lg:py-3 rounded-lg transition text-sm sm:text-base ${
                isActive(item.path) ? 'bg-accent text-white' : 'hover:bg-gray-200 text-primary'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
