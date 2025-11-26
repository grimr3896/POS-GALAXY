"use client";

import type { OrderItem, Product, InventoryItem } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// This is a workaround for uuid not being available in some environments
export const getUUID = () => (typeof window !== "undefined" && window.crypto ? window.crypto.randomUUID() : uuidv4());

type POSState = {
  orderItems: OrderItem[];
};

export type POSAction =
  | { type: "ADD_ITEM"; item: Omit<OrderItem, "id" | "totalPrice"> }
  | { type: "REMOVE_ITEM"; itemId: string }
  | { type: "UPDATE_QUANTITY"; itemId: string; quantity: number }
  | { type: "CLEAR_ORDER" }
  | { type: "SET_ORDER"; items: OrderItem[] };

export function posReducer(state: POSState, action: POSAction): POSState {
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

export function createOrderItem(product: Product & { inventory?: InventoryItem }, quantity: number, type: 'bottle' | 'drum'): Omit<OrderItem, "id" | "totalPrice"> {
  if (type === 'bottle') {
    return {
      productId: product.id,
      name: product.name,
      image: product.image,
      quantity: 1,
      unitPrice: product.sellPrice,
      buyPrice: product.buyPrice,
      type: "bottle",
    };
  }
  
  // Drum
  const pricePerML = product.sellPrice / 1000;
  const costPerML = product.buyPrice / 1000; // Assuming drum buy price is per Liter
  return {
    productId: product.id,
    name: `${product.name} (Pour)`,
    image: product.image,
    quantity: quantity, // quantity is in ML
    unitPrice: pricePerML, // price is per ML
    buyPrice: costPerML, // cost is per ML
    type: "drum",
  };
}
