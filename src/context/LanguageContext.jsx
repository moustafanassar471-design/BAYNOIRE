import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext(null)

const translations = {
  en: {
    lang: 'EN',
    language: 'Language',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    loading: 'Loading...',
    loadingProfile: 'Loading profile...',
    hrManagement: 'HR Management System',
    managerDashboard: 'Manager Dashboard',
    employeeDashboard: 'Employee Dashboard',
    leaveRequests: 'Leave Requests',
    employees: 'Employees',
    requestLeave: 'Request Leave',
    leaveBalance: 'Leave Balance',
    totalLeave: 'Total Leave',
    used: 'Used',
    days: 'days',
    startDate: 'Start Date',
    endDate: 'End Date',
    reason: 'Reason',
    submitRequest: 'Submit Request',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    actions: 'Actions',
    all: 'All',
    employee: 'Employee',
    period: 'Period',
    addEmployee: 'Add Employee',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    noEmployees: 'No employees found',
    noLeaveRequests: 'No leave requests found',
    createAccount: 'Create Account',
    loggingIn: 'Logging In...',
    creatingAccount: 'Creating Account...',
    submitting: 'Submitting...',
    fillAllFields: 'Please fill in all fields',
    endDateAfter: 'End date must be after start date',
    leaveSubmitted: 'Leave request submitted successfully!',
    signupSuccess: 'Sign up successful! Please log in.',
    invalidCredentials: 'Invalid email or password.',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    remainingLeaveDays: 'Remaining leave days',
    previousLeaves: 'Previous Leaves',
    requestStatus: 'Leave Requests Status',
  },
  ar: {
    lang: 'AR',
    language: 'اللغة',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    loading: 'جاري التحميل...',
    loadingProfile: 'جاري تحميل الملف الشخصي...',
    hrManagement: 'نظام إدارة الموارد البشرية',
    managerDashboard: 'لوحة المدير',
    employeeDashboard: 'لوحة الموظف',
    leaveRequests: 'طلبات الإجازة',
    employees: 'الموظفون',
    requestLeave: 'طلب إجازة',
    leaveBalance: 'رصيد الإجازات',
    totalLeave: 'إجمالي الإجازات',
    used: 'المستخدم',
    days: 'يوم',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ النهاية',
    reason: 'السبب',
    submitRequest: 'إرسال الطلب',
    pending: 'قيد المراجعة',
    approved: 'مقبول',
    rejected: 'مرفوض',
    actions: 'الإجراءات',
    all: 'الكل',
    employee: 'الموظف',
    period: 'الفترة',
    addEmployee: 'إضافة موظف',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    noEmployees: 'لا يوجد موظفون',
    noLeaveRequests: 'لا توجد طلبات إجازة',
    createAccount: 'إنشاء حساب',
    loggingIn: 'جاري تسجيل الدخول...',
    creatingAccount: 'جاري إنشاء الحساب...',
    submitting: 'جاري الإرسال...',
    fillAllFields: 'يرجى ملء جميع الحقول',
    endDateAfter: 'يجب أن يكون تاريخ النهاية بعد البداية',
    leaveSubmitted: 'تم إرسال طلب الإجازة بنجاح',
    signupSuccess: 'تم إنشاء الحساب بنجاح، سجّل الدخول الآن',
    invalidCredentials: 'بيانات الدخول غير صحيحة',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    remainingLeaveDays: 'الأيام المتبقية',
    previousLeaves: 'الإجازات السابقة',
    requestStatus: 'حالة طلبات الإجازة',
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en')

  useEffect(() => {
    localStorage.setItem('lang', language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
      isRTL: language === 'ar',
    }),
    [language]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
