"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import { useDeals } from "@/hooks/useDeals";
import {
  H1,
  StatCard,
  Select,
  Button,
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

const stages = ["Lead", "Qualification", "Discovery", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];

export default function PipelinePage() {
  const router = useRouter();
  const [filterStage, setFilterStage] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const { data: deals, isLoading, error, refetch } = useDeals();

  const displayDeals = deals || [];
  const filteredDeals = displayDeals.filter((deal: any) => {
    const matchesStage = filterStage === "all" || deal.stage === filterStage;
    const matchesOwner = filterOwner === "all" || (deal.owner && deal.owner.includes(filterOwner));
    return matchesStage && matchesOwner;
  });

  const totalValue = filteredDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
  const weightedValue = filteredDeals.reduce((sum: number, d: any) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading pipeline..." />
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
            title="Error Loading Pipeline"
            description={error instanceof Error ? error.message : "An error occurred"}
            action={{ label: "Retry", onClick: () => refetch() }}
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
          <H1>Sales Pipeline</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={displayDeals.length}
              label="Active Deals"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(totalValue)}
              label="Total Value"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(weightedValue)}
              label="Weighted Value"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value="68%"
              label="Win Rate"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Stages</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </Select>
            <Select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Owners</option>
              <option value="Sarah">Sarah Chen</option>
              <option value="Michael">Michael Torres</option>
              <option value="David">David Kim</option>
            </Select>
          </Stack>

          {filteredDeals.length === 0 ? (
            <EmptyState
              title="No Deals Found"
              description="Add your first deal to get started"
              action={{ label: "Add Deal", onClick: () => router.push("/pipeline/new") }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Close Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal: any) => (
                  <TableRow key={deal.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="text-white">{deal.name}</TableCell>
                    <TableCell className="text-grey-400">{deal.client}</TableCell>
                    <TableCell className="font-mono text-white">{formatCurrency(deal.value || 0)}</TableCell>
                    <TableCell className="font-mono text-white">{deal.probability}%</TableCell>
                    <TableCell>
                      <Badge variant="outline">{deal.stage}</Badge>
                    </TableCell>
                    <TableCell className="text-grey-400">{deal.owner}</TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => router.push(`/pipeline/${deal.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push("/pipeline/new")}>
              Add Deal
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push("/pipeline/forecast")}>
              Forecast Report
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
