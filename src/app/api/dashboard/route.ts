// ============================================================
// DASHBOARD — Aggregated Stats API
// GET  /api/dashboard     — Return comprehensive dashboard statistics
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, requireTenantId } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

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
