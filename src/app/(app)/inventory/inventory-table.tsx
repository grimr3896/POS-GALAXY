"use client";

import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, InventoryItem } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";

interface InventoryTableProps {
  data: (Product & { inventory?: InventoryItem })[];
  isLoading?: boolean;
  onAddProduct: () => void;
  onEditProduct: (product: Product & { inventory?: InventoryItem }) => void;
  onDeleteProduct: (productId: number) => void;
}

export function InventoryTable({
  data,
  isLoading,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: InventoryTableProps) {
  const { user } = useAuth();
  const canEdit = user?.role === "Admin";

  const renderStock = (item: Product & { inventory?: InventoryItem }) => {
    if (!item.inventory) return <Badge variant="outline">N/A</Badge>;
    if (item.type === "bottle") {
      const stock = item.inventory.quantityUnits || 0;
      const isLow = stock <= item.thresholdQuantity;
      return (
        <Badge variant={isLow ? "destructive" : "secondary"}>
          {stock} units
        </Badge>
      );
    }
    if (item.type === "drum") {
      const stock = item.inventory.currentML || 0;
      const isLow = stock <= item.thresholdQuantity;
      return (
        <Badge variant={isLow ? "destructive" : "secondary"}>
          {(stock / 1000).toFixed(2)} L
        </Badge>
      );
    }
    return <Badge variant="outline">N/A</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Products</CardTitle>
          <Button onClick={onAddProduct}>Add Product</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Sell Price</TableHead>
              {canEdit && (
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    {canEdit && <TableCell><Skeleton className="h-8 w-8" /></TableCell>}
                  </TableRow>
                ))
              : data.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="40"
                        src={product.image}
                        width="40"
                        data-ai-hint="product image"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell className="hidden md:table-cell capitalize">
                      {product.type}
                    </TableCell>
                    <TableCell>{renderStock(product)}</TableCell>
                    <TableCell>Ksh {product.sellPrice.toLocaleString()}</TableCell>
                    {canEdit && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditProduct(product)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDeleteProduct(product.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
