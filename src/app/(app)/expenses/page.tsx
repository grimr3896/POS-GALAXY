"use client";

import { useState, useEffect, useCallback } from "react";
import { getExpenses, saveExpense, deleteExpense, getUsers } from "@/lib/api";
import type { Expense, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ExpensesTable } from "./expenses-table";
import { ExpenseFormSheet } from "./expense-form-sheet";
import { useAuth } from "@/contexts/auth-context";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsSheetOpen(true);
  };

  const handleDeleteExpense = (expenseId: number) => {
    try {
      deleteExpense(expenseId);
      toast({ title: "Expense Deleted", description: "The expense has been removed." });
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not delete the expense." });
    }
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
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpense}
      />
      <ExpenseFormSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleFormSubmit}
        expense={editingExpense}
      />
    </div>
  );
}
