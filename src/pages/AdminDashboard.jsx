import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Sidebar } from '../components/Sidebar'
import { ChangePasswordModal } from '../components/ChangePasswordModal'
import { useAuth } from '../context/AuthContext'
import {
  getAllUsers,
  createUserByAdmin,
  deleteUserAccount,
  updateUserProfile,
  validatePassword,
  checkEmailExists,
  addLeaveBalanceToEmployees,
  getEmployees,
} from '../services/firebaseDataService'
import { ROLE_DISPLAY_NAMES, ROLES, EMPLOYEE_ROLES } from '../config/roleConfig'

export function AdminDashboard() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [tab, setTab] = useState(searchParams.get('tab') || 'users')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAddLeaveForm, setShowAddLeaveForm] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [employees, setEmployees] = useState([])

  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.EMPLOYEE,
  })

  const [addLeaveData, setAddLeaveData] = useState({
    leaveName: '',
    days: '',
  })

  useEffect(() => {
    if (tab === 'users') {
      fetchUsers()
    } else if (tab === 'leave') {
      fetchEmployees()
    }
  }, [tab])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Error loading users')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (err) {
      console.error('Error loading employees:', err)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!createFormData.name || !createFormData.email || !createFormData.password) {
      setError('Please fill in all fields')
      return
    }

    // Validate password
    const validation = validatePassword(createFormData.password)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    try {
      const result = await createUserByAdmin({
        name: createFormData.name,
        email: createFormData.email,
        password: createFormData.password,
        role: createFormData.role,
      })

      if (result.success) {
        setSuccessMsg(`User ${createFormData.name} created successfully!`)
        setCreateFormData({
          name: '',
          email: '',
          password: '',
          role: ROLES.EMPLOYEE,
        })
        setShowCreateForm(false)
        fetchUsers()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message || 'Error creating user')
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return
    }

    try {
      const result = await deleteUserAccount(userId)
      if (result.success) {
        setSuccessMsg(`User ${userName} deleted successfully`)
        fetchUsers()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message || 'Error deleting user')
    }
  }

  const handleAddLeaveBalance = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!addLeaveData.leaveName || !addLeaveData.days || selectedEmployees.length === 0) {
      setError('Please fill in all fields and select employees')
      return
    }

    try {
      const result = await addLeaveBalanceToEmployees(
        selectedEmployees,
        addLeaveData.leaveName,
        addLeaveData.days
      )

      if (result.success) {
        setSuccessMsg(
          `Leave balance added to ${selectedEmployees.length} employee(s)!`
        )
        setAddLeaveData({ leaveName: '', days: '' })
        setSelectedEmployees([])
        setShowAddLeaveForm(false)
        fetchEmployees()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message || 'Error adding leave balance')
    }
  }

  const handleEmployeeSelection = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    )
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">System administration and user management</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => {
                  setTab('users')
                  setShowCreateForm(false)
                  setShowAddLeaveForm(false)
                }}
                className={`px-4 py-2 font-medium ${
                  tab === 'users'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => {
                  setTab('leave')
                  setShowCreateForm(false)
                  setShowAddLeaveForm(false)
                }}
                className={`px-4 py-2 font-medium ${
                  tab === 'leave'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Leave Management
              </button>
            </div>

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

            {/* Users Tab */}
            {tab === 'users' && (
              <div>
                <div className="mb-6 flex gap-2">
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {showCreateForm ? 'Cancel' : 'Create New User'}
                  </button>
                  <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Change Employee Password
                  </button>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                  <div className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Create New User</h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={createFormData.name}
                          onChange={(e) =>
                            setCreateFormData({ ...createFormData, name: e.target.value })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={createFormData.email}
                          onChange={(e) =>
                            setCreateFormData({ ...createFormData, email: e.target.value })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="Password (min 8 characters)"
                          value={createFormData.password}
                          onChange={(e) =>
                            setCreateFormData({ ...createFormData, password: e.target.value })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={createFormData.role}
                          onChange={(e) =>
                            setCreateFormData({ ...createFormData, role: e.target.value })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={ROLES.EMPLOYEE}>Select Role</option>
                          <option value={ROLES.MANAGER}>Manager</option>
                          <option value={ROLES.RETAIL_MANAGER}>Retail Manager</option>
                          <option value={ROLES.CEO}>CEO</option>
                          <option value={ROLES.HR}>HR</option>
                          {EMPLOYEE_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_DISPLAY_NAMES[role]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Create User
                      </button>
                    </form>
                  </div>
                )}

                {/* Users List */}
                {loading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">No users found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Role</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Leave Balance
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">{u.name}</td>
                            <td className="px-4 py-3">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {ROLE_DISPLAY_NAMES[u.role] || u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">{u.leave_balance} days</td>
                            <td className="px-4 py-3">
                              {u.email !== 'moustafa_nassar@baynoire.com' && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="text-red-600 hover:text-red-800 font-medium"
                                >
                                  Delete
                                </button>
                              )}
                              {u.email === 'moustafa_nassar@baynoire.com' && (
                                <span className="text-gray-500 text-sm">Protected</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Leave Management Tab */}
            {tab === 'leave' && (
              <div>
                <div className="mb-6 flex gap-2">
                  <button
                    onClick={() => setShowAddLeaveForm(!showAddLeaveForm)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    {showAddLeaveForm ? 'Cancel' : 'Add Leave Balance'}
                  </button>
                </div>

                {/* Add Leave Form */}
                {showAddLeaveForm && (
                  <div className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Add Leave Balance</h2>
                    <form onSubmit={handleAddLeaveBalance} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Leave Type (e.g., Annual Leave)"
                          value={addLeaveData.leaveName}
                          onChange={(e) =>
                            setAddLeaveData({ ...addLeaveData, leaveName: e.target.value })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="number"
                          placeholder="Number of Days"
                          min="1"
                          value={addLeaveData.days}
                          onChange={(e) =>
                            setAddLeaveData({ ...addLeaveData, days: e.target.value })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block font-medium mb-2 text-gray-700">
                          Select Employees
                        </label>
                        <div className="bg-white border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                          {employees.length === 0 ? (
                            <p className="text-gray-600">No employees found</p>
                          ) : (
                            employees.map((emp) => (
                              <label key={emp.id} className="flex items-center gap-2 py-2">
                                <input
                                  type="checkbox"
                                  checked={selectedEmployees.includes(emp.id)}
                                  onChange={() => handleEmployeeSelection(emp.id)}
                                  className="rounded"
                                />
                                <span>
                                  {emp.name} ({ROLE_DISPLAY_NAMES[emp.role]})
                                </span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        {selectedEmployees.length} employee(s) selected
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Add Leave Balance
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => fetchUsers()}
        />
      )}
    </div>
  )
}
