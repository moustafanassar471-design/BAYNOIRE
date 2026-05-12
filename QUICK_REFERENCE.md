# BAYNOIRE HR - Quick Reference Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Firebase account created

### First Time Setup
1. Install dependencies: `npm install`
2. Create `.env.local` file:
   ```
   VITE_Firebase_URL=your-url-here
   VITE_Firebase_ANON_KEY=your-key-here
   ```
3. Run database schema setup in Firebase
4. Start dev server: `npm run dev`
5. Access application at `http://localhost:5173`

## 📋 Common Commands

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint

# Dependencies
npm install          # Install packages
npm update           # Update packages
npm audit fix        # Fix security vulnerabilities
```

## 🔒 Environment Setup

### Required Environment Variables
Create `.env.local` file in project root:
```
VITE_Firebase_URL=https://your-project.Firebase.co
VITE_Firebase_ANON_KEY=your-anon-key
```

### Getting Firebase Credentials
1. Go to Firebase Dashboard
2. Select your project
3. Go to Settings → API
4. Copy Project URL and Anon Public Key

## 📱 Application Structure

### Pages
- **`/`** - Login page (accessible to unauthenticated users)
- **`/employee-dashboard`** - Employee dashboard (authenticated employees only)
- **`/manager-dashboard`** - Manager dashboard (authenticated managers only)

### Components
- **Navbar**: Top navigation with user info and logout
- **Sidebar**: Side navigation based on user role
- **LeaveForm**: Submit new leave requests
- **LeaveTable**: Display and manage leave requests
- **StatusBadge**: Show request status with colors
- **EmployeeList**: Manage employee information

### Services
- **FirebaseClient.js**: Firebase initialization and configuration

### Context
- **AuthContext.jsx**: Authentication state management

## 🎨 Customization Points

### Colors (tailwind.config.js)
```js
colors: {
  'primary': '#000000',        // Main black
  'secondary': '#1A1A1A',      // Dark gray
  'accent': '#3B82F6',         // Blue
  'success': '#22C55E',        // Green
  'warning': '#F59E0B',        // Orange
  'danger': '#EF4444',         // Red
}
```

### Typography
Change fonts in `index.css` or Tailwind config

### Styling
- All components use TailwindCSS
- Custom styles in `src/index.css`
- Component styles are in-line with Tailwind classes

## 🗄️ Database Operations

### User Authentication
```javascript
import { useAuth } from './context/AuthContext'

const { user, userRole, signIn, signUp, signOut } = useAuth()
```

### Fetch Data
```javascript
import { Firebase } from './services/FirebaseClient'

const { data, error } = await Firebase
  .from('leave_requests')
  .select()
```

### Create/Update
```javascript
const { error } = await Firebase
  .from('users')
  .update({ leave_balance: 20 })
  .eq('id', userId)
```

## 🔐 Security

### Row Level Security (RLS)
- Database enforces user permissions automatically
- Employees see only their own data
- Managers can see all employee data

### Authentication
- Handled by Firebase Auth
- Sessions automatically managed
- Protected routes checked in App.jsx

## ❌ Troubleshooting

### Issue: "Cannot access Firebase"
1. Verify `.env.local` has correct credentials
2. Check Firebase project is running
3. Confirm RLS policies are enabled

### Issue: "User cannot see data"
1. Verify user role in database
2. Check RLS policies are correctly configured
3. Ensure user properties match policy conditions

### Issue: "npm dependencies not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 5173 already in use"
```bash
# Kill the process or use different port:
npm run dev -- --port 5174
```

## 📚 File Reference

### Key Implementation Files
- `src/context/AuthContext.jsx` - Authentication logic
- `src/services/FirebaseClient.js` - Database client
- `src/App.jsx` - Routing and app structure
- `src/components/LeaveTable.jsx` - Leave request management
- `tailwind.config.js` - Styling configuration

### Database Files
- `database-schema.sql` - Complete database setup
- `SETUP_GUIDE.md` - Detailed setup instructions

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Drag dist folder to Netlify
```

## 👥 User Roles

### Employee
- View personal leave balance
- Submit leave requests
- View request history
- Cannot modify requests

### Manager
- View all employee leave requests
- Approve/reject requests
- Update employee leave balances
- View employee list

## 🔄 Data Flow

1. User logs in → AuthContext stores session
2. User submits leave request → Firebase inserts record
3. Manager approves request → Status updated, balance calculated
4. Components re-render when data changes

## 📞 API Response Format

### Success Response
```js
{ data: {...}, error: null }
```

### Error Response
```js
{ data: null, error: { message: "Error description" } }
```

## 🎯 Best Practices

- Always check for errors in async operations
- Use AuthContext for user state
- Keep components small and focused
- Use TailwindCSS for styling
- Validate input before database operations
- Show loading states during async operations

## 📖 Additional Reading

- [Firebase JS Client Docs](https://Firebase.com/docs/reference/javascript)
- [React Router Docs](https://reactrouter.com)
- [TailwindCSS Docs](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Need Help?** Check SETUP_GUIDE.md for detailed instructions.

