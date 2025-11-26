"use client";

import type { User, Product, InventoryItem, Transaction, OrderItem, TransactionItem, SuspendedOrder, Expense } from "./types";
import { PlaceHolderImages } from "./placeholder-images";

// --- Seed Data ---
const seedUsers: User[] = [
  { id: 1, name: "Admin User", email: "admin@galaxyinn.com", phone: "0712345678", role: "Admin", companyCardId: "1001" },
  { id: 2, name: "Cashier One", email: "cashier1@galaxyinn.com", phone: "0787654321", role: "Cashier", companyCardId: "1002" },
];

const seedProducts: Product[] = [
  { id: 1, sku: "GUIN330", name: "Guinness", image: PlaceHolderImages.find(p => p.id === 'guinness')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 150, sellPrice: 300, thresholdQuantity: 10 },
  { id: 2, sku: "TASC500", name: "Tascar", image: PlaceHolderImages.find(p => p.id === 'tascar')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 120, sellPrice: 250, thresholdQuantity: 10 },
  { id: 3, sku: "VODK750", name: "Vodka", image: PlaceHolderImages.find(p => p.id === 'vodka')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 800, sellPrice: 1500, thresholdQuantity: 5 },
  { id: 4, sku: "COKE500", name: "Coca-Cola", image: PlaceHolderImages.find(p => p.id === 'coke')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 40, sellPrice: 80, thresholdQuantity: 20 },
  { id: 5, sku: "WTR1000", name: "Mineral Water", image: PlaceHolderImages.find(p => p.id === 'water')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 50, sellPrice: 100, thresholdQuantity: 20 },
  { id: 6, sku: "WHISKEYD", name: "Whiskey", image: PlaceHolderImages.find(p => p.id === 'whiskey-drum')?.imageUrl || '', type: "drum", unit: "L", buyPrice: 20000, sellPrice: 40000, thresholdQuantity: 5000 },
  { id: 7, sku: "VODKAD", name: "Vodka", image: PlaceHolderImages.find(p => p.id === 'vodka-drum')?.imageUrl || '', type: "drum", unit: "L", buyPrice: 18000, sellPrice: 35000, thresholdQuantity: 5000 },
];

const seedInventory: InventoryItem[] = [
  { id: 1, productId: 1, quantityUnits: 50, lastRestockAt: new Date().toISOString() },
  { id: 2, productId: 2, quantityUnits: 40, lastRestockAt: new Date().toISOString() },
  { id: 3, productId: 3, quantityUnits: 12, lastRestockAt: new Date().toISOString() },
  { id: 4, productId: 4, quantityUnits: 100, lastRestockAt: new Date().toISOString() },
  { id: 5, productId: 5, quantityUnits: 80, lastRestockAt: new Date().toISOString() },
  { id: 6, productId: 6, capacityML: 50000, currentML: 24000, lastRestockAt: new Date().toISOString() },
  { id: 7, productId: 7, capacityML: 25000, currentML: 15000, lastRestockAt: new Date().toISOString() },
];

const seedExpenses: Expense[] = [
    { id: 1, date: new Date().toISOString(), description: 'Electricity Bill', amount: 5000, category: 'Utilities', userId: 1 },
    { id: 2, date: new Date().toISOString(), description: 'Cleaning Supplies', amount: 1200, category: 'Supplies', userId: 1 },
];


// --- LocalStorage Wrapper ---
const getFromStorage = <T>(key: string, defaultValue: T): T => {
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

const saveToStorage = <T>(key: string, value: T) => {
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

export const saveProduct = (productData: Omit<Product & { inventory?: InventoryItem }, 'id'> & { id?: number }): Product => {
  const products = getProducts();
  const inventory = getInventory();
  const defaultImage = "https://picsum.photos/seed/placeholder/400/400";

  if (productData.id) { // Update existing product
    const productIndex = products.findIndex(p => p.id === productData.id);
    if (productIndex !== -1) {
      const { inventory: inventoryData, ...updatedProduct } = productData;
      products[productIndex] = { ...products[productIndex], ...updatedProduct, image: productData.image || products[productIndex].image || defaultImage };
      
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
      image: productData.image || defaultImage
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
export const saveTransaction = (userId: number, items: OrderItem[], paymentMethod: 'Cash' | 'Card'): Transaction => {
    const transactions = getTransactions();
    const inventory = getInventory();
    
    const totalAmount = items.reduce((acc, item) => acc + item.totalPrice, 0);
    const totalCost = items.reduce((acc, item) => acc + (item.buyPrice * item.quantity), 0);

    const newTransaction: Transaction = {
        id: `TXN-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId,
        items: items.map((item, index) => ({
            id: parseInt(`${Date.now()}${index}`), // more unique id
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            buyPrice: item.buyPrice,
            lineTotal: item.totalPrice,
            lineCost: item.buyPrice * item.quantity,
        })),
        totalAmount,
        totalCost,
        profit: totalAmount - totalCost,
        tax: totalAmount * 0.16, // 16% tax
        discount: 0,
        paymentMethod,
        status: "Completed",
    };

    // Update inventory
    items.forEach(item => {
        const invItem = inventory.find(i => i.productId === item.productId);
        if (invItem) {
            if (item.type === 'bottle' && invItem.quantityUnits) {
                invItem.quantityUnits -= item.quantity;
            } else if (item.type === 'drum' && invItem.currentML) {
                invItem.currentML -= item.quantity;
            }
        }
    });

    saveToStorage("inventory", inventory);
    transactions.unshift(newTransaction);
    saveToStorage("transactions", transactions);

    return newTransaction;
}

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
    const allProducts = getProducts();

    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = transactions.filter(t => t.timestamp.startsWith(today));
    
    const todaysSales = todaysTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const todaysProfit = todaysTransactions.reduce((acc, t) => acc + (t.profit || 0), 0);

    const salesByProduct = todaysTransactions.flatMap(t => t.items).reduce((acc, item) => {
        const productName = item.productName.replace(' (Pour)', '').trim();
        acc[productName] = (acc[productName] || 0) + item.lineTotal;
        return acc;
    }, {} as Record<string, number>);

    const topSellers = Object.entries(salesByProduct)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, total]) => ({ name, total }));
        
    const profitByProduct = todaysTransactions.flatMap(t => t.items).reduce((acc, item) => {
        const profit = item.lineTotal - item.lineCost;
        const productName = item.productName.replace(' (Pour)', '').trim();
        acc[productName] = (acc[productName] || 0) + profit;
        return acc;
    }, {} as Record<string, number>);

    const topProfitMakers = Object.entries(profitByProduct)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, total]) => ({ name, total }));

    const stockAlerts = products.filter(p => {
        if (p.inventory) {
            if (p.type === 'bottle' && p.inventory.quantityUnits !== undefined) {
                return p.inventory.quantityUnits <= p.thresholdQuantity;
            }
            if (p.type === 'drum' && p.inventory.currentML !== undefined) {
                return p.inventory.currentML <= p.thresholdQuantity;
            }
        }
        return false;
    });

    return {
        todaysSales,
        todaysProfit,
        totalTransactions: todaysTransactions.length,
        suspendedOrders: suspendedOrders.length,
        topSellers,
        topProfitMakers,
        stockAlerts
    };
}
