'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  StatCard,
  Kicker,
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
    return <GvtewayLoadingLayout text="Loading directions..." />;
  }

  const availableSpaces = parkingLots.reduce((sum, p) => sum + p.spaces_available, 0);

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Navigate</Kicker>
                <H2 size="lg" className="text-white">Directions & Parking</H2>
                {venue && (
                  <Body className="text-on-dark-muted">
                    {venue.name} • {venue.address}, {venue.city}, {venue.state}
                  </Body>
                )}
              </Stack>
              <Button variant="solid" inverted onClick={getUserLocation}>
                Get My Location
              </Button>
            </Stack>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid cols={4} gap={6}>
          <StatCard
            label="Parking Lots"
            value={parkingLots.length.toString()}
            inverted
          />
          <StatCard
            label="Spaces Available"
            value={availableSpaces.toString()}
            inverted
          />
          <StatCard
            label="Transport Options"
            value={transportOptions.length.toString()}
            inverted
          />
          <StatCard
            label="Distance"
            value={userLocation ? 'Calculating...' : 'Set location'}
            inverted
          />
        </Grid>

        <Grid cols={2} gap={8}>
          <Stack gap={6}>
            <H2 className="text-white">Parking Options</H2>
            {parkingLots.length > 0 ? (
              <Stack gap={4}>
                {parkingLots.map(lot => (
                  <Card
                    key={lot.id}
                    inverted
                    interactive
                    className={`cursor-pointer p-4 ${
                      selectedParking?.id === lot.id ? 'ring-2 ring-white' : ''
                    }`}
                    onClick={() => setSelectedParking(lot)}
                  >
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack gap={2}>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <H3 className="text-white">{lot.name}</H3>
                          {getParkingTypeBadge(lot.type)}
                        </Stack>
                        <Body size="sm" className="text-on-dark-muted">{lot.address}</Body>
                        <Stack direction="horizontal" gap={4}>
                          <Body size="sm" className="text-on-dark-muted">
                            <Label className="text-on-dark-disabled">Distance:</Label> {lot.distance}
                          </Body>
                          <Body size="sm" className="text-on-dark-muted">
                            <Label className="text-on-dark-disabled">Price:</Label> {lot.price}
                          </Body>
                        </Stack>
                        {lot.amenities.length > 0 && (
                          <Stack direction="horizontal" gap={2} className="flex-wrap">
                            {lot.amenities.map(amenity => (
                              <Badge key={amenity} variant="outline">
                                {amenity}
                              </Badge>
                            ))}
                          </Stack>
                        )}
                      </Stack>
                      <Stack className="text-right">
                        <Body className={`font-display ${getAvailabilityColor(lot.spaces_available, lot.total_spaces)}`}>
                          {lot.spaces_available}
                        </Body>
                        <Body size="sm" className="font-mono text-on-dark-disabled">
                          of {lot.total_spaces} spaces
                        </Body>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card inverted className="p-8 text-center">
                <Body className="text-on-dark-muted">No parking information available</Body>
              </Card>
            )}

            <H2 className="mt-6 text-white">Alternative Transport</H2>
            {transportOptions.length > 0 ? (
              <Stack gap={3}>
                {transportOptions.map(option => (
                  <Card key={option.id} inverted className="p-4">
                    <Stack direction="horizontal" gap={4} className="items-center">
                      <Body className="text-h3-md">{getTransportIcon(option.type)}</Body>
                      <Stack className="flex-1">
                        <Body className="font-display text-white">{option.name}</Body>
                        <Body size="sm" className="text-on-dark-muted">{option.description}</Body>
                        {option.pickup_location && (
                          <Body size="sm" className="font-mono text-on-dark-disabled">
                            Pickup: {option.pickup_location}
                          </Body>
                        )}
                      </Stack>
                      <Stack className="text-right">
                        <Body className="font-display text-white">{option.estimated_time}</Body>
                        {option.estimated_cost && (
                          <Body size="sm" className="text-on-dark-disabled">{option.estimated_cost}</Body>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card inverted className="p-8 text-center">
                <Body className="text-on-dark-muted">No alternative transport options available</Body>
              </Card>
            )}
          </Stack>

          <Stack gap={6}>
            <Stack direction="horizontal" className="items-center justify-between">
              <H2 className="text-white">Turn-by-Turn Directions</H2>
              <Select
                value={travelMode}
                onChange={(e) => {
                  setTravelMode(e.target.value as any);
                  if (userLocation) {
                    fetchDirections(userLocation.lat, userLocation.lng);
                  }
                }}
                className="w-32"
                inverted
              >
                <option value="driving">Driving</option>
                <option value="walking">Walking</option>
                <option value="transit">Transit</option>
              </Select>
            </Stack>

            {!userLocation ? (
              <Card inverted className="p-8 text-center">
                <H3 className="mb-4 text-white">Enable Location</H3>
                <Body className="mb-6 text-on-dark-muted">
                  Allow location access to get turn-by-turn directions
                </Body>
                <Button variant="solid" inverted onClick={getUserLocation}>
                  Share My Location
                </Button>
              </Card>
            ) : directions.length > 0 ? (
              <Card inverted className="p-4">
                <Stack gap={4}>
                  {directions.map((step, index) => (
                    <Stack key={index} direction="horizontal" gap={4}>
                      <Stack className="flex size-8 shrink-0 items-center justify-center rounded-avatar bg-white text-black">
                        <Body className="font-display">{index + 1}</Body>
                      </Stack>
                      <Stack className="flex-1">
                        <Body className="text-white">{step.instruction}</Body>
                        <Stack direction="horizontal" gap={4}>
                          <Body size="sm" className="text-on-dark-disabled">{step.distance}</Body>
                          <Body size="sm" className="text-on-dark-disabled">{step.duration}</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            ) : (
              <Card inverted className="p-8 text-center">
                <Body className="text-on-dark-muted">Calculating route...</Body>
              </Card>
            )}

            {venue && (
              <Card inverted variant="elevated" className="p-6">
                <H3 className="mb-4 text-white">Venue Information</H3>
                <Stack gap={3}>
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-on-dark-disabled">Address</Label>
                    <Body className="text-right text-white">
                      {venue.address}<br />
                      {venue.city}, {venue.state} {venue.zip}
                    </Body>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outlineInk" className="flex-1">
                      Open in Maps
                    </Button>
                    <Button variant="outlineInk" className="flex-1">
                      Copy Address
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            )}

            {selectedParking && (
              <Card inverted variant="elevated" className="p-6 ring-2 ring-white">
                <H3 className="mb-4 text-white">Selected Parking</H3>
                <Stack gap={3}>
                  <Body className="font-display text-white">{selectedParking.name}</Body>
                  <Body size="sm" className="text-on-dark-muted">{selectedParking.address}</Body>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-on-dark-muted">Price</Body>
                    <Body className="font-display text-white">{selectedParking.price}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-on-dark-muted">Available Spaces</Body>
                    <Body className={`font-display ${getAvailabilityColor(selectedParking.spaces_available, selectedParking.total_spaces)}`}>
                      {selectedParking.spaces_available}
                    </Body>
                  </Stack>
                  <Button variant="solid" inverted className="mt-2 w-full">
                    Get Directions to Parking
                  </Button>
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid>
          </Stack>
    </GvtewayAppLayout>
  );
}

export default function DirectionsPage() {
  return (
    <Suspense fallback={<GvtewayLoadingLayout text="Loading directions..." />}>
      <DirectionsContent />
    </Suspense>
  );
}
