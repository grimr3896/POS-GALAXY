
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { X, Minus, Plus, Save, Eraser } from "lucide-react";
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


interface OrderSummaryProps {
  items: OrderItem[];
  suspendedOrders: SuspendedOrder[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckoutRequest: () => void;
  onSuspend: () => void;
  onResume: (orderId: string) => void;
  onClear: () => void;
}

const VAT_RATE = 0.16;

export function OrderSummary({
  items,
  suspendedOrders,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutRequest,
  onSuspend,
  onResume,
  onClear,
}: OrderSummaryProps) {
  
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalTax = subtotal * (VAT_RATE / (1 + VAT_RATE));

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
             <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>Ksh {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
             <div className="flex justify-between text-sm text-muted-foreground">
              <span>VAT (16% included)</span>
              <span>Ksh {totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>Ksh {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="w-full border-t bg-muted/50 p-4">
             <Button onClick={onCheckoutRequest} className="w-full" size="lg">
                Proceed to Payment
             </Button>
          </div>
        </CardFooter>
      )}
    </Card>
    </>
  );
}
