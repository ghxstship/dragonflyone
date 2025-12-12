'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, MapPin, Users, Lock } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useVenueZone } from '../../../../hooks/useVenues';
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
  Badge,
  Box,
  StatCard,
} from '@ghxstship/ui';

export default function ZoneDetailPage() {
  const router = useRouter();
  const params = useParams();
  const zoneId = params.id as string;
  
  const { data: zone, isLoading } = useVenueZone(zoneId);

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

  const accessLevelLabels: Record<string, string> = {
    public: 'Public',
    restricted: 'Restricted',
    staff_only: 'Staff Only',
    vip_only: 'VIP Only',
  };

  const accessLevelColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
    public: 'success',
    restricted: 'warning',
    staff_only: 'error',
    vip_only: 'info',
  };

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Loading...</Body>
          </Container>
        </Section>
      </AtlvsAppLayout>
    );
  }

  if (!zone) {
    return (
      <AtlvsAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Zone not found</Body>
          </Container>
        </Section>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-start justify-between">
              <Stack gap={4}>
                <Button
                  onClick={() => router.back()}
                  className="flex w-fit items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <ArrowLeft className="size-4" />
                  Back to Zones
                </Button>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <H2>{zone.name}</H2>
                    <Badge variant={zone.is_active ? 'success' : 'ghost'}>
                      {zone.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                    <Badge variant={accessLevelColors[zone.access_level] || 'ghost'}>
                      {accessLevelLabels[zone.access_level] || zone.access_level}
                    </Badge>
                  </Stack>
                  <Body className="text-grey-600">
                    {zoneTypeLabels[zone.zone_type] || zone.zone_type} | {zone.venue?.name || 'No venue'}
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button
                  onClick={() => router.push(`/venues/${zone.venue_id}`)}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <MapPin className="size-4" />
                  View Venue
                </Button>
                <Button
                  onClick={() => router.push(`/venues/zones/${zoneId}/edit`)}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </Stack>
            </Stack>

            {/* Stats */}
            <Grid cols={4} gap={4}>
              <StatCard
                label="Capacity"
                value={zone.capacity?.toLocaleString() || '—'}
                icon={<Users className="size-5" />}
              />
              <StatCard
                label="Square Footage"
                value={zone.square_footage?.toLocaleString() || '—'}
                icon={<MapPin className="size-5" />}
              />
              <StatCard
                label="Access Level"
                value={accessLevelLabels[zone.access_level] || zone.access_level}
                icon={<Lock className="size-5" />}
              />
              <StatCard
                label="Zone Type"
                value={zoneTypeLabels[zone.zone_type] || zone.zone_type}
                icon={<MapPin className="size-5" />}
              />
            </Grid>

            <Grid cols={3} gap={6}>
              {/* Main Content */}
              <Box className="col-span-2">
                <Stack gap={4}>
                  {/* Description */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={3}>
                      <H3>Description</H3>
                      <Body className="text-grey-700">
                        {zone.description || 'No description provided.'}
                      </Body>
                    </Stack>
                  </Card>

                  {/* Zone Details */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Zone Details</H3>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Zone Type</Body>
                          <Body>{zoneTypeLabels[zone.zone_type] || zone.zone_type}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Access Level</Body>
                          <Badge variant={accessLevelColors[zone.access_level] || 'ghost'}>
                            {accessLevelLabels[zone.access_level] || zone.access_level}
                          </Badge>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Capacity</Body>
                          <Body>{zone.capacity?.toLocaleString() || 'Not specified'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Square Footage</Body>
                          <Body>{zone.square_footage?.toLocaleString() || 'Not specified'}</Body>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>

                  {/* Coordinates (if available) */}
                  {zone.coordinates && (
                    <Card className="border-2 border-grey-200 p-6">
                      <Stack gap={4}>
                        <H3>Map Position</H3>
                        <Grid cols={4} gap={4}>
                          <Stack gap={1}>
                            <Body size="sm" className=" text-grey-500">X Position</Body>
                            <Body>{zone.coordinates.x}</Body>
                          </Stack>
                          <Stack gap={1}>
                            <Body size="sm" className=" text-grey-500">Y Position</Body>
                            <Body>{zone.coordinates.y}</Body>
                          </Stack>
                          <Stack gap={1}>
                            <Body size="sm" className=" text-grey-500">Width</Body>
                            <Body>{zone.coordinates.width}</Body>
                          </Stack>
                          <Stack gap={1}>
                            <Body size="sm" className=" text-grey-500">Height</Body>
                            <Body>{zone.coordinates.height}</Body>
                          </Stack>
                        </Grid>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              </Box>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* Venue Info */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Venue</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Venue Name</Body>
                        <Body>{zone.venue?.name || 'Not assigned'}</Body>
                      </Stack>
                      <Button
                        onClick={() => router.push(`/venues/${zone.venue_id}`)}
                        className="w-full border-2 border-grey-300 bg-white px-4 py-2"
                      >
                        View Venue Details
                      </Button>
                    </Stack>
                  </Stack>
                </Card>

                {/* Status */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Status</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Active Status</Body>
                        <Badge variant={zone.is_active ? 'success' : 'ghost'}>
                          {zone.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </Stack>
                      {zone.parent_zone && (
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Parent Zone</Body>
                          <Body>{zone.parent_zone.name}</Body>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Timestamps */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Timestamps</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Created</Body>
                        <Body>{new Date(zone.created_at).toLocaleString()}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Last Updated</Body>
                        <Body>{new Date(zone.updated_at).toLocaleString()}</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </AtlvsAppLayout>
  );
}
