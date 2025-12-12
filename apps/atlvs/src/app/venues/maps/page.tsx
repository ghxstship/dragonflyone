'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Building2, Layers, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useVenues, useVenueZones } from '../../../hooks/useVenues';
import {
  Container,
  Section,
  Stack,
  Grid,
  Card,
  H2,
  H3,
  Body,
  Button,
  Box,
  Select,
} from '@ghxstship/ui';

export default function VenueMapsPage() {
  const router = useRouter();
  const { data: venues } = useVenues();
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const { data: zones } = useVenueZones(selectedVenueId ? { venueId: selectedVenueId } : undefined);

  const selectedVenue = venues?.find(v => v.id === selectedVenueId);

  const zoneTypeLabels: Record<string, string> = {
    stage: 'Stage',
    audience: 'Audience',
    backstage: 'Backstage',
    vip: 'VIP',
    vendor: 'Vendor',
    parking: 'Parking',
    loading: 'Loading',
    storage: 'Storage',
    other: 'Other',
  };

  const zoneTypeColors: Record<string, string> = {
    stage: '#ec4899', // ATLVS pink
    audience: '#22c55e',
    backstage: '#f59e0b',
    vip: '#8b5cf6',
    vendor: '#3b82f6',
    parking: '#6b7280',
    loading: '#ef4444',
    storage: '#14b8a6',
    other: '#9ca3af',
  };

  return (
    <AtlvsAppLayout>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-center justify-between">
              <Stack gap={1}>
                <H2>Venue Maps</H2>
                <Body className="text-grey-600">Visual layout and zone mapping for venues</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="w-64 border-2 border-grey-300 px-3 py-2"
                >
                  <option value="">Select a venue...</option>
                  {venues?.map(venue => (
                    <option key={venue.id} value={venue.id}>{venue.name}</option>
                  ))}
                </Select>
                {selectedVenueId && (
                  <Button
                    onClick={() => {}}
                    variant="outline"
                    size="sm"
                    icon={<Download className="size-4" />}
                    iconPosition="left"
                  >
                    Export Map
                  </Button>
                )}
              </Stack>
            </Stack>

            {selectedVenueId && selectedVenue ? (
              <Grid cols={4} gap={6}>
                {/* Map Area */}
                <Box className="col-span-3">
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" gap={4} className="items-center justify-between">
                        <H3>{selectedVenue.name} Layout</H3>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" size="icon">
                            <ZoomIn className="size-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <ZoomOut className="size-4" />
                          </Button>
                        </Stack>
                      </Stack>
                      
                      {/* Map Canvas */}
                      <Box className="relative h-96 overflow-hidden rounded-card border-2 border-grey-200 bg-grey-50">
                        {zones && zones.length > 0 ? (
                          <Box className="absolute inset-0 p-4">
                            {/* Simple grid representation of zones */}
                            <Grid cols={3} gap={2} className="h-full">
                              {zones.slice(0, 9).map(zone => (
                                <Box
                                  key={zone.id}
                                  className="flex cursor-pointer flex-col items-center justify-center rounded-card border-2 p-4 transition-all hover:scale-105"
                                  style={{ 
                                    backgroundColor: `${zoneTypeColors[zone.zone_type]}20`,
                                    borderColor: zoneTypeColors[zone.zone_type],
                                  }}
                                  onClick={() => router.push(`/venues/zones/${zone.id}`)}
                                >
                                  <Body className="text-center font-weight-semibold">{zone.name}</Body>
                                  <Body size="sm" className=" text-grey-500">
                                    {zoneTypeLabels[zone.zone_type]}
                                  </Body>
                                  {zone.capacity && (
                                    <Body size="sm" className=" text-grey-500">
                                      Cap: {zone.capacity.toLocaleString()}
                                    </Body>
                                  )}
                                </Box>
                              ))}
                            </Grid>
                          </Box>
                        ) : (
                          <Box className="flex h-full items-center justify-center">
                            <Stack gap={2} className="items-center text-center">
                              <Layers className="size-12 text-grey-300" />
                              <Body className="text-grey-500">No zones configured for this venue.</Body>
                              <Button
                                onClick={() => router.push(`/venues/zones?venue=${selectedVenueId}`)}
                                variant="solid"
                                size="sm"
                              >
                                Add Zones
                              </Button>
                            </Stack>
                          </Box>
                        )}
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* Sidebar */}
                <Stack gap={4}>
                  {/* Venue Info */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Venue Info</H3>
                      <Stack gap={3}>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Type</Body>
                          <Body>{selectedVenue.venue_type}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Capacity</Body>
                          <Body>{selectedVenue.capacity?.toLocaleString() || '—'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Square Footage</Body>
                          <Body>{selectedVenue.square_footage?.toLocaleString() || '—'}</Body>
                        </Stack>
                        <Button
                          onClick={() => router.push(`/venues/${selectedVenueId}`)}
                          variant="outline"
                          size="sm"
                          fullWidth
                        >
                          View Details
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>

                  {/* Zone Legend */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Zone Types</H3>
                      <Stack gap={2}>
                        {Object.entries(zoneTypeLabels).map(([type, label]) => (
                          <Stack key={type} direction="horizontal" gap={3} className="items-center">
                            <Box 
                              className="size-4 rounded-badge" 
                              style={{ backgroundColor: zoneTypeColors[type] }} 
                            />
                            <Body size="sm" className="">{label}</Body>
                            <Body className="ml-auto text-grey-500">
                              {zones?.filter(z => z.zone_type === type).length || 0}
                            </Body>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Actions</H3>
                      <Stack gap={2}>
                        <Button
                          onClick={() => router.push(`/venues/zones?venue=${selectedVenueId}`)}
                          variant="outline"
                          size="sm"
                          fullWidth
                          icon={<MapPin className="size-4" />}
                          iconPosition="left"
                        >
                          Manage Zones
                        </Button>
                        <Button
                          onClick={() => router.push(`/venues/${selectedVenueId}`)}
                          variant="outline"
                          size="sm"
                          fullWidth
                          icon={<Building2 className="size-4" />}
                          iconPosition="left"
                        >
                          Venue Details
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                </Stack>
              </Grid>
            ) : (
              <Card className="border-2 border-grey-200 p-12">
                <Stack gap={4} className="items-center text-center">
                  <Box className="flex size-16 items-center justify-center rounded-card bg-grey-100">
                    <MapPin className="size-8 text-grey-400" />
                  </Box>
                  <Stack gap={2}>
                    <H3>Select a Venue</H3>
                    <Body className="text-grey-500">
                      Choose a venue from the dropdown above to view its zone map and layout.
                    </Body>
                  </Stack>
                  <Button
                    onClick={() => router.push('/venues')}
                    variant="outline"
                    size="sm"
                  >
                    View All Venues
                  </Button>
                </Stack>
              </Card>
            )}
          </Stack>
        </Container>
      </Section>
    </AtlvsAppLayout>
  );
}
