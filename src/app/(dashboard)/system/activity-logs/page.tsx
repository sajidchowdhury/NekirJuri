'use client';

// ============================================================
// Activity & Audit Log Page — Fully wired to API
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import ActivityLogViewer from '@/components/system/activity-log-viewer';
import {
  type ActivityLog,
  type AuditLog,
  type SystemUser,
} from '@/lib/system/sample-data';
import { fadeIn, slideUp, transitions } from '@/lib/animations';

// ── API response types ───────────────────────────────────

interface ApiActivityLog {
  id: number;
  userId?: number;
  action: string;
  entityType: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

interface ApiAuditLog {
  id: number;
  userId?: number;
  entityType: string;
  entityId?: string;
  field: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
}

interface ApiUser {
  id: number;
  name: string;
  email: string;
}

// ── Mappers ──────────────────────────────────────────────

function mapApiActivityLog(log: ApiActivityLog): ActivityLog {
  return {
    id: String(log.id),
    userId: String(log.userId || ''),
    userName: '', // Will be populated from users lookup
    action: log.action as ActivityLog['action'],
    entity: log.entityType,
    description: log.description,
    ipAddress: log.ipAddress || '',
    timestamp: new Date(log.createdAt).toLocaleString(),
  };
}

function mapApiAuditLog(log: ApiAuditLog): AuditLog {
  return {
    id: String(log.id),
    userId: String(log.userId || ''),
    userName: '', // Will be populated from users lookup
    entity: log.entityType,
    entityId: String(log.entityId || ''),
    field: log.field,
    oldValue: log.oldValue,
    newValue: log.newValue,
    timestamp: new Date(log.createdAt).toLocaleString(),
  };
}

function mapApiUserToSystemUser(apiUser: ApiUser): SystemUser {
  return {
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    phone: '',
    role: 'Staff',
    status: 'Active',
    lastLogin: '',
    createdAt: '',
    modules: [],
  };
}

// ── Page ─────────────────────────────────────────────────

export default function ActivityLogsPage() {
  // ── Fetch activity logs ──────────────────────────────
  const {
    data: activityLogsResponse,
    isLoading: activityLoading,
    isError: activityError,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const res = await fetch('/api/activity-logs?limit=200');
      if (!res.ok) throw new Error('Failed to fetch activity logs');
      return res.json();
    },
  });

  // ── Fetch audit logs ─────────────────────────────────
  const {
    data: auditLogsResponse,
    isLoading: auditLoading,
    isError: auditError,
    refetch: refetchAudit,
  } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await fetch('/api/audit-logs?limit=200');
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return res.json();
    },
  });

  // ── Fetch users for name resolution ──────────────────
  const { data: usersResponse } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await fetch('/api/users?limit=100');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
  const apiUsers: ApiUser[] = usersResponse?.data || [];
  const users: SystemUser[] = apiUsers.map(mapApiUserToSystemUser);

  // Build a userId -> name map for resolving
  const userNameMap = new Map<string, string>();
  apiUsers.forEach((u: ApiUser) => {
    userNameMap.set(String(u.id), u.name);
  });

  // Map and resolve user names
  const activityLogs: ActivityLog[] = (activityLogsResponse?.data || []).map(
    (log: ApiActivityLog) => {
      const mapped = mapApiActivityLog(log);
      if (!mapped.userName && log.userId) {
        mapped.userName = userNameMap.get(String(log.userId)) || `User ${log.userId}`;
      }
      return mapped;
    }
  );

  const auditLogs: AuditLog[] = (auditLogsResponse?.data || []).map(
    (log: ApiAuditLog) => {
      const mapped = mapApiAuditLog(log);
      if (!mapped.userName && log.userId) {
        mapped.userName = userNameMap.get(String(log.userId)) || `User ${log.userId}`;
      }
      return mapped;
    }
  );

  const isLoading = activityLoading || auditLoading;
  const isError = activityError || auditError;
  const refetch = () => { refetchActivity(); refetchAudit(); };

  // Error state
  if (isError) {
    return (
      <motion.div initial={fadeIn.initial} animate={fadeIn.animate} transition={transitions.normal} className="space-y-6">
        <PageHeader title="Activity & Audit Logs" description="View system activity logs and audit trail" />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load logs</h3>
          <p className="text-sm text-muted-foreground max-w-md">There was an error fetching log data. Please try again.</p>
          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Activity & Audit Logs"
        description="View system activity logs and audit trail"

        actions={
          <ExportButton
            onExportCSV={() => {}}
            onExportPDF={() => {}}
          />
        }
      />

      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
      >
        <ActivityLogViewer
          activityLogs={activityLogs}
          auditLogs={auditLogs}
          users={users}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}
