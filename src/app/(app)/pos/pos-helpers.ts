"use client";

import type { OrderItem, Product } from "@/lib/types";
import { getUUID } from "@/lib/utils";

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
      // For both 'bottle' and 'pour' types, we find if an item with the same productId exists.
      const existingItem = state.orderItems.find(
        (i) => i.productId === action.item.productId
      );
      
      if (existingItem) {
        // If it exists, just increment the quantity.
        const newQuantity = existingItem.quantity + action.item.quantity;
        return {
          ...state,
          orderItems: state.orderItems.map((i) =>
            i.id === existingItem.id ? { ...i, quantity: newQuantity, totalPrice: newQuantity * i.unitPrice } : i
          ),
        };
      }
      
      // If it doesn't exist, add it as a new item.
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

export function createOrderItem(product: Product, quantity: number, type: 'bottle' | 'pour'): Omit<OrderItem, "id" | "totalPrice"> {
  // The logic is now simpler: the price is just the product's sellPrice,
  // as pour variants are now their own products with their own prices.
  return {
    productId: product.id,
    name: product.name,
    image: product.image,
    quantity: quantity,
    unitPrice: product.sellPrice,
    buyPrice: product.buyPrice,
    type: type,
  };
}
