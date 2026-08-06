'use client';

// ============================================================
// PhotoUpload — Avatar upload with preview and initials fallback
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';

export interface PhotoUploadProps {
  /** Current image URL */
  value?: string;
  /** Change callback with base64 data URL */
  onChange?: (value: string) => void;
  /** Name for initials */
  name?: string;
  /** Size in pixels */
  size?: number;
  /** Additional class */
  className?: string;
}

export default function PhotoUpload({
  value,
  onChange,
  name = '',
  size = 80,
  className,
}: PhotoUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      onChange?.(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={cn('relative group', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative rounded-full overflow-hidden ring-2 ring-border hover:ring-emerald-500 transition-colors focus:outline-none focus:ring-emerald-500"
        style={{ width: size, height: size }}
      >
        <Avatar style={{ width: size, height: size }} className="w-full h-full">
          <AvatarImage src={value} alt={name} className="object-cover" />
          <AvatarFallback
            className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold"
            style={{ fontSize: size * 0.3 }}
          >
            {initials || '?'}
          </AvatarFallback>
        </Avatar>
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </button>
    </div>
  );
}
