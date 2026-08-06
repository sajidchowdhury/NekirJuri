'use client';

// ============================================================
// ImageUploader — File upload dialog with subscription limit checks
// Real file input, size validation, limit enforcement
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Plus, AlertTriangle, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { type GradientColor, getGradientClasses } from '@/lib/website/sample-data';
import { fadeIn, staggerChildren, transitions } from '@/lib/animations';

interface ImageFile {
  id: string;
  file: File | null;
  caption: string;
  gradient: GradientColor;
  preview?: string;
  sizeKb: number;
  sizeExceeded: boolean;
}

const gradients: GradientColor[] = ['emerald', 'amber', 'sky', 'rose', 'violet'];

interface ImageUploaderProps {
  albumName: string;
  maxImageSizeMb?: number;
  currentImageCount?: number;
  maxImagesPerAlbum?: number;
  onComplete: (images: Array<{ id: string; caption: string; gradient: GradientColor }>) => void;
  onCancel: () => void;
}

export default function ImageUploader({
  albumName,
  maxImageSizeMb = 2,
  currentImageCount = 0,
  maxImagesPerAlbum = 20,
  onComplete,
  onCancel,
}: ImageUploaderProps) {
  const [images, setImages] = React.useState<ImageFile[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const remainingSlots = maxImagesPerAlbum - currentImageCount;
  const canAddMore = images.length < remainingSlots;
  const hasOversizedFiles = images.some(img => img.sizeExceeded);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = Array.from(files).slice(0, remainingSlots - images.length).map((file, i) => {
      const sizeKb = Math.round(file.size / 1024);
      const sizeMb = sizeKb / 1024;
      return {
        id: `upload-${Date.now()}-${i}`,
        file,
        caption: file.name.replace(/\.[^.]+$/, ''),
        gradient: gradients[(images.length + i) % gradients.length],
        preview: URL.createObjectURL(file),
        sizeKb,
        sizeExceeded: sizeMb > maxImageSizeMb,
      };
    });

    setImages(prev => [...prev, ...newImages]);
    // Reset the file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleCaptionChange = (imageId: string, caption: string) => {
    setImages(prev => prev.map(img => (img.id === imageId ? { ...img, caption } : img)));
  };

  const handleRemoveImage = (imageId: string) => {
    setImages(prev => {
      const removed = prev.find(img => img.id === imageId);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter(img => img.id !== imageId);
    });
  };

  const handleAddImages = () => {
    // Only add images that pass size validation
    const validImages = images
      .filter(img => !img.sizeExceeded)
      .map(img => ({
        id: img.id,
        caption: img.caption,
        gradient: img.gradient,
      }));
    if (validImages.length > 0) {
      onComplete(validImages);
    }
  };

  const formatSize = (kb: number) => {
    if (kb < 1024) return `${kb}KB`;
    return `${(kb / 1024).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Adding images to <span className="font-medium text-foreground">{albumName}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {currentImageCount}/{maxImagesPerAlbum} images used • Max {maxImageSizeMb}MB per image
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Drop Zone / Browse */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition-colors cursor-pointer"
        onClick={handleBrowseClick}
      >
        <Upload className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          Drag & drop images here or click to browse
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={handleBrowseClick}
        >
          <Upload className="h-4 w-4 mr-1.5" />
          Browse Files
        </Button>
        {remainingSlots <= 5 && remainingSlots > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining in this album
          </p>
        )}
        {remainingSlots <= 0 && (
          <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Album image limit reached
          </p>
        )}
      </div>

      {/* Add more button */}
      {images.length > 0 && canAddMore && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleBrowseClick}
        >
          <Plus className="h-4 w-4" />
          Add More Images
        </Button>
      )}

      {/* Oversized file warning */}
      {hasOversizedFiles && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
          <FileWarning className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Some files exceed the {maxImageSizeMb}MB size limit and will be skipped. Remove them or upgrade your plan.
          </p>
        </div>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <motion.div
          initial={staggerChildren.initial}
          animate={staggerChildren.animate}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {images.map((img) => (
            <motion.div
              key={img.id}
              initial={fadeIn.initial}
              animate={fadeIn.animate}
              transition={transitions.normal}
              className="space-y-2"
            >
              <div className={`aspect-[4/3] rounded-lg ${img.sizeExceeded ? 'ring-2 ring-rose-500' : ''} overflow-hidden relative`}>
                {img.preview ? (
                  <img src={img.preview} alt={img.caption} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full ${getGradientClasses(img.gradient)} flex items-center justify-center`}>
                    <ImageIcon className="h-8 w-8 text-white/60" />
                  </div>
                )}
                <button
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  onClick={() => handleRemoveImage(img.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {img.sizeExceeded && (
                  <div className="absolute bottom-0 left-0 right-0 bg-rose-600/90 text-white text-[10px] text-center py-0.5">
                    {formatSize(img.sizeKb)} &gt; {maxImageSizeMb}MB
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Caption</Label>
                  <span className="text-[10px] text-muted-foreground">{formatSize(img.sizeKb)}</span>
                </div>
                <Input
                  value={img.caption}
                  onChange={(e) => handleCaptionChange(img.id, e.target.value)}
                  className="h-8 text-xs"
                  placeholder="Enter caption"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={images.length === 0 || hasOversizedFiles}
          onClick={handleAddImages}
        >
          Add Images ({images.filter(img => !img.sizeExceeded).length})
        </Button>
      </div>
    </div>
  );
}
