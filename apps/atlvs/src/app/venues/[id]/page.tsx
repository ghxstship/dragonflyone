'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, MapPin, Phone, Mail, Calendar, DollarSign, Users } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useVenue, useVenueZones, useZoneStats } from '../../../hooks/useVenues';
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

export default function VenueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const venueId = params.id as string;
  
  const { data: venue, isLoading } = useVenue(venueId);
  const { data: zones } = useVenueZones({ venueId });
  const { data: zoneStats } = useZoneStats(venueId);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    active: 'success',
    contracted: 'success',
    confirmed: 'warning',
    prospective: 'info',
    completed: 'default',
  };

  const venueTypeLabels: Record<string, string> = {
    indoor: 'Indoor',
    outdoor: 'Outdoor',
    hybrid: 'Hybrid',
  };

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

  if (!venue) {
    return (
      <AtlvsAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Venue not found</Body>
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
                  Back to Venues
                </Button>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <H2>{venue.name}</H2>
                    <Badge variant={statusColors[venue.status] || 'ghost'}>
                      {venue.status.toUpperCase()}
                    </Badge>
                  </Stack>
                  <Body className="text-grey-600">
                    {venueTypeLabels[venue.venue_type] || venue.venue_type} | {venue.city && venue.state ? `${venue.city}, ${venue.state}` : 'Location not set'}
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button
                  onClick={() => router.push(`/venues/zones?venue=${venueId}`)}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <MapPin className="size-4" />
                  Manage Zones
                </Button>
                <Button
                  onClick={() => router.push(`/venues/${venueId}/edit`)}
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
                value={venue.capacity?.toLocaleString() || '—'}
                icon={<Users className="size-5" />}
              />
              <StatCard
                label="Square Footage"
                value={venue.square_footage?.toLocaleString() || '—'}
                icon={<MapPin className="size-5" />}
              />
              <StatCard
                label="Rental Cost"
                value={venue.rental_cost ? `$${venue.rental_cost.toLocaleString()}` : '—'}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Zones"
                value={zoneStats?.total || 0}
                icon={<MapPin className="size-5" />}
              />
            </Grid>

            <Grid cols={3} gap={6}>
              {/* Main Content */}
              <Box className="col-span-2">
                <Stack gap={4}>
                  {/* Location */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Location</H3>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Address</Body>
                          <Body>{venue.address || 'Not provided'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">City</Body>
                          <Body>{venue.city || 'Not provided'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">State</Body>
                          <Body>{venue.state || 'Not provided'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Country</Body>
                          <Body>{venue.country || 'Not provided'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Postal Code</Body>
                          <Body>{venue.postal_code || 'Not provided'}</Body>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>

                  {/* Dates */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Schedule</H3>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Contract Start</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Calendar className="size-4 text-grey-400" />
                            <Body>{venue.contract_start ? new Date(venue.contract_start).toLocaleDateString() : 'Not set'}</Body>
                          </Stack>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Contract End</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Calendar className="size-4 text-grey-400" />
                            <Body>{venue.contract_end ? new Date(venue.contract_end).toLocaleDateString() : 'Not set'}</Body>
                          </Stack>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Load In</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Calendar className="size-4 text-grey-400" />
                            <Body>{venue.load_in_date ? new Date(venue.load_in_date).toLocaleDateString() : 'Not set'}</Body>
                          </Stack>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Load Out</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Calendar className="size-4 text-grey-400" />
                            <Body>{venue.load_out_date ? new Date(venue.load_out_date).toLocaleDateString() : 'Not set'}</Body>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>

                  {/* Zones */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" gap={4} className="items-center justify-between">
                        <H3>Zones ({zones?.length || 0})</H3>
                        <Button
                          onClick={() => router.push(`/venues/zones?venue=${venueId}`)}
                          className="border-2 border-grey-300 bg-white px-4 py-2"
                        >
                          Manage Zones
                        </Button>
                      </Stack>
                      {zones && zones.length > 0 ? (
                        <Grid cols={2} gap={3}>
                          {zones.slice(0, 6).map(zone => (
                            <Card 
                              key={zone.id} 
                              className="cursor-pointer border-2 border-grey-200 p-4 hover:border-primary"
                              onClick={() => router.push(`/venues/zones/${zone.id}`)}
                            >
                              <Stack gap={2}>
                                <Stack direction="horizontal" gap={2} className="items-center justify-between">
                                  <Body className="font-weight-semibold">{zone.name}</Body>
                                  <Badge variant={zone.is_active ? 'success' : 'ghost'}>
                                    {zone.is_active ? 'ACTIVE' : 'INACTIVE'}
                                  </Badge>
                                </Stack>
                                <Body className="text-body-sm text-grey-500">
                                  {zoneTypeLabels[zone.zone_type] || zone.zone_type} | Capacity: {zone.capacity?.toLocaleString() || '—'}
                                </Body>
                              </Stack>
                            </Card>
                          ))}
                        </Grid>
                      ) : (
                        <Box className="rounded-card border-2 border-dashed border-grey-300 p-8 text-center">
                          <Body className="text-grey-500">No zones configured yet.</Body>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                </Stack>
              </Box>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* Contact */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Contact</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Contact Name</Body>
                        <Body>{venue.contact_name || 'Not provided'}</Body>
                      </Stack>
                      {venue.contact_email && (
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Email</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Mail className="size-4 text-grey-400" />
                            <Body>{venue.contact_email}</Body>
                          </Stack>
                        </Stack>
                      )}
                      {venue.contact_phone && (
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Phone</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Phone className="size-4 text-grey-400" />
                            <Body>{venue.contact_phone}</Body>
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Financials */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Financials</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Rental Cost</Body>
                        <Body className="font-weight-semibold">{venue.rental_cost ? `$${venue.rental_cost.toLocaleString()}` : 'Not set'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Deposit Amount</Body>
                        <Body className="font-weight-semibold">{venue.deposit_amount ? `$${venue.deposit_amount.toLocaleString()}` : 'Not set'}</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>

                {/* Amenities */}
                {venue.amenities && venue.amenities.length > 0 && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Amenities</H3>
                      <Stack gap={2}>
                        {venue.amenities.map((amenity, index) => (
                          <Badge key={index}>{amenity}</Badge>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                )}

                {/* Notes */}
                {venue.notes && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={2}>
                      <H3>Notes</H3>
                      <Body className="text-grey-600">{venue.notes}</Body>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </AtlvsAppLayout>
  );
}
