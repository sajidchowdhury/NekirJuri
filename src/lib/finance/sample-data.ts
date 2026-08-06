// ============================================================
// Finance Sample Data — Realistic Bangladeshi Islamic school context
// ============================================================

/** Format amount in Bengali Taka */
export function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

/** Fee frequency type */
export type FeeFrequency = 'monthly' | 'quarterly' | 'annual' | 'one-time';

/** Fee category */
export interface FeeCategory {
  id: string;
  nameBn: string;
  nameEn: string;
  amount: number;
  frequency: FeeFrequency;
  studentCount: number;
  icon: string;
  isRecurring: boolean;
}

/** Fee structure cell (class × category) */
export interface FeeStructureCell {
  classId: string;
  className: string;
  categoryId: string;
  amount: number;
  isSet: boolean; // green if set, amber if default, gray if N/A
}

/** Invoice status */
export type InvoiceStatus = 'paid' | 'partial' | 'overdue';

/** Fee invoice */
export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  studentNameBn: string;
  className: string;
  academicSession: string;
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  generatedDate: string;
  lineItems: InvoiceLineItem[];
  payments: PaymentRecord[];
}

/** Invoice line item */
export interface InvoiceLineItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  discount: number;
  netAmount: number;
}

/** Payment method */
export type PaymentMethod = 'cash' | 'bkash' | 'bank' | 'cheque';

/** Payment record */
export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  note: string;
  receivedBy: string;
}

/** Recent collection record */
export interface CollectionRecord {
  id: string;
  receiptNo: string;
  studentName: string;
  studentNameBn: string;
  className: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  invoiceNo: string;
}

/** Academic session */
export interface AcademicSession {
  id: string;
  name: string;
  isCurrent: boolean;
}

/** Class/Group for fee structure */
export interface ClassGroup {
  id: string;
  name: string;
  nameBn: string;
  sections: string[];
}

// ---- Sample Data ----

export const sampleSessions: AcademicSession[] = [
  { id: 's1', name: '2025 Academic Session', isCurrent: true },
  { id: 's2', name: '2024 Academic Session', isCurrent: false },
  { id: 's3', name: '2023 Academic Session', isCurrent: false },
];

export const sampleClasses: ClassGroup[] = [
  { id: 'hifz', name: 'Hifz', nameBn: 'হিফয', sections: ['A'] },
  { id: 'c1', name: 'Class 1', nameBn: '১ম শ্রেণি', sections: ['A', 'B'] },
  { id: 'c2', name: 'Class 2', nameBn: '২য় শ্রেণি', sections: ['A', 'B'] },
  { id: 'c3', name: 'Class 3', nameBn: '৩য় শ্রেণি', sections: ['A'] },
  { id: 'c4', name: 'Class 4', nameBn: '৪র্থ শ্রেণি', sections: ['A'] },
  { id: 'c5', name: 'Class 5', nameBn: '৫ম শ্রেণি', sections: ['A', 'B'] },
  { id: 'c6', name: 'Class 6', nameBn: '৬ষ্ঠ শ্রেণি', sections: ['A'] },
  { id: 'c7', name: 'Class 7', nameBn: '৭ম শ্রেণি', sections: ['A'] },
  { id: 'c8', name: 'Class 8', nameBn: '৮ম শ্রেণি', sections: ['A'] },
  { id: 'c9', name: 'Class 9', nameBn: '৯ম শ্রেণি', sections: ['A', 'B'] },
  { id: 'c10', name: 'Class 10', nameBn: '১০ম শ্রেণি', sections: ['A'] },
];

export const sampleFeeCategories: FeeCategory[] = [
  { id: 'fc1', nameBn: 'ভর্তি ফি', nameEn: 'Admission Fee', amount: 5000, frequency: 'one-time', studentCount: 120, icon: 'GraduationCap', isRecurring: false },
  { id: 'fc2', nameBn: 'টিউশন ফি', nameEn: 'Tuition Fee', amount: 1500, frequency: 'monthly', studentCount: 450, icon: 'BookOpen', isRecurring: true },
  { id: 'fc3', nameBn: 'পরীক্ষা ফি', nameEn: 'Exam Fee', amount: 500, frequency: 'quarterly', studentCount: 380, icon: 'FileText', isRecurring: true },
  { id: 'fc4', nameBn: 'যাতায়াত ফি', nameEn: 'Transport Fee', amount: 800, frequency: 'monthly', studentCount: 180, icon: 'Bus', isRecurring: true },
  { id: 'fc5', nameBn: 'হোস্টেল ফি', nameEn: 'Hostel Fee', amount: 2000, frequency: 'monthly', studentCount: 95, icon: 'Home', isRecurring: true },
  { id: 'fc6', nameBn: 'লাইব্রেরি ফি', nameEn: 'Library Fee', amount: 200, frequency: 'annual', studentCount: 300, icon: 'Library', isRecurring: true },
  { id: 'fc7', nameBn: 'কম্পিউটার ফি', nameEn: 'Computer Fee', amount: 300, frequency: 'monthly', studentCount: 200, icon: 'Monitor', isRecurring: true },
  { id: 'fc8', nameBn: 'স্পোর্টস ফি', nameEn: 'Sports Fee', amount: 150, frequency: 'annual', studentCount: 350, icon: 'Trophy', isRecurring: true },
];

