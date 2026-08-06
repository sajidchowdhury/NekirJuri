'use client';

// ============================================================
// Photo Gallery Page — Albums view ↔ Image grid, dialogs
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
import GalleryManager from '@/components/website/gallery-manager';
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

  const handleCreateAlbum = () => {
    setAlbumDialogOpen(true);
  };

  const handleSaveAlbum = (data: AlbumFormData) => {
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
  };

  const handleDeleteAlbum = (albumId: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
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
    // Simulate editing — just update caption with a prompt-like experience
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
        showBismillah
        actions={
          <Button
            onClick={handleCreateAlbum}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Create Album
          </Button>
        }
      />

      <GalleryManager
        albums={albums}
        onCreateAlbum={handleCreateAlbum}
        onUploadImages={handleUploadImages}
        onDeleteAlbum={handleDeleteAlbum}
        onDeleteImage={handleDeleteImage}
        onEditImage={handleEditImage}
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
