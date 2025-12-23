'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  Alert,
  Kicker,
} from '@ghxstship/ui';
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  Camera, 
  Vote, 
  Trophy,
  Users,
  Sparkles,
  Send,
  ThumbsUp,
} from 'lucide-react';

interface EngagementActivity {
  id: string;
  type: 'poll' | 'qa' | 'photo' | 'challenge' | 'social' | 'leaderboard';
  title: string;
  description: string;
  participants?: number;
  is_active: boolean;
  ends_at?: string;
}

const activityIcons: Record<EngagementActivity['type'], React.ReactNode> = {
  poll: <Vote className="w-6 h-6" />,
  qa: <MessageCircle className="w-6 h-6" />,
  photo: <Camera className="w-6 h-6" />,
  challenge: <Trophy className="w-6 h-6" />,
  social: <Share2 className="w-6 h-6" />,
  leaderboard: <Users className="w-6 h-6" />,
};

const activityColors: Record<EngagementActivity['type'], string> = {
  poll: 'bg-primary-100 text-primary-700',
  qa: 'bg-secondary-100 text-secondary-700',
  photo: 'bg-accent-100 text-accent-700',
  challenge: 'bg-success-100 text-success-700',
  social: 'bg-info-100 text-info-700',
  leaderboard: 'bg-warning-100 text-warning-700',
};

