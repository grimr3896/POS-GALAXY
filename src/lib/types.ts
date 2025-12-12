

export type User = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: "Admin" | "Manager" | "Cashier" | "Waiter" | "Inventory Clerk" | "Security";
  companyCardId: string;
};

export type ProductPourVariant = {
  id: number;
  name: string; // e.g., "1/4 L"
  pourSizeML: number;
  sellPrice: number;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  image: string;
  type: "bottle" | "drum";
  buyPrice: number; // For drums, this is cost per ml
  sellPrice: number; // For bottles
  thresholdQuantity: number; // In units for bottles, in ml for drums
  pourVariants?: ProductPourVariant[];
};


export type InventoryItem = {
  id: number;
  productId: number;
  // For bottles
  quantityUnits?: number;
  // For drums
  capacityML?: number;
  currentML?: number;
  lastRestockAt: string;
};

export type TransactionItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number; // number of bottles or pour units
  unitPrice: number; // sell price per unit (bottle or pour variant)
  buyPrice: number; // buy price per unit (bottle or pour variant)
  lineTotal: number;
  lineCost: number;
  lineTax: number;
  pourSizeML?: number;
};

export type Transaction = {
  id: string;
  timestamp: string;
  userId: number;
  items: TransactionItem[];
  total: number;
  totalTax: number;
  amountReceived: number;
  cashAmount: number;
  mpesaAmount: number;
  change: number;
  totalCost: number;
  profit: number;
  discount: number;
  paymentMethod: "Cash" | "Mpesa" | "Split";
  status: "Completed" | "Suspended" | "Cancelled" | "Reversed" | "Archived";
  isBackdated?: boolean;
};

export type DailyReport = {
    id: string;
    date: string;
    totalSales: number;
    totalProfit: number;
    totalCost: number;
    totalTransactions: number;
    paymentSummary: {
        cash: number;
        mpesa: number;
        split: number;
    };
    transactions: Transaction[];
}

export type SuspendedOrder = {
  id: string;
  createdAt: string;
  createdBy: number;
  items: OrderItem[];
};

export type OrderItem = {
  id: string; // Unique ID for the item in the order
  productId: number;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  buyPrice: number;
  totalPrice: number;
  type: "bottle" | "pour"; // Order items are either bottles or specific pours
  pourSizeML?: number;
};

export type Expense = {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  userId: number; // Who recorded it
};

export type AppSettings = {
    appName: string;
    currency: string;
    idleTimeout: number;
    vatRate: number;
    masterPassword?: string;
}

export type Permission = 
  // POS
  | 'pos:create' | 'pos:read' | 'pos:update' | 'pos:delete' | 'pos:void' | 'pos:discount' | 'pos:refund'
  // Inventory
  | 'inventory:create' | 'inventory:read' | 'inventory:update' | 'inventory:delete' | 'inventory:adjust'
  // Sales
  | 'sales:read_all' | 'sales:export' | 'sales:analytics' | 'sales:read_own'
  // Employees
  | 'employees:create' | 'employees:read' | 'employees:update' | 'employees:delete' | 'employees:assign'
  // Settings
  | 'settings:read' | 'settings:update'
  // General Page Access
  | 'page:dashboard' | 'page:pos' | 'page:inventory' | 'page:sales-history' | 'page:expenses' | 'page:reports' | 'page:employees' | 'page:settings';

export type Role = "Admin" | "Manager" | "Cashier" | "Waiter" | "Inventory Clerk" | "Security";

export const rolePermissions: Record<Role, Permission[]> = {
  Admin: [
    'page:dashboard', 'page:pos', 'page:inventory', 'page:sales-history', 'page:expenses', 'page:reports', 'page:employees', 'page:settings',
    'pos:create', 'pos:read', 'pos:update', 'pos:delete', 'pos:void', 'pos:discount', 'pos:refund',
    'inventory:create', 'inventory:read', 'inventory:update', 'inventory:delete', 'inventory:adjust',
    'sales:read_all', 'sales:export', 'sales:analytics', 'sales:read_own',
    'employees:create', 'employees:read', 'employees:update', 'employees:delete', 'employees:assign',
    'settings:read', 'settings:update',
  ],
  Manager: [
    'page:dashboard', 'page:pos', 'page:inventory', 'page:sales-history', 'page:expenses', 'page:reports', 'page:employees',
    'pos:create', 'pos:read', 'pos:update', 'pos:discount', 'pos:refund',
    'inventory:create', 'inventory:read', 'inventory:update', 'inventory:adjust',
    'sales:read_all', 'sales:export', 'sales:analytics', 'sales:read_own',
    'employees:read',
    'settings:read',
  ],
  Cashier: [
    'page:dashboard', 'page:pos', 'page:inventory', 'page:sales-history', 'page:reports', 'page:expenses',
    'pos:create', 'pos:read',
    'inventory:read',
    'sales:read_own',
  ],
  Waiter: [
    'page:pos', 'page:inventory', 'page:sales-history',
    'pos:create', 'pos:read',
    'inventory:read',
    'sales:read_own',
  ],
  "Inventory Clerk": [
    'page:inventory', 'page:reports',
    'inventory:create', 'inventory:read', 'inventory:update', 'inventory:delete', 'inventory:adjust',
    'sales:read_all', // For reorder reports
  ],
  Security: [
    'page:pos',
    'pos:read', // Monitor transactions
  ],
};