// Fee structure matrix: class × category = amount
export const sampleFeeStructure: FeeStructureCell[] = [
  // Hifz
  { classId: 'hifz', className: 'Hifz', categoryId: 'fc1', amount: 3000, isSet: true },
  { classId: 'hifz', className: 'Hifz', categoryId: 'fc2', amount: 1200, isSet: true },
  { classId: 'hifz', className: 'Hifz', categoryId: 'fc3', amount: 400, isSet: true },
  { classId: 'hifz', className: 'Hifz', categoryId: 'fc4', amount: 600, isSet: true },
  { classId: 'hifz', className: 'Hifz', categoryId: 'fc5', amount: 1800, isSet: true },
  { classId: 'hifz', className: 'Hifz', categoryId: 'fc6', amount: 150, isSet: true },
  { classId: 'hifz', className: 'Hifz', categoryId: 'fc7', amount: 0, isSet: false },
  { classId: 'hifz', className: 'Hifz', categoryId: 'fc8', amount: 100, isSet: true },

  // Class 1
  { classId: 'c1', className: 'Class 1', categoryId: 'fc1', amount: 4000, isSet: true },
  { classId: 'c1', className: 'Class 1', categoryId: 'fc2', amount: 1000, isSet: true },
  { classId: 'c1', className: 'Class 1', categoryId: 'fc3', amount: 300, isSet: true },
  { classId: 'c1', className: 'Class 1', categoryId: 'fc4', amount: 600, isSet: true },
  { classId: 'c1', className: 'Class 1', categoryId: 'fc5', amount: 0, isSet: false },
  { classId: 'c1', className: 'Class 1', categoryId: 'fc6', amount: 150, isSet: true },
  { classId: 'c1', className: 'Class 1', categoryId: 'fc7', amount: 0, isSet: false },
  { classId: 'c1', className: 'Class 1', categoryId: 'fc8', amount: 100, isSet: true },

  // Class 2
  { classId: 'c2', className: 'Class 2', categoryId: 'fc1', amount: 4000, isSet: true },
  { classId: 'c2', className: 'Class 2', categoryId: 'fc2', amount: 1100, isSet: true },
  { classId: 'c2', className: 'Class 2', categoryId: 'fc3', amount: 350, isSet: true },
  { classId: 'c2', className: 'Class 2', categoryId: 'fc4', amount: 600, isSet: true },
  { classId: 'c2', className: 'Class 2', categoryId: 'fc5', amount: 0, isSet: false },
  { classId: 'c2', className: 'Class 2', categoryId: 'fc6', amount: 150, isSet: true },
  { classId: 'c2', className: 'Class 2', categoryId: 'fc7', amount: 0, isSet: false },
  { classId: 'c2', className: 'Class 2', categoryId: 'fc8', amount: 100, isSet: true },

  // Class 5
  { classId: 'c5', className: 'Class 5', categoryId: 'fc1', amount: 5000, isSet: true },
  { classId: 'c5', className: 'Class 5', categoryId: 'fc2', amount: 1500, isSet: true },
  { classId: 'c5', className: 'Class 5', categoryId: 'fc3', amount: 500, isSet: true },
  { classId: 'c5', className: 'Class 5', categoryId: 'fc4', amount: 800, isSet: true },
  { classId: 'c5', className: 'Class 5', categoryId: 'fc5', amount: 2000, isSet: true },
  { classId: 'c5', className: 'Class 5', categoryId: 'fc6', amount: 200, isSet: true },
  { classId: 'c5', className: 'Class 5', categoryId: 'fc7', amount: 300, isSet: true },
  { classId: 'c5', className: 'Class 5', categoryId: 'fc8', amount: 150, isSet: true },

  // Class 8
  { classId: 'c8', className: 'Class 8', categoryId: 'fc1', amount: 5000, isSet: true },
  { classId: 'c8', className: 'Class 8', categoryId: 'fc2', amount: 1800, isSet: true },
  { classId: 'c8', className: 'Class 8', categoryId: 'fc3', amount: 600, isSet: true },
  { classId: 'c8', className: 'Class 8', categoryId: 'fc4', amount: 800, isSet: true },
  { classId: 'c8', className: 'Class 8', categoryId: 'fc5', amount: 2000, isSet: true },
  { classId: 'c8', className: 'Class 8', categoryId: 'fc6', amount: 200, isSet: true },
  { classId: 'c8', className: 'Class 8', categoryId: 'fc7', amount: 400, isSet: true },
  { classId: 'c8', className: 'Class 8', categoryId: 'fc8', amount: 150, isSet: true },

  // Class 9
  { classId: 'c9', className: 'Class 9', categoryId: 'fc1', amount: 6000, isSet: true },
  { classId: 'c9', className: 'Class 9', categoryId: 'fc2', amount: 2000, isSet: true },
  { classId: 'c9', className: 'Class 9', categoryId: 'fc3', amount: 700, isSet: true },
  { classId: 'c9', className: 'Class 9', categoryId: 'fc4', amount: 900, isSet: true },
  { classId: 'c9', className: 'Class 9', categoryId: 'fc5', amount: 2500, isSet: true },
  { classId: 'c9', className: 'Class 9', categoryId: 'fc6', amount: 250, isSet: true },
  { classId: 'c9', className: 'Class 9', categoryId: 'fc7', amount: 500, isSet: true },
  { classId: 'c9', className: 'Class 9', categoryId: 'fc8', amount: 200, isSet: true },

  // Class 10
  { classId: 'c10', className: 'Class 10', categoryId: 'fc1', amount: 6000, isSet: true },
  { classId: 'c10', className: 'Class 10', categoryId: 'fc2', amount: 2200, isSet: true },
  { classId: 'c10', className: 'Class 10', categoryId: 'fc3', amount: 800, isSet: true },
  { classId: 'c10', className: 'Class 10', categoryId: 'fc4', amount: 900, isSet: true },
  { classId: 'c10', className: 'Class 10', categoryId: 'fc5', amount: 2500, isSet: true },
  { classId: 'c10', className: 'Class 10', categoryId: 'fc6', amount: 250, isSet: true },
  { classId: 'c10', className: 'Class 10', categoryId: 'fc7', amount: 500, isSet: true },
  { classId: 'c10', className: 'Class 10', categoryId: 'fc8', amount: 200, isSet: true },
];

