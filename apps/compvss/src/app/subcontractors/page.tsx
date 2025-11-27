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
  Input,
  Field,
  useNotifications,
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
      <Section className="relative min-h-screen bg-black text-white">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading subcontractors..." />
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
            title="Error Loading Subcontractors"
            description={error}
            action={{ label: "Retry", onClick: fetchSubcontractors }}
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
            <H1>Subcontractor Management</H1>
            <Body className="text-grey-400">
              Manage subcontractor relationships, contracts, and performance tracking
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_subcontractors || 0}
              label="Total Subcontractors"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.active_engagements || 0}
              label="Active Engagements"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={formatCurrency(summary?.total_spend_ytd || 0)}
              label="YTD Spend"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.average_rating?.toFixed(1) || "0.0"}
              label="Avg Rating"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>Specialties</H2>
              <Grid cols={4} gap={4}>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-body-sm uppercase tracking-widest">Audio</Body>
                    <Body className="text-h5-md font-bold">12</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-body-sm uppercase tracking-widest">Lighting</Body>
                    <Body className="text-h5-md font-bold">8</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-body-sm uppercase tracking-widest">Video</Body>
                    <Body className="text-h5-md font-bold">6</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-grey-400 text-body-sm uppercase tracking-widest">Staging</Body>
                    <Body className="text-h5-md font-bold">10</Body>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Field className="flex-1">
              <Input
                placeholder="Search subcontractors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black text-white border-grey-700"
              />
            </Field>
            <Select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="bg-black text-white border-grey-700"
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
            <Table variant="bordered" className="bg-black">
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
                  <TableRow key={sub.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell>
                      <Stack gap={1}>
                        <Body className="text-white font-medium">{sub.company_name}</Body>
                        <Body className="text-grey-500 text-body-sm">{sub.email}</Body>
                      </Stack>
                    </TableCell>
                    <TableCell className="text-grey-400">
                      {sub.contact_name}
                    </TableCell>
                    <TableCell className="text-grey-400">
                      {sub.specialty}
                    </TableCell>
                    <TableCell className="text-grey-400">
                      {sub.location}
                    </TableCell>
                    <TableCell className="text-warning-400">
                      {renderRating(sub.rating)}
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {sub.active_projects}/{sub.total_projects}
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
            <Button variant="outlineWhite" onClick={() => router.push('/subcontractors/new')}>
              Add Subcontractor
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/subcontractors/insurance')}>
              Insurance Report
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push('/subcontractors/export')}>
              Export Directory
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
