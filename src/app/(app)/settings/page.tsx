"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

const roleSchema = z.object({
  name: z.string(),
  canAccessPOS: z.boolean(),
  canAccessInventory: z.boolean(),
  canAccessSalesHistory: z.boolean(),
  canAccessEmployees: z.boolean(),
  canAccessSettings: z.boolean(),
});

const settingsSchema = z.object({
  appName: z.string().min(1, "App name is required."),
  currency: z.string(),
  taxRate: z.coerce.number().min(0).max(100),
  idleTimeout: z.coerce.number().min(0),
  roles: z.array(roleSchema),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();

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
      taxRate: 16,
      idleTimeout: 300,
      roles: [
          { name: 'Admin', canAccessPOS: true, canAccessInventory: true, canAccessSalesHistory: true, canAccessEmployees: true, canAccessSettings: true },
          { name: 'Manager', canAccessPOS: true, canAccessInventory: true, canAccessSalesHistory: true, canAccessEmployees: false, canAccessSettings: false },
          { name: 'Cashier', canAccessPOS: true, canAccessInventory: false, canAccessSalesHistory: false, canAccessEmployees: false, canAccessSettings: false },
          { name: 'Waiter', canAccessPOS: true, canAccessInventory: false, canAccessSalesHistory: false, canAccessEmployees: false, canAccessSettings: false },
          { name: 'Cleaner', canAccessPOS: false, canAccessInventory: false, canAccessSalesHistory: false, canAccessEmployees: false, canAccessSettings: false },
          { name: 'Security', canAccessPOS: false, canAccessInventory: false, canAccessSalesHistory: false, canAccessEmployees: false, canAccessSettings: false },
      ]
    },
  });

  const { fields } = useFieldArray({
      control,
      name: 'roles'
  })

  const onSubmit = (data: SettingsFormValues) => {
    // In a real app, you'd save these settings to a backend or localStorage
    console.log(data);
    toast({
      title: "Settings Saved",
      description: "Your new settings have been applied.",
    });
  };

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
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input id="taxRate" type="number" {...register("taxRate")} />
              {errors.taxRate && <p className="text-sm text-destructive">{errors.taxRate.message}</p>}
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
                <Input id="idleTimeout" type="number" {...register("idleTimeout")} placeholder="e.g., 300 for 5 minutes" />
                <p className="text-xs text-muted-foreground">Automatically log out after a period of inactivity. Set to 0 to disable.</p>
                {errors.idleTimeout && <p className="text-sm text-destructive">{errors.idleTimeout.message}</p>}
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-medium">Role Permissions</h3>
                <p className="text-sm text-muted-foreground">Define which tabs each role can access.</p>
            </div>
             <div className="space-y-4">
                {fields.map((role, index) => (
                    <div key={role.id} className="rounded-md border p-4">
                        <h4 className="font-semibold">{role.name}</h4>
                        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                           <p className="text-sm flex items-center">POS</p>
                           <p className="text-sm flex items-center">Inventory</p>
                           <p className="text-sm flex items-center">Sales</p>
                           <p className="text-sm flex items-center">Employees</p>
                           <p className="text-sm flex items-center">Settings</p>
                        </div>
                    </div>
                ))}
            </div>

        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save All Settings</Button>
      </div>
    </form>
  );
}
