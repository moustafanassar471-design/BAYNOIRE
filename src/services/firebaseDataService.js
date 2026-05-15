import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  addDoc,
  deleteDoc,
} from 'firebase/firestore'
import { createUserWithEmailAndPassword, getAuth, signOut, deleteUser } from 'firebase/auth'
import { FirebaseError, deleteApp, getApps, initializeApp } from 'firebase/app'
import { db } from './firebase'
import { firebaseConfig } from './firebase'
import { EMPLOYEE_ROLES, MANAGER_CREATABLE_ROLES } from '../config/roleConfig'

const usersRef = collection(db, 'users')
const leaveRequestsRef = collection(db, 'leave_requests')

// Validate password strength
export function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  return { valid: true }
}

// Check if email already exists
export async function checkEmailExists(email) {
  try {
    const q = query(usersRef, where('email', '==', email.toLowerCase()))
    const snap = await getDocs(q)
    return snap.docs.length > 0
  } catch (error) {
    console.error('Error checking email:', error)
    return false
  }
}

export async function createUserProfile(user, { name, role = 'employee', leaveBalance = 0 }) {
  await setDoc(doc(usersRef, user.uid), {
    id: user.uid,
    email: user.email,
    name: name?.trim() || user.email?.split('@')[0] || 'User',
    role,
    leave_balance: 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
}

// Create user (Admin or Manager only)
export async function createUserByAdmin({ name, email, password, role, leaveBalance = 0 }) {
  // Validate password (unless it's a fixed admin password)
  const validation = validatePassword(password)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  // Check for duplicate email
  const emailExists = await checkEmailExists(email)
  if (emailExists) {
    return { success: false, error: 'Email already exists' }
  }

  const appName = `user-create-${Date.now()}`
  const secondaryApp = initializeApp(firebaseConfig, appName)
  const secondaryAuth = getAuth(secondaryApp)

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    await createUserProfile(credential.user, { name, role, leaveBalance })
    await signOut(secondaryAuth)
    return { success: true, user: credential.user }
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'Email already exists' }
      }
      if (error.code === 'permission-denied') {
        return { success: false, error: 'Permission denied. Firestore rules may need updating.' }
      }
    }
    return { success: false, error: error.message }
  } finally {
    const createdApp = getApps().find((a) => a.name === appName)
    if (createdApp) {
      await deleteApp(createdApp)
    }
  }
}

// Create user by Manager (with role restrictions)
export async function createUserByManager({ name, email, password, role, leaveBalance = 0 }) {
  // Validate that the role is allowed for Manager creation
  if (!MANAGER_CREATABLE_ROLES.includes(role)) {
    return { success: false, error: `Manager cannot create users with role: ${role}` }
  }

  // Use the same creation logic as admin
  return createUserByAdmin({ name, email, password, role, leaveBalance })
}

// Delete user (Admin and Manager only, with restrictions)
export async function deleteUserAccount(userId) {
  try {
    const userProfile = await getUserProfile(userId)
    
    // Prevent deletion of admin account
    if (userProfile?.email === 'moustafa_nassar@baynoire.com') {
      return { success: false, error: 'Cannot delete the root administrator account' }
    }

    // Delete from Firestore
    await deleteDoc(doc(usersRef, userId))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function createEmployeeByManager({ name, email, password, leaveBalance = 0 }) {
  return createUserByAdmin({ name, email, password, role: 'employee', leaveBalance })
}

export async function getUserProfile(userId) {
  const snap = await getDoc(doc(usersRef, userId))
  return snap.exists() ? snap.data() : null
}

// Get all users (Admin only)
export async function getAllUsers() {
  try {
    const snap = await getDocs(usersRef)
    return snap.docs.map((d) => d.data()).sort((a, b) => {
      const roleOrder = { admin: 0, manager: 1 }
      const aOrder = roleOrder[a.role] ?? 2
      const bOrder = roleOrder[b.role] ?? 2
      if (aOrder !== bOrder) return aOrder - bOrder
      return (a.name || '').localeCompare(b.name || '')
    })
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

// Get employees only (sorted by role as per requirements)
export async function getEmployees() {
  try {
    const snap = await getDocs(usersRef)
    const employees = snap.docs
      .map((d) => d.data())
      .filter((u) => EMPLOYEE_ROLES.includes(u.role))

    // Sort by employee role order
    const roleOrder = {
      'assistant-manager': 0,
      'senior-supervisor': 1,
      'supervisor': 2,
      'senior-sales': 3,
      'sales': 4,
    }

    return employees.sort((a, b) => {
      const aOrder = roleOrder[a.role] ?? 999
      const bOrder = roleOrder[b.role] ?? 999
      if (aOrder !== bOrder) return aOrder - bOrder
      return (a.name || '').localeCompare(b.name || '')
    })
  } catch (error) {
    console.error('Error getting employees:', error)
    return []
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    await updateDoc(doc(usersRef, userId), {
      ...updates,
      updated_at: serverTimestamp(),
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateEmployeeLeaveBalance(userId, value) {
  await updateDoc(doc(usersRef, userId), {
    leave_balance: value,
    updated_at: serverTimestamp(),
  })
}

// Add leave balance to multiple employees
export async function addLeaveBalanceToEmployees(employeeIds, leaveName, days) {
  try {
    const updates = employeeIds.map((id) =>
      updateDoc(doc(usersRef, id), {
        leave_balance: increment(parseInt(days, 10) || 0),
        updated_at: serverTimestamp(),
      })
    )
    await Promise.all(updates)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function createLeaveRequest({ userId, startDate, endDate, reason }) {
  await addDoc(leaveRequestsRef, {
    user_id: userId,
    start_date: startDate,
    end_date: endDate,
    reason,
    status: 'pending',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
}

export async function getLeaveRequests({ userId } = {}) {
  const q = userId
    ? query(leaveRequestsRef, where('user_id', '==', userId), orderBy('created_at', 'desc'))
    : query(leaveRequestsRef, orderBy('created_at', 'desc'))

  const snap = await getDocs(q)
  const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  const userIds = [...new Set(requests.map((r) => r.user_id).filter(Boolean))]
  const users = await Promise.all(userIds.map((id) => getUserProfile(id)))
  const userMap = {}
  users.forEach((u) => {
    if (u?.id) userMap[u.id] = u
  })

  return requests.map((r) => ({
    ...r,
    users: userMap[r.user_id] ? { name: userMap[r.user_id].name, email: userMap[r.user_id].email } : null,
  }))
}

export async function updateLeaveRequestStatus(requestId, status) {
  await updateDoc(doc(leaveRequestsRef, requestId), {
    status,
    updated_at: serverTimestamp(),
  })
}

export async function deleteLeaveRequest(requestId) {
  try {
    await deleteDoc(doc(leaveRequestsRef, requestId))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function approveLeaveRequestAndDeductBalance({ requestId, userId, days }) {
  await runTransaction(db, async (tx) => {
    const leaveDocRef = doc(leaveRequestsRef, requestId)
    const userDocRef = doc(usersRef, userId)
    tx.update(leaveDocRef, { status: 'approved', updated_at: serverTimestamp() })
    tx.update(userDocRef, { leave_balance: increment(-days), updated_at: serverTimestamp() })
  })
}
