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

interface ReceiptModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ReceiptModal({ transaction, isOpen, onOpenChange }: ReceiptModalProps) {
  const { user } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if(printWindow) {
        printWindow.document.write('<html><head><title>Print Receipt</title>');
        printWindow.document.write('<style>body{font-family:monospace; margin: 20px;} table{width:100%; border-collapse: collapse;} td,th{padding: 5px; text-align: left;} .right{text-align: right;} .center{text-align:center;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <div ref={receiptRef}>
          <DialogHeader className="text-center items-center">
            <Icons.logo className="h-10 w-10 text-primary" />
            <DialogTitle className="text-xl">Galaxy Inn</DialogTitle>
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
          <div className="my-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{(transaction.totalAmount - transaction.tax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{transaction.tax.toLocaleString()}</span>
            </div>
          </div>
          <Separator />
          <div className="mt-4 flex justify-between font-bold text-base">
            <span>TOTAL:</span>
            <span>Ksh {transaction.totalAmount.toLocaleString()}</span>
          </div>
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Thank you for your business!
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePrint} className="w-full">
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
