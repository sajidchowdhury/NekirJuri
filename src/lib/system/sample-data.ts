// ============================================================
// Madrasha ERP — System & Administration Sample Data
// Users, Roles, Permissions, Notifications, Activity Logs, Audit Logs
// ============================================================

// ---------- Types ----------

export type UserRole = 'Super Admin' | 'Admin' | 'Teacher' | 'Accountant' | 'Staff' | 'Viewer';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';
export type NotificationType = 'System' | 'Finance' | 'Academic' | 'General';
export type NotificationStatus = 'Unread' | 'Read';
export type ActionType = 'Create' | 'Update' | 'Delete' | 'Login' | 'Logout';
export type ModuleName = 'Academic' | 'Finance' | 'Inventory' | 'Accounting' | 'Website' | 'System';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
  modules: ModuleName[];
}

export interface Permission {
  id: string;
  module: ModuleName;
  label: string;
}

export interface Role {
  id: string;
  name: UserRole;
  isSystem: boolean;
  userCount: number;
  description: string;
  permissions: string[]; // permission IDs
}

export interface SystemNotification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: ActionType;
  entity: string;
  description: string;
  ipAddress: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  entity: string;
  entityId: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

// ---------- Permissions ----------

export const allPermissions: Permission[] = [
  // Academic
  { id: 'academic.view_students', module: 'Academic', label: 'View Students' },
  { id: 'academic.manage_students', module: 'Academic', label: 'Create/Edit Students' },
  { id: 'academic.delete_students', module: 'Academic', label: 'Delete Students' },
  { id: 'academic.view_teachers', module: 'Academic', label: 'View Teachers' },
  { id: 'academic.manage_classes', module: 'Academic', label: 'Manage Classes' },
  { id: 'academic.manage_sessions', module: 'Academic', label: 'Manage Sessions' },
  { id: 'academic.manage_promotions', module: 'Academic', label: 'Manage Promotions' },
  // Finance
  { id: 'finance.view_fees', module: 'Finance', label: 'View Fees' },
  { id: 'finance.manage_fees', module: 'Finance', label: 'Manage Fees' },
  { id: 'finance.collect_payments', module: 'Finance', label: 'Collect Payments' },
  { id: 'finance.manage_donations', module: 'Finance', label: 'Manage Donations' },
  { id: 'finance.manage_expenses', module: 'Finance', label: 'Manage Expenses' },
  { id: 'finance.view_payroll', module: 'Finance', label: 'View Payroll' },
  { id: 'finance.process_payroll', module: 'Finance', label: 'Process Payroll' },
  // Inventory
  { id: 'inventory.view_products', module: 'Inventory', label: 'View Products' },
  { id: 'inventory.manage_products', module: 'Inventory', label: 'Manage Products' },
  { id: 'inventory.manage_purchases', module: 'Inventory', label: 'Manage Purchases' },
  { id: 'inventory.manage_stock', module: 'Inventory', label: 'Manage Stock' },
  { id: 'inventory.manage_sales', module: 'Inventory', label: 'Manage Sales' },
  // Accounting
  { id: 'accounting.view_accounts', module: 'Accounting', label: 'View Accounts' },
  { id: 'accounting.manage_accounts', module: 'Accounting', label: 'Manage Accounts' },
  { id: 'accounting.view_journal', module: 'Accounting', label: 'View Journal' },
  { id: 'accounting.post_journal', module: 'Accounting', label: 'Post Journal' },
  { id: 'accounting.view_reports', module: 'Accounting', label: 'View Reports' },
  // Website
  { id: 'website.view_pages', module: 'Website', label: 'View Pages' },
  { id: 'website.manage_pages', module: 'Website', label: 'Manage Pages' },
  { id: 'website.manage_notices', module: 'Website', label: 'Manage Notices' },
  { id: 'website.manage_gallery', module: 'Website', label: 'Manage Gallery' },
  // System
  { id: 'system.view_users', module: 'System', label: 'View Users' },
  { id: 'system.manage_users', module: 'System', label: 'Manage Users' },
  { id: 'system.view_logs', module: 'System', label: 'View Logs' },
  { id: 'system.manage_settings', module: 'System', label: 'Manage Settings' },
];

