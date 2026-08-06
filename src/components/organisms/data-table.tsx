'use client';

// ============================================================
// DataTable — Generic TanStack Table wrapper component
// Search, sort, pagination, mobile card view, loading, empty state
// ============================================================

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import EmptyState from '@/components/atoms/empty-state';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchable?: boolean;
  searchPlaceholder?: string;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
  renderCard?: (item: TData) => React.ReactNode;
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  sortable = true,
  paginated = true,
  pageSize = 10,
  onRowClick,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage = 'No data found',
  emptyDescription = 'There are no records to display.',
  className,
  renderCard,
  totalCount,
  currentPage: serverPage,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginated && !totalCount ? getPaginationRowModel() : undefined,
    initialState: { pagination: { pageSize } },
    globalFilterFn: 'includesString',
  });

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : table.getPageCount();
  const currentIdx = serverPage ? serverPage - 1 : table.getState().pagination.pageIndex;

  const pageNumbers = React.useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(0, currentIdx - 2);
    const end = Math.min(totalPages - 1, currentIdx + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [totalPages, currentIdx]);

  const goToPage = (page: number) => {
    if (onPageChange && serverPage) {
      onPageChange(page + 1);
    } else {
      table.setPageIndex(page);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/50">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-3 flex-1" />
            ))}
          </div>
          {Array.from({ length: skeletonRows }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0">
              {Array.from({ length: 4 }).map((_, colIdx) => (
                <Skeleton key={colIdx} className="h-3 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        {searchable && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        )}
        <EmptyState title={emptyMessage} description={emptyDescription} />
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <div className={cn('space-y-3', className)}>
      {searchable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
              aria-label="Search table"
            />
          </div>
        </div>
      )}

      {isMobile && renderCard ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={globalFilter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {rows.map((row) => (
              <div
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  'rounded-xl border border-border bg-card p-4 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-muted/50'
                )}
              >
                {renderCard(row.original)}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.getCanSort() && 'cursor-pointer select-none hover:bg-muted/80'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable && header.column.getCanSort() && (
                          <span className="shrink-0">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      'border-b border-border transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-muted/50'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      )}

      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {currentIdx * pageSize + 1}–{Math.min((currentIdx + 1) * pageSize, totalCount ?? data.length)} of {totalCount ?? data.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(0)} disabled={currentIdx === 0} aria-label="Go to first page">
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentIdx - 1)} disabled={currentIdx === 0} aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={page === currentIdx ? 'default' : 'outline'}
                size="icon"
                className={cn('h-8 w-8', page === currentIdx && 'bg-emerald-600 hover:bg-emerald-700 text-white')}
                onClick={() => goToPage(page)}
              >
                {page + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(currentIdx + 1)} disabled={currentIdx >= totalPages - 1} aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goToPage(totalPages - 1)} disabled={currentIdx >= totalPages - 1} aria-label="Go to last page">
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
