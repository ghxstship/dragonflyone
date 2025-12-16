'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Input,
  Select,
  Card,
  Grid,
  Badge,
  Stack,
  Kicker,
  EmptyState,
  Label,
} from '@ghxstship/ui';
import { useVenues } from '@/hooks/useVenues';
import { MapPin, Users, Calendar, Building2, Search } from 'lucide-react';

export default function VenuesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCapacity, setFilterCapacity] = useState('all');
  const { data: venues, isLoading } = useVenues({ status: 'active' });

  const displayVenues = venues || [];
  
  const filteredVenues = displayVenues.filter((venue) => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (venue.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCapacity = filterCapacity === 'all' ||
      (filterCapacity === 'small' && venue.capacity < 1000) ||
      (filterCapacity === 'medium' && venue.capacity >= 1000 && venue.capacity < 5000) ||
      (filterCapacity === 'large' && venue.capacity >= 5000);
    return matchesSearch && matchesCapacity;
  });

  if (isLoading) {
    return <GvtewayLoadingLayout text="Loading venues..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={4}>
              <Kicker colorScheme="on-dark">Explore Spaces</Kicker>
              <H2 size="lg" className="text-white">Venues</H2>
              <Body className="max-w-2xl text-on-dark-muted">
                Discover world-class venues hosting unforgettable experiences.
              </Body>
            </Stack>

            {/* Search & Filters */}
            <Card inverted variant="elevated" className="p-6">
              <Stack direction="horizontal" gap={4} className="flex-col md:flex-row">
                <Stack gap={2} className="flex-1">
                  <Label size="xs" className="text-on-dark-muted">
                    <Search className="mr-2 inline size-4" />
                    Search
                  </Label>
                  <Input
                    type="search"
                    placeholder="Search venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    inverted
                  />
                </Stack>
                <Stack gap={2} className="md:w-48">
                  <Label size="xs" className="text-on-dark-muted">
                    <Users className="mr-2 inline size-4" />
                    Capacity
                  </Label>
                  <Select
                    value={filterCapacity}
                    onChange={(e) => setFilterCapacity(e.target.value)}
                    inverted
                  >
                    <option value="all">All Sizes</option>
                    <option value="small">Small (&lt;1,000)</option>
                    <option value="medium">Medium (1K-5K)</option>
                    <option value="large">Large (5K+)</option>
                  </Select>
                </Stack>
              </Stack>
            </Card>

            {/* Action Buttons */}
            <Stack direction="horizontal" gap={4}>
              <Button 
                variant="solid" 
                inverted 
                icon={<Building2 className="size-4" />}
                iconPosition="left"
                onClick={() => router.push('/venues/new')}
              >
                Add Venue
              </Button>
              <Button 
                variant="outlineInk" 
                icon={<Calendar className="size-4" />}
                iconPosition="left"
                onClick={() => router.push('/venues/calendar')}
              >
                Calendar View
              </Button>
            </Stack>

            {/* Venues List */}
            {filteredVenues.length > 0 ? (
              <Stack gap={4}>
                {filteredVenues.map((venue) => (
                  <Card 
                    key={venue.id}
                    inverted
                    interactive
                    onClick={() => router.push(`/venues/${venue.id}`)}
                  >
                    <Grid cols={4} gap={6}>
                      <Stack gap={2}>
                        <H3 className="text-white">{venue.name}</H3>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Users className="size-4 text-on-dark-muted" />
                          <Body size="sm" className="text-on-dark-muted">
                            {venue.capacity.toLocaleString()} capacity
                          </Body>
                        </Stack>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <MapPin className="size-4 text-on-dark-muted" />
                          <Body size="sm" className="text-on-dark-muted">{venue.address || 'Location TBD'}</Body>
                        </Stack>
                      </Stack>
                      <Stack gap={2} className="col-span-2">
                        <Label size="xs" className="text-on-dark-disabled">Status</Label>
                        <Stack direction="horizontal" gap={2} className="flex-wrap">
                          <Badge variant="outline">{venue.status?.toUpperCase() || 'ACTIVE'}</Badge>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={3} className="items-center justify-end">
                        <Badge variant={venue.status === 'active' ? 'solid' : 'outline'}>
                          {(venue.status || 'active').toUpperCase()}
                        </Badge>
                        <Button 
                          variant="outlineInk" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/venues/${venue.id}/calendar`);
                          }}
                        >
                          View Calendar
                        </Button>
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            ) : (
              <EmptyState
                title="No venues found"
                description="Try adjusting your search or filters."
                action={{
                  label: "Clear Filters",
                  onClick: () => {
                    setSearchQuery('');
                    setFilterCapacity('all');
                  }
                }}
                inverted
              />
            )}
          </Stack>
    </GvtewayAppLayout>
  );
}
