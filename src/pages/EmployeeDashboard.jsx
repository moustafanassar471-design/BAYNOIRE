import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Sidebar } from '../components/Sidebar'
import { LeaveForm } from '../components/LeaveForm'
import { LeaveTable } from '../components/LeaveTable'
import { useAuth } from '../context/AuthContext'
import { getUserProfile } from '../services/firebaseDataService'
import { useLanguage } from '../context/LanguageContext'

export function EmployeeDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const [leaveBalance, setLeaveBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const tab = searchParams.get('tab') || 'overview'

  useEffect(() => {
    fetchLeaveBalance()
  }, [user])

  const fetchLeaveBalance = async () => {
    try {
      if (!user?.uid) return
      const data = await getUserProfile(user.uid)
      setLeaveBalance(data?.leave_balance || 0)
    } catch (error) {
      console.error('Error fetching leave balance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSuccess = () => {
    setRefreshKey((prev) => prev + 1)
    fetchLeaveBalance()
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto bg-white">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                {t.employeeDashboard}
              </h1>
              <p className="text-gray-600">
                {t.requestStatus} / {t.previousLeaves}
              </p>
            </div>

            {tab === 'overview' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
                  <div className="bg-card-bg rounded-lg p-6 border border-border-color shadow-sm">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                      {t.leaveBalance}
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      {loading ? '...' : leaveBalance} {t.days}
                    </p>
                  </div>

                  <div className="bg-card-bg rounded-lg p-6 border border-border-color shadow-sm">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                      {t.totalLeave}
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">20 {t.days}</p>
                  </div>

                  <div className="bg-card-bg rounded-lg p-6 border border-border-color shadow-sm">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                      {t.used}
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      {loading ? '...' : 20 - leaveBalance} {t.days}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                  <div className="lg:col-span-1">
                    <LeaveForm onSuccess={handleFormSuccess} />
                  </div>
                  <div className="lg:col-span-2">
                    <LeaveTable key={refreshKey} userId={user?.uid} />
                  </div>
                </div>
              </>
            )}

            {tab === 'requests' && (
              <div className="grid grid-cols-1 gap-6">
                <LeaveTable key={refreshKey} userId={user?.uid} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
