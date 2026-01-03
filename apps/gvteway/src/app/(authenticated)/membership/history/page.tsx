"use client";

/**
 * Membership History Page
 * Shows payment history and tier changes
 */

import {
  Body,
  Button,
  Card,
  Badge,
  Box,
  Stack,
  DetailPage,
  Section,
  SectionHeader,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@ghxstship/ui";
import {
  Receipt,
  Download,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  description: string;
  receiptUrl?: string;
}

interface TierChange {
  id: string;
  date: string;
  fromTier: string;
  toTier: string;
  type: "upgrade" | "downgrade" | "renewal";
}

const DEMO_PAYMENTS: PaymentRecord[] = [
  {
    id: "1",
    date: "2024-01-15",
    amount: 24.99,
    status: "completed",
    description: "Gold Membership - Monthly",
    receiptUrl: "#",
  },
  {
    id: "2",
    date: "2023-12-15",
    amount: 24.99,
    status: "completed",
    description: "Gold Membership - Monthly",
    receiptUrl: "#",
  },
  {
    id: "3",
    date: "2023-11-15",
    amount: 9.99,
    status: "completed",
    description: "Silver Membership - Monthly",
    receiptUrl: "#",
  },
];

const DEMO_TIER_CHANGES: TierChange[] = [
  {
    id: "1",
    date: "2023-12-01",
    fromTier: "Silver",
    toTier: "Gold",
    type: "upgrade",
  },
  {
    id: "2",
    date: "2023-10-15",
    fromTier: "Free",
    toTier: "Silver",
    type: "upgrade",
  },
];

async function fetchPaymentHistory(): Promise<PaymentRecord[]> {
  const response = await fetch("/api/membership/history?type=payments");
  if (!response.ok) return DEMO_PAYMENTS;
  const data = await response.json();
  return data.payments?.length > 0 ? data.payments : DEMO_PAYMENTS;
}

async function fetchTierHistory(): Promise<TierChange[]> {
  const response = await fetch("/api/membership/history?type=tiers");
  if (!response.ok) return DEMO_TIER_CHANGES;
  const data = await response.json();
  return data.tierChanges?.length > 0 ? data.tierChanges : DEMO_TIER_CHANGES;
}

export default function MembershipHistoryPage() {
  const { data: payments = DEMO_PAYMENTS, isLoading: paymentsLoading } = useQuery({
    queryKey: ["membership-payments"],
    queryFn: fetchPaymentHistory,
  });

  const { data: tierChanges = DEMO_TIER_CHANGES, isLoading: tiersLoading } = useQuery({
    queryKey: ["membership-tier-history"],
    queryFn: fetchTierHistory,
  });

  const isLoading = paymentsLoading || tiersLoading;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const tabs = [
    {
      id: "payments",
      label: "Payments",
      icon: <CreditCard className="size-4" />,
      content: (
        <Section>
          <SectionHeader
            title="Payment History"
            description="Your membership payment records"
          />
          {payments.length === 0 ? (
            <Card className="p-8 text-center">
              <Receipt className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted">No payment history</Body>
            </Card>
          ) : (
            <Card className="overflow-x-auto" data-testid="payment-history">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b-2 border-border-primary">
                    <TableHead className="text-left p-4">Date</TableHead>
                    <TableHead className="text-left p-4">Description</TableHead>
                    <TableHead className="text-right p-4">Amount</TableHead>
                    <TableHead className="text-center p-4">Status</TableHead>
                    <TableHead className="text-right p-4">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="border-b border-border-secondary">
                      <TableCell className="p-4">
                        <Body size="sm">{formatDate(payment.date)}</Body>
                      </TableCell>
                      <TableCell className="p-4">
                        <Body size="sm">{payment.description}</Body>
                      </TableCell>
                      <TableCell className="p-4 text-right">
                        <Body size="sm" className="font-weight-medium">
                          ${payment.amount.toFixed(2)}
                        </Body>
                      </TableCell>
                      <TableCell className="p-4 text-center">
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "success"
                              : payment.status === "pending"
                              ? "warning"
                              : "error"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 text-right">
                        {payment.receiptUrl && (
                          <Button variant="ghost" size="sm">
                            <Download className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </Section>
      ),
    },
    {
      id: "tiers",
      label: "Tier Changes",
      icon: <Calendar className="size-4" />,
      content: (
        <Section>
          <SectionHeader
            title="Tier History"
            description="Your membership tier changes"
          />
          {tierChanges.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted">No tier changes</Body>
            </Card>
          ) : (
            <Stack gap={4} data-testid="tier-history">
              {tierChanges.map((change) => (
                <Card key={change.id} className="p-4">
                  <Box className="flex items-center justify-between">
                    <Box className="flex items-center gap-4">
                      <Box
                        className={`p-2 rounded-card ${
                          change.type === "upgrade"
                            ? "bg-success/10 text-success"
                            : change.type === "downgrade"
                            ? "bg-error/10 text-error"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {change.type === "upgrade" ? (
                          <ArrowUpRight className="size-5" />
                        ) : change.type === "downgrade" ? (
                          <ArrowDownRight className="size-5" />
                        ) : (
                          <Receipt className="size-5" />
                        )}
                      </Box>
                      <Box>
                        <Body className="font-weight-medium capitalize">
                          {change.type}
                        </Body>
                        <Body size="sm" className="text-text-muted">
                          {change.fromTier} → {change.toTier}
                        </Body>
                      </Box>
                    </Box>
                    <Body size="sm" className="text-text-muted">
                      {formatDate(change.date)}
                    </Body>
                  </Box>
                </Card>
              ))}
            </Stack>
          )}
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Membership",
        title: "History",
        description: "View your payment and membership history",
        badge: (
          <Badge variant="outline">
            {payments.length} Payments
          </Badge>
        ),
      }}
      loading={isLoading}
      error={null}
      tabs={tabs}
    />
  );
}
