"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, InventoryItem } from "@/lib/types";

interface StockAlertsTableProps {
  data: (Product & { inventory?: InventoryItem })[] | undefined;
  isLoading?: boolean;
}

export function StockAlertsTable({ data, isLoading }: StockAlertsTableProps) {
  const renderCurrentStock = (item: Product & { inventory?: InventoryItem }) => {
    if (!item.inventory) return 'N/A';
    if (item.type === 'bottle') {
      return `${item.inventory.quantityUnits || 0} units`;
    }
    if (item.type === 'drum') {
      return `${((item.inventory.currentML || 0) / 1000).toFixed(2)} L`;
    }
    return 'N/A';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Alerts</CardTitle>
        <CardDescription>
          Products at or below their stock threshold.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right text-destructive">
                      {renderCurrentStock(item)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No low stock items.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
