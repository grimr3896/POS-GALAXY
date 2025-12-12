
"use client";

import { useMemo } from 'react';
import type { Transaction, User, TransactionItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesHistoryTable } from '../sales-history/sales-history-table';
import { KPICard } from '../dashboard/kpi-card';
import { DollarSign, Receipt, Package, ShoppingCart, Landmark } from 'lucide-react';
import { TopSellersChart } from '../dashboard/top-sellers-chart';
import { EmployeeSalesChart } from './employee-sales-chart';

interface GeneratedReportProps {
  data: Transaction[];
  users: User[];
}

export function GeneratedReport({ data, users }: GeneratedReportProps) {
  const { totalRevenue, totalProfit, totalTax, totalTransactions, topSellers } = useMemo(() => {
    const totalRevenue = data.reduce((acc, t) => acc + t.total, 0);
    const totalProfit = data.reduce((acc, t) => acc + (t.profit || 0), 0);
    const totalTax = data.reduce((acc, t) => acc + (t.totalTax || 0), 0);
    const totalTransactions = data.length;

    const salesByProduct = data.flatMap(t => t.items).reduce((acc, item) => {
        acc[item.productName] = (acc[item.productName] || 0) + item.lineTotal;
        return acc;
    }, {} as Record<string, number>);

    const topSellersData = Object.entries(salesByProduct)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, total]) => ({ name, total }));

    return { totalRevenue, totalProfit, totalTax, totalTransactions, topSellers: topSellersData };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Total Revenue"
          value={totalRevenue}
          icon={DollarSign}
          formatAsCurrency
        />
        <KPICard
          title="Total Profit"
          value={totalProfit}
          icon={Receipt}
          formatAsCurrency
        />
        <KPICard
          title="Total Tax (VAT)"
          value={totalTax}
          icon={Landmark}
          formatAsCurrency
        />
        <KPICard
          title="Total Transactions"
          value={totalTransactions}
          icon={Package}
        />
         <KPICard
          title="Items Sold"
          value={data.flatMap(t => t.items).reduce((sum, i) => sum + i.quantity, 0)}
          icon={ShoppingCart}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         <TopSellersChart data={topSellers} isLoading={false} />
         <EmployeeSalesChart data={data} users={users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesHistoryTable transactions={data} users={users} isLoading={false} />
        </CardContent>
      </Card>
    </div>
  );
}
