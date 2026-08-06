'use client';

// ============================================================
// Notice Board Page — Card grid + Add/Edit notice dialog
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
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
  sampleNotices,
  type Notice,
  type NoticePriority,
  type NoticeAudience,
} from '@/lib/website/sample-data';
import { fadeIn, transitions } from '@/lib/animations';

export default function NoticesPage() {
  const [notices, setNotices] = React.useState<Notice[]>(sampleNotices);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingNotice, setEditingNotice] = React.useState<Notice | null>(null);

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
      // Update existing notice
      setNotices((prev) =>
        prev.map((n) =>
          n.id === editingNotice.id
            ? {
                ...n,
                title: data.title,
                content: data.content,
                date: data.date,
                priority: data.priority as NoticePriority,
                audience: data.audience as NoticeAudience,
                isPinned: data.isPinned,
                hasAttachment: !!data.attachmentName,
                attachmentName: data.attachmentName || undefined,
              }
            : n
        )
      );
    } else {
      // Create new notice
      const newNotice: Notice = {
        id: `notice-${Date.now()}`,
        title: data.title,
        content: data.content,
        date: data.date,
        priority: data.priority as NoticePriority,
        audience: data.audience as NoticeAudience,
        isPinned: data.isPinned,
        hasAttachment: !!data.attachmentName,
        attachmentName: data.attachmentName || undefined,
      };
      setNotices((prev) => [...prev, newNotice]);
    }
    setDialogOpen(false);
    setEditingNotice(null);
  };

  const handleDeleteNotice = (noticeId: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
  };

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
      />

      {/* Add/Edit Notice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
