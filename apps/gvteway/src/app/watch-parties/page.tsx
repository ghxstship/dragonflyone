'use client';

import { useState } from 'react';

import Image from 'next/image';
import { Radio, Video, Clapperboard, RefreshCw, Calendar, PartyPopper, Users, MessageCircle, Tv, Play, Lock } from 'lucide-react';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  StatCard,
  Checkbox,
  Form,
  Kicker,
} from '@ghxstship/ui';
import { useWatchPartiesData, type WatchParty } from '@/hooks/useWatchParties';

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export default function WatchPartiesPage() {
  const [selectedParty, setSelectedParty] = useState<WatchParty | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live'>('all');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    content_type: 'livestream',
    scheduled_at: '',
    duration_minutes: 120,
    max_attendees: '',
    is_private: false,
    chat_enabled: true,
    video_enabled: false,
  });

  const {
    parties,
    isLoading: loading,
    error,
    refetch,
    createParty,
    joinParty,
    sendMessage,
  } = useWatchPartiesData(filter);

  const handleCreate = async () => {
    try {
      await createParty({
        ...createForm,
        max_attendees: createForm.max_attendees ? parseInt(createForm.max_attendees) : undefined,
      } as Partial<WatchParty>);
      setSuccess('Watch party created!');
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        content_type: 'livestream',
        scheduled_at: '',
        duration_minutes: 120,
        max_attendees: '',
        is_private: false,
        chat_enabled: true,
        video_enabled: false,
      });
      refetch();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to create watch party');
    }
  };

  const handleJoin = async (partyId: string) => {
    try {
      await joinParty(partyId);
      setSuccess('Joined watch party!');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to join');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedParty || !newMessage.trim()) return;

    try {
      const data = await sendMessage({ partyId: selectedParty.id, content: newMessage });
      setNewMessage('');
      setChatMessages([...chatMessages, data.message]);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      upcoming: 'bg-info-500 text-white',
      live: 'bg-success-100 text-success-800 animate-pulse',
      ended: 'bg-ink-500 text-white',
    };
    return <Badge className={variants[status] || ''}>{status.toUpperCase()}</Badge>;
  };

  const getContentTypeBadge = (type: string) => {
    const variants: Record<string, { color: string; icon: string; label: string }> = {
      livestream: { color: 'bg-success-100 text-success-800', icon: 'radio', label: 'Live' },
      recording: { color: 'bg-info-500 text-white', icon: 'video', label: 'Recording' },
      premiere: { color: 'bg-violet-500 text-white', icon: 'clapperboard', label: 'Premiere' },
      rewatch: { color: 'bg-success-500 text-white', icon: 'refresh', label: 'Rewatch' },
    };
    const variant = variants[type] || { color: '', icon: '', label: type };
    return (
      <Badge className={variant.color}>
        {variant.icon === 'radio' && <Radio className="size-3 inline mr-1" />}
        {variant.icon === 'video' && <Video className="size-3 inline mr-1" />}
        {variant.icon === 'clapperboard' && <Clapperboard className="size-3 inline mr-1" />}
        {variant.icon === 'refresh' && <RefreshCw className="size-3 inline mr-1" />}
        {variant.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading watch parties..." />;
  }

  const liveParties = parties.filter(p => p.status === 'live');
  const upcomingParties = parties.filter(p => p.status === 'upcoming');

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Social</Kicker>
                <H2 size="lg" className="text-white">Watch Parties</H2>
                <Body className="text-on-dark-muted">Watch together with fans from around the world</Body>
              </Stack>
              <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>
                Host a Party
              </Button>
            </Stack>

        {(error || localError) && (
          <Alert variant="error" className="mb-6" onClose={() => setLocalError(null)}>
            {error instanceof Error ? error.message : localError || String(error)}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Live Now"
            value={liveParties.length}
            icon={<Radio className="size-5" />}
          />
          <StatCard
            label="Upcoming"
            value={upcomingParties.length}
            icon={<Calendar className="size-5" />}
          />
          <StatCard
            label="Total Parties"
            value={parties.length}
            icon={<PartyPopper className="size-5" />}
          />
          <StatCard
            label="Watching Now"
            value={liveParties.reduce((sum, p) => sum + p.attendees_count, 0)}
            icon={<Users className="size-5" />}
          />
        </Grid>

        <Stack direction="horizontal" gap={4} className="mb-6">
          <Button
            variant={filter === 'all' ? 'solid' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Parties
          </Button>
          <Button
            variant={filter === 'live' ? 'solid' : 'outline'}
            onClick={() => setFilter('live')}
          >
            Live Now
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'solid' : 'outline'}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
        </Stack>

        {liveParties.length > 0 && filter !== 'upcoming' && (
          <Stack className="mb-8" gap={4}>
            <H2>HAPPENING NOW</H2>
            <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
              {liveParties.map(party => (
                <Card
                  key={party.id}
                  className="p-6 border-2 border-error-500 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setSelectedParty(party);
                    setShowJoinModal(true);
                  }}
                >
                  <Stack direction="horizontal" gap={4}>
                    <Stack className="w-32 h-24 bg-ink-200 rounded overflow-hidden relative flex-shrink-0">
                      {party.thumbnail_url ? (
                        <Image src={party.thumbnail_url} alt={party.title} fill className="object-cover" />
                      ) : (
                        <Stack className="w-full h-full flex items-center justify-center">
                          <Tv className="size-6" />
                        </Stack>
                      )}
                    </Stack>
                    <Stack className="flex-1">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        {getStatusBadge(party.status)}
                        {getContentTypeBadge(party.content_type)}
                      </Stack>
                      <H3 className="mt-2">{party.title}</H3>
                      <Body size="sm" className=" text-ink-600">
                        Hosted by {party.host_name}
                      </Body>
                      <Stack direction="horizontal" gap={4} className="mt-2 text-ink-500">
                        <Body>{party.attendees_count} watching</Body>
                        {party.chat_enabled && <Body><MessageCircle className="size-4 inline mr-1" /> Chat</Body>}
                        {party.video_enabled && <Body><Video className="size-4 inline mr-1" /> Video</Body>}
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        )}

        <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
          {parties
            .filter(p => filter === 'all' || p.status === filter)
            .filter(p => filter !== 'live' || p.status !== 'live') // Exclude live from grid if shown above
            .map(party => (
              <Card
                key={party.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedParty(party);
                  setShowJoinModal(true);
                }}
              >
                <Stack className="relative h-40 bg-ink-100">
                  {party.thumbnail_url ? (
                    <Image src={party.thumbnail_url} alt={party.title} fill className="object-cover" />
                  ) : (
                    <Stack className="w-full h-full flex items-center justify-center">
                      <Tv className="size-8" />
                    </Stack>
                  )}
                  <Stack className="absolute top-2 right-2">
                    {getStatusBadge(party.status)}
                  </Stack>
                  {party.is_private && (
                    <Stack className="absolute top-2 left-2">
                      <Badge variant="outline"><Lock className="size-3 inline mr-1" /> Private</Badge>
                    </Stack>
                  )}
                </Stack>
                <Stack className="p-4" gap={2}>
                  {getContentTypeBadge(party.content_type)}
                  <H3 className="line-clamp-1">{party.title}</H3>
                  <Body size="sm" className=" text-ink-600">
                    Hosted by {party.host_name}
                  </Body>
                  <Body className="text-mono-xs text-ink-500">
                    {formatDate(party.scheduled_at)}
                  </Body>
                  <Stack direction="horizontal" className="justify-between items-center mt-2">
                    <Body className="text-mono-xs text-ink-500">
                      {party.attendees_count}{party.max_attendees ? `/${party.max_attendees}` : ''} joined
                    </Body>
                    <Stack direction="horizontal" gap={1}>
                      {party.chat_enabled && <MessageCircle className="size-4" />}
                      {party.video_enabled && <Video className="size-4" />}
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
        </Grid>

        {parties.length === 0 && (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO WATCH PARTIES</H3>
            <Body className="text-ink-600 mb-6">
              Be the first to host a watch party!
            </Body>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>
              Host a Party
            </Button>
          </Card>
        )}

        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Host a Watch Party"
        >
          <Form onSubmit={handleCreate}>
            <Stack gap={4}>
              <Field label="Party Title" required>
                <Input
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g., Album Release Watch Party"
                  required
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="What are we watching?"
                  rows={3}
                />
              </Field>

              <Field label="Content Type">
                <Select
                  value={createForm.content_type}
                  onChange={(e) => setCreateForm({ ...createForm, content_type: e.target.value })}
                >
                  <option value="livestream">Live Stream</option>
                  <option value="recording">Recording</option>
                  <option value="premiere">Premiere</option>
                  <option value="rewatch">Rewatch</option>
                </Select>
              </Field>

              <Field label="Start Time" required>
                <Input
                  type="datetime-local"
                  value={createForm.scheduled_at}
                  onChange={(e) => setCreateForm({ ...createForm, scheduled_at: e.target.value })}
                  required
                />
              </Field>

              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Field label="Duration (minutes)">
                  <Input
                    type="number"
                    value={createForm.duration_minutes}
                    onChange={(e) => setCreateForm({ ...createForm, duration_minutes: parseInt(e.target.value) || 120 })}
                    min={15}
                  />
                </Field>
                <Field label="Max Attendees">
                  <Input
                    type="number"
                    value={createForm.max_attendees}
                    onChange={(e) => setCreateForm({ ...createForm, max_attendees: e.target.value })}
                    placeholder="Unlimited"
                  />
                </Field>
              </Grid>

              <Stack direction="horizontal" gap={6}>
                <Checkbox
                  label="Enable Chat"
                  checked={createForm.chat_enabled}
                  onChange={(e) => setCreateForm({ ...createForm, chat_enabled: e.target.checked })}
                />
                <Checkbox
                  label="Enable Video"
                  checked={createForm.video_enabled}
                  onChange={(e) => setCreateForm({ ...createForm, video_enabled: e.target.checked })}
                />
                <Checkbox
                  label="Private Party"
                  checked={createForm.is_private}
                  onChange={(e) => setCreateForm({ ...createForm, is_private: e.target.checked })}
                />
              </Stack>

              <Stack direction="horizontal" gap={4}>
                <Button type="submit" variant="solid">
                  Create Party
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Form>
        </Modal>

        <Modal
          open={showJoinModal && !!selectedParty}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedParty(null);
          }}
          title=""
        >
          {selectedParty && (
            <Stack gap={6}>
              <Stack className="relative aspect-video bg-black rounded overflow-hidden">
                {selectedParty.thumbnail_url ? (
                  <Image src={selectedParty.thumbnail_url} alt={selectedParty.title} fill className="object-cover" />
                ) : (
                  <Stack className="w-full h-full flex items-center justify-center">
                    <Tv className="size-12" />
                  </Stack>
                )}
                {selectedParty.status === 'live' && (
                  <Stack className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Button variant="solid" className="text-h6-md px-8 py-4">
                      <Play className="size-4 inline mr-1" /> Join Stream
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Stack gap={2}>
                <Stack direction="horizontal" gap={2}>
                  {getStatusBadge(selectedParty.status)}
                  {getContentTypeBadge(selectedParty.content_type)}
                </Stack>
                <H2>{selectedParty.title}</H2>
                <Body className="text-ink-600">{selectedParty.description}</Body>
                <Stack direction="horizontal" gap={4} size="sm" className=" text-ink-500">
                  <Body>Hosted by {selectedParty.host_name}</Body>
                  <Body>{formatDate(selectedParty.scheduled_at)}</Body>
                  <Body>{selectedParty.attendees_count} joined</Body>
                </Stack>
              </Stack>

              <Stack direction="horizontal" gap={4}>
                <Button
                  variant="solid"
                  onClick={() => handleJoin(selectedParty.id)}
                  disabled={selectedParty.max_attendees ? selectedParty.attendees_count >= selectedParty.max_attendees : false}
                >
                  {selectedParty.status === 'live' ? 'Join Now' : 'RSVP'}
                </Button>
                <Button variant="outline">
                  Share
                </Button>
                <Button variant="outline" onClick={() => setShowJoinModal(false)}>
                  Close
                </Button>
              </Stack>

              {selectedParty.status === 'live' && (
                <Card className="border-2 border-ink-200">
                  <Stack gap={3}>
                    <H3>Live Chat</H3>
                    <Stack className="h-48 overflow-y-auto bg-ink-50 rounded p-3" gap={2}>
                      {chatMessages.length > 0 ? (
                        chatMessages.map((msg) => (
                          <Stack key={msg.id} gap={1}>
                            <Body size="sm" className="font-weight-medium">{msg.user_name}</Body>
                            <Body size="sm" className="text-ink-600">{msg.content}</Body>
                          </Stack>
                        ))
                      ) : (
                        <Body size="sm" className="text-ink-400">No messages yet. Be the first to chat!</Body>
                      )}
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button variant="solid" onClick={handleSendMessage}>
                        Send
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              )}
            </Stack>
          )}
        </Modal>
          </Stack>
    </GvtewayAppLayout>
  );
}
