'use client';

// ============================================================
// GalleryLimitsBar — Shows storage usage bars and limit indicators
// Displays: albums used, images per album, storage used, max image size
// Upgrade prompt when limits are near or at capacity
// ============================================================

import * as React from 'react';
import { HardDrive, FolderOpen, Image as ImageIcon, Upload, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export interface GalleryLimitsData {
  limits: {
    maxAlbums: number;
    maxImagesPerAlbum: number;
    maxImageSizeMb: number;
    maxStorageMb: number;
  };
  usage: {
    albumCount: number;
    storageUsedMb: number;
    albums: Array<{ id: number; title: string; imageCount: number }>;
  };
  plan: {
    name: string;
    slug: string;
  };
  canCreateAlbum: boolean;
  isStorageFull: boolean;
  storagePercentage: number;
}

interface GalleryLimitsBarProps {
  limits: GalleryLimitsData | null;
  onUpgrade?: () => void;
}

export default function GalleryLimitsBar({ limits, onUpgrade }: GalleryLimitsBarProps) {
  if (!limits) return null;

  const { limits: lim, usage, plan, canCreateAlbum, isStorageFull, storagePercentage } = limits;

  // Find the album with the most images
  const maxImagesInAlbum = usage.albums.length > 0
    ? Math.max(...usage.albums.map(a => a.imageCount))
    : 0;

  const albumPct = Math.min(100, Math.round((usage.albumCount / lim.maxAlbums) * 100));
  const imagesPct = Math.min(100, Math.round((maxImagesInAlbum / lim.maxImagesPerAlbum) * 100));

  const isNearAlbumLimit = albumPct >= 80;
  const isNearImageLimit = imagesPct >= 80;
  const isNearStorageLimit = storagePercentage >= 80;

  const hasAnyWarning = isNearAlbumLimit || isNearImageLimit || isNearStorageLimit || !canCreateAlbum || isStorageFull;

  const getColor = (pct: number) => {
    if (pct >= 100) return 'text-rose-600 dark:text-rose-400';
    if (pct >= 80) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const getProgressClass = (pct: number) => {
    if (pct >= 100) return '[&>div]:bg-rose-500';
    if (pct >= 80) return '[&>div]:bg-amber-500';
    return '[&>div]:bg-emerald-500';
  };

  return (
    <Card className={`border ${hasAnyWarning ? 'border-amber-200 dark:border-amber-800' : 'border-border/60'}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Storage & Limits</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {plan.name} Plan
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Albums */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <FolderOpen className="h-3 w-3" />
                Albums
              </span>
              <span className={getColor(albumPct)}>
                {usage.albumCount}/{lim.maxAlbums}
              </span>
            </div>
            <Progress value={albumPct} className={`h-2 ${getProgressClass(albumPct)}`} />
            {!canCreateAlbum && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Album limit reached
              </p>
            )}
          </div>

          {/* Images per Album */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <ImageIcon className="h-3 w-3" />
                Images/Album
              </span>
              <span className={getColor(imagesPct)}>
                {maxImagesInAlbum}/{lim.maxImagesPerAlbum}
              </span>
            </div>
            <Progress value={imagesPct} className={`h-2 ${getProgressClass(imagesPct)}`} />
          </div>

          {/* Storage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <HardDrive className="h-3 w-3" />
                Storage
              </span>
              <span className={getColor(storagePercentage)}>
                {usage.storageUsedMb.toFixed(0)}/{lim.maxStorageMb}MB
              </span>
            </div>
            <Progress value={storagePercentage} className={`h-2 ${getProgressClass(storagePercentage)}`} />
            {isStorageFull && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Storage full
              </p>
            )}
          </div>
        </div>

        {/* Max image size info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Upload className="h-3 w-3" />
          Max image size: {lim.maxImageSizeMb}MB per image
        </div>

        {/* Upgrade prompt when near/at limits */}
        {hasAnyWarning && onUpgrade && (
          <div className="flex items-center justify-between pt-1 border-t border-border/60">
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Upgrade your plan for higher limits
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/20"
              onClick={onUpgrade}
            >
              Upgrade Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
