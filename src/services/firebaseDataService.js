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
} from 'firebase/firestore'
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth'
import { FirebaseError, deleteApp, getApps, initializeApp } from 'firebase/app'
import { db } from './firebase'
import { firebaseConfig } from './firebase'

const usersRef = collection(db, 'users')
const leaveRequestsRef = collection(db, 'leave_requests')

export async function createUserProfile(user, { name, role = 'employee', leaveBalance = 20 }) {
  await setDoc(doc(usersRef, user.uid), {
    id: user.uid,
    email: user.email,
    name: name?.trim() || user.email?.split('@')[0] || 'User',
    role,
    leave_balance: leaveBalance,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
}

export async function createEmployeeByManager({ name, email, password, leaveBalance = 20 }) {
  const appName = `employee-create-${Date.now()}`
  const secondaryApp = initializeApp(firebaseConfig, appName)
  const secondaryAuth = getAuth(secondaryApp)

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    await createUserProfile(credential.user, { name, role: 'employee', leaveBalance })
    await signOut(secondaryAuth)
    return credential.user
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
      throw new Error('Firestore rules denied employee profile creation.')
    }
    throw error
  } finally {
    const createdApp = getApps().find((a) => a.name === appName)
    if (createdApp) {
      await deleteApp(createdApp)
    }
  }
}

export async function getUserProfile(userId) {
  const snap = await getDoc(doc(usersRef, userId))
  return snap.exists() ? snap.data() : null
}

export async function getEmployees() {
  const q = query(usersRef, where('role', '==', 'employee'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data()).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

export async function updateEmployeeLeaveBalance(userId, value) {
  await updateDoc(doc(usersRef, userId), {
    leave_balance: value,
    updated_at: serverTimestamp(),
  })
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

export async function approveLeaveRequestAndDeductBalance({ requestId, userId, days }) {
  await runTransaction(db, async (tx) => {
    const leaveDocRef = doc(leaveRequestsRef, requestId)
    const userDocRef = doc(usersRef, userId)
    tx.update(leaveDocRef, { status: 'approved', updated_at: serverTimestamp() })
    tx.update(userDocRef, { leave_balance: increment(-days), updated_at: serverTimestamp() })
  })
}
