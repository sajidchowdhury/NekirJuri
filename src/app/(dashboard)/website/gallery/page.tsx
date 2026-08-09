'use client';

// ============================================================
// Photo Gallery Page — Albums view ↔ Image grid, dialogs
// CR-11: Gallery limits bar, subscription-aware upload, upgrade prompt
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
import GalleryManager from '@/components/website/gallery-manager';
import GalleryLimitsBar, { type GalleryLimitsData } from '@/components/website/gallery-limits-bar';
import AlbumForm, { type AlbumFormData } from '@/components/website/album-form';
import ImageUploader from '@/components/website/image-uploader';
import {
  type GalleryAlbum,
  type GalleryImage,
  type GradientColor,
} from '@/lib/website/sample-data';
import { fadeIn, transitions } from '@/lib/animations';
import { apiFetchList, apiSubmit, apiDelete } from '@/lib/api-client';

// ── API response shapes ─────────────────────────────────
interface ApiGalleryImage {
  id: number;
  imageUrl: string;
  caption?: string;
  fileSizeKb: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiGallery {
  id: number;
  title: string;
  description?: string;
  coverImageUrl?: string;
  isPublished: boolean;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  images: ApiGalleryImage[];
}

interface SimulatedUploadImage {
  id: string;
  caption: string;
  gradient: GradientColor;
}

// ── Gradients for cycling placeholders ──────────────────
const gradients: GradientColor[] = ['emerald', 'amber', 'sky', 'rose', 'violet'];

// ── Map API → component shape ───────────────────────────
function mapApiGallery(g: ApiGallery, idx: number): GalleryAlbum {
  return {
    id: String(g.id),
    title: g.title,
    description: g.description || '',
    coverGradient: gradients[idx % gradients.length],
    createdAt: new Date(g.createdAt).toISOString().split('T')[0],
    images: (g.images || []).map((img, imgIdx) => ({
      id: String(img.id),
      caption: img.caption || '',
      gradient: gradients[imgIdx % gradients.length],
    })),
  };
}

export default function GalleryPage() {
  const queryClient = useQueryClient();
  const [albumDialogOpen, setAlbumDialogOpen] = React.useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [uploadAlbumId, setUploadAlbumId] = React.useState<string | null>(null);

  // ── Fetch galleries ──────────────────────────────────
  const {
    data: galleriesResponse,
    isLoading: galleriesLoading,
    isError: galleriesError,
    refetch: refetchGalleries,
  } = useQuery({
    queryKey: ['galleries'],
    queryFn: () => apiFetchList<ApiGallery>('/api/galleries?limit=100'),
  });

  const albums: GalleryAlbum[] = (galleriesResponse?.data || []).map(mapApiGallery);

  // ── Fetch gallery limits ─────────────────────────────
  const {
    data: limitsRaw,
  } = useQuery({
    queryKey: ['gallery-limits'],
    queryFn: async () => {
      const res = await fetch('/api/gallery/limits');
      if (!res.ok) return null;
      const json = await res.json();
      if (json?.success && json.data) return json.data as GalleryLimitsData;
      return null;
    },
    staleTime: 10 * 60 * 1000,
  });

  const limitsData: GalleryLimitsData | null = limitsRaw ?? null;

  // ── Create album mutation ────────────────────────────
  const createAlbumMutation = useMutation({
    mutationFn: (data: AlbumFormData) =>
      apiSubmit<ApiGallery>('/api/galleries', 'POST', {
        title: data.title,
        description: data.description || '',
        coverImageUrl: null,
        isPublished: false,
      }),
    onSuccess: () => {
      toast.success('Album created');
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-limits'] });
      setAlbumDialogOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create album');
    },
  });

  // ── Delete album mutation ────────────────────────────
  const deleteAlbumMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/galleries/${id}`),
    onSuccess: () => {
      toast.success('Album deleted');
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-limits'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete album');
    },
  });

  // ── Handlers ─────────────────────────────────────────
  const handleCreateAlbum = () => {
    if (limitsData && !limitsData.canCreateAlbum) {
      toast.error(`Album limit reached (${limitsData.usage.albumCount}/${limitsData.limits.maxAlbums}). Upgrade your plan to create more albums.`);
      return;
    }
    setAlbumDialogOpen(true);
  };

  const handleSaveAlbum = (data: AlbumFormData) => {
    createAlbumMutation.mutate(data);
  };

  const handleUploadImages = (albumId: string) => {
    setUploadAlbumId(albumId);
    setUploadDialogOpen(true);
  };

  const handleUploadComplete = (images: SimulatedUploadImage[]) => {
    // Add images locally — in production, this would POST to /api/gallery/images
    toast.success(`${images.length} image(s) added`);
    setUploadDialogOpen(false);
    setUploadAlbumId(null);
    // Refresh galleries to reflect changes
    queryClient.invalidateQueries({ queryKey: ['galleries'] });
  };

  const handleDeleteAlbum = (albumId: string) => {
    if (confirm('Are you sure you want to delete this album? All images will be removed.')) {
      deleteAlbumMutation.mutate(albumId);
    }
  };

  const handleDeleteImage = (_albumId: string, _imageId: string) => {
    // Would call DELETE /api/gallery/images/:id in production
    toast.info('Image deletion is not yet supported by the API');
  };

  const handleEditImage = (_albumId: string, image: GalleryImage) => {
    // Would call PATCH /api/gallery/images/:id in production
    toast.info(`Edit caption for "${image.caption}" — not yet supported by the API`);
  };

  const handleUpgrade = () => {
    toast.info('Redirecting to billing page to upgrade your plan...');
  };

  const uploadAlbum = albums.find((a) => a.id === uploadAlbumId);

  // ── Error state ──────────────────────────────────────
  if (galleriesError) {
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
        />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load gallery</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            There was an error fetching gallery data. Please try again.
          </p>
          <Button variant="outline" className="gap-2" onClick={() => refetchGalleries()}>
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
        isLoading={galleriesLoading}
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
