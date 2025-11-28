'use client';

import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import {
  Container,
  Section,
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Stack,
  StatCard,
  PageLayout,
  SectionHeader,
} from '@ghxstship/ui';
import { Radio, Phone, Users, MessageSquare, Bell, AlertCircle } from 'lucide-react';

export default function CommunicationsPage() {
  const router = useRouter();

  const channels = [
    { id: '1', name: 'Main Production', frequency: '462.5625 MHz', type: 'Radio', users: 24, status: 'active', priority: 'high' },
    { id: '2', name: 'Stage Crew', frequency: '462.5875 MHz', type: 'Radio', users: 12, status: 'active', priority: 'medium' },
    { id: '3', name: 'Emergency Services', frequency: '462.6125 MHz', type: 'Radio', users: 8, status: 'standby', priority: 'critical' },
  ];

  const messages = [
    { id: '1', channel: 'Main Production', sender: 'Production Manager', message: 'Load-in complete, ready for soundcheck', timestamp: '14:32', priority: 'normal' },
    { id: '2', channel: 'Stage Crew', sender: 'Stage Manager', message: 'Need assistance with riser setup stage left', timestamp: '14:35', priority: 'high' },
  ];

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-start justify-between">
              <SectionHeader
                kicker="COMPVSS"
                title="Communications"
                description="Radio channels and team messaging"
                colorScheme="on-light"
                gap="lg"
              />
              <Stack gap={3} direction="horizontal">
                <Button variant="outline" onClick={() => router.push('/communications/alerts')}>
                  <Bell className="mr-2 size-4" />
                  ALERTS
                </Button>
                <Button variant="solid" onClick={() => router.push('/communications/channels/new')}>
                  <Radio className="mr-2 size-4" />
                  NEW CHANNEL
                </Button>
              </Stack>
            </Stack>

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={channels.filter(c => c.status === 'active').length.toString()} label="Active Channels" />
              <StatCard value={channels.reduce((sum, c) => sum + c.users, 0).toString()} label="Connected Users" />
              <StatCard value={messages.length.toString()} label="Recent Messages" />
              <StatCard value="0" label="Emergency Alerts" />
            </Grid>

            {/* Main Content */}
            <Grid cols={2} gap={6}>
              {/* Radio Channels */}
              <Stack gap={4}>
                <H2>RADIO CHANNELS</H2>
                <Stack gap={4}>
                  {channels.map((channel) => (
                    <Card key={channel.id} className="p-6">
                      <Stack gap={3} direction="horizontal" className="mb-3 items-start justify-between">
                        <Stack gap={3} direction="horizontal" className="items-center">
                          <Radio className="size-6" />
                          <Stack gap={1}>
                            <H3>{channel.name}</H3>
                            <Body className="text-body-sm">{channel.frequency}</Body>
                          </Stack>
                        </Stack>
                        <Badge variant={channel.priority === 'critical' ? 'solid' : 'outline'}>
                          {channel.priority.toUpperCase()}
                        </Badge>
                      </Stack>
                      <Stack gap={4} direction="horizontal" className="items-center justify-between">
                        <Stack gap={2} direction="horizontal" className="items-center text-body-sm">
                          <Users className="size-4" />
                          <Body className="text-body-sm">{channel.users} users</Body>
                        </Stack>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/communications/channels/${channel.id}`)}>
                          {channel.status === 'active' ? 'JOIN' : 'STANDBY'}
                        </Button>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>

              {/* Recent Messages */}
              <Stack gap={4}>
                <H2>RECENT MESSAGES</H2>
                <Stack gap={4}>
                  {messages.map((msg) => (
                    <Card key={msg.id} className="p-6">
                      <Stack gap={4} direction="horizontal" className="mb-2 items-start justify-between">
                        <Badge variant="outline">{msg.channel}</Badge>
                        <Body className="text-body-sm">{msg.timestamp}</Body>
                      </Stack>
                      <Body className="mb-1 font-display">{msg.sender}</Body>
                      <Body className="text-body-sm">{msg.message}</Body>
                    </Card>
                  ))}
                </Stack>

                <Card className="mt-4 border-2 border-dashed p-6">
                  <MessageSquare className="mx-auto mb-3 size-8" />
                  <H3 className="mb-2 text-center">Send Broadcast Message</H3>
                  <Button className="w-full" onClick={() => router.push('/communications/broadcast')}>COMPOSE</Button>
                </Card>
              </Stack>
            </Grid>

            {/* Emergency Contacts */}
            <Card className="p-6">
              <H3 className="mb-4">EMERGENCY CONTACTS</H3>
              <Grid cols={3} gap={6}>
                {[
                  { name: 'Medical', number: 'Channel 5', icon: Phone },
                  { name: 'Security', number: 'Channel 6', icon: AlertCircle },
                  { name: 'Fire/Safety', number: 'Channel 7', icon: Bell },
                ].map((contact, idx) => (
                  <Card key={idx} className="p-4">
                    <Stack gap={3} direction="horizontal" className="items-center">
                      <contact.icon className="size-6" />
                      <Stack gap={1}>
                        <Body className="font-display">{contact.name}</Body>
                        <Body className="text-body-sm">{contact.number}</Body>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Card>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
