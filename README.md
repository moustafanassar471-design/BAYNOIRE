# BAYNOIRE HR - Leave Management System

A modern, full-stack Leave Management System built with React, Vite, and Firebase. Designed for managing employee leave requests with role-based access control for employees and managers.

## 🎨 Brand Identity

- **System Name**: BAYNOIRE HR
- **Logo**: Minimal corporate SaaS dashboard style
- **Primary Color**: #000000 (Black)
- **Accent Color**: #3B82F6 (Blue)
- **Design**: Modern, clean, and minimal

## 🚀 Features

### Employee Features
- 📋 Submit leave requests
- 👁️ View leave balance
- 📊 View request history
- ✅ Track request status (Pending/Approved/Rejected)

### Manager Features
- 📋 View all leave requests
- ✅ Approve/Reject requests
- 👥 Manage employee list
- ⚙️ Update employee leave balances
- 🔍 Filter requests by status

### Authentication
- Secure login/signup with Firebase Auth
- Role-based access control
- Session management

## 🛠️ Tech Stack

- **Frontend**: React 18.2 + Vite
- **Backend**: Firebase
- **Database**: Firestore
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: React Context API

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Firebase account

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd baynoire-hr
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Update `.env.local` with your Firebase credentials:
```
VITE_Firebase_URL=https://your-project.Firebase.co
VITE_Firebase_ANON_KEY=your-anon-key
```

4. **Set up Firebase database**

Log in to your Firebase project and run the SQL queries provided in the `database-schema.sql` file in the SQL editor.

5. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id string (Firebase Auth uid),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employee', 'manager')),
  leave_balance INTEGER DEFAULT 20,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Leave Requests Table
```sql
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Row Level Security (RLS) Policies

### Users Table
- Employees can view their own profile
- Managers can view all users

### Leave Requests Table
- Employees can:
  - View their own leave requests
  - Create new leave requests
- Managers can:
  - View all leave requests
  - Update request status

See `database-policies.sql` for the complete RLS setup.

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── LeaveForm.jsx
│   ├── LeaveTable.jsx
│   ├── StatusBadge.jsx
│   └── EmployeeList.jsx
├── pages/
│   ├── Login.jsx
│   ├── EmployeeDashboard.jsx
│   └── ManagerDashboard.jsx
├── services/
│   └── FirebaseClient.js
├── context/
│   └── AuthContext.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## 🎯 Usage

### For Employees
1. Sign up or login with your credentials
2. View your leave balance on the dashboard
3. Submit a leave request using the form
4. Track your request status in the history

### For Managers
1. Login with manager credentials
2. View all pending leave requests
3. Approve or reject requests
4. Update employee leave balances
5. View list of all employees

## 📚 Demo Credentials

The system includes demo user setup instructions in the login page. Create test accounts with:
- **Employee role** for testing employee features
- **Manager role** for testing manager features

## 🚀 Deployment

### Deploy to Vercel
```bash
npm run build
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 📋 API Reference

All API calls use Firebase JavaScript client. Key operations:

### Authentication
- `signUp(email, password, name, role)` - Create new user
- `signIn(email, password)` - Login user
- `signOut()` - Logout user

### Leave Requests
- `getLeaveRequests(userId)` - Fetch user's leave requests
- `submitLeaveRequest(data)` - Create new request
- `updateRequestStatus(requestId, status)` - Approve/Reject

### Users
- `getUserProfile(userId)` - Get user details
- `updateLeaveBalance(userId, balance)` - Update balance

## 🎨 Styling

The project uses TailwindCSS with custom configuration for the BAYNOIRE brand colors:

```js
colors: {
  'primary': '#000000',
  'secondary': '#1A1A1A',
  'accent': '#3B82F6',
  'success': '#22C55E',
  'warning': '#F59E0B',
  'danger': '#EF4444',
}
```

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify your Firebase URL and API key are correct
- Check that your .env.local file is properly configured
- Ensure RLS policies are set up correctly

### Authentication Issues
- Clear browser cookies and try again
- Check that the auth schema is properly initialized in Firebase
- Verify email verification is enabled if required

## 📝 License

This project is provided as-is for educational and commercial use.

## 🤝 Support

For issues and questions, please refer to the Firebase documentation or create an issue in the repository.

## 📖 Additional Resources

- [Firebase Documentation](https://Firebase.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

---

**BAYNOIRE HR** - Modern Leave Management Made Simple


