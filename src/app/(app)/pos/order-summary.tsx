"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { X, Minus, Plus, Save, SquareArrowDown, Eraser } from "lucide-react";
import type { OrderItem, SuspendedOrder } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { ReceiptModal } from "./receipt-modal";
import type { Transaction } from "@/lib/types";


interface OrderSummaryProps {
  items: OrderItem[];
  suspendedOrders: SuspendedOrder[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: (paymentMethod: 'Cash' | 'Card') => boolean;
  onSuspend: () => void;
  onResume: (orderId: string) => void;
  onClear: () => void;
}

export function OrderSummary({
  items,
  suspendedOrders,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onSuspend,
  onResume,
  onClear,
}: OrderSummaryProps) {
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;
  
  const handleCheckout = (paymentMethod: 'Cash' | 'Card') => {
    const success = onCheckout(paymentMethod);
    if (success) {
      setLastTransaction({
        id: `TXN-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 0, // Should get from auth user
        items: items.map((item, idx) => ({ ...item, id: idx, productName: item.name, lineTotal: item.totalPrice, unitPrice: item.unitPrice})),
        totalAmount: total,
        tax,
        discount: 0,
        paymentMethod,
      });
      setIsReceiptOpen(true);
    }
  };


  return (
    <>
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Current Order</CardTitle>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={suspendedOrders.length === 0}>
                            <Save className="mr-2 h-4 w-4"/>
                            Suspended ({suspendedOrders.length})
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Suspended Orders</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {suspendedOrders.map(order => (
                            <DropdownMenuItem key={order.id} onSelect={() => onResume(order.id)}>
                                <span>{order.id} - {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" onClick={onClear} disabled={items.length === 0} aria-label="Clear Order">
                  <Eraser className="h-4 w-4"/>
                </Button>
            </div>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="pr-6">
          {items.length === 0 ? (
            <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
              Add products to start an order.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-md"
                    data-ai-hint="product image"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.type === 'bottle' ? `${item.quantity} x Ksh ${item.unitPrice}` : `${item.quantity}ml @ Ksh ${item.unitPrice.toFixed(2)}/ml`}
                    </p>
                  </div>
                  {item.type === 'bottle' ? (
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                        </Button>
                        <Input value={item.quantity} onChange={e => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)} className="h-7 w-12 text-center" />
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                  ) : <div className="w-[102px]"></div> }
                  <p className="w-20 text-right font-semibold">
                    Ksh {item.totalPrice.toLocaleString()}
                  </p>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => onRemoveItem(item.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </ScrollArea>
      {items.length > 0 && (
        <CardFooter className="flex-col !p-0">
          <div className="w-full p-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>Ksh {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (16%)</span>
              <span>Ksh {tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>Ksh {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="w-full border-t bg-muted/50 p-4 grid grid-cols-3 gap-2">
             <Button variant="outline" onClick={onSuspend} className="col-span-1">
                <SquareArrowDown className="mr-2 h-4 w-4"/>
                Suspend
             </Button>
             <Button onClick={() => handleCheckout('Card')} className="col-span-1">Card</Button>
             <Button onClick={() => handleCheckout('Cash')} className="col-span-1 bg-accent hover:bg-accent/90">Cash</Button>
          </div>
        </CardFooter>
      )}
    </Card>
    {lastTransaction && <ReceiptModal transaction={lastTransaction} isOpen={isReceiptOpen} onOpenChange={setIsReceiptOpen} />}
    </>
  );
}
