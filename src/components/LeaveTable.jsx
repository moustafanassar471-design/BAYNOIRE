import React, { useState, useEffect } from 'react'
import { StatusBadge } from './StatusBadge'
import {
  approveLeaveRequestAndDeductBalance,
  getLeaveRequests,
  updateLeaveRequestStatus,
} from '../services/firebaseDataService'
import { useLanguage } from '../context/LanguageContext'

export function LeaveTable({ userId, showActions = false, onUpdate }) {
  const { t } = useLanguage()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchLeaveRequests()
  }, [userId])

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      const data = await getLeaveRequests({ userId })
      setLeaveRequests(data || [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateDays = (start, end) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate - startDate)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleApprove = async (requestId) => {
    setActionLoading(requestId)
    try {
      const request = leaveRequests.find((r) => r.id === requestId)
      if (request) {
        const days = calculateDays(request.start_date, request.end_date)
        await approveLeaveRequestAndDeductBalance({
          requestId,
          userId: request.user_id,
          days,
        })
      }
      setLeaveRequests(
        leaveRequests.map((req) => (req.id === requestId ? { ...req, status: 'approved' } : req))
      )
      if (onUpdate) onUpdate()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (requestId) => {
    setActionLoading(requestId)
    try {
      await updateLeaveRequestStatus(requestId, 'rejected')
      setLeaveRequests(
        leaveRequests.map((req) => (req.id === requestId ? { ...req, status: 'rejected' } : req))
      )
      if (onUpdate) onUpdate()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredRequests =
    filterStatus === 'all'
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === filterStatus)

  if (loading) {
    return <div className="p-6 text-center text-gray-500">{t.loading}</div>
  }

  if (error) {
    return <div className="p-6 text-red-600 bg-red-100 rounded-lg">Error: {error}</div>
  }

  return (
    <div className="bg-card-bg rounded-lg shadow-sm border border-border-color overflow-hidden">
      <div className="p-6 border-b border-border-color">
        <h2 className="text-xl font-bold text-primary mb-4">{t.leaveRequests}</h2>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === status
                  ? 'bg-accent text-white'
                  : 'bg-white border border-border-color text-primary hover:bg-gray-50'
              }`}
            >
              {t[status]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="bg-gray-50 border-b border-border-color">
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                {showActions ? t.employee : t.period}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">{t.startDate} / {t.endDate}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">{t.days}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">{t.reason}</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">{t.requestStatus}</th>
              {showActions && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary">{t.actions}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 6 : 5} className="px-6 py-4 text-center text-gray-500">
                  {t.noLeaveRequests}
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-primary">
                    {showActions ? request.users?.name : t.requestLeave}
                  </td>
                  <td className="px-6 py-4 text-sm text-primary">
                    {new Date(request.start_date).toLocaleDateString()} -{' '}
                    {new Date(request.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-primary">
                    {calculateDays(request.start_date, request.end_date)} {t.days}
                  </td>
                  <td className="px-6 py-4 text-sm text-primary truncate max-w-xs">{request.reason}</td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={request.status} />
                  </td>
                  {showActions && request.status === 'pending' && (
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                        className="px-3 py-1 bg-success hover:bg-green-600 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                      >
                        {t.approved}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading === request.id}
                        className="px-3 py-1 bg-danger hover:bg-red-600 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                      >
                        {t.rejected}
                      </button>
                    </td>
                  )}
                  {showActions && request.status !== 'pending' && (
                    <td className="px-6 py-4 text-sm text-gray-500">-</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
