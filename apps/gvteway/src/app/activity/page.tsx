'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@ghxstship/ui';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../components/navigation';
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
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
} from '@ghxstship/ui';
import Image from 'next/image';

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
  const [error, setError] = useState<string | null>(null);
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
      setError('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket_purchase': return '🎫';
      case 'review': return '⭐';
      case 'follow': return '👤';
      case 'favorite': return '❤️';
      case 'check_in': return '📍';
      case 'share': return '🔗';
      default: return '📌';
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
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading activity..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Activity Feed</H1>
            <Body className="text-ink-600">
              See what your friends are up to
            </Body>
          </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={4}>
            <Stack direction="horizontal" gap={2} className="mb-4">
              {['all', 'ticket_purchase', 'review', 'check_in', 'follow'].map(f => (
                <Button
                  key={f}
                  variant={filter === f ? 'solid' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'ticket_purchase' ? 'Tickets' : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                </Button>
              ))}
            </Stack>

            {activities.length > 0 ? (
              <Stack gap={4}>
                {activities.map(activity => (
                  <Card key={activity.id} className="p-4">
                    <Stack direction="horizontal" gap={4}>
                      <Stack className="w-12 h-12 bg-ink-200 rounded-full flex-shrink-0 flex items-center justify-center">
                        {activity.user_avatar ? (
                          <Image
                            src={activity.user_avatar}
                            alt={activity.user_name}
                            width={48}
                            height={48}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Body className="text-body-md">{activity.user_name.charAt(0)}</Body>
                        )}
                      </Stack>

                      <Stack className="flex-1">
                        <Stack direction="horizontal" gap={2} className="items-center flex-wrap">
                          <Body className="font-bold">{activity.user_name}</Body>
                          <Body className="text-ink-600">{getActivityText(activity)}</Body>
                        </Stack>

                        {activity.content && (
                          <Body className="text-ink-600 mt-2 italic">
                            &quot;{activity.content}&quot;
                          </Body>
                        )}

                        {activity.event_id && (
                          <Card
                            className="mt-3 p-3 bg-ink-50 cursor-pointer hover:bg-ink-100"
                            onClick={() => router.push(`/events/${activity.event_id}`)}
                          >
                            <Stack direction="horizontal" gap={3}>
                              {activity.event_image && (
                                <Stack className="w-16 h-16 bg-ink-200 rounded overflow-hidden flex-shrink-0">
                                  <Image
                                    src={activity.event_image}
                                    alt={activity.event_title || ''}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                </Stack>
                              )}
                              <Stack>
                                <Body className="font-medium">{activity.event_title}</Body>
                                <Body className="text-body-sm text-ink-500">View Event →</Body>
                              </Stack>
                            </Stack>
                          </Card>
                        )}

                        <Stack direction="horizontal" gap={3} className="mt-3 items-center">
                          <Body className="text-mono-xs text-ink-600">
                            {getActivityIcon(activity.type)} {formatTimeAgo(activity.created_at)}
                          </Body>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card className="p-12 text-center">
                <H3 className="mb-4">NO ACTIVITY YET</H3>
                <Body className="text-ink-600 mb-6">
                  Follow friends and artists to see their activity here.
                </Body>
                <Button variant="solid" onClick={() => router.push('/community')}>
                  Find Friends
                </Button>
              </Card>
            )}
          </Stack>

          <Stack gap={6}>
            <Card className="p-6">
              <H3 className="mb-4">SUGGESTED FRIENDS</H3>
              <Stack gap={3}>
                {[1, 2, 3].map(i => (
                  <Stack key={i} direction="horizontal" className="justify-between items-center">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Stack className="w-10 h-10 bg-ink-200 rounded-full" />
                      <Stack>
                        <Body className="font-medium text-body-sm">Friend {i}</Body>
                        <Body className="text-mono-xs text-ink-500">3 mutual friends</Body>
                      </Stack>
                    </Stack>
                    <Button variant="outline" size="sm" onClick={() => addNotification({ type: 'success', title: 'Following', message: 'You are now following this user' })}>
                      Follow
                    </Button>
                  </Stack>
                ))}
              </Stack>
              <Button variant="ghost" className="w-full mt-4" onClick={() => router.push('/community')}>
                See More
              </Button>
            </Card>

            <Card className="p-6">
              <H3 className="mb-4">TRENDING EVENTS</H3>
              <Stack gap={3}>
                {[1, 2, 3].map(i => (
                  <Stack key={i} className="p-3 border border-ink-200 rounded cursor-pointer hover:bg-ink-50">
                    <Body className="font-medium text-body-sm">Popular Event {i}</Body>
                    <Body className="text-mono-xs text-ink-500">{i * 5} friends interested</Body>
                  </Stack>
                ))}
              </Stack>
              <Button variant="ghost" className="w-full mt-4" onClick={() => router.push('/browse')}>
                Browse Events
              </Button>
            </Card>
          </Stack>
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
