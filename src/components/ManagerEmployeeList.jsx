import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createUserByManager,
  getEmployees,
  updateEmployeeLeaveBalance,
  validatePassword,
  addLeaveBalanceToEmployees,
  setEmployeePassword,
} from '../services/firebaseDataService'
import { sendEmployeeResetEmail } from '../services/firebaseAdminService'
import { ROLE_DISPLAY_NAMES, MANAGER_CREATABLE_ROLES } from '../config/roleConfig'
import { ChangePasswordModal } from './ChangePasswordModal'

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
  })

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)

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
      })

      if (result.success) {
        setSuccessMsg(`Employee ${newEmployee.name} created successfully!`)
        setNewEmployee({
          name: '',
          email: '',
          password: '',
          role: 'assistant-manager',
        })

        await fetchEmployees()
        onDataChange?.()
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

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId
            ? { ...emp, leave_balance: parseInt(newBalance, 10) }
            : emp
        )
      )

      setEditingId(null)
      setNewBalance('')
      setSuccessMsg('Leave balance updated successfully')
      onDataChange?.()
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
        setSuccessMsg('Leave balance added successfully')
        setAddLeaveData({ leaveName: '', days: '' })
        setSelectedEmployees([])
        onLeaveFormToggle?.(false)
        fetchEmployees()
        onDataChange?.()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading employees...</div>
  }

  return (
    <div className="bg-card-bg rounded-lg shadow-sm border border-border-color overflow-hidden">

      <div className="p-6 border-b border-border-color">
        <h2 className="text-xl font-bold text-primary mb-4">Employees</h2>

        <form
          onSubmit={handleAddEmployee}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-2 sm:gap-3"
        >
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
      {successMsg && <div className="mx-6 mt-4 p-3 bg-green-100 text-green-700 rounded-lg">{successMsg}</div>}

      <div className="overflow-x-auto mt-4">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-b border-border-color">
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Reset</th>
              <th className="px-6 py-4 text-left">Balance</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4">{employee.name}</td>
                  <td className="px-6 py-4">{employee.email}</td>
                  <td className="px-6 py-4">
                    {ROLE_DISPLAY_NAMES[employee.role]}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSendReset(employee.email, employee.id)}
                    >
                      Send Link
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    {editingId === employee.id ? (
                      <input
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
                      />
                    ) : (
                      employee.leave_balance
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {editingId === employee.id ? (
                      <>
                        <button onClick={() => handleUpdateBalance(employee.id)}>
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)}>
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
                        >
                          Edit
                        </button>

                        <button onClick={() => navigate(`/employee/${employee.id}`)}>
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

      {/* Change Password Button */}
      <div className="px-6 py-4 border-t border-border-color">
        <button
          onClick={() => setShowChangePasswordModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Change Employee Password
        </button>
      </div>

      {/* Leave Form */}
      {showLeaveForm && (
        <div className="border-t p-6 bg-gray-50">
          <h3 className="font-bold mb-4">Add Leave Balance</h3>

          <form onSubmit={handleAddLeaveBalance}>
            <input
              type="text"
              placeholder="Leave Name"
              value={addLeaveData.leaveName}
              onChange={(e) =>
                setAddLeaveData({ ...addLeaveData, leaveName: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Days"
              value={addLeaveData.days}
              onChange={(e) =>
                setAddLeaveData({ ...addLeaveData, days: e.target.value })
              }
            />

            <div>
              {employees.map((emp) => (
                <label key={emp.id}>
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(emp.id)}
                    onChange={() => handleEmployeeSelection(emp.id)}
                  />
                  {emp.name}
                </label>
              ))}
            </div>

            <button type="submit">Add</button>
            <button type="button" onClick={() => onLeaveFormToggle?.(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          setShowChangePasswordModal(false)
          fetchEmployees()
          onDataChange?.()
        }}
      />
    </div>
  )
}