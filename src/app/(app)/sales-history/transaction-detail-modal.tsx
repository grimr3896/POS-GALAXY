
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Printer, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface TransactionDetailModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onReverseAndEdit: (transaction: Transaction) => void;
}

const formatCurrency = (amount: number | undefined | null) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return `—`;
    }
    return `Ksh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onOpenChange,
  onReverseAndEdit,
}: TransactionDetailModalProps) {
  if (!transaction) return null;
  
  const canReverse = transaction.status === "Completed";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            ID: {transaction.id}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={transaction.status === 'Completed' ? 'default' : transaction.status === 'Reversed' ? 'destructive' : 'secondary'}>
                    {transaction.status}
                </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(transaction.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span>{transaction.paymentMethod}</span>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
                 <h4 className="font-medium">Items</h4>
                {transaction.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <div>
                        <p>{item.productName}</p>
                        <p className="text-muted-foreground">
                            {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                        </div>
                        <span>{formatCurrency(item.lineTotal)}</span>
                    </div>
                ))}
            </div>

            <Separator />

             <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(transaction.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(transaction.tax)}</span>
                </div>
                <div className="flex justify-between font-bold">
                <span>TOTAL:</span>
                <span>{formatCurrency(transaction.total)}</span>
                </div>
                 <div className="flex justify-between text-green-600">
                <span>Profit:</span>
                <span>{formatCurrency(transaction.profit)}</span>
                </div>
            </div>
            
            {!canReverse && transaction.status !== 'Reversed' && (
                 <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Action Not Available</AlertTitle>
                    <AlertDescription>
                        This transaction cannot be reversed as it is not completed.
                    </AlertDescription>
                </Alert>
            )}

        </div>
        <DialogFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <DialogClose asChild>
                <Button variant="outline" className="sm:col-span-1">Close</Button>
            </DialogClose>
            <Button variant="secondary" className="sm:col-span-1" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
            <Button 
                className="sm:col-span-1" 
                onClick={() => onReverseAndEdit(transaction)}
                disabled={!canReverse}
            >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reverse & Edit
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
