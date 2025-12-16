'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTabState } from '@ghxstship/config/hooks';
import { GvtewayAppLayout, GvtewayLoadingLayout, GvtewayEmptyLayout } from '@/components/app-layout';
import { 
  H3, 
  Body, 
  Button, 
  Input, 
  Card, 
  Grid, 
  Badge, 
  Stack, 
  Label,
  EnterprisePageHeader,
  MainContent,
  Container,
} from '@ghxstship/ui';
import { Search, MessageCircle, Users, TrendingUp, Calendar } from 'lucide-react';
import { useCommunityData, type Forum, type CommunityGroup, type CommunityEvent } from '@/hooks/useCommunity';

function CommunityPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'forums',
    validTabs: ['forums', 'groups', 'events'],
  });
  const [searchQuery, setSearchQuery] = useState('');

  const {
    forums,
    groups,
    communityEvents,
    isLoading: loading,
    error,
    refetch,
  } = useCommunityData();

  const handleJoinForum = (forumId: string) => {
    router.push(`/community/forums/${forumId}`);
  };

  const handleJoinGroup = (groupId: string) => {
    router.push(`/community/groups/${groupId}`);
  };

  const handleInterested = (eventId: string) => {
    router.push(`/community/events/${eventId}`);
  };

  const filteredForums = forums.filter((forum: Forum) =>
    forum.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <GvtewayLoadingLayout text="Loading community..." variant="consumer-auth" />;
  }

  if (error) {
    return (
      <GvtewayEmptyLayout
        title="Error Loading Community"
        description={error instanceof Error ? error.message : String(error)}
        action={<Button variant="solid" onClick={() => refetch()}>Retry</Button>}
        variant="consumer-auth"
      />
    );
  }

  return (
    <GvtewayAppLayout variant="consumer-auth">
      <EnterprisePageHeader
        title="Community"
        subtitle="Connect with fellow fans and share experiences"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            {/* Tabs */}
            <Stack direction="horizontal" gap={2} className="mb-8 border-b-2 border-ink-800">
            {[
              { id: 'forums', label: 'FORUMS' },
              { id: 'groups', label: 'GROUPS' },
              { id: 'events', label: 'EVENTS' },
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={isActive(tab.id) ? "solid" : "ghost"}
                inverted={isActive(tab.id)}
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
        {isActive('forums') && (
          <Stack gap={4}>
            {filteredForums.map((forum: Forum) => (
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
        {isActive('groups') && (
          <Grid cols={2} gap={4}>
            {groups.map((group: CommunityGroup) => (
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
        {isActive('events') && (
          <Stack gap={4}>
            {communityEvents.length > 0 ? (
              communityEvents.map((event: CommunityEvent) => (
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
        </Container>
      </MainContent>
    </GvtewayAppLayout>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <CommunityPageContent />
    </Suspense>
  );
}
