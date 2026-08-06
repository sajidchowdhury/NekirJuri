'use client';

// ============================================================
// AlbumForm — Create/edit album form with react-hook-form + zod
// Album name, description, cover gradient placeholder
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Image as ImageIcon } from 'lucide-react';
import { type GalleryAlbum, type GradientColor } from '@/lib/website/sample-data';

const albumSchema = z.object({
  title: z.string().min(1, 'Album name is required'),
  description: z.string().optional(),
  coverGradient: z.enum(['emerald', 'amber', 'sky', 'rose', 'violet'] as const),
});

export type AlbumFormData = z.infer<typeof albumSchema>;

interface AlbumFormProps {
  album?: GalleryAlbum | null;
  onSave: (data: AlbumFormData) => void;
  onCancel: () => void;
}

const gradientOptions: { value: GradientColor; label: string; preview: string }[] = [
  { value: 'emerald', label: 'Emerald', preview: 'from-emerald-400 to-stone-300' },
  { value: 'amber', label: 'Amber', preview: 'from-amber-400 to-stone-300' },
  { value: 'sky', label: 'Sky', preview: 'from-sky-400 to-stone-300' },
  { value: 'rose', label: 'Rose', preview: 'from-rose-400 to-stone-300' },
  { value: 'violet', label: 'Violet', preview: 'from-violet-400 to-stone-300' },
];

export default function AlbumForm({ album, onSave, onCancel }: AlbumFormProps) {
  const isEditing = !!album;

  const form = useForm<AlbumFormData>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: album?.title ?? '',
      description: album?.description ?? '',
      coverGradient: (album?.coverGradient as GradientColor) ?? 'emerald',
    },
  });

  const handleSubmit = (data: AlbumFormData) => {
    onSave(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      {/* Album Name */}
      <div className="space-y-2">
        <Label htmlFor="album-title">Album Name</Label>
        <Input
          id="album-title"
          placeholder="Enter album name"
          {...form.register('title')}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-rose-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="album-description">Description</Label>
        <Textarea
          id="album-description"
          placeholder="Describe this album (optional)"
          className="min-h-[80px]"
          {...form.register('description')}
        />
      </div>

      {/* Cover Color Selection */}
      <div className="space-y-2">
        <Label>Cover Color</Label>
        <div className="flex gap-2 flex-wrap">
          {gradientOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`h-10 w-14 rounded-lg bg-gradient-to-br ${opt.preview} dark:from-${opt.value}-600 dark:to-stone-700 border-2 transition-all ${
                form.watch('coverGradient') === opt.value
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                  : 'border-transparent hover:border-muted-foreground/30'
              }`}
              onClick={() => form.setValue('coverGradient', opt.value)}
              title={opt.label}
            />
          ))}
        </div>
      </div>

      {/* Cover Preview */}
      <div className="space-y-2">
        <Label>Cover Preview</Label>
        <div className="h-32 rounded-xl bg-gradient-to-br from-emerald-400 to-stone-300 dark:from-emerald-600 dark:to-stone-700 flex items-center justify-center overflow-hidden">
          <ImageIcon className="h-12 w-12 text-white/50" />
        </div>
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
          {isEditing ? 'Update Album' : 'Create Album'}
        </Button>
      </div>
    </form>
  );
}
