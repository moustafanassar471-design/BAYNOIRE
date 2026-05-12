import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export function Navbar() {
  const navigate = useNavigate()
  const { user, userRole, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center space-x-2 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">BAYNOIRE</h1>
          <span className="text-xs sm:text-sm text-gray-400 truncate">{t.hrManagement}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-3 py-1 border border-gray-500 rounded-lg text-xs"
          >
            {t.lang}
          </button>
          {user && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs sm:text-sm font-medium max-w-[120px] sm:max-w-[220px] truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{userRole}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs sm:text-sm font-medium transition"
              >
                {t.logout}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
