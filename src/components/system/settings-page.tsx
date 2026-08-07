'use client';

// ============================================================
// SettingsPage — Grouped settings with Accordion
// ============================================================

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { HardDrive } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SettingsState {
  // General
  institutionName: string;
  institutionNameBn: string;
  institutionPhone: string;
  institutionEmail: string;
  institutionAddress: string;
  // Academic
  currentSession: string;
  defaultStudentStatus: string;
  autoPromote: boolean;
  rollNumberFormat: string;
  attendanceMethod: string;
  // Finance
  currency: string;
  fiscalYearStart: string;
  defaultPaymentMethod: string;
  feeReminderDays: number;
  autoGenerateInvoice: boolean;
  lateFeeAmount: number;
  accountingMode: 'simplified' | 'double-entry';
  // Appearance
  theme: string;
  primaryColor: string;
  showBismillahOnReports: boolean;
  showArabicDate: boolean;
  sidebarDefaultState: string;
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  notifyOnFeeCollection: boolean;
  notifyOnStudentAdmission: boolean;
  notifyOnSalaryPayment: boolean;
  smtpHost: string;
  smsApiKey: string;
}

export const defaultSettings: SettingsState = {
  institutionName: 'Al-Huda Islamic Academy',
  institutionNameBn: 'আল-হুদা ইসলামিক একাডেমী',
  institutionPhone: '+880 1712-345678',
  institutionEmail: 'info@alhuda.edu.bd',
  institutionAddress: 'Village: Char Balapur, P.O: Balapur, Upazila: Balaganj, District: Sylhet, Bangladesh',
  currentSession: '2025-2026',
  defaultStudentStatus: 'Active',
  autoPromote: false,
  rollNumberFormat: 'Sequential',
  attendanceMethod: 'Daily',
  currency: '৳ BDT',
  fiscalYearStart: 'January',
  defaultPaymentMethod: 'Cash',
  feeReminderDays: 7,
  autoGenerateInvoice: false,
  lateFeeAmount: 0,
  accountingMode: 'double-entry',
  theme: 'System',
  primaryColor: 'Emerald',
  showBismillahOnReports: true,
  showArabicDate: false,
  sidebarDefaultState: 'Expanded',
  emailNotifications: false,
  smsNotifications: false,
  notifyOnFeeCollection: true,
  notifyOnStudentAdmission: true,
  notifyOnSalaryPayment: true,
  smtpHost: '',
  smsApiKey: '',
};

interface SettingsPageProps {
  settings: SettingsState;
  onSettingsChange: (settings: SettingsState) => void;
}

