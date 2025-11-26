"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "./date-range-picker";
import type { User } from "@/lib/types";
import { Search } from "lucide-react";

export type DateRange = { from: Date | undefined; to: Date | undefined };

interface SalesHistoryFiltersProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  employeeFilter: string;
  onEmployeeFilterChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  employees: User[];
  disabled?: boolean;
}

export function SalesHistoryFilters({
  searchTerm,
  onSearchTermChange,
  employeeFilter,
  onEmployeeFilterChange,
  dateRange,
  onDateRangeChange,
  employees,
  disabled = false,
}: SalesHistoryFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      <div className="relative w-full flex-1 md:grow-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by Order ID or Item..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-full rounded-lg bg-background pl-9 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <Select
          value={employeeFilter}
          onValueChange={onEmployeeFilterChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[180px]">
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

        <DateRangePicker
          date={dateRange}
          onDateChange={onDateRangeChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
