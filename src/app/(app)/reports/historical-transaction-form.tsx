
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { User, Product, TransactionItem } from "@/lib/types";

const transactionItemSchema = z.object({
  productId: z.coerce.number().min(1, "Product is required."),
  quantity: z.coerce.number().positive("Quantity must be positive."),
  unitPrice: z.coerce.number().positive("Sell price must be positive."),
  buyPrice: z.coerce.number().min(0, "Cost must be non-negative."),
  productName: z.string(), // To hold the name for display
  pourSizeML: z.number().optional(),
});

const formSchema = z.object({
  transactionDate: z.date(),
  employeeId: z.coerce.number().min(1, "Employee is required."),
  paymentMethod: z.enum(["Cash", "Mpesa"]),
  items: z.array(transactionItemSchema).min(1, "At least one item is required."),
});

type FormValues = z.infer<typeof formSchema>;
type FormTransactionItem = z.infer<typeof transactionItemSchema>;

interface HistoricalTransactionFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: {
    transactionDate: Date;
    employeeId: number;
    items: TransactionItem[];
    paymentMethod: "Cash" | "Mpesa";
  }) => void;
  employees: User[];
  products: Product[];
}

export function HistoricalTransactionForm({
  isOpen,
  onOpenChange,
  onSubmit,
  employees,
  products,
}: HistoricalTransactionFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionDate: new Date(),
      paymentMethod: "Cash",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");

  const total = watchItems.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const subtotal = total / 1.16;
  const tax = total - subtotal;

  const handleProductChange = (index: number, productId: string) => {
    const numericProductId = parseInt(productId);
    const product = products.find((p) => p.id === numericProductId);
    if (product) {
      setValue(`items.${index}.productId`, numericProductId);
      setValue(`items.${index}.productName`, product.name);
      setValue(`items.${index}.buyPrice`, product.buyPrice);

      if (product.type === "bottle") {
        setValue(`items.${index}.unitPrice`, product.sellPrice);
        setValue(`items.${index}.pourSizeML`, undefined);
      } else if (product.type === "drum") {
        // Default to first variant or 0 if none
        const firstVariant = product.pourVariants?.[0];
        setValue(`items.${index}.unitPrice`, firstVariant?.sellPrice || 0);
        setValue(`items.${index}.pourSizeML`, firstVariant?.pourSizeML || 0);
        setValue(`items.${index}.productName`, `${product.name} (${firstVariant?.name})`);
        setValue(`items.${index}.buyPrice`, product.buyPrice * (firstVariant?.pourSizeML || 0));
      }
    }
  };

  const handlePourVariantChange = (itemIndex: number, variantPourSize: string) => {
    const numericPourSize = parseInt(variantPourSize);
    const parentProductId = watch(`items.${itemIndex}.productId`);
    const product = products.find(p => p.id === parentProductId);
    if (product?.type === 'drum' && product.pourVariants) {
        const variant = product.pourVariants.find(v => v.pourSizeML === numericPourSize);
        if (variant) {
            setValue(`items.${itemIndex}.unitPrice`, variant.sellPrice);
            setValue(`items.${itemIndex}.pourSizeML`, variant.pourSizeML);
            setValue(`items.${itemIndex}.productName`, `${product.name} (${variant.name})`);
            setValue(`items.${itemIndex}.buyPrice`, product.buyPrice * variant.pourSizeML);
        }
    }
  };
  
  const handleFormSubmit = (data: FormValues) => {
      const finalItems: TransactionItem[] = data.items.map((item) => ({
      ...item,
      id: 0, // Mock ID, will be replaced in api
      lineTotal: item.quantity * item.unitPrice,
      lineCost: item.buyPrice * item.quantity, // buyPrice is already per-item cost
    }));
    
    onSubmit({
      ...data,
      items: finalItems,
    });
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <SheetHeader>
            <SheetTitle>Add Past Transaction</SheetTitle>
            <SheetDescription>
              Manually enter a historical transaction for reporting purposes. This will not affect current inventory.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-200px)] pr-6">
            <div className="space-y-6 py-6">
              {/* --- Core Details --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Transaction Date</Label>
                    <Controller
                        name="transactionDate"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                 </div>
                 <div className="space-y-2">
                     <Label>Employee</Label>
                     <Controller
                        name="employeeId"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={String(field.value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => <SelectItem key={emp.id} value={String(emp.id)}>{emp.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                     />
                 </div>
                 <div className="space-y-2">
                     <Label>Payment Method</Label>
                     <Controller
                        name="paymentMethod"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Mpesa">Mpesa</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                     />
                 </div>
              </div>

              {/* --- Items --- */}
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium">Items Sold</h3>
                {fields.map((field, index) => {
                  const selectedProductId = watch(`items.${index}.productId`);
                  const selectedProduct = products.find(p => p.id === selectedProductId);
                  
                  return (
                    <div key={field.id} className="grid grid-cols-12 gap-x-3 gap-y-2 rounded-md border p-4 relative">
                        {/* Product */}
                        <div className="col-span-12 md:col-span-6 space-y-1">
                            <Label>Product</Label>
                            <Select onValueChange={(val) => handleProductChange(index, val)}>
                                <SelectTrigger><SelectValue placeholder="Select a product..." /></SelectTrigger>
                                <SelectContent>
                                    {products.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Quantity */}
                        <div className="col-span-6 md:col-span-2 space-y-1">
                            <Label>Quantity</Label>
                            <Input type="number" {...register(`items.${index}.quantity`)} placeholder="Qty" />
                        </div>
                        {/* Sell Price */}
                        <div className="col-span-6 md:col-span-4 space-y-1">
                            <Label>Sell Price (Unit)</Label>
                            <Input type="number" step="0.01" {...register(`items.${index}.unitPrice`)} placeholder="Price" />
                        </div>

                        {/* Drum Variant Selector */}
                        {selectedProduct?.type === 'drum' && (
                             <div className="col-span-12 space-y-1">
                                <Label>Pour Size</Label>
                                <Controller
                                    name={`items.${index}.pourSizeML`}
                                    control={control}
                                    render={({ field: controllerField }) => (
                                        <Select onValueChange={(val) => handlePourVariantChange(index, val)} value={String(controllerField.value)}>
                                            <SelectTrigger><SelectValue placeholder="Select pour size..." /></SelectTrigger>
                                            <SelectContent>
                                                {selectedProduct.pourVariants?.map(v => (
                                                    <SelectItem key={v.id} value={String(v.pourSizeML)}>
                                                        {v.name} - Ksh {v.sellPrice}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                             </div>
                        )}

                        {/* Delete Button */}
                        <div className="absolute top-2 right-2">
                             <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                  );
                })}
                <Button type="button" variant="outline" className="w-full" onClick={() => append({ productId: 0, productName: '', quantity: 1, unitPrice: 0, buyPrice: 0 })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
                {errors.items && <p className="text-sm text-destructive">{errors.items.message}</p>}
              </div>
              
               {/* --- Totals --- */}
               {watchItems.length > 0 && (
                <>
                <Separator />
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>Ksh {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (16%)</span>
                        <span>Ksh {tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span>Ksh {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
                </>
               )}

            </div>
          </ScrollArea>
          <SheetFooter className="pt-6">
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Transaction</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
