
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Transaction } from "@/lib/types";
import { Icons } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { useRef } from "react";
import { getSettings } from "@/lib/api";
import { generateReceiptHtml, printReceipt } from "@/lib/receipt";

interface ReceiptModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ReceiptModal({ transaction, isOpen, onOpenChange }: ReceiptModalProps) {
  const { user } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);
  const settings = getSettings();
  
  const handlePrint = () => {
    if (!user) return;
    const receiptHtml = generateReceiptHtml(transaction, user, settings);
    printReceipt(receiptHtml);
  };

  const hasCash = transaction.cashAmount > 0;
  const hasMpesa = transaction.mpesaAmount > 0;


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        {/* This div is for display purposes only, the actual print uses the generated HTML */}
        <div ref={receiptRef}>
          <DialogHeader className="text-center items-center">
            <Icons.logo className="h-10 w-10 text-primary" />
            <DialogTitle className="text-xl">{settings.appName}</DialogTitle>
            <DialogDescription>
              Transaction Receipt
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Receipt No:</span>
              <span>{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(transaction.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{new Date(transaction.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{user?.name}</span>
            </div>
          </div>
          <Separator />
          <div className="my-4 space-y-2">
            {transaction.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p>{item.productName}</p>
                  <p className="text-muted-foreground">
                    {item.quantity} x {item.unitPrice.toLocaleString()}
                  </p>
                </div>
                <span>{item.lineTotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <Separator />
           <div className="my-4 space-y-1 text-sm">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Ksh {(transaction.total - (transaction.totalTax || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>VAT ({settings.vatRate}% included):</span>
                    <span>Ksh {(transaction.totalTax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-1">
                    <span>TOTAL:</span>
                    <span>Ksh {transaction.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
          <Separator />
          <div className="my-4 space-y-1 text-sm">
                {hasCash && (
                    <div className="flex justify-between">
                        <span>Paid (Cash):</span>
                        <span>Ksh {transaction.cashAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                )}
                {hasMpesa && (
                     <div className="flex justify-between">
                        <span>Paid (M-Pesa):</span>
                        <span>Ksh {transaction.mpesaAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                )}
                 <div className="flex justify-between font-bold">
                    <span>Change:</span>
                    <span>Ksh {transaction.change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Thank you for your business!
            <br />
            Powered by Galaxy POS
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handlePrint} className="w-full">
            Print Receipt
          </Button>
           <Button onClick={() => onOpenChange(false)} className="w-full" variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
