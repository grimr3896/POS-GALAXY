"use client";

import { DateRangePicker } from "@/app/(app)/sales-history/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@/lib/types";
import { subDays, startOfMonth, startOfWeek } from "date-fns";

export type ReportFiltersState = {
  reportType: "daily" | "weekly" | "monthly" | "custom";
  dateRange: { from: Date | undefined; to: Date | undefined };
  employeeId: string;
  category: string;
};

interface ReportFiltersProps {
  filters: ReportFiltersState;
  onFiltersChange: (filters: ReportFiltersState) => void;
  employees: User[];
  disabled?: boolean;
}

export function ReportFilters({
  filters,
  onFiltersChange,
  employees,
  disabled = false,
}: ReportFiltersProps) {
  
  const handleReportTypeChange = (type: ReportFiltersState["reportType"]) => {
    let from: Date | undefined = new Date();
    let to: Date | undefined = new Date();

    if (type === "daily") {
      from = new Date();
      to = new Date();
    } else if (type === "weekly") {
      from = startOfWeek(new Date());
      to = new Date();
    } else if (type === "monthly") {
      from = startOfMonth(new Date());
      to = new Date();
    } else if (type === 'custom') {
      from = subDays(new Date(), 7);
      to = new Date();
    }

    onFiltersChange({ ...filters, reportType: type, dateRange: { from, to } });
  };
  
  return (
    <div className="rounded-md border bg-muted/50 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Report Type */}
        <Select
          value={filters.reportType}
          onValueChange={handleReportTypeChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily Report</SelectItem>
            <SelectItem value="weekly">Weekly Report</SelectItem>
            <SelectItem value="monthly">Monthly Report</SelectItem>
            <SelectItem value="custom">Custom Date Range</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range */}
        <DateRangePicker
          date={filters.dateRange}
          onDateChange={(dateRange) => onFiltersChange({ ...filters, dateRange })}
          disabled={disabled || filters.reportType !== 'custom'}
        />

        {/* Employee */}
        <Select
          value={filters.employeeId}
          onValueChange={(employeeId) => onFiltersChange({ ...filters, employeeId })}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={String(emp.id)}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
         <Select
          value={filters.category}
          onValueChange={(category) => onFiltersChange({ ...filters, category })}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="bottle">Bottled Products</SelectItem>
            <SelectItem value="pour">Poured Products</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
