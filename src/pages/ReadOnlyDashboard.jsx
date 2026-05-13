import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { getEmployees, getLeaveRequests } from '../services/firebaseDataService'
import { ROLE_DISPLAY_NAMES } from '../config/roleConfig'

export function ReadOnlyDashboard() {
  const { user, userRole } = useAuth()
  const [searchParams] = useSearchParams()
  const [employees, setEmployees] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(searchParams.get('tab') || 'employees')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [empData, leaveData] = await Promise.all([
        getEmployees(),
        getLeaveRequests(),
      ])
      setEmployees(empData)
      setLeaveRequests(leaveData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    if (typeof date === 'string') return date
    if (date.toDate) {
      return new Date(date.toDate()).toLocaleDateString()
    }
    return new Date(date).toLocaleDateString()
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">View-only access to HR data</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <h3 className="text-gray-700 text-sm font-medium mb-2">Total Employees</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? '-' : employees.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-gray-700 text-sm font-medium mb-2">Pending Requests</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {loading
                    ? '-'
                    : leaveRequests.filter((r) => r.status === 'pending').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <h3 className="text-gray-700 text-sm font-medium mb-2">Approved Requests</h3>
                <p className="text-3xl font-bold text-green-600">
                  {loading
                    ? '-'
                    : leaveRequests.filter((r) => r.status === 'approved').length}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => setTab('employees')}
                className={`px-4 py-2 font-medium ${
                  tab === 'employees'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Employees
              </button>
              <button
                onClick={() => setTab('leaves')}
                className={`px-4 py-2 font-medium ${
                  tab === 'leaves'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Leave Requests
              </button>
            </div>

            {/* Employees Tab */}
            {tab === 'employees' && (
              <div>
                {loading ? (
                  <div className="text-center py-8">Loading employees...</div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">No employees found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Role</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Leave Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp) => (
                          <tr key={emp.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{emp.name}</td>
                            <td className="px-4 py-3">
                              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {ROLE_DISPLAY_NAMES[emp.role] || emp.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {emp.leave_balance} days
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Leave Requests Tab */}
            {tab === 'leaves' && (
              <div>
                {loading ? (
                  <div className="text-center py-8">Loading leave requests...</div>
                ) : leaveRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">No leave requests found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Employee
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Start Date
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            End Date
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Reason</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveRequests.map((request) => (
                          <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {request.users?.name || 'Unknown'}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {formatDate(request.start_date)}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {formatDate(request.end_date)}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{request.reason}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                  request.status
                                )}`}
                              >
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
