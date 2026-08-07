// ============================================================
// Data Deletion — For terminated tenants
// CR-7: Deletes business data for terminated tenants 30+ days
// Keeps: Tenant, User, Subscription, SubscriptionPayment records
// ============================================================

import { db } from '@/lib/db'
import { DATA_DELETION_DELAY_DAYS } from '@/lib/subscription'
import { BACKUP_MODELS, getModelsInReverseOrder, getPrismaModel } from '@/lib/backup/models'

export interface DataDeletionResult {
  success: boolean
  tenantsProcessed: number
  totalRecordsDeleted: number
  errors: string[]
}

/**
 * Find tenants that are terminated and past the data deletion date.
 */
export async function findTenantsForDeletion(): Promise<{
  id: number
  name: string
  terminatedAt: Date
  dataDeletionDate: Date
}[]> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - DATA_DELETION_DELAY_DAYS)

  // Find subscriptions that are terminated and past the deletion date
  const terminatedSubscriptions = await db.subscription.findMany({
    where: {
      status: 'terminated',
      dataDeletionDate: { not: null, lte: new Date() },
    },
    select: {
      tenantId: true,
      dataDeletionDate: true,
      endDate: true,
      tenant: {
        select: { id: true, name: true },
      },
    },
  })

  return terminatedSubscriptions.map((sub) => ({
    id: sub.tenant.id,
    name: sub.tenant.name,
    terminatedAt: sub.endDate,
    dataDeletionDate: sub.dataDeletionDate!,
  }))
}

/**
 * Delete business data for a terminated tenant.
 * Keeps: Tenant, User, Subscription, SubscriptionPayment, Permission
 *
 * @param tenantId - The tenant whose data to delete
 */
export async function deleteTenantBusinessData(tenantId: number): Promise<{
  success: boolean
  recordsDeleted: number
  errors: string[]
}> {
  const errors: string[] = []
  let totalDeleted = 0

  // Delete in reverse dependency order to avoid FK violations
  const deleteOrder = getModelsInReverseOrder(BACKUP_MODELS)

  for (const modelDef of deleteOrder) {
    const prismaModel = getPrismaModel(modelDef.key)
    if (!prismaModel) continue

    try {
      const where = modelDef.hasTenantId ? { tenantId } : {}
      const result = await prismaModel.deleteMany({ where })
      totalDeleted += result.count
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      errors.push(`${modelDef.key}: ${msg}`)
    }
  }

  // Also delete UserRole entries for this tenant's users
  try {
    const result = await db.userRole.deleteMany({ where: { tenantId } })
    totalDeleted += result.count
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    errors.push(`userRole: ${msg}`)
  }

  // Log the deletion in audit log (before deleting audit logs for this tenant)
  try {
    await db.auditLog.create({
      data: {
        tenantId,
        action: 'DATA_DELETION',
        entityType: 'Tenant',
        entityId: tenantId,
        newValues: { recordsDeleted: totalDeleted },
      },
    })
  } catch {
    // Audit log creation may fail if data already deleted — ignore
  }

  // Delete audit logs and activity logs for this tenant
  try {
    const r1 = await db.auditLog.deleteMany({ where: { tenantId } })
    const r2 = await db.activityLog.deleteMany({ where: { tenantId } })
    totalDeleted += r1.count + r2.count
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    errors.push(`audit/activity logs: ${msg}`)
  }

  return {
    success: errors.length === 0,
    recordsDeleted: totalDeleted,
    errors,
  }
}

/**
 * Run the data deletion job — finds and processes all terminated tenants
 * past their data deletion date.
 */
export async function runDataDeletionJob(): Promise<DataDeletionResult> {
  const errors: string[] = []
  let tenantsProcessed = 0
  let totalRecordsDeleted = 0

  try {
    const tenants = await findTenantsForDeletion()

    for (const tenant of tenants) {
      console.log(`[DataDeletion] Processing tenant #${tenant.id} (${tenant.name}), deletion date: ${tenant.dataDeletionDate.toISOString()}`)

      const result = await deleteTenantBusinessData(tenant.id)

      if (result.success) {
        tenantsProcessed++
        totalRecordsDeleted += result.recordsDeleted
        console.log(`[DataDeletion] Tenant #${tenant.id}: deleted ${result.recordsDeleted} records`)
      } else {
        errors.push(`Tenant #${tenant.id}: ${result.errors.join(', ')}`)
        console.error(`[DataDeletion] Tenant #${tenant.id} failed:`, result.errors)
      }
    }

    if (tenants.length === 0) {
      console.log('[DataDeletion] No tenants pending data deletion')
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    errors.push(`Job error: ${msg}`)
    console.error('[DataDeletion] Job failed:', msg)
  }

  return {
    success: errors.length === 0,
    tenantsProcessed,
    totalRecordsDeleted,
    errors,
  }
}
