'use client';

// ============================================================
// System Settings Page — Settings + Institution Profile
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/atoms/page-header';
import SettingsPage, { type SettingsState, defaultSettings } from '@/components/system/settings-page';
import InstitutionProfile from '@/components/system/institution-profile';
import { Button } from '@/components/ui/button';
import { apiFetch, apiSubmit } from '@/lib/api-client';
import { fadeIn, slideUp, transitions } from '@/lib/animations';

// ── Field mapping: SettingsState keys ↔ API keys ──────────
// They are 1:1 identical, so no transform needed.

/** Convert API key-value map to SettingsState */
function mapApiToSettings(map: Record<string, string | null>): SettingsState {
  const parseBool = (v: string | null | undefined, fallback: boolean) =>
    v === 'true' ? true : v === 'false' ? false : fallback;
  const parseNum = (v: string | null | undefined, fallback: number) =>
    v != null ? Number(v) || fallback : fallback;

  return {
    institutionName: map.institutionName ?? defaultSettings.institutionName,
    institutionNameBn: map.institutionNameBn ?? defaultSettings.institutionNameBn,
    institutionPhone: map.institutionPhone ?? defaultSettings.institutionPhone,
    institutionEmail: map.institutionEmail ?? defaultSettings.institutionEmail,
    institutionAddress: map.institutionAddress ?? defaultSettings.institutionAddress,
    currentSession: map.currentSession ?? defaultSettings.currentSession,
    defaultStudentStatus: map.defaultStudentStatus ?? defaultSettings.defaultStudentStatus,
    autoPromote: parseBool(map.autoPromote, defaultSettings.autoPromote),
    rollNumberFormat: map.rollNumberFormat ?? defaultSettings.rollNumberFormat,
    attendanceMethod: map.attendanceMethod ?? defaultSettings.attendanceMethod,
    currency: map.currency ?? defaultSettings.currency,
    fiscalYearStart: map.fiscalYearStart ?? defaultSettings.fiscalYearStart,
    defaultPaymentMethod: map.defaultPaymentMethod ?? defaultSettings.defaultPaymentMethod,
    feeReminderDays: parseNum(map.feeReminderDays, defaultSettings.feeReminderDays),
    autoGenerateInvoice: parseBool(map.autoGenerateInvoice, defaultSettings.autoGenerateInvoice),
    lateFeeAmount: parseNum(map.lateFeeAmount, defaultSettings.lateFeeAmount),
    accountingMode: (map.accountingMode === 'simplified' || map.accountingMode === 'double-entry')
      ? map.accountingMode
      : defaultSettings.accountingMode,
    theme: map.theme ?? defaultSettings.theme,
    primaryColor: map.primaryColor ?? defaultSettings.primaryColor,
    showBismillahOnReports: parseBool(map.showBismillahOnReports, defaultSettings.showBismillahOnReports),
    showArabicDate: parseBool(map.showArabicDate, defaultSettings.showArabicDate),
    sidebarDefaultState: map.sidebarDefaultState ?? defaultSettings.sidebarDefaultState,
    emailNotifications: parseBool(map.emailNotifications, defaultSettings.emailNotifications),
    smsNotifications: parseBool(map.smsNotifications, defaultSettings.smsNotifications),
    notifyOnFeeCollection: parseBool(map.notifyOnFeeCollection, defaultSettings.notifyOnFeeCollection),
    notifyOnStudentAdmission: parseBool(map.notifyOnStudentAdmission, defaultSettings.notifyOnStudentAdmission),
    notifyOnSalaryPayment: parseBool(map.notifyOnSalaryPayment, defaultSettings.notifyOnSalaryPayment),
    smtpHost: map.smtpHost ?? defaultSettings.smtpHost,
    smsApiKey: map.smsApiKey ?? defaultSettings.smsApiKey,
  };
}

/** Convert SettingsState to API key-value array for POST */
function mapSettingsToApi(settings: SettingsState): { key: string; value: string }[] {
  return Object.entries(settings).map(([key, value]) => ({
    key,
    value: String(value),
  }));
}

export default function SettingsPageWrapper() {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = React.useState<SettingsState>(defaultSettings);

  // ── Fetch settings ──────────────────────────────────────
  const {
    isLoading: settingsLoading,
    isError: settingsError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const data = await apiFetch<{ settings: Record<string, string | null> }>('/api/settings');
      const mapped = mapApiToSettings(data.settings);
      setLocalSettings(mapped);
      return data;
    },
  });

  // ── Save settings mutation ──────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (settings: SettingsState) => {
      const payload = { settings: mapSettingsToApi(settings) };
      return apiSubmit('/api/settings', 'POST', payload);
    },
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save settings');
    },
  });

  // ── Handle settings change from component ───────────────
  const handleSettingsChange = (newSettings: SettingsState) => {
    setLocalSettings(newSettings);
  };

  // ── Handle save ─────────────────────────────────────────
  const handleSave = () => {
    saveMutation.mutate(localSettings);
  };

  // Error state
  if (settingsError) {
    return (
      <motion.div
        initial={fadeIn.initial}
        animate={fadeIn.animate}
        transition={transitions.normal}
        className="space-y-6"
      >
        <PageHeader title="System Settings" description="Configure system settings and institution profile" />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load settings</h3>
          <p className="text-sm text-muted-foreground max-w-md">There was an error fetching settings. Please try again.</p>
          <Button variant="outline" className="gap-2" onClick={() => refetchSettings()}>
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
        title="System Settings"
        description="Configure system settings and institution profile"
      />

      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
      >
        {/* Mobile: Profile at top, Settings below */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Settings */}
          <div className="flex-1 min-w-0">
            <SettingsPage
              settings={localSettings}
              onSettingsChange={handleSettingsChange}
              onSave={handleSave}
              isSaving={saveMutation.isPending}
              isLoading={settingsLoading}
            />
          </div>

          {/* Right: Institution Profile (sticky on desktop) */}
          <div className="lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <InstitutionProfile settings={localSettings} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
