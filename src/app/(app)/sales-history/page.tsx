"use client";

import { useEffect, useState, useMemo } from "react";
import { getTransactions, getUsers } from "@/lib/api";
import type { Transaction, User } from "@/lib/types";
import { SalesHistoryTable } from "./sales-history-table";
import { SalesHistoryFilters, type DateRange } from "./sales-history-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalesHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  useEffect(() => {
    setLoading(true);
    // In a real app, you'd fetch this data, but we'll use the mock API
    setTransactions(getTransactions());
    setUsers(getUsers());
    setLoading(false);
  }, []);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.items.some((item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        ) || t.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply employee filter
    if (employeeFilter !== "all") {
       filtered = filtered.filter((t) => t.userId === parseInt(employeeFilter));
    }

    // Apply date range filter
    if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0,0,0,0);
        filtered = filtered.filter(t => new Date(t.timestamp) >= fromDate);
    }
     if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23,59,59,999);
        filtered = filtered.filter(t => new Date(t.timestamp) <= toDate);
    }

    return filtered;
  }, [transactions, searchTerm, employeeFilter, dateRange]);

  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader>
            <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
            <SalesHistoryFilters
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                employeeFilter={employeeFilter}
                onEmployeeFilterChange={setEmployeeFilter}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                employees={users}
                disabled={false}
            />
            <SalesHistoryTable
                transactions={filteredTransactions}
                users={users}
                isLoading={loading}
            />
        </CardContent>
       </Card>
    </div>
  );
}
