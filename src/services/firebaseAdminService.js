import { getFunctions, httpsCallable } from 'firebase/functions'
import { auth } from './firebase'

const functions = getFunctions()

export async function setEmployeePassword(uid, newPassword) {
  const callable = httpsCallable(functions, 'setEmployeePassword')
  await callable({ uid, newPassword })
}

export async function sendEmployeeResetEmail(email) {
  const { sendPasswordResetEmail } = await import('firebase/auth')
  await sendPasswordResetEmail(auth, email)
}
