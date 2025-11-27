'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  LoadingSpinner,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
} from '@ghxstship/ui';
import { CreatorNavigationAuthenticated } from '../../components/navigation';

interface Channel {
  id: string;
  name: string;
  type: 'department' | 'project' | 'broadcast' | 'private';
  department?: string;
  description?: string;
  members: ChannelMember[];
  is_active: boolean;
  created_at: string;
  last_message?: string;
  unread_count: number;
}

interface ChannelMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  is_online: boolean;
}

interface Message {
  id: string;
  channel_id: string;
  sender: ChannelMember;
  content: string;
  timestamp: string;
  is_priority: boolean;
}

const mockMembers: ChannelMember[] = [
  { id: 'MEM-001', name: 'John Martinez', role: 'Audio Lead', is_online: true },
  { id: 'MEM-002', name: 'Sarah Chen', role: 'Lighting Director', is_online: true },
  { id: 'MEM-003', name: 'Mike Thompson', role: 'Stage Manager', is_online: false },
  { id: 'MEM-004', name: 'Lisa Park', role: 'Video Tech', is_online: true },
  { id: 'MEM-005', name: 'Tom Wilson', role: 'Rigger', is_online: false },
];

const mockChannels: Channel[] = [
  { id: 'CH-001', name: 'Audio Department', type: 'department', department: 'Audio', description: 'All audio team communications', members: mockMembers.slice(0, 2), is_active: true, created_at: '2024-11-01', last_message: 'FOH mix ready for soundcheck', unread_count: 3 },
  { id: 'CH-002', name: 'Lighting Department', type: 'department', department: 'Lighting', description: 'Lighting crew channel', members: mockMembers.slice(1, 3), is_active: true, created_at: '2024-11-01', last_message: 'Focus complete on stage left', unread_count: 0 },
  { id: 'CH-003', name: 'Video Department', type: 'department', department: 'Video', description: 'Video and LED wall team', members: mockMembers.slice(3, 5), is_active: true, created_at: '2024-11-01', last_message: 'Content loaded and tested', unread_count: 1 },
  { id: 'CH-004', name: 'Stage Management', type: 'department', department: 'Stage', description: 'Stage managers and crew chiefs', members: mockMembers.slice(2, 4), is_active: true, created_at: '2024-11-01', last_message: 'Artist ETA 30 minutes', unread_count: 5 },
  { id: 'CH-005', name: 'All Hands', type: 'broadcast', description: 'Broadcast channel for all crew', members: mockMembers, is_active: true, created_at: '2024-11-01', last_message: 'Doors in 2 hours', unread_count: 0 },
  { id: 'CH-006', name: 'Production Office', type: 'private', description: 'Production management only', members: mockMembers.slice(0, 3), is_active: true, created_at: '2024-11-01', last_message: 'Budget update attached', unread_count: 2 },
];

const mockMessages: Message[] = [
  { id: 'MSG-001', channel_id: 'CH-001', sender: mockMembers[0], content: 'FOH mix ready for soundcheck', timestamp: '2024-11-24T14:30:00Z', is_priority: false },
  { id: 'MSG-002', channel_id: 'CH-001', sender: mockMembers[1], content: 'Copy that, lighting ready when you are', timestamp: '2024-11-24T14:32:00Z', is_priority: false },
  { id: 'MSG-003', channel_id: 'CH-001', sender: mockMembers[0], content: 'Starting soundcheck in 5', timestamp: '2024-11-24T14:35:00Z', is_priority: true },
];

