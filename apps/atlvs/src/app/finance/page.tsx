"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation } from "../../components/navigation";
import { supabase } from "@/lib/supabase";
import {
  H1,
  StatCard,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Section,
} from "@ghxstship/ui";

interface Transaction {
  id: string;
  type: string;
  entity: string;
  amount: number;
  status: string;
  date: string;
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data: ledger, error: fetchError } = await supabase
        .from('ledger_entries')
        .select(`
          id,
          amount,
          side,
          entry_date,
          memo,
          ledger_accounts(name, account_type)
        `)
        .order('entry_date', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const formatted = ledger?.map((entry: any) => ({
        id: entry.id.substring(0, 8).toUpperCase(),
        type: entry.side === 'credit' ? 'Invoice' : 'Expense',
        entity: entry.memo || entry.ledger_accounts?.name || 'N/A',
        amount: entry.side === 'credit' ? parseFloat(entry.amount) : -parseFloat(entry.amount),
        status: entry.side === 'credit' ? 'Paid' : 'Approved',
        date: entry.entry_date,
      })) || [];

      setTransactions(formatted);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  
  const filteredTransactions = transactions.filter(txn => {
    const matchesType = filterType === "all" || txn.type.toLowerCase() === filterType;
    const matchesStatus = filterStatus === "all" || txn.status.toLowerCase() === filterStatus;
    return matchesType && matchesStatus;
  });
  
  const totalRevenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const netProfit = totalRevenue - totalExpenses;

  const formatCurrency = (amount: number) => {
    if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading finance data..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Finance Data"
            description={error}
            action={{ label: "Retry", onClick: fetchTransactions }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Finance Management</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={formatCurrency(totalRevenue)}
              label="Total Revenue"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(totalExpenses)}
              label="Total Expenses"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(netProfit)}
              label="Net Profit"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={transactions.length}
              label="Transactions"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Types</option>
              <option value="invoice">Invoices</option>
              <option value="expense">Expenses</option>
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </Select>
          </Stack>

          {filteredTransactions.length === 0 ? (
            <EmptyState
              title="No Transactions Found"
              description={filterType !== "all" || filterStatus !== "all" ? "Try adjusting your filters" : "No transactions recorded yet"}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((txn) => (
                  <TableRow key={txn.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="font-mono text-white">{txn.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{txn.type}</Badge>
                    </TableCell>
                    <TableCell className="text-grey-400">{txn.entity}</TableCell>
                    <TableCell className="font-mono text-white">
                      ${Math.abs(txn.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={txn.status === "Paid" ? "solid" : "outline"}>{txn.status}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">{txn.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
