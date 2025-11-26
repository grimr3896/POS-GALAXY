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
import type { Transaction, User, TransactionItem, Product } from "@/lib/types";
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
import { getProducts } from "@/lib/api";
import { useMemo } from "react";

interface SalesHistoryTableProps {
  transactions: Transaction[];
  users: User[];
  isLoading?: boolean;
  onViewTransaction: (transaction: Transaction) => void;
}

const formatCurrency = (amount: number | undefined | null) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return `—`;
    }
    return `Ksh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


export function SalesHistoryTable({ transactions, users, isLoading, onViewTransaction }: SalesHistoryTableProps) {
    
  const allProducts = useMemo(() => getProducts(), []);

  const formatItems = (items: TransactionItem[]) => {
    if (!items || items.length === 0) return { full: '', truncated: ''};
    
    const grouped = items.reduce((acc, item) => {
      const name = item.productName;

      if (!acc[name]) {
        acc[name] = { quantity: 0 };
      }
      acc[name].quantity += item.quantity;
      
      return acc;
    }, {} as Record<string, { quantity: number }>);

    const formattedItems = Object.entries(grouped)
      .map(([name, { quantity }]) => {
        return `${quantity}x ${name}`;
      });

    const full = formattedItems.join('; ');
    const truncated = formattedItems.length > 2 
        ? `${formattedItems.slice(0, 2).join(', ')}, ...`
        : formattedItems.join(', ');

    return { full, truncated };
};

  const getUserName = (userId: number) => {
    return users.find(u => u.id === userId)?.name || "Unknown";
  };

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
                        <span className="truncate" title={formatItems(t.items).full}>
                            {formatItems(t.items).truncated}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(t.totalAmount)}</TableCell>
                    <TableCell className={cn("text-right", (t.profit || 0) < 0 && "text-destructive")}>
                        {formatCurrency(t.profit)}
                    </TableCell>
                    <TableCell>{t.paymentMethod}</TableCell>
                    <TableCell>{format(new Date(t.timestamp), "PPp")}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'Completed' ? 'default' : t.status === 'Reversed' ? 'destructive' : 'secondary'}>
                        {t.status}
                      </Badge>
                    </TableCell>
                     <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" disabled={t.status === 'Reversed'}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => onViewTransaction(t)}>
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
