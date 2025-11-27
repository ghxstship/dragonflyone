"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@ghxstship/ui";
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
  Spinner,
  Card,
  Grid,
  Stack,
  Label,
  Container,
  Link,
} from "@ghxstship/ui";
import NextLink from "next/link";
import { useArtists, type Artist } from "@/hooks/useArtists";

export default function ArtistsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const { data: artists, isLoading } = useArtists();

  if (isLoading) {
    return (
      <PageLayout background="black">
        <Stack className="min-h-screen items-center justify-center">
          <Spinner size="lg" />
        </Stack>
      </PageLayout>
    );
  }

  const displayArtists = artists || [];
  const filteredArtists = displayArtists.filter((artist: Artist) => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = filterGenre === "all" || (artist.genre?.toLowerCase().includes(filterGenre.toLowerCase()) ?? false);
    return matchesSearch && matchesGenre;
  });

  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
          cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/auth/signin')}>SIGN IN</Button>}
        >
          <Link href="/" className="font-heading text-body-sm uppercase tracking-label hover:text-on-dark-muted">Home</Link>
          <Link href="/events" className="font-heading text-body-sm uppercase tracking-label hover:text-on-dark-muted">Events</Link>
          <Link href="/artists" className="font-heading text-body-sm uppercase tracking-label hover:text-on-dark-muted">Artists</Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-display-md text-white">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/artists">Artists</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Container size="xl">
          <Stack gap={8}>
            <H2 className="text-white">Featured Artists</H2>

            <Stack direction="horizontal" gap={4} className="flex-col md:flex-row">
              <Input
                type="search"
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-ink-700 bg-ink-950 text-white"
              />
              <Select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="border-ink-700 bg-ink-950 text-white md:w-auto"
              >
                <option value="all">All Genres</option>
                <option value="trance">Trance</option>
                <option value="techno">Techno</option>
                <option value="house">House</option>
              </Select>
            </Stack>

            <Grid cols={3} gap={6}>
              {filteredArtists.map((artist: Artist) => (
                <Card key={artist.id} className="border-2 border-ink-800 bg-ink-950 transition-colors hover:border-white">
                  <NextLink href={`/artists/${artist.id}`} className="block">
                    <Card className="aspect-square rounded-none bg-ink-900" />
                    <Stack gap={3} className="p-6">
                      <Stack gap={2}>
                        <H3 className="text-white">{artist.name}</H3>
                        {artist.verified && (
                          <Badge className="w-fit">Verified</Badge>
                        )}
                      </Stack>
                      <Body className="text-body-sm text-on-dark-muted">{artist.genre}</Body>
                      <Stack direction="horizontal" className="justify-between border-t border-ink-800 pt-4">
                        <Stack gap={1}>
                          <Label size="xs" className="text-on-dark-disabled">Followers</Label>
                          <Body className="font-display text-body-md text-white">{((artist.followers || 0) / 1000000).toFixed(1)}M</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-on-dark-disabled">Upcoming Shows</Label>
                          <Body className="font-display text-body-md text-white">{artist.upcoming_shows || 0}</Body>
                        </Stack>
                      </Stack>
                      <Button variant="outlineInk" fullWidth onClick={(e) => { e.preventDefault(); addNotification({ type: 'success', title: 'Following', message: `Now following ${artist.name}` }); }}>
                        Follow
                      </Button>
                    </Stack>
                  </NextLink>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
