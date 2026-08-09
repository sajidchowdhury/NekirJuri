'use client';

// ============================================================
// Journal Entries Page — Mode-aware
// CR-8: Simplified Accounting Mode
// Double-entry: Full journal entry table + debit/credit
// Simplified: Simple income/expense entry form
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Plus, FileText, CheckCircle2, XCircle, Send, Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import JournalEntryList from '@/components/accounting/journal-entry-list';
import JournalEntryForm from '@/components/accounting/journal-entry-form';
import SimplifiedJournalEntryForm from '@/components/accounting/simplified-journal-entry-form';
import SimplifiedAccountingSummary from '@/components/accounting/simplified-accounting-summary';
import { useAccountingMode } from '@/hooks/use-accounting-mode';
import { formatTaka } from '@/lib/accounting/sample-data';
import { apiSubmit } from '@/lib/api-client';
import { slideUp } from '@/lib/animations';

// ── API Journal Entry type ───────────────────────────────
interface ApiJournalEntry {
  id: number;
  entryNo: string;
  entryDate: string;
  narration?: string | null;
  referenceType?: string | null;
  referenceId?: number | null;
  totalDebit: number;
  totalCredit: number;
  status: string;
  journalItems: {
    id: number;
    accountId: number;
    debit: number;
    credit: number;
    narration?: string | null;
    account: { id: number; code: string; name: string; accountType: string };
  }[];
  createdAt: string;
}