export const sampleInvoices: FeeInvoice[] = [
  {
    id: 'inv1',
    invoiceNo: 'INV-2025-001',
    studentId: 'stu1',
    studentName: 'Abdur Rahman',
    studentNameBn: 'আব্দুর রহমান',
    className: 'Class 5 - A',
    academicSession: '2025',
    totalAmount: 3650,
    paidAmount: 3650,
    discountAmount: 0,
    balanceAmount: 0,
    status: 'paid',
    dueDate: '2025-02-15',
    generatedDate: '2025-01-15',
    lineItems: [
      { categoryId: 'fc2', categoryName: 'Tuition Fee', amount: 1500, discount: 0, netAmount: 1500 },
      { categoryId: 'fc3', categoryName: 'Exam Fee', amount: 500, discount: 0, netAmount: 500 },
      { categoryId: 'fc4', categoryName: 'Transport Fee', amount: 800, discount: 0, netAmount: 800 },
      { categoryId: 'fc7', categoryName: 'Computer Fee', amount: 300, discount: 0, netAmount: 300 },
      { categoryId: 'fc8', categoryName: 'Sports Fee', amount: 150, discount: 150, netAmount: 0 },
      { categoryId: 'fc6', categoryName: 'Library Fee', amount: 200, discount: 0, netAmount: 200 },
      { categoryId: 'fc8', categoryName: 'Sports Fee', amount: 200, discount: 0, netAmount: 200 },
    ],
    payments: [
      { id: 'pay1', invoiceId: 'inv1', amount: 2000, method: 'bkash', date: '2025-01-20', note: 'Bkash payment', receivedBy: 'Ustad Karim' },
      { id: 'pay2', invoiceId: 'inv1', amount: 1650, method: 'cash', date: '2025-01-25', note: 'Cash payment', receivedBy: 'Ustad Karim' },
    ],
  },
  {
    id: 'inv2',
    invoiceNo: 'INV-2025-002',
    studentId: 'stu2',
    studentName: 'Fatima Begum',
    studentNameBn: 'ফাতিমা বেগম',
    className: 'Class 8 - A',
    academicSession: '2025',
    totalAmount: 4350,
    paidAmount: 2500,
    discountAmount: 200,
    balanceAmount: 1650,
    status: 'partial',
    dueDate: '2025-02-15',
    generatedDate: '2025-01-15',
    lineItems: [
      { categoryId: 'fc2', categoryName: 'Tuition Fee', amount: 1800, discount: 200, netAmount: 1600 },
      { categoryId: 'fc3', categoryName: 'Exam Fee', amount: 600, discount: 0, netAmount: 600 },
      { categoryId: 'fc4', categoryName: 'Transport Fee', amount: 800, discount: 0, netAmount: 800 },
      { categoryId: 'fc7', categoryName: 'Computer Fee', amount: 400, discount: 0, netAmount: 400 },
      { categoryId: 'fc8', categoryName: 'Sports Fee', amount: 150, discount: 0, netAmount: 150 },
      { categoryId: 'fc6', categoryName: 'Library Fee', amount: 200, discount: 0, netAmount: 200 },
    ],
    payments: [
      { id: 'pay3', invoiceId: 'inv2', amount: 2500, method: 'bank', date: '2025-01-18', note: 'Bank transfer', receivedBy: 'Ustad Ahmed' },
    ],
  },
  {
    id: 'inv3',
    invoiceNo: 'INV-2025-003',
    studentId: 'stu3',
    studentName: 'Mohammad Ali',
    studentNameBn: 'মোহাম্মদ আলী',
    className: 'Class 10 - A',
    academicSession: '2025',
    totalAmount: 4950,
    paidAmount: 0,
    discountAmount: 0,
    balanceAmount: 4950,
    status: 'overdue',
    dueDate: '2025-01-31',
    generatedDate: '2025-01-01',
    lineItems: [
      { categoryId: 'fc2', categoryName: 'Tuition Fee', amount: 2200, discount: 0, netAmount: 2200 },
      { categoryId: 'fc3', categoryName: 'Exam Fee', amount: 800, discount: 0, netAmount: 800 },
      { categoryId: 'fc4', categoryName: 'Transport Fee', amount: 900, discount: 0, netAmount: 900 },
      { categoryId: 'fc7', categoryName: 'Computer Fee', amount: 500, discount: 0, netAmount: 500 },
      { categoryId: 'fc8', categoryName: 'Sports Fee', amount: 200, discount: 0, netAmount: 200 },
      { categoryId: 'fc6', categoryName: 'Library Fee', amount: 250, discount: 0, netAmount: 250 },
    ],
    payments: [],
  },
  {
    id: 'inv4',
    invoiceNo: 'INV-2025-004',
    studentId: 'stu4',
    studentName: 'Ayesha Siddika',
    studentNameBn: 'আয়েশা সিদ্দিকা',
    className: 'Hifz - A',
    academicSession: '2025',
    totalAmount: 2650,
    paidAmount: 2650,
    discountAmount: 100,
    balanceAmount: 0,
    status: 'paid',
    dueDate: '2025-02-15',
    generatedDate: '2025-01-15',
    lineItems: [
      { categoryId: 'fc2', categoryName: 'Tuition Fee', amount: 1200, discount: 100, netAmount: 1100 },
      { categoryId: 'fc3', categoryName: 'Exam Fee', amount: 400, discount: 0, netAmount: 400 },
      { categoryId: 'fc4', categoryName: 'Transport Fee', amount: 600, discount: 0, netAmount: 600 },
      { categoryId: 'fc8', categoryName: 'Sports Fee', amount: 100, discount: 0, netAmount: 100 },
      { categoryId: 'fc6', categoryName: 'Library Fee', amount: 150, discount: 0, netAmount: 150 },
    ],
    payments: [
      { id: 'pay4', invoiceId: 'inv4', amount: 2650, method: 'cash', date: '2025-01-16', note: 'Full cash payment', receivedBy: 'Ustad Karim' },
    ],
  },
  {
    id: 'inv5',
    invoiceNo: 'INV-2025-005',
    studentId: 'stu5',
    studentName: 'Ibrahim Hossain',
    studentNameBn: 'ইব্রাহিম হোসেন',
    className: 'Class 9 - A',
    academicSession: '2025',
    totalAmount: 4650,
    paidAmount: 3000,
    discountAmount: 0,
    balanceAmount: 1650,
    status: 'partial',
    dueDate: '2025-02-15',
    generatedDate: '2025-01-15',
    lineItems: [
      { categoryId: 'fc2', categoryName: 'Tuition Fee', amount: 2000, discount: 0, netAmount: 2000 },
      { categoryId: 'fc3', categoryName: 'Exam Fee', amount: 700, discount: 0, netAmount: 700 },
      { categoryId: 'fc4', categoryName: 'Transport Fee', amount: 900, discount: 0, netAmount: 900 },
      { categoryId: 'fc7', categoryName: 'Computer Fee', amount: 500, discount: 0, netAmount: 500 },
      { categoryId: 'fc8', categoryName: 'Sports Fee', amount: 200, discount: 0, netAmount: 200 },
      { categoryId: 'fc6', categoryName: 'Library Fee', amount: 250, discount: 0, netAmount: 250 },
    ],
    payments: [
      { id: 'pay5', invoiceId: 'inv5', amount: 2000, method: 'bkash', date: '2025-01-20', note: 'Bkash', receivedBy: 'Ustad Rahim' },
      { id: 'pay6', invoiceId: 'inv5', amount: 1000, method: 'cash', date: '2025-01-28', note: 'Cash', receivedBy: 'Ustad Rahim' },
    ],
  },
  {
    id: 'inv6',
    invoiceNo: 'INV-2025-006',
    studentId: 'stu6',
    studentName: 'Zainab Khatun',
    studentNameBn: 'জয়নাব খাতুন',
    className: 'Class 5 - B',
    academicSession: '2025',
    totalAmount: 3650,
    paidAmount: 0,
    discountAmount: 0,
    balanceAmount: 3650,
    status: 'overdue',
    dueDate: '2025-01-15',
    generatedDate: '2024-12-15',
    lineItems: [
      { categoryId: 'fc2', categoryName: 'Tuition Fee', amount: 1500, discount: 0, netAmount: 1500 },
      { categoryId: 'fc3', categoryName: 'Exam Fee', amount: 500, discount: 0, netAmount: 500 },
      { categoryId: 'fc4', categoryName: 'Transport Fee', amount: 800, discount: 0, netAmount: 800 },
      { categoryId: 'fc7', categoryName: 'Computer Fee', amount: 300, discount: 0, netAmount: 300 },
      { categoryId: 'fc8', categoryName: 'Sports Fee', amount: 150, discount: 0, netAmount: 150 },
      { categoryId: 'fc6', categoryName: 'Library Fee', amount: 200, discount: 0, netAmount: 200 },
    ],
    payments: [],
  },
  {
    id: 'inv7',
    invoiceNo: 'INV-2025-007',
    studentId: 'stu7',
    studentName: 'Tariq Mahmud',
    studentNameBn: 'তারিক মাহমুদ',
    className: 'Class 2 - A',
    academicSession: '2025',
    totalAmount: 2300,
    paidAmount: 2300,
    discountAmount: 50,
    balanceAmount: 0,
    status: 'paid',
    dueDate: '2025-02-15',
    generatedDate: '2025-01-15',
    lineItems: [
      { categoryId: 'fc2', categoryName: 'Tuition Fee', amount: 1100, discount: 50, netAmount: 1050 },
      { categoryId: 'fc3', categoryName: 'Exam Fee', amount: 350, discount: 0, netAmount: 350 },
      { categoryId: 'fc4', categoryName: 'Transport Fee', amount: 600, discount: 0, netAmount: 600 },
      { categoryId: 'fc8', categoryName: 'Sports Fee', amount: 100, discount: 0, netAmount: 100 },
      { categoryId: 'fc6', categoryName: 'Library Fee', amount: 150, discount: 0, netAmount: 150 },
    ],
    payments: [
      { id: 'pay7', invoiceId: 'inv7', amount: 2300, method: 'cash', date: '2025-01-22', note: 'Cash', receivedBy: 'Ustad Karim' },
    ],
  },
  {
    id: 'inv8',
    invoiceNo: 'INV-2025-008',
    studentId: 'stu8',
    studentName: 'Sadia Akter',
    studentNameBn: 'সাদিয়া আক্তার',
    className: 'Class 9 - B',
    academicSession: '2025',
    totalAmount: 4150,
    paidAmount: 0,
    discountAmount: 0,
    balanceAmount: 4150,
    status: 'overdue',
    dueDate: '2025-01-20',
    generatedDate: '2024-12-20',
    lineItems: [
      { categoryId: 'fc2', categoryName: 'Tuition Fee', amount: 2000, discount: 0, netAmount: 2000 },
      { categoryId: 'fc3', categoryName: 'Exam Fee', amount: 700, discount: 0, netAmount: 700 },
      { categoryId: 'fc5', categoryName: 'Hostel Fee', amount: 2500, discount: 0, netAmount: 2500 },
      { categoryId: 'fc6', categoryName: 'Library Fee', amount: 250, discount: 0, netAmount: 250 },
    ],
    payments: [],
  },
];

