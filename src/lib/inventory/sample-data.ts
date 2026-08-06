// ============================================================
// Inventory Sample Data — Realistic Bangladeshi Islamic school context
// ============================================================

/** Format amount in Bengali Taka */
export function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

// ==================== Types ====================

export type ProductCategory = 'Stationery' | 'Books' | 'Uniform' | 'Food' | 'Cleaning' | 'Furniture' | 'Electronics' | 'Misc';
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partially-received' | 'received' | 'cancelled';
export type SaleStatus = 'completed' | 'pending' | 'cancelled';
export type PaymentMethod = 'Cash' | 'bKash' | 'Bank' | 'Credit';
export type StockMovementType = 'in' | 'out';
export type ProductUnit = 'Piece' | 'Kg' | 'Liter' | 'Box' | 'Pack' | 'Dozen' | 'Set';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: ProductUnit;
  description?: string;
}

export interface PurchaseOrderLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: PurchaseOrderLineItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  shipping: number;
  grandTotal: number;
  status: PurchaseOrderStatus;
  notes?: string;
}

export interface SaleLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  items: SaleLineItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
}

export interface StockMovement {
  id: string;
  dateTime: string;
  type: StockMovementType;
  productName: string;
  quantity: number;
  reference: string;
  reason: string;
  balanceAfter: number;
}

// ==================== Helper ====================

export function getStockStatus(product: Product): StockStatus {
  if (product.currentStock <= 0) return 'out-of-stock';
  if (product.currentStock <= product.minStockLevel) return 'low-stock';
  return 'in-stock';
}

export function getCategoryPrefix(category: ProductCategory): string {
  const prefixes: Record<ProductCategory, string> = {
    Stationery: 'STN',
    Books: 'BKS',
    Uniform: 'UNI',
    Food: 'FOD',
    Cleaning: 'CLN',
    Furniture: 'FUR',
    Electronics: 'ELC',
    Misc: 'MIS',
  };
  return prefixes[category];
}

