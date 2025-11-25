'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@ghxstship/ui';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  LoadingSpinner,
  ProjectCard,
  Figure,
} from '@ghxstship/ui';
import Image from 'next/image';

interface Artist {
  id: string;
  name: string;
  bio: string;
  image?: string;
  genre?: string;
  followers_count: number;
  verified: boolean;
  social_links?: {
    spotify?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  image?: string;
  price?: number;
}

export default function ArtistPage() {
  const params = useParams();
  const router = useRouter();
  const artistId = params.id as string;

  const { addNotification } = useNotifications();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchArtist = useCallback(async () => {
    setLoading(true);
    try {
      const [artistRes, eventsRes, followRes] = await Promise.all([
        fetch(`/api/artists/${artistId}`),
        fetch(`/api/artists/${artistId}/events`),
        fetch(`/api/artists/${artistId}/follow/status`),
      ]);

      if (artistRes.ok) {
        const data = await artistRes.json();
        setArtist(data.artist);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }

      if (followRes.ok) {
        const data = await followRes.json();
        setIsFollowing(data.following);
      }
    } catch (err) {
      console.error('Failed to fetch artist');
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchArtist();
  }, [fetchArtist]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const response = await fetch(`/api/artists/${artistId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        if (artist) {
          setArtist({
            ...artist,
            followers_count: artist.followers_count + (isFollowing ? -1 : 1),
          });
        }
      }
    } catch (err) {
      console.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  if (!artist) {
    return (
      <Section className="min-h-screen bg-white">
        <Container>
          <Stack className="items-center justify-center min-h-[60vh]" gap={4}>
            <Display>ARTIST NOT FOUND</Display>
            <Button variant="outline" onClick={() => router.push('/artists')}>
              Browse Artists
            </Button>
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Grid cols={3} gap={8}>
            <Stack className="col-span-1">
              {artist.image ? (
                <Figure className="relative aspect-square bg-gray-100 overflow-hidden">
                  <Image
                    src={artist.image}
                    alt={artist.name}
                    fill
                    className="object-cover grayscale"
                  />
                </Figure>
              ) : (
                <Stack className="aspect-square bg-black items-center justify-center">
                  <Body className="text-white text-6xl">
                    {artist.name.charAt(0)}
                  </Body>
                </Stack>
              )}
            </Stack>

            <Stack className="col-span-2" gap={4}>
              <Stack direction="horizontal" gap={3} className="items-center">
                <Display>{artist.name.toUpperCase()}</Display>
                {artist.verified && (
                  <Badge>Verified</Badge>
                )}
              </Stack>

              {artist.genre && (
                <Badge variant="outline">{artist.genre}</Badge>
              )}

              {artist.bio && (
                <Body className="text-gray-600 max-w-2xl">{artist.bio}</Body>
              )}

              <Stack direction="horizontal" gap={6} className="mt-4">
                <Stack>
                  <H2>{artist.followers_count.toLocaleString()}</H2>
                  <Label className="text-gray-500">Followers</Label>
                </Stack>
                <Stack>
                  <H2>{events.length}</H2>
                  <Label className="text-gray-500">Upcoming Events</Label>
                </Stack>
              </Stack>

              <Stack direction="horizontal" gap={4} className="mt-4">
                <Button
                  variant={isFollowing ? 'outline' : 'solid'}
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {followLoading ? 'Loading...' : isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                </Button>
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(window.location.href); addNotification({ type: 'success', title: 'Copied!', message: 'Artist link copied to clipboard' }); }}>
                  SHARE
                </Button>
              </Stack>

              {artist.social_links && (
                <Stack direction="horizontal" gap={4} className="mt-4">
                  {artist.social_links.spotify && (
                    <Button variant="ghost" size="sm" onClick={() => window.open(artist.social_links?.spotify, '_blank')}>
                      Spotify
                    </Button>
                  )}
                  {artist.social_links.instagram && (
                    <Button variant="ghost" size="sm" onClick={() => window.open(artist.social_links?.instagram, '_blank')}>
                      Instagram
                    </Button>
                  )}
                  {artist.social_links.twitter && (
                    <Button variant="ghost" size="sm" onClick={() => window.open(artist.social_links?.twitter, '_blank')}>
                      Twitter
                    </Button>
                  )}
                </Stack>
              )}
            </Stack>
          </Grid>
        </Section>

        <Section className="mb-12">
          <H2 className="mb-6">UPCOMING EVENTS</H2>
          {events.length > 0 ? (
            <Grid cols={3} gap={6}>
              {events.map(event => (
                <ProjectCard
                  key={event.id}
                  title={event.title}
                  image={event.image || ''}
                  metadata={`${event.date} • ${event.venue}`}
                  onClick={() => router.push(`/events/${event.id}`)}
                />
              ))}
            </Grid>
          ) : (
            <Card className="p-8 text-center">
              <Body className="text-gray-500">No upcoming events scheduled.</Body>
              <Body className="text-gray-400 text-sm mt-2">
                Follow {artist.name} to get notified when new events are announced.
              </Body>
            </Card>
          )}
        </Section>
      </Container>
    </Section>
  );
}
