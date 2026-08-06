// ============================================================
// Accounting Mode API Route — Get/Set accounting mode
// CR-8: Simplified Accounting Mode
// Modes: 'double-entry' (default) | 'simplified'
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 401 })
    }

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const settings = tenant.settings as Record<string, unknown> | null
    const accountingMode = (settings?.accountingMode as string) || 'double-entry'

    return NextResponse.json({ mode: accountingMode })
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

    if (!mode || !['simplified', 'double-entry'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be: simplified or double-entry' },
        { status: 400 }
      )
    }

    // Update tenant settings with the new accounting mode
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const currentSettings = (tenant.settings as Record<string, unknown>) || {}
    const updatedSettings = { ...currentSettings, accountingMode: mode }

    await db.tenant.update({
      where: { id: tenantId },
      data: { settings: updatedSettings },
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