export default function JournalEntriesPage() {
  const t = useTranslations('accounting');
  const { isSimplified, loading } = useAccountingMode();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = React.useState<'all' | 'draft' | 'posted'>('all');
  const [newEntryDialogOpen, setNewEntryDialogOpen] = React.useState(false);
  const [viewEntry, setViewEntry] = React.useState<ApiJournalEntry | null>(null);
  const [editEntry, setEditEntry] = React.useState<ApiJournalEntry | null>(null);
  const [postEntry, setPostEntry] = React.useState<ApiJournalEntry | null>(null);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleView = (entry: ApiJournalEntry) => setViewEntry(entry);
  const handleEdit = (entry: ApiJournalEntry) => setEditEntry(entry);
  const handlePost = (entry: ApiJournalEntry) => setPostEntry(entry);

  // ── Post journal entry mutation ─────────────────────────
  const postMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiSubmit(`/api/journal-entries/${id}`, 'PUT', { status: 'posted' });
    },
    onSuccess: () => {
      toast.success('Journal entry posted successfully');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      setPostEntry(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to post journal entry');
    },
  });

  const handleSaveDraft = () => {
    setNewEntryDialogOpen(false);
    setEditEntry(null);
    queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
  };

  const handlePostEntry = () => {
    setNewEntryDialogOpen(false);
    setEditEntry(null);
    queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
  };

  const confirmPost = () => {
    if (postEntry) {
      postMutation.mutate(postEntry.id);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading...</p></div>;
  }

  // ── Simplified Mode ──
  if (isSimplified) {
    return (
      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-6"
      >
        <PageHeader
          title={t('journalEntries')}
          description={t('simplifiedJournalDescription')}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs">
                <Settings2 className="h-3 w-3 mr-1" />
                {t('simplifiedMode')}
              </Badge>
              <ExportButton />
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                size="sm"
                onClick={() => setNewEntryDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t('newEntry')}
              </Button>
            </div>
          }
        />

        {/* Summary Dashboard */}
        <SimplifiedAccountingSummary />

        {/* New Simplified Entry Dialog */}
        <Dialog open={newEntryDialogOpen} onOpenChange={setNewEntryDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('newSimplifiedEntry')}</DialogTitle>
              <DialogDescription>{t('newSimplifiedEntryDescription')}</DialogDescription>
            </DialogHeader>
            <SimplifiedJournalEntryForm
              onSave={() => {
                setNewEntryDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
              }}
              onCancel={() => setNewEntryDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  // ── Double-Entry Mode (Original) ──
  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-6"
    >
      <PageHeader
        title={t('journalEntries')}
        description={t('doubleEntryDescription')}
        actions={
          <div className="flex items-center gap-2">
            <ExportButton />
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              size="sm"
              onClick={() => setNewEntryDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t('newEntry')}
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'draft' | 'posted')}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allEntries')}</SelectItem>
            <SelectItem value="draft">{t('draft')}</SelectItem>
            <SelectItem value="posted">{t('posted')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <JournalEntryList statusFilter={statusFilter} onView={handleView} onEdit={handleEdit} onPost={handlePost} />

      <Dialog open={newEntryDialogOpen} onOpenChange={setNewEntryDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('newJournalEntry')}</DialogTitle>
            <DialogDescription>{t('newJournalEntryDescription')}</DialogDescription>
          </DialogHeader>
          <JournalEntryForm onSaveDraft={handleSaveDraft} onPostEntry={handlePostEntry} onCancel={() => setNewEntryDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editEntry} onOpenChange={(open) => !open && setEditEntry(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('editJournalEntry')}</DialogTitle>
            <DialogDescription>{editEntry?.entryNo} — {editEntry?.narration}</DialogDescription>
          </DialogHeader>
          <JournalEntryForm isEditing onSaveDraft={handleSaveDraft} onPostEntry={handlePostEntry} onCancel={() => setEditEntry(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewEntry} onOpenChange={(open) => !open && setViewEntry(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-mono">{viewEntry?.entryNo}</span>
            </DialogTitle>
            <DialogDescription>{viewEntry?.narration}</DialogDescription>
          </DialogHeader>
          {viewEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('date')}:</span>{' '}
                  <span className="font-medium">{formatDate(viewEntry.entryDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('status')}:</span>{' '}
                  <Badge variant="secondary" className={cn('h-5 text-[10px] px-1.5', viewEntry.status === 'posted' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-800/30 text-stone-600 dark:text-stone-400')}>
                    {viewEntry.status === 'posted' ? t('posted') : t('draft')}
                  </Badge>
                </div>
                {viewEntry.referenceType && (
                  <div>
                    <span className="text-muted-foreground">{t('reference')}:</span>{' '}
                    <span className="font-mono text-xs">{viewEntry.referenceType}#{viewEntry.referenceId}</span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-16">{t('code')}</TableHead>
                      <TableHead>{t('account')}</TableHead>
                      <TableHead className="text-right w-28">{t('debit')}</TableHead>
                      <TableHead className="text-right w-28">{t('credit')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewEntry.journalItems.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="font-mono text-xs">{line.account?.code}</TableCell>
                        <TableCell className="text-xs">{line.account?.name}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{Number(line.debit) > 0 ? formatTaka(Number(line.debit)) : '—'}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-600 dark:text-emerald-400">{Number(line.credit) > 0 ? formatTaka(Number(line.credit)) : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                {(() => {
                  const totalD = Number(viewEntry.totalDebit);
                  const totalC = Number(viewEntry.totalCredit);
                  const balanced = Math.abs(totalD - totalC) < 0.01;
                  return (
                    <>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('totalDebit')}</p>
                          <p className="text-sm font-bold font-mono">{formatTaka(totalD)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('totalCredit')}</p>
                          <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatTaka(totalC)}</p>
                        </div>
                      </div>
                      {balanced ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> {t('balanced')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-rose-600 dark:text-rose-400">
                          <XCircle className="h-4 w-4" /> {t('unbalanced')}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!postEntry} onOpenChange={(open) => !open && setPostEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('postJournalEntry')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('postConfirmation')} <span className="font-mono font-medium">{postEntry?.entryNo}</span>?
              {t('postCannotUndo')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={confirmPost}>
              <Send className="h-4 w-4 mr-2" />
              {t('postEntry')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
