'use client';

import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Stack,
  Kicker,
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
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        {/* Grid Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={4}>
              <Kicker colorScheme="on-dark">Explore Spaces</Kicker>
              <H2 size="lg" className="text-white">Venues</H2>
              <Body className="max-w-2xl text-on-dark-muted">
                Discover world-class venues hosting unforgettable experiences.
              </Body>
            </Stack>

            {/* Action Buttons */}
            <Stack direction="horizontal" gap={4}>
              <Button 
                variant="solid" 
                inverted 
                icon={<Building2 className="size-4" />}
                iconPosition="left"
                onClick={() => router.push('/venues/new')}
                className="shadow-md transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Add Venue
              </Button>
              <Button 
                variant="outlineInk" 
                icon={<Calendar className="size-4" />}
                iconPosition="left"
                onClick={() => router.push('/venues/calendar')}
                className="border-2 shadow-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md"
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
                {displayVenues.map((venue) => (
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
