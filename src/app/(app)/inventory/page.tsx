
"use client";

import { useEffect, useState, useCallback } from "react";
import { getProductsWithInventory, saveProduct, deleteProduct } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { User, Product, InventoryItem } from "@/lib/types";
import { InventoryTable } from "./inventory-table";
import { ProductFormSheet } from "./product-form-sheet";
import { PasswordPromptDialog } from "./password-prompt-dialog";
import { useAuth } from "@/contexts/auth-context";
import { hasPermission } from "@/lib/permissions";

export default function InventoryPage() {
  const [products, setProducts] = useState<(Product & { inventory?: InventoryItem })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<(Product & { inventory?: InventoryItem }) | null>(null);
  const [productToAction, setProductToAction] = useState<(Product & { inventory?: InventoryItem }) | null>(null);
  const [actionToConfirm, setActionToConfirm] = useState<'edit' | 'delete' | null>(null);
  const [productIdToDelete, setProductIdToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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
    if (hasPermission(user, 'inventory:create')) {
      setEditingProduct(null);
      setIsSheetOpen(true);
    } else {
      toast({ variant: 'destructive', title: 'Permission Denied' });
    }
  };

  const handleEditRequest = (product: Product & { inventory?: InventoryItem }) => {
    if (hasPermission(user, 'inventory:update')) {
      setProductToAction(product);
      setActionToConfirm('edit');
      // For Admins/Managers, maybe skip password, for others, prompt
      if (user?.role === 'Admin' || user?.role === 'Manager') {
        handlePasswordConfirm("626-jarvis"); // Simulate auto-confirm for high roles
      } else {
        setIsPasswordDialogOpen(true);
      }
    } else {
      toast({ variant: 'destructive', title: 'Permission Denied' });
    }
  };

  const handleDeleteRequest = (productId: number) => {
    if (hasPermission(user, 'inventory:delete')) {
      setActionToConfirm('delete');
      setProductIdToDelete(productId);
      setIsPasswordDialogOpen(true);
    } else {
      toast({ variant: 'destructive', title: 'Permission Denied' });
    }
  };


  const handlePasswordConfirm = (password: string) => {
    // In a real app, this would be a proper password/permission check
    if (password === "626-jarvis") {
      if (actionToConfirm === 'edit' && productToAction) {
        setEditingProduct(productToAction);
        setIsSheetOpen(true);
      } else if (actionToConfirm === 'delete' && productIdToDelete !== null) {
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
    setProductToAction(null);
    setProductIdToDelete(null);
    setActionToConfirm(null);
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
        canAdd={hasPermission(user, 'inventory:create')}
        canEdit={hasPermission(user, 'inventory:update')}
        canDelete={hasPermission(user, 'inventory:delete')}
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
        title={`Enter Password to ${actionToConfirm}`}
        description="You need administrator permissions to modify product details."
      />
    </div>
  );
}
