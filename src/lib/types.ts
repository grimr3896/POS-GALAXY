
export type User = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: "Admin" | "Cashier" | "Manager" | "Waiter" | "Cleaner" | "Security";
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
  unit: "ml" | "L" | "bottle";
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
  pourSizeML?: number;
};

export type Transaction = {
  id: string;
  timestamp: string;
  userId: number;
  items: TransactionItem[];
  totalAmount: number;
  totalCost: number;
  profit: number;
  tax: number;
  discount: number;
  paymentMethod: "Cash" | "Card";
  status: "Completed" | "Suspended" | "Cancelled" | "Reversed";
  isBackdated?: boolean;
};

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
