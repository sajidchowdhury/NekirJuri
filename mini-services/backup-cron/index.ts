// ============================================================
// Module 28: Backup Cron Service
// Runs daily at 2:00 AM (Asia/Dhaka) to:
//   1. Cleanup expired backups
//   2. Trigger scheduled backups for tenants with backup enabled
// ============================================================

import cron from 'node-cron';

const CRON_PORT = 3032;
const API_BASE = 'http://localhost:3000';
const startTime = Date.now();

// Schedule: Every day at 2:00 AM Asia/Dhaka (UTC+6 = 20:00 UTC previous day)
// Cron expression: "0 20 * * *" (8 PM UTC = 2 AM Dhaka)
const CRON_EXPRESSION = '0 20 * * *';

/** Call the cleanup endpoint to remove expired backups */
async function runCleanup(): Promise<void> {
  const now = new Date().toISOString();
  console.log(`[${now}] [BackupCron] Running expired backups cleanup...`);

  try {
    const res = await fetch(`${API_BASE}/api/backups/cleanup?XTransformPort=3000`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error(`[${now}] [BackupCron] Cleanup API returned ${res.status}: ${res.statusText}`);
      return;
    }

    const data = await res.json();
    console.log(`[${now}] [BackupCron] Cleanup result:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`[${now}] [BackupCron] Cleanup error:`, err instanceof Error ? err.message : err);
  }
}

/** Find tenants with scheduled backup enabled and trigger backups for each */
async function runScheduledBackups(): Promise<void> {
  const now = new Date().toISOString();
  console.log(`[${now}] [BackupCron] Checking for tenants with scheduled backup enabled...`);

  try {
    // Fetch tenants with backup schedule enabled
    const scheduleRes = await fetch(`${API_BASE}/api/backup-schedule?XTransformPort=3000`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!scheduleRes.ok) {
      console.error(`[${now}] [BackupCron] Backup schedule API returned ${scheduleRes.status}: ${scheduleRes.statusText}`);
      return;
    }

    const scheduleData = await scheduleRes.json();
    const tenants = Array.isArray(scheduleData) ? scheduleData : scheduleData.tenants ?? [];

    if (tenants.length === 0) {
      console.log(`[${now}] [BackupCron] No tenants with scheduled backup enabled.`);
      return;
    }

    console.log(`[${now}] [BackupCron] Found ${tenants.length} tenant(s) with scheduled backup enabled.`);

    // Trigger backup for each tenant with enabled schedule
    for (const tenant of tenants) {
      const tenantId = tenant.id ?? tenant.tenantId ?? tenant.tenant_id;
      const tenantNow = new Date().toISOString();
      console.log(`[${tenantNow}] [BackupCron] Triggering scheduled backup for tenant: ${tenantId}`);

      try {
        const backupRes = await fetch(`${API_BASE}/api/backups?XTransformPort=3000`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'scheduled',
            triggerSource: 'scheduled',
            tenantId,
          }),
        });

        if (!backupRes.ok) {
          console.error(`[${tenantNow}] [BackupCron] Backup trigger failed for tenant ${tenantId}: ${backupRes.status} ${backupRes.statusText}`);
        } else {
          const backupData = await backupRes.json();
          console.log(`[${tenantNow}] [BackupCron] Backup triggered for tenant ${tenantId}:`, JSON.stringify(backupData, null, 2));
        }
      } catch (backupErr) {
        console.error(`[${tenantNow}] [BackupCron] Backup trigger error for tenant ${tenantId}:`, backupErr instanceof Error ? backupErr.message : backupErr);
      }
    }
  } catch (err) {
    console.error(`[${now}] [BackupCron] Scheduled backups error:`, err instanceof Error ? err.message : err);
  }
}

/** Run the full backup cron job: cleanup + scheduled backups */
async function runBackupJob(): Promise<void> {
  const now = new Date().toISOString();
  console.log(`[${now}] [BackupCron] ========== Backup cron job started ==========`);

  // Step 1: Cleanup expired backups
  await runCleanup();

  // Step 2: Trigger scheduled backups for enabled tenants
  await runScheduledBackups();

  const endNow = new Date().toISOString();
  console.log(`[${endNow}] [BackupCron] ========== Backup cron job completed ==========`);
}

console.log(`[BackupCron] Starting cron service on port ${CRON_PORT}`);
console.log(`[BackupCron] Schedule: ${CRON_EXPRESSION} (Daily at 2:00 AM Asia/Dhaka)`);

// Schedule the cron job
cron.schedule(CRON_EXPRESSION, () => {
  runBackupJob();
}, {
  timezone: 'UTC', // We already adjusted the hour for UTC (20:00 UTC = 2:00 AM Dhaka)
});

// Simple HTTP health check server
const server = Bun.serve({
  port: CRON_PORT,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'backup-cron',
        port: CRON_PORT,
        uptime: Math.floor((Date.now() - startTime) / 1000),
        schedule: CRON_EXPRESSION,
        timezone: 'UTC (2:00 AM Asia/Dhaka)',
      });
    }

    if (url.pathname === '/trigger' && req.method === 'POST') {
      // Manual trigger endpoint — runs the backup job immediately
      runBackupJob();
      return Response.json({
        success: true,
        message: 'Backup cron job triggered manually',
        triggeredAt: new Date().toISOString(),
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`[BackupCron] Health check available at http://localhost:${CRON_PORT}/health`);
console.log(`[BackupCron] Manual trigger available at POST http://localhost:${CRON_PORT}/trigger`);
