"use client";

import { useState, useReducer, useEffect, useCallback } from "react";
import { ProductGrid } from "./product-grid";
import { OrderSummary } from "./order-summary";
import { getProductsWithInventory, saveTransaction } from "@/lib/api";
import type { Product, InventoryItem, OrderItem, SuspendedOrder } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

// This is a workaround for uuid not being available in some environments
const getUUID = () => (typeof window !== "undefined" && window.crypto ? window.crypto.randomUUID() : uuidv4());

type POSState = {
  orderItems: OrderItem[];
};

type POSAction =
  | { type: "ADD_ITEM"; item: Omit<OrderItem, "id" | "totalPrice"> }
  | { type: "REMOVE_ITEM"; itemId: string }
  | { type: "UPDATE_QUANTITY"; itemId: string; quantity: number }
  | { type: "CLEAR_ORDER" }
  | { type: "SET_ORDER"; items: OrderItem[] };

function posReducer(state: POSState, action: POSAction): POSState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.orderItems.find(
        (i) => i.productId === action.item.productId && i.type === action.item.type
      );
      if (existingItem && action.item.type === "bottle") {
        const newQuantity = existingItem.quantity + action.item.quantity;
        return {
          ...state,
          orderItems: state.orderItems.map((i) =>
            i.id === existingItem.id ? { ...i, quantity: newQuantity, totalPrice: newQuantity * i.unitPrice } : i
          ),
        };
      }
      const newItem: OrderItem = {
        ...action.item,
        id: getUUID(),
        totalPrice: action.item.quantity * action.item.unitPrice,
      };
      return { ...state, orderItems: [...state.orderItems, newItem] };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        orderItems: state.orderItems.filter((i) => i.id !== action.itemId),
      };
    case "UPDATE_QUANTITY": {
        if(action.quantity <= 0) {
            return {
                ...state,
                orderItems: state.orderItems.filter((i) => i.id !== action.itemId),
            };
        }
      return {
        ...state,
        orderItems: state.orderItems.map((i) =>
          i.id === action.itemId ? { ...i, quantity: action.quantity, totalPrice: action.quantity * i.unitPrice } : i
        ),
      };
    }
    case "CLEAR_ORDER":
      return { ...state, orderItems: [] };
    case "SET_ORDER":
      return { ...state, orderItems: action.items };
    default:
      return state;
  }
}


export default function POSPage() {
  const [products, setProducts] = useState<(Product & { inventory?: InventoryItem })[]>([]);
  const [state, dispatch] = useReducer(posReducer, { orderItems: [] });
  const [suspendedOrders, setSuspendedOrders] = useState<SuspendedOrder[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setProducts(getProductsWithInventory());
  }, [state]);

  const handleAddItem = useCallback((item: Omit<OrderItem, "id" | "totalPrice">) => {
    dispatch({ type: "ADD_ITEM", item });
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", itemId, quantity });
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", itemId });
  }, []);

  const handleCheckout = useCallback((paymentMethod: 'Cash' | 'Card') => {
    if (!user || state.orderItems.length === 0) return;
    try {
      saveTransaction(user.id, state.orderItems, paymentMethod);
      dispatch({ type: "CLEAR_ORDER" });
      toast({
        title: "Success",
        description: `Transaction completed with ${paymentMethod}.`,
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: "Could not process the transaction.",
      });
      return false;
    }
  }, [user, state.orderItems, toast]);

  const handleSuspendOrder = useCallback(() => {
    if (!user || state.orderItems.length === 0) return;
    const newSuspendedOrder: SuspendedOrder = {
      id: `SUS-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      items: state.orderItems,
    };
    setSuspendedOrders(prev => [newSuspendedOrder, ...prev]);
    dispatch({ type: "CLEAR_ORDER" });
    toast({ title: "Order Suspended" });
  }, [user, state.orderItems, toast]);

  const handleResumeOrder = useCallback((orderId: string) => {
    const orderToResume = suspendedOrders.find(o => o.id === orderId);
    if(orderToResume) {
        if(state.orderItems.length > 0) {
            toast({
                variant: 'destructive',
                title: 'Cannot Resume',
                description: 'Please suspend or complete the current order first.'
            });
            return;
        }
        dispatch({ type: "SET_ORDER", items: orderToResume.items });
        setSuspendedOrders(prev => prev.filter(o => o.id !== orderId));
        toast({ title: "Order Resumed" });
    }
  }, [suspendedOrders, state.orderItems.length, toast]);

  const handleClearOrder = () => {
    dispatch({ type: "CLEAR_ORDER" });
  }

  const drumProduct = products.find(p => p.type === 'drum');

  return (
    <div className="grid h-[calc(100vh-theme(spacing.28))] flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        {drumProduct && <ProductGrid products={products.filter(p => p.type === 'bottle')} drumProduct={drumProduct} onAddItem={handleAddItem} />}
      </div>
      <OrderSummary
        items={state.orderItems}
        suspendedOrders={suspendedOrders}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        onSuspend={handleSuspendOrder}
        onResume={handleResumeOrder}
        onClear={handleClearOrder}
      />
    </div>
  );
}
