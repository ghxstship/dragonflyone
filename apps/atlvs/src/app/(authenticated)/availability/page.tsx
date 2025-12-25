'use client';

import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H3,
  Input,
  Label,
  MainContent,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Search, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface SpaceAvailability {
  space_id: string;
  space_name: string;
  available: boolean;
  conflicts?: { type: string; name: string; time?: string }[];
  holds?: { id: string; priority: string; contact_name?: string; expires_at: string }[];
}

export default function AvailabilityPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['availability', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      });
      const res = await fetch(`/api/availability?${params}`);
      if (!res.ok) throw new Error('Failed to check availability');
      return res.json();
    },
    enabled: !!dateRange.start_date && !!dateRange.end_date,
  });

  const spaces: SpaceAvailability[] = data?.spaces || [];

  const filteredSpaces = searchQuery
    ? spaces.filter((s) => s.space_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : spaces;

  const availableCount = spaces.filter((s) => s.available).length;
  const unavailableCount = spaces.filter((s) => !s.available).length;
  const heldCount = spaces.filter((s) => s.holds && s.holds.length > 0).length;

  return (
    <>
      <EnterprisePageHeader
        title="Availability Checker"
        subtitle="Check space availability for specific dates"
        primaryAction={{ label: 'Create Hold', onClick: () => router.push('/holds/new') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Card className="p-6">
              <Stack direction="horizontal" gap={4} className="flex-wrap items-end">
                <Box>
                  <Label className="block mb-2">Start Date</Label>
                  <Input
                    type="date"
                    value={dateRange.start_date}
                    onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                  />
                </Box>
                <Box>
                  <Label className="block mb-2">End Date</Label>
                  <Input
                    type="date"
                    value={dateRange.end_date}
                    onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                  />
                </Box>
                <Button onClick={() => refetch()} disabled={isLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  Check Availability
                </Button>
              </Stack>
            </Card>

            <Grid cols={4} gap={4}>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Total Spaces</Text>
                </Stack>
                <Body className="font-weight-bold">{spaces.length}</Body>
              </Card>
              <Card className="p-4 border-success/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <Text size="sm" className="text-muted-foreground">Available</Text>
                </Stack>
                <Body className="font-weight-bold text-success">{availableCount}</Body>
              </Card>
              <Card className="p-4 border-destructive/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <Text size="sm" className="text-muted-foreground">Booked</Text>
                </Stack>
                <Body className="font-weight-bold text-destructive">{unavailableCount}</Body>
              </Card>
              <Card className="p-4 border-warning/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Clock className="h-5 w-5 text-warning" />
                  <Text size="sm" className="text-muted-foreground">On Hold</Text>
                </Stack>
                <Body className="font-weight-bold text-warning">{heldCount}</Body>
              </Card>
            </Grid>

            <Box className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filter spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </Box>

            {isLoading && (
              <Stack gap={4}>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </Stack>
            )}

            {error && (
              <EmptyState
                title="Failed to check availability"
                description="Please try again."
                action={{ label: 'Retry', onClick: () => refetch() }}
              />
            )}

            {!isLoading && !error && filteredSpaces.length === 0 && (
              <EmptyState
                title="No spaces found"
                description="Select a date range and click Check Availability"
                icon={<Calendar className="h-12 w-12" />}
              />
            )}

            {!isLoading && filteredSpaces.length > 0 && (
              <Stack gap={4}>
                {filteredSpaces.map((space) => (
                  <Card
                    key={space.space_id}
                    className={`p-6 ${
                      space.available ? 'border-success' : 
                      space.holds?.length ? 'border-warning' : 'border-destructive'
                    }`}
                  >
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Box>
                        <Stack direction="horizontal" gap={3} className="items-center mb-2">
                          <H3>{space.space_name}</H3>
                          {space.available ? (
                            <Badge variant="success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Available
                            </Badge>
                          ) : space.holds?.length ? (
                            <Badge variant="warning">
                              <Clock className="h-3 w-3 mr-1" />
                              On Hold
                            </Badge>
                          ) : (
                            <Badge variant="error">
                              <XCircle className="h-3 w-3 mr-1" />
                              Booked
                            </Badge>
                          )}
                        </Stack>

                        {space.conflicts && space.conflicts.length > 0 && (
                          <Box className="mt-2">
                            <Body size="xs" className="text-muted-foreground mb-1">Conflicts:</Body>
                            {space.conflicts.map((conflict, idx) => (
                              <Body key={idx} size="sm" className="text-destructive">
                                {conflict.type}: {conflict.name} {conflict.time && `(${conflict.time})`}
                              </Body>
                            ))}
                          </Box>
                        )}

                        {space.holds && space.holds.length > 0 && (
                          <Box className="mt-2">
                            <Body size="xs" className="text-muted-foreground mb-1">Active holds:</Body>
                            {space.holds.map((hold) => (
                              <Body key={hold.id} size="sm" className="text-warning">
                                {hold.priority} hold {hold.contact_name && `by ${hold.contact_name}`} - 
                                Expires {new Date(hold.expires_at).toLocaleString()}
                              </Body>
                            ))}
                          </Box>
                        )}
                      </Box>

                      {space.available && (
                        <Link href={`/holds/new?space=${space.space_id}&date=${dateRange.start_date}`}>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Hold
                          </Button>
                        </Link>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
