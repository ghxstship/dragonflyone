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
import { useArtists } from "@/hooks/useArtists";

export default function ArtistsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const { data: artists, isLoading } = useArtists();

  if (isLoading) {
    return (
      <PageLayout background="black">
        <Stack className="items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </Stack>
      </PageLayout>
    );
  }

  const displayArtists = artists || [];
  const filteredArtists = displayArtists.filter((artist: any) => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = filterGenre === "all" || artist.genre.toLowerCase().includes(filterGenre.toLowerCase());
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
          <Link href="/" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Home</Link>
          <Link href="/events" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Events</Link>
          <Link href="/artists" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Artists</Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
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

            <Stack direction="horizontal" gap={4}>
              <Input
                type="search"
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-black text-white border-grey-700"
              />
              <Select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="border-grey-700 bg-black text-white"
              >
                <option value="all">All Genres</option>
                <option value="trance">Trance</option>
                <option value="techno">Techno</option>
                <option value="house">House</option>
              </Select>
            </Stack>

            <Grid cols={3} gap={6}>
              {filteredArtists.map((artist: any) => (
                <Card key={artist.id} className="border-2 border-grey-800 hover:border-white transition-colors bg-black">
                  <NextLink href={`/artists/${artist.id}`} className="block">
                    <Card className="aspect-square bg-grey-900 rounded-none" />
                    <Stack gap={3} className="p-6">
                      <Stack gap={2}>
                        <H3 className="text-white">{artist.name}</H3>
                        {artist.verified && (
                          <Badge className="w-fit">Verified</Badge>
                        )}
                      </Stack>
                      <Body className="text-sm text-grey-400">{artist.genre}</Body>
                      <Stack direction="horizontal" className="justify-between border-t border-grey-800 pt-4">
                        <Stack gap={1}>
                          <Label size="xs" className="text-grey-500">Followers</Label>
                          <Body className="font-display text-lg text-white">{((artist.followers || 0) / 1000000).toFixed(1)}M</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-grey-500">Upcoming Shows</Label>
                          <Body className="font-display text-lg text-white">{artist.upcoming_shows || 0}</Body>
                        </Stack>
                      </Stack>
                      <Button variant="outline" className="w-full border-grey-700 text-grey-400 hover:border-white hover:text-white" onClick={(e) => { e.preventDefault(); addNotification({ type: 'success', title: 'Following', message: `Now following ${artist.name}` }); }}>
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