export const sampleCollections: CollectionRecord[] = [
  { id: 'col1', receiptNo: 'RCT-2025-001', studentName: 'Abdur Rahman', studentNameBn: 'আব্দুর রহমান', className: 'Class 5 - A', amount: 2000, method: 'bkash', date: '2025-01-20', invoiceNo: 'INV-2025-001' },
  { id: 'col2', receiptNo: 'RCT-2025-002', studentName: 'Abdur Rahman', studentNameBn: 'আব্দুর রহমান', className: 'Class 5 - A', amount: 1650, method: 'cash', date: '2025-01-25', invoiceNo: 'INV-2025-001' },
  { id: 'col3', receiptNo: 'RCT-2025-003', studentName: 'Fatima Begum', studentNameBn: 'ফাতিমা বেগম', className: 'Class 8 - A', amount: 2500, method: 'bank', date: '2025-01-18', invoiceNo: 'INV-2025-002' },
  { id: 'col4', receiptNo: 'RCT-2025-004', studentName: 'Ayesha Siddika', studentNameBn: 'আয়েশা সিদ্দিকা', className: 'Hifz - A', amount: 2650, method: 'cash', date: '2025-01-16', invoiceNo: 'INV-2025-004' },
  { id: 'col5', receiptNo: 'RCT-2025-005', studentName: 'Ibrahim Hossain', studentNameBn: 'ইব্রাহিম হোসেন', className: 'Class 9 - A', amount: 2000, method: 'bkash', date: '2025-01-20', invoiceNo: 'INV-2025-005' },
  { id: 'col6', receiptNo: 'RCT-2025-006', studentName: 'Ibrahim Hossain', studentNameBn: 'ইব্রাহিম হোসেন', className: 'Class 9 - A', amount: 1000, method: 'cash', date: '2025-01-28', invoiceNo: 'INV-2025-005' },
  { id: 'col7', receiptNo: 'RCT-2025-007', studentName: 'Tariq Mahmud', studentNameBn: 'তারিক মাহমুদ', className: 'Class 2 - A', amount: 2300, method: 'cash', date: '2025-01-22', invoiceNo: 'INV-2025-007' },
  { id: 'col8', receiptNo: 'RCT-2025-008', studentName: 'Hamid Uddin', studentNameBn: 'হামিদ উদ্দীন', className: 'Class 8 - A', amount: 1800, method: 'bkash', date: '2025-02-01', invoiceNo: 'INV-2025-009' },
  { id: 'col9', receiptNo: 'RCT-2025-009', studentName: 'Nusrat Jahan', studentNameBn: 'নুসরাত জাহান', className: 'Class 5 - B', amount: 1500, method: 'cheque', date: '2025-02-03', invoiceNo: 'INV-2025-010' },
  { id: 'col10', receiptNo: 'RCT-2025-010', studentName: 'Rafiq Islam', studentNameBn: 'রফিক ইসলাম', className: 'Class 10 - A', amount: 2200, method: 'bkash', date: '2025-02-05', invoiceNo: 'INV-2025-011' },
];

