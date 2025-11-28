'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Grid,
  Stack,
  Badge,
  Modal,
  LoadingSpinner,
  StatCard,
  Form,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Kicker,
  Alert,
  EmptyState,
} from '@ghxstship/ui';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';

interface Friend {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'at_event';
  current_event_id?: string;
  current_event_name?: string;
  last_seen?: string;
  location?: {
    lat: number;
    lng: number;
    section?: string;
  };
}

interface Meetup {
  id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  organizer_id: string;
  organizer_name: string;
  location: string;
  time: string;
  attendees: string[];
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const [showFindModal, setShowFindModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const _router = router; // Suppress unused warning

  const [meetupForm, setMeetupForm] = useState({
    event_id: '',
    location: '',
    time: '',
    invitees: [] as string[],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsRes, meetupsRes] = await Promise.all([
        fetch('/api/friends'),
        fetch('/api/friends/meetups'),
      ]);

      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.friends || []);
      }

      if (meetupsRes.ok) {
        const data = await meetupsRes.json();
        setMeetups(data.meetups || []);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateMeetup = async () => {
    try {
      const response = await fetch('/api/friends/meetups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetupForm),
      });

      if (response.ok) {
        setSuccess('Meetup created! Invitations sent.');
        setShowMeetupModal(false);
        setMeetupForm({ event_id: '', location: '', time: '', invitees: [] });
        fetchData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create meetup');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch('/api/friends/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });

          if (response.ok) {
            setSuccess('Location shared with friends');
          }
        } catch (err) {
          setError('Failed to share location');
        }
      },
      () => {
        setError('Unable to retrieve your location');
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "solid" | "outline" | "ghost"> = {
      online: 'solid',
      offline: 'ghost',
      at_event: 'outline',
    };
    return <Badge variant={variants[status] || 'ghost'}>{status.replace('_', ' ')}</Badge>;
  };

  const getMeetupStatusBadge = (status: string) => {
    const variants: Record<string, "solid" | "outline" | "ghost"> = {
      pending: 'outline',
      confirmed: 'solid',
      completed: 'ghost',
      cancelled: 'ghost',
    };
    return <Badge variant={variants[status] || 'ghost'}>{status}</Badge>;
  };

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const friendsAtEvents = friends.filter(f => f.status === 'at_event');
  const onlineFriends = friends.filter(f => f.status === 'online');
  const upcomingMeetups = meetups.filter(m => m.status === 'pending' || m.status === 'confirmed');

  if (loading) {
    return (
      <PageLayout
        background="black"
        header={<ConsumerNavigationPublic />}
        footer={
          <Footer
            logo={<Display size="md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
          >
            <FooterColumn title="Discover">
              <FooterLink href="/events">Browse Events</FooterLink>
              <FooterLink href="/venues">Find Venues</FooterLink>
            </FooterColumn>
            <FooterColumn title="Legal">
              <FooterLink href="/legal/privacy">Privacy</FooterLink>
              <FooterLink href="/legal/terms">Terms</FooterLink>
            </FooterColumn>
          </Footer>
        }
      >
        <Section background="black" className="relative min-h-screen overflow-hidden py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(#fff 1px, transparent 1px),
                linear-gradient(90deg, #fff 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
          <Container className="relative z-10 flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/friends">Friends</FooterLink>
            <FooterLink href="/messages">Messages</FooterLink>
          </FooterColumn>
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        {/* Grid Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Community</Kicker>
              <Stack direction="horizontal" className="items-center justify-between">
                <H2 size="lg" className="text-white">Friends & Meetups</H2>
                <Stack direction="horizontal" gap={2}>
                  <Button variant="outlineInk" onClick={handleShareLocation}>
                    <MapPin className="mr-2 size-4" />
                    Share Location
                  </Button>
                  <Button variant="solid" inverted onClick={() => setShowMeetupModal(true)}>
                    <Calendar className="mr-2 size-4" />
                    Plan Meetup
                  </Button>
                </Stack>
              </Stack>
              <Body className="text-on-dark-muted">
                Find friends at events and coordinate meetups
              </Body>
            </Stack>

            {/* Stats */}
            <Grid cols={4} gap={6}>
              <StatCard
                label="Total Friends"
                value={friends.length.toString()}
                inverted
              />
              <StatCard
                label="Online Now"
                value={onlineFriends.length.toString()}
                inverted
              />
              <StatCard
                label="At Events"
                value={friendsAtEvents.length.toString()}
                inverted
              />
              <StatCard
                label="Upcoming Meetups"
                value={upcomingMeetups.length.toString()}
                inverted
              />
            </Grid>

            {/* Friends at Events */}
            {friendsAtEvents.length > 0 && (
              <Stack gap={6}>
                <Stack gap={2}>
                  <Kicker colorScheme="on-dark">Live Now</Kicker>
                  <H2 className="text-white">Friends at Events</H2>
                </Stack>
                <Grid cols={3} gap={4}>
                  {friendsAtEvents.map(friend => (
                    <Card key={friend.id} inverted interactive>
                      <Stack direction="horizontal" gap={4} className="items-center">
                        <Stack className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-avatar bg-ink-700">
                          {friend.avatar_url ? (
                            <Image src={friend.avatar_url} alt={friend.name} fill className="object-cover" />
                          ) : (
                            <Body className="text-white">👤</Body>
                          )}
                        </Stack>
                        <Stack className="flex-1" gap={1}>
                          <Body className="font-display text-white">{friend.name}</Body>
                          <Label size="xs" className="text-on-dark-muted">{friend.current_event_name}</Label>
                          {friend.location?.section && (
                            <Label size="xs" className="text-on-dark-disabled">Section: {friend.location.section}</Label>
                          )}
                        </Stack>
                        <Button
                          variant="outlineInk"
                          size="sm"
                          onClick={() => {
                            setSelectedFriend(friend);
                            setShowFindModal(true);
                          }}
                          icon={<MapPin className="size-4" />}
                          iconPosition="left"
                        >
                          Find
                        </Button>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            )}

            {/* Success/Error Alerts */}
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="error">{error}</Alert>}

            <Grid cols={2} gap={8}>
              {/* All Friends */}
              <Stack gap={6}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Users className="size-5 text-on-dark-muted" />
                    <H3 className="text-white">All Friends</H3>
                  </Stack>
                  <Field label="" className="w-64">
                    <Input
                      placeholder="Search friends..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      inverted
                    />
                  </Field>
                </Stack>

                {filteredFriends.length > 0 ? (
                  <Stack gap={3}>
                    {filteredFriends.map(friend => (
                      <Card key={friend.id} inverted interactive>
                        <Stack direction="horizontal" className="items-center justify-between">
                          <Stack direction="horizontal" gap={4} className="items-center">
                            <Stack className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-avatar bg-ink-700">
                              {friend.avatar_url ? (
                                <Image src={friend.avatar_url} alt={friend.name} fill className="object-cover" />
                              ) : (
                                <Body className="text-white">👤</Body>
                              )}
                            </Stack>
                            <Stack gap={1}>
                              <Body className="font-display text-white">{friend.name}</Body>
                              {friend.last_seen && friend.status === 'offline' && (
                                <Label size="xs" className="text-on-dark-disabled">
                                  Last seen: {new Date(friend.last_seen).toLocaleDateString()}
                                </Label>
                              )}
                            </Stack>
                          </Stack>
                          {getStatusBadge(friend.status)}
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <EmptyState
                    title="No Friends Found"
                    description="Try a different search or add new friends"
                    inverted
                  />
                )}
              </Stack>

              {/* Upcoming Meetups */}
              <Stack gap={6}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Clock className="size-5 text-on-dark-muted" />
                  <H3 className="text-white">Upcoming Meetups</H3>
                </Stack>

                {upcomingMeetups.length > 0 ? (
                  <Stack gap={4}>
                    {upcomingMeetups.map(meetup => (
                      <Card key={meetup.id} inverted>
                        <Stack gap={4}>
                          <Stack direction="horizontal" className="items-start justify-between">
                            <Stack gap={1}>
                              <H3 className="text-white">{meetup.event_name}</H3>
                              <Label size="xs" className="text-on-dark-muted">
                                {new Date(meetup.event_date).toLocaleDateString()}
                              </Label>
                            </Stack>
                            {getMeetupStatusBadge(meetup.status)}
                          </Stack>
                          <Stack gap={2}>
                            <Stack direction="horizontal" gap={2}>
                              <Label size="xs" className="text-on-dark-disabled">Location:</Label>
                              <Body size="sm" className="text-white">{meetup.location}</Body>
                            </Stack>
                            <Stack direction="horizontal" gap={2}>
                              <Label size="xs" className="text-on-dark-disabled">Time:</Label>
                              <Body size="sm" className="text-white">{meetup.time}</Body>
                            </Stack>
                            <Stack direction="horizontal" gap={2}>
                              <Label size="xs" className="text-on-dark-disabled">Attendees:</Label>
                              <Body size="sm" className="text-white">{meetup.attendees.length} confirmed</Body>
                            </Stack>
                          </Stack>
                          <Stack direction="horizontal" gap={2}>
                            <Button variant="outlineInk" size="sm">View Details</Button>
                            {meetup.status === 'pending' && (
                              <Button variant="solid" size="sm" inverted>Confirm</Button>
                            )}
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Card inverted variant="elevated" className="p-6">
                    <Stack gap={4} className="items-center text-center">
                      <H3 className="text-white">No Meetups Planned</H3>
                      <Body className="text-on-dark-muted">
                        Plan a meetup with friends at an upcoming event
                      </Body>
                      <Button variant="solid" inverted onClick={() => setShowMeetupModal(true)}>
                        Plan Meetup
                      </Button>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Grid>

            {/* Meetup Modal */}
            <Modal
              open={showMeetupModal}
              onClose={() => setShowMeetupModal(false)}
              title="Plan a Meetup"
            >
              <Form onSubmit={handleCreateMeetup}>
                <Stack gap={4}>
                  <Field label="Meeting Location" required>
                    <Input
                      value={meetupForm.location}
                      onChange={(e) => setMeetupForm({ ...meetupForm, location: e.target.value })}
                      placeholder="e.g., Main entrance, Section A, Food court"
                      required
                    />
                  </Field>

                  <Field label="Meeting Time" required>
                    <Input
                      value={meetupForm.time}
                      onChange={(e) => setMeetupForm({ ...meetupForm, time: e.target.value })}
                      placeholder="e.g., 7:00 PM, Before doors open"
                      required
                    />
                  </Field>

                  <Field label="Invite Friends">
                    <Stack gap={2}>
                      {friends.map(friend => (
                        <Card
                          key={friend.id}
                          interactive
                          variant={meetupForm.invitees.includes(friend.id) ? "elevated" : "default"}
                          onClick={() => {
                            const newInvitees = meetupForm.invitees.includes(friend.id)
                              ? meetupForm.invitees.filter(i => i !== friend.id)
                              : [...meetupForm.invitees, friend.id];
                            setMeetupForm({ ...meetupForm, invitees: newInvitees });
                          }}
                        >
                          <Stack direction="horizontal" className="items-center justify-between">
                            <Body>{friend.name}</Body>
                            {meetupForm.invitees.includes(friend.id) && (
                              <Badge variant="solid">Invited</Badge>
                            )}
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </Field>

                  <Stack direction="horizontal" gap={4}>
                    <Button type="submit" variant="solid">
                      Create Meetup
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowMeetupModal(false)}>
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            </Modal>

            {/* Find Friend Modal */}
            <Modal
              open={showFindModal}
              onClose={() => {
                setShowFindModal(false);
                setSelectedFriend(null);
              }}
              title={selectedFriend ? `Find ${selectedFriend.name}` : 'Find Friend'}
            >
              {selectedFriend && (
                <Stack gap={4}>
                  <Card variant="elevated" className="p-6">
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between">
                        <Label size="xs" className="text-muted">Event</Label>
                        <Body className="font-display">{selectedFriend.current_event_name}</Body>
                      </Stack>
                      {selectedFriend.location?.section && (
                        <Stack direction="horizontal" className="justify-between">
                          <Label size="xs" className="text-muted">Section</Label>
                          <Body className="font-display">{selectedFriend.location.section}</Body>
                        </Stack>
                      )}
                      <Stack direction="horizontal" className="justify-between">
                        <Label size="xs" className="text-muted">Status</Label>
                        {getStatusBadge(selectedFriend.status)}
                      </Stack>
                    </Stack>
                  </Card>

                  <Body size="sm" className="text-muted">
                    Your friend is currently at the event. Use the directions below to find them.
                  </Body>

                  <Stack direction="horizontal" gap={4}>
                    <Button variant="solid" onClick={() => {
                      setSuccess('Opening directions...');
                      setShowFindModal(false);
                    }}>
                      Get Directions
                    </Button>
                    <Button variant="outline" onClick={() => setShowFindModal(false)}>
                      Close
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Modal>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
