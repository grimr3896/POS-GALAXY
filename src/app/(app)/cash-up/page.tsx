
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from './date-picker';
import { getCashUpSummary } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface CashUpSummary {
  totalSales: number;
  cashSales: number;
  mpesaSales: number;
  expectedCash: number;
  transactionCount: number;
}

export default function CashUpPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [summary, setSummary] = useState<CashUpSummary | null>(null);
  const [actualCash, setActualCash] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const data = getCashUpSummary(selectedDate);
    setSummary(data);
    setActualCash('');
    setIsSubmitted(false);
  }, [selectedDate]);

  const numericActualCash = useMemo(() => parseFloat(actualCash) || 0, [actualCash]);
  const cashDifference = useMemo(() => {
    if (!summary) return 0;
    return numericActualCash - summary.expectedCash;
  }, [numericActualCash, summary]);

  const handleSubmit = () => {
    if (numericActualCash <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter the actual cash counted.',
      });
      return;
    }
    // In a real app, you would save this to the backend
    console.log({
      date: selectedDate,
      ...summary,
      actualCash: numericActualCash,
      cashDifference,
    });
    setIsSubmitted(true);
    toast({
      title: 'Cash-Up Submitted',
      description: `Report for ${selectedDate.toLocaleDateString()} has been recorded.`,
    });
  };

  const formatCurrency = (amount: number) => `Ksh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Daily Cash-Up</CardTitle>
              <CardDescription>Reconcile daily cash and mobile money sales.</CardDescription>
            </div>
            <div className="mt-4 md:mt-0">
              <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {summary ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</div>
                <p className="text-xs text-muted-foreground">{summary.transactionCount} transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.cashSales)}</div>
                <p className="text-xs text-muted-foreground">From {summary.transactionCount} transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">M-Pesa Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-sky-600">{formatCurrency(summary.mpesaSales)}</div>
                 <p className="text-xs text-muted-foreground">From {summary.transactionCount} transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Cash Reconciliation */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Reconciliation</CardTitle>
              <CardDescription>Compare expected cash with the actual amount in the till.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2 rounded-lg border bg-secondary p-4">
                    <Label className="font-semibold text-secondary-foreground">Expected Cash in Till</Label>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(summary.expectedCash)}</p>
                    <p className="text-xs text-muted-foreground">Total Cash Sales minus Change Given</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actual-cash" className="font-semibold">Actual Cash Counted</Label>
                  <Input
                    id="actual-cash"
                    type="number"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                    placeholder="Enter amount in till"
                    className="text-2xl h-14"
                    disabled={isSubmitted}
                  />
                </div>
              </div>
              
              {numericActualCash > 0 && (
                 <Alert variant={cashDifference === 0 ? 'default' : cashDifference > 0 ? 'default' : 'destructive'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                        {cashDifference === 0 ? "Balanced" : cashDifference > 0 ? "Overage" : "Shortage"}
                    </AlertTitle>
                    <AlertDescription>
                        The cash difference is <span className="font-bold">{formatCurrency(cashDifference)}</span>.
                        {cashDifference < 0 && " Please verify your counts and transactions."}
                        {cashDifference > 0 && " There is more cash than expected."}
                    </AlertDescription>
                </Alert>
              )}

            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} disabled={isSubmitted || !actualCash}>
                {isSubmitted ? 'Report Submitted' : 'Submit Cash-Up Report'}
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>No transaction data available for the selected date.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
