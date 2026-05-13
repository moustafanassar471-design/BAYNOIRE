import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please enter email and password')
      setLoading(false)
      return
    }

    const result = await signIn(formData.email, formData.password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">BAYNOIRE</h1>
            <p className="text-gray-600">HR Management System</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-black hover:bg-gray-900 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>

          {/* Info Message */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Contact your administrator to create an account</p>
          </div>
        </div>
      </div>
    </div>
  )
}
