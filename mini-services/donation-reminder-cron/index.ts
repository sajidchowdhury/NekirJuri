// ============================================================
// CR-5: Recurring Donation Reminders Cron Service
// Runs daily at 9:00 AM (Asia/Dhaka) to trigger the reminder API
// Also checks on startup for any missed reminders
// ============================================================

import cron from 'node-cron';

const CRON_PORT = 3031;
const REMINDER_API_URL = 'http://localhost:3000/api/donations/recurring-reminders';

/** Call the recurring reminders API endpoint */
async function runReminders(): Promise<void> {
  const now = new Date().toISOString();
  console.log(`[${now}] [RecurringReminder] Running daily check...`);

  try {
    const res = await fetch(REMINDER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error(`[${now}] [RecurringReminder] API returned ${res.status}: ${res.statusText}`);
      return;
    }

    const data = await res.json();
    console.log(`[${now}] [RecurringReminder] Result:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`[${now}] [RecurringReminder] Error:`, err instanceof Error ? err.message : err);
  }
}

// Schedule: Every day at 9:00 AM Asia/Dhaka (UTC+6 = 3:00 AM UTC)
// Cron expression: "0 3 * * *" (3 AM UTC = 9 AM Dhaka)
const CRON_EXPRESSION = '0 3 * * *';

console.log(`[RecurringReminder] Starting cron service on port ${CRON_PORT}`);
console.log(`[RecurringReminder] Schedule: ${CRON_EXPRESSION} (Daily at 9:00 AM Asia/Dhaka)`);

// Schedule the cron job
cron.schedule(CRON_EXPRESSION, () => {
  runReminders();
}, {
  timezone: 'UTC', // We already adjusted the hour for UTC
});

// Run once on startup for any missed reminders
console.log('[RecurringReminder] Running initial check on startup...');
runReminders();

// Simple HTTP health check server
const server = Bun.serve({
  port: CRON_PORT,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'donation-reminder-cron',
        schedule: CRON_EXPRESSION,
        timezone: 'UTC (9:00 AM Asia/Dhaka)',
        lastCheck: new Date().toISOString(),
      });
    }

    if (url.pathname === '/trigger' && req.method === 'POST') {
      // Manual trigger endpoint
      runReminders();
      return Response.json({
        success: true,
        message: 'Reminder check triggered manually',
        triggeredAt: new Date().toISOString(),
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`[RecurringReminder] Health check available;available at http://localhost:${CRON_PORT}/health`);
console.log(`[RecurringReminder] Manual trigger;available at POST http://localhost:${CRON_PORT}/trigger`);
