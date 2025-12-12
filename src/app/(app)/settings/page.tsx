
"use client";

import React, { useState, useEffect } from 'react';
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { saveProductsFromCSV, getSettings, saveSettings } from "@/lib/api";
import type { AppSettings } from "@/lib/types";
import { Download, Upload, FileUp, LayoutDashboard, ShoppingCart, Archive, Users, Settings, History, FileText, Landmark, Wallet } from "lucide-react";

const settingsSchema = z.object({
  appName: z.string().min(1, "App name is required."),
  currency: z.string(),
  idleTimeout: z.coerce.number().min(0),
  vatRate: z.coerce.number().min(0).max(100, "VAT rate cannot exceed 100%."),
  masterPassword: z.string().optional(),
  lockedTabs: z.array(z.string()).optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const allTabs = [
  { id: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "/pos", label: "Point of Sale", icon: ShoppingCart },
  { id: "/inventory", label: "Inventory", icon: Archive },
  { id: "/sales-history", label: "Sales History", icon: History },
  { id: "/expenses", label: "Expenses", icon: Landmark },
  { id: "/cash-up", label: "Cash Up", icon: Wallet },
  { id: "/reports", label: "Reports", icon: FileText },
  { id: "/employees", label: "Employees", icon: Users },
  { id: "/settings", label: "Settings", icon: Settings },
];

const DATA_KEYS = ["users", "products", "inventory", "transactions", "suspended_orders", "expenses", "settings"];

export default function SettingsPage() {
  const { toast } = useToast();
  const restoreInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);
  const [initialSettings, setInitialSettings] = useState<SettingsFormValues>(getSettings());


  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings,
  });
  
  useEffect(() => {
    reset(initialSettings);
  }, [initialSettings, reset]);

  const onSubmit = (data: SettingsFormValues) => {
    saveSettings(data);
    setInitialSettings(data); // update state to reflect saved changes
    toast({
      title: "Settings Saved",
      description: "Your new settings have been applied. Some changes may require a page reload.",
    });
  };
  
  const handleTabLockChange = (tabId: string, isLocked: boolean) => {
    const currentLockedTabs = getValues("lockedTabs") || [];
    let newLockedTabs;
    if (isLocked) {
      newLockedTabs = [...currentLockedTabs, tabId];
    } else {
      newLockedTabs = currentLockedTabs.filter(id => id !== tabId);
    }
    setValue("lockedTabs", newLockedTabs, { shouldDirty: true });
  };

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
                 window.location.reload();
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage master password and tab access controls.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="masterPassword">Master Password</Label>
                <Input id="masterPassword" type="password" {...register("masterPassword")} placeholder="Enter new password to change" />
                <p className="text-xs text-muted-foreground">Used for critical actions like editing inventory or unlocking tabs. Leave blank to keep the current password.</p>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="idleTimeout">Idle Timeout (seconds)</Label>
                  <Input id="idleTimeout" type="number" {...register("idleTimeout")} placeholder="e.g., 300 for 5 minutes" />
                  <p className="text-xs text-muted-foreground">Automatically log out after a period of inactivity. Set to 0 to disable.</p>
                  {errors.idleTimeout && <p className="text-sm text-destructive">{errors.idleTimeout.message}</p>}
              </div>

              <Separator />

              <div>
                  <h3 className="text-lg font-medium">Tab Access Control</h3>
                  <p className="text-sm text-muted-foreground">Toggle to lock or unlock specific tabs. Unlocking requires the master password.</p>
              </div>
              <div className="overflow-x-auto rounded-md border">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Tab</TableHead>
                              <TableHead className="text-right">Lock Status</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allTabs.map(tab => (
                          <TableRow key={tab.id}>
                              <TableCell>
                                <div className="flex items-center gap-2 font-medium">
                                  <tab.icon className="h-4 w-4" />
                                  {tab.label}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {tab.id === '/settings' ? (
                                    <span className="text-xs text-muted-foreground italic">Always Unlocked</span>
                                ) : (
                                    <Controller
                                      name="lockedTabs"
                                      control={control}
                                      render={({ field }) => (
                                        <Switch
                                          checked={field.value?.includes(tab.id)}
                                          onCheckedChange={(checked) => handleTabLockChange(tab.id, checked)}
                                        />
                                      )}
                                    />
                                )}
                              </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                  </Table>
              </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button type="submit">Save All Settings</Button>
        </div>
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

    </div>
  );
}
