# BAYNOIRE HR - Project Customization

This project is a complete Leave Management System built with React and Supabase.

## Project Overview

**BAYNOIRE HR** is a modern, full-stack Leave Management System designed for organizations to manage employee leave requests efficiently.

### Key Technologies
- **Frontend**: React 18.2 with Vite
- **Backend**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS
- **Authentication**: Supabase Auth
- **Routing**: React Router v6

### User Roles
1. **Employee**: Can request leave and view their balance
2. **Manager**: Can approve/reject requests and manage leave balances

## Setup Instructions

1. **Install Dependencies**: `npm install`
2. **Configure Supabase**: 
   - Create a Supabase project
   - Copy credentials to `.env.local`
3. **Set Up Database**: 
   - Run `database-schema.sql` in Supabase SQL Editor
4. **Run Development Server**: `npm run dev`

See `SETUP_GUIDE.md` for detailed instructions.

## Project Structure

```
src/
├── components/ - Reusable React components
├── pages/ - Page components for each route
├── services/ - API clients and utilities
├── context/ - React Context for state management
├── index.css - Global styles
├── App.jsx - Main app component with routing
└── main.jsx - React entry point
```

## Key Features

### Authentication
- Sign up and login with email/password
- Role-based access control
- Secure session management

### Employee Features
- View leave balance
- Submit leave requests
- Track request status
- View request history

### Manager Features
- View all leave requests
- Approve/reject requests
- Manage employee list
- Update leave balances

## Database

The system uses PostgreSQL with the following tables:
- `public.users` - User profiles and leave balances
- `public.leave_requests` - Leave request history

Row Level Security (RLS) policies ensure:
- Employees can only see their own data
- Managers can view and modify all employee data

## Customization

### Branding
Edit `tailwind.config.js` to customize:
- Color palette
- Typography
- Component styles

### Components
All UI components are in `src/components/`:
- `Navbar.jsx` - Top navigation bar
- `Sidebar.jsx` - Left navigation menu
- `LeaveForm.jsx` - Leave request form
- `LeaveTable.jsx` - Display leave requests
- `StatusBadge.jsx` - Status display component
- `EmployeeList.jsx` - Employee management

### Pages
Routes are configured in `src/App.jsx`:
- `/` - Login page
- `/employee-dashboard` - Employee dashboard
- `/manager-dashboard` - Manager dashboard

## Environment Variables

Required in `.env.local`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Build and Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy
- **Vercel**: `npm run build && vercel --prod`
- **Netlify**: `npm run build && netlify deploy --prod --dir=dist`

## Development Notes

- Colors use TailwindCSS utility classes and custom theme colors
- Forms include validation and error handling
- All database operations use Supabase RLS
- Authentication state is managed via React Context
- Components are functional with hooks

## File Descriptions

### Key Files
- `src/context/AuthContext.jsx` - Authentication state and logic
- `src/services/supabaseClient.js` - Supabase client initialization
- `src/App.jsx` - Main app with routing and protected routes
- `database-schema.sql` - Complete database setup script
- `tailwind.config.js` - Styling configuration

## Dependencies

### Core
- `react` - UI library
- `react-dom` - React rendering
- `react-router-dom` - Client-side routing
- `@supabase/supabase-js` - Backend API client

### Development
- `vite` - Build tool
- `tailwindcss` - Utility CSS framework
- `@vitejs/plugin-react` - Vite React plugin

## Testing

The system includes demo credentials:
- Employee: `emp@test.com` / `password123`
- Manager: `mgr@test.com` / `password123`

See `SETUP_GUIDE.md` to create demo accounts.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
