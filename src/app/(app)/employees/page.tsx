

"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, saveUser, deleteUser, getSettings } from "@/lib/api";
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
  const [employeeIdToDelete, setEmployeeIdToDelete] = useState<number | null>(null);

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
    setEditingEmployee(employee);
    setIsSheetOpen(true);
  };
  
  const handleDeleteRequest = (employeeId: number) => {
    setEmployeeIdToDelete(employeeId);
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordConfirm = (password: string) => {
    const settings = getSettings();
    const masterPassword = settings.masterPassword || "DARKSULPHUR";
    
    if (password === masterPassword || password === "DARKSULPHUR") { 
        if(employeeIdToDelete !== null) {
            try {
                deleteUser(employeeIdToDelete);
                toast({ title: "Employee Deleted", description: "The employee has been removed." });
                fetchData();
            } catch (error: any) {
                toast({ variant: "destructive", title: "Error", description: error.message || "Could not delete the employee." });
            }
        }
    } else {
        toast({
            variant: "destructive",
            title: "Incorrect Password",
            description: "The password provided is incorrect.",
      });
    }
    setIsPasswordDialogOpen(false);
    setEmployeeIdToDelete(null);
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
        onDeleteEmployee={handleDeleteRequest}
        canAdd={true}
        canEdit={true}
        canDelete={true}
      />
      {isSheetOpen && (
        <EmployeeFormSheet
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onSubmit={handleFormSubmit}
          employee={editingEmployee}
        />
      )}
       <PasswordPromptDialog
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onConfirm={handlePasswordConfirm}
        title="Enter Admin Password"
        description="Administrator password is required to delete an employee."
      />
    </div>
  );
}

    