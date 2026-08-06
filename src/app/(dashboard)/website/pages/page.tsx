'use client';

// ============================================================
// Website Pages CMS — Page list + Add/Edit dialog with PageEditor
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
import PageList from '@/components/website/page-list';
import PageEditor, { type PageFormData } from '@/components/website/page-editor';
import {
  samplePages,
  type WebsitePage,
} from '@/lib/website/sample-data';
import { fadeIn, transitions } from '@/lib/animations';

export default function WebsitePagesPage() {
  const [pages, setPages] = React.useState<WebsitePage[]>(samplePages);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPage, setEditingPage] = React.useState<WebsitePage | null>(null);

  const handleOpenCreate = () => {
    setEditingPage(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (page: WebsitePage) => {
    setEditingPage(page);
    setDialogOpen(true);
  };

  const handleSavePage = (data: PageFormData) => {
    if (editingPage) {
      // Update existing page
      setPages((prev) =>
        prev.map((p) =>
          p.id === editingPage.id
            ? {
                ...p,
                title: data.title,
                slug: data.slug,
                content: data.content,
                status: data.isPublished ? 'published' : 'draft',
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
                featuredImageUrl: data.featuredImageUrl,
                lastUpdated: new Date().toISOString().split('T')[0],
              }
            : p
        )
      );
    } else {
      // Create new page
      const newPage: WebsitePage = {
        id: `page-${Date.now()}`,
        title: data.title,
        slug: data.slug,
        content: data.content,
        status: data.isPublished ? 'published' : 'draft',
        lastUpdated: new Date().toISOString().split('T')[0],
        author: 'Admin',
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        featuredImageUrl: data.featuredImageUrl,
      };
      setPages((prev) => [...prev, newPage]);
    }
    setDialogOpen(false);
    setEditingPage(null);
  };

  const handleDeletePage = (pageId: string) => {
    setPages((prev) => prev.filter((p) => p.id !== pageId));
  };

  const handleToggleStatus = (pageId: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? { ...p, status: p.status === 'published' ? 'draft' : 'published', lastUpdated: new Date().toISOString().split('T')[0] }
          : p
      )
    );
  };

  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Website Pages"
        description="Manage public website pages and content"
        showBismillah
        actions={
          <Button
            onClick={handleOpenCreate}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Page
          </Button>
        }
      />

      <PageList
        pages={pages}
        onEdit={handleOpenEdit}
        onDelete={handleDeletePage}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add/Edit Page Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit Page' : 'New Page'}</DialogTitle>
            <DialogDescription>
              {editingPage
                ? `Editing "${editingPage.title}"`
                : 'Create a new website page'}
            </DialogDescription>
          </DialogHeader>
          <PageEditor
            page={editingPage}
            onSave={handleSavePage}
            onCancel={() => {
              setDialogOpen(false);
              setEditingPage(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
