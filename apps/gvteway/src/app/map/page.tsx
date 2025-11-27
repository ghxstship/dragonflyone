'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Figure,
} from '@ghxstship/ui';
import Image from 'next/image';

interface MapEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  latitude: number;
  longitude: number;
  category: string;
  price_min: number;
  image?: string;
}

interface MapCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  events: MapEvent[];
}

function MapViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<MapEvent[]>([]);
  const [clusters, setClusters] = useState<MapCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Filters
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [dateRange, setDateRange] = useState('all');
  const [radius, setRadius] = useState('50');

  // Map state
  const [mapCenter, setMapCenter] = useState({ lat: 25.7617, lng: -80.1918 }); // Miami default
  const [mapZoom, setMapZoom] = useState(10);

  const getCurrentLocation = useCallback(() => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        setLocationLoading(false);
      },
      () => {
        setError('Unable to get your location');
        setLocationLoading(false);
      }
    );
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(category !== 'all' && { category }),
        ...(dateRange !== 'all' && { date_range: dateRange }),
        ...(userLocation && { lat: userLocation.lat.toString(), lng: userLocation.lng.toString(), radius }),
      });

      const response = await fetch(`/api/events/map?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setClusters(data.clusters || []);
      }
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [category, dateRange, userLocation, radius]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventClick = (event: MapEvent) => {
    setSelectedEvent(event);
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleClusterClick = (cluster: MapCluster) => {
    setMapCenter({ lat: cluster.latitude, lng: cluster.longitude });
    setMapZoom(mapZoom + 2);
  };

  // Simple map rendering (would integrate with Mapbox/Google Maps in production)
  const renderMap = () => (
    <Stack className="relative w-full h-panel-md bg-ink-100 rounded-lg overflow-hidden">
      {/* Map placeholder - in production would use Mapbox GL or Google Maps */}
      <Stack className="absolute inset-0 flex items-center justify-center">
        <Stack className="text-center">
          <Body className="text-ink-500 mb-2">Interactive Map</Body>
          <Body className="text-body-sm text-ink-600">
            Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
          </Body>
        </Stack>
      </Stack>

      {/* Event markers */}
      {events.map(event => {
        // Calculate position relative to map center (simplified)
        const offsetX = (event.longitude - mapCenter.lng) * 100 * mapZoom;
        const offsetY = (mapCenter.lat - event.latitude) * 100 * mapZoom;
        const x = 50 + offsetX;
        const y = 50 + offsetY;

        if (x < 0 || x > 100 || y < 0 || y > 100) return null;

        return (
          // DS Exception: Map marker positioning requires inline styles for dynamic coordinates
          <Stack
            key={event.id}
            className={`absolute w-8 h-8 -ml-4 -mt-4 cursor-pointer transition-transform hover:scale-125 ${
              selectedEvent?.id === event.id ? 'z-20' : 'z-10'
            }`}
            style={{ '--marker-x': `${x}%`, '--marker-y': `${y}%`, left: 'var(--marker-x)', top: 'var(--marker-y)' } as React.CSSProperties}
            onClick={() => handleEventClick(event)}
          >
            <Stack className={`w-full h-full rounded-full flex items-center justify-center ${
              selectedEvent?.id === event.id ? 'bg-black' : 'bg-error-500'
            }`}>
              <Body className="text-white text-mono-xs">●</Body>
            </Stack>
          </Stack>
        );
      })}

      {/* User location marker - DS Exception: Map marker positioning */}
      {userLocation && (
        <Stack
          className="absolute w-4 h-4 -ml-2 -mt-2 z-30 left-1/2 top-1/2"
        >
          <Stack className="w-full h-full bg-info-500 rounded-full border-2 border-white shadow-lg" />
        </Stack>
      )}

      {/* Map controls */}
      <Stack className="absolute top-4 right-4 z-20" gap={2}>
        <Button
          variant="solid"
          size="sm"
          className="bg-white text-black"
          onClick={() => setMapZoom(Math.min(mapZoom + 1, 18))}
        >
          +
        </Button>
        <Button
          variant="solid"
          size="sm"
          className="bg-white text-black"
          onClick={() => setMapZoom(Math.max(mapZoom - 1, 5))}
        >
          −
        </Button>
        <Button
          variant="solid"
          size="sm"
          className="bg-white text-black"
          onClick={getCurrentLocation}
          disabled={locationLoading}
        >
          📍
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
          <Stack gap={2}>
            <H1>Map View</H1>
            <Body className="text-ink-600">
              Discover events near you
            </Body>
          </Stack>
          <Button variant="outline" onClick={() => router.push('/browse')}>
            List View
          </Button>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Card className="p-4 mb-6">
          <Grid cols={4} gap={4}>
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

            <Field label="Date">
              <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="weekend">This Weekend</option>
              </Select>
            </Field>

            <Field label="Radius">
              <Select value={radius} onChange={(e) => setRadius(e.target.value)}>
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
              </Select>
            </Field>

            <Stack className="justify-end">
              <Button variant="outline" onClick={fetchEvents}>
                Update Map
              </Button>
            </Stack>
          </Grid>
        </Card>

        <Grid cols={3} gap={6}>
          <Stack className="col-span-2">
            {loading ? (
              <Card className="h-panel-md flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </Card>
            ) : (
              renderMap()
            )}
          </Stack>

          <Stack gap={4}>
            {selectedEvent ? (
              <Card className="p-6">
                <H3 className="mb-4">SELECTED EVENT</H3>
                {selectedEvent.image && (
                  <Figure className="relative h-32 bg-ink-100 mb-4 overflow-hidden rounded">
                    <Image
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      fill
                      className="object-cover"
                    />
                  </Figure>
                )}
                <Stack gap={2}>
                  <Body className="font-bold">{selectedEvent.title}</Body>
                  <Body className="text-ink-600">{selectedEvent.date}</Body>
                  <Body className="text-ink-500 text-body-sm">{selectedEvent.venue}</Body>
                  <Body className="text-ink-500 text-body-sm">{selectedEvent.city}</Body>
                  <Stack direction="horizontal" className="justify-between items-center mt-4">
                    <Badge>{selectedEvent.category}</Badge>
                    <Body className="font-bold">From ${selectedEvent.price_min}</Body>
                  </Stack>
                  <Button
                    variant="solid"
                    className="w-full mt-4"
                    onClick={() => handleViewEvent(selectedEvent.id)}
                  >
                    View Event
                  </Button>
                </Stack>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <Body className="text-ink-500">
                  Click on a marker to see event details
                </Body>
              </Card>
            )}

            <Card className="p-6">
              <H3 className="mb-4">NEARBY EVENTS</H3>
              <Stack gap={3} className="max-h-dropdown overflow-y-auto">
                {events.slice(0, 10).map(event => (
                  <Stack
                    key={event.id}
                    className="p-3 border border-ink-200 rounded cursor-pointer hover:bg-ink-50"
                    onClick={() => handleEventClick(event)}
                  >
                    <Body className="font-medium text-body-sm">{event.title}</Body>
                    <Body className="text-mono-xs text-ink-500">{event.date}</Body>
                    <Body className="text-mono-xs text-ink-600">{event.venue}</Body>
                  </Stack>
                ))}
                {events.length === 0 && (
                  <Body className="text-ink-500 text-center">
                    No events found in this area
                  </Body>
                )}
              </Stack>
            </Card>
          </Stack>
        </Grid>
        </Stack>
      </Container>
    </Section>
  );
}

export default function MapViewPage() {
  return (
    <Suspense fallback={
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading map..." />
        </Container>
      </Section>
    }>
      <MapViewContent />
    </Suspense>
  );
}
