'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  StatCard,
} from '@ghxstship/ui';

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
}

interface ParkingLot {
  id: string;
  name: string;
  type: 'garage' | 'lot' | 'street' | 'valet';
  distance: string;
  price: string;
  spaces_available: number;
  total_spaces: number;
  address: string;
  lat: number;
  lng: number;
  amenities: string[];
}

interface TransportOption {
  id: string;
  type: 'rideshare' | 'transit' | 'shuttle' | 'bike';
  name: string;
  description: string;
  estimated_time: string;
  estimated_cost?: string;
  pickup_location?: string;
}

interface DirectionsStep {
  instruction: string;
  distance: string;
  duration: string;
}

function DirectionsContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event_id');
  const venueId = searchParams.get('venue_id');

  const [venue, setVenue] = useState<Venue | null>(null);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [directions, setDirections] = useState<DirectionsStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParking, setSelectedParking] = useState<ParkingLot | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventId) params.set('event_id', eventId);
      if (venueId) params.set('venue_id', venueId);

      const [venueRes, parkingRes, transportRes] = await Promise.all([
        fetch(`/api/directions/venue?${params}`),
        fetch(`/api/directions/parking?${params}`),
        fetch(`/api/directions/transport?${params}`),
      ]);

      if (venueRes.ok) {
        const data = await venueRes.json();
        setVenue(data.venue);
      }

      if (parkingRes.ok) {
        const data = await parkingRes.json();
        setParkingLots(data.parking || []);
      }

      if (transportRes.ok) {
        const data = await transportRes.json();
        setTransportOptions(data.options || []);
      }
    } catch (err) {
      setError('Failed to load directions data');
    } finally {
      setLoading(false);
    }
  }, [eventId, venueId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        fetchDirections(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError('Unable to retrieve your location');
      }
    );
  };

  const fetchDirections = async (lat: number, lng: number) => {
    if (!venue) return;

    try {
      const response = await fetch('/api/directions/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: { lat, lng },
          destination: { lat: venue.lat, lng: venue.lng },
          mode: travelMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDirections(data.steps || []);
      }
    } catch (err) {
      setError('Failed to get directions');
    }
  };

  const getParkingTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      garage: 'bg-info-500 text-white',
      lot: 'bg-success-500 text-white',
      street: 'bg-warning-500 text-white',
      valet: 'bg-purple-500 text-white',
    };
    return <Badge className={variants[type] || ''}>{type}</Badge>;
  };

  const getTransportIcon = (type: string) => {
    const icons: Record<string, string> = {
      rideshare: '🚗',
      transit: '🚇',
      shuttle: '🚌',
      bike: '🚲',
    };
    return icons[type] || '🚶';
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return 'text-success-600';
    if (ratio > 0.2) return 'text-warning-600';
    return 'text-error-600';
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading directions..." />
        </Container>
      </Section>
    );
  }

  const availableSpaces = parkingLots.reduce((sum, p) => sum + p.spaces_available, 0);

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
            <Stack gap={2}>
              <H1>Directions & Parking</H1>
              {venue && (
                <Body className="text-ink-600">
                  {venue.name} • {venue.address}, {venue.city}, {venue.state}
                </Body>
              )}
            </Stack>
            <Button variant="solid" onClick={getUserLocation}>
              Get My Location
            </Button>
          </Stack>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Parking Lots"
            value={parkingLots.length}
            icon={<Body>🅿️</Body>}
          />
          <StatCard
            label="Spaces Available"
            value={availableSpaces}
            icon={<Body>🚗</Body>}
          />
          <StatCard
            label="Transport Options"
            value={transportOptions.length}
            icon={<Body>🚇</Body>}
          />
          <StatCard
            label="Distance"
            value={userLocation ? 'Calculating...' : 'Set location'}
            icon={<Body>📍</Body>}
          />
        </Grid>

        <Grid cols={2} gap={8}>
          <Stack gap={6}>
            <H2>PARKING OPTIONS</H2>
            {parkingLots.length > 0 ? (
              <Stack gap={4}>
                {parkingLots.map(lot => (
                  <Card
                    key={lot.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedParking?.id === lot.id ? 'border-2 border-black' : ''
                    }`}
                    onClick={() => setSelectedParking(lot)}
                  >
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Stack gap={2}>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <H3>{lot.name}</H3>
                          {getParkingTypeBadge(lot.type)}
                        </Stack>
                        <Body className="text-body-sm text-ink-600">{lot.address}</Body>
                        <Stack direction="horizontal" gap={4}>
                          <Body className="text-body-sm">
                            <Label className="text-ink-500">Distance:</Label> {lot.distance}
                          </Body>
                          <Body className="text-body-sm">
                            <Label className="text-ink-500">Price:</Label> {lot.price}
                          </Body>
                        </Stack>
                        {lot.amenities.length > 0 && (
                          <Stack direction="horizontal" gap={2} className="flex-wrap">
                            {lot.amenities.map(amenity => (
                              <Badge key={amenity} variant="outline" className="text-mono-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </Stack>
                        )}
                      </Stack>
                      <Stack className="text-right">
                        <Body className={`text-h5-md font-bold ${getAvailabilityColor(lot.spaces_available, lot.total_spaces)}`}>
                          {lot.spaces_available}
                        </Body>
                        <Body className="text-mono-xs text-ink-500">
                          of {lot.total_spaces} spaces
                        </Body>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card className="p-8 text-center">
                <Body className="text-ink-600">No parking information available</Body>
              </Card>
            )}

            <H2 className="mt-6">ALTERNATIVE TRANSPORT</H2>
            {transportOptions.length > 0 ? (
              <Stack gap={3}>
                {transportOptions.map(option => (
                  <Card key={option.id} className="p-4">
                    <Stack direction="horizontal" gap={4} className="items-center">
                      <Body className="text-h5-md">{getTransportIcon(option.type)}</Body>
                      <Stack className="flex-1">
                        <Body className="font-bold">{option.name}</Body>
                        <Body className="text-body-sm text-ink-600">{option.description}</Body>
                        {option.pickup_location && (
                          <Body className="text-mono-xs text-ink-500">
                            Pickup: {option.pickup_location}
                          </Body>
                        )}
                      </Stack>
                      <Stack className="text-right">
                        <Body className="font-bold">{option.estimated_time}</Body>
                        {option.estimated_cost && (
                          <Body className="text-body-sm text-ink-500">{option.estimated_cost}</Body>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card className="p-8 text-center">
                <Body className="text-ink-600">No alternative transport options available</Body>
              </Card>
            )}
          </Stack>

          <Stack gap={6}>
            <Stack direction="horizontal" className="justify-between items-center">
              <H2>TURN-BY-TURN DIRECTIONS</H2>
              <Select
                value={travelMode}
                onChange={(e) => {
                  setTravelMode(e.target.value as any);
                  if (userLocation) {
                    fetchDirections(userLocation.lat, userLocation.lng);
                  }
                }}
                className="w-32"
              >
                <option value="driving">Driving</option>
                <option value="walking">Walking</option>
                <option value="transit">Transit</option>
              </Select>
            </Stack>

            {!userLocation ? (
              <Card className="p-8 text-center">
                <H3 className="mb-4">ENABLE LOCATION</H3>
                <Body className="text-ink-600 mb-6">
                  Allow location access to get turn-by-turn directions
                </Body>
                <Button variant="solid" onClick={getUserLocation}>
                  Share My Location
                </Button>
              </Card>
            ) : directions.length > 0 ? (
              <Card className="p-4">
                <Stack gap={4}>
                  {directions.map((step, index) => (
                    <Stack key={index} direction="horizontal" gap={4}>
                      <Stack className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                        <Body className="text-body-sm font-bold">{index + 1}</Body>
                      </Stack>
                      <Stack className="flex-1">
                        <Body>{step.instruction}</Body>
                        <Stack direction="horizontal" gap={4}>
                          <Body className="text-body-sm text-ink-500">{step.distance}</Body>
                          <Body className="text-body-sm text-ink-500">{step.duration}</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Body className="text-ink-600">Calculating route...</Body>
              </Card>
            )}

            {venue && (
              <Card className="p-6 bg-ink-50">
                <H3 className="mb-4">VENUE INFORMATION</H3>
                <Stack gap={3}>
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-ink-500">Address</Label>
                    <Body className="text-right">
                      {venue.address}<br />
                      {venue.city}, {venue.state} {venue.zip}
                    </Body>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outline" className="flex-1">
                      Open in Maps
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Copy Address
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            )}

            {selectedParking && (
              <Card className="p-6 border-2 border-black">
                <H3 className="mb-4">SELECTED PARKING</H3>
                <Stack gap={3}>
                  <Body className="font-bold">{selectedParking.name}</Body>
                  <Body className="text-body-sm text-ink-600">{selectedParking.address}</Body>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Price</Body>
                    <Body className="font-bold">{selectedParking.price}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Available Spaces</Body>
                    <Body className={`font-bold ${getAvailabilityColor(selectedParking.spaces_available, selectedParking.total_spaces)}`}>
                      {selectedParking.spaces_available}
                    </Body>
                  </Stack>
                  <Button variant="solid" className="w-full mt-2">
                    Get Directions to Parking
                  </Button>
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid>
        </Stack>
      </Container>
    </Section>
  );
}

export default function DirectionsPage() {
  return (
    <Suspense fallback={
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading directions..." />
        </Container>
      </Section>
    }>
      <DirectionsContent />
    </Suspense>
  );
}
