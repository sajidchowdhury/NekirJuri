'use client';

// ============================================================
// Notice Board Page — Card grid + Add/Edit notice dialog
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import PageHeader from '@/components/atoms/page-header';
import NoticeBoard from '@/components/website/notice-board';
import NoticeForm, { type NoticeFormData } from '@/components/website/notice-form';
import {
  type Notice,
  type NoticePriority,
  type NoticeAudience,
} from '@/lib/website/sample-data';
import { fadeIn, transitions } from '@/lib/animations';
import { apiFetchList, apiSubmit } from '@/lib/api-client';

// ── API response shape ──────────────────────────────────
interface ApiNotice {
  id: number;
  title: string;
  content?: string;
  noticeType: string;
  isPublished: boolean;
  publishedAt?: string;
  targetAudience?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
}

// ── Map API → component shape ───────────────────────────
function mapApiNotice(n: ApiNotice): Notice {
  // Extract filename from URL if present
  let attachmentName: string | undefined;
  if (n.attachmentUrl) {
    const parts = n.attachmentUrl.split('/');
    attachmentName = parts[parts.length - 1] || n.attachmentUrl;
  }

  return {
    id: String(n.id),
    title: n.title,
    content: n.content || '',
    date: new Date(n.createdAt).toISOString().split('T')[0],
    priority: (n.noticeType === 'urgent' || n.noticeType === 'important' || n.noticeType === 'normal')
      ? (n.noticeType as NoticePriority)
      : 'normal',
    audience: (n.targetAudience === 'public' || n.targetAudience === 'staff' || n.targetAudience === 'students' || n.targetAudience === 'parents')
      ? (n.targetAudience as NoticeAudience)
      : 'public',
    isPinned: false,
    hasAttachment: !!n.attachmentUrl,
    attachmentName,
  };
}

export default function NoticesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingNotice, setEditingNotice] = React.useState<Notice | null>(null);

  // ── Fetch notices ────────────────────────────────────
  const {
    data: noticesResponse,
    isLoading: noticesLoading,
    isError: noticesError,
    refetch: refetchNotices,
  } = useQuery({
    queryKey: ['notices'],
    queryFn: () => apiFetchList<ApiNotice>('/api/notices?limit=100'),
  });

  const notices: Notice[] = (noticesResponse?.data || []).map(mapApiNotice);

  // ── Create mutation ──────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: NoticeFormData) =>
      apiSubmit<ApiNotice>('/api/notices', 'POST', {
        title: data.title,
        content: data.content,
        noticeType: data.priority,
        targetAudience: data.audience,
        attachmentUrl: data.attachmentName || null,
        isPublished: true,
      }),
    onSuccess: () => {
      toast.success('Notice posted successfully');
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setDialogOpen(false);
      setEditingNotice(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to post notice');
    },
  });

  // ── Handlers ─────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingNotice(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setDialogOpen(true);
  };

  const handleSaveNotice = (data: NoticeFormData) => {
    if (editingNotice) {
      // No PUT /api/notices/:id route — update locally and show info
      toast.info('Notice editing is not yet supported by the API');
      setDialogOpen(false);
      setEditingNotice(null);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteNotice = (_noticeId: string) => {
    // No DELETE /api/notices/:id route — show info
    toast.info('Notice deletion is not yet supported by the API');
  };

  // ── Error state ──────────────────────────────────────
  if (noticesError) {
    return (
      <motion.div
        initial={fadeIn.initial}
        animate={fadeIn.animate}
        transition={transitions.normal}
        className="space-y-6"
      >
        <PageHeader
          title="Notice Board"
          description="Publish and manage notices and announcements"
        />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load notices</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            There was an error fetching notice data. Please try again.
          </p>
          <Button variant="outline" className="gap-2" onClick={() => refetchNotices()}>
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
        title="Notice Board"
        description="Publish and manage notices and announcements"

        actions={
          <Button
            onClick={handleOpenCreate}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Post Notice
          </Button>
        }
      />

      <NoticeBoard
        notices={notices}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteNotice}
        isLoading={noticesLoading}
      />

      {/* Add/Edit Notice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingNotice(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNotice ? 'Edit Notice' : 'Post Notice'}</DialogTitle>
            <DialogDescription>
              {editingNotice
                ? `Editing "${editingNotice.title}"`
                : 'Create a new notice or announcement'}
            </DialogDescription>
          </DialogHeader>
          <NoticeForm
            notice={editingNotice}
            onSave={handleSaveNotice}
            onCancel={() => {
              setDialogOpen(false);
              setEditingNotice(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
