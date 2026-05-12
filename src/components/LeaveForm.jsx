import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createLeaveRequest } from '../services/firebaseDataService'
import { useLanguage } from '../context/LanguageContext'

export function LeaveForm({ onSuccess }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  })

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
      setError(t.fillAllFields)
      setLoading(false)
      return
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError(t.endDateAfter)
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

      setSuccess(t.leaveSubmitted)
      setFormData({ startDate: '', endDate: '', reason: '' })
      if (onSuccess) onSuccess()
    } catch (error) {
      setError(error.message || t.submitRequest)
    } finally {
      setLoading(false)
    }
  }

  const days = calculateDays(formData.startDate, formData.endDate)

  return (
    <div className="bg-card-bg rounded-lg p-4 sm:p-6 shadow-sm border border-border-color">
      <h2 className="text-xl font-bold text-primary mb-4">{t.requestLeave}</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t.startDate}
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
              {t.endDate}
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
          <div className="p-3 bg-blue-100 text-blue-800 rounded-lg text-sm">
            {t.totalLeave}: <strong>{days} {t.days}</strong>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            {t.reason}
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="4"
            placeholder={t.reason}
            className="w-full px-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-accent hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? t.submitting : t.submitRequest}
        </button>
      </form>
    </div>
  )
}
