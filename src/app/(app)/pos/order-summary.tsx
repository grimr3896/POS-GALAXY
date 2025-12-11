
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { X, Minus, Plus, Save, SquareArrowDown, Eraser, CalendarIcon, ChevronsUpDown } from "lucide-react";
import type { OrderItem, SuspendedOrder, Transaction } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { ReceiptModal } from "./receipt-modal";


interface OrderSummaryProps {
  items: OrderItem[];
  suspendedOrders: SuspendedOrder[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: (paymentMethod: 'Cash' | 'Mpesa', transactionDate?: Date) => boolean;
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
  const [transactionDate, setTransactionDate] = useState<Date | undefined>(new Date());


  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;
  
  const handleCheckout = (paymentMethod: 'Cash' | 'Mpesa') => {
    const success = onCheckout(paymentMethod, transactionDate);
    if (success) {
      setLastTransaction({
        id: `TXN-${Date.now()}`,
        timestamp: (transactionDate || new Date()).toISOString(),
        userId: 0, // Should get from auth user
        items: items.map((item, idx) => ({ ...item, id: idx, productName: item.name, lineTotal: item.totalPrice, unitPrice: item.unitPrice, lineCost: item.buyPrice * item.quantity})),
        totalAmount: total,
        tax,
        discount: 0,
        totalCost: items.reduce((acc, item) => acc + item.buyPrice * item.quantity, 0),
        profit: total - items.reduce((acc, item) => acc + item.buyPrice * item.quantity, 0),
        paymentMethod,
        status: "Completed",
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
                <div key={item.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-md"
                    data-ai-hint="product image"
                  />
                  <div className="grid gap-1">
                    <p className="font-medium leading-tight truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                          </Button>
                          <Input value={item.quantity} onChange={e => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)} className="h-6 w-10 text-center px-1" />
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                          </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-1 text-right">
                    <p className="font-semibold">
                      Ksh {item.totalPrice.toLocaleString()}
                    </p>
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-6 w-6 ml-auto" onClick={() => onRemoveItem(item.id)}>
                        <X className="h-4 w-4" />
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </ScrollArea>
      {items.length > 0 && (
        <CardFooter className="flex-col !p-0">
          <div className="w-full p-6 space-y-2">
            <Collapsible>
                <CollapsibleTrigger className="flex justify-between items-center w-full text-sm font-medium text-muted-foreground hover:text-foreground">
                    <span>Advanced</span>
                    <ChevronsUpDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="transaction-date">Transaction Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="transaction-date"
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !transactionDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {transactionDate ? format(transactionDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={transactionDate}
                                onSelect={setTransactionDate}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CollapsibleContent>
            </Collapsible>
            
            <Separator />
            
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
             <Button onClick={() => handleCheckout('Mpesa')} className="col-span-1">Mpesa</Button>
             <Button onClick={() => handleCheckout('Cash')} className="col-span-1 bg-accent hover:bg-accent/90">Cash</Button>
          </div>
        </CardFooter>
      )}
    </Card>
    {lastTransaction && <ReceiptModal transaction={lastTransaction} isOpen={isReceiptOpen} onOpenChange={setIsReceiptOpen} />}
    </>
  );
}
