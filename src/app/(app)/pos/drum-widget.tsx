"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product, InventoryItem, OrderItem, ProductPourVariant } from "@/lib/types";
import { createOrderItem } from "./pos-helpers";
import { cn } from "@/lib/utils";

interface DrumWidgetProps {
  drumProduct: Product & { inventory?: InventoryItem };
  onAddItem: (item: Omit<OrderItem, "id" | "totalPrice">) => void;
}

export function DrumWidget({ drumProduct, onAddItem }: DrumWidgetProps) {
  const { inventory, pourVariants } = drumProduct;
  const currentLevel = inventory?.currentML || 0;
  const capacity = inventory?.capacityML || 1;
  const fillPercentage = (currentLevel / capacity) * 100;
  
  const handlePour = (variant: ProductPourVariant) => {
    if (currentLevel >= variant.pourSizeML) {
      const orderItem = createOrderItem(drumProduct, 1, 'pour', variant);
      onAddItem(orderItem);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{drumProduct.name} Drum</CardTitle>
        <CardDescription>Select a pour size to add to the order.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        {/* Fill Level Indicator */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative h-48 w-32 rounded-lg bg-muted p-2 shadow-inner">
            <div
              className="absolute bottom-2 left-2 right-2 rounded-md bg-primary transition-all duration-500"
              style={{ height: `${fillPercentage}%` }}
            />
            <div className="relative z-10 flex h-full flex-col justify-end text-center text-primary-foreground mix-blend-difference">
               <div className="font-bold text-lg">{fillPercentage.toFixed(0)}%</div>
               <div className="text-xs">
                  {(currentLevel / 1000).toFixed(2)}L / {(capacity / 1000)}L
              </div>
            </div>
            {currentLevel === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <span className="font-bold text-destructive -rotate-45 text-2xl">EMPTY</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Pour Variant Buttons */}
        <div className="flex-1 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pourVariants?.map(variant => {
                    const isDisabled = currentLevel < variant.pourSizeML;
                    return (
                        <Card 
                            key={variant.id}
                            onClick={() => !isDisabled && handlePour(variant)}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 focus:ring-2 focus:ring-ring",
                                isDisabled && "cursor-not-allowed bg-muted/50 text-muted-foreground opacity-50"
                            )}
                        >
                            <CardContent className="p-3 text-center flex flex-col items-center justify-center">
                                <p className="font-bold text-base">{variant.name}</p>
                                <p className="text-xs text-muted-foreground">({variant.pourSizeML}ml)</p>
                                <p className="text-sm mt-1">Ksh {variant.sellPrice}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
