"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, saveUser, deleteUser } from "@/lib/api";
import type { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { EmployeeTable } from "./employees-table";
import { EmployeeFormSheet } from "./employee-form-sheet";
import { PasswordPromptDialog } from "@/app/(app)/inventory/password-prompt-dialog";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<User | null>(null);

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

  const handleEditRequest = (employee: User) => {
    setEmployeeToEdit(employee);
    setIsPasswordDialogOpen(true);
  };
  
  const handlePasswordConfirm = (password: string) => {
    if (password === "626-jarvis") {
      setEditingEmployee(employeeToEdit);
      setIsSheetOpen(true);
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect Password",
        description: "You do not have permission to edit employees.",
      });
    }
    setIsPasswordDialogOpen(false);
    setEmployeeToEdit(null);
  };

  const handleDeleteEmployee = (userId: number) => {
    const password = prompt("Please enter the password to delete this employee:");
    if (password === "626-jarvis") {
        try {
        deleteUser(userId);
        toast({ title: "Employee Deleted", description: "The employee has been removed." });
        fetchData();
        } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not delete the employee." });
        }
    } else if (password !== null) {
        toast({
            variant: "destructive",
            title: "Incorrect Password",
            description: "You do not have permission to delete this employee.",
      });
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
        onEditEmployee={handleEditRequest}
        onDeleteEmployee={handleDeleteEmployee}
      />
      <EmployeeFormSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleFormSubmit}
        employee={editingEmployee}
      />
       <PasswordPromptDialog
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onConfirm={handlePasswordConfirm}
        title="Enter Password to Edit Employee"
        description="You need administrator permissions to modify employee details."
      />
    </div>
  );
}
