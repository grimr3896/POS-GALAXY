"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Product, InventoryItem, OrderItem } from "@/lib/types";
import { DrumWidget } from "./drum-widget";
import { createOrderItem } from "./pos-helpers";

interface ProductGridProps {
  products: (Product & { inventory?: InventoryItem })[];
  drumProduct: Product & { inventory?: InventoryItem };
  onAddItem: (item: Omit<OrderItem, "id" | "totalPrice">) => void;
}

export function ProductGrid({ products, drumProduct, onAddItem }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBottle = (product: Product & { inventory?: InventoryItem }) => {
    if (product.inventory && product.inventory.quantityUnits && product.inventory.quantityUnits > 0) {
      const orderItem = createOrderItem(product, 1, 'bottle');
      onAddItem(orderItem);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <DrumWidget product={drumProduct} onAddItem={onAddItem} />

      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bottled Products</CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              onClick={() => handleAddBottle(product)}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  data-ai-hint="product image"
                />
                {(product.inventory?.quantityUnits ?? 0) <= 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="font-bold text-white">OUT OF STOCK</span>
                  </div>
                )}
              </div>
              <div className="p-2 text-center">
                <p className="truncate font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Ksh {product.sellPrice.toLocaleString()}
                </p>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
