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

  if (newPassword.length < 8) {
    throw new HttpsError('invalid-argument', 'Password must be at least 8 characters.')
  }

  // Check if the caller is an admin or manager
  const adminDoc = await admin.firestore().collection('users').doc(auth.uid).get()
  const adminData = adminDoc.data()
  if (!adminData || (adminData.role !== 'admin' && adminData.role !== 'manager')) {
    throw new HttpsError('permission-denied', 'Only admin or manager can change employee passwords.')
  }

  // Update the password for the target user
  await admin.auth().updateUser(uid, { password: newPassword })

  return { success: true }
})
