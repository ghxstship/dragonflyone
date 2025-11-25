"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  H1,
  H2,
  Body,
  StatCard,
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
  Card,
  Section,
  useNotifications,
} from "@ghxstship/ui";

interface Subsidiary {
  id: string;
  name: string;
  legal_name: string;
  entity_type: string;
  jurisdiction: string;
  incorporation_date: string;
  tax_id: string;
  parent_entity_id?: string;
  ownership_percentage: number;
  status: string;
  registered_agent?: string;
  primary_contact?: string;
  address?: string;
  annual_revenue?: number;
  employee_count?: number;
}

interface SubsidiarySummary {
  total_entities: number;
  active_entities: number;
  total_revenue: number;
  total_employees: number;
  jurisdictions: number;
}

export default function SubsidiariesPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [summary, setSummary] = useState<SubsidiarySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubsidiaries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subsidiaries");
      if (!response.ok) throw new Error("Failed to fetch subsidiaries");
      
      const data = await response.json();
      setSubsidiaries(data.subsidiaries || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubsidiaries();
  }, [fetchSubsidiaries]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case "active":
        return "solid";
      case "inactive":
        return "ghost";
      case "pending":
        return "outline";
      default:
        return "ghost";
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading subsidiaries..." />
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
            title="Error Loading Subsidiaries"
            description={error}
            action={{ label: "Retry", onClick: fetchSubsidiaries }}
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
          <Stack gap={2}>
            <H1>Legal Entities & Subsidiaries</H1>
            <Body className="text-grey-400">
              Manage corporate structure, subsidiaries, and legal entity documentation
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_entities || 0}
              label="Total Entities"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.active_entities || 0}
              label="Active"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(summary?.total_revenue || 0)}
              label="Combined Revenue"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.jurisdictions || 0}
              label="Jurisdictions"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>Corporate Structure</H2>
              <Body className="text-grey-400">
                GHXSTSHIP Industries organizational hierarchy
              </Body>
              <Grid cols={4} gap={4}>
                <Card className="p-4 bg-grey-900 border-grey-700 border-l-4 border-l-white">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Parent</Body>
                    <Body className="text-lg font-bold">GHXSTSHIP Industries</Body>
                    <Body className="text-sm text-grey-400">Delaware C-Corp</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Design</Body>
                    <Body className="text-lg">GHXSTSHIP Design LLC</Body>
                    <Body className="text-sm text-grey-400">100% Owned</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Development</Body>
                    <Body className="text-lg">GHXSTSHIP Dev LLC</Body>
                    <Body className="text-sm text-grey-400">100% Owned</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Direction</Body>
                    <Body className="text-lg">GHXSTSHIP Direction LLC</Body>
                    <Body className="text-sm text-grey-400">100% Owned</Body>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          {subsidiaries.length === 0 ? (
            <EmptyState
              title="No Subsidiaries Found"
              description="Add your first legal entity to get started"
              action={{ label: "Add Entity", onClick: () => {} }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Entity Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Jurisdiction</TableHead>
                  <TableHead>Ownership</TableHead>
                  <TableHead>Incorporated</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subsidiaries.map((entity) => (
                  <TableRow key={entity.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell>
                      <Stack gap={1}>
                        <Body className="text-white font-medium">{entity.name}</Body>
                        <Body className="text-grey-500 text-sm">{entity.legal_name}</Body>
                      </Stack>
                    </TableCell>
                    <TableCell className="text-grey-400">
                      {entity.entity_type}
                    </TableCell>
                    <TableCell className="text-grey-400">
                      {entity.jurisdiction}
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {entity.ownership_percentage}%
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {formatDate(entity.incorporation_date)}
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {entity.annual_revenue ? formatCurrency(entity.annual_revenue) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(entity.status)}>
                        {entity.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push('/subsidiaries/new')}>
              Add Entity
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/subsidiaries/org-chart')}>
              Generate Org Chart
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/subsidiaries/export')}>
              Export Structure
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
