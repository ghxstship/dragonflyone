'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
  ProjectCard,
} from '@ghxstship/ui';

interface FavoriteEvent {
  id: string;
  event_id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  category: string;
  price_min: number;
  image?: string;
  tickets_available: boolean;
  added_at: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('added');
  const [success, setSuccess] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (err) {
      console.error('Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/user/favorites/${favoriteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Removed from favorites');
        fetchFavorites();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to remove favorite');
    }
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'price':
        return a.price_min - b.price_min;
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
    }
  });

  const upcomingFavorites = sortedFavorites.filter(f => new Date(f.date) >= new Date());
  const pastFavorites = sortedFavorites.filter(f => new Date(f.date) < new Date());

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading favorites..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
            <Stack gap={2}>
              <H1>My Favorites</H1>
              <Body className="text-grey-600">
                {favorites.length} saved events
              </Body>
            </Stack>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-48"
            >
              <option value="added">Recently Added</option>
              <option value="date">Event Date</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </Select>
          </Stack>

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        {upcomingFavorites.length > 0 && (
          <Section className="mb-12">
            <H2 className="mb-6">UPCOMING EVENTS</H2>
            <Grid cols={3} gap={6}>
              {upcomingFavorites.map(favorite => (
                <Card key={favorite.id} className="overflow-hidden group">
                  <Stack className="relative">
                    <Button
                      variant="ghost"
                      className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(favorite.id);
                      }}
                    >
                      ♥
                    </Button>
                    {!favorite.tickets_available && (
                      <Badge className="absolute top-2 left-2 z-10 bg-error-500 text-white">
                        Sold Out
                      </Badge>
                    )}
                    <ProjectCard
                      title={favorite.title}
                      image={favorite.image || ''}
                      metadata={`${favorite.date} • ${favorite.venue}`}
                      tags={[favorite.category]}
                      onClick={() => handleEventClick(favorite.event_id)}
                    />
                  </Stack>
                  <Stack className="p-4 border-t">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Body className="text-sm text-grey-500">{favorite.city}</Body>
                      <Body className="font-bold">From ${favorite.price_min}</Body>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {pastFavorites.length > 0 && (
          <Section className="mb-12">
            <H2 className="mb-6 text-grey-500">PAST EVENTS</H2>
            <Grid cols={4} gap={4}>
              {pastFavorites.map(favorite => (
                <Card key={favorite.id} className="p-4 opacity-60">
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Badge variant="outline" className="text-xs">Past</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFavorite(favorite.id)}
                      >
                        ×
                      </Button>
                    </Stack>
                    <H3 className="text-base">{favorite.title}</H3>
                    <Body className="text-sm text-grey-500">{favorite.date}</Body>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {favorites.length === 0 && (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO FAVORITES YET</H3>
            <Body className="text-grey-600 mb-6">
              Save events you&apos;re interested in to easily find them later.
            </Body>
            <Button variant="solid" onClick={() => router.push('/browse')}>
              Browse Events
            </Button>
          </Card>
        )}

          <Card className="p-6 bg-grey-50">
            <Stack direction="horizontal" className="justify-between items-center">
              <Stack>
                <H3>GET NOTIFIED</H3>
                <Body className="text-grey-600">
                  Set up alerts for your favorite events to never miss a sale.
                </Body>
              </Stack>
              <Button variant="outline" onClick={() => router.push('/settings/notifications')}>
                Manage Alerts
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Section>
  );
}
