import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { createLeaveRequest, getUserProfile } from '../services/firebaseDataService'

export function LeaveForm({ onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [leaveBalance, setLeaveBalance] = useState(0)
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  })

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
    }
  }

  const calculateDays = (start, end) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be after start date')
      setLoading(false)
      return
    }

    const requestedDays = calculateDays(formData.startDate, formData.endDate)

    // Validate against leave balance
    if (requestedDays > leaveBalance) {
      setError(`You don't have enough leave balance. Requested: ${requestedDays} days, Available: ${leaveBalance} days`)
      setLoading(false)
      return
    }

    try {
      await createLeaveRequest({
        userId: user.uid,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      })

      setSuccess('Leave request submitted successfully!')
      setFormData({ startDate: '', endDate: '', reason: '' })
      if (onSuccess) onSuccess()
    } catch (error) {
      setError(error.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  const days = calculateDays(formData.startDate, formData.endDate)

  return (
    <div className="bg-card-bg rounded-lg p-4 sm:p-6 shadow-sm border border-border-color">
      <h2 className="text-xl font-bold text-primary mb-4">Request Leave</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {days > 0 && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            days > leaveBalance
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            Days requested: <strong>{days}</strong> | Available balance: <strong>{leaveBalance}</strong>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Reason
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="4"
            placeholder="Enter reason for leave"
            className="w-full px-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-accent hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  )
}
