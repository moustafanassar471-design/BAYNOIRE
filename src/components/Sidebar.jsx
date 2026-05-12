import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userRole } = useAuth()
  const { t, isRTL } = useLanguage()

  const current = `${location.pathname}${location.search}`
  const isActive = (path) => current === path

  const navItems =
    userRole === 'manager'
      ? [
          { path: '/manager-dashboard?tab=overview', label: t.managerDashboard, icon: '📊' },
          { path: '/manager-dashboard?tab=requests', label: t.leaveRequests, icon: '📋' },
          { path: '/manager-dashboard?tab=employees', label: t.employees, icon: '👥' },
        ]
      : [
          { path: '/employee-dashboard?tab=overview', label: t.employeeDashboard, icon: '📊' },
          { path: '/employee-dashboard?tab=requests', label: t.leaveRequests, icon: '📋' },
        ]

  return (
    <aside className={`w-full lg:w-64 bg-card-bg ${isRTL ? 'lg:border-l' : 'lg:border-r'} border-border-color lg:min-h-screen`}>
      <div className="p-3 sm:p-4 lg:p-6 space-y-3">
        <h2 className="text-base lg:text-lg font-bold text-primary">{t.language}</h2>
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
