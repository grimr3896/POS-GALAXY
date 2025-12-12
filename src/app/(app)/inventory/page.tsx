
"use client";

import { useEffect, useState, useCallback } from "react";
import { getProductsWithInventory, saveProduct, deleteProduct } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { User, Product, InventoryItem } from "@/lib/types";
import { InventoryTable } from "./inventory-table";
import { ProductFormSheet } from "./product-form-sheet";
import { PasswordPromptDialog } from "./password-prompt-dialog";

export default function InventoryPage() {
  const [products, setProducts] = useState<(Product & { inventory?: InventoryItem })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(Product & { inventory?: InventoryItem }) | null>(null);
  const [productIdToDelete, setProductIdToDelete] = useState<number | null>(null);
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
    setEditingProduct(product);
    setIsSheetOpen(true);
  };

  const handleDeleteRequest = (productId: number) => {
    setProductIdToDelete(productId);
    setIsPasswordDialogOpen(true);
  };


  const handlePasswordConfirm = (password: string) => {
    // In a real app, this would be a proper password/permission check
    if (password === "626-jarvis") {
      if (productIdToDelete !== null) {
          try {
            deleteProduct(productIdToDelete);
            toast({ title: "Product Deleted", description: "The product has been removed." });
            fetchData();
          } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete the product." });
          }
      }
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect Password",
        description: "You do not have permission to perform this action.",
      });
    }
    
    setIsPasswordDialogOpen(false);
    setProductIdToDelete(null);
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
        onDeleteProduct={handleDeleteRequest}
        canAdd={true}
        canEdit={true}
        canDelete={true}
      />
      {isSheetOpen && (
        <ProductFormSheet 
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onSubmit={handleFormSubmit}
          product={editingProduct}
        />
      )}
      <PasswordPromptDialog
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onConfirm={handlePasswordConfirm}
        title="Enter Password to Delete Product"
        description="You need administrator permissions to delete a product. This action cannot be undone."
      />
    </div>
  );
}
