"use client";

import { useEffect, useState } from "react";
import { getProductsWithInventory } from "@/lib/api";
import type { Product, InventoryItem } from "@/lib/types";
import { InventoryTable } from "./inventory-table";

export default function InventoryPage() {
  const [products, setProducts] = useState<(Product & { inventory?: InventoryItem })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This should only run on the client
    const fetchData = () => {
      setLoading(true);
      const data = getProductsWithInventory();
      setProducts(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <InventoryTable data={products} isLoading={loading} />
    </div>
  );
}
