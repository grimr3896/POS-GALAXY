"use client";

import { useEffect, useState, useCallback } from "react";
import { getProductsWithInventory, saveProduct, deleteProduct } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Product, InventoryItem } from "@/lib/types";
import { InventoryTable } from "./inventory-table";
import { ProductFormSheet } from "./product-form-sheet";

export default function InventoryPage() {
  const [products, setProducts] = useState<(Product & { inventory?: InventoryItem })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [editingProduct, setEditingProduct] = useState<(Product & { inventory?: InventoryItem }) | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(() => {
    setLoading(true);
    const data = getProductsWithInventory();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsSheetOpen(true);
  };

  const handleEditProduct = (product: Product & { inventory?: InventoryItem }) => {
    setEditingProduct(product);
    setIsSheetOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    try {
      deleteProduct(productId);
      toast({ title: "Product Deleted", description: "The product has been removed." });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete the product." });
    }
  };
  
  const handleFormSubmit = (values: any) => {
    try {
      saveProduct(values);
      toast({
        title: editingProduct ? "Product Updated" : "Product Created",
        description: `The product "${values.name}" has been saved.`,
      });
      setIsSheetOpen(false);
      fetchData();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save the product.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <InventoryTable
        data={products}
        isLoading={loading}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />
      <ProductFormSheet 
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleFormSubmit}
        product={editingProduct}
      />
    </div>
  );
}