/** Collection summary stats */
export const collectionSummary = {
  todayCollection: 15800,
  thisMonthCollection: 245000,
  thisYearCollection: 1850000,
  byMethod: {
    cash: { amount: 62500, count: 28, percentage: 25.5 },
    bkash: { amount: 122500, count: 52, percentage: 50.0 },
    bank: { amount: 49000, count: 12, percentage: 20.0 },
    cheque: { amount: 11000, count: 4, percentage: 4.5 },
  },
};

/** Students for wizard selection */
export const sampleStudentsForInvoice = [
  { id: 'stu1', name: 'Abdur Rahman', nameBn: 'আব্দুর রহমান', className: 'Class 5 - A', roll: '01' },
  { id: 'stu2', name: 'Fatima Begum', nameBn: 'ফাতিমা বেগম', className: 'Class 5 - A', roll: '02' },
  { id: 'stu3', name: 'Mohammad Ali', nameBn: 'মোহাম্মদ আলী', className: 'Class 5 - A', roll: '03' },
  { id: 'stu4', name: 'Ayesha Siddika', nameBn: 'আয়েশা সিদ্দিকা', className: 'Class 5 - B', roll: '04' },
  { id: 'stu5', name: 'Ibrahim Hossain', nameBn: 'ইব্রাহিম হোসেন', className: 'Class 5 - A', roll: '05' },
  { id: 'stu6', name: 'Zainab Khatun', nameBn: 'জয়নাব খাতুন', className: 'Class 5 - B', roll: '06' },
  { id: 'stu7', name: 'Tariq Mahmud', nameBn: 'তারিক মাহমুদ', className: 'Class 5 - A', roll: '07' },
  { id: 'stu8', name: 'Sadia Akter', nameBn: 'সাদিয়া আক্তার', className: 'Class 5 - B', roll: '08' },
  { id: 'stu9', name: 'Hamid Uddin', nameBn: 'হামিদ উদ্দীন', className: 'Class 5 - A', roll: '09' },
  { id: 'stu10', name: 'Nusrat Jahan', nameBn: 'নুসরাত জাহান', className: 'Class 5 - B', roll: '10' },
];

