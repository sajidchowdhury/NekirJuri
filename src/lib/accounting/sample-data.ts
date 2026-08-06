// ============================================================
// Accounting Sample Data — Chart of Accounts, Journal Entries,
// and Financial Reports for Madrasha ERP
// ============================================================

/** Format amount in Bengali Taka */
export function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

/** Account type classification */
export type AccountType = 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Equity';

/** Journal entry status */
export type JournalEntryStatus = 'draft' | 'posted';

/** Account type color mapping */
export const accountTypeColors: Record<AccountType, { bg: string; text: string; dot: string }> = {
  Asset: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-300', dot: 'bg-sky-500' },
  Liability: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  Income: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  Expense: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  Equity: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
};

/** Account type icon color class for tree */
export const accountTypeIconColors: Record<AccountType, string> = {
  Asset: 'text-sky-600 dark:text-sky-400',
  Liability: 'text-amber-600 dark:text-amber-400',
  Income: 'text-emerald-600 dark:text-emerald-400',
  Expense: 'text-rose-600 dark:text-rose-400',
  Equity: 'text-violet-600 dark:text-violet-400',
};

/** Chart of Accounts entry */
export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  openingBalance: number;
  description?: string;
  isActive: boolean;
}

/** Journal entry line item */
export interface JournalLineItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

/** Journal entry */
export interface JournalEntry {
  id: string;
  entryNo: string;
  date: string;
  description: string;
  reference?: string;
  lineItems: JournalLineItem[];
  status: JournalEntryStatus;
  createdAt: string;
}

