'use client';

// ============================================================
// ActivityLogViewer — Activity log + Audit log with tabs
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type ActivityLog,
  type AuditLog,
  type ActionType,
  sampleActivityLogs,
  sampleAuditLogs,
  sampleUsers,
  getInitials,
  actionBadgeColors,
} from '@/lib/system/sample-data';
import { slideUp, staggerChildren, transitions } from '@/lib/animations';

export default function ActivityLogViewer() {
  // Activity log state
  const [actionFilter, setActionFilter] = React.useState<'All' | ActionType>('All');
  const [userFilter, setUserFilter] = React.useState<string>('All');
  const [dateFilter, setDateFilter] = React.useState<string>('All');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filtered activity logs
  const filteredActivityLogs = React.useMemo(() => {
    return sampleActivityLogs.filter((log) => {
      if (actionFilter !== 'All' && log.action !== actionFilter) return false;
      if (userFilter !== 'All' && log.userId !== userFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          log.description.toLowerCase().includes(q) ||
          log.entity.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [actionFilter, userFilter, searchQuery]);

  const filteredAuditLogs = sampleAuditLogs;

  return (
    <Tabs defaultValue="activity" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
        <TabsTrigger value="activity">Activity Log</TabsTrigger>
        <TabsTrigger value="audit">Audit Log</TabsTrigger>
      </TabsList>

      {/* Activity Log Tab */}
      <TabsContent value="activity" className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[200px]"
          />
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Users</SelectItem>
              {sampleUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name.split(' ').slice(-1)[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={(val) => setActionFilter(val as 'All' | ActionType)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Actions</SelectItem>
              <SelectItem value="Create">Create</SelectItem>
              <SelectItem value="Update">Update</SelectItem>
              <SelectItem value="Delete">Delete</SelectItem>
              <SelectItem value="Login">Login</SelectItem>
              <SelectItem value="Logout">Logout</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timeline */}
        <motion.div
          initial={staggerChildren.initial}
          animate={staggerChildren.animate}
          className="space-y-2 max-h-[60vh] overflow-y-auto pr-1"
        >
          {filteredActivityLogs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No activity logs found
            </div>
          ) : (
            filteredActivityLogs.map((log) => {
              const actionColor = actionBadgeColors[log.action];
              return (
                <motion.div
                  key={log.id}
                  initial={slideUp.initial}
                  animate={slideUp.animate}
                  transition={transitions.normal}
                  className="flex items-start gap-3 rounded-lg border bg-card p-3 hover:bg-muted/30 transition-colors"
                >
                  {/* User avatar */}
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
                      {getInitials(log.userName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{log.userName}</span>
                      <Badge
                        variant="outline"
                        className={`${actionColor.bg} ${actionColor.text} border-0 text-[10px] px-1.5`}
                      >
                        {log.action}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        {log.entity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{log.timestamp}</span>
                      <span className="font-mono">{log.ipAddress}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </TabsContent>

      {/* Audit Log Tab */}
      <TabsContent value="audit" className="space-y-4">
        <motion.div
          initial={staggerChildren.initial}
          animate={staggerChildren.animate}
          className="space-y-2 max-h-[65vh] overflow-y-auto pr-1"
        >
          {filteredAuditLogs.map((log: AuditLog) => (
            <motion.div
              key={log.id}
              initial={slideUp.initial}
              animate={slideUp.animate}
              transition={transitions.normal}
              className="flex items-start gap-3 rounded-lg border bg-card p-4 hover:bg-muted/30 transition-colors"
            >
              <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
                  {getInitials(log.userName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{log.userName}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5">
                    {log.entity}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {log.entityId}
                  </span>
                </div>

                {/* Field change */}
                <div className="rounded-md bg-muted/50 px-3 py-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-muted-foreground">Field:</span>
                    <span className="font-mono text-sm">{log.field}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-muted-foreground">Old:</span>
                    <span className="text-rose-600 dark:text-rose-400 line-through font-mono">{log.oldValue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-muted-foreground">New:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">{log.newValue}</span>
                  </div>
                </div>

                <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}
