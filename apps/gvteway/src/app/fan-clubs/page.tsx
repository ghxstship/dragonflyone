"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
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
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
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

  const footerContent = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Fan Clubs">
        <FooterLink href="/fan-clubs">Browse Clubs</FooterLink>
        <FooterLink href="/events">Events</FooterLink>
      </FooterColumn>
      <FooterColumn title="Legal">
        <FooterLink href="/legal/privacy">Privacy</FooterLink>
        <FooterLink href="/legal/terms">Terms</FooterLink>
      </FooterColumn>
    </Footer>
  );

  if (loading) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading fan clubs..." />
        </Section>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="min-h-screen py-16">
          <Container>
            <EmptyState
              title="Error Loading Fan Clubs"
              description={error}
              action={{ label: "Retry", onClick: fetchFanClubs }}
              inverted
            />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={8}>
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Exclusive Access</Kicker>
              <H2 size="lg" className="text-white">Fan Clubs</H2>
              <Body className="text-on-dark-muted">
                Join official fan clubs for exclusive access, presales, and VIP experiences
              </Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={(summary?.total_clubs || 0).toString()}
              label="Fan Clubs"
              inverted
            />
            <StatCard
              value={(summary?.my_memberships || 0).toString()}
              label="My Memberships"
              inverted
            />
            <StatCard
              value={(summary?.exclusive_events || 0).toString()}
              label="Exclusive Events"
              inverted
            />
            <StatCard
              value={(summary?.presales_available || 0).toString()}
              label="Active Presales"
              inverted
            />
          </Grid>

          <Card inverted variant="elevated" className="p-6">
            <Stack gap={4}>
              <H2 className="text-white">Member Benefits</H2>
              <Grid cols={4} gap={4}>
                <Stack gap={2}>
                  <Body className="text-h3-md">🎫</Body>
                  <Body className="font-display text-white">Presale Access</Body>
                  <Body size="sm" className="text-on-dark-muted">
                    Get tickets before the general public
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-h3-md">⭐</Body>
                  <Body className="font-display text-white">Exclusive Events</Body>
                  <Body size="sm" className="text-on-dark-muted">
                    Members-only shows and meet & greets
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-h3-md">🎁</Body>
                  <Body className="font-display text-white">Merch Discounts</Body>
                  <Body size="sm" className="text-on-dark-muted">
                    Special pricing on official merchandise
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-h3-md">📱</Body>
                  <Body className="font-display text-white">Exclusive Content</Body>
                  <Body size="sm" className="text-on-dark-muted">
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
                inverted
              />
            </Field>
            <Select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              inverted
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
              inverted
            />
          ) : (
            <Grid cols={2} gap={6}>
              {clubs.map((club) => (
                <Card key={club.id} inverted className="p-6">
                  <Stack gap={4}>
                    <Stack gap={2} direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <H2 className="text-white">{club.artist_name}</H2>
                        <Body className="text-on-dark-muted">{club.name}</Body>
                      </Stack>
                      {club.is_member && (
                        <Badge variant="solid">{club.membership_tier}</Badge>
                      )}
                    </Stack>

                    <Body size="sm" className="text-on-dark-muted">
                      {club.description}
                    </Body>

                    <Stack gap={2}>
                      <Kicker colorScheme="on-dark">Benefits</Kicker>
                      <Stack gap={1}>
                        {club.benefits.slice(0, 4).map((benefit, idx) => (
                          <Body key={idx} size="sm" className="text-on-dark-muted">
                            ✓ {benefit}
                          </Body>
                        ))}
                      </Stack>
                    </Stack>

                    <Stack gap={2} direction="horizontal" className="text-on-dark-disabled">
                      <Body size="sm">{club.member_count.toLocaleString()} members</Body>
                      <Body size="sm">•</Body>
                      <Body size="sm">{club.exclusive_events} exclusive events</Body>
                    </Stack>

                    <Stack gap={2} direction="horizontal" className="items-center justify-between border-t border-ink-800 pt-4">
                      <Stack gap={1}>
                        {club.monthly_price && (
                          <Body size="sm" className="text-on-dark-muted">
                            {formatCurrency(club.monthly_price)}/month
                          </Body>
                        )}
                        {club.annual_price && (
                          <Body size="sm" className="font-mono text-on-dark-disabled">
                            or {formatCurrency(club.annual_price)}/year (save 20%)
                          </Body>
                        )}
                      </Stack>
                      {club.is_member ? (
                        <Button 
                          variant="outlineInk" 
                          size="sm"
                          onClick={() => router.push(`/fan-clubs/${club.id}`)}
                        >
                          View Club
                        </Button>
                      ) : (
                        <Button 
                          variant="solid" 
                          size="sm"
                          inverted
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
    </PageLayout>
  );
}