// ============================================================
// Donation & Expense Sample Data
// Phase 5B — Donations + Expenses
// ============================================================

/** Donation category */
export type DonationCategory = 'zakat' | 'sadaqah' | 'general' | 'construction' | 'education';

/** Donor record */
export interface Donor {
  id: string;
  name: string;
  nameBn: string;
  phone: string;
  category: DonationCategory;
  totalDonated: number;
  lastDonationDate: string;
  donationsCount: number;
  isRegular?: boolean;
  reminderConsent?: boolean;
  reminderMethod?: 'email' | 'sms';
  totalPledged?: number;
}

/** Donation record */
export interface DonationRecord {
  id: string;
  donorId: string;
  donorName: string;
  category: DonationCategory;
  amount: number;
  date: string;
  method: PaymentMethod;
  note: string;
}

/** Donation monthly trend data */
export interface DonationTrendPoint {
  month: string;
  amount: number;
}

/** Donation category breakdown */
export interface DonationCategoryBreakdown {
  category: DonationCategory;
  amount: number;
  count: number;
}

/** Expense category */
export type ExpenseCategory = 'utilities' | 'maintenance' | 'stationery' | 'food' | 'transport' | 'salary' | 'misc';

/** Expense record */
export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  receiptRef: string;
  note: string;
}

/** Budget allocation per category */
export interface BudgetAllocation {
  category: ExpenseCategory;
  budget: number;
  spent: number;
}

// ---- Donation Sample Data ----

