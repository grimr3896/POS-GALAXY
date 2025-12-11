
"use client";

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/auth-context";
import { hasPermission } from "@/lib/permissions";
import { rolePermissions } from "@/lib/types";
import type { Role, Permission } from "@/lib/types";
import { Check, X } from "lucide-react";

const settingsSchema = z.object({
  appName: z.string().min(1, "App name is required."),
  currency: z.string(),
  idleTimeout: z.coerce.number().min(0),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const allPermissions: { group: string, permissions: { id: Permission, label: string}[] }[] = [
    { group: 'POS', permissions: [
        { id: 'page:pos', label: 'Access' }, { id: 'pos:create', label: 'Create' }, { id: 'pos:update', label: 'Update' }, { id: 'pos:delete', label: 'Delete' }, { id: 'pos:discount', label: 'Discount' }
    ]},
    { group: 'Inventory', permissions: [
        { id: 'page:inventory', label: 'Access' }, { id: 'inventory:create', label: 'Create' }, { id: 'inventory:update', label: 'Update' }, { id: 'inventory:delete', label: 'Delete' }
    ]},
    { group: 'Sales', permissions: [
        { id: 'page:sales-history', label: 'Access' }, { id: 'sales:read_all', label: 'Read All' }, { id: 'sales:read_own', label: 'Read Own' }, { id: 'sales:export', label: 'Export' }
    ]},
    { group: 'Employees', permissions: [
        { id: 'page:employees', label: 'Access' }, { id: 'employees:create', label: 'Create' }, { id: 'employees:update', label: 'Update' }, { id: 'employees:delete', label: 'Delete' }
    ]},
    { group: 'Settings', permissions: [
        { id: 'page:settings', label: 'Access' }, { id: 'settings:read', label: 'Read' }, { id: 'settings:update', label: 'Update' }
    ]},
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canUpdateSettings = hasPermission(user, 'settings:update');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appName: "Galaxy Inn",
      currency: "KSH",
      idleTimeout: 300,
    },
  });

  const onSubmit = (data: SettingsFormValues) => {
    // In a real app, you'd save these settings to a backend or localStorage
    console.log(data);
    toast({
      title: "Settings Saved",
      description: "Your new settings have been applied.",
    });
  };
  
  const roles = Object.keys(rolePermissions) as Role[];


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Manage general application settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input id="appName" {...register("appName")} disabled={!canUpdateSettings} />
            {errors.appName && <p className="text-sm text-destructive">{errors.appName.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={!canUpdateSettings}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KSH">KSH (Kenyan Shilling)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security & Permissions</CardTitle>
          <CardDescription>
            Control access levels and security features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="idleTimeout">Idle Timeout (seconds)</Label>
                <Input id="idleTimeout" type="number" {...register("idleTimeout")} placeholder="e.g., 300 for 5 minutes" disabled={!canUpdateSettings}/>
                <p className="text-xs text-muted-foreground">Automatically log out after a period of inactivity. Set to 0 to disable.</p>
                {errors.idleTimeout && <p className="text-sm text-destructive">{errors.idleTimeout.message}</p>}
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-medium">Role Permissions</h3>
                <p className="text-sm text-muted-foreground">Define which tabs and actions each role can access.</p>
            </div>
             <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Permission</TableHead>
                            {roles.map(role => <TableHead key={role} className="text-center">{role}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allPermissions.map(group => (
                            <React.Fragment key={group.group}>
                                <TableRow className="bg-muted/50">
                                    <TableCell colSpan={roles.length + 1} className="font-semibold">{group.group}</TableCell>
                                </TableRow>
                                {group.permissions.map(permission => (
                                    <TableRow key={permission.id}>
                                        <TableCell className="pl-6 text-muted-foreground">{permission.label}</TableCell>
                                        {roles.map(role => (
                                            <TableCell key={`${role}-${permission.id}`} className="text-center">
                                                {rolePermissions[role].includes(permission.id) 
                                                    ? <Check className="h-5 w-5 text-green-500 mx-auto" /> 
                                                    : <X className="h-5 w-5 text-destructive mx-auto" />}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      {canUpdateSettings && (
        <div className="flex justify-end">
          <Button type="submit">Save All Settings</Button>
        </div>
      )}
    </form>
  );
}
