# BAYNOIRE HR - Setup Completion Checklist

Track your progress setting up BAYNOIRE HR. Check off each item as you complete it.

## Phase 1: Project Ready ✅

- [x] React + Vite project created
- [x] All components built (6 total)
- [x] All pages created (3 total)
- [x] Authentication context set up
- [x] Database schema prepared
- [x] Documentation complete (9 files)
- [x] Development server ready
- [x] Production build tested

**Status**: Ready for configuration!

---

## Phase 2: Firebase Setup (15 minutes)

### Step 1: Create Firebase Account
- [ ] Go to https://Firebase.com
- [ ] Sign up for free account
- [ ] Create new project with:
  - [ ] Project name: `baynoire` (or your choice)
  - [ ] Strong database password
  - [ ] Correct region selected

### Step 2: Get Credentials
- [ ] In Firebase dashboard, go to Settings → API
- [ ] Copy **Project URL** (save to `.env.local`)
- [ ] Copy **Anon Public Key** (save to `.env.local`)

---

## Phase 3: Local Configuration (5 minutes)

### Step 1: Configure Environment
- [ ] Create file: `d:\baynoire\.env.local`
- [ ] Add Firebase URL:
  ```
  VITE_Firebase_URL=https://your-project.Firebase.co
  ```
- [ ] Add Firebase API Key:
  ```
  VITE_Firebase_ANON_KEY=your-key-here
  ```
- [ ] Save file (Ctrl+S)
- [ ] Verify file is **NOT** in git (check .gitignore)

### Step 2: Verify Dependencies
- [ ] Run: `npm install`
- [ ] All packages installed successfully
- [ ] No major security vulnerabilities (npm audit)

---

## Phase 4: Database Setup (10 minutes)

### Step 1: Import Schema
- [ ] Open: `d:\baynoire\database-schema.sql`
- [ ] Copy ALL contents
- [ ] In Firebase dashboard, go to SQL Editor
- [ ] Click "New Query"
- [ ] Paste schema contents
- [ ] Click **Run** button
- [ ] Wait for completion

### Step 2: Verify Tables Created
- [ ] In Firebase, go to Database → Tables
- [ ] Verify **users** table exists
- [ ] Verify **leave_requests** table exists
- [ ] Check both tables have correct columns
- [ ] Check RLS is enabled on both tables

### Step 3: Verify Policies
- [ ] Go to **Authentication** → **Policies**
- [ ] Verify policies are created
- [ ] Check employee access policies exist
- [ ] Check manager access policies exist

---

## Phase 5: Authentication Setup (5 minutes)

### Step 1: Configure Email Auth
- [ ] In Firebase, go to **Authentication** → **Providers**
- [ ] Confirm **Email** provider is enabled
- [ ] Check email templates (optional)

### Step 2: Optional: Add OAuth
- [ ] (Optional) Enable Google OAuth
- [ ] (Optional) Enable GitHub OAuth

---

## Phase 6: Create Test Users (5 minutes)

### Step 1: Create Employee Account
- [ ] In Firebase, go to **Authentication** → **Users**
- [ ] Click **Add user**
- [ ] Email: `emp@test.com`
- [ ] Password: `password123`
- [ ] Click **Create user**

### Step 2: Create Manager Account
- [ ] Click **Add user** again
- [ ] Email: `mgr@test.com`
- [ ] Password: `password123`
- [ ] Click **Create user**

### Step 3: Set User Roles
- [ ] Go to **SQL Editor** → **New Query**
- [ ] Copy and run this SQL:
  ```sql
  UPDATE public.users SET role = 'employee', name = 'John Employee' WHERE email = 'emp@test.com';
  UPDATE public.users SET role = 'manager', name = 'Jane Manager', leave_balance = 0 WHERE email = 'mgr@test.com';
  ```
- [ ] Verify no errors
- [ ] Check users table shows correct roles

---

## Phase 7: Test Application (10 minutes)

### Step 1: Start Dev Server
- [ ] Open terminal in VS Code
- [ ] Run: `npm run dev`
- [ ] Wait for message: "ready in X ms"
- [ ] See: "Local: http://localhost:5173/"

### Step 2: Login Test
- [ ] Open browser to: http://localhost:5173
- [ ] See BAYNOIRE login page
- [ ] See demo credentials info

### Step 3: Employee Login Test
- [ ] Click **Login** tab
- [ ] Email: `emp@test.com`
- [ ] Password: `password123`
- [ ] Click **Login** button
- [ ] Redirects to Employee Dashboard
- [ ] See leave balance (20 days)
- [ ] See leave request form

### Step 4: Submit Request Test
- [ ] In leave form, enter:
  - [ ] Start Date: Any date (e.g., next week)
  - [ ] End Date: 5 days later
  - [ ] Reason: "Testing"
- [ ] Click **Submit Request**
- [ ] See success message
- [ ] Request appears in table with "Pending" status

