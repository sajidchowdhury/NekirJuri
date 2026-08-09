'use client';

// ============================================================
// Website Pages CMS — Page list + Add/Edit dialog with PageEditor
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
import PageList from '@/components/website/page-list';
import PageEditor, { type PageFormData } from '@/components/website/page-editor';
import {
  type WebsitePage,
} from '@/lib/website/sample-data';
import { fadeIn, transitions } from '@/lib/animations';
import { apiFetchList, apiSubmit, apiDelete } from '@/lib/api-client';

// ── API response shape ──────────────────────────────────
interface ApiPage {
  id: number;
  title: string;
  slug: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImageUrl?: string;
  isPublished: boolean;
  publishedAt?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

// ── Map API → component shape ───────────────────────────
function mapApiPage(p: ApiPage): WebsitePage {
  return {
    id: String(p.id),
    title: p.title,
    slug: p.slug,
    content: p.content || '',
    status: p.isPublished ? 'published' : 'draft',
    lastUpdated: p.updatedAt
      ? new Date(p.updatedAt).toISOString().split('T')[0]
      : new Date(p.createdAt).toISOString().split('T')[0],
    author: 'Admin',
    seoTitle: p.metaTitle,
    seoDescription: p.metaDescription,
    featuredImageUrl: p.featuredImageUrl,
  };
}

export default function WebsitePagesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPage, setEditingPage] = React.useState<WebsitePage | null>(null);

  // ── Fetch pages ──────────────────────────────────────
  const {
    data: pagesResponse,
    isLoading: pagesLoading,
    isError: pagesError,
    refetch: refetchPages,
  } = useQuery({
    queryKey: ['website-pages'],
    queryFn: () => apiFetchList<ApiPage>('/api/pages?limit=100'),
  });

  const pages: WebsitePage[] = (pagesResponse?.data || []).map(mapApiPage);

  // ── Create mutation ──────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: PageFormData) =>
      apiSubmit<ApiPage>('/api/pages', 'POST', {
        title: data.title,
        slug: data.slug,
        content: data.content,
        metaTitle: data.seoTitle || null,
        metaDescription: data.seoDescription || null,
        featuredImageUrl: data.featuredImageUrl || null,
        isPublished: data.isPublished,
      }),
    onSuccess: () => {
      toast.success('Page created successfully');
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
      setDialogOpen(false);
      setEditingPage(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create page');
    },
  });

  // ── Update mutation ──────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiSubmit<ApiPage>(`/api/pages/${id}`, 'PUT', data),
    onSuccess: () => {
      toast.success('Page updated successfully');
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
      setDialogOpen(false);
      setEditingPage(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update page');
    },
  });

  // ── Delete mutation ──────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/pages/${id}`),
    onSuccess: () => {
      toast.success('Page deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete page');
    },
  });

  // ── Toggle status mutation ───────────────────────────
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      apiSubmit<ApiPage>(`/api/pages/${id}`, 'PUT', { isPublished }),
    onSuccess: () => {
      toast.success('Page status updated');
      queryClient.invalidateQueries({ queryKey: ['website-pages'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update status');
    },
  });

  // ── Handlers ─────────────────────────────────────────
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
      updateMutation.mutate({
        id: editingPage.id,
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          metaTitle: data.seoTitle || null,
          metaDescription: data.seoDescription || null,
          featuredImageUrl: data.featuredImageUrl || null,
          isPublished: data.isPublished,
        },
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeletePage = (pageId: string) => {
    if (confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      deleteMutation.mutate(pageId);
    }
  };

  const handleToggleStatus = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;
    toggleStatusMutation.mutate({
      id: pageId,
      isPublished: page.status !== 'published',
    });
  };

  // ── Error state ──────────────────────────────────────
  if (pagesError) {
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
        />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load pages</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            There was an error fetching page data. Please try again.
          </p>
          <Button variant="outline" className="gap-2" onClick={() => refetchPages()}>
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
        title="Website Pages"
        description="Manage public website pages and content"

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
        isLoading={pagesLoading}
      />

      {/* Add/Edit Page Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingPage(null); } }}>
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
