"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/hooks/useEvents";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H3,
  Body,
  Button,
  Input,
  Select,
  Badge,
  Section,
  SectionHeader,
  ProjectCard,
  Stack,
  Grid,
  Card,
  Container,
  LoadingSpinner,
  Figure,
  Label,
  EmptyState,
} from "@ghxstship/ui";
import Image from "next/image";
import { LayoutGrid, List as ListIcon, Search, MapPin, Tag } from "lucide-react";

const genres = ["All", "Electronic", "Hip-Hop", "Art", "Sports", "Multi-Genre"];
const cities = ["All", "Miami, FL", "Miami Beach, FL", "Miami Gardens, FL"];

export default function EventsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: events, isLoading } = useEvents({ status: 'published' });

  const filteredEvents = (events || []).filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || event.category === selectedGenre;
    const matchesCity = selectedCity === "All" || event.address.includes(selectedCity);
    return matchesSearch && matchesGenre && matchesCity;
  });

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
            <FooterLink href="/help#faq">FAQ</FooterLink>
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
              kicker="Browse Events"
              title="Discover Experiences"
              description="Explore unforgettable live events, festivals, and performances happening now and coming soon."
              align="center"
              colorScheme="on-dark"
              gap="lg"
            />

            {/* Search & Filters */}
            <Card className="border-2 border-grey-800 bg-grey-950/50 p-6">
              <Stack gap={4}>
                <Grid cols={1} gap={4} className="md:grid-cols-3">
                  <Stack gap={2}>
                    <Label size="xs" className="text-on-dark-muted">
                      <Search className="mr-2 inline size-4" />
                      Search
                    </Label>
                    <Input
                      type="search"
                      placeholder="Search events or venues..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      inverted
                    />
                  </Stack>
                  <Stack gap={2}>
                    <Label size="xs" className="text-on-dark-muted">
                      <Tag className="mr-2 inline size-4" />
                      Genre
                    </Label>
                    <Select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      inverted
                    >
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </Select>
                  </Stack>
                  <Stack gap={2}>
                    <Label size="xs" className="text-on-dark-muted">
                      <MapPin className="mr-2 inline size-4" />
                      Location
                    </Label>
                    <Select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      inverted
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </Select>
                  </Stack>
                </Grid>
                
                {/* View Toggle & Results Count */}
                <Stack direction="horizontal" className="items-center justify-between">
                  <Label size="xs" className="text-on-dark-muted">
                    {filteredEvents.length} {filteredEvents.length === 1 ? "Event" : "Events"} Found
                  </Label>
                  <Stack direction="horizontal" gap={1} className="rounded-[var(--radius-button)] border-2 border-grey-700 p-1">
                    <Button
                      onClick={() => setViewMode("grid")}
                      variant={viewMode === "grid" ? "solid" : "ghost"}
                      size="sm"
                      inverted
                      icon={<LayoutGrid className="size-4" />}
                      iconPosition="left"
                    >
                      Grid
                    </Button>
                    <Button
                      onClick={() => setViewMode("list")}
                      variant={viewMode === "list" ? "solid" : "ghost"}
                      size="sm"
                      inverted
                      icon={<ListIcon className="size-4" />}
                      iconPosition="left"
                    >
                      List
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            {/* Events Display */}
            {isLoading ? (
              <Stack className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" text="Loading events..." />
              </Stack>
            ) : filteredEvents.length === 0 ? (
              <EmptyState
                title="No events found"
                description="Try adjusting your search or filters to find events."
                action={{
                  label: "Clear Filters",
                  onClick: () => {
                    setSearchQuery("");
                    setSelectedGenre("All");
                    setSelectedCity("All");
                  }
                }}
                inverted
              />
            ) : viewMode === "grid" ? (
              <Grid cols={3} gap={6}>
                {filteredEvents.map((event) => (
                  <ProjectCard
                    key={event.id}
                    title={event.name}
                    image={event.image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'}
                    imageAlt={event.name}
                    metadata={`${event.venue} // ${new Date(event.start_date).toLocaleDateString()}`}
                    tags={[event.category.toUpperCase(), event.status.toUpperCase()]}
                    onClick={() => router.push(`/events/${event.id}`)}
                  />
                ))}
              </Grid>
            ) : (
              <Stack gap={4}>
                {filteredEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    className="border-2 border-grey-800 bg-transparent p-6 shadow-sm transition-all duration-100 hover:-translate-y-0.5 hover:border-white hover:shadow-md"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    <Stack gap={6} direction="horizontal" className="flex-col md:flex-row">
                      <Figure className="relative size-48 overflow-hidden bg-grey-900 md:w-48">
                        <Image
                          src={event.image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'}
                          alt={event.name}
                          fill
                          className="object-cover grayscale"
                        />
                      </Figure>
                      <Stack gap={4} className="flex-1">
                        <Stack gap={2}>
                          <H3 className="text-white">{event.name}</H3>
                          <Body className="text-on-dark-muted">
                            {event.venue} • {event.address}
                          </Body>
                          <Label size="xs" className="text-on-dark-disabled">
                            {new Date(event.start_date).toLocaleDateString()}
                          </Label>
                        </Stack>
                        <Stack gap={2} direction="horizontal" className="flex-wrap">
                          <Badge>{event.category.toUpperCase()}</Badge>
                          <Badge variant="outline">{event.status.toUpperCase()}</Badge>
                        </Stack>
                        <Stack gap={6} direction="horizontal" className="items-end justify-between">
                          <Stack direction="horizontal" gap={8}>
                            <Stack gap={1}>
                              <Label size="xs" className="text-on-dark-disabled">Venue</Label>
                              <Body size="sm" className="text-white">{event.venue}</Body>
                            </Stack>
                            <Stack gap={1}>
                              <Label size="xs" className="text-on-dark-disabled">Capacity</Label>
                              <Body size="sm" className="text-white">{event.capacity.toLocaleString()}</Body>
                            </Stack>
                          </Stack>
                          <Button 
                            variant="solid" 
                            size="sm"
                            inverted
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/events/${event.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
