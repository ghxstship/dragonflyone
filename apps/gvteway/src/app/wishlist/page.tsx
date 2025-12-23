'use client';

import { useRouter } from 'next/navigation';
import { GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Badge,
  EmptyState,
  Stack,
  Kicker,
  Label,
} from '@ghxstship/ui';
import { Heart, Trash2, ShoppingCart, Calendar, MapPin, Share2 } from 'lucide-react';
import { useWishlistData } from '@/hooks/useWishlist';

export default function WishlistPage() {
  const router = useRouter();
  const userId = 'demo-user-123';

  const {
    wishlist,
    isLoading: loading,
    error,
    refetch,
    removeItem,
  } = useWishlistData(userId);

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  if (loading) {
    return <GvtewayLoadingLayout />;
  }

  if (error) {
    return (
      <>
            <EmptyState
              title="Error Loading Wishlist"
              description={error instanceof Error ? error.message : String(error)}
              action={{ label: "Retry", onClick: () => refetch() }}
              inverted
            />
      </>
    );
  }

  return (
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Saved Events</Kicker>
              <Stack direction="horizontal" className="items-center justify-between">
                <Stack gap={1}>
                  <H2 size="lg" className="text-white">My Wishlist</H2>
                  <Body className="text-on-dark-muted">{wishlist.length} events saved</Body>
                </Stack>
                <Button 
                  variant="outlineInk" 
                  onClick={() => navigator.share?.({ title: 'My Wishlist', url: window.location.href }) || alert('Share link copied!')}
                  icon={<Share2 className="size-4" />}
                  iconPosition="left"
                >
                  Share Wishlist
                </Button>
              </Stack>
            </Stack>

            {wishlist.length === 0 ? (
              <Card inverted className="p-12 text-center">
                <Heart className="mx-auto mb-4 size-16 text-on-dark-disabled" />
                <H3 className="mb-2 text-white">No Events Saved</H3>
                <Body className="mb-6 text-on-dark-muted">
                  Start building your wishlist by saving events you love
                </Body>
                <Button variant="solid" inverted onClick={() => router.push('/events')}>
                  Browse Events
                </Button>
              </Card>
            ) : (
              <Stack gap={4}>
                {wishlist.map((event) => (
                  <Card key={event.id} inverted interactive>
                    <Stack direction="horizontal" gap={6}>
                      <Card inverted className="size-32 shrink-0 bg-ink-700" />
                      
                      <Stack className="flex-1" gap={3}>
                        <Stack direction="horizontal" className="items-start justify-between">
                          <Stack gap={2}>
                            <H3 className="text-white">{event.event_name}</H3>
                            <Stack direction="horizontal" gap={4}>
                              <Stack direction="horizontal" gap={1} className="items-center">
                                <Calendar className="size-4 text-on-dark-muted" />
                                <Label size="xs" className="text-on-dark-muted">
                                  {new Date(event.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </Label>
                              </Stack>
                              <Stack direction="horizontal" gap={1} className="items-center">
                                <MapPin className="size-4 text-on-dark-muted" />
                                <Label size="xs" className="text-on-dark-muted">{event.location}</Label>
                              </Stack>
                            </Stack>
                          </Stack>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(event.id)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </Stack>

                        <Stack direction="horizontal" className="items-center justify-between">
                          <Stack direction="horizontal" gap={4} className="items-center">
                            <Body className="font-display text-white">From ${event.price}</Body>
                            {event.available ? (
                              <Badge variant="solid">{event.tickets_left} Tickets Left</Badge>
                            ) : (
                              <Badge variant="outline">Sold Out</Badge>
                            )}
                          </Stack>
                          
                          {event.available ? (
                            <Stack direction="horizontal" gap={2}>
                              <Button variant="outlineInk" size="sm" onClick={() => router.push(`/events/${event.event_id}`)}>
                                View Event
                              </Button>
                              <Button 
                                variant="solid" 
                                size="sm" 
                                inverted
                                onClick={() => router.push(`/checkout?event=${event.event_id}`)}
                                icon={<ShoppingCart className="size-4" />}
                                iconPosition="left"
                              >
                                Buy Tickets
                              </Button>
                            </Stack>
                          ) : (
                            <Button variant="outlineInk" size="sm" onClick={() => router.push(`/events/${event.event_id}/waitlist`)}>
                              Join Waitlist
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}

            {wishlist.length > 0 && (
              <Card inverted variant="elevated" className="p-6">
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack gap={1}>
                    <H3 className="text-white">Price Alerts Enabled</H3>
                    <Body size="sm" className="text-on-dark-muted">
                      We&apos;ll notify you when prices drop for events on your wishlist
                    </Body>
                  </Stack>
                  <Button variant="outlineInk" onClick={() => router.push('/settings/notifications')}>
                    Manage Alerts
                  </Button>
                </Stack>
              </Card>
            )}
          </Stack>
    </>
  );
}
