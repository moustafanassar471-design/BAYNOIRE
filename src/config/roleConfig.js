// Role definitions and permissions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  RETAIL_MANAGER: 'retail-manager',
  CEO: 'ceo',
  HR: 'hr',
  ASSISTANT_MANAGER: 'assistant-manager',
  SENIOR_SUPERVISOR: 'senior-supervisor',
  SUPERVISOR: 'supervisor',
  SENIOR_SALES: 'senior-sales',
  SALES: 'sales',
}

export const ROLE_DISPLAY_NAMES = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.RETAIL_MANAGER]: 'Retail Manager',
  [ROLES.CEO]: 'CEO',
  [ROLES.HR]: 'HR',
  [ROLES.ASSISTANT_MANAGER]: 'Assistant Manager',
  [ROLES.SENIOR_SUPERVISOR]: 'Senior Supervisor',
  [ROLES.SUPERVISOR]: 'Supervisor',
  [ROLES.SENIOR_SALES]: 'Senior Sales',
  [ROLES.SALES]: 'Sales',
}

// Employee roles (non-admin/manager)
export const EMPLOYEE_ROLES = [
  ROLES.ASSISTANT_MANAGER,
  ROLES.SENIOR_SUPERVISOR,
  ROLES.SUPERVISOR,
  ROLES.SENIOR_SALES,
  ROLES.SALES,
]

// Manager-creatable roles - Manager can only create these roles
export const MANAGER_CREATABLE_ROLES = [
  ROLES.ASSISTANT_MANAGER,
  ROLES.SENIOR_SUPERVISOR,
  ROLES.SUPERVISOR,
  ROLES.SENIOR_SALES,
  ROLES.SALES,
]

// Read-only dashboard roles
export const READONLY_DASHBOARD_ROLES = [
  ROLES.RETAIL_MANAGER,
  ROLES.CEO,
  ROLES.HR,
]

// Role permissions
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canCreateUsers: true,
    canDeleteUsers: true,
    canEditUsers: true,
    canEditPassword: true,
    canApproveLeave: true,
    canRejectLeave: true,
    canDeleteLeave: true,
    canModifyLeave: true,
    canAddLeaveBalance: true,
    canViewAllData: true,
    canAccessAdminPanel: true,
  },
  [ROLES.MANAGER]: {
    canCreateUsers: true,
    canDeleteUsers: true,
    canEditUsers: true,
    canEditPassword: true,
    canApproveLeave: true,
    canRejectLeave: true,
    canDeleteLeave: false,
    canModifyLeave: true,
    canAddLeaveBalance: true,
    canViewAllData: true,
    canAccessAdminPanel: false,
  },
  [ROLES.RETAIL_MANAGER]: {
    canCreateUsers: false,
    canDeleteUsers: false,
    canEditUsers: false,
    canEditPassword: false,
    canApproveLeave: false,
    canRejectLeave: false,
    canDeleteLeave: false,
    canModifyLeave: false,
    canAddLeaveBalance: false,
    canViewAllData: true, // read-only
    canAccessAdminPanel: false,
  },
  [ROLES.CEO]: {
    canCreateUsers: false,
    canDeleteUsers: false,
    canEditUsers: false,
    canEditPassword: false,
    canApproveLeave: false,
    canRejectLeave: false,
    canDeleteLeave: false,
    canModifyLeave: false,
    canAddLeaveBalance: false,
    canViewAllData: true, // read-only
    canAccessAdminPanel: false,
  },
  [ROLES.HR]: {
    canCreateUsers: false,
    canDeleteUsers: false,
    canEditUsers: false,
    canEditPassword: false,
    canApproveLeave: false,
    canRejectLeave: false,
    canDeleteLeave: false,
    canModifyLeave: false,
    canAddLeaveBalance: false,
    canViewAllData: true, // read-only
    canAccessAdminPanel: false,
  },
}

// Employee roles have minimal permissions
EMPLOYEE_ROLES.forEach((role) => {
  PERMISSIONS[role] = {
    canCreateUsers: false,
    canDeleteUsers: false,
    canEditUsers: false,
    canEditPassword: false,
    canApproveLeave: false,
    canRejectLeave: false,
    canDeleteLeave: false,
    canModifyLeave: false,
    canAddLeaveBalance: false,
    canViewAllData: false,
    canAccessAdminPanel: false,
  }
})

export const DEFAULT_ADMIN = {
  email: 'moustafa_nassar@baynoire.com',
  password: '35415555',
  role: ROLES.ADMIN,
  name: 'Root Administrator',
}

export function getPermission(role, permission) {
  return PERMISSIONS[role]?.[permission] ?? false
}

export function hasPermission(role, permission) {
  return getPermission(role, permission) === true
}
