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
  Spinner,
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

// Demo data for unauthenticated users
const DEMO_SUBCONTRACTORS: Subcontractor[] = [
  {
    id: "demo-1",
    company_name: "SoundWave Audio",
    contact_name: "Mike Johnson",
    email: "mike@soundwave.com",
    phone: "(555) 123-4567",
    specialty: "Audio",
    location: "Los Angeles, CA",
    rating: 4.8,
    total_projects: 24,
    active_projects: 3,
    insurance_status: "valid",
    insurance_expiry: new Date(Date.now() + 180 * 86400000).toISOString(),
    contract_status: "active",
    hourly_rate: 75,
    day_rate: 600,
  },
  {
    id: "demo-2",
    company_name: "Bright Lights Co",
    contact_name: "Sarah Chen",
    email: "sarah@brightlights.com",
    phone: "(555) 987-6543",
    specialty: "Lighting",
    location: "New York, NY",
    rating: 4.5,
    total_projects: 18,
    active_projects: 2,
    insurance_status: "valid",
    contract_status: "active",
    day_rate: 550,
  },
];

const DEMO_SUBCONTRACTOR_SUMMARY: SubcontractorSummary = {
  total_subcontractors: 36,
  active_engagements: 12,
  pending_contracts: 4,
  expiring_insurance: 2,
  total_spend_ytd: 485000,
  average_rating: 4.6,
};

export default function SubcontractorsPage() {
  const router = useRouter();
  const { addNotification: _addNotification } = useNotifications();
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
      if (response.status === 401) {
        // Use demo data for unauthenticated users
        setSubcontractors(DEMO_SUBCONTRACTORS);
        setSummary(DEMO_SUBCONTRACTOR_SUMMARY);
        setError(null);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch subcontractors");
      
      const data = await response.json();
      setSubcontractors(data.subcontractors || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      // Fallback to demo data on error
      setSubcontractors(DEMO_SUBCONTRACTORS);
      setSummary(DEMO_SUBCONTRACTOR_SUMMARY);
      setError(null);
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
            <Spinner variant="grey" size="lg" text="Loading subcontractors..." />
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
              <Table variant="dark">
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
