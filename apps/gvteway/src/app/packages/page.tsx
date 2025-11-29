"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout, GvtewayLoadingLayout } from "@/components/app-layout";
import {
  H2,
  Body,
  StatCard,
  Select,
  Button,
  Badge,
  EmptyState,
  Grid,
  Stack,
  Card,
  Input,
  Field,
  Kicker,
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
    return <GvtewayLoadingLayout text="Loading packages..." />;
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <EmptyState
          title="Error Loading Packages"
          description={error}
          action={{ label: "Retry", onClick: fetchPackages }}
          inverted
        />
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={8}>
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">All-Inclusive</Kicker>
              <H2 size="lg" className="text-white">Event Packages</H2>
              <Body className="text-on-dark-muted">
                All-inclusive experiences with tickets, hotels, and VIP perks
              </Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={(summary?.total_packages || 0).toString()}
              label="Available Packages"
              inverted
            />
            <StatCard
              value={(summary?.vip_packages || 0).toString()}
              label="VIP Experiences"
              inverted
            />
            <StatCard
              value={(summary?.travel_packages || 0).toString()}
              label="Travel Packages"
              inverted
            />
            <StatCard
              value={`${summary?.average_savings || 0}%`}
              label="Avg. Savings"
              inverted
            />
          </Grid>

          <Card inverted variant="elevated" className="p-6">
            <Stack gap={4}>
              <H2 className="text-white">Package Types</H2>
              <Grid cols={4} gap={4}>
                <Card inverted interactive className="p-4">
                  <Stack gap={2}>
                    <Body className="text-h3-md">⭐</Body>
                    <Body className="font-display text-white">VIP Experience</Body>
                    <Body size="sm" className="text-on-dark-muted">
                      Premium seats, backstage access, meet & greet
                    </Body>
                  </Stack>
                </Card>
                <Card inverted interactive className="p-4">
                  <Stack gap={2}>
                    <Body className="text-h3-md">✈️</Body>
                    <Body className="font-display text-white">Travel Package</Body>
                    <Body size="sm" className="text-on-dark-muted">
                      Tickets + hotel + transportation
                    </Body>
                  </Stack>
                </Card>
                <Card inverted interactive className="p-4">
                  <Stack gap={2}>
                    <Body className="text-h3-md">👥</Body>
                    <Body className="font-display text-white">Group Package</Body>
                    <Body size="sm" className="text-on-dark-muted">
                      Discounted rates for groups of 4+
                    </Body>
                  </Stack>
                </Card>
                <Card inverted interactive className="p-4">
                  <Stack gap={2}>
                    <Body className="text-h3-md">🎁</Body>
                    <Body className="font-display text-white">Gift Package</Body>
                    <Body size="sm" className="text-on-dark-muted">
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
                inverted
              />
            </Field>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              inverted
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
              inverted
            />
          ) : (
            <Grid cols={2} gap={6}>
              {packages.map((pkg) => (
                <Card key={pkg.id} inverted className="p-6">
                  <Stack gap={4}>
                    <Stack gap={2} direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <Badge variant="outline">{pkg.ticket_type}</Badge>
                        <H2 className="text-white">{pkg.name}</H2>
                      </Stack>
                      {pkg.savings > 0 && (
                        <Badge variant="solid">Save {pkg.savings}%</Badge>
                      )}
                    </Stack>

                    <Stack gap={1}>
                      <Body className="font-display text-white">{pkg.event_name}</Body>
                      <Body className="text-on-dark-muted">{pkg.venue_name}</Body>
                      <Body size="sm" className="text-on-dark-disabled">{formatDate(pkg.event_date)}</Body>
                    </Stack>

                    <Body size="sm" className="text-on-dark-muted">
                      {pkg.description}
                    </Body>

                    <Stack gap={2}>
                      <Kicker colorScheme="on-dark">Includes</Kicker>
                      <Grid cols={2} gap={2}>
                        {pkg.includes.map((item, idx) => (
                          <Body key={idx} size="sm" className="text-on-dark-muted">
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

                    <Stack gap={2} direction="horizontal" className="items-center justify-between border-t border-ink-800 pt-4">
                      <Stack gap={1}>
                        <Body size="sm" className="text-on-dark-disabled line-through">
                          {formatCurrency(pkg.original_price)}
                        </Body>
                        <Body className="font-display text-white">
                          {formatCurrency(pkg.package_price)}
                        </Body>
                        <Body size="sm" className="font-mono text-on-dark-disabled">
                          {pkg.availability} available
                        </Body>
                      </Stack>
                      <Button 
                        variant="solid"
                        inverted
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
    </GvtewayAppLayout>
  );
}
