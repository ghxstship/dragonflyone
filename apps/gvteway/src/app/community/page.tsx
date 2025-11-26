'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import { Container, Section, H1, H2, H3, Body, Button, Input, Card, Grid, Badge, LoadingSpinner, EmptyState, Stack, Breadcrumb, BreadcrumbItem } from '@ghxstship/ui';
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
    return (
      <Section className="min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading community..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="min-h-screen bg-black text-white">
        <Navigation />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Community"
            description={error}
            action={{ label: "Retry", onClick: fetchForums }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-black text-white">
      <Navigation />
      <Section className="py-12">
        <Container>
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem active>Community</BreadcrumbItem>
          </Breadcrumb>

          <Stack gap={2} className="border-b-2 border-grey-800 pb-8 mb-8">
            <H1>Community</H1>
            <Body className="text-grey-400">Connect with fellow fans and share experiences</Body>
          </Stack>

        {/* Tabs */}
        <Stack direction="horizontal" gap={4} className="mb-8 border-b-2 border-grey-200">
          {[
            { id: 'forums', label: 'FORUMS' },
            { id: 'groups', label: 'GROUPS' },
            { id: 'events', label: 'EVENTS' },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant="ghost"
              className={`pb-4 px-6 font-heading text-lg tracking-wider rounded-none ${
                activeTab === tab.id
                  ? 'border-b-4 border-black -mb-0.5'
                  : 'text-grey-500 hover:text-black'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>

        {/* Search Bar */}
        <Card className="p-6 mb-8">
          <Stack gap={4} direction="horizontal">
            <Stack gap={2} direction="horizontal" className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
              <Input
                placeholder="Search community..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Stack>
            <Button onClick={() => setSearchQuery(searchQuery)}>SEARCH</Button>
          </Stack>
        </Card>

        {/* Forums Tab */}
        {activeTab === 'forums' && (
          <Stack gap={4}>
            {filteredForums.map((forum) => (
              <Card key={forum.id} className="p-6 hover:shadow-hard-lg transition-shadow">
                <Stack gap={4} direction="horizontal" className="justify-between items-start mb-4">
                  <Stack gap={2} className="flex-1">
                    <Stack gap={3} direction="horizontal" className="items-center">
                      <H2>{forum.title}</H2>
                      {forum.trending && (
                        <Badge className="bg-black text-white flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          TRENDING
                        </Badge>
                      )}
                    </Stack>
                    <Stack gap={6} direction="horizontal" className="text-sm text-grey-600">
                      <Stack gap={2} direction="horizontal" className="items-center">
                        <MessageCircle className="w-4 h-4" />
                        <Body className="text-sm">{forum.posts.toLocaleString()} posts</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="items-center">
                        <Users className="w-4 h-4" />
                        <Body className="text-sm">{forum.members.toLocaleString()} members</Body>
                      </Stack>
                      <Body className="text-sm">Last active: {forum.lastActive}</Body>
                    </Stack>
                  </Stack>
                  <Button variant="outline" onClick={() => handleJoinForum(forum.id)}>JOIN DISCUSSION</Button>
                </Stack>
              </Card>
            ))}

            <Card className="p-12 text-center border-2 border-dashed border-grey-300">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-grey-400" />
              <H3 className="mb-2">START A NEW DISCUSSION</H3>
              <Body className="text-grey-500 mb-4">
                Share your thoughts and connect with the community
              </Body>
              <Button onClick={() => router.push('/community/forums/new')}>CREATE FORUM</Button>
            </Card>
          </Stack>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <Grid cols={2} gap={4}>
            {groups.map((group) => (
              <Card key={group.id} className="p-6">
                <Stack gap={4} direction="horizontal" className="justify-between items-start mb-4">
                  <H2>{group.name}</H2>
                  <Badge className={group.privacy === 'private' ? 'bg-grey-800 text-white' : 'bg-white text-black border-2 border-black'}>
                    {group.privacy.toUpperCase()}
                  </Badge>
                </Stack>
                <Body className="text-grey-600 mb-4">{group.description}</Body>
                <Stack gap={4} direction="horizontal" className="justify-between items-center">
                  <Stack gap={2} direction="horizontal" className="items-center text-sm text-grey-600">
                    <Users className="w-4 h-4" />
                    <Body className="text-sm">{group.members_count.toLocaleString()} members</Body>
                  </Stack>
                  <Button variant="outline" size="sm" onClick={() => handleJoinGroup(group.id)}>JOIN GROUP</Button>
                </Stack>
              </Card>
            ))}

            <Card className="p-12 text-center border-2 border-dashed border-grey-300">
              <Users className="w-12 h-12 mx-auto mb-4 text-grey-400" />
              <H3 className="mb-2">CREATE YOUR GROUP</H3>
              <Body className="text-grey-500 mb-4">
                Build your own community around shared interests
              </Body>
              <Button onClick={() => router.push('/community/groups/new')}>NEW GROUP</Button>
            </Card>
          </Grid>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <Stack gap={4}>
            {communityEvents.length > 0 ? (
              communityEvents.map((event) => (
                <Card key={event.id} className="p-6">
                  <Stack gap={4} direction="horizontal" className="items-center mb-4">
                    <Calendar className="w-8 h-8" />
                    <Stack gap={1} className="flex-1">
                      <H2>{event.title}</H2>
                      <Body className="text-grey-600">
                        {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </Body>
                    </Stack>
                    <Badge className="bg-white text-black border-2 border-black">
                      {event.attendees_count} GOING
                    </Badge>
                  </Stack>
                  <Body className="mb-4">{event.description}</Body>
                  <Button variant="outline" onClick={() => handleInterested(event.id)}>I&apos;M INTERESTED</Button>
                </Card>
              ))
            ) : (
              <Card className="p-6">
                <Stack gap={4} direction="horizontal" className="items-center mb-4">
                  <Calendar className="w-8 h-8" />
                  <Stack gap={1} className="flex-1">
                    <H2>COMMUNITY MEETUP - MIAMI</H2>
                    <Body className="text-grey-600">Saturday, Dec 15 • 7:00 PM</Body>
                  </Stack>
                  <Badge className="bg-white text-black border-2 border-black">45 GOING</Badge>
                </Stack>
                <Body className="mb-4">
                  Join fellow music lovers for a pre-festival meetup at Wynwood Walls
                </Body>
                <Button variant="outline" onClick={() => handleInterested('default')}>I&apos;M INTERESTED</Button>
              </Card>
            )}

            <Card className="p-12 text-center border-2 border-dashed border-grey-300">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-grey-400" />
              <H3 className="mb-2">HOST A COMMUNITY EVENT</H3>
              <Body className="text-grey-500 mb-4">
                Organize meetups and gatherings for your community
              </Body>
              <Button onClick={() => router.push('/community/events/new')}>CREATE EVENT</Button>
            </Card>
          </Stack>
        )}
      </Container>
      </Section>
    </Section>
  );
}
