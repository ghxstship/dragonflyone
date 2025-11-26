'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  LoadingSpinner,
  ProjectCard,
  Figure,
} from '@ghxstship/ui';
import Image from 'next/image';

interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
  image?: string;
  amenities?: string[];
  accessibility_info?: string;
  parking_info?: string;
  public_transit?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  image?: string;
  price?: number;
}

export default function VenuePage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchVenue = useCallback(async () => {
    setLoading(true);
    try {
      const [venueRes, eventsRes, followRes] = await Promise.all([
        fetch(`/api/venues/${venueId}`),
        fetch(`/api/venues/${venueId}/events`),
        fetch(`/api/venues/${venueId}/follow/status`),
      ]);

      if (venueRes.ok) {
        const data = await venueRes.json();
        setVenue(data.venue);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }

      if (followRes.ok) {
        const data = await followRes.json();
        setIsFollowing(data.following);
      }
    } catch (err) {
      console.error('Failed to fetch venue');
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchVenue();
  }, [fetchVenue]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const response = await fetch(`/api/venues/${venueId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (err) {
      console.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  if (!venue) {
    return (
      <Section className="min-h-screen bg-white">
        <Container>
          <Stack className="items-center justify-center min-h-[60vh]" gap={4}>
            <Display>VENUE NOT FOUND</Display>
            <Button variant="outline" onClick={() => router.push('/venues')}>
              Browse Venues
            </Button>
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        {venue.image && (
          <Section className="mb-8 -mx-4 md:-mx-8">
            <Figure className="relative h-64 md:h-96 bg-grey-100 overflow-hidden">
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
              <Body className="text-grey-600">
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
                <Body className="text-grey-600">{venue.description}</Body>
              </Card>
            )}

            <Section>
              <H2 className="mb-6">UPCOMING EVENTS</H2>
              {events.length > 0 ? (
                <Grid cols={2} gap={6}>
                  {events.map(event => (
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
                  <Body className="text-grey-500">No upcoming events at this venue.</Body>
                </Card>
              )}
            </Section>
          </Stack>

          <Stack gap={6}>
            {venue.amenities && venue.amenities.length > 0 && (
              <Card className="p-6">
                <H3 className="mb-4">AMENITIES</H3>
                <Stack gap={2}>
                  {venue.amenities.map((amenity, index) => (
                    <Body key={index} className="text-grey-600">• {amenity}</Body>
                  ))}
                </Stack>
              </Card>
            )}

            {venue.accessibility_info && (
              <Card className="p-6">
                <H3 className="mb-4">ACCESSIBILITY</H3>
                <Body className="text-grey-600">{venue.accessibility_info}</Body>
              </Card>
            )}

            {venue.parking_info && (
              <Card className="p-6">
                <H3 className="mb-4">PARKING</H3>
                <Body className="text-grey-600">{venue.parking_info}</Body>
              </Card>
            )}

            {venue.public_transit && (
              <Card className="p-6">
                <H3 className="mb-4">PUBLIC TRANSIT</H3>
                <Body className="text-grey-600">{venue.public_transit}</Body>
              </Card>
            )}

            <Card className="p-6 bg-grey-50">
              <H3 className="mb-4">NEED HELP?</H3>
              <Body className="text-grey-600 mb-4">
                Have questions about this venue? Contact our support team.
              </Body>
              <Button variant="outline" className="w-full" onClick={() => router.push('/help')}>
                Contact Support
              </Button>
            </Card>
          </Stack>
        </Grid>
      </Container>
    </Section>
  );
}
