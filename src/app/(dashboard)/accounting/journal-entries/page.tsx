'use client';

// ============================================================
// Journal Entries Page
// DataTable of journal entries, New/Edit in Dialog,
// View detail, Post confirmation
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  journalEntries,
  formatTaka,
  type JournalEntry,
  type JournalEntryStatus,
} from '@/lib/accounting/sample-data';
import { slideUp } from '@/lib/animations';

export default function JournalEntriesPage() {
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'draft' | 'posted'>('all');
  const [newEntryDialogOpen, setNewEntryDialogOpen] = React.useState(false);
  const [viewEntry, setViewEntry] = React.useState<JournalEntry | null>(null);
  const [editEntry, setEditEntry] = React.useState<JournalEntry | null>(null);
  const [postEntry, setPostEntry] = React.useState<JournalEntry | null>(null);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handlers
  const handleView = (entry: JournalEntry) => setViewEntry(entry);
  const handleEdit = (entry: JournalEntry) => setEditEntry(entry);
  const handlePost = (entry: JournalEntry) => setPostEntry(entry);

  const handleSaveDraft = (values: Record<string, unknown>) => {
    console.log('Save as draft:', values);
    setNewEntryDialogOpen(false);
    setEditEntry(null);
  };

  const handlePostEntry = (values: Record<string, unknown>) => {
    console.log('Post entry:', values);
    setNewEntryDialogOpen(false);
    setEditEntry(null);
  };

  const confirmPost = () => {
    console.log('Confirmed post:', postEntry?.entryNo);
    setPostEntry(null);
  };

  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-6"
    >
      <PageHeader
        title="Journal Entries"
        description="Record and manage double-entry journal transactions"

        actions={
          <div className="flex items-center gap-2">
            <ExportButton />
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              size="sm"
              onClick={() => setNewEntryDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </div>
        }
      />

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as 'all' | 'draft' | 'posted')}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entries</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Journal Entry List */}
      <JournalEntryList
        statusFilter={statusFilter}
        onView={handleView}
        onEdit={handleEdit}
        onPost={handlePost}
      />

      {/* New Entry Dialog */}
      <Dialog open={newEntryDialogOpen} onOpenChange={setNewEntryDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
            <DialogDescription>
              Create a new double-entry journal transaction
            </DialogDescription>
          </DialogHeader>
          <JournalEntryForm
            onSaveDraft={handleSaveDraft}
            onPostEntry={handlePostEntry}
            onCancel={() => setNewEntryDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(open) => !open && setEditEntry(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
            <DialogDescription>
              {editEntry?.entryNo} — {editEntry?.description}
            </DialogDescription>
          </DialogHeader>
          <JournalEntryForm
            defaultValues={editEntry ?? undefined}
            isEditing
            onSaveDraft={handleSaveDraft}
            onPostEntry={handlePostEntry}
            onCancel={() => setEditEntry(null)}
          />
        </DialogContent>
      </Dialog>

      {/* View Entry Detail Dialog */}
      <Dialog open={!!viewEntry} onOpenChange={(open) => !open && setViewEntry(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-mono">{viewEntry?.entryNo}</span>
            </DialogTitle>
            <DialogDescription>{viewEntry?.description}</DialogDescription>
          </DialogHeader>
          {viewEntry && (
            <div className="space-y-4">
              {/* Entry info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>{' '}
                  <span className="font-medium">{formatDate(viewEntry.date)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <Badge
                    variant="secondary"
                    className={cn(
                      'h-5 text-[10px] px-1.5',
                      viewEntry.status === 'posted'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-stone-100 dark:bg-stone-800/30 text-stone-600 dark:text-stone-400'
                    )}
                  >
                    {viewEntry.status === 'posted' ? 'Posted' : 'Draft'}
                  </Badge>
                </div>
                {viewEntry.reference && (
                  <div>
                    <span className="text-muted-foreground">Reference:</span>{' '}
                    <span className="font-mono text-xs">{viewEntry.reference}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Line items */}
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-16">Code</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right w-28">Debit (৳)</TableHead>
                      <TableHead className="text-right w-28">Credit (৳)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewEntry.lineItems.map((line, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">{line.accountCode}</TableCell>
                        <TableCell className="text-xs">{line.accountName}</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {line.debit > 0 ? formatTaka(line.debit) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-600 dark:text-emerald-400">
                          {line.credit > 0 ? formatTaka(line.credit) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                {(() => {
                  const totalD = viewEntry.lineItems.reduce((s, l) => s + l.debit, 0);
                  const totalC = viewEntry.lineItems.reduce((s, l) => s + l.credit, 0);
                  const balanced = totalD === totalC;
                  return (
                    <>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Debit</p>
                          <p className="text-sm font-bold font-mono">{formatTaka(totalD)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Credit</p>
                          <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {formatTaka(totalC)}
                          </p>
                        </div>
                      </div>
                      {balanced ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> Balanced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-rose-600 dark:text-rose-400">
                          <XCircle className="h-4 w-4" /> Unbalanced
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

      {/* Post Confirmation Dialog */}
      <AlertDialog open={!!postEntry} onOpenChange={(open) => !open && setPostEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Post Journal Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to post <span className="font-mono font-medium">{postEntry?.entryNo}</span>?
              This action will make the entry permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={confirmPost}
            >
              <Send className="h-4 w-4 mr-2" />
              Post Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
