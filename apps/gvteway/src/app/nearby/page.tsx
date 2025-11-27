'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
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
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <H1>Experiences Near You</H1>
          {locationName && (
            <Body className="text-grey-600">
              Showing events near {locationName}
            </Body>
          )}
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Card className="p-6 mb-8">
          <Grid cols={4} gap={4}>
            <Stack className="col-span-2">
              <Form onSubmit={handleManualSearch}>
                <Field label="Location">
                  <Stack direction="horizontal" gap={2}>
                    <Input
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      placeholder="Enter city, zip code, or address..."
                      className="flex-1"
                    />
                    <Button type="submit" variant="outline" disabled={locationLoading}>
                      Search
                    </Button>
                  </Stack>
                </Field>
              </Form>
            </Stack>

            <Field label="Radius">
              <Select value={radius} onChange={(e) => setRadius(e.target.value)}>
                <option value="5">5 miles</option>
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
              </Select>
            </Field>

            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
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
              variant="outline"
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
            <Body className="mt-4 text-grey-600">Finding events near you...</Body>
          </Stack>
        ) : events.length > 0 ? (
          <Stack gap={6}>
            <Body className="text-grey-600">
              {events.length} events found within {radius} miles
            </Body>

            <Grid cols={3} gap={6}>
              {events.map(event => (
                <Card key={event.id} className="overflow-hidden">
                  <Stack className="relative">
                    <Badge className="absolute top-2 right-2 z-10 bg-black text-white">
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
                  <Stack className="p-4 border-t">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack>
                        <Body className="text-body-sm text-grey-500">{event.city}</Body>
                      </Stack>
                      <Body className="font-bold">From ${event.price}</Body>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        ) : location ? (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO EVENTS FOUND NEARBY</H3>
            <Body className="text-grey-600 mb-6">
              No events found within {radius} miles of your location.
              Try increasing the radius or searching a different area.
            </Body>
            <Stack direction="horizontal" gap={4} className="justify-center">
              <Button variant="outline" onClick={() => setRadius('100')}>
                Expand to 100 miles
              </Button>
              <Button variant="solid" onClick={() => router.push('/browse')}>
                Browse All Events
              </Button>
            </Stack>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <H3 className="mb-4">ENABLE LOCATION</H3>
            <Body className="text-grey-600 mb-6">
              Allow location access or enter your location to find events near you.
            </Body>
            <Button variant="solid" onClick={getCurrentLocation}>
              Enable Location
            </Button>
          </Card>
        )}
        </Stack>
      </Container>
    </Section>
  );
}
