'use client';

// ============================================================
// ImageUploader — Simulated upload dialog/form
// Drop zone, browse button, preview cards with captions
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { type GradientColor, getGradientClasses } from '@/lib/website/sample-data';
import { fadeIn, staggerChildren, transitions } from '@/lib/animations';

interface SimulatedImage {
  id: string;
  caption: string;
  gradient: GradientColor;
}

const gradients: GradientColor[] = ['emerald', 'amber', 'sky', 'rose', 'violet'];

interface ImageUploaderProps {
  albumName: string;
  onComplete: (images: SimulatedImage[]) => void;
  onCancel: () => void;
}

export default function ImageUploader({ albumName, onComplete, onCancel }: ImageUploaderProps) {
  const [images, setImages] = React.useState<SimulatedImage[]>([]);
  const [browseClicked, setBrowseClicked] = React.useState(false);

  const handleBrowse = () => {
    setBrowseClicked(true);
    // Simulate adding 3 images
    const newImages: SimulatedImage[] = Array.from({ length: 3 }, (_, i) => ({
      id: `upload-${Date.now()}-${i}`,
      caption: `${albumName} photo ${images.length + i + 1}`,
      gradient: gradients[(images.length + i) % gradients.length],
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleCaptionChange = (imageId: string, caption: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, caption } : img))
    );
  };

  const handleRemoveImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleAddImages = () => {
    if (images.length > 0) {
      onComplete(images);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Adding images to <span className="font-medium text-foreground">{albumName}</span>
      </p>

      {/* Drop Zone */}
      {!browseClicked && (
        <motion.div
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          transition={transitions.normal}
          className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition-colors cursor-pointer"
          onClick={handleBrowse}
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
            onClick={handleBrowse}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Browse Files
          </Button>
        </motion.div>
      )}

      {/* Browse button (always visible after first click) */}
      {browseClicked && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleBrowse}
        >
          <Plus className="h-4 w-4" />
          Add More Images
        </Button>
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
              <div className={`aspect-[4/3] rounded-lg ${getGradientClasses(img.gradient)} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white/60" />
                </div>
                <button
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  onClick={() => handleRemoveImage(img.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Caption</Label>
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
          disabled={images.length === 0}
          onClick={handleAddImages}
        >
          Add Images ({images.length})
        </Button>
      </div>
    </div>
  );
}