export const sampleDonors: Donor[] = [
  { id: 'd1', name: 'Hafez Maulana Abdul Karim', nameBn: 'হাফেজ মাওলানা আব্দুল করিম', phone: '01711-123456', category: 'zakat', totalDonated: 250000, lastDonationDate: '2025-02-15', donationsCount: 5, isRegular: true, reminderConsent: true, reminderMethod: 'sms', totalPledged: 50000 },
  { id: 'd2', name: 'Alhaj Mohammad Yusuf', nameBn: 'আলহাজ মোহাম্মদ ইউসুফ', phone: '01812-234567', category: 'sadaqah', totalDonated: 180000, lastDonationDate: '2025-02-10', donationsCount: 4, isRegular: true, reminderConsent: true, reminderMethod: 'email', totalPledged: 40000 },
  { id: 'd3', name: 'Dr. Amina Begum', nameBn: 'ডাঃ আমিনা বেগম', phone: '01913-345678', category: 'education', totalDonated: 150000, lastDonationDate: '2025-01-28', donationsCount: 3, isRegular: true, reminderConsent: true, reminderMethod: 'email', totalPledged: 50000 },
  { id: 'd4', name: 'Haji Rafiq Ahmed', nameBn: 'হাজী রফিক আহমেদ', phone: '01614-456789', category: 'construction', totalDonated: 320000, lastDonationDate: '2025-02-08', donationsCount: 6, isRegular: false, reminderConsent: false },
  { id: 'd5', name: 'Maulana Shahidul Islam', nameBn: 'মাওলানা শহিদুল ইসলাম', phone: '01515-567890', category: 'zakat', totalDonated: 95000, lastDonationDate: '2025-01-20', donationsCount: 2, isRegular: false, reminderConsent: true, reminderMethod: 'sms' },
  { id: 'd6', name: 'Advocate Nurul Islam', nameBn: 'অ্যাডভোকেট নুরুল ইসলাম', phone: '01416-678901', category: 'general', totalDonated: 75000, lastDonationDate: '2025-02-01', donationsCount: 3, isRegular: true, reminderConsent: true, reminderMethod: 'sms', totalPledged: 25000 },
  { id: 'd7', name: 'Prof. Hasina Akhter', nameBn: 'অধ্যাপক হাসিনা আখতার', phone: '01317-789012', category: 'sadaqah', totalDonated: 60000, lastDonationDate: '2025-01-15', donationsCount: 2, isRegular: false, reminderConsent: false },
  { id: 'd8', name: 'Hafez Maulana Obaidullah', nameBn: 'হাফেজ মাওলানা ওবাইদুল্লাহ', phone: '01218-890123', category: 'education', totalDonated: 45000, lastDonationDate: '2025-02-12', donationsCount: 2, isRegular: true, reminderConsent: true, reminderMethod: 'email', totalPledged: 25000 },
];

export const sampleDonations: DonationRecord[] = [
  { id: 'don1', donorId: 'd1', donorName: 'Hafez Maulana Abdul Karim', category: 'zakat', amount: 100000, date: '2025-02-15', method: 'bank', note: 'Zakat al-Fitr distribution' },
  { id: 'don2', donorId: 'd1', donorName: 'Hafez Maulana Abdul Karim', category: 'zakat', amount: 50000, date: '2025-01-10', method: 'cash', note: 'Annual Zakat' },
  { id: 'don3', donorId: 'd2', donorName: 'Alhaj Mohammad Yusuf', category: 'sadaqah', amount: 60000, date: '2025-02-10', method: 'bkash', note: 'Sadaqah for student meals' },
  { id: 'don4', donorId: 'd2', donorName: 'Alhaj Mohammad Yusuf', category: 'sadaqah', amount: 40000, date: '2025-01-05', method: 'cash', note: 'Monthly Sadaqah' },
  { id: 'don5', donorId: 'd3', donorName: 'Dr. Amina Begum', category: 'education', amount: 50000, date: '2025-01-28', method: 'bank', note: 'Scholarship fund' },
  { id: 'don6', donorId: 'd3', donorName: 'Dr. Amina Begum', category: 'education', amount: 50000, date: '2024-12-15', method: 'cheque', note: 'Books and supplies' },
  { id: 'don7', donorId: 'd4', donorName: 'Haji Rafiq Ahmed', category: 'construction', amount: 100000, date: '2025-02-08', method: 'bank', note: 'New classroom construction' },
  { id: 'don8', donorId: 'd4', donorName: 'Haji Rafiq Ahmed', category: 'construction', amount: 80000, date: '2025-01-12', method: 'bank', note: 'Mosque extension' },
  { id: 'don9', donorId: 'd5', donorName: 'Maulana Shahidul Islam', category: 'zakat', amount: 50000, date: '2025-01-20', method: 'cash', note: 'Zakat contribution' },
  { id: 'don10', donorId: 'd5', donorName: 'Maulana Shahidul Islam', category: 'zakat', amount: 45000, date: '2024-12-20', method: 'bkash', note: 'Zakat mal' },
  { id: 'don11', donorId: 'd6', donorName: 'Advocate Nurul Islam', category: 'general', amount: 30000, date: '2025-02-01', method: 'cash', note: 'General fund support' },
  { id: 'don12', donorId: 'd6', donorName: 'Advocate Nurul Islam', category: 'general', amount: 25000, date: '2025-01-08', method: 'bkash', note: 'Operational support' },
  { id: 'don13', donorId: 'd7', donorName: 'Prof. Hasina Akhter', category: 'sadaqah', amount: 30000, date: '2025-01-15', method: 'bkash', note: 'Sadaqah jariyah' },
  { id: 'don14', donorId: 'd8', donorName: 'Hafez Maulana Obaidullah', category: 'education', amount: 25000, date: '2025-02-12', method: 'cash', note: 'Quran distribution' },
  { id: 'don15', donorId: 'd4', donorName: 'Haji Rafiq Ahmed', category: 'construction', amount: 70000, date: '2024-12-10', method: 'bank', note: 'Boundary wall construction' },
];

export const sampleDonationTrend: DonationTrendPoint[] = [
  { month: 'Sep', amount: 180000 },
  { month: 'Oct', amount: 220000 },
  { month: 'Nov', amount: 195000 },
  { month: 'Dec', amount: 310000 },
  { month: 'Jan', amount: 340000 },
  { month: 'Feb', amount: 285000 },
];