export function generateSKU(category: ProductCategory): string {
  const prefix = getCategoryPrefix(category);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${prefix}-${random}`;
}

// ==================== Category Color Map ====================

export const categoryColorMap: Record<ProductCategory, string> = {
  Stationery: 'sky',
  Books: 'emerald',
  Uniform: 'amber',
  Food: 'violet',
  Cleaning: 'rose',
  Furniture: 'slate',
  Electronics: 'cyan',
  Misc: 'gray',
};

export const categoryColorClasses: Record<ProductCategory, { bg: string; text: string; dot: string }> = {
  Stationery: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-300', dot: 'bg-sky-500' },
  Books: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  Uniform: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  Food: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
  Cleaning: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  Furniture: { bg: 'bg-slate-100 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500' },
  Electronics: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' },
  Misc: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500' },
};

export const stockStatusClasses: Record<StockStatus, { bg: string; text: string; dot: string; label: string }> = {
  'in-stock': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', label: 'In Stock' },
  'low-stock': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', label: 'Low Stock' },
  'out-of-stock': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500', label: 'Out of Stock' },
};

export const poStatusClasses: Record<PurchaseOrderStatus, { bg: string; text: string; dot: string; label: string }> = {
  draft: { bg: 'bg-slate-100 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500', label: 'Draft' },
  ordered: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-300', dot: 'bg-sky-500', label: 'Ordered' },
  'partially-received': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', label: 'Partially Received' },
  received: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', label: 'Received' },
  cancelled: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500', label: 'Cancelled' },
};

export const saleStatusClasses: Record<SaleStatus, { bg: string; text: string; dot: string; label: string }> = {
  completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', label: 'Completed' },
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', label: 'Pending' },
  cancelled: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500', label: 'Cancelled' },
};

export const paymentMethodClasses: Record<PaymentMethod, { bg: string; text: string; dot: string }> = {
  Cash: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  bKash: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-300', dot: 'bg-sky-500' },
  Bank: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
  Credit: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
};

// ==================== Sample Data ====================

export const sampleProducts: Product[] = [
  // Stationery
  { id: 'p1', name: 'Notebook', category: 'Stationery', sku: 'STN-1001', purchasePrice: 45, salePrice: 60, currentStock: 150, minStockLevel: 30, maxStockLevel: 300, unit: 'Piece', description: 'Standard ruled notebook, 180 pages' },
  { id: 'p2', name: 'Pen Set', category: 'Stationery', sku: 'STN-1002', purchasePrice: 25, salePrice: 35, currentStock: 200, minStockLevel: 40, maxStockLevel: 400, unit: 'Pack', description: 'Set of 5 ballpoint pens' },
  { id: 'p3', name: 'Whiteboard Marker', category: 'Stationery', sku: 'STN-1003', purchasePrice: 15, salePrice: 25, currentStock: 80, minStockLevel: 20, maxStockLevel: 150, unit: 'Piece', description: 'Dry-erase marker, assorted colors' },
  { id: 'p4', name: 'Exam Paper', category: 'Stationery', sku: 'STN-1004', purchasePrice: 2, salePrice: 5, currentStock: 500, minStockLevel: 100, maxStockLevel: 1000, unit: 'Piece', description: 'A4 size exam answer sheet' },
  // Books
  { id: 'p5', name: 'Quran (Large)', category: 'Books', sku: 'BKS-2001', purchasePrice: 150, salePrice: 200, currentStock: 30, minStockLevel: 10, maxStockLevel: 100, unit: 'Piece', description: 'Large print Quran with Bengali translation' },
  { id: 'p6', name: 'Arabic Textbook', category: 'Books', sku: 'BKS-2002', purchasePrice: 80, salePrice: 120, currentStock: 45, minStockLevel: 15, maxStockLevel: 100, unit: 'Piece', description: 'Class 6-8 Arabic language textbook' },
  { id: 'p7', name: 'Hadith Book', category: 'Books', sku: 'BKS-2003', purchasePrice: 120, salePrice: 160, currentStock: 25, minStockLevel: 10, maxStockLevel: 80, unit: 'Piece', description: 'Compilation of Sahih Bukhari (abridged)' },
  { id: 'p8', name: 'Bangla Grammar', category: 'Books', sku: 'BKS-2004', purchasePrice: 60, salePrice: 85, currentStock: 50, minStockLevel: 15, maxStockLevel: 100, unit: 'Piece', description: 'Bangla Vyakaran textbook for secondary' },
  // Uniform
  { id: 'p9', name: 'White Panjabi', category: 'Uniform', sku: 'UNI-3001', purchasePrice: 350, salePrice: 500, currentStock: 40, minStockLevel: 10, maxStockLevel: 80, unit: 'Piece', description: 'White cotton panjabi for students' },
  { id: 'p10', name: 'School Cap', category: 'Uniform', sku: 'UNI-3002', purchasePrice: 80, salePrice: 120, currentStock: 60, minStockLevel: 15, maxStockLevel: 120, unit: 'Piece', description: 'White school cap (topi) for students' },
  { id: 'p11', name: 'Badge', category: 'Uniform', sku: 'UNI-3003', purchasePrice: 15, salePrice: 25, currentStock: 100, minStockLevel: 30, maxStockLevel: 200, unit: 'Piece', description: 'School identity badge with monogram' },
  // Food
  { id: 'p12', name: 'Rice (50kg)', category: 'Food', sku: 'FOD-4001', purchasePrice: 2200, salePrice: 2500, currentStock: 10, minStockLevel: 3, maxStockLevel: 30, unit: 'Kg', description: 'Miniket rice, 50 kg sack' },
  { id: 'p13', name: 'Lentils (5kg)', category: 'Food', sku: 'FOD-4002', purchasePrice: 350, salePrice: 420, currentStock: 15, minStockLevel: 5, maxStockLevel: 40, unit: 'Kg', description: 'Red lentils (masoor dal), 5 kg pack' },
  // Cleaning
  { id: 'p14', name: 'Floor Cleaner', category: 'Cleaning', sku: 'CLN-5001', purchasePrice: 120, salePrice: 180, currentStock: 8, minStockLevel: 10, maxStockLevel: 50, unit: 'Liter', description: 'Phenol-based floor cleaner, 5L' },
  { id: 'p15', name: 'Phenyl', category: 'Cleaning', sku: 'CLN-5002', purchasePrice: 80, salePrice: 120, currentStock: 3, minStockLevel: 5, maxStockLevel: 30, unit: 'Liter', description: 'White phenyl for floor disinfectant' },
  // Furniture
  { id: 'p16', name: 'Student Desk', category: 'Furniture', sku: 'FUR-6001', purchasePrice: 1500, salePrice: 2000, currentStock: 0, minStockLevel: 5, maxStockLevel: 50, unit: 'Piece', description: 'Single student desk with bench' },
  { id: 'p17', name: 'Chair', category: 'Furniture', sku: 'FUR-6002', purchasePrice: 600, salePrice: 800, currentStock: 0, minStockLevel: 10, maxStockLevel: 60, unit: 'Piece', description: 'Standard classroom chair' },
  // Electronics
  { id: 'p18', name: 'Ceiling Fan', category: 'Electronics', sku: 'ELC-7001', purchasePrice: 1800, salePrice: 2200, currentStock: 5, minStockLevel: 3, maxStockLevel: 20, unit: 'Piece', description: '56-inch ceiling fan, energy efficient' },
];

export const samplePurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po1',
    poNumber: 'PO-2025-001',
    supplierName: 'Al-Amin Stationery',
    orderDate: '2025-01-05',
    expectedDeliveryDate: '2025-01-15',
    items: [
      { productId: 'p1', productName: 'Notebook', quantity: 200, unitPrice: 45, total: 9000 },
      { productId: 'p2', productName: 'Pen Set', quantity: 100, unitPrice: 25, total: 2500 },
      { productId: 'p3', productName: 'Whiteboard Marker', quantity: 40, unitPrice: 15, total: 600 },
      { productId: 'p4', productName: 'Exam Paper', quantity: 100, unitPrice: 2, total: 200 },
    ],
    subtotal: 12300,
    taxPercent: 0,
    taxAmount: 0,
    shipping: 200,
    grandTotal: 12500,
    status: 'received',
    notes: 'Regular stationery supply for Q1',
  },
  {
    id: 'po2',
    poNumber: 'PO-2025-002',
    supplierName: 'Islamic Book House',
    orderDate: '2025-01-10',
    expectedDeliveryDate: '2025-01-25',
    items: [
      { productId: 'p5', productName: 'Quran (Large)', quantity: 20, unitPrice: 150, total: 3000 },
      { productId: 'p6', productName: 'Arabic Textbook', quantity: 30, unitPrice: 80, total: 2400 },
      { productId: 'p7', productName: 'Hadith Book', quantity: 20, unitPrice: 120, total: 2400 },
    ],
    subtotal: 7800,
    taxPercent: 5,
    taxAmount: 390,
    shipping: 210,
    grandTotal: 8400,
    status: 'ordered',
    notes: 'Book order for new academic session',
  },
  {
    id: 'po3',
    poNumber: 'PO-2025-003',
    supplierName: 'BD Uniform Suppliers',
    orderDate: '2025-01-08',
    expectedDeliveryDate: '2025-01-20',
    items: [
      { productId: 'p9', productName: 'White Panjabi', quantity: 25, unitPrice: 350, total: 8750 },
      { productId: 'p10', productName: 'School Cap', quantity: 50, unitPrice: 80, total: 4000 },
    ],
    subtotal: 12750,
    taxPercent: 15,
    taxAmount: 1913,
    shipping: 337,
    grandTotal: 15000,
    status: 'partially-received',
    notes: 'Partial delivery received — panjabi pending',
  },
  {
    id: 'po4',
    poNumber: 'PO-2025-004',
    supplierName: 'City Furniture',
    orderDate: '2025-02-01',
    expectedDeliveryDate: '2025-02-15',
    items: [
      { productId: 'p16', productName: 'Student Desk', quantity: 30, unitPrice: 1500, total: 45000 },
    ],
    subtotal: 45000,
    taxPercent: 0,
    taxAmount: 0,
    shipping: 0,
    grandTotal: 45000,
    status: 'draft',
    notes: 'Pending approval — new classroom furniture',
  },
  {
    id: 'po5',
    poNumber: 'PO-2025-005',
    supplierName: 'Clean BD',
    orderDate: '2025-01-12',
    expectedDeliveryDate: '2025-01-18',
    items: [
      { productId: 'p14', productName: 'Floor Cleaner', quantity: 10, unitPrice: 120, total: 1200 },
      { productId: 'p15', productName: 'Phenyl', quantity: 15, unitPrice: 80, total: 1200 },
      { productId: 'p14', productName: 'Floor Cleaner', quantity: 5, unitPrice: 120, total: 600 },
    ],
    subtotal: 3000,
    taxPercent: 5,
    taxAmount: 150,
    shipping: 50,
    grandTotal: 3200,
    status: 'cancelled',
    notes: 'Cancelled — supplier delayed beyond acceptable date',
  },
];

export const sampleSales: Sale[] = [
  {
    id: 's1',
    invoiceNo: 'SL-2025-001',
    date: '2025-01-15',
    customerName: 'Walk-in Customer',
    items: [
      { productId: 'p1', productName: 'Notebook', quantity: 10, unitPrice: 60, total: 600 },
      { productId: 'p2', productName: 'Pen Set', quantity: 5, unitPrice: 35, total: 175 },
    ],
    subtotal: 775,
    discount: 0,
    grandTotal: 775,
    paymentMethod: 'Cash',
    status: 'completed',
  },
  {
    id: 's2',
    invoiceNo: 'SL-2025-002',
    date: '2025-01-16',
    customerName: 'Abdul Karim',
    customerPhone: '01712345678',
    items: [
      { productId: 'p5', productName: 'Quran (Large)', quantity: 5, unitPrice: 200, total: 1000 },
      { productId: 'p7', productName: 'Hadith Book', quantity: 3, unitPrice: 160, total: 480 },
    ],
    subtotal: 1480,
    discount: 80,
    grandTotal: 1400,
    paymentMethod: 'bKash',
    status: 'completed',
  },
  {
    id: 's3',
    invoiceNo: 'SL-2025-003',
    date: '2025-01-18',
    customerName: 'Walk-in Customer',
    items: [
      { productId: 'p9', productName: 'White Panjabi', quantity: 2, unitPrice: 500, total: 1000 },
      { productId: 'p10', productName: 'School Cap', quantity: 2, unitPrice: 120, total: 240 },
      { productId: 'p11', productName: 'Badge', quantity: 2, unitPrice: 25, total: 50 },
    ],
    subtotal: 1290,
    discount: 0,
    grandTotal: 1290,
    paymentMethod: 'Cash',
    status: 'completed',
  },
  {
    id: 's4',
    invoiceNo: 'SL-2025-004',
    date: '2025-01-20',
    customerName: 'Rahim Store',
    customerPhone: '01898765432',
    items: [
      { productId: 'p1', productName: 'Notebook', quantity: 50, unitPrice: 60, total: 3000 },
      { productId: 'p4', productName: 'Exam Paper', quantity: 200, unitPrice: 5, total: 1000 },
    ],
    subtotal: 4000,
    discount: 200,
    grandTotal: 3800,
    paymentMethod: 'Credit',
    status: 'pending',
  },
  {
    id: 's5',
    invoiceNo: 'SL-2025-005',
    date: '2025-01-22',
    customerName: 'Walk-in Customer',
    items: [
      { productId: 'p6', productName: 'Arabic Textbook', quantity: 3, unitPrice: 120, total: 360 },
      { productId: 'p8', productName: 'Bangla Grammar', quantity: 2, unitPrice: 85, total: 170 },
    ],
    subtotal: 530,
    discount: 0,
    grandTotal: 530,
    paymentMethod: 'Cash',
    status: 'completed',
  },
  {
    id: 's6',
    invoiceNo: 'SL-2025-006',
    date: '2025-01-25',
    customerName: 'Fatima Begum',
    customerPhone: '01611223344',
    items: [
      { productId: 'p9', productName: 'White Panjabi', quantity: 1, unitPrice: 500, total: 500 },
      { productId: 'p10', productName: 'School Cap', quantity: 1, unitPrice: 120, total: 120 },
      { productId: 'p5', productName: 'Quran (Large)', quantity: 1, unitPrice: 200, total: 200 },
    ],
    subtotal: 820,
    discount: 20,
    grandTotal: 800,
    paymentMethod: 'bKash',
    status: 'completed',
  },
];

export const sampleStockMovements: StockMovement[] = [
  { id: 'sm1', dateTime: '2025-01-05 09:00', type: 'in', productName: 'Notebook', quantity: 200, reference: 'PO-2025-001', reason: 'Purchase received', balanceAfter: 350 },
  { id: 'sm2', dateTime: '2025-01-05 09:00', type: 'in', productName: 'Pen Set', quantity: 100, reference: 'PO-2025-001', reason: 'Purchase received', balanceAfter: 300 },
  { id: 'sm3', dateTime: '2025-01-15 11:30', type: 'out', productName: 'Notebook', quantity: 10, reference: 'SL-2025-001', reason: 'Sale to walk-in customer', balanceAfter: 340 },
  { id: 'sm4', dateTime: '2025-01-15 11:30', type: 'out', productName: 'Pen Set', quantity: 5, reference: 'SL-2025-001', reason: 'Sale to walk-in customer', balanceAfter: 295 },
  { id: 'sm5', dateTime: '2025-01-16 14:00', type: 'out', productName: 'Quran (Large)', quantity: 5, reference: 'SL-2025-002', reason: 'Sale to Abdul Karim', balanceAfter: 25 },
  { id: 'sm6', dateTime: '2025-01-18 10:15', type: 'out', productName: 'White Panjabi', quantity: 2, reference: 'SL-2025-003', reason: 'Sale to walk-in customer', balanceAfter: 38 },
  { id: 'sm7', dateTime: '2025-01-18 10:15', type: 'out', productName: 'School Cap', quantity: 2, reference: 'SL-2025-003', reason: 'Sale to walk-in customer', balanceAfter: 58 },
  { id: 'sm8', dateTime: '2025-01-20 16:00', type: 'out', productName: 'Notebook', quantity: 50, reference: 'SL-2025-004', reason: 'Sale to Rahim Store', balanceAfter: 290 },
  { id: 'sm9', dateTime: '2025-01-22 09:30', type: 'out', productName: 'Arabic Textbook', quantity: 3, reference: 'SL-2025-005', reason: 'Sale to walk-in customer', balanceAfter: 42 },
  { id: 'sm10', dateTime: '2025-01-25 13:45', type: 'out', productName: 'White Panjabi', quantity: 1, reference: 'SL-2025-006', reason: 'Sale to Fatima Begum', balanceAfter: 37 },
  { id: 'sm11', dateTime: '2025-01-26 08:00', type: 'in', productName: 'School Cap', quantity: 50, reference: 'PO-2025-003', reason: 'Partial PO receipt', balanceAfter: 108 },
  { id: 'sm12', dateTime: '2025-01-27 10:00', type: 'out', productName: 'Floor Cleaner', quantity: 2, reference: 'Issue', reason: 'Monthly cleaning supply issue', balanceAfter: 6 },
  { id: 'sm13', dateTime: '2025-01-28 09:00', type: 'in', productName: 'Ceiling Fan', quantity: 5, reference: 'PO-2025-001', reason: 'Purchase received (electronics)', balanceAfter: 10 },
  { id: 'sm14', dateTime: '2025-01-29 11:00', type: 'out', productName: 'Exam Paper', quantity: 100, reference: 'Issue', reason: 'Mid-term exam distribution', balanceAfter: 400 },
  { id: 'sm15', dateTime: '2025-01-30 15:30', type: 'out', productName: 'Phenyl', quantity: 1, reference: 'Issue', reason: 'Monthly cleaning supply issue', balanceAfter: 2 },
];

// ==================== Summary Helpers ====================

export function getInventorySummary() {
  const totalStockValue = sampleProducts.reduce((sum, p) => sum + p.purchasePrice * p.currentStock, 0);
  const totalProducts = sampleProducts.length;
  const lowStockItems = sampleProducts.filter(p => getStockStatus(p) === 'low-stock').length;
  const outOfStockItems = sampleProducts.filter(p => getStockStatus(p) === 'out-of-stock').length;
  return { totalStockValue, totalProducts, lowStockItems, outOfStockItems };
}

export function getCategoryStockData() {
  const categories = [...new Set(sampleProducts.map(p => p.category))];
  return categories.map(cat => {
    const products = sampleProducts.filter(p => p.category === cat);
    return {
      category: cat,
      totalStock: products.reduce((sum, p) => sum + p.currentStock, 0),
      minStock: products.reduce((sum, p) => sum + p.minStockLevel, 0),
    };
  });
}
