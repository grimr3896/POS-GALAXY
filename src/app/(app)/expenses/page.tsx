"use client";

import { useState, useEffect, useCallback } from "react";
import { getExpenses, saveExpense, deleteExpense, getUsers } from "@/lib/api";
import type { Expense, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ExpensesTable } from "./expenses-table";
import { ExpenseFormSheet } from "./expense-form-sheet";
import { useAuth } from "@/contexts/auth-context";
import { PasswordPromptDialog } from "@/app/(app)/inventory/password-prompt-dialog";


export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [expenseToAction, setExpenseToAction] = useState<{action: 'edit' | 'delete', expense: Expense | null}>({action: 'edit', expense: null});


  const fetchData = useCallback(() => {
    setLoading(true);
    setExpenses(getExpenses());
    setUsers(getUsers()); // Fetch users to display names
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsSheetOpen(true);
  };

  const handleEditRequest = (expense: Expense) => {
    setExpenseToAction({ action: 'edit', expense });
    setIsPasswordDialogOpen(true);
  };

  const handleDeleteRequest = (expenseId: number) => {
    const expense = expenses.find(e => e.id === expenseId);
    setExpenseToAction({ action: 'delete', expense: expense || null });
    setIsPasswordDialogOpen(true);
  };
  
  const handlePasswordConfirm = (password: string) => {
    if (password !== "626-jarvis") {
      toast({
        variant: "destructive",
        title: "Incorrect Password",
        description: "You do not have permission to perform this action.",
      });
      setIsPasswordDialogOpen(false);
      return;
    }

    if (expenseToAction.action === 'edit' && expenseToAction.expense) {
        setEditingExpense(expenseToAction.expense);
        setIsSheetOpen(true);
    } else if (expenseToAction.action === 'delete' && expenseToAction.expense) {
        try {
          deleteExpense(expenseToAction.expense.id);
          toast({ title: "Expense Deleted", description: "The expense has been removed." });
          fetchData();
        } catch (error: any) {
          toast({ variant: "destructive", title: "Error", description: error.message || "Could not delete the expense." });
        }
    }
    
    setIsPasswordDialogOpen(false);
    setExpenseToAction({action: 'edit', expense: null});
  };

  const handleFormSubmit = (values: any) => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to save an expense." });
        return;
    }
    try {
      const expenseData = { ...values, userId: user.id };
      saveExpense(expenseData);
      toast({
        title: editingExpense ? "Expense Updated" : "Expense Created",
        description: `The expense "${values.description}" has been saved.`,
      });
      setIsSheetOpen(false);
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save the expense.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <ExpensesTable
        data={expenses}
        users={users}
        isLoading={loading}
        onAddExpense={handleAddExpense}
        onEditExpense={handleEditRequest}
        onDeleteExpense={handleDeleteRequest}
      />
      <ExpenseFormSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleFormSubmit}
        expense={editingExpense}
      />
      <PasswordPromptDialog
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onConfirm={handlePasswordConfirm}
        title={`Enter Password to ${expenseToAction.action === 'edit' ? 'Edit' : 'Delete'} Expense`}
        description="You need administrator permissions to modify expenses."
      />
    </div>
  );
}
