'use client';

// ============================================================
// PageList — DataTable of website pages with status, actions
// Mobile card view, filter tabs (All / Published / Draft)
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  type ColumnDef,
} from '@tanstack/react-table';
import {
  FileText,
  Globe,
  Eye,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/organisms/data-table';
import {
  type WebsitePage,
  type PageStatus,
  formatDate,
} from '@/lib/website/sample-data';
import { fadeIn, staggerChildren, transitions } from '@/lib/animations';

interface PageListProps {
  pages: WebsitePage[];
  onEdit: (page: WebsitePage) => void;
  onDelete: (pageId: string) => void;
  onToggleStatus: (pageId: string) => void;
  isLoading?: boolean;
}

function StatusBadge({ status }: { status: PageStatus }) {
  if (status === 'published') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-0">
        Published
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 border-0">
      Draft
    </Badge>
  );
}

export default function PageList({ pages, onEdit, onDelete, onToggleStatus, isLoading = false }: PageListProps) {
  const [filter, setFilter] = React.useState('all');

  const filteredPages = React.useMemo(() => {
    if (filter === 'all') return pages;
    if (filter === 'published') return pages.filter((p) => p.status === 'published');
    return pages.filter((p) => p.status === 'draft');
  }, [pages, filter]);

  const columns: ColumnDef<WebsitePage, unknown>[] = React.useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{row.original.title}</span>
          </div>
        ),
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            {row.original.slug}
          </code>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'lastUpdated',
        header: 'Last Updated',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.lastUpdated)}
          </span>
        ),
      },
      {
        accessorKey: 'author',
        header: 'Author',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.author}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Actions</span>
                <span className="text-lg leading-none">⋯</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(row.original.id)}>
                {row.original.status === 'published' ? (
                  <>
                    <ToggleLeft className="h-4 w-4 mr-2" />
                    Set as Draft
                  </>
                ) : (
                  <>
                    <ToggleRight className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(row.original.id)}
                className="text-rose-600 focus:text-rose-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit, onDelete, onToggleStatus]
  );

  const renderCard = (page: WebsitePage) => (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{page.title}</span>
        </div>
        <StatusBadge status={page.status} />
      </div>
      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
        {page.slug}
      </code>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>By {page.author}</span>
        <span>{formatDate(page.lastUpdated)}</span>
      </div>
      <div className="flex items-center gap-1 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onEdit(page)}
        >
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onToggleStatus(page.id)}
        >
          <Globe className="h-3 w-3 mr-1" />
          {page.status === 'published' ? 'Draft' : 'Publish'}
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
    >
      <Tabs value={filter} onValueChange={setFilter} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>

        {['all', 'published', 'draft'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <motion.div
              initial={staggerChildren.initial}
              animate={staggerChildren.animate}
            >
              <DataTable
                columns={columns}
                data={filteredPages}
                searchable
                searchPlaceholder="Search pages..."
                renderCard={renderCard}
                isLoading={isLoading}
                emptyMessage="No pages found"
                emptyDescription="Create your first website page to get started."
              />
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}
