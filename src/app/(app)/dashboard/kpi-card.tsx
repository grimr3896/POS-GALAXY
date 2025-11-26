"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number | undefined;
  icon: LucideIcon;
  formatAsCurrency?: boolean;
  isLoading?: boolean;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  formatAsCurrency = false,
  isLoading = false,
}: KPICardProps) {
  const formattedValue =
    value !== undefined
      ? formatAsCurrency
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "KSH",
            minimumFractionDigits: 0,
          }).format(value)
        : value.toLocaleString()
      : "0";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className="text-2xl font-bold">{formattedValue}</div>
        )}
      </CardContent>
    </Card>
  );
}
