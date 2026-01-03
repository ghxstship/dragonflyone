"use client";

/**
 * Rewards History Page
 * Shows points earned and redeemed history
 * Uses DetailPage template for consistent layout
 */

import {
  Body,
  Card,
  Grid,
  Badge,
  DetailPage,
  Section,
  SectionHeader,
  StatCard,
  Box,
  DataTable,
  Input,
} from "@ghxstship/ui";
import { getEntityColumns } from "@ghxstship/config";
import { Award, TrendingUp, TrendingDown, Calendar, Filter } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface PointsTransaction {
  id: string;
  type: "earned" | "redeemed";
  amount: number;
  description: string;
  date: string;
  source: string;
}

async function fetchRewardsHistory(): Promise<{
  transactions: PointsTransaction[];
  totalEarned: number;
  totalRedeemed: number;
  currentBalance: number;
}> {
  const response = await fetch("/api/rewards/history");
  if (!response.ok) {
    return {
      transactions: [],
      totalEarned: 0,
      totalRedeemed: 0,
      currentBalance: 0,
    };
  }
  return response.json();
}

export default function RewardsHistoryPage() {
  const [dateFilter, setDateFilter] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["rewards-history", dateFilter],
    queryFn: fetchRewardsHistory,
  });

  const transactions = data?.transactions || [];
  const totalEarned = data?.totalEarned || 0;
  const totalRedeemed = data?.totalRedeemed || 0;
  const currentBalance = data?.currentBalance || 0;

  const filteredTransactions = dateFilter
    ? transactions.filter((t) => t.date.startsWith(dateFilter))
    : transactions;

  const entityColumns = getEntityColumns<PointsTransaction>("rewards-transactions");

  const tabs = [
    {
      id: "all",
      label: "All Transactions",
      icon: <Calendar className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 lg:grid-cols-3 mb-6">
            <StatCard
              label="Current Balance"
              value={currentBalance.toLocaleString()}
              icon={<Award className="size-5" />}
            />
            <StatCard
              label="Total Earned"
              value={`+${totalEarned.toLocaleString()}`}
              icon={<TrendingUp className="size-5" />}
            />
            <StatCard
              label="Total Redeemed"
              value={`-${totalRedeemed.toLocaleString()}`}
              icon={<TrendingDown className="size-5" />}
            />
          </Grid>

          <SectionHeader
            title="Points History"
            description="Your complete points transaction history"
          />

          <Card className="p-4 mb-4">
            <Box className="flex items-center gap-4">
              <Filter className="size-4 text-text-muted" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
                data-testid="date-filter"
              />
            </Box>
          </Card>

          {filteredTransactions.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted">No transactions found</Body>
            </Card>
          ) : (
            <DataTable
              columns={entityColumns}
              data={filteredTransactions}
              data-testid="points-history"
            />
          )}
        </Section>
      ),
    },
    {
      id: "earned",
      label: "Points Earned",
      icon: <TrendingUp className="size-4" />,
      content: (
        <Section>
          <SectionHeader
            title="Points Earned"
            description="All points you've earned"
          />
          {filteredTransactions.filter((t) => t.type === "earned").length === 0 ? (
            <Card className="p-12 text-center">
              <TrendingUp className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted" data-testid="points-earned">No earned points yet</Body>
            </Card>
          ) : (
            <DataTable
              columns={entityColumns}
              data={filteredTransactions.filter((t) => t.type === "earned")}
              data-testid="points-earned"
            />
          )}
        </Section>
      ),
    },
    {
      id: "redeemed",
      label: "Points Redeemed",
      icon: <TrendingDown className="size-4" />,
      content: (
        <Section>
          <SectionHeader
            title="Points Redeemed"
            description="All points you've redeemed"
          />
          {filteredTransactions.filter((t) => t.type === "redeemed").length === 0 ? (
            <Card className="p-12 text-center">
              <TrendingDown className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted" data-testid="points-redeemed">No redeemed points yet</Body>
            </Card>
          ) : (
            <DataTable
              columns={entityColumns}
              data={filteredTransactions.filter((t) => t.type === "redeemed")}
              data-testid="points-redeemed"
            />
          )}
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Rewards Program",
        title: "Points History",
        description: "Track your points earned and redeemed",
        badge: <Badge variant="outline">{currentBalance} pts</Badge>,
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
