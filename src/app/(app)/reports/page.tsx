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
                <Button variant="outline" disabled>Send via Email</Button>
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
