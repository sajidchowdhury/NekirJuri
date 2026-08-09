'use client';

// ============================================================
// NoticeBoard — Card list of notices (NOT a data table)
// Priority badges, audience badges, pin indicator, filter, search
// ============================================================

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pin,
  Paperclip,
  Search,
  AlertTriangle,
  Info,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from '@/components/atoms/empty-state';
import {
  type Notice,
  type NoticePriority,
  type NoticeAudience,
  formatDateLong,
} from '@/lib/website/sample-data';
import { fadeIn, staggerChildren, transitions } from '@/lib/animations';

interface NoticeBoardProps {
  notices: Notice[];
  onEdit: (notice: Notice) => void;
  onDelete: (noticeId: string) => void;
  isLoading?: boolean;
}

function PriorityBadge({ priority }: { priority: NoticePriority }) {
  switch (priority) {
    case 'urgent':
      return (
        <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-0 animate-pulse">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Urgent
        </Badge>
      );
    case 'important':
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
          <AlertCircle className="h-3 w-3 mr-1" />
          Important
        </Badge>
      );
    default:
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
          <Info className="h-3 w-3 mr-1" />
          Normal
        </Badge>
      );
  }
}

function AudienceBadge({ audience }: { audience: NoticeAudience }) {
  const map: Record<NoticeAudience, { classes: string; label: string }> = {
    public: { classes: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', label: 'Public' },
    staff: { classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Staff' },
    students: { classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Students' },
    parents: { classes: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', label: 'Parents' },
  };
  const { classes, label } = map[audience];
  return (
    <Badge className={`${classes} border-0`}>
      {label}
    </Badge>
  );
}

export default function NoticeBoard({ notices, onEdit, onDelete, isLoading = false }: NoticeBoardProps) {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  const filteredNotices = React.useMemo(() => {
    let result = [...notices];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filter === 'urgent') {
      result = result.filter((n) => n.priority === 'urgent');
    } else if (filter === 'pinned') {
      result = result.filter((n) => n.isPinned);
    }

    // Sort: pinned first, then by date desc
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return result;
  }, [notices, search, filter]);

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted animate-pulse rounded" />
                  <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNotices.length === 0 ? (
        <EmptyState
          title="No notices posted yet"
          description="Post a notice to keep everyone informed about important updates and announcements."
        />
      ) : (
        <motion.div
          initial={staggerChildren.initial}
          animate={staggerChildren.animate}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotices.map((notice) => (
              <motion.div
                key={notice.id}
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={transitions.normal}
              >
                <Card
                  className="group hover:shadow-md transition-shadow cursor-pointer border-border/60"
                  onClick={() => onEdit(notice)}
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Top row: priority + audience + pin */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <PriorityBadge priority={notice.priority} />
                      <AudienceBadge audience={notice.audience} />
                      {notice.isPinned && (
                        <span className="ml-auto text-base" title="Pinned">
                          📌
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-foreground leading-snug">
                      {notice.title}
                    </h3>

                    {/* Date */}
                    <p className="text-xs text-muted-foreground">
                      {formatDateLong(notice.date)}
                    </p>

                    {/* Content preview */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notice.content.length > 100
                        ? notice.content.slice(0, 100) + '...'
                        : notice.content}
                    </p>

                    {/* Attachment indicator */}
                    {notice.hasAttachment && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        <span>{notice.attachmentName || 'Attachment'}</span>
                      </div>
                    )}

                    {/* Delete (hidden until hover) */}
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-xs text-rose-500 hover:text-rose-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(notice.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
