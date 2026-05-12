# BAYNOIRE HR - Complete Setup Walkthrough

This document provides step-by-step instructions to get the BAYNOIRE HR Leave Management System fully operational.

## 📋 Overview

You now have a complete React + Firebase application with:
- ✅ Complete React frontend with Vite
- ✅ All components and pages built
- ✅ Authentication system ready
- ✅ Database schema included
- ✅ Styling with TailwindCSS configured
- ✅ Development server running
- ✅ Production build tested

## 🎯 Next Steps (In Order)

### Step 1: Set Up Firebase Project (15 minutes)

**1.1 Create Firebase Account**
- Go to https://Firebase.com
- Click "Start your project"
- Sign up with email, GitHub, or Google

**1.2 Create a New Project**
- Click "New Project"
- Enter project details:
  - **Name**: `baynoire` (or your preference)
  - **Database Password**: Create strong password, save it securely
  - **Region**: Choose closest to your location
- Click "Create new project"
- Wait for initialization (~2-3 minutes)

**1.3 Get Your Credentials**
- In the Firebase dashboard, go to **Settings** → **API**
- Copy and save:
  - **Project URL** (starts with `https://`)
  - **Anon Public Key** (long string)

### Step 2: Configure Environment Variables (5 minutes)

**2.1 Create .env.local File**

In the project root directory (`d:\baynoire`), create a file named `.env.local`:

```
VITE_Firebase_URL=https://your-project-id.Firebase.co
VITE_Firebase_ANON_KEY=your-anon-key-here
```

Replace `your-project-id` and `your-anon-key-here` with values from step 1.3

**2.2 Verify File**
- File should be in: `d:\baynoire\.env.local`
- File should NOT be committed to git (already in .gitignore)

### Step 3: Set Up Database Schema (10 minutes)

**3.1 Open Firebase SQL Editor**
- In Firebase dashboard, go to **SQL Editor** (left menu)
- Click **New Query**

**3.2 Import Database Schema**
- Open file: `d:\baynoire\database-schema.sql`
- Copy ALL contents
- Paste into Firebase SQL Editor
- Click **Run**
- Wait for completion (you'll see some warnings - that's normal)

**3.3 Verify Tables Created**
- In Firebase, go to **Database** → **Tables**
- You should see:
  - `users` table
  - `leave_requests` table
  - Both with correct columns

### Step 4: Enable Authentication (10 minutes)

**4.1 Basic Email Auth (Already Enabled)**
- Go to **Authentication** → **Providers**
- Confirm "Email" is enabled (it is by default)

**4.2 Optional: Enable Social Auth**
- Click on Google, GitHub, etc. to add OAuth providers
- Not required for basic operation

### Step 5: Create Demo Users (Optional - 5 minutes)

For testing without creating new accounts:

**5.1 Create Employee Account**
- In Firebase, go to **Authentication** → **Users**
- Click **Add user**
- Email: `emp@test.com`
- Password: `password123`
- Click **Create user**

**5.2 Create Manager Account**
- Click **Add user** again
- Email: `mgr@test.com`
- Password: `password123`
- Click **Create user**

**5.3 Set User Roles**
- Go to **SQL Editor** → **New Query**
- Paste:
```sql
UPDATE public.users 
SET role = 'employee', name = 'John Employee' 
WHERE email = 'emp@test.com';

UPDATE public.users 
SET role = 'manager', name = 'Jane Manager', leave_balance = 0 
WHERE email = 'mgr@test.com';
```
- Click **Run**

### Step 6: Test the Application (10 minutes)

**6.1 Start Development Server**

If the server isn't running:

```bash
npm run dev
```

You should see:
```
  VITE v5.4.21  ready in 2419 ms
  ➜  Local:   http://localhost:5173/
```

**6.2 Open Application**
- Go to http://localhost:5173 in your browser
- You should see the BAYNOIRE login page

**6.3 Test Employee Login**
- Click "Login" (sign in mode)
- Email: `emp@test.com`
- Password: `password123`
- Click **Login**
- You should see the Employee Dashboard with:
  - Leave balance card (shows 20 days)
  - Leave request form
  - Leave request history (empty)

**6.4 Test Leave Request**
- Fill in the form:
  - Start Date: Select a date
  - End Date: Select a later date
  - Reason: "Testing the system"
- Click **Submit Request**
- You should see success message
- Request appears in history with "Pending" status

**6.5 Test Manager Features**
- Click **Logout** button
- Login with:
  - Email: `mgr@test.com`
  - Password: `password123`
- You should see Manager Dashboard with:
  - All leave requests table
  - Employee list
