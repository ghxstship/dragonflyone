'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout, GvtewayEmptyLayout } from '@/components/app-layout';
import { 
  H2, 
  H3, 
  Body, 
  Button, 
  Input, 
  Card, 
  Grid, 
  Badge, 
  Stack, 
  Kicker,
  Label,
} from '@ghxstship/ui';
import { Search, MessageCircle, Users, TrendingUp, Calendar } from 'lucide-react';

interface Forum {
  id: string;
  title: string;
  posts: number;
  members: number;
  lastActive: string;
  trending: boolean;
  category?: string;
}

interface CommunityGroup {
  id: string;
  name: string;
  members_count: number;
  privacy: 'public' | 'private';
  description?: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  event_date: string;
  attendees_count: number;
}

export default function CommunityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'forums' | 'groups' | 'events'>('forums');
  const [forums, setForums] = useState<Forum[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleJoinForum = (forumId: string) => {
    router.push(`/community/forums/${forumId}`);
  };

  const handleJoinGroup = (groupId: string) => {
    router.push(`/community/groups/${groupId}`);
  };

  const handleInterested = (eventId: string) => {
    router.push(`/community/events/${eventId}`);
  };

  const fetchForums = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/community/forums');
      if (!response.ok) {
        throw new Error('Failed to fetch forums');
      }
      const data = await response.json();
      setForums(data.forums || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/community/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  }, []);

  const fetchCommunityEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/community/events');
      if (response.ok) {
        const data = await response.json();
        setCommunityEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to fetch community events:', err);
    }
  }, []);

  useEffect(() => {
    fetchForums();
    fetchGroups();
    fetchCommunityEvents();
  }, [fetchForums, fetchGroups, fetchCommunityEvents]);

  const filteredForums = forums.filter(forum =>
    forum.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <GvtewayLoadingLayout text="Loading community..." variant="consumer-auth" />;
  }

  if (error) {
    return (
      <GvtewayEmptyLayout
        title="Error Loading Community"
        description={error}
        action={<Button variant="solid" onClick={fetchForums}>Retry</Button>}
        variant="consumer-auth"
      />
    );
  }

  return (
    <GvtewayAppLayout variant="consumer-auth">
      <Stack gap={10}>
        {/* Page Header */}
        <Stack gap={4}>
            <Kicker colorScheme="on-dark">Connect & Share</Kicker>
            <H2 size="lg" className="text-white">Community</H2>
            <Body className="max-w-2xl text-on-dark-muted">
              Connect with fellow fans and share experiences
            </Body>
          </Stack>

          {/* Tabs */}
          <Stack direction="horizontal" gap={2} className="mb-8 border-b-2 border-ink-800">
            {[
              { id: 'forums', label: 'FORUMS' },
              { id: 'groups', label: 'GROUPS' },
              { id: 'events', label: 'EVENTS' },
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'forums' | 'groups' | 'events')}
                variant={activeTab === tab.id ? "solid" : "ghost"}
                inverted={activeTab === tab.id}
                className="rounded-none border-b-2 border-transparent px-6 pb-4"
              >
                {tab.label}
              </Button>
            ))}
          </Stack>

          {/* Search Bar */}
          <Card className="mb-8 border-2 border-ink-800 bg-ink-950 p-6 shadow-primary">
            <Stack gap={4} direction="horizontal" className="flex-col md:flex-row">
              <Stack gap={2} className="relative flex-1">
                <Label size="xs" className="text-on-dark-muted">
                  <Search className="mr-2 inline size-4" />
                  Search
                </Label>
                <Input
                  placeholder="Search community..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  inverted
                />
              </Stack>
              <Button variant="solid" inverted className="self-end">
                Search
              </Button>
            </Stack>
          </Card>

        {/* Forums Tab */}
        {activeTab === 'forums' && (
          <Stack gap={4}>
            {filteredForums.map((forum) => (
              <Card key={forum.id} inverted interactive>
                <Stack gap={4} direction="horizontal" className="items-start justify-between">
                  <Stack gap={2} className="flex-1">
                    <Stack gap={3} direction="horizontal" className="items-center">
                      <H3 className="text-white">{forum.title}</H3>
                      {forum.trending && (
                        <Badge variant="solid">
                          <TrendingUp className="mr-1 inline size-3" />
                          TRENDING
                        </Badge>
                      )}
                    </Stack>
                    <Stack gap={6} direction="horizontal">
                      <Stack gap={2} direction="horizontal" className="items-center">
                        <MessageCircle className="size-4 text-on-dark-muted" />
                        <Body size="sm" className="text-on-dark-muted">{forum.posts.toLocaleString()} posts</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="items-center">
                        <Users className="size-4 text-on-dark-muted" />
                        <Body size="sm" className="text-on-dark-muted">{forum.members.toLocaleString()} members</Body>
                      </Stack>
                      <Body size="sm" className="text-on-dark-disabled">Last active: {forum.lastActive}</Body>
                    </Stack>
                  </Stack>
                  <Button variant="outlineInk" onClick={() => handleJoinForum(forum.id)}>Join Discussion</Button>
                </Stack>
              </Card>
            ))}

            <Card inverted variant="elevated" className="border-2 border-dashed border-ink-700 p-12 text-center">
              <MessageCircle className="mx-auto mb-4 size-12 text-on-dark-muted" />
              <H3 className="mb-2 text-white">Start a New Discussion</H3>
              <Body className="mb-4 text-on-dark-muted">
                Share your thoughts and connect with the community
              </Body>
              <Button variant="solid" inverted onClick={() => router.push('/community/forums/new')}>Create Forum</Button>
            </Card>
          </Stack>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <Grid cols={2} gap={4}>
            {groups.map((group) => (
              <Card key={group.id} inverted interactive>
                <Stack gap={4}>
                  <Stack gap={4} direction="horizontal" className="items-start justify-between">
                    <H3 className="text-white">{group.name}</H3>
                    <Badge variant={group.privacy === 'private' ? 'solid' : 'outline'}>
                      {group.privacy.toUpperCase()}
                    </Badge>
                  </Stack>
                  <Body className="text-on-dark-muted">{group.description}</Body>
                  <Stack gap={4} direction="horizontal" className="items-center justify-between">
                    <Stack gap={2} direction="horizontal" className="items-center">
                      <Users className="size-4 text-on-dark-muted" />
                      <Body size="sm" className="text-on-dark-muted">{group.members_count.toLocaleString()} members</Body>
                    </Stack>
                    <Button variant="outlineInk" size="sm" onClick={() => handleJoinGroup(group.id)}>Join Group</Button>
                  </Stack>
                </Stack>
              </Card>
            ))}

            <Card inverted variant="elevated" className="border-2 border-dashed border-ink-700 p-12 text-center">
              <Users className="mx-auto mb-4 size-12 text-on-dark-muted" />
              <H3 className="mb-2 text-white">Create Your Group</H3>
              <Body className="mb-4 text-on-dark-muted">
                Build your own community around shared interests
              </Body>
              <Button variant="solid" inverted onClick={() => router.push('/community/groups/new')}>New Group</Button>
            </Card>
          </Grid>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <Stack gap={4}>
            {communityEvents.length > 0 ? (
              communityEvents.map((event) => (
                <Card key={event.id} inverted interactive>
                  <Stack gap={4}>
                    <Stack gap={4} direction="horizontal" className="items-center">
                      <Calendar className="size-8 text-on-dark-muted" />
                      <Stack gap={1} className="flex-1">
                        <H3 className="text-white">{event.title}</H3>
                        <Body className="text-on-dark-muted">
                          {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Body>
                      </Stack>
                      <Badge variant="solid">
                        {event.attendees_count} GOING
                      </Badge>
                    </Stack>
                    <Body className="text-on-dark-muted">{event.description}</Body>
                    <Button variant="outlineInk" onClick={() => handleInterested(event.id)}>I&apos;m Interested</Button>
                  </Stack>
                </Card>
              ))
            ) : (
              <Card inverted interactive>
                <Stack gap={4}>
                  <Stack gap={4} direction="horizontal" className="items-center">
                    <Calendar className="size-8 text-on-dark-muted" />
                    <Stack gap={1} className="flex-1">
                      <H3 className="text-white">Community Meetup - Miami</H3>
                      <Body className="text-on-dark-muted">Saturday, Dec 15 • 7:00 PM</Body>
                    </Stack>
                    <Badge variant="solid">45 GOING</Badge>
                  </Stack>
                  <Body className="text-on-dark-muted">
                    Join fellow music lovers for a pre-festival meetup at Wynwood Walls
                  </Body>
                  <Button variant="outlineInk" onClick={() => handleInterested('default')}>I&apos;m Interested</Button>
                </Stack>
              </Card>
            )}

            <Card className="border-2 border-dashed border-ink-800 bg-ink-950 p-12 text-center">
              <Calendar className="mx-auto mb-4 size-12 text-on-dark-muted" />
              <H3 className="mb-2 text-white">HOST A COMMUNITY EVENT</H3>
              <Body className="mb-4 text-on-dark-muted">
                Organize meetups and gatherings for your community
              </Body>
              <Button variant="solid" inverted onClick={() => router.push('/community/events/new')}>
                Create Event
              </Button>
            </Card>
          </Stack>
        )}
      </Stack>
    </GvtewayAppLayout>
  );
}
