"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportFilters, type ReportFiltersState } from "./report-filters";
import { getUsers, getTransactions } from "@/lib/api";
import type { User, Transaction } from "@/lib/types";
import { GeneratedReport } from "./generated-report";

export default function ReportsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<Transaction[] | null>(null);

  const [filters, setFilters] = useState<ReportFiltersState>({
    reportType: "daily",
    dateRange: { from: new Date(), to: new Date() },
    employeeId: "all",
    category: "all",
  });

  useEffect(() => {
    setLoading(true);
    setUsers(getUsers());
    setTransactions(getTransactions());
    setLoading(false);
  }, []);

  const handleGenerateReport = useCallback(() => {
    let filtered = transactions;

    if (filters.employeeId !== "all") {
      filtered = filtered.filter(t => t.userId === parseInt(filters.employeeId));
    }

    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(t => new Date(t.timestamp) >= fromDate);
    }
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.timestamp) <= toDate);
    }

    setReportData(filtered);
  }, [filters, transactions]);
  
  const createMailtoLink = (report: Transaction[]) => {
    if(!report) return "";

    const totalRevenue = report.reduce((acc, t) => acc + t.totalAmount, 0);
    const totalProfit = report.reduce((acc, t) => acc + (t.profit || 0), 0);
    const totalTransactions = report.length;

    const subject = `Sales Report for ${filters.dateRange.from?.toLocaleDateString()} - ${filters.dateRange.to?.toLocaleDateString()}`;
    const body = `
Hi Team,

Here is the sales report:

- Date Range: ${filters.dateRange.from?.toLocaleDateString()} to ${filters.dateRange.to?.toLocaleDateString()}
- Total Revenue: Ksh ${totalRevenue.toLocaleString()}
- Total Profit: Ksh ${totalProfit.toLocaleString()}
- Total Transactions: ${totalTransactions}

This is an automated summary. For a detailed breakdown, please see the attached file or view the dashboard.

Thanks,
Galaxy Inn POS System
    `;

    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const handleSendEmail = () => {
    if (reportData) {
      const link = createMailtoLink(reportData);
      window.location.href = link;
    }
  };
  
  const handleDownloadReport = () => {
    if (!reportData) return;

    const allUsers = getUsers();
    const getUserName = (userId: number) => allUsers.find(u => u.id === userId)?.name || "Unknown";

    const headers = ["Transaction ID", "Date", "Time", "Employee", "Items", "Total Amount", "Total Cost", "Profit", "Tax", "Payment Method", "Status"];
    
    const csvContent = [
      headers.join(","),
      ...reportData.map(t => [
        t.id,
        new Date(t.timestamp).toLocaleDateString(),
        new Date(t.timestamp).toLocaleTimeString(),
        getUserName(t.userId),
        `"${t.items.map(i => `${i.quantity}x ${i.productName}`).join("; ")}"`,
        t.totalAmount,
        t.totalCost,
        t.profit,
        t.tax,
        t.paymentMethod,
        t.status,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const fromDate = filters.dateRange.from?.toISOString().split('T')[0];
    const toDate = filters.dateRange.to?.toISOString().split('T')[0];
    link.setAttribute("download", `report_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate and view sales, inventory, and performance reports.
              </CardDescription>
            </div>
            <div className="mt-4 flex gap-2 md:mt-0">
                <Button onClick={handleGenerateReport} disabled={loading}>Generate Report</Button>
                <Button variant="outline" onClick={handleDownloadReport} disabled={!reportData}>Download CSV</Button>
                <Button variant="outline" onClick={handleSendEmail} disabled={!reportData}>Send via Email</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ReportFilters 
            filters={filters}
            onFiltersChange={setFilters}
            employees={users}
            disabled={loading}
          />
          <div className="mt-6">
            {reportData ? (
                <GeneratedReport data={reportData} users={users} />
            ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <p className="text-muted-foreground">
                    Select your filters and click "Generate Report" to view data.
                    </p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
