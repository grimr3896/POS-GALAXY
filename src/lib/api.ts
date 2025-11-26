"use client";

import type { User, Product, InventoryItem, Transaction, OrderItem } from "./types";
import { PlaceHolderImages } from "./placeholder-images";

// --- Seed Data ---
const seedUsers: User[] = [
  { id: 1, name: "Admin User", role: "Admin", companyCardId: "1001" },
  { id: 2, name: "Cashier One", role: "Cashier", companyCardId: "1002" },
];

const seedProducts: Product[] = [
  { id: 1, sku: "GUIN330", name: "Guinness", image: PlaceHolderImages.find(p => p.id === 'guinness')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 150, sellPrice: 300, thresholdQuantity: 10 },
  { id: 2, sku: "TASC500", name: "Tascar", image: PlaceHolderImages.find(p => p.id === 'tascar')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 120, sellPrice: 250, thresholdQuantity: 10 },
  { id: 3, sku: "VODK750", name: "Vodka", image: PlaceHolderImages.find(p => p.id === 'vodka')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 800, sellPrice: 1500, thresholdQuantity: 5 },
  { id: 4, sku: "COKE500", name: "Coca-Cola", image: PlaceHolderImages.find(p => p.id === 'coke')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 40, sellPrice: 80, thresholdQuantity: 20 },
  { id: 5, sku: "WTR1000", name: "Mineral Water", image: PlaceHolderImages.find(p => p.id === 'water')?.imageUrl || '', type: "bottle", unit: "bottle", buyPrice: 50, sellPrice: 100, thresholdQuantity: 20 },
  { id: 6, sku: "WHISKEYD", name: "Whiskey", image: PlaceHolderImages.find(p => p.id === 'whiskey-drum')?.imageUrl || '', type: "drum", unit: "L", buyPrice: 20000, sellPrice: 10000, thresholdQuantity: 5000 },
];

const seedInventory: InventoryItem[] = [
  { id: 1, productId: 1, quantityUnits: 50, lastRestockAt: new Date().toISOString() },
  { id: 2, productId: 2, quantityUnits: 40, lastRestockAt: new Date().toISOString() },
  { id: 3, productId: 3, quantityUnits: 12, lastRestockAt: new Date().toISOString() },
  { id: 4, productId: 4, quantityUnits: 100, lastRestockAt: new Date().toISOString() },
  { id: 5, productId: 5, quantityUnits: 80, lastRestockAt: new Date().toISOString() },
  { id: 6, productId: 6, capacityML: 50000, currentML: 45750, lastRestockAt: new Date().toISOString() },
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

// Transactions
export const getTransactions = (): Transaction[] => getFromStorage("transactions", []);
export const saveTransaction = (userId: number, items: OrderItem[], paymentMethod: 'Cash' | 'Card'): Transaction => {
    const transactions = getTransactions();
    const inventory = getInventory();
    
    const totalAmount = items.reduce((acc, item) => acc + item.totalPrice, 0);

    const newTransaction: Transaction = {
        id: `TXN-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId,
        items: items.map((item, index) => ({
            id: index + 1,
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.totalPrice,
        })),
        totalAmount,
        tax: totalAmount * 0.16, // 16% tax
        discount: 0,
        paymentMethod
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

// Dashboard
export const getDashboardData = () => {
    const transactions = getTransactions();
    const products = getProductsWithInventory();

    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = transactions.filter(t => t.timestamp.startsWith(today));
    const todaysSales = todaysTransactions.reduce((acc, t) => acc + t.totalAmount, 0);

    const salesByProduct = transactions.flatMap(t => t.items).reduce((acc, item) => {
        acc[item.productId] = (acc[item.productId] || 0) + item.lineTotal;
        return acc;
    }, {} as Record<number, number>);

    const topSellers = Object.entries(salesByProduct)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([productId, total]) => {
            const product = getProducts().find(p => p.id === Number(productId));
            return { name: product?.name || 'Unknown', total };
        });

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
        totalTransactions: todaysTransactions.length,
        topSellers,
        stockAlerts
    };
}