export default function ChannelsPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>(mockChannels);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(mockChannels[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newChannel, setNewChannel] = useState({
    name: '',
    type: 'department',
    department: '',
    description: '',
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const message: Message = {
      id: `MSG-${Date.now()}`,
      channel_id: selectedChannel.id,
      sender: mockMembers[0],
      content: newMessage,
      timestamp: new Date().toISOString(),
      is_priority: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleCreateChannel = () => {
    if (!newChannel.name) {
      setError('Channel name is required');
      return;
    }

    const channel: Channel = {
      id: `CH-${Date.now()}`,
      name: newChannel.name,
      type: newChannel.type as Channel['type'],
      department: newChannel.department || undefined,
      description: newChannel.description,
      members: [],
      is_active: true,
      created_at: new Date().toISOString(),
      unread_count: 0,
    };

    setChannels([...channels, channel]);
    setShowCreateModal(false);
    setNewChannel({ name: '', type: 'department', department: '', description: '' });
    setSuccess('Channel created successfully');
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      department: 'bg-info-500 text-white',
      project: 'bg-purple-500 text-white',
      broadcast: 'bg-warning-500 text-white',
      private: 'bg-grey-500 text-white',
    };
    return <Badge className={colors[type] || ''}>{type}</Badge>;
  };

  const filteredChannels = channels.filter(c => {
    if (filter === 'all') return true;
    return c.type === filter;
  });

  const channelMessages = messages.filter(m => m.channel_id === selectedChannel?.id);
  const totalUnread = channels.reduce((sum, c) => sum + c.unread_count, 0);
  const onlineMembers = mockMembers.filter(m => m.is_online).length;

  return (
    <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <H1>Department Channels</H1>
              <Label className="text-ink-400">Team communication and messaging</Label>
            </Stack>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>
              Create Channel
            </Button>
          </Stack>

          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Active Channels" value={channels.filter(c => c.is_active).length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Unread Messages" value={totalUnread} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Online Members" value={onlineMembers} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Members" value={mockMembers.length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={3} gap={6}>
            {/* Channel List */}
            <Card className="border-2 border-ink-800 bg-ink-900/50 p-4">
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between items-center">
                  <H3>Channels</H3>
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-32 border-ink-700 bg-black text-white text-sm"
                  >
                    <option value="all">All</option>
                    <option value="department">Department</option>
                    <option value="project">Project</option>
                    <option value="broadcast">Broadcast</option>
                    <option value="private">Private</option>
                  </Select>
                </Stack>

                <Stack gap={2}>
                  {filteredChannels.map(channel => (
                    <Card
                      key={channel.id}
                      className={`p-3 cursor-pointer border ${selectedChannel?.id === channel.id ? 'border-white bg-ink-800' : 'border-ink-700 hover:border-ink-600'}`}
                      onClick={() => setSelectedChannel(channel)}
                    >
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack gap={1}>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Body className="font-display text-white">{channel.name}</Body>
                            {channel.unread_count > 0 && (
                              <Badge className="bg-error-500 text-white text-xs">{channel.unread_count}</Badge>
                            )}
                          </Stack>
                          <Label size="xs" className="text-ink-500">{channel.members.length} members</Label>
                        </Stack>
                        {getTypeBadge(channel.type)}
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Card>

            {/* Message Area */}
            <Card className="col-span-2 border-2 border-ink-800 bg-ink-900/50 p-4">
              {selectedChannel ? (
                <Stack gap={4} className="h-full">
                  <Stack direction="horizontal" className="justify-between items-center border-b border-ink-700 pb-4">
                    <Stack gap={1}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <H3>{selectedChannel.name}</H3>
                        {getTypeBadge(selectedChannel.type)}
                      </Stack>
                      <Label className="text-ink-400">{selectedChannel.description}</Label>
                    </Stack>
                    <Button variant="outline" size="sm" onClick={() => setShowMembersModal(true)}>
                      {selectedChannel.members.length} Members
                    </Button>
                  </Stack>

                  <Stack gap={3} className="flex-1 overflow-y-auto max-h-96">
                    {channelMessages.map(message => (
                      <Card key={message.id} className={`p-3 ${message.is_priority ? 'border-l-4 border-l-orange-500 bg-warning-900/10' : 'bg-ink-800'}`}>
                        <Stack gap={2}>
                          <Stack direction="horizontal" className="justify-between items-center">
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <Body className="font-bold text-white">{message.sender.name}</Body>
                              <Label size="xs" className="text-ink-500">{message.sender.role}</Label>
                            </Stack>
                            <Label size="xs" className="text-ink-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </Label>
                          </Stack>
                          <Body className="text-ink-300">{message.content}</Body>
                        </Stack>
                      </Card>
                    ))}
                    {channelMessages.length === 0 && (
                      <Card className="p-8 text-center">
                        <Body className="text-ink-500">No messages yet</Body>
                      </Card>
                    )}
                  </Stack>

                  <Stack direction="horizontal" gap={2} className="border-t border-ink-700 pt-4">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border-ink-700 bg-black text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                    />
                    <Button variant="solid" onClick={handleSendMessage}>
                      Send
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Card className="p-8 text-center">
                  <Body className="text-ink-500">Select a channel to view messages</Body>
                </Card>
              )}
            </Card>
          </Grid>

          <Grid cols={4} gap={4}>
            <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>Create Channel</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/communications')}>Radio Channels</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/crew')}>Crew Directory</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Broadcast Message</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Channel</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input
              placeholder="Channel Name"
              value={newChannel.name}
              onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
              className="border-ink-700 bg-black text-white"
            />
            <Select
              value={newChannel.type}
              onChange={(e) => setNewChannel({ ...newChannel, type: e.target.value })}
              className="border-ink-700 bg-black text-white"
            >
              <option value="department">Department</option>
              <option value="project">Project</option>
              <option value="broadcast">Broadcast</option>
              <option value="private">Private</option>
            </Select>
            {newChannel.type === 'department' && (
              <Select
                value={newChannel.department}
                onChange={(e) => setNewChannel({ ...newChannel, department: e.target.value })}
                className="border-ink-700 bg-black text-white"
              >
                <option value="">Select Department...</option>
                <option value="Audio">Audio</option>
                <option value="Lighting">Lighting</option>
                <option value="Video">Video</option>
                <option value="Stage">Stage</option>
                <option value="Rigging">Rigging</option>
                <option value="Production">Production</option>
              </Select>
            )}
            <Textarea
              placeholder="Description (optional)"
              value={newChannel.description}
              onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
              rows={2}
              className="border-ink-700 bg-black text-white"
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={handleCreateChannel}>Create Channel</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showMembersModal} onClose={() => setShowMembersModal(false)}>
        <ModalHeader><H3>Channel Members</H3></ModalHeader>
        <ModalBody>
          <Stack gap={3}>
            {selectedChannel?.members.map(member => (
              <Card key={member.id} className="p-3 border border-ink-700">
                <Stack direction="horizontal" className="justify-between items-center">
                  <Stack gap={1}>
                    <Body className="text-white">{member.name}</Body>
                    <Label size="xs" className="text-ink-500">{member.role}</Label>
                  </Stack>
                  <Badge className={member.is_online ? 'bg-success-500 text-white' : 'bg-grey-500 text-white'}>
                    {member.is_online ? 'Online' : 'Offline'}
                  </Badge>
                </Stack>
              </Card>
            ))}
            {selectedChannel?.members.length === 0 && (
              <Body className="text-ink-500 text-center">No members in this channel</Body>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowMembersModal(false)}>Close</Button>
          <Button variant="solid">Add Members</Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
