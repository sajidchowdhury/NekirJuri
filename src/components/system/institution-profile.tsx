'use client';

// ============================================================
// InstitutionProfile — Live preview card for print layouts
// ============================================================

import BismillahHeader from '@/components/islamic/bismillah-header';
import { type SettingsState } from '@/components/system/settings-page';
import { Phone, Mail, MapPin } from 'lucide-react';

interface InstitutionProfileProps {
  settings: SettingsState;
}

export default function InstitutionProfile({ settings }: InstitutionProfileProps) {
  return (
    <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2">
        <p className="text-xs text-emerald-100 font-medium text-center">
          Print Layout Preview
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5 bg-white dark:bg-card">
        {/* Bismillah */}
        <BismillahHeader size="sm" showTranslation={false} />

        {/* Logo + Institution Name */}
        <div className="flex flex-col items-center gap-3">
          {/* Logo placeholder */}
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">AH</span>
          </div>

          {/* Institution name English */}
          <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 text-center">
            {settings.institutionName}
          </h2>

          {/* Institution name Bengali */}
          {settings.institutionNameBn && (
            <p className="text-base text-stone-600 dark:text-stone-400 text-center font-bengali">
              {settings.institutionNameBn}
            </p>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-2 text-sm">
          {settings.institutionPhone && (
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{settings.institutionPhone}</span>
            </div>
          )}
          {settings.institutionEmail && (
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <Mail className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{settings.institutionEmail}</span>
            </div>
          )}
          {settings.institutionAddress && (
            <div className="flex items-start gap-2 text-stone-600 dark:text-stone-400">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs">{settings.institutionAddress}</span>
            </div>
          )}
        </div>

        {/* Decorative bottom border */}
        <div className="h-1 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400" />
      </div>
    </div>
  );
}