// ---------- Users ----------

export const sampleUsers: SystemUser[] = [
  {
    id: 'u1',
    name: 'Hafez Maulana Abdul Karim',
    email: 'admin@alhuda.edu.bd',
    phone: '+880 1712-345678',
    role: 'Super Admin',
    status: 'Active',
    lastLogin: '1 hour ago',
    createdAt: '2024-01-15',
    modules: ['Academic', 'Finance', 'Inventory', 'Accounting', 'Website', 'System'],
  },
  {
    id: 'u2',
    name: 'Maulana Rafiqul Islam',
    email: 'vp@alhuda.edu.bd',
    phone: '+880 1812-345678',
    role: 'Admin',
    status: 'Active',
    lastLogin: '3 hours ago',
    createdAt: '2024-02-01',
    modules: ['Academic', 'Finance', 'Inventory', 'Accounting', 'Website'],
  },
  {
    id: 'u3',
    name: 'Ustad Muhammad Ali',
    email: 'teacher.ali@alhuda.edu.bd',
    phone: '+880 1912-345678',
    role: 'Teacher',
    status: 'Active',
    lastLogin: '1 day ago',
    createdAt: '2024-03-10',
    modules: ['Academic'],
  },
  {
    id: 'u4',
    name: 'Ustadah Fatima Khatun',
    email: 'teacher.fatima@alhuda.edu.bd',
    phone: '+880 1612-345678',
    role: 'Teacher',
    status: 'Active',
    lastLogin: '2 days ago',
    createdAt: '2024-03-15',
    modules: ['Academic'],
  },
  {
    id: 'u5',
    name: 'Mr. Karim Uddin',
    email: 'admin.karim@alhuda.edu.bd',
    phone: '+880 1512-345678',
    role: 'Accountant',
    status: 'Active',
    lastLogin: '30 minutes ago',
    createdAt: '2024-04-01',
    modules: ['Finance', 'Accounting'],
  },
  {
    id: 'u6',
    name: 'Mrs. Salma Begum',
    email: 'accountant.salma@alhuda.edu.bd',
    phone: '+880 1412-345678',
    role: 'Accountant',
    status: 'Active',
    lastLogin: '5 hours ago',
    createdAt: '2024-04-15',
    modules: ['Finance', 'Accounting'],
  },
  {
    id: 'u7',
    name: 'Mr. Joynal Abedin',
    email: 'staff.joynal@alhuda.edu.bd',
    phone: '+880 1312-345678',
    role: 'Staff',
    status: 'Active',
    lastLogin: '1 week ago',
    createdAt: '2024-05-01',
    modules: ['Academic', 'Inventory'],
  },
  {
    id: 'u8',
    name: 'Mr. Habibullah',
    email: 'staff.habib@alhuda.edu.bd',
    phone: '+880 1212-345678',
    role: 'Staff',
    status: 'Inactive',
    lastLogin: '2 weeks ago',
    createdAt: '2024-06-01',
    modules: ['Academic'],
  },
];

// ---------- Roles ----------

export const sampleRoles: Role[] = [
  {
    id: 'r1',
    name: 'Super Admin',
    isSystem: true,
    userCount: 1,
    description: 'Full system access with all permissions. Cannot be modified.',
    permissions: allPermissions.map((p) => p.id),
  },
  {
    id: 'r2',
    name: 'Admin',
    isSystem: true,
    userCount: 1,
    description: 'Administrative access with most permissions. Cannot manage system settings.',
    permissions: allPermissions.filter((p) => !p.id.startsWith('system.manage_')).map((p) => p.id),
  },
  {
    id: 'r3',
    name: 'Teacher',
    isSystem: true,
    userCount: 2,
    description: 'Academic access only. Can view and manage students, classes, and sessions.',
    permissions: allPermissions
      .filter(
        (p) =>
          p.id.startsWith('academic.') ||
          p.id === 'website.view_pages' ||
          p.id === 'website.manage_notices'
      )
      .map((p) => p.id),
  },
  {
    id: 'r4',
    name: 'Accountant',
    isSystem: true,
    userCount: 2,
    description: 'Finance and accounting access. Can manage fees, payments, and accounts.',
    permissions: allPermissions
      .filter(
        (p) =>
          p.id.startsWith('finance.') ||
          p.id.startsWith('accounting.') ||
          p.id === 'academic.view_students'
      )
      .map((p) => p.id),
  },
  {
    id: 'r5',
    name: 'Staff',
    isSystem: true,
    userCount: 2,
    description: 'Limited access. Can view students and manage inventory basics.',
    permissions: allPermissions
      .filter(
        (p) =>
          p.id === 'academic.view_students' ||
          p.id === 'academic.view_teachers' ||
          p.id === 'inventory.view_products' ||
          p.id === 'inventory.manage_stock' ||
          p.id === 'website.view_pages'
      )
      .map((p) => p.id),
  },
  {
    id: 'r6',
    name: 'Viewer',
    isSystem: false,
    userCount: 0,
    description: 'Read-only access across all modules. Custom role.',
    permissions: allPermissions
      .filter(
        (p) =>
          p.id.includes('.view_')
      )
      .map((p) => p.id),
  },
];

