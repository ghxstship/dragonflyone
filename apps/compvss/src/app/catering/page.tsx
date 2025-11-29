"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
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
  Section,
  useNotifications,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

interface MealService {
  id: string;
  project_id: string;
  project_name: string;
  service_date: string;
  meal_type: string;
  headcount: number;
  vendor_id?: string;
  vendor_name?: string;
  location: string;
  dietary_notes?: string;
  cost_per_head: number;
  total_cost: number;
  status: string;
}

interface DietaryRequirement {
  type: string;
  count: number;
}

interface CateringSummary {
  total_services: number;
  upcoming_meals: number;
  total_headcount: number;
  total_cost: number;
  average_cost_per_head: number;
  dietary_requirements: DietaryRequirement[];
}

export default function CateringPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [services, setServices] = useState<MealService[]>([]);
  const [summary, setSummary] = useState<CateringSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState("all");
  const [filterMealType, setFilterMealType] = useState("all");

  const fetchCateringData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterProject !== "all") params.append("project_id", filterProject);
      if (filterMealType !== "all") params.append("meal_type", filterMealType);

      const response = await fetch(`/api/catering?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch catering data");
      
      const data = await response.json();
      setServices(data.services || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterProject, filterMealType]);

  useEffect(() => {
    fetchCateringData();
  }, [fetchCateringData]);

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
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "served":
        return "solid";
      case "pending":
      case "ordered":
        return "outline";
      case "cancelled":
        return "ghost";
      default:
        return "ghost";
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType?.toLowerCase()) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "☀️";
      case "dinner":
        return "🌙";
      case "snacks":
        return "🍿";
      default:
        return "🍽️";
    }
  };

  if (loading) {
    return (
      <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
        <Section className="min-h-screen py-16">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading catering data..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
        <Section className="min-h-screen py-16">
          <Container>
            <EmptyState
              title="Error Loading Catering Data"
              description={error}
              action={{ label: "Retry", onClick: fetchCateringData }}
            />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Catering & Hospitality"
        subtitle="Manage crew meals, dietary requirements, and hospitality services"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Catering' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            <Grid cols={4} gap={6}>
              <StatCard
                value={(summary?.upcoming_meals || 0).toString()}
                label="Upcoming Meals"
              />
              <StatCard
                value={(summary?.total_headcount || 0).toString()}
                label="Total Headcount"
              />
              <StatCard
                value={formatCurrency(summary?.average_cost_per_head || 0)}
                label="Avg Cost/Head"
              />
              <StatCard
                value={formatCurrency(summary?.total_cost || 0)}
                label="Total Cost"
              />
            </Grid>

            <Grid cols={2} gap={6}>
              <Card>
                <Stack gap={4}>
                  <H2>Dietary Requirements</H2>
                  <Grid cols={2} gap={4}>
                    <Card>
                      <Stack gap={2}>
                        <Body className="text-body-sm">Vegetarian</Body>
                        <Body className="font-display">12</Body>
                      </Stack>
                    </Card>
                    <Card>
                      <Stack gap={2}>
                        <Body className="text-body-sm">Vegan</Body>
                        <Body className="font-display">5</Body>
                      </Stack>
                    </Card>
                    <Card>
                      <Stack gap={2}>
                        <Body className="text-body-sm">Gluten-Free</Body>
                        <Body className="font-display">8</Body>
                      </Stack>
                    </Card>
                    <Card>
                      <Stack gap={2}>
                        <Body className="text-body-sm">Allergies</Body>
                        <Body className="font-display">3</Body>
                      </Stack>
                    </Card>
                  </Grid>
                </Stack>
              </Card>

              <Card>
                <Stack gap={4}>
                  <H2>Today&apos;s Schedule</H2>
                  <Stack gap={3}>
                    <Card>
                      <Stack gap={1} direction="horizontal" className="items-center justify-between">
                        <Stack gap={1} direction="horizontal" className="items-center">
                          <Body>🌅</Body>
                          <Body className="font-display">Breakfast</Body>
                        </Stack>
                        <Body className="text-body-sm">6:00 AM - 45 pax</Body>
                      </Stack>
                    </Card>
                    <Card>
                      <Stack gap={1} direction="horizontal" className="items-center justify-between">
                        <Stack gap={1} direction="horizontal" className="items-center">
                          <Body>☀️</Body>
                          <Body className="font-display">Lunch</Body>
                        </Stack>
                        <Body className="text-body-sm">12:00 PM - 52 pax</Body>
                      </Stack>
                    </Card>
                    <Card>
                      <Stack gap={1} direction="horizontal" className="items-center justify-between">
                        <Stack gap={1} direction="horizontal" className="items-center">
                          <Body>🌙</Body>
                          <Body className="font-display">Dinner</Body>
                        </Stack>
                        <Body className="text-body-sm">6:00 PM - 48 pax</Body>
                      </Stack>
                    </Card>
                  </Stack>
                </Stack>
              </Card>
            </Grid>

            <Stack gap={4} direction="horizontal">
              <Select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
              >
                <option value="all">All Projects</option>
                <option value="proj-001">Summer Festival 2024</option>
                <option value="proj-002">Corporate Gala</option>
                <option value="proj-003">Concert Series</option>
              </Select>
              <Select
                value={filterMealType}
                onChange={(e) => setFilterMealType(e.target.value)}
              >
                <option value="all">All Meals</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </Select>
            </Stack>

            {services.length === 0 ? (
              <EmptyState
                title="No Catering Services"
                description="Schedule your first meal service"
                action={{ label: "Schedule Meal", onClick: () => {} }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meal</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Headcount</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Stack gap={1} direction="horizontal" className="items-center">
                          <Body>{getMealIcon(service.meal_type)}</Body>
                          <Body>{service.meal_type}</Body>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Body className="text-body-sm">{service.project_name}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="font-mono text-body-sm">{formatDate(service.service_date)}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="text-body-sm">{service.location}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="font-mono">{service.headcount}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="text-body-sm">{service.vendor_name || "TBD"}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="font-mono">{formatCurrency(service.total_cost)}</Body>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(service.status)}>
                          {service.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <Stack gap={3} direction="horizontal">
              <Button variant="solid" onClick={() => router.push('/catering/schedule')}>
                Schedule Meal
              </Button>
              <Button variant="outline" onClick={() => router.push('/catering/dietary')}>
                Manage Dietary
              </Button>
              <Button variant="outline" onClick={() => router.push('/catering/vendors')}>
                Vendor Directory
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
