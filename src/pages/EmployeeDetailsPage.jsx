import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Sidebar } from '../components/Sidebar'
import { ChangePasswordModal } from '../components/ChangePasswordModal'
import { getUserProfile, getLeaveRequests, updateEmployeeLeaveBalance } from '../services/firebaseDataService'
import { ROLE_DISPLAY_NAMES } from '../config/roleConfig'

export function EmployeeDetailsPage() {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [editingBalance, setEditingBalance] = useState(false)
  const [newBalance, setNewBalance] = useState('')
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEmployeeData()
  }, [employeeId])

  const fetchEmployeeData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch employee profile
      const profile = await getUserProfile(employeeId)
      if (!profile) {
        setError('Employee not found')
        return
      }
      setEmployee(profile)
      setNewBalance(profile.leave_balance?.toString() || '0')

      // Fetch leave requests for this employee
      const requests = await getLeaveRequests({ userId: employeeId })
      setLeaveRequests(requests || [])
    } catch (err) {
      setError(err.message || 'Error loading employee data')
      console.error('Error fetching employee data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLeaveBalance = async () => {
    if (!newBalance || Number.isNaN(Number(newBalance))) {
      setError('Please enter a valid number')
      return
    }

    setSaving(true)
    setError('')
    setSuccessMsg('')

    try {
      const balanceValue = parseInt(newBalance, 10)
      await updateEmployeeLeaveBalance(employeeId, balanceValue)
      
      setEmployee({ ...employee, leave_balance: balanceValue })
      setEditingBalance(false)
      setSuccessMsg('Leave balance updated successfully')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError(err.message || 'Error updating leave balance')
    } finally {
      setSaving(false)
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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading employee details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => navigate(-1)}
                className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back
              </button>
              <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
                {error || 'Employee not found'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto bg-white">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back
            </button>

            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
                {successMsg}
              </div>
            )}

            {/* Employee Header */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{employee.name}</h1>
                  <p className="text-gray-600 mb-4">{employee.email}</p>
                  <div className="flex flex-wrap gap-3">
                    <div>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {ROLE_DISPLAY_NAMES[employee.role] || employee.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* Leave Balance Section */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Leave Balance</h2>
              
              {editingBalance ? (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Balance (days)
                    </label>
                    <input
                      type="number"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleUpdateLeaveBalance}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingBalance(false)
                      setNewBalance(employee.leave_balance?.toString() || '0')
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-blue-600">
                      {employee.leave_balance || 0}
                    </div>
                    <p className="text-gray-600 mt-2">days available</p>
                  </div>
                  <button
                    onClick={() => setEditingBalance(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Edit Balance
                  </button>
                </div>
              )}
            </div>

            {/* Leave Requests Section */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Leave Request History</h2>
              
              {leaveRequests.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No leave requests found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reason</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Requested</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.map((request) => (
                        <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(request.start_date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(request.end_date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {request.reason}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(request.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => fetchEmployeeData()}
        />
      )}
    </div>
  )
}
