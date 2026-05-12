import React, { useEffect, useState } from 'react'
import {
  createEmployeeByManager,
  getEmployees,
  updateEmployeeLeaveBalance,
} from '../services/firebaseDataService'
import { useLanguage } from '../context/LanguageContext'
import { sendEmployeeResetEmail, setEmployeePassword } from '../services/firebaseAdminService'

export function EmployeeList({ onDataChange }) {
  const { t } = useLanguage()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [newBalance, setNewBalance] = useState('')
  const [adding, setAdding] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    leaveBalance: 20,
  })
  const [resetLoadingId, setResetLoadingId] = useState(null)
  const [passwordDrafts, setPasswordDrafts] = useState({})

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
      setError(t.fillAllFields)
      return
    }
    setAdding(true)
    setError('')
    try {
      await createEmployeeByManager({
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.password,
        leaveBalance: parseInt(newEmployee.leaveBalance, 10) || 20,
      })
      setNewEmployee({ name: '', email: '', password: '', leaveBalance: 20 })
      await fetchEmployees()
      if (onDataChange) onDataChange()
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
      if (onDataChange) onDataChange()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSendReset = async (email, employeeId) => {
    setResetLoadingId(employeeId)
    setError('')
    try {
      await sendEmployeeResetEmail(email)
      setError(`Password reset link sent to ${email}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setResetLoadingId(null)
    }
  }

  const handleSetPassword = async (employeeId) => {
    const draft = passwordDrafts[employeeId] || ''
    if (draft.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setResetLoadingId(employeeId)
    setError('')
    try {
      await setEmployeePassword(employeeId, draft)
      setPasswordDrafts((prev) => ({ ...prev, [employeeId]: '' }))
      setError('Password updated successfully')
    } catch (err) {
      setError(err.message)
    } finally {
      setResetLoadingId(null)
    }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">{t.loading}</div>

  return (
    <div className="bg-card-bg rounded-lg shadow-sm border border-border-color overflow-hidden">
      <div className="p-6 border-b border-border-color">
        <h2 className="text-xl font-bold text-primary mb-4">{t.employees}</h2>

        <form onSubmit={handleAddEmployee} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2 sm:gap-3">
          <input
            type="text"
            placeholder={t.name}
            value={newEmployee.name}
            onChange={(e) => setNewEmployee((p) => ({ ...p, name: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="email"
            placeholder={t.email}
            value={newEmployee.email}
            onChange={(e) => setNewEmployee((p) => ({ ...p, email: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="password"
            placeholder={t.password}
            value={newEmployee.password}
            onChange={(e) => setNewEmployee((p) => ({ ...p, password: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            min="0"
            placeholder={t.leaveBalance}
            value={newEmployee.leaveBalance}
            onChange={(e) => setNewEmployee((p) => ({ ...p, leaveBalance: e.target.value }))}
            className="px-3 py-2 border rounded-lg"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 bg-accent text-white rounded-lg disabled:opacity-50"
          >
            {adding ? t.creatingAccount : t.addEmployee}
          </button>
        </form>
      </div>

      {error && <div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="overflow-x-auto mt-4">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="bg-gray-50 border-b border-border-color">
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">{t.name}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">{t.email}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Login</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Password</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">{t.leaveBalance}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  {t.noEmployees}
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-primary">{employee.name}</td>
                  <td className="px-6 py-4 text-sm text-primary">{employee.email}</td>
                  <td className="px-6 py-4 text-sm text-primary">{employee.email}</td>
                  <td className="px-6 py-4 text-sm text-primary">
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={passwordDrafts[employee.id] || ''}
                        onChange={(e) =>
                          setPasswordDrafts((prev) => ({ ...prev, [employee.id]: e.target.value }))
                        }
                        placeholder="New password"
                        className="w-32 px-2 py-1 border rounded text-xs"
                      />
                      <button
                        onClick={() => handleSetPassword(employee.id)}
                        disabled={resetLoadingId === employee.id}
                        className="px-2 py-1 bg-purple-600 text-white rounded text-xs disabled:opacity-50"
                      >
                        {resetLoadingId === employee.id ? 'Saving...' : 'Set'}
                      </button>
                    </div>
                    <div className="mt-2">
                    <button
                      onClick={() => handleSendReset(employee.email, employee.id)}
                      disabled={resetLoadingId === employee.id}
                      className="px-2 py-1 bg-indigo-600 text-white rounded text-xs disabled:opacity-50"
                    >
                      {resetLoadingId === employee.id ? 'Sending...' : 'Reset'}
                    </button>
                    </div>
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
                      <span className="font-semibold">
                        {employee.leave_balance} {t.days}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {editingId === employee.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateBalance(employee.id)}
                          className="px-3 py-1 bg-success text-white rounded-lg text-xs font-medium"
                        >
                          {t.save}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setNewBalance('')
                          }}
                          className="px-3 py-1 bg-gray-400 text-white rounded-lg text-xs font-medium"
                        >
                          {t.cancel}
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
                        {t.edit}
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
