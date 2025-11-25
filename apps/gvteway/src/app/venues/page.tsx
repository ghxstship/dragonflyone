'use client';

import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Spinner,
  Stack,
  EmptyState,
} from '@ghxstship/ui';
import { useVenues } from '@/hooks/useVenues';

export default function VenuesPage() {
  const router = useRouter();
  const { data: venues, isLoading } = useVenues({ status: 'active' });

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <Spinner size="lg" />
      </Section>
    );
  }

  const displayVenues = venues || [];

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Stack className="border-b-2 border-black py-8 mb-8">
          <Display>VENUES</Display>
          <Stack direction="horizontal" gap={4} className="mt-4">
            <Button variant="solid" onClick={() => router.push('/venues/new')}>Add Venue</Button>
            <Button variant="outline" onClick={() => router.push('/venues/calendar')}>Calendar View</Button>
          </Stack>
        </Stack>

        <Stack gap={4}>
          {displayVenues.length > 0 ? (
            displayVenues.map((venue: any) => (
              <Card key={venue.id} className="p-6">
                <Grid cols={4} gap={4}>
                  <Stack gap={1}>
                    <H2>{venue.name}</H2>
                    <Body size="sm">Capacity: {venue.capacity.toLocaleString()}</Body>
                    <Body size="sm">{venue.location}</Body>
                  </Stack>
                  <Stack gap={2} className="col-span-2">
                    <Body className="font-bold">Upcoming Events:</Body>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      <Badge>{venue.upcomingEvents} scheduled</Badge>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center justify-end">
                    <Badge variant={venue.status === 'booked' ? 'solid' : 'outline'}>
                      {venue.status.toUpperCase()}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/venues/${venue.id}/calendar`)}>View Calendar</Button>
                  </Stack>
                </Grid>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No Venues Found"
              description="Events will populate venue data."
            />
          )}
        </Stack>
      </Container>
    </Section>
  );
}
