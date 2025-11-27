"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  H1,
  H2,
  Body,
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
  Card,
  Section,
  useNotifications,
} from "@ghxstship/ui";

interface Permit {
  id: string;
  permit_number?: string;
  permit_type: string;
  project_id: string;
  project_name: string;
  venue_name: string;
  jurisdiction: string;
  issuing_authority: string;
  application_date: string;
  approval_date?: string;
  expiration_date?: string;
  fee_amount: number;
  status: string;
  requirements?: string[];
  documents?: string[];
  notes?: string;
}

interface PermitSummary {
  total_permits: number;
  pending_applications: number;
  approved_permits: number;
  expiring_soon: number;
  total_fees: number;
}

export default function PermitsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [summary, setSummary] = useState<PermitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const fetchPermits = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterType !== "all") params.append("type", filterType);

      const response = await fetch(`/api/permits?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch permits");
      
      const data = await response.json();
      setPermits(data.permits || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => {
    fetchPermits();
  }, [fetchPermits]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      case "approved":
      case "active":
        return "solid";
      case "pending":
      case "submitted":
        return "outline";
      case "expired":
      case "denied":
        return "ghost";
      default:
        return "ghost";
    }
  };

  const handleSubmitApplication = async (permitId: string) => {
    try {
      const response = await fetch(`/api/permits/${permitId}/submit`, {
        method: "POST",
      });
      if (response.ok) {
        addNotification({ type: "success", title: "Success", message: "Application submitted" });
        fetchPermits();
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to submit application" });
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading permits..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <CreatorNavigationAuthenticated />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Permits"
            description={error}
            action={{ label: "Retry", onClick: fetchPermits }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Permit Management</H1>
            <Body className="text-grey-400">
              Track permit applications, approvals, and compliance requirements
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_permits || 0}
              label="Total Permits"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.pending_applications || 0}
              label="Pending"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.expiring_soon || 0}
              label="Expiring Soon"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(summary?.total_fees || 0)}
              label="Total Fees"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>Permit Types</H2>
              <Grid cols={4} gap={4}>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Special Events</Body>
                    <Body className="text-2xl font-bold">8</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Noise/Sound</Body>
                    <Body className="text-2xl font-bold">5</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Fire/Safety</Body>
                    <Body className="text-2xl font-bold">12</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-sm uppercase tracking-wider">Street Closure</Body>
                    <Body className="text-2xl font-bold">3</Body>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="expired">Expired</option>
            </Select>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Types</option>
              <option value="special_event">Special Event</option>
              <option value="noise">Noise/Sound</option>
              <option value="fire_safety">Fire/Safety</option>
              <option value="street_closure">Street Closure</option>
              <option value="alcohol">Alcohol</option>
              <option value="food">Food Service</option>
            </Select>
          </Stack>

          {permits.length === 0 ? (
            <EmptyState
              title="No Permits Found"
              description="Start a new permit application"
              action={{ label: "New Application", onClick: () => {} }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Permit #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Jurisdiction</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permits.map((permit) => (
                  <TableRow key={permit.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="font-mono text-white">
                      {permit.permit_number || "—"}
                    </TableCell>
                    <TableCell className="text-grey-400">
                      {permit.permit_type}
                    </TableCell>
                    <TableCell className="text-white">
                      {permit.project_name}
                    </TableCell>
                    <TableCell className="text-grey-400">
                      {permit.venue_name}
                    </TableCell>
                    <TableCell className="text-grey-400">
                      {permit.jurisdiction}
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {permit.expiration_date ? formatDate(permit.expiration_date) : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {formatCurrency(permit.fee_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(permit.status)}>
                        {permit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Stack gap={2} direction="horizontal">
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/permits/${permit.id}`)}>
                          View
                        </Button>
                        {permit.status === "draft" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleSubmitApplication(permit.id)}
                          >
                            Submit
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push('/permits/new')}>
              New Application
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/permits/calendar')}>
              Permit Calendar
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/permits/contacts')}>
              Authority Contacts
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
