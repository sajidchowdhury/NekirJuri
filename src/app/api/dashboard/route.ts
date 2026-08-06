// ============================================================
// DASHBOARD — Aggregated Stats API
// GET  /api/dashboard     — Return comprehensive dashboard statistics
// Returns sample data when no tenant context (for dev/preview)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, getTenantId } from '@/lib/api-utils'

/** Sample dashboard data for development/preview when no tenant is authenticated */
function getSampleDashboardData() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const monthStart = new Date(currentYear, currentMonth - 1, 1)
  const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)

  return {
    totalStudents: 1250,
    totalTeachers: 45,
    totalEmployees: 62,
    totalFeeCollected: 420000,
    totalFeeOutstanding: 85000,
    totalDonations: 32000,
    totalExpenses: 185000,
    totalSalaryPaid: 148000,
    activeClasses: 24,
    pendingInvoices: 38,
    monthlyFeeSummary: [
      { month: 'Mar 2025', monthNum: 3, year: 2025, collected: 45000, outstanding: 12000 },
      { month: 'Apr 2025', monthNum: 4, year: 2025, collected: 52000, outstanding: 8000 },
      { month: 'May 2025', monthNum: 5, year: 2025, collected: 48000, outstanding: 15000 },
      { month: 'Jun 2025', monthNum: 6, year: 2025, collected: 61000, outstanding: 9000 },
      { month: 'Jul 2025', monthNum: 7, year: 2025, collected: 55000, outstanding: 11000 },
      { month: 'Aug 2025', monthNum: 8, year: 2025, collected: 67000, outstanding: 7000 },
    ],
    recentActivities: [
      { id: 1, action: 'fee.collection', description: 'Abdullah Rahim paid ৳5,000 for Class 8', createdAt: new Date(Date.now() - 2 * 60000).toISOString(), entityType: 'fee_collection' },
      { id: 2, action: 'student.admit', description: 'Fatima Khatun admitted to Class 5 - Section A', createdAt: new Date(Date.now() - 15 * 60000).toISOString(), entityType: 'student' },
      { id: 3, action: 'salary.process', description: 'March 2025 payroll processed for 45 staff', createdAt: new Date(Date.now() - 60 * 60000).toISOString(), entityType: 'salary_payment' },
      { id: 4, action: 'expense.create', description: 'Book purchase expense ৳12,500 approved', createdAt: new Date(Date.now() - 120 * 60000).toISOString(), entityType: 'expense' },
      { id: 5, action: 'donation.receive', description: 'Zakat donation of ৳25,000 received from Al-Rahman Trust', createdAt: new Date(Date.now() - 180 * 60000).toISOString(), entityType: 'donation' },
      { id: 6, action: 'student.promote', description: '32 students promoted from Class 5 to Class 6', createdAt: new Date(Date.now() - 360 * 60000).toISOString(), entityType: 'student' },
      { id: 7, action: 'fee.invoice', description: 'Fee invoices generated for 1,250 students', createdAt: new Date(Date.now() - 720 * 60000).toISOString(), entityType: 'fee_invoice' },
      { id: 8, action: 'inventory.low', description: 'Low stock alert: Notebook quantity below 50', createdAt: new Date(Date.now() - 1440 * 60000).toISOString(), entityType: 'product' },
    ],
    meta: {
      currentMonth,
      currentYear,
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)

    // If no tenant context, return sample data for dev/preview
    if (!tenantId) {
      return success(getSampleDashboardData())
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1 // 1-12
    const currentYear = now.getFullYear()

    // Start of current month
    const monthStart = new Date(currentYear, currentMonth - 1, 1)
    // End of current month
    const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)

    // Run all aggregate queries in parallel
    const [
      totalStudents,
      totalTeachers,
      totalEmployees,
      feeCollectedResult,
      feeOutstandingResult,
      donationsResult,
      expensesResult,
      salaryPaidResult,
      activeClasses,
      pendingInvoices,
      recentActivities,
    ] = await Promise.all([
      // Total active students
      db.student.count({
        where: { tenantId, isActive: true, deletedAt: null },
      }),

      // Total active teachers
      db.teacher.count({
        where: { tenantId, isActive: true, deletedAt: null },
      }),

      // Total active employees
      db.employee.count({
        where: { tenantId, isActive: true, deletedAt: null },
      }),

      // Fee collected this month
      db.feeCollection.aggregate({
        _sum: { amount: true },
        where: {
          tenantId,
          paymentDate: { gte: monthStart, lte: monthEnd },
          status: 'completed',
        },
      }),

      // Fee outstanding (sum of balance on unpaid invoices)
      db.feeInvoice.aggregate({
        _sum: { balance: true },
        where: {
          tenantId,
          status: { not: 'paid' },
          deletedAt: null,
        },
      }),

      // Donations this month
      db.donation.aggregate({
        _sum: { amount: true },
        where: {
          tenantId,
          paymentDate: { gte: monthStart, lte: monthEnd },
        },
      }),

      // Expenses this month
      db.expense.aggregate({
        _sum: { amount: true },
        where: {
          tenantId,
          expenseDate: { gte: monthStart, lte: monthEnd },
          status: 'approved',
        },
      }),

      // Salary paid this month
      db.salaryPayment.aggregate({
        _sum: { netSalary: true },
        where: {
          tenantId,
          month: currentMonth,
          year: currentYear,
          status: 'paid',
        },
      }),

      // Active classes count
      db.class.count({
        where: { tenantId, status: 'active' },
      }),

      // Pending invoices count
      db.feeInvoice.count({
        where: { tenantId, status: 'pending', deletedAt: null },
      }),

      // Recent activities (last 10)
      db.activityLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    // Build monthly fee summary for last 6 months
    const monthlyFeeSummary = []
    for (let i = 5; i >= 0; i--) {
      const summaryMonth = currentMonth - i
      const summaryYear = currentYear
      // Handle negative months (wrap to previous year)
      const adjustedMonth = ((summaryMonth - 1) % 12) + 1
      const adjustedYear = summaryMonth <= 0 ? summaryYear - 1 : summaryYear
      const mStart = new Date(adjustedYear, adjustedMonth - 1, 1)
      const mEnd = new Date(adjustedYear, adjustedMonth, 0, 23, 59, 59, 999)

      const [collected, outstanding] = await Promise.all([
        db.feeCollection.aggregate({
          _sum: { amount: true },
          where: {
            tenantId,
            paymentDate: { gte: mStart, lte: mEnd },
            status: 'completed',
          },
        }),
        db.feeInvoice.aggregate({
          _sum: { balance: true },
          where: {
            tenantId,
            feeMonth: adjustedMonth,
            feeYear: adjustedYear,
            status: { not: 'paid' },
            deletedAt: null,
          },
        }),
      ])

      const monthName = mStart.toLocaleString('en-US', { month: 'short' })
      monthlyFeeSummary.push({
        month: `${monthName} ${adjustedYear}`,
        monthNum: adjustedMonth,
        year: adjustedYear,
        collected: collected._sum.amount ?? 0,
        outstanding: outstanding._sum.balance ?? 0,
      })
    }

    const stats = {
      totalStudents,
      totalTeachers,
      totalEmployees,
      totalFeeCollected: feeCollectedResult._sum.amount ?? 0,
      totalFeeOutstanding: feeOutstandingResult._sum.balance ?? 0,
      totalDonations: donationsResult._sum.amount ?? 0,
      totalExpenses: expensesResult._sum.amount ?? 0,
      totalSalaryPaid: salaryPaidResult._sum.netSalary ?? 0,
      activeClasses,
      pendingInvoices,
      monthlyFeeSummary,
      recentActivities,
      meta: {
        currentMonth,
        currentYear,
        monthStart: monthStart.toISOString(),
        monthEnd: monthEnd.toISOString(),
      },
    }

    return success(stats)
  } catch (err) {
    console.error('[GET /api/dashboard]', err)
    return error('Failed to fetch dashboard stats', 500)
  }
}
