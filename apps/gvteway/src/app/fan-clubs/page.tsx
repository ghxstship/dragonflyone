"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Star, Gift, Smartphone } from "lucide-react";
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
import { useFanClubsData } from "@/hooks/useFanClubs";

export default function FanClubsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    clubs,
    summary,
    isLoading: loading,
    error,
    refetch,
  } = useFanClubsData({ search: searchQuery });

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
    return <GvtewayLoadingLayout text="Loading fan clubs..." />;
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <EmptyState
          title="Error Loading Fan Clubs"
          description={error instanceof Error ? error.message : String(error)}
          action={{ label: "Retry", onClick: () => refetch() }}
          inverted
        />
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
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
                  <Ticket className="size-8" />
                  <Body className="font-display text-white">Presale Access</Body>
                  <Body size="sm" className="text-on-dark-muted">
                    Get tickets before the general public
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Star className="size-8" />
                  <Body className="font-display text-white">Exclusive Events</Body>
                  <Body size="sm" className="text-on-dark-muted">
                    Members-only shows and meet & greets
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Gift className="size-8" />
                  <Body className="font-display text-white">Merch Discounts</Body>
                  <Body size="sm" className="text-on-dark-muted">
                    Special pricing on official merchandise
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Smartphone className="size-8" />
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
    </GvtewayAppLayout>
  );
}
