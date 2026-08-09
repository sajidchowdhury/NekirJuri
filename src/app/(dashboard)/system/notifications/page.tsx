'use client';

// ============================================================
// Notification Center Page — Fully wired to API
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/atoms/page-header';
import NotificationCenter from '@/components/system/notification-center';
import {
  type SystemNotification,
} from '@/lib/system/sample-data';
import { fadeIn, slideUp, transitions } from '@/lib/animations';

// ── Types ────────────────────────────────────────────────

interface ApiNotification {
  id: number;
  userId?: number;
  title: string;
  message?: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ── Mapper ───────────────────────────────────────────────

function mapApiNotification(apiNotif: ApiNotification): SystemNotification {
  return {
    id: String(apiNotif.id),
    type: (apiNotif.type || 'General') as SystemNotification['type'],
    status: apiNotif.isRead ? 'Read' : 'Unread',
    title: apiNotif.title,
    message: apiNotif.message || '',
    timestamp: new Date(apiNotif.createdAt).toLocaleString(),
  };
}

// ── Page ─────────────────────────────────────────────────

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  // ── Fetch notifications ──────────────────────────────
  const {
    data: notifResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?limit=100');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
  });
  const notifications: SystemNotification[] = (notifResponse?.data || []).map(mapApiNotification);

  // ── Mark as read mutation ────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id) }),
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to mark as read');
    },
  });

  // ── Mark all as read mutation ────────────────────────
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (!res.ok) throw new Error('Failed to mark all as read');
      return res.json();
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to mark all as read');
    },
  });

  // Error state
  if (isError) {
    return (
      <motion.div initial={fadeIn.initial} animate={fadeIn.animate} transition={transitions.normal} className="space-y-6">
        <PageHeader title="Notification Center" description="View and manage system notifications" />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load notifications</h3>
          <p className="text-sm text-muted-foreground max-w-md">There was an error fetching notifications. Please try again.</p>
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
        title="Notification Center"
        description="View and manage system notifications"

      />

      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
      >
        <NotificationCenter
          notifications={notifications}
          isLoading={isLoading}
          onMarkAsRead={(id) => markReadMutation.mutate(id)}
          onMarkAllAsRead={() => markAllReadMutation.mutate()}
        />
      </motion.div>
    </motion.div>
  );
}
