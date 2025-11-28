'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  H2,
  H3,
  Body,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
  ProjectCard,
  Form,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
} from '@ghxstship/ui';

interface NearbyEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  distance: number;
  category: string;
  price: number;
  image?: string;
}

export default function NearbyEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState('25');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [category, setCategory] = useState('all');

  const getCurrentLocation = useCallback(() => {
    setLocationLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        // Reverse geocode to get location name
        try {
          const response = await fetch(
            `/api/geocode/reverse?lat=${latitude}&lng=${longitude}`
          );
          if (response.ok) {
            const data = await response.json();
            setLocationName(data.location || 'Your Location');
          }
        } catch (err) {
          setLocationName('Your Location');
        }

        setLocationLoading(false);
      },
      (err) => {
        setError('Unable to get your location. Please enter it manually.');
        setLocationLoading(false);
      }
    );
  }, []);

  const searchByLocation = useCallback(async (locationQuery: string) => {
    setLocationLoading(true);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(locationQuery)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.lat && data.lng) {
          setLocation({ lat: data.lat, lng: data.lng });
          setLocationName(data.location || locationQuery);
        } else {
          setError('Location not found. Please try a different search.');
        }
      }
    } catch (err) {
      setError('Failed to search location');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const fetchNearbyEvents = useCallback(async () => {
    if (!location) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        radius,
        ...(category !== 'all' && { category }),
      });

      const response = await fetch(`/api/events/nearby?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      setError('Failed to fetch nearby events');
    } finally {
      setLoading(false);
    }
  }, [location, radius, category]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    if (location) {
      fetchNearbyEvents();
    }
  }, [location, fetchNearbyEvents]);

  const handleManualSearch = () => {
    if (manualLocation.trim()) {
      searchByLocation(manualLocation);
    }
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const formatDistance = (miles: number) => {
    if (miles < 1) return `${Math.round(miles * 5280)} ft`;
    return `${miles.toFixed(1)} mi`;
  };

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/nearby">Nearby Events</FooterLink>
            <FooterLink href="/browse">Browse Events</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Discover</Kicker>
              <H2 size="lg" className="text-white">Experiences Near You</H2>
              {locationName && (
                <Body className="text-on-dark-muted">
                  Showing events near {locationName}
                </Body>
              )}
            </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Card inverted className="p-6">
          <Grid cols={4} gap={4}>
            <Stack className="col-span-2">
              <Form onSubmit={handleManualSearch}>
                <Field label="Location" inverted>
                  <Stack direction="horizontal" gap={2}>
                    <Input
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      placeholder="Enter city, zip code, or address..."
                      className="flex-1"
                      inverted
                    />
                    <Button type="submit" variant="outlineInk" disabled={locationLoading}>
                      Search
                    </Button>
                  </Stack>
                </Field>
              </Form>
            </Stack>

            <Field label="Radius" inverted>
              <Select value={radius} onChange={(e) => setRadius(e.target.value)} inverted>
                <option value="5">5 miles</option>
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
              </Select>
            </Field>

            <Field label="Category" inverted>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} inverted>
                <option value="all">All Categories</option>
                <option value="concert">Concerts</option>
                <option value="festival">Festivals</option>
                <option value="theater">Theater</option>
                <option value="sports">Sports</option>
                <option value="comedy">Comedy</option>
              </Select>
            </Field>
          </Grid>

          <Stack direction="horizontal" gap={4} className="mt-4">
            <Button
              variant="outlineInk"
              onClick={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? 'Getting Location...' : 'Use My Location'}
            </Button>
          </Stack>
        </Card>

        {loading ? (
          <Stack className="items-center py-12">
            <LoadingSpinner size="lg" />
            <Body className="mt-4 text-on-dark-muted">Finding events near you...</Body>
          </Stack>
        ) : events.length > 0 ? (
          <Stack gap={6}>
            <Body className="text-on-dark-muted">
              {events.length} events found within {radius} miles
            </Body>

            <Grid cols={3} gap={6}>
              {events.map(event => (
                <Card key={event.id} inverted interactive className="overflow-hidden">
                  <Stack className="relative">
                    <Badge className="absolute right-2 top-2 z-10" variant="solid">
                      {formatDistance(event.distance)}
                    </Badge>
                    <ProjectCard
                      title={event.title}
                      image={event.image || ''}
                      metadata={`${event.date} • ${event.venue}`}
                      tags={[event.category]}
                      onClick={() => handleEventClick(event.id)}
                    />
                  </Stack>
                  <Stack className="border-t border-ink-800 p-4">
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack>
                        <Body size="sm" className="text-on-dark-disabled">{event.city}</Body>
                      </Stack>
                      <Body className="font-display text-white">From ${event.price}</Body>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        ) : location ? (
          <Card inverted className="p-12 text-center">
            <H3 className="mb-4 text-white">No Events Found Nearby</H3>
            <Body className="mb-6 text-on-dark-muted">
              No events found within {radius} miles of your location.
              Try increasing the radius or searching a different area.
            </Body>
            <Stack direction="horizontal" gap={4} className="justify-center">
              <Button variant="outlineInk" onClick={() => setRadius('100')}>
                Expand to 100 miles
              </Button>
              <Button variant="solid" inverted onClick={() => router.push('/browse')}>
                Browse All Events
              </Button>
            </Stack>
          </Card>
        ) : (
          <Card inverted className="p-12 text-center">
            <H3 className="mb-4 text-white">Enable Location</H3>
            <Body className="mb-6 text-on-dark-muted">
              Allow location access or enter your location to find events near you.
            </Body>
            <Button variant="solid" inverted onClick={getCurrentLocation}>
              Enable Location
            </Button>
          </Card>
        )}
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
