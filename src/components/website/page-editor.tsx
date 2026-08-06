'use client';

// ============================================================
// PageEditor — Rich page editor form with react-hook-form + zod
// Title (auto-slug), slug, content, SEO fields, status toggle
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Image as ImageIcon } from 'lucide-react';
import {
  type WebsitePage,
  type PageStatus,
} from '@/lib/website/sample-data';

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isPublished: z.boolean(),
  featuredImageUrl: z.string().optional(),
});

type PageFormData = z.infer<typeof pageSchema>;

interface PageEditorProps {
  page?: WebsitePage | null;
  onSave: (data: PageFormData) => void;
  onCancel: () => void;
}

function titleToSlug(title: string): string {
  return (
    '/' +
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  );
}

export default function PageEditor({ page, onSave, onCancel }: PageEditorProps) {
  const isEditing = !!page;

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: page?.title ?? '',
      slug: page?.slug ?? '',
      content: page?.content ?? '',
      seoTitle: page?.seoTitle ?? '',
      seoDescription: page?.seoDescription ?? '',
      isPublished: page?.status === 'published',
      featuredImageUrl: page?.featuredImageUrl ?? '',
    },
  });

  const watchedTitle = form.watch('title');

  // Auto-generate slug from title (only when creating, not editing)
  React.useEffect(() => {
    if (!isEditing) {
      form.setValue('slug', titleToSlug(watchedTitle));
    }
  }, [watchedTitle, isEditing, form]);

  const handleSubmit = (data: PageFormData) => {
    onSave(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter page title"
          {...form.register('title')}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-rose-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          placeholder="/page-slug"
          className="font-mono"
          {...form.register('slug')}
        />
        {form.formState.errors.slug && (
          <p className="text-xs text-rose-500">{form.formState.errors.slug.message}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="Write your page content here..."
          className="min-h-[200px]"
          {...form.register('content')}
        />
        <p className="text-xs text-muted-foreground">Supports Markdown formatting</p>
        {form.formState.errors.content && (
          <p className="text-xs text-rose-500">{form.formState.errors.content.message}</p>
        )}
      </div>

      <Separator />

      {/* SEO Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">SEO Settings</h3>

        <div className="space-y-2">
          <Label htmlFor="seoTitle">Meta Title</Label>
          <Input
            id="seoTitle"
            placeholder="SEO meta title (optional)"
            {...form.register('seoTitle')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seoDescription">Meta Description</Label>
          <Textarea
            id="seoDescription"
            placeholder="SEO meta description (optional)"
            className="min-h-[80px]"
            {...form.register('seoDescription')}
          />
        </div>
      </div>

      <Separator />

      {/* Status Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Status</Label>
          <p className="text-xs text-muted-foreground">
            {form.watch('isPublished') ? 'Page will be visible to public' : 'Page will be saved as draft'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Draft</span>
          <Switch
            checked={form.watch('isPublished')}
            onCheckedChange={(checked) => form.setValue('isPublished', checked)}
          />
          <span className="text-xs text-muted-foreground">Published</span>
        </div>
      </div>

      {/* Featured Image */}
      <div className="space-y-2">
        <Label htmlFor="featuredImageUrl">Featured Image URL</Label>
        <div className="flex gap-2">
          <Input
            id="featuredImageUrl"
            placeholder="https://example.com/image.jpg (optional)"
            className="flex-1"
            {...form.register('featuredImageUrl')}
          />
        </div>
        {form.watch('featuredImageUrl') && (
          <div className="mt-2 rounded-lg border border-border overflow-hidden w-40 h-24 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-stone-300 dark:from-emerald-600 dark:to-stone-700 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-white/70" />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isEditing ? 'Update Page' : 'Save Page'}
        </Button>
      </div>
    </form>
  );
}

export type { PageFormData, PageStatus };
