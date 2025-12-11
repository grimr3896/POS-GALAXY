
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
import { cn } from "@/lib/utils";
import type { PaymentDetails } from "@/lib/api";

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  totalAmount: number;
  onPaymentComplete: (paymentDetails: PaymentDetails) => void;
}

const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

export function PaymentModal({
  isOpen,
  onOpenChange,
  totalAmount,
  onPaymentComplete,
}: PaymentModalProps) {
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Mpesa">("Cash");
  const [error, setError] = useState("");

  const numericAmountReceived = parseFloat(amountReceived) || 0;
  const change = numericAmountReceived - totalAmount;

  useEffect(() => {
    if (isOpen) {
      setAmountReceived(totalAmount.toString());
      setError("");
      setPaymentMethod("Cash");
    }
  }, [isOpen, totalAmount]);
  
  const handlePayment = () => {
    if (numericAmountReceived < totalAmount) {
      setError(`Insufficient amount. Must be at least Ksh ${totalAmount.toFixed(2)}`);
      return;
    }

    onPaymentComplete({
      amountReceived: numericAmountReceived,
      paymentMethod: paymentMethod,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Total Amount Due:{" "}
            <span className="font-bold text-lg text-foreground">
              Ksh {totalAmount.toLocaleString()}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Payment Method */}
          <div>
            <Label className="mb-2 block">Payment Method</Label>
            <div className="flex gap-2">
              {(["Cash", "Mpesa"] as const).map((method) => (
                <Button
                  key={method}
                  variant={paymentMethod === method ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>

          {/* Amount Received */}
          {paymentMethod === "Cash" && (
            <div className="space-y-2">
              <Label htmlFor="amount-received">Amount Received</Label>
              <Input
                id="amount-received"
                type="number"
                value={amountReceived}
                onChange={(e) => {
                  setAmountReceived(e.target.value);
                  setError("");
                }}
                placeholder="0.00"
                autoFocus
              />
              <div className="grid grid-cols-3 gap-2 pt-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmountReceived(amount.toString())}
                  >
                    {amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          {/* Change Calculation */}
          {paymentMethod === "Cash" && change >= 0 && (
             <div className="!mt-4 rounded-lg border bg-secondary p-4 text-center">
                <p className="text-sm text-secondary-foreground">Change Due</p>
                <p className="text-3xl font-bold text-primary">
                    Ksh {change.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={paymentMethod === 'Cash' && numericAmountReceived < totalAmount}
          >
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
