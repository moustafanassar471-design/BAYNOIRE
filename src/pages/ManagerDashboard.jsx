import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Sidebar } from '../components/Sidebar'
import { LeaveTable } from '../components/LeaveTable'
import { ManagerEmployeeList } from '../components/ManagerEmployeeList'
import { useLanguage } from '../context/LanguageContext'

export function ManagerDashboard() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = useState(0)
  const [showAddLeaveForm, setShowAddLeaveForm] = useState(false)
  const tab = searchParams.get('tab') || 'overview'

  const handleDataChange = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleTabChange = (newTab) => {
    navigate(`?tab=${newTab}`)
    setShowAddLeaveForm(false)
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

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => handleTabChange('overview')}
                className={`px-4 py-2 font-medium ${
                  tab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabChange('requests')}
                className={`px-4 py-2 font-medium ${
                  tab === 'requests'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Leave Requests
              </button>
              <button
                onClick={() => handleTabChange('employees')}
                className={`px-4 py-2 font-medium ${
                  tab === 'employees'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Employee Management
              </button>
              <button
                onClick={() => handleTabChange('leave-management')}
                className={`px-4 py-2 font-medium ${
                  tab === 'leave-management'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Leave Balance
              </button>
            </div>

            {/* Overview Tab */}
            {tab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-900">Recent Leave Requests</h2>
                  <LeaveTable
                    key={refreshKey}
                    showActions={true}
                    onUpdate={handleDataChange}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-900">Employees</h2>
                  <ManagerEmployeeList onDataChange={handleDataChange} />
                </div>
              </div>
            )}

            {/* Leave Requests Tab */}
            {tab === 'requests' && (
              <div>
                <LeaveTable
                  key={refreshKey}
                  showActions={true}
                  onUpdate={handleDataChange}
                />
              </div>
            )}

            {/* Employee Management Tab */}
            {tab === 'employees' && (
              <div>
                <ManagerEmployeeList onDataChange={handleDataChange} />
              </div>
            )}

            {/* Leave Management Tab */}
            {tab === 'leave-management' && (
              <div>
                <div className="mb-6 flex gap-2">
                  <button
                    onClick={() => setShowAddLeaveForm(!showAddLeaveForm)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    {showAddLeaveForm ? 'Cancel' : 'Add Leave Balance'}
                  </button>
                </div>
                <ManagerEmployeeList
                  key={refreshKey}
                  onDataChange={handleDataChange}
                  showLeaveForm={showAddLeaveForm}
                  onLeaveFormToggle={setShowAddLeaveForm}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
