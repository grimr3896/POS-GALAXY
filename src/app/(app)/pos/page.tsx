
"use client";

import { useState, useReducer, useEffect, useCallback } from "react";
import { ProductGrid } from "./product-grid";
import { OrderSummary } from "./order-summary";
import { getProductsWithInventory, saveTransaction, getSuspendedOrders, saveSuspendedOrder, removeSuspendedOrder, type PaymentDetails } from "@/lib/api";
import type { Product, InventoryItem, OrderItem, SuspendedOrder, Transaction } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { posReducer } from "./pos-helpers";
import { PaymentModal } from "./payment-modal";
import { ReceiptModal } from "./receipt-modal";

export default function POSPage() {
  const [products, setProducts] = useState<(Product & { inventory?: InventoryItem })[]>([]);
  const { user, pendingOrder, setPendingOrder, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(posReducer, { orderItems: [] });
  const [suspendedOrders, setSuspendedOrders] = useState<SuspendedOrder[]>([]);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchProducts = useCallback(() => {
    // We only need to fetch products with inventory for display purposes
    setProducts(getProductsWithInventory());
  }, []);

  const fetchSuspendedOrders = useCallback(() => {
    setSuspendedOrders(getSuspendedOrders());
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchProducts();
      fetchSuspendedOrders();
    }
  }, [fetchProducts, fetchSuspendedOrders, isClient]);
  
  useEffect(() => {
    if (!authLoading && pendingOrder) {
      dispatch({ type: "SET_ORDER", items: pendingOrder });
      setPendingOrder(null); // Clear the pending order after loading it
    }
  }, [authLoading, pendingOrder, setPendingOrder]);

  const handleAddItem = useCallback((item: Omit<OrderItem, "id" | "totalPrice">) => {
    dispatch({ type: "ADD_ITEM", item });
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", itemId, quantity });
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", itemId });
  }, []);

  const handleCheckoutRequest = () => {
    if (state.orderItems.length > 0) {
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentComplete = useCallback((paymentDetails: PaymentDetails, transactionDate?: Date) => {
    if (!user || state.orderItems.length === 0) return false;
    try {
      const isBackdated = transactionDate && transactionDate.toDateString() !== new Date().toDateString();
      const transaction = saveTransaction(user.id, state.orderItems, paymentDetails, { transactionDate, isBackdated });
      
      setLastTransaction(transaction);
      setIsReceiptModalOpen(true);
      setIsPaymentModalOpen(false);
      dispatch({ type: "CLEAR_ORDER" });

      if (!isBackdated) {
        fetchProducts(); // Refetch to update inventory display only if not backdated
      }
      toast({
        title: "Success",
        description: `Transaction completed with ${paymentDetails.paymentMethod}.`,
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
  }, [user, state.orderItems, toast, fetchProducts]);

  const handleSuspendOrder = useCallback(() => {
    if (!user || state.orderItems.length === 0) return;
    const newSuspendedOrder: SuspendedOrder = {
      id: `SUS-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      items: state.orderItems,
    };
    saveSuspendedOrder(newSuspendedOrder);
    fetchSuspendedOrders();
    dispatch({ type: "CLEAR_ORDER" });
    toast({ title: "Order Suspended" });
  }, [user, state.orderItems, toast, fetchSuspendedOrders]);

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
        removeSuspendedOrder(orderId);
        fetchSuspendedOrders();
        toast({ title: "Order Resumed" });
    }
  }, [suspendedOrders, state.orderItems.length, toast, fetchSuspendedOrders]);

  const handleClearOrder = () => {
    dispatch({ type: "CLEAR_ORDER" });
  }

  const drumProducts = products.filter(p => p.type === 'drum');
  const bottleProducts = products.filter(p => p.type === 'bottle');
  const orderTotal = state.orderItems.reduce((acc, item) => acc + item.totalPrice, 0);

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <>
      <div className="grid h-[calc(100vh-theme(spacing.28))] flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ProductGrid 
            bottleProducts={bottleProducts}
            drumProducts={drumProducts} 
            onAddItem={handleAddItem} 
          />
        </div>
        <OrderSummary
          items={state.orderItems}
          suspendedOrders={suspendedOrders}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckoutRequest={handleCheckoutRequest}
          onSuspend={handleSuspendOrder}
          onResume={handleResumeOrder}
          onClear={handleClearOrder}
        />
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        totalAmount={orderTotal}
        onPaymentComplete={handlePaymentComplete}
      />
      
      {lastTransaction && (
        <ReceiptModal
          transaction={lastTransaction}
          isOpen={isReceiptModalOpen}
          onOpenChange={setIsReceiptModalOpen}
        />
      )}
    </>
  );
}
