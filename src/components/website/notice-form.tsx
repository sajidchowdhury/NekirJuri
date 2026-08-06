'use client';

// ============================================================
// NoticeForm — Create/edit notice form with react-hook-form + zod
// Title, content, date, priority, audience, pinned, attachment
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Notice, type NoticePriority, type NoticeAudience } from '@/lib/website/sample-data';

const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  date: z.string().min(1, 'Date is required'),
  priority: z.enum(['normal', 'important', 'urgent'] as const),
  audience: z.enum(['public', 'staff', 'students', 'parents'] as const),
  isPinned: z.boolean(),
  attachmentName: z.string().optional(),
});

export type NoticeFormData = z.infer<typeof noticeSchema>;

interface NoticeFormProps {
  notice?: Notice | null;
  onSave: (data: NoticeFormData) => void;
  onCancel: () => void;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export default function NoticeForm({ notice, onSave, onCancel }: NoticeFormProps) {
  const isEditing = !!notice;

  const form = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: notice?.title ?? '',
      content: notice?.content ?? '',
      date: notice?.date ?? todayStr(),
      priority: (notice?.priority as NoticePriority) ?? 'normal',
      audience: (notice?.audience as NoticeAudience) ?? 'public',
      isPinned: notice?.isPinned ?? false,
      attachmentName: notice?.attachmentName ?? '',
    },
  });

  const handleSubmit = (data: NoticeFormData) => {
    onSave(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="notice-title">Title</Label>
        <Input
          id="notice-title"
          placeholder="Enter notice title"
          {...form.register('title')}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-rose-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="notice-content">Content</Label>
        <Textarea
          id="notice-content"
          placeholder="Write notice content here..."
          className="min-h-[160px]"
          {...form.register('content')}
        />
        <p className="text-xs text-muted-foreground">Supports Markdown formatting</p>
        {form.formState.errors.content && (
          <p className="text-xs text-rose-500">{form.formState.errors.content.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="notice-date">Date</Label>
        <Input
          id="notice-date"
          type="date"
          {...form.register('date')}
        />
        {form.formState.errors.date && (
          <p className="text-xs text-rose-500">{form.formState.errors.date.message}</p>
        )}
      </div>

      {/* Priority + Audience row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={form.watch('priority')}
            onValueChange={(val) => form.setValue('priority', val as NoticePriority)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="important">Important</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Audience</Label>
          <Select
            value={form.watch('audience')}
            onValueChange={(val) => form.setValue('audience', val as NoticeAudience)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="students">Students</SelectItem>
              <SelectItem value="parents">Parents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Pinned toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Pin Notice</Label>
          <p className="text-xs text-muted-foreground">
            Pinned notices appear at the top of the board
          </p>
        </div>
        <Switch
          checked={form.watch('isPinned')}
          onCheckedChange={(checked) => form.setValue('isPinned', checked)}
        />
      </div>

      {/* Attachment */}
      <div className="space-y-2">
        <Label htmlFor="attachment-name">Attachment Name</Label>
        <Input
          id="attachment-name"
          placeholder="e.g. schedule.pdf (optional)"
          {...form.register('attachmentName')}
        />
        <p className="text-xs text-muted-foreground">Simulated file attachment</p>
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
          {isEditing ? 'Update Notice' : 'Post Notice'}
        </Button>
      </div>
    </form>
  );
}
