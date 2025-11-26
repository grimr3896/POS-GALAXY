"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction, User, TransactionItem } from "@/lib/types";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesHistoryTableProps {
  transactions: Transaction[];
  users: User[];
  isLoading?: boolean;
}

const formatCurrency = (amount: number | undefined | null) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return `—`;
    }
    return `Ksh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function SalesHistoryTable({ transactions, users, isLoading }: SalesHistoryTableProps) {
    
  const getUserName = (userId: number) => {
    return users.find(u => u.id === userId)?.name || "Unknown";
  };

  const getItemsSummary = (items: TransactionItem[]) => {
    if (!items || items.length === 0) return '—';
    
    const itemMap = new Map<string, { quantity: number; productName: string; type: 'bottle' | 'drum' }>();

    items.forEach(item => {
      const key = item.productId;
      const existing = itemMap.get(String(key));

      if (existing && item.productName.includes('(Pour)')) {
        existing.quantity += item.quantity;
      } else {
        // Use a unique key for non-pourable items to list them separately
        const mapKey = item.productName.includes('(Pour)') ? String(key) : `${key}-${item.id}`;
        itemMap.set(mapKey, { 
          quantity: item.quantity, 
          productName: item.productName,
          type: item.productName.includes('(Pour)') ? 'drum' : 'bottle',
        });
      }
    });

    return Array.from(itemMap.values()).map(item => {
        const name = item.productName.replace(' (Pour)', '');
        const quantity = item.type === 'drum' ? `${item.quantity}ml` : `×${item.quantity}`;
        return `${name} ${quantity}`;
    }).join(', ');
  }

  return (
    <div className="w-full overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={9}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              : transactions.length > 0 ? transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.id}</TableCell>
                    <TableCell>{getUserName(t.userId)}</TableCell>
                    <TableCell>
                        <span title={getItemsSummary(t.items)}>
                            {getItemsSummary(t.items)}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(t.totalAmount)}</TableCell>
                    <TableCell className={cn("text-right", (t.profit || 0) < 0 && "text-destructive")}>
                        {formatCurrency(t.profit)}
                    </TableCell>
                    <TableCell>{t.paymentMethod}</TableCell>
                    <TableCell>{format(new Date(t.timestamp), "PPp")}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'Completed' ? 'default' : 'secondary'}>
                        {t.status}
                      </Badge>
                    </TableCell>
                     <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                        No transactions found for the selected filters.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
    </div>
  );
}
