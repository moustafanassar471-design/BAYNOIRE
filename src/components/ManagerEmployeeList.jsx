import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createUserByManager,
  getEmployees,
  updateEmployeeLeaveBalance,
  validatePassword,
  addLeaveBalanceToEmployees,
} from '../services/firebaseDataService'
import { sendEmployeeResetEmail } from '../services/firebaseAdminService'
import { ROLE_DISPLAY_NAMES, MANAGER_CREATABLE_ROLES } from '../config/roleConfig'

export function ManagerEmployeeList({ onDataChange, showLeaveForm = false, onLeaveFormToggle = null }) {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [newBalance, setNewBalance] = useState('')
  const [adding, setAdding] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    role: 'assistant-manager',
    leaveBalance: 0,
  })
  const [resetLoadingId, setResetLoadingId] = useState(null)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [addLeaveData, setAddLeaveData] = useState({
    leaveName: '',
    days: '',
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const data = await getEmployees()
      setEmployees(data || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) {
      setError('Please fill in all fields')
      return
    }

    // Validate password
    const validation = validatePassword(newEmployee.password)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setAdding(true)
    setError('')
    setSuccessMsg('')

    try {
      const result = await createUserByManager({
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.password,
        role: newEmployee.role,
        leaveBalance: parseInt(newEmployee.leaveBalance, 10) || 0,
      })

      if (result.success) {
        setSuccessMsg(`Employee ${newEmployee.name} created successfully!`)
        setNewEmployee({ name: '', email: '', password: '', role: 'assistant-manager', leaveBalance: 0 })
        await fetchEmployees()
        if (onDataChange) onDataChange()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleUpdateBalance = async (employeeId) => {
    if (!newBalance || Number.isNaN(Number(newBalance))) {
      setError('Please enter a valid number')
      return
    }
    try {
      await updateEmployeeLeaveBalance(employeeId, parseInt(newBalance, 10))
      setEmployees(
        employees.map((emp) =>
          emp.id === employeeId ? { ...emp, leave_balance: parseInt(newBalance, 10) } : emp
        )
      )
      setEditingId(null)
      setNewBalance('')
      setError('')
      setSuccessMsg('Leave balance updated successfully')
      if (onDataChange) onDataChange()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSendReset = async (email, employeeId) => {
    setResetLoadingId(employeeId)
    setError('')
    setSuccessMsg('')
    try {
      await sendEmployeeResetEmail(email)
      setSuccessMsg(`Password reset link sent to ${email}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setResetLoadingId(null)
    }
  }

  const handleEmployeeSelection = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    )
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
        if (onLeaveFormToggle) onLeaveFormToggle(false)
        await fetchEmployees()
        if (onDataChange) onDataChange()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message || 'Error adding leave balance')
    }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Loading employees...</div>

  return (
    <div className="bg-card-bg rounded-lg shadow-sm border border-border-color overflow-hidden">
      <div className="p-6 border-b border-border-color">
        <h2 className="text-xl font-bold text-primary mb-4">Employees</h2>

        <form onSubmit={handleAddEmployee} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="Full Name"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee((p) => ({ ...p, name: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee((p) => ({ ...p, email: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password (min 8 chars)"
            value={newEmployee.password}
            onChange={(e) => setNewEmployee((p) => ({ ...p, password: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          />
          <select
            value={newEmployee.role}
            onChange={(e) => setNewEmployee((p) => ({ ...p, role: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          >
            {MANAGER_CREATABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_DISPLAY_NAMES[role]}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            placeholder="Leave Balance"
            value={newEmployee.leaveBalance}
            onChange={(e) => setNewEmployee((p) => ({ ...p, leaveBalance: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 bg-accent text-white rounded-lg disabled:opacity-50"
          >
            {adding ? 'Creating...' : 'Add Employee'}
          </button>
        </form>
      </div>

      {error && <div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      {successMsg && (
        <div className="mx-6 mt-4 p-3 bg-green-100 text-green-700 rounded-lg">{successMsg}</div>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-b border-border-color">
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Password Reset</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Leave Balance</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-primary">{employee.name}</td>
                  <td className="px-6 py-4 text-sm text-primary">{employee.email}</td>
                  <td className="px-6 py-4 text-sm text-primary">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {ROLE_DISPLAY_NAMES[employee.role] || employee.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-primary">
                    <button
                      onClick={() => handleSendReset(employee.email, employee.id)}
                      disabled={resetLoadingId === employee.id}
                      className="px-2 py-1 bg-indigo-600 text-white rounded text-xs disabled:opacity-50"
                    >
                      {resetLoadingId === employee.id ? 'Sending...' : 'Send Link'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-primary">
                    {editingId === employee.id ? (
                      <input
                        type="number"
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
                        className="w-24 px-2 py-1 border rounded-lg"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold">{employee.leave_balance} days</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {editingId === employee.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateBalance(employee.id)}
                          className="px-3 py-1 bg-success text-white rounded-lg text-xs font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setNewBalance('')
                          }}
                          className="px-3 py-1 bg-gray-400 text-white rounded-lg text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(employee.id)
                            setNewBalance(String(employee.leave_balance))
                          }}
                          className="px-3 py-1 bg-accent text-white rounded-lg text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(`/employee/${employee.id}`)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium"
                        >
                          Details
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Leave Balance Form */}
      {showLeaveForm && (
        <div className="border-t border-border-color p-6 bg-gray-50">
          <h3 className="text-lg font-bold mb-4 text-primary">Add Leave Balance</h3>
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

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Add Leave Balance
              </button>
              <button
                type="button"
                onClick={() => onLeaveFormToggle?.(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
