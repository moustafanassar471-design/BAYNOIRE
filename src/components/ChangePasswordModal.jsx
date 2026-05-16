import React, { useState, useEffect } from 'react'
import { getEmployees } from '../services/firebaseDataService'
import { setEmployeePassword } from '../services/firebaseAdminService'

export function ChangePasswordModal({ isOpen, onClose, onSuccess }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await getEmployees()
      setEmployees(data || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Error loading employees')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    // Validation
    if (!selectedEmployeeId) {
      setError('Please select an employee')
      return
    }

    if (!newPassword || !confirmPassword) {
      setError('Please enter both passwords')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      await setEmployeePassword(selectedEmployeeId, newPassword)
      setSuccessMsg('Password changed successfully!')
      
      // Reset form
      setSelectedEmployeeId('')
      setNewPassword('')
      setConfirmPassword('')

      // Call onSuccess callback and close after a short delay
      setTimeout(() => {
        if (onSuccess) onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Error changing password')
    } finally {
      setSaving(false)
    }
  }

  const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Change Employee Password</h2>
        </div>

        {/* Content */}
        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
              {successMsg}
            </div>
          )}

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>
            {loading ? (
              <div className="px-4 py-2 text-gray-500 text-sm">Loading employees...</div>
            ) : (
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">-- Select an employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Employee Info */}
          {selectedEmployee && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div className="font-medium text-blue-900">{selectedEmployee.name}</div>
              <div className="text-blue-700">{selectedEmployee.email}</div>
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 8 characters)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loading || !selectedEmployeeId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
