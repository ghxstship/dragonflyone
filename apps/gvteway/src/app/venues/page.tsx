'use client';

import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  SectionHeader,
  Display,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Stack,
  EmptyState,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  LoadingSpinner,
  Label,
} from '@ghxstship/ui';
import { useVenues } from '@/hooks/useVenues';
import { MapPin, Users, Calendar, Building2 } from 'lucide-react';

export default function VenuesPage() {
  const router = useRouter();
  const { data: venues, isLoading } = useVenues({ status: 'active' });

  const displayVenues = venues || [];

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
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
            <FooterLink href="/artists">Artists</FooterLink>
          </FooterColumn>
          <FooterColumn title="Support">
            <FooterLink href="/help">Help Center</FooterLink>
            <FooterLink href="/help#contact">Contact</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section className="bg-black py-16">
        <Container>
          <Stack gap={10}>
            {/* Page Header */}
            <SectionHeader
              kicker="Explore Spaces"
              title="Venues"
              description="Discover world-class venues hosting unforgettable experiences."
              colorScheme="on-dark"
              gap="lg"
            />

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
            {isLoading ? (
              <Stack className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" text="Loading venues..." />
              </Stack>
            ) : displayVenues.length > 0 ? (
              <Stack gap={4}>
                {displayVenues.map((venue: any) => (
                  <Card 
                    key={venue.id} 
                    className="border-2 border-grey-800 bg-transparent p-6 shadow-sm transition-all duration-100 hover:-translate-y-0.5 hover:border-white hover:shadow-md"
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
                          <Body size="sm" className="text-on-dark-muted">{venue.location}</Body>
                        </Stack>
                      </Stack>
                      <Stack gap={2} className="col-span-2">
                        <Label size="xs" className="text-on-dark-disabled">Upcoming Events</Label>
                        <Stack direction="horizontal" gap={2} className="flex-wrap">
                          <Badge variant="outline">{venue.upcomingEvents} scheduled</Badge>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={3} className="items-center justify-end">
                        <Badge variant={venue.status === 'booked' ? 'solid' : 'outline'}>
                          {venue.status.toUpperCase()}
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
                title="No Venues Found"
                description="Events will populate venue data as they are created."
                inverted
              />
            )}
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
