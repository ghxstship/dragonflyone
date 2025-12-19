'use client';

import { useParams, useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout, GvtewayEmptyLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  ProjectCard,
  Figure,
  Section,
  Display,
} from '@ghxstship/ui';
import Image from 'next/image';
import { useVenueDetailData } from '@/hooks/useVenueDetail';

export default function VenuePage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;

  const {
    venue,
    events,
    isFollowing,
    isLoading: loading,
    toggleFollow,
    isToggling: followLoading,
  } = useVenueDetailData(venueId);

  const handleFollow = async () => {
    await toggleFollow(!isFollowing);
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading venue..." />;
  }

  if (!venue) {
    return (
      <GvtewayEmptyLayout
        title="Venue Not Found"
        description="The venue you're looking for doesn't exist or has been removed."
        action={<Button onClick={() => router.push('/venues')}>Browse Venues</Button>}
      />
    );
  }

  return (
    <GvtewayAppLayout>
        {venue.image && (
          <Section className="mb-8 -mx-4 md:-mx-8">
            <Figure className="relative h-64 md:h-96 bg-ink-100 overflow-hidden">
              <Image
                src={venue.image}
                alt={venue.name}
                fill
                className="object-cover grayscale"
              />
            </Figure>
          </Section>
        )}

        <Section className="border-b-2 border-black py-8 mb-8">
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={4}>
              <Display>{venue.name.toUpperCase()}</Display>
              <Body className="text-ink-600">
                {venue.address}, {venue.city}, {venue.state}
              </Body>
              <Stack direction="horizontal" gap={4}>
                <Badge>Capacity: {venue.capacity.toLocaleString()}</Badge>
                {events.length > 0 && (
                  <Badge variant="outline">{events.length} upcoming events</Badge>
                )}
              </Stack>
            </Stack>
            <Stack direction="horizontal" gap={4}>
              <Button
                variant={isFollowing ? 'outline' : 'solid'}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? 'Loading...' : isFollowing ? 'FOLLOWING' : 'FOLLOW'}
              </Button>
              <Button variant="outline" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(venue.address + ', ' + venue.city + ', ' + venue.state)}`, '_blank')}>
                GET DIRECTIONS
              </Button>
            </Stack>
          </Stack>
        </Section>

        <Grid cols={3} gap={8} className="mb-12">
          <Stack className="col-span-2" gap={8}>
            {venue.description && (
              <Card className="p-6">
                <H2 className="mb-4">ABOUT</H2>
                <Body className="text-ink-600">{venue.description}</Body>
              </Card>
            )}

            <Section>
              <H2 className="mb-6">UPCOMING EVENTS</H2>
              {events.length > 0 ? (
                <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
                  {events.map((event: { id: string; title: string; date: string; image?: string }) => (
                    <ProjectCard
                      key={event.id}
                      title={event.title}
                      image={event.image || ''}
                      metadata={event.date}
                      onClick={() => router.push(`/events/${event.id}`)}
                    />
                  ))}
                </Grid>
              ) : (
                <Card className="p-8 text-center">
                  <Body className="text-ink-500">No upcoming events at this venue.</Body>
                </Card>
              )}
            </Section>
          </Stack>

          <Stack gap={6}>
            {venue.amenities && venue.amenities.length > 0 && (
              <Card className="p-6">
                <H3 className="mb-4">AMENITIES</H3>
                <Stack gap={2}>
                  {venue.amenities.map((amenity: string, index: number) => (
                    <Body key={index} className="text-ink-600">• {amenity}</Body>
                  ))}
                </Stack>
              </Card>
            )}

            {venue.accessibility_info && (
              <Card className="p-6">
                <H3 className="mb-4">ACCESSIBILITY</H3>
                <Body className="text-ink-600">{venue.accessibility_info}</Body>
              </Card>
            )}

            {venue.parking_info && (
              <Card className="p-6">
                <H3 className="mb-4">PARKING</H3>
                <Body className="text-ink-600">{venue.parking_info}</Body>
              </Card>
            )}

            {venue.public_transit && (
              <Card className="p-6">
                <H3 className="mb-4">PUBLIC TRANSIT</H3>
                <Body className="text-ink-600">{venue.public_transit}</Body>
              </Card>
            )}

            <Card className="p-6 bg-ink-50">
              <H3 className="mb-4">NEED HELP?</H3>
              <Body className="text-ink-600 mb-4">
                Have questions about this venue? Contact our support team.
              </Body>
              <Button variant="outline" className="w-full" onClick={() => router.push('/help')}>
                Contact Support
              </Button>
            </Card>
          </Stack>
        </Grid>
    </GvtewayAppLayout>
  );
}
