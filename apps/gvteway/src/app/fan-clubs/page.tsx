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

interface FanClub {
  id: string;
  name: string;
  artist_id: string;
  artist_name: string;
  artist_image?: string;
  description: string;
  member_count: number;
  tier: string;
  benefits: string[];
  monthly_price?: number;
  annual_price?: number;
  is_member: boolean;
  membership_tier?: string;
  exclusive_events: number;
  presale_access: boolean;
}

interface FanClubSummary {
  total_clubs: number;
  my_memberships: number;
  exclusive_events: number;
  presales_available: number;
}

export default function FanClubsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [clubs, setClubs] = useState<FanClub[]>([]);
  const [summary, setSummary] = useState<FanClubSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterGenre, setFilterGenre] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFanClubs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterGenre !== "all") params.append("genre", filterGenre);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/fan-clubs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch fan clubs");
      
      const data = await response.json();
      setClubs(data.clubs || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterGenre, searchQuery]);

  useEffect(() => {
    fetchFanClubs();
  }, [fetchFanClubs]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleJoinClub = async (clubId: string, tier: string) => {
    router.push(`/fan-clubs/${clubId}/join?tier=${tier}`);
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading fan clubs..." />
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
            title="Error Loading Fan Clubs"
            description={error}
            action={{ label: "Retry", onClick: fetchFanClubs }}
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
            <H1>Fan Clubs</H1>
            <Body className="text-grey-400">
              Join official fan clubs for exclusive access, presales, and VIP experiences
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_clubs || 0}
              label="Fan Clubs"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.my_memberships || 0}
              label="My Memberships"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.exclusive_events || 0}
              label="Exclusive Events"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.presales_available || 0}
              label="Active Presales"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>Member Benefits</H2>
              <Grid cols={4} gap={4}>
                <Stack gap={2}>
                  <Body className="text-2xl">🎫</Body>
                  <Body className="font-medium">Presale Access</Body>
                  <Body className="text-grey-400 text-sm">
                    Get tickets before the general public
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-2xl">⭐</Body>
                  <Body className="font-medium">Exclusive Events</Body>
                  <Body className="text-grey-400 text-sm">
                    Members-only shows and meet & greets
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-2xl">🎁</Body>
                  <Body className="font-medium">Merch Discounts</Body>
                  <Body className="text-grey-400 text-sm">
                    Special pricing on official merchandise
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-2xl">📱</Body>
                  <Body className="font-medium">Exclusive Content</Body>
                  <Body className="text-grey-400 text-sm">
                    Behind-the-scenes and early releases
                  </Body>
                </Stack>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Field className="flex-1">
              <Input
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black text-white border-grey-700"
              />
            </Field>
            <Select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Genres</option>
              <option value="rock">Rock</option>
              <option value="pop">Pop</option>
              <option value="hip-hop">Hip-Hop</option>
              <option value="electronic">Electronic</option>
              <option value="country">Country</option>
              <option value="r&b">R&B</option>
            </Select>
          </Stack>

          {clubs.length === 0 ? (
            <EmptyState
              title="No Fan Clubs Found"
              description="Check back later for new fan clubs"
            />
          ) : (
            <Grid cols={2} gap={6}>
              {clubs.map((club) => (
                <Card key={club.id} className="p-6 bg-black border-grey-800">
                  <Stack gap={4}>
                    <Stack gap={2} direction="horizontal" className="justify-between items-start">
                      <Stack gap={1}>
                        <H2 className="text-xl">{club.artist_name}</H2>
                        <Body className="text-grey-400">{club.name}</Body>
                      </Stack>
                      {club.is_member && (
                        <Badge variant="solid">{club.membership_tier}</Badge>
                      )}
                    </Stack>

                    <Body className="text-grey-400 text-sm">
                      {club.description}
                    </Body>

                    <Stack gap={2}>
                      <Body className="text-grey-500 text-sm uppercase tracking-wider">Benefits</Body>
                      <Stack gap={1}>
                        {club.benefits.slice(0, 4).map((benefit, idx) => (
                          <Body key={idx} className="text-grey-300 text-sm">
                            ✓ {benefit}
                          </Body>
                        ))}
                      </Stack>
                    </Stack>

                    <Stack gap={2} direction="horizontal" className="text-grey-500 text-sm">
                      <Body>{club.member_count.toLocaleString()} members</Body>
                      <Body>•</Body>
                      <Body>{club.exclusive_events} exclusive events</Body>
                    </Stack>

                    <Stack gap={2} direction="horizontal" className="justify-between items-center border-t border-grey-800 pt-4">
                      <Stack gap={1}>
                        {club.monthly_price && (
                          <Body className="text-grey-400 text-sm">
                            {formatCurrency(club.monthly_price)}/month
                          </Body>
                        )}
                        {club.annual_price && (
                          <Body className="text-grey-500 text-xs">
                            or {formatCurrency(club.annual_price)}/year (save 20%)
                          </Body>
                        )}
                      </Stack>
                      {club.is_member ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/fan-clubs/${club.id}`)}
                        >
                          View Club
                        </Button>
                      ) : (
                        <Button 
                          variant="solid" 
                          size="sm"
                          onClick={() => handleJoinClub(club.id, "standard")}
                        >
                          Join Club
                        </Button>
                      )}
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
