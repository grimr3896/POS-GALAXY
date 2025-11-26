"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product, InventoryItem, OrderItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createOrderItem } from "./pos-helpers";

interface DrumWidgetProps {
  product: Product & { inventory?: InventoryItem };
  onAddItem: (item: Omit<OrderItem, "id" | "totalPrice">) => void;
}

const pourSizes = [250, 500, 1000]; // in ml

export function DrumWidget({ product, onAddItem }: DrumWidgetProps) {
  const { inventory } = product;
  const currentLevel = inventory?.currentML || 0;
  const capacity = inventory?.capacityML || 1;
  const fillPercentage = (currentLevel / capacity) * 100;

  const handlePour = (amountML: number) => {
    if (currentLevel >= amountML) {
      const orderItem = createOrderItem(product, amountML, 'drum');
      onAddItem(orderItem);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name} Drum</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 md:flex-row">
        <div className="relative h-48 w-32 rounded-lg bg-muted p-2 shadow-inner">
          <div
            className="absolute bottom-2 left-2 right-2 rounded-md bg-primary transition-all duration-500"
            style={{ height: `${fillPercentage}%` }}
          />
          <div className="relative z-10 flex h-full flex-col justify-end text-center text-primary-foreground">
             <div className="font-bold text-lg">{fillPercentage.toFixed(0)}%</div>
             <div className="text-xs">
                {(currentLevel / 1000).toFixed(2)}L / {(capacity / 1000)}L
            </div>
          </div>
          {currentLevel === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="font-bold text-destructive -rotate-45 text-2xl">EMPTY</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
            <p className="text-sm text-muted-foreground">Select a pour size:</p>
            <div className="grid grid-cols-3 gap-3">
                {pourSizes.map(size => (
                    <Button key={size} variant="outline" size="lg" disabled={currentLevel < size} onClick={() => handlePour(size)}>
                        {size < 1000 ? `${size}ml` : `${size/1000}L`}
                    </Button>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
