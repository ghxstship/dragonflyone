'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import { Container, Section, H1, H2, H3, Body, Button, Card, Grid, Badge, Stack } from '@ghxstship/ui';
import { Radio, Phone, Users, MessageSquare, Bell, AlertCircle } from 'lucide-react';

export default function CommunicationsPage() {
  const router = useRouter();
  const [activeChannel, setActiveChannel] = useState('all');

  const channels = [
    {
      id: '1',
      name: 'Main Production',
      frequency: '462.5625 MHz',
      type: 'Radio',
      users: 24,
      status: 'active',
      priority: 'high',
    },
    {
      id: '2',
      name: 'Stage Crew',
      frequency: '462.5875 MHz',
      type: 'Radio',
      users: 12,
      status: 'active',
      priority: 'medium',
    },
    {
      id: '3',
      name: 'Emergency Services',
      frequency: '462.6125 MHz',
      type: 'Radio',
      users: 8,
      status: 'standby',
      priority: 'critical',
    },
  ];

  const messages = [
    {
      id: '1',
      channel: 'Main Production',
      sender: 'Production Manager',
      message: 'Load-in complete, ready for soundcheck',
      timestamp: '14:32',
      priority: 'normal',
    },
    {
      id: '2',
      channel: 'Stage Crew',
      sender: 'Stage Manager',
      message: 'Need assistance with riser setup stage left',
      timestamp: '14:35',
      priority: 'high',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-black text-white';
      case 'high': return 'bg-grey-900 text-white';
      case 'medium': return 'bg-white text-black border-2 border-black';
      default: return 'bg-grey-200 text-black';
    }
  };

  return (
    <Section className="min-h-screen bg-black text-white">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={4} direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b border-grey-800 pb-8">
            <Stack gap={2}>
              <H1>Communications</H1>
              <Body className="text-grey-600">Radio channels and team messaging</Body>
            </Stack>
            <Stack gap={3} direction="horizontal">
              <Button variant="outline" onClick={() => router.push('/communications/alerts')}>
                <Bell className="w-4 h-4 mr-2" />
                ALERTS
              </Button>
              <Button variant="solid" onClick={() => router.push('/communications/channels/new')}>
                <Radio className="w-4 h-4 mr-2" />
                NEW CHANNEL
              </Button>
            </Stack>
          </Stack>

        <Grid cols={4} gap={6} className="mb-8">
          <Card className="p-6 text-center">
            <Radio className="w-8 h-8 mx-auto mb-2 text-grey-600" />
            <H2>{channels.filter(c => c.status === 'active').length}</H2>
            <Body className="text-grey-600">Active Channels</Body>
          </Card>
          <Card className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-grey-600" />
            <H2>{channels.reduce((sum, c) => sum + c.users, 0)}</H2>
            <Body className="text-grey-600">Connected Users</Body>
          </Card>
          <Card className="p-6 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-grey-600" />
            <H2>{messages.length}</H2>
            <Body className="text-grey-600">Recent Messages</Body>
          </Card>
          <Card className="p-6 text-center bg-black text-white">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <H2>0</H2>
            <Body>Emergency Alerts</Body>
          </Card>
        </Grid>

        <Grid cols={2} gap={6} className="mb-8">
          <Stack gap={4}>
            <H2>RADIO CHANNELS</H2>
            <Stack gap={4}>
              {channels.map((channel) => (
                <Card key={channel.id} className="p-6">
                  <Stack gap={3} direction="horizontal" className="justify-between items-start mb-3">
                    <Stack gap={3} direction="horizontal" className="items-center">
                      <Radio className="w-6 h-6 text-grey-600" />
                      <Stack gap={1}>
                        <H3>{channel.name}</H3>
                        <Body className="text-sm text-grey-600">{channel.frequency}</Body>
                      </Stack>
                    </Stack>
                    <Badge className={getPriorityColor(channel.priority)}>
                      {channel.priority.toUpperCase()}
                    </Badge>
                  </Stack>
                  
                  <Stack gap={4} direction="horizontal" className="justify-between items-center">
                    <Stack gap={2} direction="horizontal" className="items-center text-sm text-grey-600">
                      <Users className="w-4 h-4" />
                      <Body className="text-sm">{channel.users} users</Body>
                    </Stack>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/communications/channels/${channel.id}`)}>
                      {channel.status === 'active' ? 'JOIN' : 'STANDBY'}
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>

          <Stack gap={4}>
            <H2>RECENT MESSAGES</H2>
            <Stack gap={4}>
              {messages.map((msg) => (
                <Card key={msg.id} className="p-6">
                  <Stack gap={4} direction="horizontal" className="justify-between items-start mb-2">
                    <Badge className="bg-white text-black border-2 border-black">
                      {msg.channel}
                    </Badge>
                    <Body className="text-sm text-grey-600">{msg.timestamp}</Body>
                  </Stack>
                  <Body className="font-bold mb-1">{msg.sender}</Body>
                  <Body className="text-grey-600">{msg.message}</Body>
                </Card>
              ))}
            </Stack>

            <Card className="p-6 mt-4 border-2 border-dashed border-grey-300">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-grey-600" />
              <H3 className="text-center mb-2">Send Broadcast Message</H3>
              <Button className="w-full" onClick={() => router.push('/communications/broadcast')}>COMPOSE</Button>
            </Card>
          </Stack>
        </Grid>

        <Card className="p-6 bg-grey-50">
          <H3 className="mb-4">EMERGENCY CONTACTS</H3>
          <Grid cols={3} gap={6}>
            {[
              { name: 'Medical', number: 'Channel 5', icon: Phone },
              { name: 'Security', number: 'Channel 6', icon: AlertCircle },
              { name: 'Fire/Safety', number: 'Channel 7', icon: Bell },
            ].map((contact, idx) => (
              <Card key={idx} className="p-4 bg-white border-2 border-black">
                <Stack gap={3} direction="horizontal" className="items-center">
                  <contact.icon className="w-6 h-6" />
                  <Stack gap={1}>
                    <Body className="font-bold">{contact.name}</Body>
                    <Body className="text-sm text-grey-600">{contact.number}</Body>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Card>
        </Stack>
      </Container>
    </Section>
  );
}
