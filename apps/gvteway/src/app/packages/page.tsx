"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "../../components/navigation";
import {
  H1,
  H2,
  Body,
  StatCard,
  Select,
  Button,
  Badge,
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

interface EventPackage {
  id: string;
  name: string;
  event_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  description: string;
  includes: string[];
  ticket_type: string;
  hotel_name?: string;
  hotel_nights?: number;
  transportation_included: boolean;
  meet_greet: boolean;
  vip_access: boolean;
  original_price: number;
  package_price: number;
  savings: number;
  availability: number;
  status: string;
}

interface PackageSummary {
  total_packages: number;
  vip_packages: number;
  travel_packages: number;
  average_savings: number;
}

export default function PackagesPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [summary, setSummary] = useState<PackageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("type", filterType);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/packages?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch packages");
      
      const data = await response.json();
      setPackages(data.packages || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterType, searchQuery]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleBookPackage = (packageId: string) => {
    router.push(`/checkout?package=${packageId}`);
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading packages..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <ConsumerNavigationPublic />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Packages"
            description={error}
            action={{ label: "Retry", onClick: fetchPackages }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Event Packages</H1>
            <Body className="text-grey-400">
              All-inclusive experiences with tickets, hotels, and VIP perks
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_packages || 0}
              label="Available Packages"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.vip_packages || 0}
              label="VIP Experiences"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.travel_packages || 0}
              label="Travel Packages"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={`${summary?.average_savings || 0}%`}
              label="Avg. Savings"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>Package Types</H2>
              <Grid cols={4} gap={4}>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-2xl">⭐</Body>
                    <Body className="font-medium">VIP Experience</Body>
                    <Body className="text-grey-400 text-sm">
                      Premium seats, backstage access, meet & greet
                    </Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-2xl">✈️</Body>
                    <Body className="font-medium">Travel Package</Body>
                    <Body className="text-grey-400 text-sm">
                      Tickets + hotel + transportation
                    </Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-2xl">👥</Body>
                    <Body className="font-medium">Group Package</Body>
                    <Body className="text-grey-400 text-sm">
                      Discounted rates for groups of 4+
                    </Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700">
                  <Stack gap={2}>
                    <Body className="text-2xl">🎁</Body>
                    <Body className="font-medium">Gift Package</Body>
                    <Body className="text-grey-400 text-sm">
                      Perfect for special occasions
                    </Body>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Field className="flex-1">
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black text-white border-grey-700"
              />
            </Field>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Types</option>
              <option value="vip">VIP Experience</option>
              <option value="travel">Travel Package</option>
              <option value="group">Group Package</option>
              <option value="gift">Gift Package</option>
            </Select>
          </Stack>

          {packages.length === 0 ? (
            <EmptyState
              title="No Packages Found"
              description="Check back later for new packages"
            />
          ) : (
            <Grid cols={2} gap={6}>
              {packages.map((pkg) => (
                <Card key={pkg.id} className="p-6 bg-black border-grey-800">
                  <Stack gap={4}>
                    <Stack gap={2} direction="horizontal" className="justify-between items-start">
                      <Stack gap={1}>
                        <Badge variant="outline">{pkg.ticket_type}</Badge>
                        <H2 className="text-xl">{pkg.name}</H2>
                      </Stack>
                      {pkg.savings > 0 && (
                        <Badge variant="solid">Save {pkg.savings}%</Badge>
                      )}
                    </Stack>

                    <Stack gap={1}>
                      <Body className="text-white font-medium">{pkg.event_name}</Body>
                      <Body className="text-grey-400">{pkg.venue_name}</Body>
                      <Body className="text-grey-500 text-sm">{formatDate(pkg.event_date)}</Body>
                    </Stack>

                    <Body className="text-grey-400 text-sm">
                      {pkg.description}
                    </Body>

                    <Stack gap={2}>
                      <Body className="text-grey-500 text-sm uppercase tracking-wider">Includes</Body>
                      <Grid cols={2} gap={2}>
                        {pkg.includes.map((item, idx) => (
                          <Body key={idx} className="text-grey-300 text-sm">
                            ✓ {item}
                          </Body>
                        ))}
                      </Grid>
                    </Stack>

                    <Stack gap={2} direction="horizontal" className="flex-wrap">
                      {pkg.vip_access && <Badge variant="ghost">VIP Access</Badge>}
                      {pkg.meet_greet && <Badge variant="ghost">Meet & Greet</Badge>}
                      {pkg.hotel_nights && <Badge variant="ghost">{pkg.hotel_nights} Nights Hotel</Badge>}
                      {pkg.transportation_included && <Badge variant="ghost">Transportation</Badge>}
                    </Stack>

                    <Stack gap={2} direction="horizontal" className="justify-between items-center border-t border-grey-800 pt-4">
                      <Stack gap={1}>
                        <Body className="text-grey-500 text-sm line-through">
                          {formatCurrency(pkg.original_price)}
                        </Body>
                        <Body className="text-2xl font-bold">
                          {formatCurrency(pkg.package_price)}
                        </Body>
                        <Body className="text-grey-500 text-xs">
                          {pkg.availability} available
                        </Body>
                      </Stack>
                      <Button 
                        variant="solid"
                        onClick={() => handleBookPackage(pkg.id)}
                        disabled={pkg.availability === 0}
                      >
                        {pkg.availability === 0 ? "Sold Out" : "Book Package"}
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
