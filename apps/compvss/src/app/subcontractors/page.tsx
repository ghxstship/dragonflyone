"use client";

import { useState } from "react";
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
import { useSubcontractorsData, type Subcontractor } from "@/hooks/useSubcontractors";

export default function SubcontractorsPage() {
  const router = useRouter();
  const { addNotification: _addNotification } = useNotifications();
  const {
    subcontractors,
    summary,
    isLoading: loading,
    error,
    refetch,
  } = useSubcontractorsData();

  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter subcontractors locally
  const filteredSubcontractors = subcontractors.filter((s: Subcontractor) => {
    if (filterSpecialty !== 'all' && s.specialty !== filterSpecialty) return false;
    if (searchQuery && !s.company_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
              description={error instanceof Error ? error.message : String(error)}
              action={{ label: "Retry", onClick: () => refetch() }}
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
                      <Body size="sm" className="">Audio</Body>
                      <Body className="font-display">12</Body>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack gap={2}>
                      <Body size="sm" className="">Lighting</Body>
                      <Body className="font-display">8</Body>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack gap={2}>
                      <Body size="sm" className="">Video</Body>
                      <Body className="font-display">6</Body>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack gap={2}>
                      <Body size="sm" className="">Staging</Body>
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
                  {filteredSubcontractors.map((sub: Subcontractor) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display">{sub.company_name}</Body>
                          <Body size="sm" className="">{sub.email}</Body>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="">{sub.contact_name}</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="">{sub.specialty}</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="">{sub.location}</Body>
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
