"use client";

import { useEffect, useState } from "react";
import { DollarSign, Receipt, Package, Hourglass } from "lucide-react";
import { getDashboardData } from "@/lib/api";
import type { Product, InventoryItem } from "@/lib/types";
import { KPICard } from "./kpi-card";
import { TopSellersChart } from "./top-sellers-chart";
import { StockAlertsTable } from "./stock-alerts-table";

type DashboardData = {
  todaysSales: number;
  todaysProfit: number;
  totalTransactions: number;
  suspendedOrders: number;
  topSellers: { name: string; total: number }[];
  stockAlerts: (Product & { inventory?: InventoryItem })[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This should only run on the client
    const fetchData = () => {
      setLoading(true);
      const dashboardData = getDashboardData();
      setData(dashboardData);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
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
        <StockAlertsTable data={data?.stockAlerts} isLoading={loading} />
      </div>
    </div>
  );
}
