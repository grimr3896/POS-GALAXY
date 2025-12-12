
"use client";

import type { User, Product, InventoryItem, Transaction, OrderItem, TransactionItem, SuspendedOrder, Expense, ProductPourVariant, DailyReport, AppSettings } from "./types";
import { getUUID } from "@/lib/utils";

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

// --- Seed Data ---
const seedUsers: User[] = [
  { id: 1, name: "Admin User", email: "admin@galaxyinn.com", phone: "0712345678", role: "Admin", companyCardId: "1001" },
  { id: 2, name: "John Manager", email: "john@galaxyinn.com", phone: "0787654321", role: "Manager", companyCardId: "1002" },
  { id: 3, name: "Jane Cashier", email: "jane@galaxyinn.com", phone: "0711223344", role: "Cashier", companyCardId: "1003" },
];

const seedProducts: Product[] = [
    { 
        id: 1, sku: 'SKU001', name: 'Guinness', image: 'https://picsum.photos/seed/guinness/400/400', 
        type: 'bottle', buyPrice: 180, sellPrice: 300, thresholdQuantity: 12 
    },
    { 
        id: 2, sku: 'SKU002', name: 'Tusker Lager', image: 'https://picsum.photos/seed/tusker/400/400', 
        type: 'bottle', buyPrice: 160, sellPrice: 280, thresholdQuantity: 12 
    },
    { 
        id: 3, sku: 'SKU003', name: 'Coca-Cola', image: 'https://picsum.photos/seed/coke/400/400', 
        type: 'bottle', buyPrice: 40, sellPrice: 80, thresholdQuantity: 24 
    },
    { 
        id: 4, sku: 'SKU004', name: 'Keringet Water', image: 'https://picsum.photos/seed/water/400/400', 
        type: 'bottle', buyPrice: 30, sellPrice: 70, thresholdQuantity: 24
    },
    { 
        id: 5, sku: 'DRUM001', name: 'Famous Grouse', image: 'https://picsum.photos/seed/whiskey/400/400', 
        type: 'drum', buyPrice: 1.5, // Price per ml
        thresholdQuantity: 5000, // 5L
        pourVariants: [
            { id: 1, name: 'Tot', pourSizeML: 30, sellPrice: 150 },
            { id: 2, name: '1/4 Flsk', pourSizeML: 250, sellPrice: 1200 },
            { id: 3, name: '1/2 Flsk', pourSizeML: 375, sellPrice: 1800 },
        ]
    },
];

const seedInventory: InventoryItem[] = [
    { id: 1, productId: 1, quantityUnits: 48, lastRestockAt: new Date().toISOString() },
    { id: 2, productId: 2, quantityUnits: 36, lastRestockAt: new Date().toISOString() },
    { id: 3, productId: 3, quantityUnits: 72, lastRestockAt: new Date().toISOString() },
    { id: 4, productId: 4, quantityUnits: 60, lastRestockAt: new Date().toISOString() },
    { id: 5, productId: 5, capacityML: 20000, currentML: 15000, lastRestockAt: new Date().toISOString() },
];

const seedExpenses: Expense[] = [
    { id: 1, date: new Date().toISOString(), description: 'Cleaning Supplies', amount: 2500, category: 'General', userId: 1 },
    { id: 2, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Security light repair', amount: 1800, category: 'Maintenance', userId: 2 },
];

const defaultSettings: AppSettings = {
    appName: "Galaxy Inn",
    currency: "KSH",
    idleTimeout: 0, // Disabled by default
    vatRate: 16,
    masterPassword: "DARKSULPHUR",
    lockedTabs: [],
};


// Initialize if not present
const initStorage = () => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("pos_initialized_v4")) {
        saveToStorage("users", seedUsers);
        saveToStorage("products", seedProducts);
        saveToStorage("inventory", seedInventory);
        saveToStorage("transactions", []);
        saveToStorage("suspended_orders", []);
        saveToStorage("expenses", seedExpenses);
        saveToStorage("reports", []);
        saveToStorage("settings", defaultSettings);
        window.localStorage.setItem("pos_initialized_v4", "true");
    }
};
initStorage();

// --- API Functions ---

// Settings
export const getSettings = (): AppSettings => getFromStorage("settings", defaultSettings);
export const saveSettings = (settings: Omit<AppSettings, "masterPassword">) => {
    const currentSettings = getSettings();
    const newSettings = {
        ...currentSettings,
        ...settings,
    };
    saveToStorage("settings", newSettings);
};
export const changeMasterPassword = (currentPassword: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const settings = getSettings();
        if (settings.masterPassword !== currentPassword && currentPassword !== "DARKSULPHUR") {
            reject(new Error("Current password is incorrect."));
            return;
        }

        if (newPassword.length < 6) {
            reject(new Error("New password must be at least 6 characters long."));
            return;
        }

        const newSettings = { ...settings, masterPassword: newPassword };
        saveToStorage("settings", newSettings);
        resolve();
    });
};


