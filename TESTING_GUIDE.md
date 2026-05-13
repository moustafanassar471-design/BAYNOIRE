# BAYNOIRE HR - Quick Testing Guide

## Default Credentials
```
Email: moustafa_nassar@baynoire.com
Password: 35415555
Role: Admin
```
This account will be auto-created when the app first initializes.

## Testing Workflows

### 1. Test Default Admin Account
1. Clear browser data/cache (to simulate first app load)
2. App initializes and auto-creates admin account
3. Login with provided credentials
4. Should redirect to `/admin-dashboard`
5. Verify admin account cannot be deleted

### 2. Test Admin Creates User
1. Login as admin
2. Go to User Management tab
3. Click "Create New User"
4. Try to create with:
   - Password < 8 characters → Should show error "Password must be at least 8 characters"
   - Duplicate email → Should show "Email already exists"
   - Valid data → Should create successfully

### 3. Test Role-Based Access
1. Create test user with each role:
   - Manager
   - Retail Manager
   - CEO
   - HR
   - Assistant Manager (employee)
   - Senior Sales (employee)

2. Login as Manager:
   - Should access `/manager-dashboard`
   - Can create/delete employees
   - Can approve/reject leave
   - Cannot access admin panel

3. Login as Retail Manager:
   - Should access `/dashboard`
   - Read-only view only
   - No edit/delete/approve buttons

4. Login as Employee (e.g., Assistant Manager):
   - Should access `/employee-dashboard`
   - Can request leave
   - Cannot access employee list or approvals

### 4. Test Leave Balance Validation
1. Create employee with 0 leave balance
2. Login as that employee
3. Try to request 5 days leave
4. Should show error: "You don't have enough leave balance"
5. Admin adds 10 days leave to employee
6. Employee tries to request 5 days → Should succeed

### 5. Test Password Validation
1. Try to create user with password: "pass123" (7 chars)
   - Should reject: "Password must be at least 8 characters"
2. Try with password: "password123" (11 chars)
   - Should succeed

### 6. Test URL Protection
1. Logout
2. Try to access `/admin-dashboard` directly
   - Should redirect to login
3. Login as employee
4. Try to access `/admin-dashboard`
   - Should redirect to employee dashboard
5. Login as manager
6. Try to access `/admin-dashboard`
   - Should redirect to manager dashboard

### 7. Test Admin Cannot Be Deleted
1. Login as admin
2. Go to User Management
3. Look for moustafa_nassar@baynoire.com
4. "Delete" button should say "Protected" instead
5. Cannot delete default admin

### 8. Test Email Duplicate Prevention
1. Try to create two users with same email
   - First creation → Success
   - Second creation → Error "Email already exists"

### 9. Test Leave Balance Management (Admin)
1. Login as admin
2. Go to Leave Management tab
3. Click "Add Leave Balance"
4. Select multiple employees
5. Enter leave type and days
6. Submit
7. Verify employees' balances updated

### 10. Test Manager Bulk Operations
1. Login as manager
2. Create multiple employees
3. Add leave balance to each
4. Try to delete an employee
5. Verify deleted from system

## Expected Behavior Summary

| Role | Login | Dashboard | Create Users | Delete Users | Approve Leave | Add Balance | Delete Leave |
|------|-------|-----------|--------------|--------------|---------------|-------------|--------------|
| Admin | ✓ | `/admin-dashboard` | ✓ | ✓ (not self) | ✓ | ✓ | ✓ |
| Manager | ✓ | `/manager-dashboard` | ✓ (Emp only) | ✓ (Emp only) | ✓ | ✓ | ✗ |
| Retail Manager | ✓ | `/dashboard` | ✗ | ✗ | ✗ | ✗ | ✗ |
| CEO | ✓ | `/dashboard` | ✗ | ✗ | ✗ | ✗ | ✗ |
| HR | ✓ | `/dashboard` | ✗ | ✗ | ✗ | ✗ | ✗ |
| Employee* | ✓ | `/employee-dashboard` | ✗ | ✗ | ✗ | ✗ | ✗ |

*Employee roles: Assistant Manager, Senior Supervisor, Supervisor, Senior Sales, Sales

## Error Messages to Verify

1. **"Password must be at least 8 characters"** - When creating user with short password
2. **"Email already exists"** - When creating user with duplicate email
3. **"You don't have enough leave balance. Requested: X days, Available: Y days"** - Insufficient leave
4. **"Cannot delete the root administrator account"** - Trying to delete default admin
5. **"Invalid email or password."** - Wrong login credentials

## Notes
- Default admin account (moustafa_nassar@baynoire.com) has fixed password 35415555
- New employees start with 0 leave balance
- Only Admin/Manager can add leave balance
- Employees cannot sign up themselves
- All 10 role types are functional
- Read-only dashboards show real-time data
