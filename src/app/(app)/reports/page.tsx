"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportFilters, type ReportFiltersState } from "./report-filters";
import { getUsers } from "@/lib/api";
import type { User } from "@/lib/types";

export default function ReportsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFiltersState>({
    reportType: "daily",
    dateRange: { from: new Date(), to: new Date() },
    employeeId: "all",
    category: "all",
  });

  useEffect(() => {
    setLoading(true);
    setUsers(getUsers());
    setLoading(false);
  }, []);

  const handleGenerateReport = () => {
    console.log("Generating report with filters:", filters);
    // TODO: Add report generation logic
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
          <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">
              Select your filters and click "Generate Report" to view data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
