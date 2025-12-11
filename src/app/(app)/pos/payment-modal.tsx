
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PaymentDetails } from "@/lib/api";

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  totalAmount: number;
  onPaymentComplete: (paymentDetails: PaymentDetails) => void;
}

const quickCashAmounts = [1000, 2000, 5000];

export function PaymentModal({
  isOpen,
  onOpenChange,
  totalAmount,
  onPaymentComplete,
}: PaymentModalProps) {
  const [cashAmount, setCashAmount] = useState("");
  const [mpesaAmount, setMpesaAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Mpesa" | "Split">("Cash");
  const [error, setError] = useState("");

  const numericCash = parseFloat(cashAmount) || 0;
  const numericMpesa = parseFloat(mpesaAmount) || 0;
  
  const totalPaid = {
    Cash: numericCash,
    Mpesa: numericMpesa,
    Split: numericCash + numericMpesa
  }[paymentMethod] || 0;

  const change = Math.max(0, totalPaid - totalAmount);
  const remaining = Math.max(0, totalAmount - totalPaid);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod("Cash");
      setCashAmount(totalAmount.toString());
      setMpesaAmount("");
      setError("");
    }
  }, [isOpen, totalAmount]);
  
  useEffect(() => {
    setError("");
    if (paymentMethod === "Cash") {
      setCashAmount(totalAmount.toString());
      setMpesaAmount("");
    } else if (paymentMethod === "Mpesa") {
      setMpesaAmount(totalAmount.toString());
      setCashAmount("");
    } else if (paymentMethod === "Split") {
      // Keep existing values or clear them
    }
  }, [paymentMethod, totalAmount]);

  const handlePayment = () => {
    if (totalPaid < totalAmount) {
      setError(`Insufficient amount. Still need Ksh ${remaining.toFixed(2)}`);
      return;
    }

    onPaymentComplete({
      paymentMethod,
      cashAmount: paymentMethod === 'Mpesa' ? 0 : numericCash,
      mpesaAmount: paymentMethod === 'Cash' ? 0 : numericMpesa,
      amountReceived: totalPaid,
      change: change,
    });
  };
  
  const handleQuickCash = (amount: number) => {
    setCashAmount(amount.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Total Amount Due:{" "}
            <span className="font-bold text-2xl text-foreground">
              Ksh {totalAmount.toLocaleString()}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="Cash">Cash</TabsTrigger>
            <TabsTrigger value="Mpesa">M-Pesa</TabsTrigger>
            <TabsTrigger value="Split">Split</TabsTrigger>
          </TabsList>
          
          <div className="py-4 space-y-4">
            {(paymentMethod === 'Cash' || paymentMethod === 'Split') && (
              <div className="space-y-2">
                <Label htmlFor="cash-amount">Cash Amount Received</Label>
                <Input
                  id="cash-amount"
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                />
                 <div className="grid grid-cols-3 gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleQuickCash(totalAmount)}>Exact</Button>
                    {quickCashAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickCash(amount)}
                      >
                        {amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
              </div>
            )}
             {(paymentMethod === 'Mpesa' || paymentMethod === 'Split') && (
              <div className="space-y-2">
                <Label htmlFor="mpesa-amount">M-Pesa Amount Received</Label>
                <Input
                  id="mpesa-amount"
                  type="number"
                  value={mpesaAmount}
                  onChange={(e) => setMpesaAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}
            
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            {/* Summary Section */}
            <div className="!mt-6 space-y-3 rounded-lg border bg-muted/50 p-4">
                 <div className="flex justify-between font-semibold">
                    <span>Total Paid:</span>
                    <span>Ksh {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                 <div className={cn("flex justify-between font-semibold", remaining > 0 ? "text-destructive" : "text-green-600")}>
                    <span>{remaining > 0 ? 'Remaining:' : 'Change Due:'}</span>
                    <span>Ksh {(remaining > 0 ? remaining : change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>

          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={totalPaid < totalAmount}
          >
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
