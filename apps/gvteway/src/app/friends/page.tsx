'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  Alert,
  Modal,
  LoadingSpinner,
  StatCard,
} from '@ghxstship/ui';

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

  const handleCreateMeetup = async (e: React.FormEvent) => {
    e.preventDefault();
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
    const variants: Record<string, string> = {
      online: 'bg-green-500 text-white',
      offline: 'bg-gray-400 text-white',
      at_event: 'bg-purple-500 text-white',
    };
    return <Badge className={variants[status] || ''}>{status.replace('_', ' ')}</Badge>;
  };

  const getMeetupStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-500 text-white',
      confirmed: 'bg-green-500 text-white',
      completed: 'bg-gray-500 text-white',
      cancelled: 'bg-red-500 text-white',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const friendsAtEvents = friends.filter(f => f.status === 'at_event');
  const onlineFriends = friends.filter(f => f.status === 'online');
  const upcomingMeetups = meetups.filter(m => m.status === 'pending' || m.status === 'confirmed');

  if (loading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack>
              <Display>FRIENDS & MEETUPS</Display>
              <Body className="mt-2 text-gray-600">
                Find friends at events and coordinate meetups
              </Body>
            </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline" onClick={handleShareLocation}>
                Share My Location
              </Button>
              <Button variant="solid" onClick={() => setShowMeetupModal(true)}>
                Plan Meetup
              </Button>
            </Stack>
          </Stack>
        </Section>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Total Friends"
            value={friends.length}
            icon={<Body>👥</Body>}
          />
          <StatCard
            label="Online Now"
            value={onlineFriends.length}
            icon={<Body>🟢</Body>}
          />
          <StatCard
            label="At Events"
            value={friendsAtEvents.length}
            icon={<Body>🎉</Body>}
          />
          <StatCard
            label="Upcoming Meetups"
            value={upcomingMeetups.length}
            icon={<Body>📍</Body>}
          />
        </Grid>

        {friendsAtEvents.length > 0 && (
          <Section className="mb-8">
            <H2 className="mb-4">FRIENDS AT EVENTS NOW</H2>
            <Grid cols={3} gap={4}>
              {friendsAtEvents.map(friend => (
                <Card key={friend.id} className="p-4">
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <Stack className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                      {friend.avatar_url ? (
                        <Image src={friend.avatar_url} alt={friend.name} fill className="object-cover" />
                      ) : (
                        <Body className="text-xl">👤</Body>
                      )}
                    </Stack>
                    <Stack className="flex-1">
                      <Body className="font-bold">{friend.name}</Body>
                      <Body className="text-sm text-gray-600">{friend.current_event_name}</Body>
                      {friend.location?.section && (
                        <Body className="text-xs text-gray-500">Section: {friend.location.section}</Body>
                      )}
                    </Stack>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFriend(friend);
                        setShowFindModal(true);
                      }}
                    >
                      Find
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        <Grid cols={2} gap={8}>
          <Stack gap={6}>
            <Stack direction="horizontal" className="justify-between items-center">
              <H2>ALL FRIENDS</H2>
              <Field label="" className="w-64">
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Field>
            </Stack>

            {filteredFriends.length > 0 ? (
              <Stack gap={3}>
                {filteredFriends.map(friend => (
                  <Card key={friend.id} className="p-4">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack direction="horizontal" gap={4} className="items-center">
                        <Stack className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                          {friend.avatar_url ? (
                            <Image src={friend.avatar_url} alt={friend.name} fill className="object-cover" />
                          ) : (
                            <Body>👤</Body>
                          )}
                        </Stack>
                        <Stack>
                          <Body className="font-bold">{friend.name}</Body>
                          {friend.last_seen && friend.status === 'offline' && (
                            <Body className="text-xs text-gray-500">
                              Last seen: {new Date(friend.last_seen).toLocaleDateString()}
                            </Body>
                          )}
                        </Stack>
                      </Stack>
                      {getStatusBadge(friend.status)}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card className="p-8 text-center">
                <Body className="text-gray-600">No friends found</Body>
              </Card>
            )}
          </Stack>

          <Stack gap={6}>
            <H2>UPCOMING MEETUPS</H2>

            {upcomingMeetups.length > 0 ? (
              <Stack gap={4}>
                {upcomingMeetups.map(meetup => (
                  <Card key={meetup.id} className="p-6">
                    <Stack direction="horizontal" className="justify-between items-start mb-4">
                      <Stack gap={1}>
                        <H3>{meetup.event_name}</H3>
                        <Body className="text-gray-600 text-sm">
                          {new Date(meetup.event_date).toLocaleDateString()}
                        </Body>
                      </Stack>
                      {getMeetupStatusBadge(meetup.status)}
                    </Stack>
                    <Stack gap={2}>
                      <Stack direction="horizontal" gap={2}>
                        <Label className="text-gray-500">Location:</Label>
                        <Body>{meetup.location}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Label className="text-gray-500">Time:</Label>
                        <Body>{meetup.time}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Label className="text-gray-500">Attendees:</Label>
                        <Body>{meetup.attendees.length} confirmed</Body>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="mt-4">
                      <Button variant="outline" size="sm">View Details</Button>
                      {meetup.status === 'pending' && (
                        <Button variant="solid" size="sm">Confirm</Button>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card className="p-8 text-center">
                <H3 className="mb-4">NO MEETUPS PLANNED</H3>
                <Body className="text-gray-600 mb-6">
                  Plan a meetup with friends at an upcoming event
                </Body>
                <Button variant="solid" onClick={() => setShowMeetupModal(true)}>
                  Plan Meetup
                </Button>
              </Card>
            )}
          </Stack>
        </Grid>

        <Modal
          open={showMeetupModal}
          onClose={() => setShowMeetupModal(false)}
          title="Plan a Meetup"
        >
          <form onSubmit={handleCreateMeetup}>
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
                      className={`p-3 cursor-pointer border-2 transition-colors ${
                        meetupForm.invitees.includes(friend.id)
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      onClick={() => {
                        const newInvitees = meetupForm.invitees.includes(friend.id)
                          ? meetupForm.invitees.filter(i => i !== friend.id)
                          : [...meetupForm.invitees, friend.id];
                        setMeetupForm({ ...meetupForm, invitees: newInvitees });
                      }}
                    >
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Body>{friend.name}</Body>
                        {meetupForm.invitees.includes(friend.id) && (
                          <Badge className="bg-black text-white">Invited</Badge>
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
          </form>
        </Modal>

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
              <Card className="p-6 bg-gray-50">
                <Stack gap={3}>
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-gray-500">Event</Label>
                    <Body className="font-bold">{selectedFriend.current_event_name}</Body>
                  </Stack>
                  {selectedFriend.location?.section && (
                    <Stack direction="horizontal" className="justify-between">
                      <Label className="text-gray-500">Section</Label>
                      <Body className="font-bold">{selectedFriend.location.section}</Body>
                    </Stack>
                  )}
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-gray-500">Status</Label>
                    {getStatusBadge(selectedFriend.status)}
                  </Stack>
                </Stack>
              </Card>

              <Body className="text-gray-600 text-sm">
                Your friend is currently at the event. Use the directions below to find them.
              </Body>

              <Stack direction="horizontal" gap={4}>
                <Button variant="solid" onClick={() => {
                  // In a real app, this would open maps with directions
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
      </Container>
    </Section>
  );
}
