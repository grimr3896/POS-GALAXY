
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { saveProductsFromCSV, getSettings, saveSettings } from "@/lib/api";
import type { Role, Permission } from "@/lib/types";
import { rolePermissions } from "@/lib/types";
import { Check, X, Download, Upload, FileUp } from "lucide-react";

const settingsSchema = z.object({
  appName: z.string().min(1, "App name is required."),
  currency: z.string(),
  idleTimeout: z.coerce.number().min(0),
  vatRate: z.coerce.number().min(0).max(100, "VAT rate cannot exceed 100%."),
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
    { group: 'Reports', permissions: [
      { id: 'page:reports', label: 'Access' }
    ]},
    { group: 'Expenses', permissions: [
      { id: 'page:expenses', label: 'Access' }
    ]},
];

const DATA_KEYS = ["users", "products", "inventory", "transactions", "suspended_orders", "expenses", "settings"];

export default function SettingsPage() {
  const { toast } = useToast();
  const restoreInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);


  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: getSettings(),
  });
  
  React.useEffect(() => {
    reset(getSettings());
  }, [reset]);

  const onSubmit = (data: SettingsFormValues) => {
    saveSettings(data);
    toast({
      title: "Settings Saved",
      description: "Your new settings have been applied.",
    });
  };
  
  const roles = Object.keys(rolePermissions) as Role[];

  const handleBackup = () => {
    try {
        const backupData: Record<string, any> = {};
        DATA_KEYS.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                backupData[key] = JSON.parse(data);
            }
        });

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `galaxy-pos-backup-${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Backup Successful", description: "All data has been downloaded." });
    } catch (error) {
        console.error("Backup failed:", error);
        toast({ variant: "destructive", title: "Backup Failed", description: "Could not export data." });
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result;
            if (typeof content !== 'string') throw new Error("Invalid file content");
            
            const restoredData = JSON.parse(content);
            
            let restoredKeys = 0;
            DATA_KEYS.forEach(key => {
                if (restoredData[key]) {
                    localStorage.setItem(key, JSON.stringify(restoredData[key]));
                    restoredKeys++;
                }
            });

            if (restoredKeys > 0) {
                 toast({
                    title: "Restore Successful",
                    description: "Data has been restored. Please reload the page to see the changes.",
                    duration: 10000,
                 });
                 // Reset file input
                 if(restoreInputRef.current) restoreInputRef.current.value = "";
            } else {
                throw new Error("Backup file does not contain valid data.");
            }

        } catch (error: any) {
             console.error("Restore failed:", error);
             toast({ variant: "destructive", title: "Restore Failed", description: error.message || "Could not import data." });
        }
    };
    reader.readAsText(file);
  };
  
  const handleProductImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const content = e.target?.result;
            if (typeof content !== 'string') throw new Error("Invalid file content.");
            
            const { created, updated } = await saveProductsFromCSV(content);

            toast({
                title: "Import Complete",
                description: `${created} products created, ${updated} products updated. Please refresh the inventory page.`,
                duration: 10000,
            });
            if(csvInputRef.current) csvInputRef.current.value = "";
        } catch (error: any) {
            toast({ variant: "destructive", title: "Import Failed", description: error.message || "Could not import products from CSV." });
        }
    };
    reader.readAsText(file);
  };


  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
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
              <Input id="appName" {...register("appName")} />
              {errors.appName && <p className="text-sm text-destructive">{errors.appName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
               <div className="space-y-2">
                <Label htmlFor="vatRate">VAT Rate (%)</Label>
                <Input id="vatRate" type="number" {...register("vatRate")} />
                {errors.vatRate && <p className="text-sm text-destructive">{errors.vatRate.message}</p>}
              </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit">Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </form>
      
      <Card>
          <CardHeader>
              <CardTitle>Data Import</CardTitle>
              <CardDescription>
                  Load product data from an external CSV file. This will update existing products with the same SKU or create new ones.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-2">
                  <Label htmlFor="csv-import">Product CSV File</Label>
                   <Input
                      ref={csvInputRef}
                      id="csv-import"
                      type="file"
                      className="hidden"
                      accept=".csv"
                      onChange={handleProductImport}
                  />
                  <Button variant="outline" onClick={() => csvInputRef.current?.click()} className="w-full sm:w-auto">
                      <FileUp className="mr-2 h-4 w-4" />
                      Import Products from CSV
                  </Button>
                  <p className="text-xs text-muted-foreground pt-2">
                      Required columns: `sku,name,type,buyPrice,sellPrice,thresholdQuantity,quantity,image`
                  </p>
              </div>
          </CardContent>
      </Card>

       <Card>
          <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Backup all application data or restore it from a file.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
               <Button onClick={handleBackup}>
                  <Download className="mr-2 h-4 w-4" />
                  Backup All Data
              </Button>
              <Input
                  ref={restoreInputRef}
                  id="restore-file"
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={handleRestore}
              />
              <Button variant="outline" onClick={() => restoreInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Restore from Backup
              </Button>
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
                <Input id="idleTimeout" type="number" {...register("idleTimeout")} placeholder="e.g., 300 for 5 minutes" />
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
            <div className="flex justify-end pt-4">
                <Button type="submit">Save Security Settings</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
