"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEvents } from "@/hooks/useEvents";
import {
  PageLayout,
  Navigation,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  H3,
  Body,
  Button,
  Input,
  Select,
  Badge,
  SectionLayout,
  ProjectCard,
  Spinner,
  Stack,
  Grid,
  Card,
  Container,
  LoadingSpinner,
  Link,
  Figure,
} from "@ghxstship/ui";
import Image from "next/image";

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
      header={
        <Navigation
          logo={
            <Display size="md" className="text-display-md">
              GVTEWAY
            </Display>
          }
          cta={
            <Button variant="outlineWhite" size="sm" onClick={() => router.push('/auth/signin')}>
              SIGN IN
            </Button>
          }
        >
          <Link href="/" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-400">
            Home
          </Link>
          <Link href="/events" className="font-heading text-body-sm uppercase tracking-widest text-white">
            Events
          </Link>
          <Link href="/venues" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-400">
            Venues
          </Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={
            <Display size="md" className="text-white text-display-md">
              GVTEWAY
            </Display>
          }
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
            <FooterLink href="/artists">Artists</FooterLink>
          </FooterColumn>
          <FooterColumn title="Support">
            <FooterLink href="#">Help Center</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
            <FooterLink href="#">FAQ</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="#">Privacy</FooterLink>
            <FooterLink href="#">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Container>
          <Stack gap={8}>
            <Stack gap={4} className="text-center">
              <H2 className="text-white">Discover Experiences</H2>
              <Body className="text-grey-400 mx-auto max-w-2xl">
                Explore unforgettable live events, festivals, and performances happening now and coming soon.
              </Body>
            </Stack>

            <Grid cols={3} gap={4}>
            <Input
              type="search"
              placeholder="Search events or venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-grey-700 bg-black text-white"
            />
            <Select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="border-grey-700 bg-black text-white"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </Select>
            <Select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border-grey-700 bg-black text-white"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
              <Stack gap={2} direction="horizontal" className="border-2 border-grey-700 p-2">
                <Button
                  onClick={() => setViewMode("grid")}
                  variant={viewMode === "grid" ? "solid" : "ghost"}
                  size="sm"
                >
                  Grid
                </Button>
                <Button
                  onClick={() => setViewMode("list")}
                  variant={viewMode === "list" ? "solid" : "ghost"}
                  size="sm"
                >
                  List
                </Button>
              </Stack>
            </Grid>

            <Body className="text-grey-400 text-body-sm font-mono uppercase tracking-widest">
              {filteredEvents.length} {filteredEvents.length === 1 ? "Event" : "Events"} Found
            </Body>

            {isLoading ? (
              <Stack className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading events..." />
              </Stack>
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
                />
              ))}
            </Grid>
          ) : (
            <Stack gap={4}>
              {filteredEvents.map((event) => (
                <Card key={event.id} className="border-2 border-grey-800 p-6 hover:border-white transition-colors bg-transparent">
                  <Stack gap={6} direction="horizontal" className="flex-col md:flex-row">
                    <Figure className="w-full md:w-48 h-48 bg-grey-900 relative overflow-hidden">
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
                        <Body className="text-grey-400">
                          {event.venue} • {event.address}
                        </Body>
                        <Body className="text-grey-500 font-mono text-body-sm uppercase tracking-widest">
                          {new Date(event.start_date).toLocaleDateString()}
                        </Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="flex-wrap">
                        <Badge>{event.category.toUpperCase()}</Badge>
                        <Badge>{event.status.toUpperCase()}</Badge>
                      </Stack>
                      <Stack gap={4} direction="horizontal" className="items-center justify-between">
                        <Stack gap={1}>
                          <Body className="text-grey-400 text-body-sm">Venue</Body>
                          <Body className="text-white font-mono">{event.venue}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-grey-400 text-body-sm">Capacity</Body>
                          <Body className="text-white font-mono">{event.capacity.toLocaleString()}</Body>
                        </Stack>
                        <Button 
                          variant="solid" 
                          size="sm"
                          onClick={() => window.location.href = `/events/${event.id}`}
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

            {filteredEvents.length === 0 && (
              <Stack gap={2} className="text-center py-16">
                <H3 className="text-grey-600">No events found</H3>
                <Body className="text-grey-500">Try adjusting your search or filters</Body>
              </Stack>
            )}
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
