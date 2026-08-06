'use client';

// ============================================================
// GalleryManager — Two views: Albums grid ↔ Image grid inside album
// Album cards with cover gradient, image count, click to open
// Image grid with hover overlay, upload button
// ============================================================

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Upload,
  Pencil,
  Trash2,
  Camera,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EmptyState from '@/components/atoms/empty-state';
import {
  type GalleryAlbum,
  type GalleryImage,
  getGradientClasses,
  formatDate,
} from '@/lib/website/sample-data';
import { fadeIn, slideUp, staggerChildren, transitions } from '@/lib/animations';

interface GalleryManagerProps {
  albums: GalleryAlbum[];
  onCreateAlbum: () => void;
  onUploadImages: (albumId: string) => void;
  onDeleteAlbum: (albumId: string) => void;
  onDeleteImage: (albumId: string, imageId: string) => void;
  onEditImage: (albumId: string, image: GalleryImage) => void;
  /** Gallery subscription limits for showing usage indicators */
  limits?: {
    maxAlbums?: number;
    maxImagesPerAlbum?: number;
    maxImageSizeMb?: number;
  } | null;
  /** Whether album creation is blocked by subscription limit */
  canCreateAlbum?: boolean;
}

export default function GalleryManager({
  albums,
  onCreateAlbum,
  onUploadImages,
  onDeleteAlbum,
  onDeleteImage,
  onEditImage,
  limits,
  canCreateAlbum = true,
}: GalleryManagerProps) {
  const [selectedAlbum, setSelectedAlbum] = React.useState<GalleryAlbum | null>(null);

  const maxImagesPerAlbum = limits?.maxImagesPerAlbum ?? 20;

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
  };

  const handleAlbumClick = (album: GalleryAlbum) => {
    setSelectedAlbum(album);
  };

  // ──── Albums View ────
  if (!selectedAlbum) {
    return (
      <div className="space-y-4">
        {albums.length === 0 ? (
          <EmptyState
            title="No albums yet"
            description="Create your first photo album to start building your gallery."
            action={{
              label: 'Create Album',
              onClick: onCreateAlbum,
            }}
          />
        ) : (
          <motion.div
            initial={staggerChildren.initial}
            animate={staggerChildren.animate}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {albums.map((album) => (
                <motion.div
                  key={album.id}
                  initial={fadeIn.initial}
                  animate={fadeIn.animate}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={transitions.normal}
                >
                  <Card
                    className="group overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-border/60"
                    onClick={() => handleAlbumClick(album)}
                  >
                    {/* Cover gradient */}
                    <div
                      className={`h-40 ${getGradientClasses(album.coverGradient)} relative`}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <FolderOpen className="h-10 w-10 text-white/60 group-hover:text-white/80 transition-colors" />
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-foreground">{album.title}</h3>
                        <Badge className={`${album.images.length >= maxImagesPerAlbum ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'} border-0 shrink-0 ml-2`}>
                          <Camera className="h-3 w-3 mr-1" />
                          {album.images.length}/{maxImagesPerAlbum}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {album.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(album.createdAt)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-500 hover:text-rose-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAlbum(album.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    );
  }

  // ──── Image Grid View ────
  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
      className="space-y-4"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToAlbums}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={handleBackToAlbums} className="cursor-pointer">
                Gallery
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="font-medium text-foreground">
                {selectedAlbum.title}
              </span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Upload button */}
      <div className="flex justify-end items-center gap-3">
        {selectedAlbum.images.length >= maxImagesPerAlbum && (
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Image limit reached for this album ({selectedAlbum.images.length}/{maxImagesPerAlbum})
          </p>
        )}
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
          onClick={() => onUploadImages(selectedAlbum.id)}
          disabled={selectedAlbum.images.length >= maxImagesPerAlbum}
        >
          <Upload className="h-4 w-4" />
          Upload Images
        </Button>
      </div>

      {/* Image Grid */}
      {selectedAlbum.images.length === 0 ? (
        <EmptyState
          title="No images in this album"
          description="Upload images to populate this album."
          action={{
            label: 'Upload Images',
            onClick: () => onUploadImages(selectedAlbum.id),
          }}
        />
      ) : (
        <motion.div
          initial={staggerChildren.initial}
          animate={staggerChildren.animate}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {selectedAlbum.images.map((image) => (
              <motion.div
                key={image.id}
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={transitions.normal}
              >
                <Card className="group overflow-hidden border-border/60">
                  {/* Image placeholder */}
                  <div className={`aspect-[4/3] ${getGradientClasses(image.gradient)} relative`}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-white/40 group-hover:text-white/70 transition-colors" />
                    </div>
                    {/* Hover overlay with actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 bg-white/90 hover:bg-white text-foreground shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-xs leading-none">⋯</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditImage(selectedAlbum.id, image)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Caption
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteImage(selectedAlbum.id, image.id)}
                            className="text-rose-600 focus:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground truncate">{image.caption}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
