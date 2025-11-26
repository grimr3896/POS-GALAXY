"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EmployeeTableProps {
  data: User[];
  isLoading?: boolean;
  onAddEmployee: () => void;
  onEditEmployee: (employee: User) => void;
  onDeleteEmployee: (employeeId: number) => void;
}

export function EmployeeTable({
  data,
  isLoading,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
}: EmployeeTableProps) {
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Employees</CardTitle>
            <CardDescription>Manage your staff members and their roles.</CardDescription>
          </div>
          <Button onClick={onAddEmployee}>Add Employee</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Card ID</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              : data.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${employee.name}.png`} alt={employee.name} />
                          <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{employee.role}</Badge>
                    </TableCell>
                    <TableCell>{employee.companyCardId}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditEmployee(employee)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDeleteEmployee(employee.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
