
"use client";

import type { User, Product, InventoryItem, Transaction, OrderItem, TransactionItem, SuspendedOrder, Expense, ProductPourVariant } from "./types";
import { PlaceHolderImages } from "./placeholder-images";
import { getUUID } from "@/lib/utils";

// --- Seed Data ---
const seedUsers: User[] = [
  { id: 1, name: "Admin User", email: "admin@galaxyinn.com", phone: "0712345678", role: "Admin", companyCardId: "1001" },
  { id: 2, name: "Cashier One", email: "cashier1@galaxyinn.com", phone: "0787654321", role: "Cashier", companyCardId: "1002" },
  { id: 3, name: "Manager Mike", email: "manager@galaxyinn.com", phone: "0722000000", role: "Manager", companyCardId: "1003" },
  { id: 4, name: "Waiter Wendy", email: "waiter@galaxyinn.com", phone: "0733000000", role: "Waiter", companyCardId: "1004" },
  { id: 5, name: "Stocker Steve", email: "stock@galaxyinn.com", phone: "0744000000", role: "Inventory Clerk", companyCardId: "1005" },
  { id: 6, name: "Guard George", email: "security@galaxyinn.com", phone: "0755000000", role: "Security", companyCardId: "1006" },
];

const seedProducts: Product[] = [
  { id: 1, sku: "GUIN330", name: "Guinness", image: PlaceHolderImages.find(p => p.id === 'guinness')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 150, sellPrice: 300, thresholdQuantity: 10 },
  { id: 2, sku: "TASC500", name: "Tascar", image: PlaceHolderImages.find(p => p.id === 'tascar')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 120, sellPrice: 250, thresholdQuantity: 10 },
  { id: 3, sku: "VODK750", name: "Vodka", image: PlaceHolderImages.find(p => p.id === 'vodka')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 800, sellPrice: 1500, thresholdQuantity: 5 },
  { id: 4, sku: "COKE500", name: "Coca-Cola", image: PlaceHolderImages.find(p => p.id === 'coke')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 40, sellPrice: 80, thresholdQuantity: 20 },
  { id: 5, sku: "WTR1000", name: "Mineral Water", image: PlaceHolderImages.find(p => p.id === 'water')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 50, sellPrice: 100, thresholdQuantity: 20 },
  
  // Drum Products with pour variants
  { 
    id: 6, 
    sku: "WHISKEYD", 
    name: "Whiskey", 
    image: PlaceHolderImages.find(p => p.id === 'whiskey-drum')?.imageUrl || '', 
    type: "drum", 
    unit: "L", 
    buyPrice: 0.4, // Price per ML (e.g. 20,000 KSH for 50L drum = 0.4 KSH/ml)
    sellPrice: 0, 
    thresholdQuantity: 5000, // 5L
    pourVariants: [
        { id: 1, name: "1/4 L", pourSizeML: 250, sellPrice: 250 },
        { id: 2, name: "1/2 L", pourSizeML: 500, sellPrice: 450 },
        { id: 3, name: "1 L", pourSizeML: 1000, sellPrice: 850 },
    ]
  },
  { 
    id: 7, 
    sku: "VODKAD", 
    name: "Vodka", 
    image: PlaceHolderImages.find(p => p.id === 'vodka-drum')?.imageUrl || '', 
    type: "drum", 
    unit: "L", 
    buyPrice: 0.3, // Price per ML (e.g. 4,500 KSH for 15L drum = 0.3 KSH/ml)
    sellPrice: 0, 
    thresholdQuantity: 3000, // 3L
    pourVariants: [
        { id: 1, name: "1/4 L", pourSizeML: 250, sellPrice: 220 },
        { id: 2, name: "1/2 L", pourSizeML: 500, sellPrice: 400 },
        { id: 3, name: "1 L", pourSizeML: 1000, sellPrice: 750 },
    ]
  },
];


const seedInventory: InventoryItem[] = [
  { id: 1, productId: 1, quantityUnits: 50, lastRestockAt: new Date().toISOString() },
  { id: 2, productId: 2, quantityUnits: 40, lastRestockAt: new Date().toISOString() },
  { id: 3, productId: 3, quantityUnits: 12, lastRestockAt: new Date().toISOString() },
  { id: 4, productId: 4, quantityUnits: 100, lastRestockAt: new Date().toISOString() },
  { id: 5, productId: 5, quantityUnits: 80, lastRestockAt: new Date().toISOString() },
  // Drum Inventory is linked to the PARENT product ID
  { id: 6, productId: 6, capacityML: 50000, currentML: 49750, lastRestockAt: new Date().toISOString() },
  { id: 7, productId: 7, capacityML: 15000, currentML: 15000, lastRestockAt: new Date().toISOString() },
];

