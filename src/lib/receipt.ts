
import type { Transaction, User, AppSettings } from './types';

export function generateReceiptHtml(transaction: Transaction, user: User, settings: AppSettings): string {
    const sale = {
        appName: settings.appName || "Galaxy Inn",
        datetime: new Date(transaction.timestamp).toLocaleString(),
        cashier: user?.name || 'Unknown',
        items: transaction.items.map(i => ({
            qty: i.quantity,
            name: i.productName,
            total: i.lineTotal.toLocaleString()
        })),
        subtotal: `Ksh ${(transaction.total - (transaction.totalTax || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        tax: `Ksh ${(transaction.totalTax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        total: `Ksh ${transaction.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        cashAmount: `Ksh ${transaction.cashAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        mpesaAmount: `Ksh ${transaction.mpesaAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: `Ksh ${transaction.change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        transactionId: transaction.id
    };

    return `
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
                .item-row { display: grid; grid-template-columns: 1fr auto; gap: 4px; padding: 2px 0; }
                .item-name { word-break: break-word; }
                .item-details { display: flex; justify-content: space-between; }
                .totals-row { display: grid; grid-template-columns: 1fr auto; gap: 2px; }
            </style>
        </head>
        <body>
            <div class="center bold">${sale.appName}</div>
            <div class="center">Official Receipt</div>
            <div class="line"></div>
            <div>Date: ${sale.datetime}</div>
            <div>Cashier: ${sale.cashier}</div>
            <div>Receipt No: ${sale.transactionId}</div>
            <div class="line"></div>

            ${sale.items.map(i => `
                <div class="item-row">
                    <span class="item-name">${i.qty}x ${i.name}</span>
                    <span style="text-align: right;">${i.total}</span>
                </div>`
            ).join("")}

            <div class="line"></div>
            <div class="totals-row">
                <span>Subtotal:</span>
                <span>${sale.subtotal}</span>
            </div>
            <div class="totals-row">
                <span>Tax (incl):</span>
                <span>${sale.tax}</span>
            </div>
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
            <div class="center">Thank you for your business!</div>
            <div class="center">Powered by Galaxy POS</div>
        </body>
        </html>
    `;
}

export function printReceipt(receiptHtml: string) {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.top = "-10000px";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (doc) {
        doc.open();
        doc.write(receiptHtml);
        doc.close();
        
        printFrame.onload = () => {
            if (printFrame.contentWindow) {
                printFrame.contentWindow.focus();
                printFrame.contentWindow.print();
            }
            // Use a timeout to ensure print dialog has time to process before removing frame
            setTimeout(() => {
                if (document.body.contains(printFrame)) {
                    document.body.removeChild(printFrame);
                }
            }, 1000);
        };
    } else {
        // Fallback for when iframe creation fails
        console.error("Could not create print frame.");
        if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
        }
    }
}
