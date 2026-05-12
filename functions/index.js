const admin = require('firebase-admin')
const { onCall, HttpsError } = require('firebase-functions/v2/https')

admin.initializeApp()

exports.setEmployeePassword = onCall(async (request) => {
  const auth = request.auth
  const data = request.data || {}
  const { uid, newPassword } = data

  if (!auth?.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }

  if (!uid || !newPassword || typeof newPassword !== 'string') {
    throw new HttpsError('invalid-argument', 'uid and newPassword are required.')
  }

  if (newPassword.length < 6) {
    throw new HttpsError('invalid-argument', 'Password must be at least 6 characters.')
  }

  const managerDoc = await admin.firestore().collection('users').doc(auth.uid).get()
  const managerData = managerDoc.data()
  if (!managerData || managerData.role !== 'manager') {
    throw new HttpsError('permission-denied', 'Only managers can change employee passwords.')
  }

  const employeeDoc = await admin.firestore().collection('users').doc(uid).get()
  const employeeData = employeeDoc.data()
  if (!employeeData || employeeData.role !== 'employee') {
    throw new HttpsError('failed-precondition', 'Target user is not an employee.')
  }

  await admin.auth().updateUser(uid, { password: newPassword })

  return { success: true }
})
