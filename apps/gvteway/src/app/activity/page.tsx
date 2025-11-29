'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@ghxstship/ui';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Grid,
  Stack,
  EmptyState,
  Kicker,
} from '@ghxstship/ui';
import Image from 'next/image';
import { Activity, Ticket, Star, UserPlus, Heart, MapPin, Share2, Users, TrendingUp } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'ticket_purchase' | 'review' | 'follow' | 'favorite' | 'check_in' | 'share';
  user_id: string;
  user_name: string;
  user_avatar?: string;
  event_id?: string;
  event_title?: string;
  event_image?: string;
  artist_id?: string;
  artist_name?: string;
  venue_id?: string;
  venue_name?: string;
  content?: string;
  created_at: string;
}

export default function ActivityFeedPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filter !== 'all' && { type: filter }),
      });

      const response = await fetch(`/api/activity/feed?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket_purchase': return <Ticket className="size-4 text-on-dark-muted" />;
      case 'review': return <Star className="size-4 text-on-dark-muted" />;
      case 'follow': return <UserPlus className="size-4 text-on-dark-muted" />;
      case 'favorite': return <Heart className="size-4 text-on-dark-muted" />;
      case 'check_in': return <MapPin className="size-4 text-on-dark-muted" />;
      case 'share': return <Share2 className="size-4 text-on-dark-muted" />;
      default: return <Activity className="size-4 text-on-dark-muted" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'ticket_purchase':
        return `got tickets to ${activity.event_title}`;
      case 'review':
        return `reviewed ${activity.event_title}`;
      case 'follow':
        if (activity.artist_name) return `started following ${activity.artist_name}`;
        if (activity.venue_name) return `started following ${activity.venue_name}`;
        return 'started following someone';
      case 'favorite':
        return `saved ${activity.event_title} to favorites`;
      case 'check_in':
        return `checked in at ${activity.event_title}`;
      case 'share':
        return `shared ${activity.event_title}`;
      default:
        return 'did something';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading activity..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">Activity Feed</H2>
              <Body className="text-on-dark-muted">See what your friends are up to</Body>
            </Stack>

            {/* Filter Buttons */}
            <Card inverted className="p-4">
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                {['all', 'ticket_purchase', 'review', 'check_in', 'follow'].map(f => (
                  <Button
                    key={f}
                    variant={filter === f ? 'solid' : 'outlineInk'}
                    size="sm"
                    inverted={filter === f}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? 'All' : f === 'ticket_purchase' ? 'Tickets' : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                  </Button>
                ))}
              </Stack>
            </Card>

            <Grid cols={3} gap={8}>
              {/* Activity Feed */}
              <Stack className="col-span-2" gap={4}>
                {activities.length > 0 ? (
                  <Stack gap={4}>
                    {activities.map(activity => (
                      <Card key={activity.id} inverted interactive>
                        <Stack direction="horizontal" gap={4}>
                          <Stack className="flex size-12 shrink-0 items-center justify-center rounded-avatar bg-ink-700">
                            {activity.user_avatar ? (
                              <Image
                                src={activity.user_avatar}
                                alt={activity.user_name}
                                width={48}
                                height={48}
                                className="size-full rounded-avatar object-cover"
                              />
                            ) : (
                              <Body className="text-white">{activity.user_name.charAt(0)}</Body>
                            )}
                          </Stack>

                          <Stack className="flex-1" gap={2}>
                            <Stack direction="horizontal" gap={2} className="flex-wrap items-center">
                              <Body className="font-display text-white">{activity.user_name}</Body>
                              <Body className="text-on-dark-muted">{getActivityText(activity)}</Body>
                            </Stack>

                            {activity.content && (
                              <Body className="italic text-on-dark-muted">
                                &quot;{activity.content}&quot;
                              </Body>
                            )}

                            {activity.event_id && (
                              <Card
                                inverted
                                interactive
                                className="mt-2 cursor-pointer"
                                onClick={() => router.push(`/events/${activity.event_id}`)}
                              >
                                <Stack direction="horizontal" gap={3}>
                                  {activity.event_image && (
                                    <Stack className="size-16 shrink-0 overflow-hidden rounded-card bg-ink-700">
                                      <Image
                                        src={activity.event_image}
                                        alt={activity.event_title || ''}
                                        width={64}
                                        height={64}
                                        className="size-full object-cover"
                                      />
                                    </Stack>
                                  )}
                                  <Stack gap={1}>
                                    <Body className="font-display text-white">{activity.event_title}</Body>
                                    <Label size="xs" className="text-on-dark-muted">View Event →</Label>
                                  </Stack>
                                </Stack>
                              </Card>
                            )}

                            <Stack direction="horizontal" gap={2} className="mt-2 items-center">
                              {getActivityIcon(activity.type)}
                              <Label size="xs" className="text-on-dark-disabled">
                                {formatTimeAgo(activity.created_at)}
                              </Label>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <EmptyState
                    title="No Activity Yet"
                    description="Follow friends and artists to see their activity here."
                    action={{ label: "Find Friends", onClick: () => router.push('/community') }}
                    inverted
                  />
                )}
              </Stack>

              {/* Sidebar */}
              <Stack gap={6}>
                {/* Suggested Friends */}
                <Card inverted variant="elevated" className="p-6">
                  <Stack direction="horizontal" gap={2} className="mb-4 items-center">
                    <Users className="size-5 text-on-dark-muted" />
                    <H3 className="text-white">Suggested Friends</H3>
                  </Stack>
                  <Stack gap={3}>
                    {[1, 2, 3].map(i => (
                      <Stack key={i} direction="horizontal" className="items-center justify-between">
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <Stack className="size-10 rounded-avatar bg-ink-700" />
                          <Stack gap={0}>
                            <Body size="sm" className="font-display text-white">Friend {i}</Body>
                            <Label size="xs" className="text-on-dark-disabled">3 mutual friends</Label>
                          </Stack>
                        </Stack>
                        <Button 
                          variant="outlineInk" 
                          size="sm" 
                          onClick={() => addNotification({ type: 'success', title: 'Following', message: 'You are now following this user' })}
                        >
                          Follow
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                  <Button variant="ghost" fullWidth className="mt-4" onClick={() => router.push('/community')}>
                    See More
                  </Button>
                </Card>

                {/* Trending Events */}
                <Card inverted variant="elevated" className="p-6">
                  <Stack direction="horizontal" gap={2} className="mb-4 items-center">
                    <TrendingUp className="size-5 text-on-dark-muted" />
                    <H3 className="text-white">Trending Events</H3>
                  </Stack>
                  <Stack gap={3}>
                    {[1, 2, 3].map(i => (
                      <Card 
                        key={i} 
                        inverted 
                        interactive 
                        className="cursor-pointer"
                        onClick={() => router.push('/browse')}
                      >
                        <Body size="sm" className="font-display text-white">Popular Event {i}</Body>
                        <Label size="xs" className="text-on-dark-disabled">{i * 5} friends interested</Label>
                      </Card>
                    ))}
                  </Stack>
                  <Button variant="ghost" fullWidth className="mt-4" onClick={() => router.push('/browse')}>
                    Browse Events
                  </Button>
                </Card>
              </Stack>
            </Grid>
          </Stack>
    </GvtewayAppLayout>
  );
}
