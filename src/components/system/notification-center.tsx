'use client';

// ============================================================
// NotificationCenter — Full-page notification list
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Bell, Banknote, GraduationCap, Info, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type SystemNotification,
  type NotificationType,
  type NotificationStatus,
  sampleNotifications,
} from '@/lib/system/sample-data';
import { slideUp, staggerChildren, transitions } from '@/lib/animations';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  System: <Bell className="h-4 w-4" />,
  Finance: <Banknote className="h-4 w-4" />,
  Academic: <GraduationCap className="h-4 w-4" />,
  General: <Info className="h-4 w-4" />,
};

const typeColors: Record<NotificationType, string> = {
  System: 'text-sky-600 dark:text-sky-400',
  Finance: 'text-amber-600 dark:text-amber-400',
  Academic: 'text-emerald-600 dark:text-emerald-400',
  General: 'text-stone-600 dark:text-stone-400',
};

const typeBgColors: Record<NotificationType, string> = {
  System: 'bg-sky-50 dark:bg-sky-950/30',
  Finance: 'bg-amber-50 dark:bg-amber-950/30',
  Academic: 'bg-emerald-50 dark:bg-emerald-950/30',
  General: 'bg-stone-50 dark:bg-stone-800/30',
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = React.useState<SystemNotification[]>(sampleNotifications);
  const [typeFilter, setTypeFilter] = React.useState<'All' | NotificationType>('All');
  const [statusFilter, setStatusFilter] = React.useState<'All' | NotificationStatus>('All');

  const unreadCount = notifications.filter((n) => n.status === 'Unread').length;

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      if (typeFilter !== 'All' && n.type !== typeFilter) return false;
      if (statusFilter !== 'All' && n.status !== statusFilter) return false;
      return true;
    });
  }, [notifications, typeFilter, statusFilter]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'Read' as NotificationStatus } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: 'Read' as NotificationStatus }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={typeFilter}
            onValueChange={(val) => setTypeFilter(val as 'All' | NotificationType)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="System">System</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Academic">Academic</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as 'All' | NotificationStatus)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Unread">Unread</SelectItem>
              <SelectItem value="Read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          {unreadCount > 0 && (
            <>
              <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0">
                {unreadCount} unread
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="gap-1.5"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All as Read
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Notification list */}
      <motion.div
        initial={staggerChildren.initial}
        animate={staggerChildren.animate}
        className="space-y-2 max-h-[65vh] overflow-y-auto pr-1"
      >
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No notifications found
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const isUnread = notification.status === 'Unread';
            return (
              <motion.div
                key={notification.id}
                initial={slideUp.initial}
                animate={slideUp.animate}
                transition={transitions.normal}
                className={`relative flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                  isUnread ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                }`}
              >
                {/* Unread indicator */}
                {isUnread && (
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-emerald-500" />
                )}

                {/* Type icon */}
                <div className={`flex items-center justify-center h-9 w-9 rounded-lg shrink-0 ${typeBgColors[notification.type]}`}>
                  <span className={typeColors[notification.type]}>
                    {typeIcons[notification.type]}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 -ml-2"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
