"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, saveUser, deleteUser } from "@/lib/api";
import type { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { EmployeeTable } from "./employees-table";
import { EmployeeFormSheet } from "./employee-form-sheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const { toast } = useToast();
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

  if (user?.role !== "Admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
          <Users className="h-16 w-16" />
          <p>Contact an administrator for access.</p>
        </CardContent>
      </Card>
    );
  }

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