function useEventEngagement(eventId: string) {
  const [activities, setActivities] = useState<EngagementActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEngagement() {
      try {
        const response = await fetch(`/api/events/${eventId}/engage`);
        if (!response.ok) {
          if (response.status === 404) {
            setActivities([]);
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch engagement activities');
        }
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchEngagement();
  }, [eventId]);

  return { activities, isLoading, error };
}

export default function EventEngagePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const { activities, isLoading, error } = useEventEngagement(eventId);
  const [selectedType, setSelectedType] = useState<EngagementActivity['type'] | 'all'>('all');

  if (isLoading) {
    return <GvtewayLoadingLayout />;
  }

  if (error) {
    return (
      <>
        <Alert variant="error" className="mt-8">
          {error}
        </Alert>
      </>
    );
  }

  const activeActivities = activities.filter(a => a.is_active);
  const filteredActivities = selectedType === 'all' 
    ? activeActivities 
    : activeActivities.filter(a => a.type === selectedType);

  return (
    <>
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Event Engagement</Kicker>
          <H2 size="lg" className="text-white">Join the Experience</H2>
          <Body className="text-on-dark-muted">
            Participate in live activities and connect with other attendees
          </Body>
        </Stack>

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 bg-primary-500 text-white text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2" />
            <Body className="font-weight-bold text-body-lg">{activeActivities.length}</Body>
            <Body className="text-mono-xs opacity-80">Active Activities</Body>
          </Card>
          <Card className="p-4 bg-secondary-500 text-white text-center">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <Body className="font-weight-bold text-body-lg">
              {activities.reduce((sum, a) => sum + (a.participants || 0), 0)}
            </Body>
            <Body className="text-mono-xs opacity-80">Participants</Body>
          </Card>
          <Card className="p-4 bg-accent-500 text-white text-center">
            <Camera className="w-8 h-8 mx-auto mb-2" />
            <Body className="font-weight-bold text-body-lg">
              {activities.filter(a => a.type === 'photo').length}
            </Body>
            <Body className="text-mono-xs opacity-80">Photo Moments</Body>
          </Card>
          <Card className="p-4 bg-success-500 text-white text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <Body className="font-weight-bold text-body-lg">
              {activities.filter(a => a.type === 'challenge').length}
            </Body>
            <Body className="text-mono-xs opacity-80">Challenges</Body>
          </Card>
        </Grid>

        <Stack direction="horizontal" gap={2} className="flex-wrap">
          <Button
            variant={selectedType === 'all' ? 'solid' : 'outline'}
            onClick={() => setSelectedType('all')}
          >
            All Activities
          </Button>
          {(['poll', 'qa', 'photo', 'challenge', 'social', 'leaderboard'] as const).map(type => (
            <Button
              key={type}
              variant={selectedType === type ? 'solid' : 'outline'}
              onClick={() => setSelectedType(type)}
            >
              <span className="mr-2">{activityIcons[type]}</span>
              <span className="capitalize">{type === 'qa' ? 'Q&A' : type}</span>
            </Button>
          ))}
        </Stack>

        {filteredActivities.length === 0 ? (
          <Card inverted className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-ink-400" />
            <H2 className="mb-4 text-white">NO ACTIVE ACTIVITIES</H2>
            <Body className="text-on-dark-muted mb-6">
              Check back during the event for live engagement activities.
            </Body>
            <Button variant="solid" inverted onClick={() => router.back()}>
              Go Back
            </Button>
          </Card>
        ) : (
          <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
            {filteredActivities.map(activity => (
              <Card key={activity.id} className="p-6 border-2 border-black hover:shadow-lg transition-shadow">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between items-start">
                    <span className={`p-3 rounded-card ${activityColors[activity.type]}`}>
                      {activityIcons[activity.type]}
                    </span>
                    <Stack direction="horizontal" gap={2}>
                      {activity.is_active && (
                        <Badge variant="success">LIVE</Badge>
                      )}
                      <Badge variant="outline" className="capitalize">
                        {activity.type === 'qa' ? 'Q&A' : activity.type}
                      </Badge>
                    </Stack>
                  </Stack>

                  <Stack gap={2}>
                    <H3>{activity.title}</H3>
                    <Body className="text-ink-600">{activity.description}</Body>
                  </Stack>

                  <Stack direction="horizontal" className="justify-between items-center">
                    {activity.participants !== undefined && (
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Users className="w-4 h-4 text-ink-500" />
                        <Body className="text-mono-sm">{activity.participants} participating</Body>
                      </Stack>
                    )}
                    {activity.ends_at && (
                      <Body className="text-mono-xs text-ink-500">
                        Ends: {new Date(activity.ends_at).toLocaleTimeString()}
                      </Body>
                    )}
                  </Stack>

                  <Button variant="solid" className="w-full">
                    {activity.type === 'poll' && (
                      <>
                        <Vote className="w-4 h-4 mr-2" />
                        Vote Now
                      </>
                    )}
                    {activity.type === 'qa' && (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Ask a Question
                      </>
                    )}
                    {activity.type === 'photo' && (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Share Photo
                      </>
                    )}
                    {activity.type === 'challenge' && (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Join Challenge
                      </>
                    )}
                    {activity.type === 'social' && (
                      <>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </>
                    )}
                    {activity.type === 'leaderboard' && (
                      <>
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        View Rankings
                      </>
                    )}
                  </Button>
                </Stack>
              </Card>
            ))}
          </Grid>
        )}

        <Card className="p-6 bg-ink-900 text-white">
          <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
            <Stack gap={3}>
              <Heart className="w-8 h-8" />
              <H3 className="text-white">Social Wall</H3>
              <Body className="text-ink-300">
                See what others are sharing about this event.
              </Body>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
                onClick={() => router.push(`/events/${eventId}/social-wall`)}
              >
                View Social Wall
              </Button>
            </Stack>
            <Stack gap={3}>
              <Camera className="w-8 h-8" />
              <H3 className="text-white">Photo Booth</H3>
              <Body className="text-ink-300">
                Take photos with exclusive event filters.
              </Body>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
                onClick={() => router.push(`/events/${eventId}/photo-booth`)}
              >
                Open Photo Booth
              </Button>
            </Stack>
            <Stack gap={3}>
              <MessageCircle className="w-8 h-8" />
              <H3 className="text-white">Live Chat</H3>
              <Body className="text-ink-300">
                Connect with other attendees in real-time.
              </Body>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
                onClick={() => router.push(`/events/${eventId}/chat`)}
              >
                Join Chat
              </Button>
            </Stack>
          </Grid>
        </Card>
      </Stack>
    </>
  );
}
