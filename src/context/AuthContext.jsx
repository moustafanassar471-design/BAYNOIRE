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

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
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
  }, [])

  const fetchUserRole = async (firebaseUser) => {
    try {
      const data = await getUserProfile(firebaseUser.uid)
      if (data?.role) {
        setUserRole(data.role)
        return
      }

      // Auto-heal missing profile document after successful auth login.
      await createUserProfile(firebaseUser, {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        role: 'employee',
      })
      setUserRole('employee')
    } catch (error) {
      if (error?.code === 'permission-denied' || error?.message?.includes('insufficient permissions')) {
        setAuthError('Firestore rules are blocking profile access. Please update your Firestore rules.')
      }
      console.error('Error fetching user role:', error)
    }
  }

  const signUp = async (email, password, name) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      if (name?.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() })
      }
      await createUserProfile(credential.user, { name, role: 'employee' })
      return { success: true, user: credential.user }
    } catch (error) {
      if (
        error?.status === 429 ||
        error?.code === 'auth/too-many-requests' ||
        error?.message?.toLowerCase().includes('rate limit') ||
        error?.message?.includes('429')
      ) {
        return {
          success: false,
          error: 'Too many signup attempts. Please wait 60 seconds, then try again.',
        }
      }
      if (error?.code === 'auth/operation-not-allowed') {
        return {
          success: false,
          error: 'Email/Password sign-up is disabled in Firebase. Enable it in Authentication > Sign-in method.',
        }
      }
      return { success: false, error: error.message }
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
          error: 'Invalid email or password. If this is a new account, sign up first.',
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
    signUp,
    signIn,
    signOut,
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
