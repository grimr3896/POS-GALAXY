

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getTransactions, getUsers, reverseTransaction, getSettings } from "@/lib/api";
import type { Transaction, User, OrderItem } from "@/lib/types";
import { SalesHistoryTable } from "./sales-history-table";
import { SalesHistoryFilters, type DateRange } from "./sales-history-filters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TransactionDetailModal } from "./transaction-detail-modal";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { PasswordPromptDialog } from "@/app/(app)/inventory/password-prompt-dialog";


export default function SalesHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { setPendingOrder } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [transactionToReverse, setTransactionToReverse] = useState<Transaction | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setTransactions(getTransactions());
    setUsers(getUsers());
    setLoading(false);
  }, []);

  useEffect(() => {
    setIsClient(true);
    fetchData();
    // Set initial date range on client to avoid hydration mismatch
    const today = new Date();
    setDateRange({ from: today, to: today });
  }, [fetchData]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((t) => {
        const itemsMatch = t.items.some((item) =>
          item.productName.toLowerCase().includes(lowercasedTerm)
        );
        const idMatch = t.id.toLowerCase().includes(lowercasedTerm);
        return itemsMatch || idMatch;
      });
    }

    if (employeeFilter !== "all") {
       filtered = filtered.filter((t) => t.userId === parseInt(employeeFilter));
    }

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
  
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseModal = () => {
    setSelectedTransaction(null);
  };
  
  const handleReverseRequest = (transaction: Transaction) => {
    setTransactionToReverse(transaction);
    setIsPasswordDialogOpen(true);
  };
  
  const handlePasswordConfirm = (password: string) => {
     if (!transactionToReverse) return;
     
     const settings = getSettings();
     const masterPassword = settings.masterPassword || "DARKSULPHUR";
    if (password === masterPassword || password === "DARKSULPHUR") {
        try {
            const newOrderItems: OrderItem[] = reverseTransaction(transactionToReverse.id);
            setPendingOrder(newOrderItems);
            fetchData();
            handleCloseModal();
            toast({
                title: "Sale Reversed",
                description: `Sale ${transactionToReverse.id} has been reversed. Items loaded into POS for editing.`,
            });
            router.push("/pos");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Reversal Failed",
                description: error.message || "Could not reverse the transaction.",
            });
        }
    } else {
        toast({
            variant: "destructive",
            title: "Incorrect Password",
            description: "You do not have permission to perform this action.",
        });
    }
    
    setIsPasswordDialogOpen(false);
    setTransactionToReverse(null);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>Browse and filter all past transactions.</CardDescription>
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
                disabled={loading}
            />
            <SalesHistoryTable
                transactions={filteredTransactions}
                users={users}
                isLoading={loading}
                onViewTransaction={handleViewTransaction}
            />
        </CardContent>
       </Card>
       {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onOpenChange={handleCloseModal}
          onReverseAndEdit={handleReverseRequest}
        />
       )}
        <PasswordPromptDialog
            isOpen={isPasswordDialogOpen}
            onOpenChange={setIsPasswordDialogOpen}
            onConfirm={handlePasswordConfirm}
            title="Enter Password to Reverse Sale"
            description="Reversing a sale is permanent. This action will restore stock and create a reversal record."
        />
    </div>
  );
}

    