const seedExpenses: Expense[] = [
    { id: 1, date: new Date().toISOString(), description: 'Electricity Bill', amount: 5000, category: 'Utilities', userId: 1 },
    { id: 2, date: new Date().toISOString(), description: 'Cleaning Supplies', amount: 1200, category: 'Supplies', userId: 1 },
];


// --- LocalStorage Wrapper ---
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
  }
  // If item is not found or parsing fails, set the default value in storage
  window.localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
};

const saveToStorage = <T,>(key: string, value: T) => {
  if (typeof window === "undefined") return;
  try {
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

// Initialize if not present
const initStorage = () => {
  if (typeof window !== "undefined" && !window.localStorage.getItem("pos_initialized")) {
    saveToStorage("users", seedUsers);
    saveToStorage("products", seedProducts);
    saveToStorage("inventory", seedInventory);
    saveToStorage("transactions", []);
    saveToStorage("suspended_orders", []);
    saveToStorage("expenses", seedExpenses);
    window.localStorage.setItem("pos_initialized", "true");
  }
};
initStorage();

// --- API Functions ---

// Users
export const getUsers = (): User[] => getFromStorage("users", seedUsers);
export const findUserByCardId = (cardId: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.companyCardId === cardId);
};
export const saveUser = (userData: Omit<User, 'id'> & { id?: number }): User => {
    const users = getUsers();
    if (userData.id) { // Update
        const userIndex = users.findIndex(u => u.id === userData.id);
        if (userIndex > -1) {
            users[userIndex] = { ...users[userIndex], ...userData };
            saveToStorage("users", users);
            return users[userIndex];
        }
        throw new Error("User not found");
    } else { // Create
        const newId = (users.reduce((maxId, u) => Math.max(u.id, maxId), 0)) + 1;
        const newUser: User = { ...userData, id: newId };
        users.push(newUser);
        saveToStorage("users", users);
        return newUser;
    }
};
export const deleteUser = (userId: number): void => {
    let users = getUsers();
    users = users.filter(u => u.id !== userId);
    saveToStorage("users", users);
};


// Products & Inventory
export const getProducts = (): Product[] => getFromStorage("products", seedProducts);
export const getInventory = (): InventoryItem[] => getFromStorage("inventory", seedInventory);

export const getProductsWithInventory = () => {
    const products = getProducts();
    const inventory = getInventory();
    return products.map(p => {
        const inv = inventory.find(i => i.productId === p.id);
        return { ...p, inventory: inv };
    });
}

export const saveProduct = (productData: Omit<Product, 'id'> & { inventory?: InventoryItem, id?: number }): Product => {
  const products = getProducts();
  const inventory = getInventory();
  const defaultImage = "https://picsum.photos/seed/placeholder/400/400";

  if (productData.id) { // Update existing product
    const productIndex = products.findIndex(p => p.id === productData.id);
    if (productIndex !== -1) {
      const { inventory: inventoryData, ...updatedProduct } = productData;
      products[productIndex] = { 
          ...products[productIndex], 
          ...updatedProduct, 
          image: productData.image || products[productIndex].image || defaultImage 
      };
      
      if (inventoryData) {
        const invIndex = inventory.findIndex(i => i.productId === productData.id);
        if (invIndex !== -1) {
          inventory[invIndex] = { ...inventory[invIndex], ...inventoryData };
        }
      }
    }
    saveToStorage("products", products);
    saveToStorage("inventory", inventory);
    return products[productIndex];
  } else { // Create new product
    const newId = (products.reduce((maxId, p) => Math.max(p.id, maxId), 0)) + 1;
    const { inventory: inventoryData, ...newProductData } = productData;
    
    const newProduct: Product = {
      ...newProductData,
      id: newId,
      image: productData.image || defaultImage,
      pourVariants: productData.type === 'drum' ? (productData.pourVariants || []).map((v, i) => ({...v, id: i, name: v.name || `${v.pourSizeML}ml` })) : undefined,
    };
    products.push(newProduct);
    
    const newInventoryItem: InventoryItem = {
      id: newId,
      productId: newId,
      quantityUnits: inventoryData?.quantityUnits || 0,
      capacityML: inventoryData?.capacityML || 0,
      currentML: inventoryData?.currentML || 0,
      lastRestockAt: new Date().toISOString(),
    };
    inventory.push(newInventoryItem);
    
    saveToStorage("products", products);
    saveToStorage("inventory", inventory);
    return newProduct;
  }
};

export const deleteProduct = (productId: number) => {
  let products = getProducts();
  let inventory = getInventory();

  products = products.filter(p => p.id !== productId);
  inventory = inventory.filter(i => i.productId !== productId);

  saveToStorage("products", products);
  saveToStorage("inventory", inventory);
};


// Transactions
export const getTransactions = (): Transaction[] => getFromStorage("transactions", []);

const calculateLineCost = (item: OrderItem | TransactionItem, product: Product): number => {
    if (product.type === 'drum' && item.pourSizeML) {
        return product.buyPrice * item.pourSizeML * item.quantity;
    }
    return product.buyPrice * item.quantity;
};


export const saveTransaction = (
    userId: number, 
    items: (OrderItem | TransactionItem)[], 
    paymentMethod: 'Cash' | 'Mpesa',
    options: { transactionDate?: Date, isBackdated?: boolean } = {}
): Transaction => {
    const transactions = getTransactions();
    const inventory = getInventory();
    const allProducts = getProducts();
    
    const transactionItems: TransactionItem[] = items.map((item, index) => {
        const product = allProducts.find(p => p.id === item.productId);
        if (!product) throw new Error(`Product with ID ${item.productId} not found during transaction save.`);

        const lineTotal = item.totalPrice || (item.quantity * item.unitPrice);
        const lineCost = calculateLineCost(item, product);

        return {
            id: parseInt(`${Date.now()}${index}`),
            productId: item.productId,
            productName: item.name || ('productName' in item ? item.productName : 'Unknown'),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            buyPrice: product.buyPrice,
            lineTotal: lineTotal,
            lineCost: lineCost,
            pourSizeML: item.pourSizeML,
        }
    });
    
    const subtotal = transactionItems.reduce((acc, item) => acc + item.lineTotal, 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    const totalCost = transactionItems.reduce((acc, item) => acc + item.lineCost, 0);
    const profit = subtotal - totalCost;

    const transactionTimestamp = options.transactionDate ? options.transactionDate.toISOString() : new Date().toISOString();

    const newTransaction: Transaction = {
        id: `TXN-${Date.now()}`,
        timestamp: transactionTimestamp,
        userId,
        items: transactionItems,
        subtotal,
        tax,
        total,
        totalCost,
        profit,
        discount: 0,
        paymentMethod,
        status: "Completed",
        isBackdated: options.isBackdated || false,
    };

    // Update inventory ONLY if it's not a backdated transaction
    if (!newTransaction.isBackdated) {
        items.forEach(item => {
            const product = allProducts.find(p => p.id === item.productId);
            if (!product) return;

            if (product.type === 'bottle') {
                const invItem = inventory.find(i => i.productId === item.productId);
                if (invItem && invItem.quantityUnits !== undefined) {
                    invItem.quantityUnits -= item.quantity;
                }
            } else if (product.type === 'drum' && item.pourSizeML) {
                 const drumInvItem = inventory.find(i => i.productId === item.productId);
                 if (drumInvItem && drumInvItem.currentML !== undefined) {
                    const totalMLDeducted = item.pourSizeML * item.quantity;
                    drumInvItem.currentML -= totalMLDeducted;
                 }
            }
        });
        saveToStorage("inventory", inventory);
    }

    transactions.unshift(newTransaction);
    saveToStorage("transactions", transactions);

    return newTransaction;
}

export const reverseTransaction = (transactionId: string): OrderItem[] => {
    const transactions = getTransactions();
    const inventory = getInventory();
    const allProducts = getProducts();
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);

    if (transactionIndex === -1) {
        throw new Error("Transaction not found.");
    }
    
    const transaction = transactions[transactionIndex];
    if (transaction.status === "Reversed") {
        throw new Error("Transaction has already been reversed.");
    }

    // 1. Restore stock ONLY if it was not a backdated transaction
    if (!transaction.isBackdated) {
      transaction.items.forEach(item => {
          const productDetails = allProducts.find(p => p.id === item.productId);
          if (!productDetails) return;

          if (productDetails.type === 'bottle') {
              const invItem = inventory.find(i => i.productId === item.productId);
              if (invItem && invItem.quantityUnits !== undefined) {
                  invItem.quantityUnits += item.quantity;
              }
          } else if (productDetails.type === 'drum' && item.pourSizeML) {
              const drumInvItem = inventory.find(i => i.productId === item.productId);
              if (drumInvItem && drumInvItem.currentML !== undefined) {
                  const totalMLRestored = item.pourSizeML * item.quantity;
                  drumInvItem.currentML += totalMLRestored;
              }
          }
      });
    }

    // 2. Mark original transaction as reversed
    transactions[transactionIndex].status = 'Reversed';

    saveToStorage("inventory", inventory);
    saveToStorage("transactions", transactions);

    // 3. Create a new editable order for the POS
    return transaction.items.map(item => {
        const product = allProducts.find(p => p.id === item.productId);
        if (!product) {
            // This should ideally not happen if data is consistent
             return {
                id: getUUID(),
                productId: item.productId,
                name: item.productName,
                image: '',
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                buyPrice: item.buyPrice,
                totalPrice: item.lineTotal,
                type: 'bottle', // fallback type
            };
        }
        
        if (product.type === 'drum' && item.pourSizeML) {
             const variant = product.pourVariants?.find(v => v.pourSizeML === item.pourSizeML);
             return {
                id: getUUID(),
                productId: product.id,
                name: `${product.name} (${variant?.name || ''})`,
                image: product.image,
                quantity: item.quantity,
                unitPrice: variant?.sellPrice || 0,
                buyPrice: product.buyPrice, // This is now per-ml
                totalPrice: item.lineTotal,
                type: 'pour',
                pourSizeML: item.pourSizeML,
             }
        }

        return {
            id: getUUID(),
            productId: product.id,
            name: item.productName,
            image: product.image,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            buyPrice: product.buyPrice,
            totalPrice: item.lineTotal,
            type: 'bottle'
        };
    });
};

// Suspended Orders
export const getSuspendedOrders = (): SuspendedOrder[] => getFromStorage("suspended_orders", []);
export const saveSuspendedOrder = (order: SuspendedOrder) => {
    const orders = getSuspendedOrders();
    orders.push(order);
    saveToStorage("suspended_orders", orders);
};
export const removeSuspendedOrder = (orderId: string) => {
    const orders = getSuspendedOrders();
    const updatedOrders = orders.filter(o => o.id !== orderId);
    saveToStorage("suspended_orders", updatedOrders);
};

// Expenses
export const getExpenses = (): Expense[] => getFromStorage("expenses", seedExpenses);
export const saveExpense = (expenseData: Omit<Expense, 'id'> & { id?: number }): Expense => {
    const expenses = getExpenses();
    if (expenseData.id) { // Update
        const expenseIndex = expenses.findIndex(e => e.id === expenseData.id);
        if (expenseIndex > -1) {
            expenses[expenseIndex] = { ...expenses[expenseIndex], ...expenseData };
            saveToStorage("expenses", expenses);
            return expenses[expenseIndex];
        }
        throw new Error("Expense not found");
    } else { // Create
        const newId = (expenses.reduce((maxId, e) => Math.max(e.id, maxId), 0)) + 1;
        const newExpense: Expense = { ...expenseData, id: newId };
        expenses.unshift(newExpense);
        saveToStorage("expenses", expenses);
        return newExpense;
    }
};
export const deleteExpense = (expenseId: number): void => {
    let expenses = getExpenses();
    expenses = expenses.filter(e => e.id !== expenseId);
    saveToStorage("expenses", expenses);
};


// Dashboard
export const getDashboardData = () => {
    const transactions = getTransactions();
    const products = getProductsWithInventory();
    const suspendedOrders = getSuspendedOrders();
    
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = transactions.filter(t => t.timestamp.startsWith(today) && t.status === 'Completed');
    
    const initialState = {
        todaysSales: 0,
        todaysProfit: 0,
        salesByProduct: {} as Record<string, number>,
        profitByProduct: {} as Record<string, number>
    };

    const dailyStats = todaysTransactions.reduce((acc, t) => {
        acc.todaysSales += t.subtotal;
        acc.todaysProfit += t.profit || 0;

        t.items.forEach(item => {
            const productName = item.productName;
            const itemProfit = item.lineTotal - item.lineCost;
            
            acc.salesByProduct[productName] = (acc.salesByProduct[productName] || 0) + item.lineTotal;
            acc.profitByProduct[productName] = (acc.profitByProduct[productName] || 0) + itemProfit;
        });

        return acc;
    }, initialState);

    const topSellers = Object.entries(dailyStats.salesByProduct)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, total]) => ({ name, total }));
        
    const topProfitMakers = Object.entries(dailyStats.profitByProduct)
        .sort(([, a], [, b]) => b - a)
        .map(([name, total]) => ({ name, total: total || 0 }));

    const stockAlerts = products.filter(p => {
        if (!p.inventory) return false;
        if (p.type === 'bottle') {
            return (p.inventory.quantityUnits || 0) <= p.thresholdQuantity;
        }
        if (p.type === 'drum') {
            return (p.inventory.currentML || 0) <= p.thresholdQuantity;
        }
        return false;
    });

    return {
        todaysSales: dailyStats.todaysSales,
        todaysProfit: dailyStats.todaysProfit,
        totalTransactions: todaysTransactions.length,
        suspendedOrders: suspendedOrders.length,
        topSellers,
        topProfitMakers,
        stockAlerts
    };
}