// ---------- Notifications ----------

export const sampleNotifications: SystemNotification[] = [
  {
    id: 'n1',
    type: 'Finance',
    status: 'Unread',
    title: 'Fee Collection Received',
    message: 'Payment of ৳5,000 received from Abdullah Rahim (Class 5-A) for Tuition Fee.',
    timestamp: '5 minutes ago',
  },
  {
    id: 'n2',
    type: 'Academic',
    status: 'Unread',
    title: 'New Student Admission',
    message: 'Mohammad Yusuf has been admitted to Class 3-B for session 2025-2026.',
    timestamp: '15 minutes ago',
  },
  {
    id: 'n3',
    type: 'Finance',
    status: 'Unread',
    title: 'Salary Payment Processed',
    message: 'Monthly salary payment for Ustad Muhammad Ali has been processed successfully.',
    timestamp: '1 hour ago',
  },
  {
    id: 'n4',
    type: 'System',
    status: 'Unread',
    title: 'System Update Available',
    message: 'A new system update (v2.4.1) is available. Includes security patches and bug fixes.',
    timestamp: '2 hours ago',
  },
  {
    id: 'n5',
    type: 'Academic',
    status: 'Unread',
    title: 'Attendance Alert',
    message: 'Class 7-A has 3 students absent today. Review attendance records.',
    timestamp: '3 hours ago',
  },
  {
    id: 'n6',
    type: 'Finance',
    status: 'Read',
    title: 'Fee Reminder Sent',
    message: 'Fee reminders have been sent to 12 students with overdue payments.',
    timestamp: '5 hours ago',
  },
  {
    id: 'n7',
    type: 'General',
    status: 'Read',
    title: 'Report Generated',
    message: 'Monthly financial report for February 2025 has been generated and is ready for download.',
    timestamp: '1 day ago',
  },
  {
    id: 'n8',
    type: 'System',
    status: 'Read',
    title: 'Backup Completed',
    message: 'System backup completed successfully. Database size: 245 MB.',
    timestamp: '1 day ago',
  },
  {
    id: 'n9',
    type: 'Academic',
    status: 'Read',
    title: 'Session Promotion Completed',
    message: 'All eligible students from session 2024-2025 have been promoted successfully.',
    timestamp: '2 days ago',
  },
  {
    id: 'n10',
    type: 'General',
    status: 'Read',
    title: 'Holiday Notice Published',
    message: 'Eid-ul-Fitr holiday notice has been published on the website.',
    timestamp: '3 days ago',
  },
];

// ---------- Activity Logs ----------

