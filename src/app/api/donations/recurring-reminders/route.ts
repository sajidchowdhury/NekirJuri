// ============================================================
// CR-5: Recurring Donation Reminders Cron Job
// Called daily (e.g., at 9:00 AM) to check upcoming recurring donations
// Finds donations where nextDueDate is within 7 days and reminderSent=false
// Creates notifications for tenant admins and resets reminderSent for past-due donations
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, getTenantId } from '@/lib/api-utils'

/**
 * Find the first admin user for a tenant to assign notifications to.
 * Falls back to the first user of that tenant if no admin found.
 */
async function findTenantAdminUserId(tenantId: number): Promise<number | null> {
  // Try to find a super admin first
  const superAdmin = await db.user.findFirst({
    where: { tenantId, isSuperAdmin: true },
    select: { id: true },
  })
  if (superAdmin) return superAdmin.id

  // Try to find a user with admin role
  const adminRole = await db.userRole.findFirst({
    where: { role: { name: 'admin' } },
    select: { userId: true },
  })
  if (adminRole) return adminRole.userId

  // Fallback: any user in the tenant
  const anyUser = await db.user.findFirst({
    where: { tenantId },
    select: { id: true },
  })
  return anyUser?.id ?? null
}

// This endpoint should be called by a cron scheduler or externally
// It processes ALL tenants' recurring donation reminders
export async function POST(request: NextRequest) {
  try {
    // Optional tenant filter (for per-tenant cron)
    const tid = getTenantId(request)
    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    // Find all recurring donations due within 7 days where reminder hasn't been sent
    const where: Record<string, unknown> = {
      isRecurring: true,
      reminderSent: false,
      nextDueDate: { gte: now, lte: sevenDaysFromNow },
      status: 'completed',
    }
    if (tid) where.tenantId = tid

    const upcomingDonations = await db.donation.findMany({
      where,
      include: {
        donor: { select: { id: true, name: true, phone: true, email: true, reminderConsent: true, reminderMethod: true } },
        donationCategory: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
    })

    let remindersSent = 0
    let notificationsCreated = 0
    const errors: string[] = []

    // Cache admin user IDs per tenant to avoid repeated lookups
    const adminCache = new Map<number, number | null>()

    for (const donation of upcomingDonations) {
      try {
        // Get admin userId for this donation's tenant (with caching)
        let adminUserId = adminCache.get(donation.tenantId)
        if (adminUserId === undefined) {
          adminUserId = await findTenantAdminUserId(donation.tenantId)
          adminCache.set(donation.tenantId, adminUserId)
        }

        // Create admin notification for this tenant (requires userId)
        if (adminUserId) {
          await db.notification.create({
            data: {
              tenantId: donation.tenantId,
              userId: adminUserId,
              type: 'reminder',
              title: 'Recurring Donation Due Soon',
              message: `Donor "${donation.donor?.name || 'Anonymous'}" has a recurring donation of ৳${Number(donation.recurringAmount || donation.amount).toLocaleString()} (${donation.recurringFrequency}) due on ${donation.nextDueDate?.toLocaleDateString()}. Category: ${donation.donationCategory.name}`,
              isRead: false,
            },
          })
          notificationsCreated++
        } else {
          errors.push(`No admin user found for tenant ${donation.tenantId}`)
        }

        // Mark reminder as sent on the donation
        await db.donation.update({
          where: { id: donation.id },
          data: { reminderSent: true },
        })
        remindersSent++

        // Note: Actual email/SMS sending would be handled by an external service
        // For now, we create the notification and log it
        if (donation.donor?.reminderConsent) {
          // Email/SMS would be sent here via an external API
          // e.g., await sendEmail(donation.donor.email, ...) or await sendSMS(donation.donor.phone, ...)
          console.log(`[RecurringReminder] Would send ${donation.donor.reminderMethod} to ${donation.donor.name} (${donation.donor.email || donation.donor.phone})`)
        }
      } catch (err) {
        console.error(`[RecurringReminder] Error processing donation ${donation.id}:`, err)
        errors.push(`Donation ${donation.id}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    // Also reset reminderSent for donations where nextDueDate has passed
    // (so they get reminded again in the next cycle after payment)
    const pastDueWhere: Record<string, unknown> = {
      isRecurring: true,
      reminderSent: true,
      nextDueDate: { lt: now },
      status: 'completed',
    }
    if (tid) pastDueWhere.tenantId = tid

    const pastDueReset = await db.donation.updateMany({
      where: pastDueWhere,
      data: { reminderSent: false, status: 'pending' },
    })

    return success({
      remindersSent,
      notificationsCreated,
      pastDueReset: pastDueReset.count,
      checkedAt: now.toISOString(),
      ...(errors.length > 0 && { errors }),
    }, `Processed ${upcomingDonations.length} upcoming recurring donations`)
  } catch (err) {
    console.error('[recurring-reminders][POST]', err)
    return error('Failed to process recurring donation reminders', 500)
  }
}
