export type User = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: "Admin" | "Cashier" | "Manager" | "Waiter" | "Cleaner" | "Security";
  companyCardId: string;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  image: string;
  type: "bottle" | "drum";
  unit: "ml" | "L" | "bottle";
  buyPrice: number;
  sellPrice: number; // For bottles, this is per bottle. For drums, this is per liter.
  thresholdQuantity: number;
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
  quantity: number; // number of bottles or ml
  unitPrice: number; // sell price per unit (bottle or ml)
  buyPrice: number; // buy price per unit (bottle or ml)
  lineTotal: number;
  lineCost: number;
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
  type: "bottle" | "drum";
};

export type Expense = {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  userId: number; // Who recorded it
};
