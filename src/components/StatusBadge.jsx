import React from 'react'

export function StatusBadge({ status }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles()}`}>
      {formatStatus(status)}
    </span>
  )
}
