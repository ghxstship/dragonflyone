'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  ProjectCard,
  Kicker,
  Label,
  EmptyState,
} from '@ghxstship/ui';
import { Heart, Bell, Calendar, X } from 'lucide-react';

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
    return <GvtewayLoadingLayout text="Loading favorites..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Your Collection</Kicker>
                <H2 size="lg" className="text-white">My Favorites</H2>
                <Body className="text-on-dark-muted">{favorites.length} saved events</Body>
              </Stack>
              <Stack gap={2}>
                <Label size="xs" className="text-on-dark-muted">Sort By</Label>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  inverted
                >
                  <option value="added">Recently Added</option>
                  <option value="date">Event Date</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </Select>
              </Stack>
            </Stack>

            {success && <Alert variant="success">{success}</Alert>}

            {/* Upcoming Favorites */}
            {upcomingFavorites.length > 0 && (
              <Stack gap={6}>
                <Stack gap={2}>
                  <Kicker colorScheme="on-dark">Coming Up</Kicker>
                  <H2 className="text-white">Upcoming Events</H2>
                </Stack>
                <Grid cols={3} gap={6}>
                  {upcomingFavorites.map(favorite => (
                    <Card key={favorite.id} inverted interactive className="group relative overflow-hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(favorite.id);
                        }}
                        icon={<Heart className="size-4 fill-current text-error" />}
                      />
                      {!favorite.tickets_available && (
                        <Badge className="absolute left-2 top-2 z-10" variant="solid">
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
                      <Stack className="border-t border-ink-800 p-4">
                        <Stack direction="horizontal" className="items-center justify-between">
                          <Body size="sm" className="text-on-dark-muted">{favorite.city}</Body>
                          <Body className="font-display text-white">From ${favorite.price_min}</Body>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            )}

            {/* Past Favorites */}
            {pastFavorites.length > 0 && (
              <Stack gap={6}>
                <H2 className="text-on-dark-muted">Past Events</H2>
                <Grid cols={4} gap={4}>
                  {pastFavorites.map(favorite => (
                    <Card key={favorite.id} inverted className="p-4 opacity-60">
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Badge variant="outline">Past</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            icon={<X className="size-4" />}
                          />
                        </Stack>
                        <H3 size="sm" className="text-white">{favorite.title}</H3>
                        <Label size="xs" className="text-on-dark-muted">{favorite.date}</Label>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            )}

            {/* Empty State */}
            {favorites.length === 0 && (
              <EmptyState
                title="No Favorites Yet"
                description="Save events you're interested in to easily find them later."
                action={{
                  label: "Browse Events",
                  onClick: () => router.push('/browse')
                }}
                inverted
              />
            )}

            {/* Notification CTA */}
            <Card inverted variant="elevated" className="p-6">
              <Stack direction="horizontal" className="flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <Stack gap={2} direction="horizontal" className="items-start">
                  <Bell className="mt-1 size-5 text-on-dark-muted" />
                  <Stack gap={1}>
                    <H3 className="text-white">Get Notified</H3>
                    <Body className="text-on-dark-muted">
                      Set up alerts for your favorite events to never miss a sale.
                    </Body>
                  </Stack>
                </Stack>
                <Button 
                  variant="outlineInk" 
                  onClick={() => router.push('/settings/notifications')}
                  icon={<Calendar className="size-4" />}
                  iconPosition="left"
                >
                  Manage Alerts
                </Button>
              </Stack>
            </Card>
          </Stack>
    </GvtewayAppLayout>
  );
}
