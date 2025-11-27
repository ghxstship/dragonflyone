'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../components/navigation';
import { Container, Section, H1, H2, H3, Body, Button, Card, Grid, Badge, LoadingSpinner, EmptyState, Stack } from '@ghxstship/ui';
import { Heart, Trash2, ShoppingCart, Calendar, MapPin, DollarSign } from 'lucide-react';

interface WishlistItem {
  id: string;
  user_id: string;
  event_id: string;
  event_name: string;
  date: string;
  location: string;
  price: number;
  available: boolean;
  tickets_left: number;
  notify_price_drop: boolean;
  added_at: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Get actual user ID from auth context
  const userId = 'demo-user-123';

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wishlist?user_id=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      const data = await response.json();
      setWishlist(data.wishlist || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/wishlist?id=${itemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setWishlist((prev) => prev.filter((item) => item.id !== itemId));
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading your wishlist..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Wishlist"
            description={error}
            action={{ label: "Retry", onClick: fetchWishlist }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={4} direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
          <Stack gap={2}>
            <H1>My Wishlist</H1>
            <Body className="text-ink-600">{wishlist.length} events saved</Body>
          </Stack>
          <Button variant="outline" onClick={() => navigator.share?.({ title: 'My Wishlist', url: window.location.href }) || alert('Share link copied!')}>
            <Heart className="w-4 h-4 mr-2" />
            SHARE WISHLIST
          </Button>
        </Stack>

        {wishlist.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-ink-600" />
            <H2 className="mb-2">NO EVENTS SAVED</H2>
            <Body className="text-ink-500 mb-6">
              Start building your wishlist by saving events you love
            </Body>
            <Button onClick={() => window.location.href = '/events'}>
              BROWSE EVENTS
            </Button>
          </Card>
        ) : (
          <Grid cols={1} gap={4}>
            {wishlist.map((event) => (
              <Card key={event.id} className="p-6 hover:shadow-hard-lg transition-shadow">
                <Stack direction="horizontal" gap={6}>
                  <Card className="w-48 h-32 bg-ink-200 flex-shrink-0" />
                  
                  <Stack className="flex-1">
                    <Stack direction="horizontal" className="items-start justify-between mb-3">
                      <Stack>
                        <H2 className="mb-2">{event.event_name}</H2>
                        <Stack direction="horizontal" gap={4} className="text-body-sm text-ink-600">
                          <Stack direction="horizontal" gap={1} className="items-center">
                            <Calendar className="w-4 h-4" />
                            <Body>{new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}</Body>
                          </Stack>
                          <Stack direction="horizontal" gap={1} className="items-center">
                            <MapPin className="w-4 h-4" />
                            <Body>{event.location}</Body>
                          </Stack>
                        </Stack>
                      </Stack>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(event.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Stack>

                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={4} className="items-center">
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <DollarSign className="w-5 h-5 text-ink-600" />
                          <H3>From ${event.price}</H3>
                        </Stack>
                        {event.available ? (
                          <Badge className="bg-white text-black border-2 border-black">
                            {event.tickets_left} TICKETS LEFT
                          </Badge>
                        ) : (
                          <Badge className="bg-ink-900 text-white">
                            SOLD OUT
                          </Badge>
                        )}
                      </Stack>
                      
                      {event.available ? (
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" onClick={() => router.push(`/events/${event.event_id}`)}>VIEW EVENT</Button>
                          <Button onClick={() => router.push(`/checkout?event=${event.event_id}`)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            BUY TICKETS
                          </Button>
                        </Stack>
                      ) : (
                        <Button variant="outline" onClick={() => router.push(`/events/${event.event_id}/waitlist`)}>JOIN WAITLIST</Button>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        )}

        {wishlist.length > 0 && (
          <Card className="p-6 mt-8 bg-ink-50">
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack>
                <H3 className="mb-1">PRICE ALERTS ENABLED</H3>
                <Body className="text-body-sm text-ink-600">
                  We&apos;ll notify you when prices drop for events on your wishlist
                </Body>
              </Stack>
              <Button variant="outline" onClick={() => router.push('/settings/notifications')}>MANAGE ALERTS</Button>
            </Stack>
          </Card>
        )}
        </Stack>
      </Container>
    </Section>
  );
}
