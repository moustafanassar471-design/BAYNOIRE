import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { createUserProfile, getUserProfile } from '../services/firebaseDataService'
import { DEFAULT_ADMIN, ROLES } from '../config/roleConfig'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  // Auto-create default admin account on first initialization
  useEffect(() => {
    const initializeDefaultAdmin = async () => {
      try {
        const adminProfile = await getUserProfile('admin-default')
        if (!adminProfile) {
          // Try to create default admin
          const credential = await createUserWithEmailAndPassword(
            auth,
            DEFAULT_ADMIN.email,
            DEFAULT_ADMIN.password
          )
          await createUserProfile(credential.user, {
            name: DEFAULT_ADMIN.name,
            role: DEFAULT_ADMIN.role,
            leaveBalance: 0,
          })
          // Sign out after creation
          await firebaseSignOut(auth)
        }
      } catch (error) {
        // Admin might already exist or error creating it
        if (error?.code === 'auth/email-already-in-use') {
          // Admin already exists, which is fine
        } else {
          console.error('Error initializing default admin:', error)
        }
      } finally {
        setIsInitialized(true)
      }
    }

    initializeDefaultAdmin()
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError('')
      setUser(firebaseUser ?? null)
      if (firebaseUser) {
        await fetchUserRole(firebaseUser)
      } else {
        setUserRole(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [isInitialized])

  const fetchUserRole = async (firebaseUser) => {
    try {
      const data = await getUserProfile(firebaseUser.uid)
      if (data?.role) {
        setUserRole(data.role)
        return
      }

      // Auto-heal missing profile document after successful auth login
      // Default to employee role for safety
      await createUserProfile(firebaseUser, {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        role: 'employee',
        leaveBalance: 0,
      })
      setUserRole('employee')
    } catch (error) {
      if (error?.code === 'permission-denied' || error?.message?.includes('insufficient permissions')) {
        setAuthError('Firestore rules are blocking profile access. Please update your Firestore rules.')
      }
      console.error('Error fetching user role:', error)
    }
  }

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error) {
      if (
        error?.code === 'auth/invalid-credential' ||
        error?.code === 'auth/wrong-password' ||
        error?.code === 'auth/user-not-found'
      ) {
        return {
          success: false,
          error: 'Invalid email or password.',
        }
      }
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setUserRole(null)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    userRole,
    loading,
    authError,
    signIn,
    signOut,
    isInitialized,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
