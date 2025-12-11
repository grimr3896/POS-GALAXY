
"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, saveUser, deleteUser } from "@/lib/api";
import type { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { EmployeeTable } from "./employees-table";
import { EmployeeFormSheet } from "./employee-form-sheet";
import { PasswordPromptDialog } from "@/app/(app)/inventory/password-prompt-dialog";
import { useAuth } from "@/contexts/auth-context";
import { hasPermission } from "@/lib/permissions";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<User | null>(null);
  const [actionToConfirm, setActionToConfirm] = useState<'edit' | 'delete' | null>(null);
  const [employeeIdToDelete, setEmployeeIdToDelete] = useState<number | null>(null);
  const { user } = useAuth();

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
    if (hasPermission(user, 'employees:update')) {
      setEditingEmployee(employee);
      setIsSheetOpen(true);
    } else {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "You do not have permission to edit employees.",
      });
    }
  };
  
  const handleDeleteRequest = (employeeId: number) => {
    if (hasPermission(user, 'employees:delete')) {
        setActionToConfirm('delete');
        setEmployeeIdToDelete(employeeId);
        setIsPasswordDialogOpen(true);
    } else {
         toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "You do not have permission to delete employees.",
      });
    }
  };

  const handlePasswordConfirm = (password: string) => {
    if (password === "626-jarvis") { // This should be a more secure check
        if(actionToConfirm === 'delete' && employeeIdToDelete !== null) {
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
    setActionToConfirm(null);
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
        canAdd={hasPermission(user, 'employees:create')}
        canEdit={hasPermission(user, 'employees:update')}
        canDelete={hasPermission(user, 'employees:delete')}
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
