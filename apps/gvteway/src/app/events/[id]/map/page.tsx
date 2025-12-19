'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  Alert,
  Kicker,
} from '@ghxstship/ui';
import { Map, Navigation, Layers, ZoomIn, ZoomOut, Locate, Info } from 'lucide-react';
import Image from 'next/image';

interface VenueZone {
  id: string;
  name: string;
  type: 'stage' | 'seating' | 'vip' | 'food' | 'restroom' | 'medical' | 'exit' | 'parking' | 'merchandise';
  description?: string;
  capacity?: number;
}

interface VenueMap {
  id: string;
  venue_name: string;
  venue_address: string;
  map_image_url?: string;
  zones: VenueZone[];
  amenities: string[];
}

function useEventMap(eventId: string) {
  const [venueMap, setVenueMap] = useState<VenueMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMap() {
      try {
        const response = await fetch(`/api/events/${eventId}/map`);
        if (!response.ok) {
          if (response.status === 404) {
            setVenueMap(null);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch venue map');
        }
        const data = await response.json();
        setVenueMap(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchMap();
  }, [eventId]);

  return { venueMap, isLoading, error };
}

const zoneColors: Record<VenueZone['type'], string> = {
  stage: 'bg-primary-500',
  seating: 'bg-secondary-500',
  vip: 'bg-accent-500',
  food: 'bg-success-500',
  restroom: 'bg-info-500',
  medical: 'bg-error-500',
  exit: 'bg-warning-500',
  parking: 'bg-ink-500',
  merchandise: 'bg-violet-500',
};

export default function EventMapPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { venueMap, isLoading, error } = useEventMap(eventId);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (isLoading) {
    return <GvtewayLoadingLayout />;
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <Alert variant="error" className="mt-8">
          {error}
        </Alert>
      </GvtewayAppLayout>
    );
  }

  if (!venueMap) {
    return (
      <GvtewayAppLayout>
        <Card inverted className="p-12 text-center mt-12">
          <Map className="w-16 h-16 mx-auto mb-4 text-ink-400" />
          <H2 className="mb-4 text-white">VENUE MAP NOT AVAILABLE</H2>
          <Body className="text-on-dark-muted mb-6">
            The venue map for this event is not yet available.
          </Body>
          <Button variant="solid" inverted onClick={() => router.back()}>
            Go Back
          </Button>
        </Card>
      </GvtewayAppLayout>
    );
  }

  const selectedZoneData = selectedZone 
    ? venueMap.zones.find(z => z.id === selectedZone) 
    : null;

  return (
    <GvtewayAppLayout>
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Venue Map</Kicker>
          <H2 size="lg" className="text-white">{venueMap.venue_name}</H2>
          <Body className="text-on-dark-muted">{venueMap.venue_address}</Body>
        </Stack>

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={6}>
            <Card className="p-6 border-2 border-black relative overflow-hidden">
              <Stack direction="horizontal" className="justify-between items-center mb-4">
                <H3>INTERACTIVE MAP</H3>
                <Stack direction="horizontal" gap={2}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Locate className="w-4 h-4" />
                  </Button>
                </Stack>
              </Stack>

              <Card 
                className="bg-ink-100 h-96 flex items-center justify-center relative"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
              >
                {venueMap.map_image_url ? (
                  <Image 
                    src={venueMap.map_image_url} 
                    alt={`${venueMap.venue_name} map`}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <Stack className="items-center" gap={4}>
                    <Map className="w-24 h-24 text-ink-400" />
                    <Body className="text-ink-500">Interactive map placeholder</Body>
                  </Stack>
                )}
              </Card>
            </Card>

            <Card className="p-6">
              <H3 className="mb-4">VENUE ZONES</H3>
              <Grid cols={2} gap={4}>
                {venueMap.zones.map(zone => (
                  <Button
                    key={zone.id}
                    variant={selectedZone === zone.id ? 'solid' : 'outline'}
                    className="justify-start h-auto py-3"
                    onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                  >
                    <Stack direction="horizontal" gap={3} className="items-center w-full">
                      <span className={`w-4 h-4 rounded-full ${zoneColors[zone.type]}`} />
                      <Stack className="items-start flex-1">
                        <Body className="font-weight-medium">{zone.name}</Body>
                        <Body className="text-mono-xs opacity-70 capitalize">{zone.type}</Body>
                      </Stack>
                      {zone.capacity && (
                        <Badge variant="outline">{zone.capacity}</Badge>
                      )}
                    </Stack>
                  </Button>
                ))}
              </Grid>
            </Card>
          </Stack>

          <Stack gap={6}>
            {selectedZoneData && (
              <Card className="p-6 border-2 border-primary-500">
                <Stack direction="horizontal" gap={3} className="items-center mb-4">
                  <span className={`w-6 h-6 rounded-full ${zoneColors[selectedZoneData.type]}`} />
                  <H3>{selectedZoneData.name}</H3>
                </Stack>
                {selectedZoneData.description && (
                  <Body className="text-ink-600 mb-4">{selectedZoneData.description}</Body>
                )}
                {selectedZoneData.capacity && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-ink-500">Capacity</Body>
                    <Body className="font-weight-bold">{selectedZoneData.capacity}</Body>
                  </Stack>
                )}
                <Button variant="solid" className="w-full mt-4">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </Card>
            )}

            <Card className="p-6">
              <H3 className="mb-4">LEGEND</H3>
              <Stack gap={2}>
                {Object.entries(zoneColors).map(([type, color]) => (
                  <Stack key={type} direction="horizontal" gap={3} className="items-center">
                    <span className={`w-4 h-4 rounded-full ${color}`} />
                    <Body className="capitalize">{type}</Body>
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Card className="p-6">
              <H3 className="mb-4">AMENITIES</H3>
              <Stack gap={2}>
                {venueMap.amenities.map((amenity, index) => (
                  <Stack key={index} direction="horizontal" gap={2} className="items-center">
                    <Info className="w-4 h-4 text-ink-500" />
                    <Body>{amenity}</Body>
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Card className="p-6 bg-success-100 text-success-800">
              <Stack direction="horizontal" gap={3} className="items-center mb-4">
                <Layers className="w-6 h-6" />
                <H3 className="text-white">ACCESSIBILITY</H3>
              </Stack>
              <Body className="text-ink-300 mb-4">
                Need accessibility assistance? View accessible routes and facilities.
              </Body>
              <Button
                variant="outline"
                className="w-full border-white text-white hover:bg-white hover:text-black"
                onClick={() => router.push(`/events/${eventId}/accessibility`)}
              >
                View Accessibility Info
              </Button>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </GvtewayAppLayout>
  );
}
