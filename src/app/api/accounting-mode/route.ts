// ============================================================
// Accounting Mode API Route — Get/Set accounting mode
// CR-8: Simplified Accounting Mode
// Modes: 'double-entry' (default) | 'simplified'
// Schema-aligned: reads/writes Tenant.accountingMode directly
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/api-utils'

const VALID_MODES = ['simplified', 'double-entry'] as const
type AccountingMode = (typeof VALID_MODES)[number]

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 401 })
    }

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { accountingMode: true },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Validate the stored value; fall back to 'double-entry' if corrupt
    const mode: AccountingMode = VALID_MODES.includes(tenant.accountingMode as AccountingMode)
      ? (tenant.accountingMode as AccountingMode)
      : 'double-entry'

    return NextResponse.json({ mode })
  } catch (error) {
    console.error('Error fetching accounting mode:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 401 })
    }

    const body = await req.json()
    const { mode } = body

    if (!mode || !VALID_MODES.includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be: simplified or double-entry' },
        { status: 400 }
      )
    }

    // Update the dedicated accountingMode column on Tenant
    await db.tenant.update({
      where: { id: tenantId },
      data: { accountingMode: mode },
    })

    // If switching to simplified mode, auto-generate basic accounts if none exist
    if (mode === 'simplified') {
      const existingAccounts = await db.chartOfAccount.count({
        where: { tenantId },
      })

      if (existingAccounts === 0) {
        await generateSimplifiedAccounts(tenantId)
      }
    }

    return NextResponse.json({ mode, success: true })
  } catch (error) {
    console.error('Error updating accounting mode:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Generate simplified chart of accounts for a tenant */
async function generateSimplifiedAccounts(tenantId: number) {
  const simplifiedAccounts = [
    // Income accounts (3xxx)
    { code: '3000', name: 'Fee Income', accountType: 'income', isSystem: true },
    { code: '3010', name: 'Tuition Fee', accountType: 'income', isSystem: true },
    { code: '3020', name: 'Admission Fee', accountType: 'income', isSystem: true },
    { code: '3030', name: 'Exam Fee', accountType: 'income', isSystem: true },
    { code: '3100', name: 'Donation Income', accountType: 'income', isSystem: true },
    { code: '3200', name: 'Other Income', accountType: 'income', isSystem: true },

    // Expense accounts (4xxx)
    { code: '4000', name: 'Salary Expenses', accountType: 'expense', isSystem: true },
    { code: '4010', name: 'Teacher Salary', accountType: 'expense', isSystem: true },
    { code: '4020', name: 'Staff Salary', accountType: 'expense', isSystem: true },
    { code: '4100', name: 'Utility Expenses', accountType: 'expense', isSystem: true },
    { code: '4110', name: 'Electricity', accountType: 'expense', isSystem: true },
    { code: '4120', name: 'Water', accountType: 'expense', isSystem: true },
    { code: '4200', name: 'Maintenance', accountType: 'expense', isSystem: true },
    { code: '4300', name: 'Stationery & Supplies', accountType: 'expense', isSystem: true },
    { code: '4400', name: 'Food Expenses', accountType: 'expense', isSystem: true },
    { code: '4500', name: 'Transport', accountType: 'expense', isSystem: true },
    { code: '4600', name: 'Admin Expenses', accountType: 'expense', isSystem: true },
  ]

  await db.chartOfAccount.createMany({
    data: simplifiedAccounts.map((acc) => ({
      tenantId,
      code: acc.code,
      name: acc.name,
      accountType: acc.accountType,
      isSystem: acc.isSystem,
      openingBalance: 0,
      currentBalance: 0,
      isActive: true,
    })),
    skipDuplicates: true,
  })
}
