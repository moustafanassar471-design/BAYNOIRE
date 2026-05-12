import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Sidebar } from '../components/Sidebar'
import { LeaveTable } from '../components/LeaveTable'
import { EmployeeList } from '../components/EmployeeList'
import { useLanguage } from '../context/LanguageContext'

export function ManagerDashboard() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const [refreshKey, setRefreshKey] = useState(0)
  const tab = searchParams.get('tab') || 'overview'

  const handleDataChange = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                {t.managerDashboard}
              </h1>
              <p className="text-gray-600">
                {t.leaveRequests} / {t.employees}
              </p>
            </div>

            {(tab === 'overview' || tab === 'requests') && (
              <div className="mb-8">
                <LeaveTable
                  key={refreshKey}
                  showActions={true}
                  onUpdate={handleDataChange}
                />
              </div>
            )}

            {(tab === 'overview' || tab === 'employees') && (
              <div>
                <EmployeeList onDataChange={handleDataChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