export const sampleDonationCategoryBreakdown: DonationCategoryBreakdown[] = [
  { category: 'zakat', amount: 245000, count: 4 },
  { category: 'sadaqah', amount: 130000, count: 3 },
  { category: 'general', amount: 55000, count: 2 },
  { category: 'construction', amount: 250000, count: 3 },
  { category: 'education', amount: 125000, count: 3 },
];

// ---- Expense Sample Data ----

export const sampleExpenses: ExpenseRecord[] = [
  { id: 'exp1', category: 'salary', description: 'Teaching staff salary - February', amount: 80000, date: '2025-02-01', method: 'bank', receiptRef: 'SAL-2025-02-01', note: '12 teachers' },
  { id: 'exp2', category: 'salary', description: 'Admin staff salary - February', amount: 35000, date: '2025-02-01', method: 'bank', receiptRef: 'SAL-2025-02-02', note: '4 admin staff' },
  { id: 'exp3', category: 'utilities', description: 'Electricity bill - January', amount: 12000, date: '2025-02-05', method: 'bkash', receiptRef: 'ELEC-2025-01', note: 'DESCO bill' },
  { id: 'exp4', category: 'utilities', description: 'Water bill - January', amount: 3500, date: '2025-02-05', method: 'bkash', receiptRef: 'WATER-2025-01', note: 'WASA bill' },
  { id: 'exp5', category: 'utilities', description: 'Gas bill - January', amount: 2800, date: '2025-02-05', method: 'cash', receiptRef: 'GAS-2025-01', note: 'Titas Gas' },
  { id: 'exp6', category: 'food', description: 'Student meals - Week 1 Feb', amount: 15000, date: '2025-02-03', method: 'cash', receiptRef: 'FOOD-2025-02W1', note: 'Hostel students' },
  { id: 'exp7', category: 'food', description: 'Student meals - Week 2 Feb', amount: 14500, date: '2025-02-10', method: 'cash', receiptRef: 'FOOD-2025-02W2', note: 'Hostel students' },
  { id: 'exp8', category: 'maintenance', description: 'Building repair - roof leakage', amount: 8000, date: '2025-02-07', method: 'cash', receiptRef: 'MNT-2025-02-01', note: 'Class 5 block' },
  { id: 'exp9', category: 'maintenance', description: 'Plumbing repair - washroom', amount: 3500, date: '2025-02-12', method: 'cash', receiptRef: 'MNT-2025-02-02', note: 'Ground floor' },
  { id: 'exp10', category: 'stationery', description: 'Exam papers & printing', amount: 5000, date: '2025-02-08', method: 'cash', receiptRef: 'STN-2025-02-01', note: 'Mid-term exam' },
  { id: 'exp11', category: 'stationery', description: 'Office supplies', amount: 2000, date: '2025-02-15', method: 'cash', receiptRef: 'STN-2025-02-02', note: 'Files, registers' },
  { id: 'exp12', category: 'transport', description: 'Staff transport - February', amount: 6000, date: '2025-02-01', method: 'cash', receiptRef: 'TRN-2025-02', note: 'Monthly transport' },
  { id: 'exp13', category: 'misc', description: 'Internet bill - February', amount: 2000, date: '2025-02-01', method: 'bkash', receiptRef: 'NET-2025-02', note: 'ISP monthly' },
  { id: 'exp14', category: 'misc', description: 'Mosque cleaning supplies', amount: 1500, date: '2025-02-10', method: 'cash', receiptRef: 'MSC-2025-02-01', note: 'Detergents, brooms' },
  { id: 'exp15', category: 'salary', description: 'Teaching staff salary - January', amount: 80000, date: '2025-01-01', method: 'bank', receiptRef: 'SAL-2025-01-01', note: '12 teachers' },
  { id: 'exp16', category: 'salary', description: 'Admin staff salary - January', amount: 35000, date: '2025-01-01', method: 'bank', receiptRef: 'SAL-2025-01-02', note: '4 admin staff' },
  { id: 'exp17', category: 'utilities', description: 'Electricity bill - December', amount: 11500, date: '2025-01-05', method: 'bkash', receiptRef: 'ELEC-2024-12', note: 'DESCO bill' },
  { id: 'exp18', category: 'food', description: 'Student meals - January total', amount: 55000, date: '2025-01-31', method: 'cash', receiptRef: 'FOOD-2025-01', note: 'Hostel students' },
  { id: 'exp19', category: 'maintenance', description: 'White-wash & painting', amount: 12000, date: '2025-01-15', method: 'cash', receiptRef: 'MNT-2025-01-01', note: 'Exam hall' },
  { id: 'exp20', category: 'transport', description: 'Staff transport - January', amount: 5500, date: '2025-01-01', method: 'cash', receiptRef: 'TRN-2025-01', note: 'Monthly transport' },
];

export const sampleBudgetAllocations: BudgetAllocation[] = [
  { category: 'salary', budget: 120000, spent: 115000 },
  { category: 'utilities', budget: 20000, spent: 18300 },
  { category: 'food', budget: 70000, spent: 84500 },
  { category: 'maintenance', budget: 15000, spent: 23500 },
  { category: 'stationery', budget: 10000, spent: 7000 },
  { category: 'transport', budget: 8000, spent: 11500 },
  { category: 'misc', budget: 5000, spent: 3500 },
];