### Step 5: Manager Login Test
- [ ] Click **Logout** button
- [ ] Login with:
  - [ ] Email: `mgr@test.com`
  - [ ] Password: `password123`
- [ ] Redirects to Manager Dashboard
- [ ] See employee's request in table
- [ ] See request status as "Pending"

### Step 6: Approval Test
- [ ] In manager dashboard, find the request
- [ ] Click **Approve** button
- [ ] Request status changes to "Approved"
- [ ] No "Approve" button visible anymore

### Step 7: Verify Balance Update
- [ ] Logout from manager account
- [ ] Login as employee
- [ ] Check leave balance (should be 15 instead of 20)
- [ ] Request still shows "Approved" status

### Step 8: Test Rejection
- [ ] Logout and login as employee
- [ ] Submit another request
- [ ] Logout and login as manager
- [ ] Click **Reject** on second request
- [ ] Request status shows "Rejected"
- [ ] Leave balance doesn't change on rejection

---

## Phase 8: Verification Checklist ✅

### Frontend Features
- [ ] Login page works
- [ ] Employee dashboard accessible
- [ ] Manager dashboard accessible
- [ ] Navigation between pages works
- [ ] Logout button works
- [ ] Forms validate input
- [ ] Tables display data
- [ ] Status badges show colors

### Employee Workflow
- [ ] Can view leave balance
- [ ] Can submit leave request
- [ ] Can view request history
- [ ] Can see request status
- [ ] Balance updates after approval

### Manager Workflow
- [ ] Can see all requests
- [ ] Can approve requests
- [ ] Can reject requests
- [ ] Can edit employee balances
- [ ] Can view employee list

### Database
- [ ] Data persists after page reload
- [ ] Changes visible to other users
- [ ] RLS prevents unauthorized access
- [ ] Error messages display correctly

---

## Phase 9: Documentation Review (Optional)

- [ ] Read `DOCUMENTATION_INDEX.md` (this helps!)
- [ ] Skimmed `PROJECT_SUMMARY.md`
- [ ] Know where `CODE_DOCUMENTATION.md` is
- [ ] Know where `QUICK_REFERENCE.md` is
- [ ] Bookmarked `DEPLOYMENT_GUIDE.md` for later

---

## Phase 10: Customization (Optional)

### Branding
- [ ] Updated colors in `tailwind.config.js`? (optional)
- [ ] Changed company name in Navbar? (optional)
- [ ] Updated logo/branding? (optional)

### Configuration
- [ ] Set up email notifications? (optional)
- [ ] Configured custom domain? (optional)
- [ ] Added encryption? (optional)

---

## Phase 11: Deployment (When Ready)

### Pre-Deployment
- [ ] Code committed to git
- [ ] All tests passing
- [ ] Reviewed code for production
- [ ] Security review complete
- [ ] Performance optimized

### Deployment Options
- [ ] Choose deployment platform (Vercel/Netlify/AWS/other)
- [ ] Configure environment variables on platform
- [ ] Deploy application
- [ ] Test on production domain
- [ ] Set up monitoring/logging
- [ ] Configure backups

---

## 🎉 Project Complete Checklist

When ALL items above are checked:

- [ ] **Phase 1**: Project Ready ✅
- [ ] **Phase 2**: Firebase configured ✓
- [ ] **Phase 3**: Environment set up ✓
- [ ] **Phase 4**: Database ready ✓
- [ ] **Phase 5**: Auth enabled ✓
- [ ] **Phase 6**: Test users created ✓
- [ ] **Phase 7**: Application tested ✓
- [ ] **Phase 8**: Features verified ✓
- [ ] **Phase 9**: Documentation reviewed ✓
- [ ] **Phase 10**: Customization done (optional) ✓
- [ ] **Phase 11**: Ready to deploy ✓

---

## 📊 Progress Summary

```
Setup Progress:
██████████████████░░░░░░░░░░░░░░░░  40% (Phases 1-5)
████████████████████████████────────  60% (Phase 6-8)
██████████████████████████████████── 95% (Phase 9-10)
████████████████████████████████████ 100% COMPLETE! 🎉
```

---

## 🔗 Quick Reference

| Need | File |
|------|------|
| Setup help | GET_STARTED.md |
| Commands | QUICK_REFERENCE.md |
| Code info | CODE_DOCUMENTATION.md |
| Deploy | DEPLOYMENT_GUIDE.md |
| Troubleshooting | SETUP_GUIDE.md |
| Overview | PROJECT_SUMMARY.md |

---

## ✅ Final Status

**Current Status**: _______________

**Date Completed Setup**: _______________

**Next Steps**:
- [ ] Deploy to production
- [ ] Train team members
- [ ] Monitor usage
- [ ] Add new features

---

**Print this page and check off items as you progress!** 📋

Questions? Check the appropriate documentation file above!

🚀 **Ready to launch BAYNOIRE HR!**

