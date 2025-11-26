"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { User } from "@/lib/types";
import { useEffect } from "react";

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  role: z.enum(["Admin", "Cashier", "Manager"]),
  companyCardId: z.string().min(4, "Card ID must be at least 4 characters."),
});

type FormValues = z.infer<typeof formSchema>;

interface EmployeeFormSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: FormValues) => void;
  employee: User | null;
}

export function EmployeeFormSheet({ isOpen, onOpenChange, onSubmit, employee }: EmployeeFormSheetProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "Cashier",
    },
  });

  useEffect(() => {
    if (isOpen && employee) {
      reset(employee);
    } else if (isOpen && !employee) {
      reset({
        id: undefined,
        name: "",
        role: "Cashier",
        companyCardId: "",
      });
    }
  }, [employee, isOpen, reset]);
  
  const formTitle = employee ? "Edit Employee" : "Add New Employee";
  const formDescription = employee
    ? "Update the details of this employee."
    : "Fill in the details for the new employee.";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>{formTitle}</SheetTitle>
            <SheetDescription>{formDescription}</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" {...register("name")} className="col-span-3" />
              {errors.name && <p className="col-span-4 text-right text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyCardId" className="text-right">Card ID</Label>
              <Input id="companyCardId" {...register("companyCardId")} className="col-span-3" />
              {errors.companyCardId && <p className="col-span-4 text-right text-sm text-destructive">{errors.companyCardId.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Changes</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
