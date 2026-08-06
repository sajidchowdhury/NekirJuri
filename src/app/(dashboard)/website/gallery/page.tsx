'use client';

// ============================================================
// Photo Gallery Page — Albums view ↔ Image grid, dialogs
// CR-11: Gallery limits bar, subscription-aware upload, upgrade prompt
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
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
import GalleryManager from '@/components/website/gallery-manager';
import GalleryLimitsBar, { type GalleryLimitsData } from '@/components/website/gallery-limits-bar';
import AlbumForm, { type AlbumFormData } from '@/components/website/album-form';
import ImageUploader from '@/components/website/image-uploader';
import {
  sampleAlbums,
  type GalleryAlbum,
  type GalleryImage,
  type GradientColor,
} from '@/lib/website/sample-data';
import { fadeIn, transitions } from '@/lib/animations';

interface SimulatedUploadImage {
  id: string;
  caption: string;
  gradient: GradientColor;
}

export default function GalleryPage() {
  const [albums, setAlbums] = React.useState<GalleryAlbum[]>(sampleAlbums);
  const [albumDialogOpen, setAlbumDialogOpen] = React.useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [uploadAlbumId, setUploadAlbumId] = React.useState<string | null>(null);
  const [limitsData, setLimitsData] = React.useState<GalleryLimitsData | null>(null);

  // Fetch gallery limits on mount
  React.useEffect(() => {
    fetch('/api/gallery/limits')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.success && data.data) {
          setLimitsData(data.data);
        }
      })
      .catch(() => {
        // Limits fetch failed — use defaults, don't block UI
      });
  }, []);

  const handleCreateAlbum = () => {
    if (limitsData && !limitsData.canCreateAlbum) {
      toast.error(`Album limit reached (${limitsData.usage.albumCount}/${limitsData.limits.maxAlbums}). Upgrade your plan to create more albums.`);
      return;
    }
    setAlbumDialogOpen(true);
  };

  const handleSaveAlbum = async (data: AlbumFormData) => {
    // Try creating via API (which also checks maxAlbums)
    try {
      const res = await fetch('/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description || '',
          coverImageUrl: null,
          isPublished: false,
        }),
      });

      if (res.status === 413) {
        const err = await res.json();
        toast.error(err.error || 'Album limit reached. Upgrade your plan.');
        return;
      }

      if (!res.ok && res.status !== 400) {
        // API might fail due to missing auth headers in dev; fall through to local create
        const err = await res.json();
        toast.error(err.error || 'Failed to create album');
        return;
      }

      // If API succeeded, refresh limits
      if (res.ok) {
        const result = await res.json();
        toast.success('Album created');
        // Re-fetch limits
        fetch('/api/gallery/limits')
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.success && d.data) setLimitsData(d.data); })
          .catch(() => {});
      }
    } catch {
      // API call failed (e.g., no auth headers), continue with local state
    }

    // Also update local state for immediate UI feedback
    const newAlbum: GalleryAlbum = {
      id: `album-${Date.now()}`,
      title: data.title,
      description: data.description || '',
      coverGradient: data.coverGradient,
      createdAt: new Date().toISOString().split('T')[0],
      images: [],
    };
    setAlbums((prev) => [...prev, newAlbum]);
    setAlbumDialogOpen(false);
  };

  const handleUploadImages = (albumId: string) => {
    setUploadAlbumId(albumId);
    setUploadDialogOpen(true);
  };

  const handleUploadComplete = (images: SimulatedUploadImage[]) => {
    if (uploadAlbumId) {
      setAlbums((prev) =>
        prev.map((album) =>
          album.id === uploadAlbumId
            ? { ...album, images: [...album.images, ...images] }
            : album
        )
      );
    }
    setUploadDialogOpen(false);
    setUploadAlbumId(null);
    toast.success(`${images.length} image(s) added`);
  };

  const handleDeleteAlbum = (albumId: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
    toast.success('Album deleted');
  };

  const handleDeleteImage = (albumId: string, imageId: string) => {
    setAlbums((prev) =>
      prev.map((album) =>
        album.id === albumId
          ? { ...album, images: album.images.filter((img) => img.id !== imageId) }
          : album
      )
    );
  };

  const handleEditImage = (albumId: string, image: GalleryImage) => {
    const newCaption = prompt('Edit caption:', image.caption);
    if (newCaption !== null) {
      setAlbums((prev) =>
        prev.map((album) =>
          album.id === albumId
            ? {
                ...album,
                images: album.images.map((img) =>
                  img.id === image.id ? { ...img, caption: newCaption } : img
                ),
              }
            : album
        )
      );
    }
  };

  const handleUpgrade = () => {
    toast.info('Redirecting to billing page to upgrade your plan...');
    // In a real app: router.push('/system/billing')
  };

  const uploadAlbum = albums.find((a) => a.id === uploadAlbumId);

  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Photo Gallery"
        description="Upload and manage photos and media gallery"

        actions={
          <Button
            onClick={handleCreateAlbum}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
            size="sm"
            disabled={limitsData ? !limitsData.canCreateAlbum : false}
          >
            <Plus className="h-4 w-4" />
            Create Album
          </Button>
        }
      />

      {/* CR-11: Storage & Limits Bar */}
      <GalleryLimitsBar limits={limitsData} onUpgrade={handleUpgrade} />

      <GalleryManager
        albums={albums}
        onCreateAlbum={handleCreateAlbum}
        onUploadImages={handleUploadImages}
        onDeleteAlbum={handleDeleteAlbum}
        onDeleteImage={handleDeleteImage}
        onEditImage={handleEditImage}
        limits={limitsData?.limits ?? null}
        canCreateAlbum={limitsData?.canCreateAlbum ?? true}
      />

      {/* Create Album Dialog */}
      <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Album</DialogTitle>
            <DialogDescription>
              Create a new photo album for your gallery
            </DialogDescription>
          </DialogHeader>
          <AlbumForm
            onSave={handleSaveAlbum}
            onCancel={() => setAlbumDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Upload Images Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
            <DialogDescription>
              Add images to your photo album
            </DialogDescription>
          </DialogHeader>
          {uploadAlbum && (
            <ImageUploader
              albumName={uploadAlbum.title}
              maxImageSizeMb={limitsData?.limits.maxImageSizeMb ?? 2}
              currentImageCount={uploadAlbum.images.length}
              maxImagesPerAlbum={limitsData?.limits.maxImagesPerAlbum ?? 20}
              onComplete={handleUploadComplete}
              onCancel={() => {
                setUploadDialogOpen(false);
                setUploadAlbumId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
