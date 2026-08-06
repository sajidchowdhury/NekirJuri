// ============================================================
// CR-5: Recurring Donation Reminders Cron Job
// Called daily (e.g., at 9:00 AM) to check upcoming recurring donations
// Finds donations where nextDueDate is within 7 days and reminderSent=false
// Creates notifications and resets reminderSent for past-due donations
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, getTenantId } from '@/lib/api-utils'

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

    for (const donation of upcomingDonations) {
      // Create admin notification for this tenant
      await db.notification.create({
        data: {
          tenantId: donation.tenantId,
          type: 'reminder',
          title: 'Recurring Donation Due Soon',
          message: `Donor "${donation.donor?.name || 'Anonymous'}" has a recurring donation of ৳${Number(donation.recurringAmount || donation.amount).toLocaleString()} (${donation.recurringFrequency}) due on ${donation.nextDueDate?.toLocaleDateString()}. Category: ${donation.donationCategory.name}`,
          isRead: false,
        },
      })
      notificationsCreated++

      // Mark reminder as sent
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
    }, `Processed ${upcomingDonations.length} upcoming recurring donations`)
  } catch (err) {
    console.error('[recurring-reminders][POST]', err)
    return error('Failed to process recurring donation reminders', 500)
  }
}