export const sampleActivityLogs: ActivityLog[] = [
  {
    id: 'a1',
    userId: 'u1',
    userName: 'Hafez Maulana Abdul Karim',
    action: 'Login',
    entity: 'User',
    description: 'Logged in to the system',
    ipAddress: '192.168.1.10',
    timestamp: '2025-03-05 09:00:12',
  },
  {
    id: 'a2',
    userId: 'u3',
    userName: 'Ustad Muhammad Ali',
    action: 'Create',
    entity: 'Student',
    description: 'Created new student: Abdullah Rahim',
    ipAddress: '192.168.1.25',
    timestamp: '2025-03-05 09:15:30',
  },
  {
    id: 'a3',
    userId: 'u5',
    userName: 'Mr. Karim Uddin',
    action: 'Create',
    entity: 'Invoice',
    description: 'Generated fee invoice: INV-2025-0042',
    ipAddress: '192.168.1.30',
    timestamp: '2025-03-05 09:30:45',
  },
  {
    id: 'a4',
    userId: 'u2',
    userName: 'Maulana Rafiqul Islam',
    action: 'Update',
    entity: 'Student',
    description: 'Updated student info: Mohammad Yusuf',
    ipAddress: '192.168.1.15',
    timestamp: '2025-03-05 10:00:20',
  },
  {
    id: 'a5',
    userId: 'u5',
    userName: 'Mr. Karim Uddin',
    action: 'Create',
    entity: 'Payment',
    description: 'Collected payment of ৳5,000 from Abdullah Rahim',
    ipAddress: '192.168.1.30',
    timestamp: '2025-03-05 10:15:33',
  },
  {
    id: 'a6',
    userId: 'u6',
    userName: 'Mrs. Salma Begum',
    action: 'Update',
    entity: 'Invoice',
    description: 'Updated invoice INV-2025-0038: Added late fee',
    ipAddress: '192.168.1.35',
    timestamp: '2025-03-05 10:30:12',
  },
  {
    id: 'a7',
    userId: 'u1',
    userName: 'Hafez Maulana Abdul Karim',
    action: 'Update',
    entity: 'Settings',
    description: 'Updated system settings: Changed fiscal year start',
    ipAddress: '192.168.1.10',
    timestamp: '2025-03-05 11:00:00',
  },
  {
    id: 'a8',
    userId: 'u7',
    userName: 'Mr. Joynal Abedin',
    action: 'Create',
    entity: 'Student',
    description: 'Created new student: Amina Khatun',
    ipAddress: '192.168.1.40',
    timestamp: '2025-03-05 11:15:20',
  },
  {
    id: 'a9',
    userId: 'u3',
    userName: 'Ustad Muhammad Ali',
    action: 'Delete',
    entity: 'Student',
    description: 'Deleted student record: Test Student (inactive)',
    ipAddress: '192.168.1.25',
    timestamp: '2025-03-05 11:30:45',
  },
  {
    id: 'a10',
    userId: 'u2',
    userName: 'Maulana Rafiqul Islam',
    action: 'Update',
    entity: 'User',
    description: 'Updated user role: Mr. Habibullah → Inactive',
    ipAddress: '192.168.1.15',
    timestamp: '2025-03-05 12:00:10',
  },
  {
    id: 'a11',
    userId: 'u1',
    userName: 'Hafez Maulana Abdul Karim',
    action: 'Logout',
    entity: 'User',
    description: 'Logged out of the system',
    ipAddress: '192.168.1.10',
    timestamp: '2025-03-05 12:30:00',
  },
  {
    id: 'a12',
    userId: 'u5',
    userName: 'Mr. Karim Uddin',
    action: 'Create',
    entity: 'Payment',
    description: 'Collected payment of ৳3,500 from Fatima Begum',
    ipAddress: '192.168.1.30',
    timestamp: '2025-03-05 13:00:22',
  },
  {
    id: 'a13',
    userId: 'u4',
    userName: 'Ustadah Fatima Khatun',
    action: 'Update',
    entity: 'Student',
    description: 'Updated attendance for Class 5-A',
    ipAddress: '192.168.1.26',
    timestamp: '2025-03-05 13:15:30',
  },
  {
    id: 'a14',
    userId: 'u6',
    userName: 'Mrs. Salma Begum',
    action: 'Login',
    entity: 'User',
    description: 'Logged in to the system',
    ipAddress: '192.168.1.35',
    timestamp: '2025-03-05 08:45:00',
  },
  {
    id: 'a15',
    userId: 'u7',
    userName: 'Mr. Joynal Abedin',
    action: 'Logout',
    entity: 'User',
    description: 'Logged out of the system',
    ipAddress: '192.168.1.40',
    timestamp: '2025-03-05 14:00:00',
  },
];

// ---------- Audit Logs ----------