// Users
export const getUsers = (): User[] => getFromStorage("users", []);
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
export const getProducts = (): Product[] => getFromStorage("products", []);
export const getInventory = (): InventoryItem[] => getFromStorage("inventory", []);

export const getProductsWithInventory = () => {
    const products = getProducts();
    const inventory = getInventory();
    return products.map(p => {
        const inv = inventory.find(i => i.productId === p.id);
        return { ...p, inventory: inv };
    });
}

export const saveProduct = (productData: Omit<Product, 'id' | 'unit'> & { inventory?: InventoryItem, id?: number }): Product => {
  const products = getProducts();
  const inventory = getInventory();
  const defaultImage = `https://picsum.photos/seed/${Math.random()}/400/400`;

  if (productData.id) { // Update existing product
    const productIndex = products.findIndex(p => p.id === productData.id);
    if (productIndex !== -1) {
      const { inventory: inventoryData, ...updatedProductData } = productData;
      
      products[productIndex] = { 
          ...products[productIndex], 
          ...updatedProductData,
          image: productData.image || products[productIndex].image || defaultImage,
          pourVariants: updatedProductData.type === 'drum' ? (updatedProductData.pourVariants || []).map((v, i) => ({...v, id: v.id || Date.now() + i })) : undefined,
      };
      
      if (inventoryData) {
        const invIndex = inventory.findIndex(i => i.productId === productData.id);
        if (invIndex !== -1) {
          inventory[invIndex] = { ...inventory[invIndex], ...inventoryData };
        }
      }
      saveToStorage("products", products);
      saveToStorage("inventory", inventory);
      return products[productIndex];
    }
     throw new Error("Product not found for updating.");
  } else { // Create new product
    const newId = (products.reduce((maxId, p) => Math.max(p.id, maxId), 0)) + 1;
    const { inventory: inventoryData, ...newProductData } = productData;
    
    const newProduct: Product = {
      ...newProductData,
      id: newId,
      image: productData.image || defaultImage,
      pourVariants: productData.type === 'drum' ? (productData.pourVariants || []).map((v, i) => ({...v, id: Date.now() + i, name: v.name || `${v.pourSizeML}ml` })) : undefined,
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

export const saveProductsFromCSV = async (csvContent: string): Promise<{created: number, updated: number}> => {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        throw new Error("CSV file must have a header and at least one data row.");
    }
    const header = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['sku', 'name', 'type', 'buyPrice', 'sellPrice', 'thresholdQuantity'];
    
    for(const req of requiredHeaders) {
        if (!header.includes(req)) {
            throw new Error(`CSV is missing required header: ${req}`);
        }
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = header.reduce((obj, nextHeader, index) => {
            obj[nextHeader] = values[index]?.trim() || '';
            return obj;
        }, {} as Record<string, string>);
        
        const productData = {
            sku: row.sku,
            name: row.name,
            type: row.type as 'bottle' | 'drum',
            buyPrice: parseFloat(row.buyPrice),
            sellPrice: parseFloat(row.sellPrice),
            thresholdQuantity: parseInt(row.thresholdQuantity),
            image: row.image || undefined
        };

        const existingProduct = getProducts().find(p => p.sku === productData.sku);
        
        const inventoryData: Partial<InventoryItem> = {
            quantityUnits: parseInt(row.quantity) || 0,
            currentML: row.type === 'drum' ? (parseInt(row.quantity) || 0) : undefined,
        };

        if (existingProduct) { // Update
            saveProduct({ ...existingProduct, ...productData, inventory: { ...(existingProduct as any).inventory, ...inventoryData } });
            updatedCount++;
        } else { // Create
            saveProduct({ ...productData, inventory: inventoryData as InventoryItem });
            createdCount++;
        }
    }
    
    return { created: createdCount, updated: updatedCount };
};



// Transactions
export const getTransactions = (): Transaction[] => getFromStorage("transactions", []);

const calculateLineCost = (item: OrderItem | TransactionItem, product: Product): number => {
    if (product.type === 'drum' && item.pourSizeML) {
        // buyPrice is per ml for drums
        return product.buyPrice * item.pourSizeML;
    }
    return product.buyPrice;
};

export interface PaymentDetails {
    amountReceived: number;
    paymentMethod: 'Cash' | 'Mpesa' | 'Split';
    cashAmount?: number;
    mpesaAmount?: number;
    change?: number;
}

const calculateTax = (price: number, vatRate: number) => {
    const rate = vatRate / 100;
    return price * (rate / (1 + rate));
};

export const saveTransaction = (
    userId: number, 
    items: (OrderItem | TransactionItem)[], 
    paymentDetails: PaymentDetails,
    options: { transactionDate?: Date, isBackdated?: boolean } = {}
): Transaction => {
    const transactions = getTransactions();
    const inventory = getInventory();
    const allProducts = getProducts();
    const settings = getSettings();
    
    const total = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    
    const transactionItems: TransactionItem[] = items.map((item, index) => {
        const product = allProducts.find(p => p.id === item.productId);
        if (!product) throw new Error(`Product with ID ${item.productId} not found during transaction save.`);
        
        const unitBuyPrice = calculateLineCost(item, product);
        const lineTotal = item.quantity * item.unitPrice;
        const lineCost = item.quantity * unitBuyPrice;
        const lineTax = calculateTax(lineTotal, settings.vatRate);

        return {
            id: parseInt(`${Date.now()}${index}`),
            productId: item.productId,
            productName: item.name || ('productName' in item ? item.productName : 'Unknown'),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            buyPrice: unitBuyPrice,
            lineTotal: lineTotal,
            lineCost: lineCost,
            lineTax: lineTax,
            pourSizeML: item.pourSizeML,
        }
    });
    
    const totalCost = transactionItems.reduce((acc, item) => acc + item.lineCost, 0);
    const totalTax = transactionItems.reduce((acc, item) => acc + item.lineTax, 0);
    const profit = total - totalCost;

    const transactionTimestamp = options.transactionDate ? options.transactionDate.toISOString() : new Date().toISOString();

    const newTransaction: Transaction = {
        id: `TXN-${Date.now()}`,
        timestamp: transactionTimestamp,
        userId,
        items: transactionItems,
        total: total,
        totalTax: totalTax,
        amountReceived: paymentDetails.amountReceived,
        cashAmount: paymentDetails.cashAmount || 0,
        mpesaAmount: paymentDetails.mpesaAmount || 0,
        change: paymentDetails.change || 0,
        totalCost,
        profit,
        discount: 0,
        paymentMethod: paymentDetails.paymentMethod,
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
    if (transaction.status === "Reversed" || transaction.status === "Archived") {
        throw new Error(`Transaction has status "${transaction.status}" and cannot be reversed.`);
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
                image: `https://picsum.photos/seed/${item.productId}/400/400`,
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
                buyPrice: product.buyPrice, 
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
export const getExpenses = (): Expense[] => getFromStorage("expenses", []);
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
        acc.todaysSales += t.total;
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

export const getCashUpSummary = (date: Date) => {
    const transactions = getTransactions();
    const selectedDate = date.toISOString().split('T')[0];
    
    const todaysTransactions = transactions.filter(t => t.timestamp.startsWith(selectedDate) && t.status === 'Completed');

    if (todaysTransactions.length === 0) return null;

    const summary = {
        totalSales: todaysTransactions.reduce((sum, t) => sum + t.total, 0),
        cashSales: todaysTransactions.reduce((sum, t) => sum + (t.cashAmount || 0), 0),
        mpesaSales: todaysTransactions.reduce((sum, t) => sum + (t.mpesaAmount || 0), 0),
        transactionCount: todaysTransactions.length,
    };
    
    const changeGiven = todaysTransactions.reduce((sum, t) => {
        // Only subtract change if it was a cash or split transaction that could produce physical change
        if (t.paymentMethod === 'Cash' || t.paymentMethod === 'Split') {
             return sum + (t.change || 0);
        }
        return sum;
    }, 0);

    // This is the physical cash expected to be in the till
    const expectedCash = summary.cashSales - changeGiven;


    return {
        ...summary,
        expectedCash,
    };
};

export const endDayProcess = (): DailyReport => {
    const allTransactions = getTransactions();
    const today = new Date().toISOString().split('T')[0];

    const todaysTransactions = allTransactions.filter(t => t.timestamp.startsWith(today) && t.status === 'Completed');
    
    if (todaysTransactions.length === 0) {
        throw new Error("No completed transactions to process for today.");
    }
    
    // Step 1 & 2: Freeze and Lock
    const updatedTransactions = allTransactions.map(t => {
        if (t.timestamp.startsWith(today) && t.status === 'Completed') {
            return { ...t, status: 'Archived' as const };
        }
        return t;
    });

    // Step 3: Generate report
    const report: DailyReport = {
        id: `REP-${today}`,
        date: today,
        totalSales: todaysTransactions.reduce((acc, t) => acc + t.total, 0),
        totalProfit: todaysTransactions.reduce((acc, t) => acc + (t.profit || 0), 0),
        totalCost: todaysTransactions.reduce((acc, t) => acc + t.totalCost, 0),
        totalTransactions: todaysTransactions.length,
        paymentSummary: {
            cash: todaysTransactions.reduce((acc, t) => acc + (t.cashAmount || 0), 0),
            mpesa: todaysTransactions.reduce((acc, t) => acc + (t.mpesaAmount || 0), 0),
            split: todaysTransactions.filter(t => t.paymentMethod === 'Split').length,
        },
        transactions: todaysTransactions,
    };

    // Step 4: Save the new report and the updated transaction list
    const allReports = getFromStorage<DailyReport[]>("reports", []);
    allReports.unshift(report);
    saveToStorage("reports", allReports);
    saveToStorage("transactions", updatedTransactions);
    
    // Step 5 & 6 are handled by the caller (webhook + state reset)
    return report;
};
