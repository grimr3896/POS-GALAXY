"use client";

import { useEffect, useState, useCallback } from "react";
import { getProductsWithInventory, saveProduct, deleteProduct } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Product, InventoryItem } from "@/lib/types";
import { InventoryTable } from "./inventory-table";
import { ProductFormSheet } from "./product-form-sheet";
import { PasswordPromptDialog } from "./password-prompt-dialog";

export default function InventoryPage() {
  const [products, setProducts] = useState<(Product & { inventory?: InventoryItem })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(Product & { inventory?: InventoryItem }) | null>(null);
  const [productToEdit, setProductToEdit] = useState<(Product & { inventory?: InventoryItem }) | null>(null);
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

  const handleEditRequest = (product: Product & { inventory?: InventoryItem }) => {
    setProductToEdit(product);
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordConfirm = (password: string) => {
    if (password === "626-jarvis") {
      setEditingProduct(productToEdit);
      setIsSheetOpen(true);
      setIsPasswordDialogOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect Password",
        description: "You do not have permission to edit product details.",
      });
      setIsPasswordDialogOpen(false);
    }
    setProductToEdit(null);
  };

  const handleDeleteProduct = (productId: number) => {
    const password = prompt("Please enter the password to delete this product:");
     if (password === "626-jarvis") {
        try {
          deleteProduct(productId);
          toast({ title: "Product Deleted", description: "The product has been removed." });
          fetchData();
        } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Could not delete the product." });
        }
    } else if (password !== null) {
         toast({
            variant: "destructive",
            title: "Incorrect Password",
            description: "You do not have permission to delete this product.",
      });
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
        onEditProduct={handleEditRequest}
        onDeleteProduct={handleDeleteProduct}
      />
      <ProductFormSheet 
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleFormSubmit}
        product={editingProduct}
      />
      <PasswordPromptDialog
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onConfirm={handlePasswordConfirm}
        title="Enter Password to Edit"
        description="You need administrator permissions to modify product details."
      />
    </div>
  );
}
