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
      <Section className="relative min-h-screen bg-black text-white">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading catering data..." />
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
            title="Error Loading Catering Data"
            description={error}
            action={{ label: "Retry", onClick: fetchCateringData }}
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
            <H1>Catering & Hospitality</H1>
            <Body className="text-ink-400">
              Manage crew meals, dietary requirements, and hospitality services
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.upcoming_meals || 0}
              label="Upcoming Meals"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={summary?.total_headcount || 0}
              label="Total Headcount"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={formatCurrency(summary?.average_cost_per_head || 0)}
              label="Avg Cost/Head"
              className="bg-black text-white border-ink-800"
            />
            <StatCard
              value={formatCurrency(summary?.total_cost || 0)}
              label="Total Cost"
              className="bg-black text-white border-ink-800"
            />
          </Grid>

          <Grid cols={2} gap={6}>
            <Card className="p-6 bg-black border-ink-800">
              <Stack gap={4}>
                <H2>Dietary Requirements</H2>
                <Grid cols={2} gap={4}>
                  <Card className="p-4 bg-ink-900 border-ink-700">
                    <Stack gap={2}>
                      <Body className="text-ink-400 text-body-sm uppercase tracking-widest">Vegetarian</Body>
                      <Body className="text-h5-md font-bold">12</Body>
                    </Stack>
                  </Card>
                  <Card className="p-4 bg-ink-900 border-ink-700">
                    <Stack gap={2}>
                      <Body className="text-ink-400 text-body-sm uppercase tracking-widest">Vegan</Body>
                      <Body className="text-h5-md font-bold">5</Body>
                    </Stack>
                  </Card>
                  <Card className="p-4 bg-ink-900 border-ink-700">
                    <Stack gap={2}>
                      <Body className="text-ink-400 text-body-sm uppercase tracking-widest">Gluten-Free</Body>
                      <Body className="text-h5-md font-bold">8</Body>
                    </Stack>
                  </Card>
                  <Card className="p-4 bg-ink-900 border-ink-700">
                    <Stack gap={2}>
                      <Body className="text-ink-400 text-body-sm uppercase tracking-widest">Allergies</Body>
                      <Body className="text-h5-md font-bold">3</Body>
                    </Stack>
                  </Card>
                </Grid>
              </Stack>
            </Card>

            <Card className="p-6 bg-black border-ink-800">
              <Stack gap={4}>
                <H2>Today&apos;s Schedule</H2>
                <Stack gap={3}>
                  <Card className="p-4 bg-ink-900 border-ink-700">
                    <Stack gap={1} direction="horizontal" className="items-center justify-between">
                      <Stack gap={1} direction="horizontal" className="items-center">
                        <Body className="text-h5-md">🌅</Body>
                        <Body className="font-medium">Breakfast</Body>
                      </Stack>
                      <Body className="text-ink-400">6:00 AM - 45 pax</Body>
                    </Stack>
                  </Card>
                  <Card className="p-4 bg-ink-900 border-ink-700">
                    <Stack gap={1} direction="horizontal" className="items-center justify-between">
                      <Stack gap={1} direction="horizontal" className="items-center">
                        <Body className="text-h5-md">☀️</Body>
                        <Body className="font-medium">Lunch</Body>
                      </Stack>
                      <Body className="text-ink-400">12:00 PM - 52 pax</Body>
                    </Stack>
                  </Card>
                  <Card className="p-4 bg-ink-900 border-ink-700">
                    <Stack gap={1} direction="horizontal" className="items-center justify-between">
                      <Stack gap={1} direction="horizontal" className="items-center">
                        <Body className="text-h5-md">🌙</Body>
                        <Body className="font-medium">Dinner</Body>
                      </Stack>
                      <Body className="text-ink-400">6:00 PM - 48 pax</Body>
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
              className="bg-black text-white border-ink-700"
            >
              <option value="all">All Projects</option>
              <option value="proj-001">Summer Festival 2024</option>
              <option value="proj-002">Corporate Gala</option>
              <option value="proj-003">Concert Series</option>
            </Select>
            <Select
              value={filterMealType}
              onChange={(e) => setFilterMealType(e.target.value)}
              className="bg-black text-white border-ink-700"
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
            <Table variant="bordered" className="bg-black">
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
                  <TableRow key={service.id} className="bg-black text-white hover:bg-ink-900">
                    <TableCell>
                      <Stack gap={1} direction="horizontal" className="items-center">
                        <Body className="text-h6-md">{getMealIcon(service.meal_type)}</Body>
                        <Body className="text-white">{service.meal_type}</Body>
                      </Stack>
                    </TableCell>
                    <TableCell className="text-ink-400">
                      {service.project_name}
                    </TableCell>
                    <TableCell className="font-mono text-ink-400">
                      {formatDate(service.service_date)}
                    </TableCell>
                    <TableCell className="text-ink-400">
                      {service.location}
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {service.headcount}
                    </TableCell>
                    <TableCell className="text-ink-400">
                      {service.vendor_name || "TBD"}
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {formatCurrency(service.total_cost)}
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
            <Button variant="outlineWhite" onClick={() => router.push('/catering/schedule')}>
              Schedule Meal
            </Button>
            <Button variant="ghost" className="text-ink-400 hover:text-white" onClick={() => router.push('/catering/dietary')}>
              Manage Dietary
            </Button>
            <Button variant="ghost" className="text-ink-400 hover:text-white" onClick={() => router.push('/catering/vendors')}>
              Vendor Directory
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
