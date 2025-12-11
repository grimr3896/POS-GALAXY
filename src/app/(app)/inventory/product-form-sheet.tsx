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
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Product, InventoryItem, ProductPourVariant } from "@/lib/types";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type ProductWithInventory = Product & { inventory?: InventoryItem };

const pourVariantSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Variant name is required"),
  pourSizeML: z.coerce.number().positive("Pour size must be positive"),
  sellPrice: z.coerce.number().positive("Sell price must be positive"),
});

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  sku: z.string().min(1, "SKU is required."),
  image: z.string().optional(),
  type: z.enum(["bottle", "drum"]),
  buyPrice: z.coerce.number().min(0, "Buy price must be non-negative."),
  sellPrice: z.coerce.number().positive("Sell price must be positive.").optional(),
  thresholdQuantity: z.coerce.number().min(0, "Threshold must be non-negative."),
  inventory: z.object({
    quantityUnits: z.coerce.number().min(0).optional(),
    currentML: z.coerce.number().min(0).optional(),
    capacityML: z.coerce.number().min(0).optional(),
  }).optional(),
  pourVariants: z.array(pourVariantSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: FormValues) => void;
  product: ProductWithInventory | null;
}

export function ProductFormSheet({ isOpen, onOpenChange, onSubmit, product }: ProductFormSheetProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "bottle",
      image: "",
      pourVariants: [],
    },
  });

  const productType = watch("type");
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "pourVariants",
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        const defaultValues: FormValues = {
          ...product,
          sellPrice: product.type === 'bottle' ? product.sellPrice : undefined,
          // Ensure pourVariants is an array
          pourVariants: product.pourVariants || [], 
        };
        reset(defaultValues);
        if (product.image) setImagePreview(product.image);
      } else {
        // Reset to a clean state for a new product
        reset({
          id: undefined,
          name: "",
          sku: "",
          image: "",
          type: "bottle",
          buyPrice: 0,
          sellPrice: 0,
          thresholdQuantity: 0,
          inventory: { quantityUnits: 0, currentML: 0, capacityML: 0 },
          pourVariants: [],
        });
        setImagePreview(null);
      }
    }
  }, [product, isOpen, reset]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setValue("image", dataUri);
        setImagePreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const formTitle = product ? "Edit Product" : "Add New Product";
  const formDescription = product
    ? "Update the details of this product."
    : "Fill in the details for the new product.";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>{formTitle}</SheetTitle>
            <SheetDescription>{formDescription}</SheetDescription>
          </SheetHeader>
          <div className="grid gap-6 py-6 pr-4 max-h-[calc(100vh-150px)] overflow-y-auto">
            {/* Common Fields */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" {...register("name")} className="col-span-3" />
              {errors.name && <p className="col-span-4 text-right text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">SKU</Label>
              <Input id="sku" {...register("sku")} className="col-span-3" />
              {errors.sku && <p className="col-span-4 text-right text-sm text-destructive">{errors.sku.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="image" className="text-right pt-2">Image</Label>
              <div className="col-span-3">
                <Input id="image-upload" type="file" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" className="mb-2" />
                {imagePreview && (
                    <div className="relative w-24 h-24 mt-2">
                        <Image src={imagePreview} alt="Product preview" fill objectFit="cover" className="rounded-md" />
                    </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottle">Bottle</SelectItem>
                      <SelectItem value="drum">Drum</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="threshold" className="text-right">Threshold</Label>
                <Input id="threshold" type="number" {...register("thresholdQuantity")} className="col-span-3" />
                {errors.thresholdQuantity && <p className="col-span-4 text-right text-sm text-destructive">{errors.thresholdQuantity.message}</p>}
            </div>


            {/* Conditional Fields */}
            {productType === "bottle" ? (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Stock (Units)</Label>
                  <Input id="stock" type="number" {...register("inventory.quantityUnits")} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="buy-price" className="text-right">Buy Price (Ksh)</Label>
                    <Input id="buy-price" type="number" {...register("buyPrice")} className="col-span-3" />
                    {errors.buyPrice && <p className="col-span-4 text-right text-sm text-destructive">{errors.buyPrice.message}</p>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sell-price" className="text-right">Sell Price (Ksh)</Label>
                    <Input id="sell-price" type="number" {...register("sellPrice")} className="col-span-3" />
                    {errors.sellPrice && <p className="col-span-4 text-right text-sm text-destructive">{errors.sellPrice.message}</p>}
                </div>
              </>
            ) : ( // Drum Type Fields
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="current-ml" className="text-right">Current Stock (ml)</Label>
                    <Input id="current-ml" type="number" {...register("inventory.currentML")} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity-ml" className="text-right">Capacity (ml)</Label>
                    <Input id="capacity-ml" type="number" {...register("inventory.capacityML")} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="buy-price-ml" className="text-right">Buy Price (per ml)</Label>
                    <Input id="buy-price-ml" type="number" step="0.01" {...register("buyPrice")} className="col-span-3" />
                    {errors.buyPrice && <p className="col-span-4 text-right text-sm text-destructive">{errors.buyPrice.message}</p>}
                </div>
                
                <Separator className="col-span-4 my-2"/>

                <div className="col-span-4">
                    <h4 className="font-medium text-lg">Pour Variants</h4>
                    <p className="text-sm text-muted-foreground">Define the different sizes this drum product can be sold in.</p>
                </div>

                <div className="col-span-4 space-y-4">
                   {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-x-2 gap-y-4 items-start p-3 border rounded-md">
                        <div className="col-span-12 sm:col-span-4">
                            <Label>Display Name</Label>
                            <Input {...register(`pourVariants.${index}.name`)} placeholder="e.g. 1/4 L" />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <Label>Size (ml)</Label>
                            <Input type="number" {...register(`pourVariants.${index}.pourSizeML`)} placeholder="e.g. 250" />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                            <Label>Price (Ksh)</Label>
                            <Input type="number" {...register(`pourVariants.${index}.sellPrice`)} placeholder="e.g. 150" />
                        </div>
                        <div className="col-span-12 sm:col-span-2 flex items-end justify-end">
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                    ))}
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => append({id: fields.length + 1, name: '', pourSizeML: 0, sellPrice: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Pour Variant
                    </Button>
                </div>
              </>
            )}
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
