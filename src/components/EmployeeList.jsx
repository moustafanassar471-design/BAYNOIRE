import React, { useEffect, useState } from 'react'
import {
  createUserByAdmin,
  getEmployees,
  updateEmployeeLeaveBalance,
  validatePassword,
} from '../services/firebaseDataService'
import { sendEmployeeResetEmail } from '../services/firebaseAdminService'

export function EmployeeList({ onDataChange }) {
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
    leaveBalance: 0,
  })
  const [resetLoadingId, setResetLoadingId] = useState(null)

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
      const result = await createUserByAdmin({
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.password,
        role: 'employee',
        leaveBalance: parseInt(newEmployee.leaveBalance, 10) || 0,
      })

      if (result.success) {
        setSuccessMsg(`Employee ${newEmployee.name} created successfully!`)
        setNewEmployee({ name: '', email: '', password: '', leaveBalance: 0 })
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

  if (loading) return <div className="p-6 text-center text-gray-500">Loading employees...</div>

  return (
    <div className="bg-card-bg rounded-lg shadow-sm border border-border-color overflow-hidden">
      <div className="p-6 border-b border-border-color">
        <h2 className="text-xl font-bold text-primary mb-4">Employees</h2>

        <form onSubmit={handleAddEmployee} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2 sm:gap-3">
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
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="bg-gray-50 border-b border-border-color">
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Login</th>
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
                  <td className="px-6 py-4 text-sm text-primary">{employee.email}</td>
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
                      <button
                        onClick={() => {
                          setEditingId(employee.id)
                          setNewBalance(String(employee.leave_balance))
                        }}
                        className="px-3 py-1 bg-accent text-white rounded-lg text-xs font-medium"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
