"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Layout provided by route group
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
  useNotifications,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import { usePermitsData, type Permit } from "@/hooks/usePermits";

export default function PermitsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const {
    permits,
    summary,
    isLoading: loading,
    error,
    refetch,
  } = usePermitsData();

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Filter permits locally
  const filteredPermits = permits.filter((p: Permit) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterType !== 'all' && p.permit_type !== filterType) return false;
    return true;
  });


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
        refetch();
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to submit application" });
    }
  };

  if (loading) {
    return (
      <>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Spinner variant="grey" size="lg" text="Loading permits..." />
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Error Loading Permits"
              description={error instanceof Error ? error.message : String(error)}
              action={{ label: "Retry", onClick: () => refetch() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Permit Management"
        subtitle="Track permit applications, approvals, and compliance requirements"


        primaryAction={{ label: 'New Application', onClick: () => router.push('/permits/new') }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                value={(summary?.total_permits || 0).toString()}
                label="Total Permits"
              />
              <StatCard
                value={(summary?.pending_applications || 0).toString()}
                label="Pending"
              />
              <StatCard
                value={(summary?.expiring_soon || 0).toString()}
                label="Expiring Soon"
              />
              <StatCard
                value={formatCurrency(summary?.total_fees || 0)}
                label="Total Fees"
              />
            </Grid>

            <Card>
              <Stack gap={4}>
                <H2>Permit Types</H2>
                <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <Stack gap={2}>
                      <Body size="sm" className="">Special Events</Body>
                      <Body className="font-display">8</Body>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack gap={2}>
                      <Body size="sm" className="">Noise/Sound</Body>
                      <Body className="font-display">5</Body>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack gap={2}>
                      <Body size="sm" className="">Fire/Safety</Body>
                      <Body className="font-display">12</Body>
                    </Stack>
                  </Card>
                  <Card>
                    <Stack gap={2}>
                      <Body size="sm" className="">Street Closure</Body>
                      <Body className="font-display">3</Body>
                    </Stack>
                  </Card>
                </Grid>
              </Stack>
            </Card>

            <Stack gap={4} direction="horizontal">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
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
              <Table variant="dark">
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
                  {filteredPermits.map((permit: Permit) => (
                    <TableRow key={permit.id}>
                      <TableCell>
                        <Body className="font-mono">{permit.permit_number || "—"}</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="">{permit.permit_type}</Body>
                      </TableCell>
                      <TableCell>
                        <Body>{permit.project_name}</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="">{permit.venue_name}</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="">{permit.jurisdiction}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="font-mono">{permit.expiration_date ? formatDate(permit.expiration_date) : "—"}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="font-mono">{formatCurrency(permit.fee_amount)}</Body>
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
              <Button variant="solid" onClick={() => router.push('/permits/new')}>
                New Application
              </Button>
              <Button variant="outline" onClick={() => router.push('/permits/calendar')}>
                Permit Calendar
              </Button>
              <Button variant="outline" onClick={() => router.push('/permits/contacts')}>
                Authority Contacts
              </Button>
            </Stack>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
