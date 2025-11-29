"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import {
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
  Input,
  useNotifications,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

interface Subcontractor {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  specialty: string;
  location: string;
  rating: number;
  total_projects: number;
  active_projects: number;
  insurance_status: string;
  insurance_expiry?: string;
  contract_status: string;
  hourly_rate?: number;
  day_rate?: number;
  notes?: string;
}

interface SubcontractorSummary {
  total_subcontractors: number;
  active_engagements: number;
  pending_contracts: number;
  expiring_insurance: number;
  total_spend_ytd: number;
  average_rating: number;
}

export default function SubcontractorsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [summary, setSummary] = useState<SubcontractorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubcontractors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterSpecialty !== "all") params.append("specialty", filterSpecialty);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/subcontractors?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch subcontractors");
      
      const data = await response.json();
      setSubcontractors(data.subcontractors || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterSpecialty, searchQuery]);

  useEffect(() => {
    fetchSubcontractors();
  }, [fetchSubcontractors]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case "active":
      case "valid":
      case "approved":
        return "solid";
      case "pending":
      case "expiring":
        return "outline";
      case "expired":
      case "inactive":
        return "ghost";
      default:
        return "ghost";
    }
  };

  const renderRating = (rating: number) => {
    const stars = Math.round(rating);
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };

  if (loading) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading subcontractors..." />
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  if (error) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Error Loading Subcontractors"
              description={error}
              action={{ label: "Retry", onClick: fetchSubcontractors }}
            />
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Subcontractor Directory"
        subtitle="Manage subcontractor relationships and compliance"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Subcontractors' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        primaryAction={{ label: 'Add Subcontractor', onClick: () => router.push('/subcontractors/new') }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            <Grid cols={4} gap={6}>
              <StatCard
                value={(summary?.total_subcontractors || 0).toString()}
                label="Total Subcontractors"
              />
              <StatCard
                value={(summary?.active_engagements || 0).toString()}
                label="Active Engagements"
              />
              <StatCard
                value={formatCurrency(summary?.total_spend_ytd || 0)}
                label="YTD Spend"
              />
              <StatCard
                value={summary?.average_rating?.toFixed(1) || "0.0"}
                label="Avg Rating"
              />
            </Grid>

            <Card>
              <Stack gap={4}>
                <H2>Specialties</H2>
                <Grid cols={4} gap={4}>
                  <Card>
                    <Stack gap={2}>
                      <Body className="text-body-sm">Audio</Body>
                      <Body className="font-display">12</Body>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack gap={2}>
                      <Body className="text-body-sm">Lighting</Body>
                      <Body className="font-display">8</Body>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack gap={2}>
                      <Body className="text-body-sm">Video</Body>
                      <Body className="font-display">6</Body>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack gap={2}>
                      <Body className="text-body-sm">Staging</Body>
                      <Body className="font-display">10</Body>
                    </Stack>
                  </Card>
                </Grid>
              </Stack>
            </Card>

            <Stack gap={4} direction="horizontal">
              <Input
                placeholder="Search subcontractors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
              >
                <option value="all">All Specialties</option>
                <option value="audio">Audio</option>
                <option value="lighting">Lighting</option>
                <option value="video">Video</option>
                <option value="staging">Staging</option>
                <option value="rigging">Rigging</option>
                <option value="power">Power/Electrical</option>
                <option value="backline">Backline</option>
              </Select>
            </Stack>

            {subcontractors.length === 0 ? (
              <EmptyState
                title="No Subcontractors Found"
                description="Add your first subcontractor"
                action={{ label: "Add Subcontractor", onClick: () => {} }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>Contract</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcontractors.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display">{sub.company_name}</Body>
                          <Body className="text-body-sm">{sub.email}</Body>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Body className="text-body-sm">{sub.contact_name}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="text-body-sm">{sub.specialty}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="text-body-sm">{sub.location}</Body>
                      </TableCell>
                      <TableCell>
                        <Body>{renderRating(sub.rating)}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="font-mono">{sub.active_projects}/{sub.total_projects}</Body>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(sub.insurance_status)}>
                          {sub.insurance_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(sub.contract_status)}>
                          {sub.contract_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <Stack gap={3} direction="horizontal">
              <Button variant="solid" onClick={() => router.push('/subcontractors/new')}>
                Add Subcontractor
              </Button>
              <Button variant="outline" onClick={() => router.push('/subcontractors/insurance')}>
                Insurance Report
              </Button>
              <Button variant="outline" onClick={() => router.push('/subcontractors/export')}>
                Export Directory
              </Button>
            </Stack>
          </Stack>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
