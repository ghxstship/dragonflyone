"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@ghxstship/ui";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  PageLayout,
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
  Section,
  Card,
  Grid,
  Stack,
  Label,
  Kicker,
  Container,
  LoadingSpinner,
  EmptyState,
  Figure,
} from "@ghxstship/ui";
import NextLink from "next/link";
import { useArtists, type Artist } from "@/hooks/useArtists";
import { Search, Music, Heart, Users, Calendar } from "lucide-react";

export default function ArtistsPage() {
  const _router = useRouter();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const { data: artists, isLoading } = useArtists();

  const displayArtists = artists || [];
  const filteredArtists = displayArtists.filter((artist: Artist) => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = filterGenre === "all" || (artist.genre?.toLowerCase().includes(filterGenre.toLowerCase()) ?? false);
    return matchesSearch && matchesGenre;
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
              <Kicker colorScheme="on-dark">Discover Talent</Kicker>
              <H2 size="lg" className="text-white">Featured Artists</H2>
              <Body className="max-w-2xl text-on-dark-muted">
                Follow your favorite artists and never miss a show.
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
                    placeholder="Search artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    inverted
                  />
                </Stack>
                <Stack gap={2} className="md:w-48">
                  <Label size="xs" className="text-on-dark-muted">
                    <Music className="mr-2 inline size-4" />
                    Genre
                  </Label>
                  <Select
                    value={filterGenre}
                    onChange={(e) => setFilterGenre(e.target.value)}
                    inverted
                  >
                    <option value="all">All Genres</option>
                    <option value="trance">Trance</option>
                    <option value="techno">Techno</option>
                    <option value="house">House</option>
                    <option value="electronic">Electronic</option>
                  </Select>
                </Stack>
              </Stack>
            </Card>

            {/* Results Count */}
            <Label size="xs" className="text-on-dark-muted">
              {filteredArtists.length} {filteredArtists.length === 1 ? "Artist" : "Artists"} Found
            </Label>

            {/* Artists Grid */}
            {isLoading ? (
              <Stack className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" text="Loading artists..." />
              </Stack>
            ) : filteredArtists.length === 0 ? (
              <EmptyState
                title="No artists found"
                description="Try adjusting your search or filters."
                action={{
                  label: "Clear Filters",
                  onClick: () => {
                    setSearchQuery("");
                    setFilterGenre("all");
                  }
                }}
                inverted
              />
            ) : (
              <Grid cols={3} gap={6}>
                {filteredArtists.map((artist: Artist) => (
                  <Card 
                    key={artist.id}
                    inverted
                    interactive
                  >
                    <NextLink href={`/artists/${artist.id}`} className="block">
                      <Figure className="aspect-square bg-ink-900" />
                      <Stack gap={4} className="p-6">
                        <Stack gap={2}>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <H3 className="text-white">{artist.name}</H3>
                            {artist.verified && (
                              <Badge size="sm">Verified</Badge>
                            )}
                          </Stack>
                          <Body size="sm" className="text-on-dark-muted">{artist.genre}</Body>
                        </Stack>
                        
                        <Stack direction="horizontal" className="justify-between border-t border-ink-800 pt-4">
                          <Stack gap={1}>
                            <Label size="xs" className="text-on-dark-disabled">
                              <Users className="mr-1 inline size-3" />
                              Followers
                            </Label>
                            <Body size="sm" className="font-display text-white">
                              {((artist.followers || 0) / 1000000).toFixed(1)}M
                            </Body>
                          </Stack>
                          <Stack gap={1}>
                            <Label size="xs" className="text-on-dark-disabled">
                              <Calendar className="mr-1 inline size-3" />
                              Shows
                            </Label>
                            <Body size="sm" className="font-display text-white">
                              {artist.upcoming_shows || 0}
                            </Body>
                          </Stack>
                        </Stack>
                        
                        <Button 
                          variant="outlineInk" 
                          fullWidth 
                          icon={<Heart className="size-4" />}
                          iconPosition="left"
                          onClick={(e) => { 
                            e.preventDefault(); 
                            addNotification({ 
                              type: 'success', 
                              title: 'Following', 
                              message: `Now following ${artist.name}` 
                            }); 
                          }}
                        >
                          Follow
                        </Button>
                      </Stack>
                    </NextLink>
                  </Card>
                ))}
              </Grid>
            )}
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
