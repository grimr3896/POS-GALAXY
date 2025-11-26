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
import type { Product, InventoryItem } from "@/lib/types";
import { useEffect, useState } from "react";
import Image from "next/image";

type ProductWithInventory = Product & { inventory?: InventoryItem };

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  sku: z.string().min(1, "SKU is required."),
  image: z.string().optional(),
  type: z.enum(["bottle", "drum"]),
  buyPrice: z.coerce.number().min(0, "Buy price must be non-negative."),
  sellPrice: z.coerce.number().positive("Sell price must be positive."),
  thresholdQuantity: z.coerce.number().min(0, "Threshold must be non-negative."),
  inventory: z.object({
    quantityUnits: z.coerce.number().min(0).optional(),
    currentML: z.coerce.number().min(0).optional(),
    capacityML: z.coerce.number().min(0).optional(),
  }).optional(),
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
    },
  });

  const productType = watch("type");

  useEffect(() => {
    if (isOpen && product) {
      const defaultValues = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        image: product.image,
        type: product.type,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        thresholdQuantity: product.thresholdQuantity,
        inventory: {
          quantityUnits: product.inventory?.quantityUnits,
          currentML: product.inventory?.currentML,
          capacityML: product.inventory?.capacityML,
        }
      };
      reset(defaultValues);
      if (product.image) {
        setImagePreview(product.image);
      } else {
        setImagePreview(null);
      }
    } else if (isOpen && !product) {
      reset({
        id: undefined,
        name: "",
        sku: "",
        image: "",
        type: "bottle",
        buyPrice: 0,
        sellPrice: 0,
        thresholdQuantity: 0,
        inventory: {
          quantityUnits: 0,
          currentML: 0,
          capacityML: 0,
        }
      });
      setImagePreview(null);
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
                        <Image src={imagePreview} alt="Product preview" layout="fill" objectFit="cover" className="rounded-md" />
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
            {productType === "bottle" ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">Stock (Units)</Label>
                <Input id="stock" type="number" {...register("inventory.quantityUnits")} className="col-span-3" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="current-ml" className="text-right">Current (ml)</Label>
                    <Input id="current-ml" type="number" {...register("inventory.currentML")} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity-ml" className="text-right">Capacity (ml)</Label>
                    <Input id="capacity-ml" type="number" {...register("inventory.capacityML")} className="col-span-3" />
                </div>
              </>
            )}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="threshold" className="text-right">Threshold</Label>
              <Input id="threshold" type="number" {...register("thresholdQuantity")} className="col-span-3" />
              {errors.thresholdQuantity && <p className="col-span-4 text-right text-sm text-destructive">{errors.thresholdQuantity.message}</p>}
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
