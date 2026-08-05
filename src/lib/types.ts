// ============================================================
// Madrasha ERP SaaS — Shared TypeScript Types
// ============================================================

// --- Pagination ---
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// --- API Response ---
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// --- Auth ---
export interface AuthUser {
  id: number
  uuid: string
  email: string
  name: string
  tenantId: number | null
  isSuperAdmin: boolean
  roles: string[]
  permissions: string[]
}

// --- Tenant ---
export interface TenantCreateInput {
  name: string
  slug: string
  domain?: string
  logoUrl?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  phone?: string
  email?: string
  website?: string
}

export interface TenantUpdateInput extends Partial<TenantCreateInput> {
  isActive?: boolean
  settings?: string
}

// --- Academic Session ---
export interface AcademicSessionCreateInput {
  name: string
  startDate: string
  endDate: string
  isCurrent?: boolean
  status?: string
}

// --- Class ---
export interface ClassCreateInput {
  name: string
  code: string
  orderSequence: number
  academicSessionId: number
  teacherId?: number
  capacity?: number
  description?: string
  status?: string
}

// --- Section ---
export interface SectionCreateInput {
  classId: number
  name: string
  teacherId?: number
  capacity?: number
  status?: string
}

// --- Student ---
export interface StudentCreateInput {
  registrationNo: string
  admissionNo?: string
  name: string
  nameBn?: string
  fatherName?: string
  motherName?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  nationality?: string
  religion?: string
  photoUrl?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  classId: number
  sectionId?: number
  academicSessionId: number
  admissionDate?: string
  previousSchool?: string
  rollNo?: string
  status?: string
}

// --- Guardian ---
export interface GuardianCreateInput {
  name: string
  nameBn?: string
  relationship: string
  phone: string
  phoneAlt?: string
  email?: string
  occupation?: string
  address?: string
  city?: string
  photoUrl?: string
  nidNo?: string
}

// --- Teacher ---
export interface TeacherCreateInput {
  employeeIdNo: string
  name: string
  nameBn?: string
  fatherName?: string
  motherName?: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  nationality?: string
  religion?: string
  photoUrl?: string
  phone: string
  email?: string
  address?: string
  city?: string
  qualification?: string
  specialization?: string
  joiningDate?: string
  status?: string
}

// --- Employee ---
export interface EmployeeCreateInput {
  employeeIdNo: string
  name: string
  nameBn?: string
  fatherName?: string
  dateOfBirth?: string
  gender?: string
  phone: string
  email?: string
  address?: string
  designation?: string
  department?: string
  joiningDate?: string
  status?: string
}

// --- Fee ---
export interface FeeCategoryCreateInput {
  name: string
  code: string
  description?: string
  amount: number
  isRecurring?: boolean
  frequency?: string
}

export interface FeeInvoiceCreateInput {
  studentId: number
  academicSessionId: number
  classId: number
  issueDate: string
  dueDate: string
  items: { feeCategoryId: number; amount: number; discountAmount?: number; description?: string }[]
  feeMonth?: number
  feeYear?: number
  remarks?: string
}

export interface FeeCollectionCreateInput {
  invoiceId: number
  studentId: number
  amount: number
  paymentMethod: string
  paymentDate: string
  transactionRef?: string
  bankName?: string
  chequeNo?: string
  remarks?: string
}

// --- Donation ---
export interface DonationCreateInput {
  donationCategoryId: number
  donorId?: number
  amount: number
  paymentMethod: string
  paymentDate: string
  transactionRef?: string
  isAnonymous?: boolean
  remarks?: string
}

// --- Expense ---
export interface ExpenseCreateInput {
  expenseCategoryId: number
  amount: number
  description?: string
  expenseDate: string
  paymentMethod: string
  paidTo?: string
  receiptAttachment?: string
}

// --- Salary ---
export interface SalaryStructureCreateInput {
  employeeType: 'teacher' | 'staff'
  teacherId?: number
  employeeId?: number
  basicSalary: number
  houseRent?: number
  medicalAllowance?: number
  transportAllowance?: number
  otherAllowance?: number
  pfDeduction?: number
  taxDeduction?: number
  otherDeduction?: number
  effectiveFrom: string
  effectiveTo?: string
}

// --- Accounting ---
export interface ChartOfAccountCreateInput {
  code: string
  name: string
  accountType: string
  parentId?: number
  openingBalance?: number
  description?: string
}

// --- Inventory ---
export interface SupplierCreateInput {
  name: string
  code?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  contactPerson?: string
  nidNo?: string
  bankAccount?: string
}

export interface ProductCreateInput {
  name: string
  code: string
  categoryId: number
  description?: string
  unit?: string
  purchasePrice?: number
  salePrice?: number
  minStockLevel?: number
  maxStockLevel?: number
  hasExpiry?: boolean
}

export interface PurchaseCreateInput {
  supplierId: number
  purchaseDate: string
  items: { productId: number; quantity: number; unitPrice: number; discountAmount?: number }[]
  discountAmount?: number
  taxAmount?: number
  paymentMethod?: string
  remarks?: string
}

export interface SalesInvoiceCreateInput {
  studentId?: number
  customerName?: string
  saleDate: string
  items: { productId: number; quantity: number; unitPrice: number; discountAmount?: number }[]
  discountAmount?: number
  paymentMethod: string
  remarks?: string
}

// --- CMS ---
export interface NoticeCreateInput {
  title: string
  content?: string
  noticeType: string
  targetAudience?: string
  attachmentUrl?: string
}

export interface WebsitePageCreateInput {
  title: string
  slug: string
  content?: string
  metaTitle?: string
  metaDescription?: string
  featuredImageUrl?: string
  sortOrder?: number
}

// --- Dashboard ---
export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalEmployees: number
  totalFeeCollected: number
  totalFeeOutstanding: number
  totalDonations: number
  totalExpenses: number
  totalSalaryPaid: number
  activeClasses: number
  pendingInvoices: number
  recentCollections: number[]
  monthlyFeeSummary: { month: string; collected: number; outstanding: number }[]
}