- You should see the employee's request
- Click **Approve** button
- Request status changes to "Approved"

**Success!** ✅ Your system is working!

## 🚀 Deployment (When Ready)

### Quick Deployment to Vercel

**1. Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

**2. Deploy to Vercel**
```bash
npm install -g vercel
vercel --prod
```

**3. Set Environment Variables in Vercel**
- During deployment, it will ask for environment variables
- Or in Vercel dashboard → Settings → Environment Variables

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 📚 Documentation Files

- **README.md** - Project overview and features
- **SETUP_GUIDE.md** - Detailed setup instructions
- **QUICK_REFERENCE.md** - Common commands and usage
- **CODE_DOCUMENTATION.md** - Component and API reference
- **DEPLOYMENT_GUIDE.md** - Deployment to production
- **database-schema.sql** - Database setup script

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```js
colors: {
  'primary': '#000000',        // Change main color
  'accent': '#3B82F6',         // Change accent
  'success': '#22C55E',        // Change success
  // ... etc
}
```

### Change Logo/Branding

Edit `src/components/Navbar.jsx`:

```jsx
<h1 className="text-2xl font-bold text-white">YOUR BRAND HERE</h1>
```

### Change Company Name

- Search for "BAYNOIRE" in codebase
- Replace with your company name

## 🔒 Important Security Notes

1. **Never commit `.env.local`** - Already in .gitignore
2. **Rotate keys regularly** - Create new Firebase api keys
3. **Enable HTTPS** - All production deployments use HTTPS
4. **RLS policies enforce security** - Database protects data automatically
5. **Don't share credentials** - Keep API keys secret

## ⚙️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Install dependencies
npm install

# Update dependencies
npm update
```

## 🐛 Troubleshooting

### "Cannot connect to Firebase"
- [ ] Check .env.local has correct credentials
- [ ] Verify Firebase project is running
- [ ] Copy credentials again from Firebase dashboard

### "Authentication fails"
- [ ] Verify you set up database schema
- [ ] Check that email is enabled in Authentication
- [ ] Test in Firebase dashboard directly

### "Styling looks wrong"
- [ ] Clear browser cache
- [ ] Restart dev server: `npm run dev`
- [ ] Check that Tailwind CSS is loading

### "Port 5173 already in use"
```bash
# Use different port
npm run dev -- --port 5174
```

### "Module not found errors"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support & Resources

### Quick Answers
- Check `QUICK_REFERENCE.md` for common commands
- Check `CODE_DOCUMENTATION.md` for API reference
- Read error messages carefully - they often tell you exactly what's wrong

### External Resources
- **React**: https://react.dev
- **Firebase**: https://Firebase.com/docs
- **TailwindCSS**: https://tailwindcss.com
- **React Router**: https://reactrouter.com
- **Vite**: https://vitejs.dev

### Getting Help
1. Check the relevant documentation file
2. Search error message in browser console
3. Check Firebase status page
4. Review your env variables
5. Try restarting dev server

## 📊 Feature Summary

### Employee Features ✅
- [x] Sign up and login
- [x] View leave balance
- [x] Submit leave requests
- [x] View request history
- [x] Track request status
- [x] See reason for rejection (if rejected)

### Manager Features ✅
- [x] Sign up and login
- [x] View all employee requests
- [x] Approve requests
- [x] Reject requests
- [x] Manage employee leave balances
- [x] View employee list
- [x] Filter requests by status

### System Features ✅
- [x] Secure authentication
- [x] Role-based access control
- [x] Database security with RLS
- [x] Responsive design
- [x] Form validation
- [x] Error handling
- [x] Loading states
- [x] Modern UI with TailwindCSS

## 🎓 Learning Path

If you want to customize or extend the system:

1. **Understand the structure**: Read project organization
2. **Learn React basics**: Read `CODE_DOCUMENTATION.md`
3. **Explore components**: Look at `src/components/`
4. **Understand routing**: Check `src/App.jsx`
5. **Learn Firebase integration**: Review `src/services/FirebaseClient.js`
6. **Modify styling**: Edit `tailwind.config.js` and components
7. **Add new features**: Follow existing patterns in code

## ✅ Final Checklist

- [ ] Firebase project created
- [ ] Database schema imported
- [ ] Environment variables configured
- [ ] Development server running
- [ ] Can login with test accounts
- [ ] Can submit leave request
- [ ] Can approve as manager
- [ ] Ready for development/deployment

## 🎉 You're All Set!

Your BAYNOIRE HR system is fully functional and ready to use. 

**Start the dev server** with:
```bash
npm run dev
```

**Then visit**: http://localhost:5173

Happy coding! 🚀

