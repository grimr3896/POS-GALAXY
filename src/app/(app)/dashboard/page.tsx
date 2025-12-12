

"use client";

import { useEffect, useState } from "react";
import { DollarSign, Receipt, Package, Hourglass } from "lucide-react";
import { getDashboardData, endDayProcess } from "@/lib/api";
import type { Product, InventoryItem } from "@/lib/types";
import { KPICard } from "./kpi-card";
import { TopSellersChart } from "./top-sellers-chart";
import { StockAlertsTable } from "./stock-alerts-table";
import { TopProfitMakersChart } from "./top-profit-makers-chart";
import { Button } from "@/components/ui/button";
import { EndDayDialog } from "./end-day-dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


type DashboardData = {
  todaysSales: number;
  todaysProfit: number;
  totalTransactions: number;
  suspendedOrders: number;
  topSellers: { name: string; total: number }[];
  topProfitMakers: { name: string; total: number }[];
  stockAlerts: (Product & { inventory?: InventoryItem })[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEndDayDialogOpen, setIsEndDayDialogOpen] = useState(false);
  const { toast } = useToast();
   const [dayEnded, setDayEnded] = useState(false);
   const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchData = () => {
    setLoading(true);
    const dashboardData = getDashboardData();
    setData(dashboardData);
    setLoading(false);
  };

  useEffect(() => {
    if (isClient) {
        fetchData();
    }
  }, [isClient]);

  const handleEndDayConfirm = () => {
    try {
        endDayProcess();
        toast({
            title: "Day Ended Successfully",
            description: `Daily report for ${new Date().toLocaleDateString()} has been generated and transactions are locked.`,
            duration: 10000,
        });
        setDayEnded(true);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "End Day Failed",
            description: error.message || "Could not process the end-of-day workflow."
        })
    } finally {
        setIsEndDayDialogOpen(false);
    }
  };

  if (!isClient) {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
            </div>
        </div>
    );
  }

  if (dayEnded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Day Has Ended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Today's transactions have been archived. Please refresh the page to start a new day.
            </p>
            <Button onClick={() => window.location.reload()}>
              Start New Day
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col gap-6">
       <div className="flex justify-end">
            <Button onClick={() => setIsEndDayDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600">
                End Day
            </Button>
       </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Today's Revenue"
          value={data?.todaysSales}
          icon={DollarSign}
          formatAsCurrency
          isLoading={loading}
        />
        <KPICard
          title="Today's Profit"
          value={data?.todaysProfit}
          icon={Receipt}
          formatAsCurrency
          isLoading={loading}
        />
        <KPICard
          title="Today's Transactions"
          value={data?.totalTransactions}
          icon={Package}
          isLoading={loading}
        />
        <KPICard
          title="Suspended Orders"
          value={data?.suspendedOrders}
          icon={Hourglass}
          isLoading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopSellersChart data={data?.topSellers} isLoading={loading} />
        <TopProfitMakersChart data={data?.topProfitMakers} isLoading={loading} />
      </div>
       <div className="grid gap-6">
        <StockAlertsTable data={data?.stockAlerts} isLoading={loading} />
      </div>
    </div>
    <EndDayDialog
        isOpen={isEndDayDialogOpen}
        onOpenChange={setIsEndDayDialogOpen}
        onConfirm={handleEndDayConfirm}
    />
    </>
  );
}
