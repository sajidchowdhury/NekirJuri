// ============================================================
// Payroll Sample Data — Realistic Bangladeshi Islamic school context
// ============================================================

/** Format amount in Bengali Taka */
export function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

// ============================================================
// Types
// ============================================================

export interface Employee {
  id: string;
  name: string;
  nameBn: string;
  type: 'teacher' | 'employee';
  department: string;
  designation: string;
  employeeId: string;
  photoUrl?: string;
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  employee: Employee;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  specialAllowance: number;
  providentFund: number;
  taxDeduction: number;
  otherDeduction: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

export interface SalaryPayment {
  id: string;
  salaryStructureId: string;
  employee: Employee;
  month: number;
  year: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  absentDays: number;
  absentDeduction: number;
  paymentDate: string;
  status: 'paid' | 'pending';
}

export interface PayrollTrend {
  month: string;
  total: number;
  deductions: number;
}

export interface DepartmentBreakdown {
  department: string;
  employeeCount: number;
  totalNet: number;
  color: string;
}

// ============================================================
// Employees (12: 7 Teachers + 5 Employees)
// ============================================================

export const employees: Employee[] = [
  // Teachers (7)
  {
    id: 'emp-001',
    name: 'Hafez Maulana Abdul Karim',
    nameBn: 'হাফেজ মাওলানা আব্দুল কারিম',
    type: 'teacher',
    department: 'Teaching',
    designation: 'Principal',
    employeeId: 'T-001',
  },
  {
    id: 'emp-002',
    name: 'Maulana Rafiqul Islam',
    nameBn: 'মাওলানা রফিকুল ইসলাম',
    type: 'teacher',
    department: 'Teaching',
    designation: 'Vice Principal',
    employeeId: 'T-002',
  },
  {
    id: 'emp-003',
    name: 'Maulana Shafiqul Haq',
    nameBn: 'মাওলানা শফিকুল হক',
    type: 'teacher',
    department: 'Teaching',
    designation: 'Hifz Teacher',
    employeeId: 'T-003',
  },
  {
    id: 'emp-004',
    name: 'Ustad Muhammad Ali',
    nameBn: 'উস্তাদ মুহাম্মাদ আলী',
    type: 'teacher',
    department: 'Teaching',
    designation: 'Arabic Teacher',
    employeeId: 'T-004',
  },
  {
    id: 'emp-005',
    name: 'Ustadah Fatima Khatun',
    nameBn: 'উস্তাদাহ ফাতিমা খাতুন',
    type: 'teacher',
    department: 'Teaching',
    designation: 'Quran Teacher',
    employeeId: 'T-005',
  },
  {
    id: 'emp-006',
    name: 'Maulana Jakaria Hossain',
    nameBn: 'মাওলানা যাকারিয়া হোসাইন',
    type: 'teacher',
    department: 'Teaching',
    designation: 'Islamic Studies Teacher',
    employeeId: 'T-006',
  },
  {
    id: 'emp-007',
    name: 'Mr. Shahidul Islam',
    nameBn: 'মি. শাহিদুল ইসলাম',
    type: 'teacher',
    department: 'Teaching',
    designation: 'Math Teacher',
    employeeId: 'T-007',
  },
  // Employees (5)
  {
    id: 'emp-008',
    name: 'Mr. Karim Uddin',
    nameBn: 'মি. করিম উদ্দিন',
    type: 'employee',
    department: 'Admin',
    designation: 'Admin Officer',
    employeeId: 'E-001',
  },
  {
    id: 'emp-009',
    name: 'Mrs. Salma Begum',
    nameBn: 'মিসেস সালমা বেগম',
    type: 'employee',
    department: 'Admin',
    designation: 'Accountant',
    employeeId: 'E-002',
  },
  {
    id: 'emp-010',
    name: 'Mr. Rafiq Miah',
    nameBn: 'মি. রফিক মিয়া',
    type: 'employee',
    department: 'Library',
    designation: 'Librarian',
    employeeId: 'E-003',
  },
  {
    id: 'emp-011',
    name: 'Mr. Joynal Abedin',
    nameBn: 'মি. জয়নাল আবেদিন',
    type: 'employee',
    department: 'Hostel',
    designation: 'Cook',
    employeeId: 'E-004',
  },
  {
    id: 'emp-012',
    name: 'Mr. Habibullah',
    nameBn: 'মি. হাবিবুল্লাহ',
    type: 'employee',
    department: 'Maintenance',
    designation: 'Peon',
    employeeId: 'E-005',
  },
];

// ============================================================
// Salary Structures
// ============================================================

export const salaryStructures: SalaryStructure[] = [
  // Principal: Basic ৳35,000
  {
    id: 'ss-001',
    employeeId: 'emp-001',
    employee: employees[0],
    basicSalary: 35000,
    houseRent: 14000,
    medicalAllowance: 3000,
    transportAllowance: 2500,
    specialAllowance: 2000,
    providentFund: 3500,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 35000 + 14000 + 3000 + 2500 + 2000, // 56,500
    totalDeductions: 3500, // 3,500
    netSalary: 56500 - 3500, // 53,000
  },
  // VP: Basic ৳28,000
  {
    id: 'ss-002',
    employeeId: 'emp-002',
    employee: employees[1],
    basicSalary: 28000,
    houseRent: 11200,
    medicalAllowance: 2000,
    transportAllowance: 1500,
    specialAllowance: 1000,
    providentFund: 2800,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 28000 + 11200 + 2000 + 1500 + 1000, // 43,700
    totalDeductions: 2800,
    netSalary: 43700 - 2800, // 40,900
  },
  // Hifz Teacher: Basic ৳22,000
  {
    id: 'ss-003',
    employeeId: 'emp-003',
    employee: employees[2],
    basicSalary: 22000,
    houseRent: 8800,
    medicalAllowance: 2000,
    transportAllowance: 1500,
    specialAllowance: 0,
    providentFund: 2200,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 22000 + 8800 + 2000 + 1500, // 34,300
    totalDeductions: 2200,
    netSalary: 34300 - 2200, // 32,100
  },
  // Arabic Teacher: Basic ৳20,000
  {
    id: 'ss-004',
    employeeId: 'emp-004',
    employee: employees[3],
    basicSalary: 20000,
    houseRent: 8000,
    medicalAllowance: 2000,
    transportAllowance: 1500,
    specialAllowance: 0,
    providentFund: 2000,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 20000 + 8000 + 2000 + 1500, // 31,500
    totalDeductions: 2000,
    netSalary: 31500 - 2000, // 29,500
  },
  // Quran Teacher: Basic ৳18,000
  {
    id: 'ss-005',
    employeeId: 'emp-005',
    employee: employees[4],
    basicSalary: 18000,
    houseRent: 7200,
    medicalAllowance: 2000,
    transportAllowance: 1500,
    specialAllowance: 0,
    providentFund: 1800,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 18000 + 7200 + 2000 + 1500, // 28,700
    totalDeductions: 1800,
    netSalary: 28700 - 1800, // 26,900
  },
  // Islamic Studies Teacher: Basic ৳20,000
  {
    id: 'ss-006',
    employeeId: 'emp-006',
    employee: employees[5],
    basicSalary: 20000,
    houseRent: 8000,
    medicalAllowance: 2000,
    transportAllowance: 1500,
    specialAllowance: 0,
    providentFund: 2000,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 20000 + 8000 + 2000 + 1500, // 31,500
    totalDeductions: 2000,
    netSalary: 31500 - 2000, // 29,500
  },
  // Math Teacher: Basic ৳22,000
  {
    id: 'ss-007',
    employeeId: 'emp-007',
    employee: employees[6],
    basicSalary: 22000,
    houseRent: 8800,
    medicalAllowance: 2000,
    transportAllowance: 1500,
    specialAllowance: 0,
    providentFund: 2200,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 22000 + 8800 + 2000 + 1500, // 34,300
    totalDeductions: 2200,
    netSalary: 34300 - 2200, // 32,100
  },
  // Admin Officer: Basic ৳20,000
  {
    id: 'ss-008',
    employeeId: 'emp-008',
    employee: employees[7],
    basicSalary: 20000,
    houseRent: 8000,
    medicalAllowance: 2000,
    transportAllowance: 1500,
    specialAllowance: 500,
    providentFund: 2000,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 20000 + 8000 + 2000 + 1500 + 500, // 32,000
    totalDeductions: 2000,
    netSalary: 32000 - 2000, // 30,000
  },
  // Accountant: Basic ৳15,000
  {
    id: 'ss-009',
    employeeId: 'emp-009',
    employee: employees[8],
    basicSalary: 15000,
    houseRent: 6000,
    medicalAllowance: 2000,
    transportAllowance: 1500,
    specialAllowance: 0,
    providentFund: 1500,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 15000 + 6000 + 2000 + 1500, // 24,500
    totalDeductions: 1500,
    netSalary: 24500 - 1500, // 23,000
  },
  // Librarian: Basic ৳12,000
  {
    id: 'ss-010',
    employeeId: 'emp-010',
    employee: employees[9],
    basicSalary: 12000,
    houseRent: 4800,
    medicalAllowance: 2000,
    transportAllowance: 1500,
    specialAllowance: 0,
    providentFund: 1200,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 12000 + 4800 + 2000 + 1500, // 20,300
    totalDeductions: 1200,
    netSalary: 20300 - 1200, // 19,100
  },
  // Cook: Basic ৳8,000
  {
    id: 'ss-011',
    employeeId: 'emp-011',
    employee: employees[10],
    basicSalary: 8000,
    houseRent: 3200,
    medicalAllowance: 2000,
    transportAllowance: 1500,
    specialAllowance: 0,
    providentFund: 800,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 8000 + 3200 + 2000 + 1500, // 14,700
    totalDeductions: 800,
    netSalary: 14700 - 800, // 13,900
  },
  // Peon: Basic ৳10,000
  {
    id: 'ss-012',
    employeeId: 'emp-012',
    employee: employees[11],
    basicSalary: 10000,
    houseRent: 4000,
    medicalAllowance: 2000,
    transportAllowance: 1500,
    specialAllowance: 0,
    providentFund: 1000,
    taxDeduction: 0,
    otherDeduction: 0,
    grossSalary: 10000 + 4000 + 2000 + 1500, // 17,500
    totalDeductions: 1000,
    netSalary: 17500 - 1000, // 16,500
  },
];

// ============================================================
// Salary Payments (22 for current month: 18 paid, 4 pending)
// ============================================================

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

function generatePayments(): SalaryPayment[] {
  const payments: SalaryPayment[] = [];
  const absentDaysMap: Record<string, number> = {
    'emp-003': 2,
    'emp-005': 1,
    'emp-007': 3,
    'emp-009': 1,
    'emp-011': 2,
    'emp-012': 1,
  };

  // Pending employees
  const pendingIds = new Set(['emp-005', 'emp-009', 'emp-011', 'emp-012']);

  salaryStructures.forEach((ss, index) => {
    const absentDays = absentDaysMap[ss.employeeId] ?? 0;
    const perDaySalary = ss.basicSalary / 30;
    const absentDeduction = Math.round(perDaySalary * absentDays);
    const adjustedNet = ss.netSalary - absentDeduction;
    const isPaid = !pendingIds.has(ss.employeeId);
    const paymentDate = isPaid
      ? new Date(currentYear, currentMonth - 1, 25).toISOString().split('T')[0]
      : '';

    payments.push({
      id: `sp-${String(index + 1).padStart(3, '0')}`,
      salaryStructureId: ss.id,
      employee: ss.employee,
      month: currentMonth,
      year: currentYear,
      grossSalary: ss.grossSalary,
      totalDeductions: ss.totalDeductions + absentDeduction,
      netSalary: adjustedNet,
      absentDays,
      absentDeduction,
      paymentDate,
      status: isPaid ? 'paid' : 'pending',
    });
  });

  // Add 10 more payments for previous months
  const prevMonths = [
    { month: currentMonth - 1 || 12, year: currentMonth === 1 ? currentYear - 1 : currentYear },
    { month: currentMonth - 2 || 12, year: currentMonth <= 2 ? currentYear - 1 : currentYear },
  ];

  prevMonths.forEach(({ month, year }) => {
    salaryStructures.slice(0, 5).forEach((ss, idx) => {
      payments.push({
        id: `sp-prev-${month}-${idx + 1}`,
        salaryStructureId: ss.id,
        employee: ss.employee,
        month,
        year,
        grossSalary: ss.grossSalary,
        totalDeductions: ss.totalDeductions,
        netSalary: ss.netSalary,
        absentDays: 0,
        absentDeduction: 0,
        paymentDate: new Date(year, month - 1, 25).toISOString().split('T')[0],
        status: 'paid',
      });
    });
  });

  return payments;
}

export const salaryPayments: SalaryPayment[] = generatePayments();

// ============================================================
// Payroll Trend (6 months)
// ============================================================

export const payrollTrend: PayrollTrend[] = [
  { month: 'Jan', total: 285000, deductions: 28000 },
  { month: 'Feb', total: 285000, deductions: 28000 },
  { month: 'Mar', total: 290000, deductions: 28500 },
  { month: 'Apr', total: 290000, deductions: 28500 },
  { month: 'May', total: 295000, deductions: 29000 },
  {
    month: new Date().toLocaleString('en', { month: 'short' }),
    total: salaryStructures.reduce((sum, s) => sum + s.grossSalary, 0),
    deductions: salaryStructures.reduce((sum, s) => sum + s.totalDeductions, 0),
  },
];

// ============================================================
// Department Breakdown
// ============================================================

export const departmentBreakdown: DepartmentBreakdown[] = [
  {
    department: 'Teaching',
    employeeCount: 7,
    totalNet: salaryStructures
      .filter((s) => s.employee.department === 'Teaching')
      .reduce((sum, s) => sum + s.netSalary, 0),
    color: 'emerald',
  },
  {
    department: 'Admin',
    employeeCount: 2,
    totalNet: salaryStructures
      .filter((s) => s.employee.department === 'Admin')
      .reduce((sum, s) => sum + s.netSalary, 0),
    color: 'amber',
  },
  {
    department: 'Library',
    employeeCount: 1,
    totalNet: salaryStructures
      .filter((s) => s.employee.department === 'Library')
      .reduce((sum, s) => sum + s.netSalary, 0),
    color: 'sky',
  },
  {
    department: 'Hostel',
    employeeCount: 1,
    totalNet: salaryStructures
      .filter((s) => s.employee.department === 'Hostel')
      .reduce((sum, s) => sum + s.netSalary, 0),
    color: 'violet',
  },
  {
    department: 'Maintenance',
    employeeCount: 1,
    totalNet: salaryStructures
      .filter((s) => s.employee.department === 'Maintenance')
      .reduce((sum, s) => sum + s.netSalary, 0),
    color: 'rose',
  },
];

// ============================================================
// Summary helpers
// ============================================================

export function getPayrollSummary() {
  const totalPayroll = salaryStructures.reduce((sum, s) => sum + s.netSalary, 0);
  const paidCount = salaryPayments.filter(
    (p) => p.month === currentMonth && p.year === currentYear && p.status === 'paid'
  ).length;
  const totalCount = salaryStructures.length;
  const avgSalary = Math.round(totalPayroll / totalCount);
  const departments = departmentBreakdown.length;

  return {
    totalPayroll,
    paidCount,
    totalCount,
    avgSalary,
    departments,
  };
}

/** Get month name from number */
export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString('en', { month: 'long' });
}
