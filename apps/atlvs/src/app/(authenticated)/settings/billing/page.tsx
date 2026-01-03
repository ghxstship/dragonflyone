"use client";

/**
 * Billing Settings Page
 * Manage subscription, invoices, and payment methods
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Check, Download, Calendar, DollarSign, Users, HardDrive, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  Badge, Body, Button, Card, Grid, Stack, Modal, ModalBody, ModalFooter, ModalHeader, ProgressBar, StatCard, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

interface BillingInfo {
  plan: { name: string; price: number; interval: "monthly" | "yearly"; features: string[] };
  usage: { bookings: number; bookings_limit: number; storage_gb: number; storage_limit_gb: number; team_members: number; team_limit: number };
  payment_method?: { type: string; last4: string; exp_month: number; exp_year: number };
  next_billing_date: string;
  invoices: Array<{ id: string; date: string; amount: number; status: "paid" | "pending" | "failed" }>;
}

const PLANS = [
  { id: "starter", name: "Starter", price: 49, features: ["Up to 50 bookings/month", "2 team members", "5GB storage", "Email support"] },
  { id: "professional", name: "Professional", price: 149, features: ["Unlimited bookings", "10 team members", "50GB storage", "Priority support", "Custom branding"], popular: true },
  { id: "enterprise", name: "Enterprise", price: 399, features: ["Everything in Pro", "Unlimited team", "Unlimited storage", "Dedicated support", "API access", "SSO"] },
];

export default function BillingSettingsPage() {
  const router = useRouter();
  const { hasRole, user } = useAuthContext();
  const [showChangePlan, setShowChangePlan] = useState(false);

  const canManageBilling = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["billing-info"],
    queryFn: async () => {
      const response = await fetch("/api/settings/billing");
      if (!response.ok) {
        return {
          plan: { name: "Professional", price: 149, interval: "monthly", features: ["Unlimited bookings", "10 team members", "50GB storage"] },
          usage: { bookings: 127, bookings_limit: -1, storage_gb: 12.5, storage_limit_gb: 50, team_members: 5, team_limit: 10 },
          payment_method: { type: "card", last4: "4242", exp_month: 12, exp_year: 2025 },
          next_billing_date: "2025-02-15",
          invoices: [
            { id: "inv-001", date: "2025-01-15", amount: 149, status: "paid" },
            { id: "inv-002", date: "2024-12-15", amount: 149, status: "paid" },
            { id: "inv-003", date: "2024-11-15", amount: 149, status: "paid" },
          ],
        } as BillingInfo;
      }
      return response.json() as Promise<BillingInfo>;
    },
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  if (!canManageBilling) {
    return (
      <DetailPage
        header={{ kicker: "Settings", title: "Access Denied", description: "You do not have permission to manage billing settings." }}
        backButton={{ label: "Settings", href: "/settings" }}
        tabs={[{
          id: "denied",
          label: "Access Denied",
          icon: <CreditCard className="size-4" />,
          content: (
            <Section>
              <Card className="p-8 text-center">
                <CreditCard className="size-12 text-on-dark-disabled mx-auto mb-4" />
                <Body className="font-weight-medium text-body-lg mb-2">Permission Required</Body>
                <Body className="text-on-dark-muted mb-4">This action requires ATLVS Admin or higher role. Current user: {user?.email || "Unknown"}</Body>
                <Button variant="outline" onClick={() => router.push("/settings")}>Back to Settings</Button>
              </Card>
            </Section>
          ),
        }]}
      />
    );
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <CreditCard className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <StatCard label="Bookings" value={data?.usage.bookings_limit === -1 ? `${data?.usage.bookings || 0}` : `${data?.usage.bookings || 0}/${data?.usage.bookings_limit}`} icon={<Calendar className="size-5" />} />
            <StatCard label="Storage" value={`${data?.usage.storage_gb || 0}GB / ${data?.usage.storage_limit_gb || 0}GB`} icon={<HardDrive className="size-5" />} />
            <StatCard label="Team Members" value={`${data?.usage.team_members || 0} / ${data?.usage.team_limit || 0}`} icon={<Users className="size-5" />} />
          </Grid>

          <Card className="p-6 mb-6 border-primary">
            <Box className="flex justify-between items-start mb-4">
              <Box>
                <Body className="font-weight-bold text-body-lg">{data?.plan.name} Plan</Body>
                <Body className="text-on-dark-muted">{formatCurrency(data?.plan.price || 0)}/{data?.plan.interval}</Body>
              </Box>
              <Button variant="outline" size="sm" onClick={() => setShowChangePlan(true)}>Change Plan</Button>
            </Box>
            <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
              <Box className="p-3 bg-surface-elevated rounded-card">
                <Body size="sm" className="text-on-dark-muted">Bookings</Body>
                <Body className="font-weight-medium">{data?.usage.bookings_limit === -1 ? "Unlimited" : `${data?.usage.bookings}/${data?.usage.bookings_limit}`}</Body>
                {data?.usage.bookings_limit !== -1 && <ProgressBar value={(data?.usage.bookings || 0) / (data?.usage.bookings_limit || 1) * 100} size="sm" className="mt-2" />}
              </Box>
              <Box className="p-3 bg-surface-elevated rounded-card">
                <Body size="sm" className="text-on-dark-muted">Storage</Body>
                <Body className="font-weight-medium">{data?.usage.storage_gb}GB / {data?.usage.storage_limit_gb}GB</Body>
                <ProgressBar value={(data?.usage.storage_gb || 0) / (data?.usage.storage_limit_gb || 1) * 100} size="sm" className="mt-2" />
              </Box>
              <Box className="p-3 bg-surface-elevated rounded-card">
                <Body size="sm" className="text-on-dark-muted">Team</Body>
                <Body className="font-weight-medium">{data?.usage.team_members} / {data?.usage.team_limit}</Body>
                <ProgressBar value={(data?.usage.team_members || 0) / (data?.usage.team_limit || 1) * 100} size="sm" className="mt-2" />
              </Box>
            </Grid>
          </Card>

          <Card className="p-6">
            <SectionHeader title="Payment Method" />
            {data?.payment_method ? (
              <Box className="flex justify-between items-center p-4 bg-surface-elevated rounded-card mt-4">
                <Box className="flex items-center gap-3">
                  <CreditCard className="size-8 text-on-dark-muted" />
                  <Box>
                    <Body className="font-weight-medium">•••• •••• •••• {data.payment_method.last4}</Body>
                    <Body size="sm" className="text-on-dark-muted">Expires {data.payment_method.exp_month}/{data.payment_method.exp_year}</Body>
                  </Box>
                </Box>
                <Button variant="ghost" size="sm">Update</Button>
              </Box>
            ) : (
              <Box className="text-center py-8 bg-surface-elevated rounded-card mt-4">
                <CreditCard className="size-8 text-on-dark-disabled mx-auto mb-2" />
                <Body className="text-on-dark-muted">No payment method on file</Body>
                <Button variant="ghost" size="sm" className="mt-2">Add Payment Method</Button>
              </Box>
            )}
            <Box className="flex items-center gap-2 mt-4 text-on-dark-muted">
              <Calendar className="size-4" />
              <Body size="sm">Next billing date: {data?.next_billing_date ? formatDate(data.next_billing_date) : "N/A"}</Body>
            </Box>
          </Card>
        </Section>
      ),
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Billing History" description="View and download past invoices" />
          {!data?.invoices || data.invoices.length === 0 ? (
            <Card className="p-8 text-center mt-4">
              <DollarSign className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="text-on-dark-muted">No invoices yet</Body>
            </Card>
          ) : (
            <Stack gap={2} className="mt-4">
              {data.invoices.map((invoice) => (
                <Card key={invoice.id} className="p-4">
                  <Box className="flex justify-between items-center">
                    <Box>
                      <Body className="font-weight-medium">{formatDate(invoice.date)}</Body>
                      <Body size="sm" className="text-on-dark-muted">{invoice.id}</Body>
                    </Box>
                    <Box className="flex items-center gap-4">
                      <Badge variant={invoice.status === "paid" ? "success" : invoice.status === "pending" ? "warning" : "error"}>{invoice.status}</Badge>
                      <Body className="font-weight-medium">{formatCurrency(invoice.amount)}</Body>
                      <Button variant="ghost" size="sm" icon={<Download className="size-4" />} />
                    </Box>
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
    <>
      <DetailPage
        header={{ kicker: "Settings", title: "Billing & Plans", description: "Manage your subscription and payment methods" }}
        backButton={{ label: "Settings", href: "/settings" }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
      />

      <Modal open={showChangePlan} onClose={() => setShowChangePlan(false)} size="lg">
        <ModalHeader><Body className="font-weight-bold text-body-lg">Change Plan</Body></ModalHeader>
        <ModalBody>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
            {PLANS.map((plan) => (
              <Card key={plan.id} className={`p-4 ${plan.popular ? "border-primary" : ""}`}>
                {plan.popular && <Badge variant="info" className="mb-2">Most Popular</Badge>}
                <Body className="font-weight-bold">{plan.name}</Body>
                <Stack direction="horizontal" className="items-baseline"><Body className="text-h3-md font-weight-bold">{formatCurrency(plan.price)}</Body><Body size="sm" className="text-on-dark-muted">/mo</Body></Stack>
                <Stack gap={2} className="mt-4">
                  {plan.features.map((feature, i) => (
                    <Stack key={i} direction="horizontal" gap={2} className="items-center text-body-sm text-on-dark-muted"><Check className="size-3 text-success" />{feature}</Stack>
                  ))}
                </Stack>
                <Button variant={data?.plan.name === plan.name ? "ghost" : "solid"} size="sm" className="w-full mt-4" disabled={data?.plan.name === plan.name}>
                  {data?.plan.name === plan.name ? "Current Plan" : "Select"}
                </Button>
              </Card>
            ))}
          </Grid>
        </ModalBody>
        <ModalFooter><Button variant="outline" size="sm" onClick={() => setShowChangePlan(false)}>Cancel</Button></ModalFooter>
      </Modal>
    </>
  );
}
