// ============================================================
// Madrasha ERP SaaS — Audit Log Helper
// ============================================================

import { db } from '@/lib/db'

interface AuditLogInput {
  tenantId: number
  userId?: number | null
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entityType: string
  entityId?: number | null
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  ipAddress?: string | null
}

/** Create an audit log entry (fire-and-forget, never blocks the response) */
export function createAuditLog(input: AuditLogInput) {
  db.auditLog
    .create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        oldValues: input.oldValues ? JSON.stringify(input.oldValues) : null,
        newValues: input.newValues ? JSON.stringify(input.newValues) : null,
        ipAddress: input.ipAddress ?? null,
      },
    })
    .catch(() => {
      // Audit log failure should never break the request
    })
}