/** Ledger transaction row */
export interface LedgerRow {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

// ============================================================
// Chart of Accounts — 28 accounts
// ============================================================

export const chartOfAccounts: Account[] = [
  // === ASSETS (1xxx) ===
  { id: 'acc-1000', code: '1000', name: 'Current Assets', type: 'Asset', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-1010', code: '1010', name: 'Cash in Hand', type: 'Asset', parentId: 'acc-1000', openingBalance: 50000, isActive: true },
  { id: 'acc-1020', code: '1020', name: 'Bank Account (Sonali Bank)', type: 'Asset', parentId: 'acc-1000', openingBalance: 250000, isActive: true },
  { id: 'acc-1030', code: '1030', name: 'bKash Account', type: 'Asset', parentId: 'acc-1000', openingBalance: 30000, isActive: true },
  { id: 'acc-1040', code: '1040', name: 'Accounts Receivable', type: 'Asset', parentId: 'acc-1000', openingBalance: 0, isActive: true },
  { id: 'acc-1050', code: '1050', name: 'Fee Receivable', type: 'Asset', parentId: 'acc-1000', openingBalance: 0, isActive: true },
  { id: 'acc-1100', code: '1100', name: 'Fixed Assets', type: 'Asset', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-1110', code: '1110', name: 'Building', type: 'Asset', parentId: 'acc-1100', openingBalance: 1500000, isActive: true },
  { id: 'acc-1120', code: '1120', name: 'Furniture & Fixture', type: 'Asset', parentId: 'acc-1100', openingBalance: 120000, isActive: true },
  { id: 'acc-1130', code: '1130', name: 'Equipment', type: 'Asset', parentId: 'acc-1100', openingBalance: 80000, isActive: true },

  // === LIABILITIES (2xxx) ===
  { id: 'acc-2000', code: '2000', name: 'Current Liabilities', type: 'Liability', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-2010', code: '2010', name: 'Accounts Payable', type: 'Liability', parentId: 'acc-2000', openingBalance: 0, isActive: true },
  { id: 'acc-2020', code: '2020', name: 'Salary Payable', type: 'Liability', parentId: 'acc-2000', openingBalance: 0, isActive: true },
  { id: 'acc-2030', code: '2030', name: 'Advance Fee Received', type: 'Liability', parentId: 'acc-2000', openingBalance: 0, isActive: true },
  { id: 'acc-2100', code: '2100', name: 'Long-term Liabilities', type: 'Liability', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-2110', code: '2110', name: 'Loan Payable', type: 'Liability', parentId: 'acc-2100', openingBalance: 300000, isActive: true },

  // === INCOME (3xxx) ===
  { id: 'acc-3000', code: '3000', name: 'Fee Income', type: 'Income', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-3010', code: '3010', name: 'Tuition Fee Income', type: 'Income', parentId: 'acc-3000', openingBalance: 0, isActive: true },
  { id: 'acc-3020', code: '3020', name: 'Admission Fee Income', type: 'Income', parentId: 'acc-3000', openingBalance: 0, isActive: true },
  { id: 'acc-3030', code: '3030', name: 'Exam Fee Income', type: 'Income', parentId: 'acc-3000', openingBalance: 0, isActive: true },
  { id: 'acc-3100', code: '3100', name: 'Donation Income', type: 'Income', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-3200', code: '3200', name: 'Other Income', type: 'Income', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-3210', code: '3210', name: 'Sales Income', type: 'Income', parentId: 'acc-3200', openingBalance: 0, isActive: true },
  { id: 'acc-3220', code: '3220', name: 'Transport Fee Income', type: 'Income', parentId: 'acc-3200', openingBalance: 0, isActive: true },

  // === EXPENSES (4xxx) ===
  { id: 'acc-4000', code: '4000', name: 'Salary Expenses', type: 'Expense', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-4010', code: '4010', name: 'Teacher Salary', type: 'Expense', parentId: 'acc-4000', openingBalance: 0, isActive: true },
  { id: 'acc-4020', code: '4020', name: 'Staff Salary', type: 'Expense', parentId: 'acc-4000', openingBalance: 0, isActive: true },
  { id: 'acc-4100', code: '4100', name: 'Utility Expenses', type: 'Expense', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-4110', code: '4110', name: 'Electricity', type: 'Expense', parentId: 'acc-4100', openingBalance: 0, isActive: true },
  { id: 'acc-4120', code: '4120', name: 'Water', type: 'Expense', parentId: 'acc-4100', openingBalance: 0, isActive: true },
  { id: 'acc-4130', code: '4130', name: 'Gas', type: 'Expense', parentId: 'acc-4100', openingBalance: 0, isActive: true },
  { id: 'acc-4200', code: '4200', name: 'Maintenance Expenses', type: 'Expense', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-4300', code: '4300', name: 'Stationery & Supplies', type: 'Expense', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-4400', code: '4400', name: 'Food Expenses', type: 'Expense', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-4500', code: '4500', name: 'Transport Expenses', type: 'Expense', parentId: null, openingBalance: 0, isActive: true },
  { id: 'acc-4600', code: '4600', name: 'Admin Expenses', type: 'Expense', parentId: null, openingBalance: 0, isActive: true },

  // === EQUITY (5xxx) ===
  { id: 'acc-5000', code: '5000', name: 'Retained Earnings', type: 'Equity', parentId: null, openingBalance: 1630000, isActive: true },
  { id: 'acc-5100', code: '5100', name: 'Surplus Fund', type: 'Equity', parentId: null, openingBalance: 0, isActive: true },
];

// ============================================================
// Journal Entries — 8 entries
// ============================================================

export const journalEntries: JournalEntry[] = [
  {
    id: 'je-001',
    entryNo: 'JE-2025-001',
    date: '2025-01-05',
    description: 'Fee collection for January 2025',
    reference: 'FEE-JAN-2025',
    lineItems: [
      { accountId: 'acc-1010', accountCode: '1010', accountName: 'Cash in Hand', debit: 45000, credit: 0 },
      { accountId: 'acc-3010', accountCode: '3010', accountName: 'Tuition Fee Income', debit: 0, credit: 45000 },
    ],
    status: 'posted',
    createdAt: '2025-01-05T09:30:00',
  },
  {
    id: 'je-002',
    entryNo: 'JE-2025-002',
    date: '2025-01-10',
    description: 'Teacher salary payment for January 2025',
    reference: 'SAL-TEACH-JAN',
    lineItems: [
      { accountId: 'acc-4010', accountCode: '4010', accountName: 'Teacher Salary', debit: 172000, credit: 0 },
      { accountId: 'acc-1010', accountCode: '1010', accountName: 'Cash in Hand', debit: 0, credit: 172000 },
    ],
    status: 'posted',
    createdAt: '2025-01-10T10:00:00',
  },
  {
    id: 'je-003',
    entryNo: 'JE-2025-003',
    date: '2025-01-12',
    description: 'Utility payment — Electricity and Water bills',
    reference: 'UTIL-JAN-2025',
    lineItems: [
      { accountId: 'acc-4110', accountCode: '4110', accountName: 'Electricity', debit: 15000, credit: 0 },
      { accountId: 'acc-4120', accountCode: '4120', accountName: 'Water', debit: 3000, credit: 0 },
      { accountId: 'acc-1020', accountCode: '1020', accountName: 'Bank Account (Sonali Bank)', debit: 0, credit: 18000 },
    ],
    status: 'posted',
    createdAt: '2025-01-12T11:30:00',
  },
  {
    id: 'je-004',
    entryNo: 'JE-2025-004',
    date: '2025-01-15',
    description: 'Donation received via bKash',
    reference: 'DON-BKASH-001',
    lineItems: [
      { accountId: 'acc-1030', accountCode: '1030', accountName: 'bKash Account', debit: 25000, credit: 0 },
      { accountId: 'acc-3100', accountCode: '3100', accountName: 'Donation Income', debit: 0, credit: 25000 },
    ],
    status: 'posted',
    createdAt: '2025-01-15T14:00:00',
  },
  {
    id: 'je-005',
    entryNo: 'JE-2025-005',
    date: '2025-01-18',
    description: 'Stationery and supplies purchase',
    reference: 'PUR-STAT-001',
    lineItems: [
      { accountId: 'acc-4300', accountCode: '4300', accountName: 'Stationery & Supplies', debit: 8000, credit: 0 },
      { accountId: 'acc-1010', accountCode: '1010', accountName: 'Cash in Hand', debit: 0, credit: 8000 },
    ],
    status: 'posted',
    createdAt: '2025-01-18T09:00:00',
  },
  {
    id: 'je-006',
    entryNo: 'JE-2025-006',
    date: '2025-01-20',
    description: 'Staff salary payment for January 2025',
    reference: 'SAL-STAFF-JAN',
    lineItems: [
      { accountId: 'acc-4020', accountCode: '4020', accountName: 'Staff Salary', debit: 44500, credit: 0 },
      { accountId: 'acc-1020', accountCode: '1020', accountName: 'Bank Account (Sonali Bank)', debit: 0, credit: 44500 },
    ],
    status: 'posted',
    createdAt: '2025-01-20T10:00:00',
  },
  {
    id: 'je-007',
    entryNo: 'JE-2025-007',
    date: '2025-01-22',
    description: 'Food expenses for hostel students',
    reference: 'FOOD-JAN-2025',
    lineItems: [
      { accountId: 'acc-4400', accountCode: '4400', accountName: 'Food Expenses', debit: 12000, credit: 0 },
      { accountId: 'acc-1010', accountCode: '1010', accountName: 'Cash in Hand', debit: 0, credit: 12000 },
    ],
    status: 'posted',
    createdAt: '2025-01-22T12:00:00',
  },
  {
    id: 'je-008',
    entryNo: 'JE-2025-008',
    date: '2025-01-25',
    description: 'Advance fee received for next quarter',
    reference: 'ADV-FEE-001',
    lineItems: [
      { accountId: 'acc-1010', accountCode: '1010', accountName: 'Cash in Hand', debit: 20000, credit: 0 },
      { accountId: 'acc-2030', accountCode: '2030', accountName: 'Advance Fee Received', debit: 0, credit: 20000 },
    ],
    status: 'draft',
    createdAt: '2025-01-25T15:00:00',
  },
];

// ============================================================
// Helper Functions
// ============================================================

/** Get account by ID */
export function getAccountById(id: string): Account | undefined {
  return chartOfAccounts.find(a => a.id === id);
}

/** Get child accounts for a parent */
export function getChildAccounts(parentId: string): Account[] {
  return chartOfAccounts.filter(a => a.parentId === parentId);
}

/** Get accounts by type */
export function getAccountsByType(type: AccountType): Account[] {
  return chartOfAccounts.filter(a => a.type === type);
}

/** Get top-level accounts (no parent) for a given type */
export function getTopLevelAccounts(type: AccountType): Account[] {
  return chartOfAccounts.filter(a => a.type === type && a.parentId === null);
}

/** Calculate current balance for an account including journal entries */
export function calculateAccountBalance(accountId: string): number {
  const account = getAccountById(accountId);
  if (!account) return 0;

  let balance = account.openingBalance;

  // Process all posted journal entries
  for (const entry of journalEntries) {
    if (entry.status !== 'posted') continue;
    for (const line of entry.lineItems) {
      if (line.accountId === accountId) {
        // For assets and expenses: debit adds, credit subtracts
        // For liabilities, income, equity: credit adds, debit subtracts
        if (account.type === 'Asset' || account.type === 'Expense') {
          balance += line.debit - line.credit;
        } else {
          balance += line.credit - line.debit;
        }
      }
    }
  }

  return balance;
}

/** Generate ledger rows for an account */
export function generateLedger(accountId: string): LedgerRow[] {
  const account = getAccountById(accountId);
  if (!account) return [];

  const rows: LedgerRow[] = [];

  // Opening balance row
  let runningBalance = account.openingBalance;
  rows.push({
    date: '2025-01-01',
    description: 'Opening Balance',
    debit: 0,
    credit: 0,
    balance: runningBalance,
  });

  // Process posted journal entries for this account
  const relevantEntries = journalEntries
    .filter(e => e.status === 'posted' && e.lineItems.some(l => l.accountId === accountId))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const entry of relevantEntries) {
    for (const line of entry.lineItems) {
      if (line.accountId === accountId) {
        if (account.type === 'Asset' || account.type === 'Expense') {
          runningBalance += line.debit - line.credit;
        } else {
          runningBalance += line.credit - line.debit;
        }
        rows.push({
          date: entry.date,
          description: entry.description,
          debit: line.debit,
          credit: line.credit,
          balance: runningBalance,
        });
      }
    }
  }

  return rows;
}

/** Get total debit/credit for an account from all posted entries */
export function getAccountTotals(accountId: string): { totalDebit: number; totalCredit: number } {
  let totalDebit = 0;
  let totalCredit = 0;

  for (const entry of journalEntries) {
    if (entry.status !== 'posted') continue;
    for (const line of entry.lineItems) {
      if (line.accountId === accountId) {
        totalDebit += line.debit;
        totalCredit += line.credit;
      }
    }
  }

  return { totalDebit, totalCredit };
}

/** Get all leaf accounts (accounts with no children) */
export function getLeafAccounts(): Account[] {
  const parentIds = new Set(chartOfAccounts.filter(a => a.parentId !== null).map(a => a.parentId!));
  return chartOfAccounts.filter(a => !parentIds.has(a.id));
}

/** Account type labels for Bengali context */
export const accountTypeLabels: Record<AccountType, string> = {
  Asset: 'Assets (সম্পত্তি)',
  Liability: 'Liabilities (দায়)',
  Income: 'Income (আয়)',
  Expense: 'Expenses (ব্যয়)',
  Equity: 'Equity (মূলধন)',
};