export const sampleAuditLogs: AuditLog[] = [
  {
    id: 'au1',
    userId: 'u2',
    userName: 'Maulana Rafiqul Islam',
    entity: 'Student',
    entityId: 'STU-0045',
    field: 'status',
    oldValue: 'Pending',
    newValue: 'Active',
    timestamp: '2025-03-05 10:00:20',
  },
  {
    id: 'au2',
    userId: 'u6',
    userName: 'Mrs. Salma Begum',
    entity: 'Invoice',
    entityId: 'INV-2025-0038',
    field: 'lateFeeAmount',
    oldValue: '৳0',
    newValue: '৳100',
    timestamp: '2025-03-05 10:30:12',
  },
  {
    id: 'au3',
    userId: 'u2',
    userName: 'Maulana Rafiqul Islam',
    entity: 'User',
    entityId: 'u8',
    field: 'status',
    oldValue: 'Active',
    newValue: 'Inactive',
    timestamp: '2025-03-05 12:00:10',
  },
  {
    id: 'au4',
    userId: 'u5',
    userName: 'Mr. Karim Uddin',
    entity: 'FeeStructure',
    entityId: 'FS-0012',
    field: 'amount',
    oldValue: '৳4,500',
    newValue: '৳5,000',
    timestamp: '2025-03-04 16:30:00',
  },
  {
    id: 'au5',
    userId: 'u1',
    userName: 'Hafez Maulana Abdul Karim',
    entity: 'Settings',
    entityId: 'SYS-001',
    field: 'fiscalYearStart',
    oldValue: 'April',
    newValue: 'January',
    timestamp: '2025-03-05 11:00:00',
  },
  {
    id: 'au6',
    userId: 'u3',
    userName: 'Ustad Muhammad Ali',
    entity: 'Student',
    entityId: 'STU-0032',
    field: 'class',
    oldValue: 'Class 4-A',
    newValue: 'Class 5-A',
    timestamp: '2025-03-04 14:20:00',
  },
  {
    id: 'au7',
    userId: 'u2',
    userName: 'Maulana Rafiqul Islam',
    entity: 'Employee',
    entityId: 'EMP-008',
    field: 'salary',
    oldValue: '৳15,000',
    newValue: '৳18,000',
    timestamp: '2025-03-03 10:00:00',
  },
  {
    id: 'au8',
    userId: 'u1',
    userName: 'Hafez Maulana Abdul Karim',
    entity: 'User',
    entityId: 'u7',
    field: 'role',
    oldValue: 'Viewer',
    newValue: 'Staff',
    timestamp: '2025-03-02 09:30:00',
  },
];

// ---------- Helper ----------

/** Get initials from a name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((part) => !['Mr.', 'Mrs.', 'Hafez', 'Maulana', 'Ustad', 'Ustadah'].includes(part))
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Role badge color mapping */
export const roleBadgeColors: Record<UserRole, { bg: string; text: string }> = {
  'Super Admin': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400' },
  Admin: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  Teacher: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  Accountant: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-400' },
  Staff: { bg: 'bg-slate-100 dark:bg-slate-800/30', text: 'text-slate-700 dark:text-slate-400' },
  Viewer: { bg: 'bg-stone-100 dark:bg-stone-800/30', text: 'text-stone-600 dark:text-stone-400' },
};

/** Action badge color mapping */
export const actionBadgeColors: Record<ActionType, { bg: string; text: string }> = {
  Create: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  Update: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  Delete: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400' },
  Login: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-400' },
  Logout: { bg: 'bg-slate-100 dark:bg-slate-800/30', text: 'text-slate-700 dark:text-slate-400' },
};

/** User status color mapping */
export const userStatusColors: Record<UserStatus, { bg: string; text: string; dot: string }> = {
  Active: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Inactive: { bg: 'bg-stone-100 dark:bg-stone-800/30', text: 'text-stone-600 dark:text-stone-400', dot: 'bg-stone-400' },
  Suspended: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
};

/** Notification type icon mapping (lucide icon name) */
export const notificationTypeIcon: Record<NotificationType, string> = {
  System: 'Bell',
  Finance: 'Banknote',
  Academic: 'GraduationCap',
  General: 'Info',
};