export default function SettingsPage({ settings, onSettingsChange }: SettingsPageProps) {
  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={['general', 'academic', 'finance']} className="space-y-2">
        {/* General Settings */}
        <AccordionItem value="general" className="rounded-lg border px-1">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="flex items-center gap-2 font-semibold text-sm">
              🏛️ General Settings
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Institution Name</Label>
                <Input
                  value={settings.institutionName}
                  onChange={(e) => update('institutionName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Institution Name (Bengali)</Label>
                <Input
                  value={settings.institutionNameBn}
                  onChange={(e) => update('institutionNameBn', e.target.value)}
                  className="font-bengali"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={settings.institutionPhone}
                  onChange={(e) => update('institutionPhone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={settings.institutionEmail}
                  onChange={(e) => update('institutionEmail', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                value={settings.institutionAddress}
                onChange={(e) => update('institutionAddress', e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white text-xl font-bold">
                  AH
                </div>
                <Button variant="outline" size="sm">Change Logo</Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Academic Settings */}
        <AccordionItem value="academic" className="rounded-lg border px-1">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="flex items-center gap-2 font-semibold text-sm">
              🎓 Academic Settings
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Academic Session</Label>
                <Select value={settings.currentSession} onValueChange={(val) => update('currentSession', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                    <SelectItem value="2026-2027">2026-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Student Status</Label>
                <Select value={settings.defaultStudentStatus} onValueChange={(val) => update('defaultStudentStatus', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <Label className="text-sm">Auto-promote on Session End</Label>
                <p className="text-xs text-muted-foreground">Automatically promote students when session ends</p>
              </div>
              <Switch checked={settings.autoPromote} onCheckedChange={(val) => update('autoPromote', val)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Roll Number Format</Label>
                <Select value={settings.rollNumberFormat} onValueChange={(val) => update('rollNumberFormat', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sequential">Sequential</SelectItem>
                    <SelectItem value="Class-wise">Class-wise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Attendance Method</Label>
                <Select value={settings.attendanceMethod} onValueChange={(val) => update('attendanceMethod', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Period-wise">Period-wise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Finance Settings */}
        <AccordionItem value="finance" className="rounded-lg border px-1">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="flex items-center gap-2 font-semibold text-sm">
              💰 Finance Settings
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={settings.currency} onChange={(e) => update('currency', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fiscal Year Start</Label>
                <Select value={settings.fiscalYearStart} onValueChange={(val) => update('fiscalYearStart', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Payment Method</Label>
                <Select value={settings.defaultPaymentMethod} onValueChange={(val) => update('defaultPaymentMethod', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="bKash">bKash</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fee Reminder Days</Label>
                <Input
                  type="number"
                  value={settings.feeReminderDays}
                  onChange={(e) => update('feeReminderDays', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <Label className="text-sm">Auto-generate Invoice</Label>
                <p className="text-xs text-muted-foreground">Automatically create invoices on student admission</p>
              </div>
              <Switch checked={settings.autoGenerateInvoice} onCheckedChange={(val) => update('autoGenerateInvoice', val)} />
            </div>
            <div className="space-y-2">
              <Label>Late Fee Amount</Label>
              <Input
                type="number"
                value={settings.lateFeeAmount}
                onChange={(e) => update('lateFeeAmount', Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <Label className="text-sm">Accounting Mode</Label>
                <p className="text-xs text-muted-foreground">Simplified mode hides double-entry debit/credit, showing only Income & Expense tracking</p>
              </div>
              <Select value={settings.accountingMode} onValueChange={(val) => update('accountingMode', val as 'simplified' | 'double-entry')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="double-entry">Double-Entry</SelectItem>
                  <SelectItem value="simplified">Simplified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Appearance Settings */}
        <AccordionItem value="appearance" className="rounded-lg border px-1">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="flex items-center gap-2 font-semibold text-sm">
              🎨 Appearance Settings
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={settings.theme} onValueChange={(val) => update('theme', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Dark">Dark</SelectItem>
                    <SelectItem value="System">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <Select value={settings.primaryColor} onValueChange={(val) => update('primaryColor', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emerald">Emerald</SelectItem>
                    <SelectItem value="Teal">Teal</SelectItem>
                    <SelectItem value="Jade">Jade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <Label className="text-sm">Show Bismillah on Reports</Label>
                <p className="text-xs text-muted-foreground">Display Bismillah header on printed reports</p>
              </div>
              <Switch checked={settings.showBismillahOnReports} onCheckedChange={(val) => update('showBismillahOnReports', val)} />
            </div>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <Label className="text-sm">Show Arabic Date</Label>
                <p className="text-xs text-muted-foreground">Display Hijri date alongside Gregorian</p>
              </div>
              <Switch checked={settings.showArabicDate} onCheckedChange={(val) => update('showArabicDate', val)} />
            </div>
            <div className="space-y-2">
              <Label>Sidebar Default State</Label>
              <Select value={settings.sidebarDefaultState} onValueChange={(val) => update('sidebarDefaultState', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Expanded">Expanded</SelectItem>
                  <SelectItem value="Collapsed">Collapsed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Notification Settings */}
        <AccordionItem value="notifications" className="rounded-lg border px-1">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="flex items-center gap-2 font-semibold text-sm">
              🔔 Notification Settings
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <Label className="text-sm">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Send notifications via email</p>
              </div>
              <Switch checked={settings.emailNotifications} onCheckedChange={(val) => update('emailNotifications', val)} />
            </div>
            {settings.emailNotifications && (
              <div className="space-y-2 ml-4">
                <Label>SMTP Host</Label>
                <Input
                  value={settings.smtpHost}
                  onChange={(e) => update('smtpHost', e.target.value)}
                  placeholder="smtp.example.com:587"
                />
              </div>
            )}
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <Label className="text-sm">SMS Notifications</Label>
                <p className="text-xs text-muted-foreground">Send notifications via SMS</p>
              </div>
              <Switch checked={settings.smsNotifications} onCheckedChange={(val) => update('smsNotifications', val)} />
            </div>
            {settings.smsNotifications && (
              <div className="space-y-2 ml-4">
                <Label>SMS API Key</Label>
                <Input
                  type="password"
                  value={settings.smsApiKey}
                  onChange={(e) => update('smsApiKey', e.target.value)}
                  placeholder="Enter API key"
                />
              </div>
            )}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Notification Events</Label>
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <Label className="text-sm">Notify on Fee Collection</Label>
                <Switch checked={settings.notifyOnFeeCollection} onCheckedChange={(val) => update('notifyOnFeeCollection', val)} />
              </div>
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <Label className="text-sm">Notify on Student Admission</Label>
                <Switch checked={settings.notifyOnStudentAdmission} onCheckedChange={(val) => update('notifyOnStudentAdmission', val)} />
              </div>
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <Label className="text-sm">Notify on Salary Payment</Label>
                <Switch checked={settings.notifyOnSalaryPayment} onCheckedChange={(val) => update('notifyOnSalaryPayment', val)} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* Backup & Restore */}
        <AccordionItem value="backup">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-emerald-600" />
              <span>Backup & Restore</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Configure automatic backup schedule and retention. Manage backups from the{' '}
              <a href="/system/backup" className="text-emerald-600 hover:underline font-medium">
                Backup & Restore page
              </a>.
            </p>
            <div className="flex items-center justify-between rounded-md border px-4 py-3">
              <div>
                <Label className="text-sm">Auto Backup</Label>
                <p className="text-xs text-muted-foreground">Automatically create backups on schedule</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(val) => update('emailNotifications', val)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm">Frequency</Label>
                <Select value="daily" onValueChange={() => {}}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Retention (days)</Label>
                <Input
                  type="number"
                  value={30}
                  onChange={() => {}}
                  min={1}
                  max={365}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1.5" size="sm">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
