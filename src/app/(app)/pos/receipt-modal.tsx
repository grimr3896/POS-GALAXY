

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
    const sale = {
        datetime: new Date(transaction.timestamp).toLocaleString(),
        cashier: user?.name || 'Unknown',
        items: transaction.items.map(i => ({
            qty: i.quantity,
            name: i.productName,
            total: i.lineTotal.toLocaleString()
        })),
        total: `Ksh ${transaction.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        cashAmount: `Ksh ${transaction.cashAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        mpesaAmount: `Ksh ${transaction.mpesaAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: `Ksh ${transaction.change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        transactionId: transaction.id
    };

    let receiptHTML = `
        <html>
        <head>
            <style>
                @page {
                    size: 58mm auto; /* Standard thermal printer paper width */
                    margin: 2mm;
                }
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                    line-height: 1.4;
                    padding: 0;
                    margin: 0;
                    color: #000;
                }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .line { border-top: 1px dashed #000; margin: 4px 0; }
                .item-row { display: grid; grid-template-columns: 1fr auto; gap: 4px; }
                .item-name { word-break: break-all; }
                .totals-row { display: grid; grid-template-columns: 1fr auto; gap: 2px; }
                .logo {
                    width: 40px;
                    height: 40px;
                    margin: 0 auto;
                }
            </style>
        </head>
        <body>
            <div class="center bold">GALAXY INN BAR</div>
            <div class="center">Official Receipt</div>
            <div class="line"></div>
            <div>Date: ${sale.datetime}</div>
            <div>Cashier: ${sale.cashier}</div>
            <div>Receipt No: ${sale.transactionId}</div>
            <div class="line"></div>

            ${sale.items.map(i => `
                <div>${i.qty} x ${i.name}</div>
                <div class="item-row">
                    <span class="item-name"></span>
                    <span>${i.total}</span>
                </div>`
            ).join("")}

            <div class="line"></div>
            <div class="totals-row bold">
                <span>TOTAL:</span>
                <span>${sale.total}</span>
            </div>

            <div class="line"></div>
            
            ${transaction.cashAmount > 0 ? `<div class="totals-row"><span>Paid (Cash):</span><span>${sale.cashAmount}</span></div>` : ''}
            ${transaction.mpesaAmount > 0 ? `<div class="totals-row"><span>Paid (M-Pesa):</span><span>${sale.mpesaAmount}</span></div>` : ''}
            <div class="totals-row">
                <span>Change:</span>
                <span>${sale.change}</span>
            </div>

            <div class="line"></div>
            <div class="center">Thank you!</div>
            <div class="center">Please drink responsibly</div>
        </body>
        </html>
    `;

    // create iframe for printing
    let printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.top = "-10000px";
    document.body.appendChild(printFrame);

    let doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(receiptHTML);
    doc.close();

    printFrame.onload = () => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        setTimeout(() => document.body.removeChild(printFrame), 500);
    };
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
           <div className="my-4 space-y-1 text-sm">
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
