"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, saveUser, deleteUser } from "@/lib/api";
import type { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { EmployeeTable } from "./employees-table";
import { EmployeeFormSheet } from "./employee-form-sheet";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(() => {
    setLoading(true);
    setEmployees(getUsers());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsSheetOpen(true);
  };

  const handleEditEmployee = (employee: User) => {
    setEditingEmployee(employee);
    setIsSheetOpen(true);
  };

  const handleDeleteEmployee = (userId: number) => {
    try {
      deleteUser(userId);
      toast({ title: "Employee Deleted", description: "The employee has been removed." });
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not delete the employee." });
    }
  };

  const handleFormSubmit = (values: any) => {
    try {
      saveUser(values);
      toast({
        title: editingEmployee ? "Employee Updated" : "Employee Created",
        description: `The employee "${values.name}" has been saved.`,
      });
      setIsSheetOpen(false);
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save the employee.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <EmployeeTable
        data={employees}
        isLoading={loading}
        onAddEmployee={handleAddEmployee}
        onEditEmployee={handleEditEmployee}
        onDeleteEmployee={handleDeleteEmployee}
      />
      <EmployeeFormSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleFormSubmit}
        employee={editingEmployee}
      />
    </div>
  );
}
