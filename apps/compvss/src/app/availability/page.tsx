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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ghxstship/ui';
import { Navigation } from '../../components/navigation';

interface AvailabilitySlot {
  id: string;
  user_id: string;
  user_name: string;
  date: string;
  status: 'available' | 'unavailable' | 'tentative' | 'booked';
  start_time?: string;
  end_time?: string;
  notes?: string;
  calendar_source?: 'manual' | 'google' | 'outlook' | 'ical';
}

interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook' | 'apple' | 'ical';
  name: string;
  email?: string;
  is_connected: boolean;
  last_sync?: string;
  sync_enabled: boolean;
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  availability: AvailabilitySlot[];
}

const mockCalendarIntegrations: CalendarIntegration[] = [
  { id: 'CAL-001', provider: 'google', name: 'Google Calendar', email: 'user@gmail.com', is_connected: true, last_sync: '2024-11-24T14:00:00Z', sync_enabled: true },
  { id: 'CAL-002', provider: 'outlook', name: 'Outlook Calendar', is_connected: false, sync_enabled: false },
  { id: 'CAL-003', provider: 'apple', name: 'Apple Calendar', is_connected: false, sync_enabled: false },
];

const mockCrewMembers: CrewMember[] = [
  { id: 'CREW-001', name: 'John Martinez', role: 'Audio Engineer', department: 'Audio', availability: [] },
  { id: 'CREW-002', name: 'Sarah Chen', role: 'Lighting Designer', department: 'Lighting', availability: [] },
  { id: 'CREW-003', name: 'Mike Thompson', role: 'Stage Manager', department: 'Stage', availability: [] },
  { id: 'CREW-004', name: 'Lisa Park', role: 'Video Director', department: 'Video', availability: [] },
  { id: 'CREW-005', name: 'Tom Wilson', role: 'Head Rigger', department: 'Rigging', availability: [] },
];

// Generate mock availability for the next 14 days
const generateMockAvailability = (): AvailabilitySlot[] => {
  const slots: AvailabilitySlot[] = [];
  const statuses: AvailabilitySlot['status'][] = ['available', 'unavailable', 'tentative', 'booked'];
  
  mockCrewMembers.forEach(member => {
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      slots.push({
        id: `SLOT-${member.id}-${dateStr}`,
        user_id: member.id,
        user_name: member.name,
        date: dateStr,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        calendar_source: Math.random() > 0.5 ? 'google' : 'manual',
      });
    }
  });
  
  return slots;
};

export default function AvailabilityPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>(mockCalendarIntegrations);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(generateMockAvailability());
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [showSetAvailabilityModal, setShowSetAvailabilityModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newAvailability, setNewAvailability] = useState({
    date: selectedDate,
    status: 'available',
    start_time: '09:00',
    end_time: '18:00',
    notes: '',
  });

  const handleSetAvailability = () => {
    const slot: AvailabilitySlot = {
      id: `SLOT-${Date.now()}`,
      user_id: 'CREW-001',
      user_name: 'Current User',
      date: newAvailability.date,
      status: newAvailability.status as AvailabilitySlot['status'],
      start_time: newAvailability.start_time,
      end_time: newAvailability.end_time,
      notes: newAvailability.notes,
      calendar_source: 'manual',
    };

    setAvailability([...availability.filter(a => !(a.user_id === 'CREW-001' && a.date === newAvailability.date)), slot]);
    setShowSetAvailabilityModal(false);
    setSuccess('Availability updated');
  };

  const handleConnectCalendar = (provider: string) => {
    setIntegrations(integrations.map(i =>
      i.provider === provider ? { ...i, is_connected: true, last_sync: new Date().toISOString(), sync_enabled: true } : i
    ));
    setShowIntegrationModal(false);
    setSuccess(`${provider} calendar connected successfully`);
  };

  const handleDisconnectCalendar = (provider: string) => {
    setIntegrations(integrations.map(i =>
      i.provider === provider ? { ...i, is_connected: false, sync_enabled: false } : i
    ));
    setSuccess(`${provider} calendar disconnected`);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500 text-white',
      unavailable: 'bg-red-500 text-white',
      tentative: 'bg-yellow-500 text-black',
      booked: 'bg-blue-500 text-white',
    };
    return <Badge className={colors[status] || ''}>{status}</Badge>;
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      google: '📅',
      outlook: '📧',
      apple: '🍎',
      ical: '📆',
    };
    return icons[provider] || '📅';
  };

  // Generate dates for the next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const filteredAvailability = availability.filter(a => {
    const matchesMember = selectedMember === 'all' || a.user_id === selectedMember;
    return matchesMember;
  });

  const getAvailabilityForDate = (date: string, userId: string) => {
    return availability.find(a => a.date === date && a.user_id === userId);
  };

  const availableToday = availability.filter(a => a.date === selectedDate && a.status === 'available').length;
  const connectedCalendars = integrations.filter(i => i.is_connected).length;

  return (
    <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <H1>Availability Calendar</H1>
              <Label className="text-ink-400">Manage crew availability and calendar integrations</Label>
            </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline" onClick={() => setShowIntegrationModal(true)}>
                Connect Calendar
              </Button>
              <Button variant="solid" onClick={() => setShowSetAvailabilityModal(true)}>
                Set Availability
              </Button>
            </Stack>
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
            <StatCard label="Available Today" value={availableToday} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Connected Calendars" value={connectedCalendars} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Crew Members" value={mockCrewMembers.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Days Shown" value={14} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')}>
                Calendar View
              </Tab>
              <Tab active={activeTab === 'list'} onClick={() => setActiveTab('list')}>
                List View
              </Tab>
              <Tab active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')}>
                Integrations
              </Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'calendar' && (
            <Stack gap={6}>
              <Stack direction="horizontal" gap={4}>
                <Select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-48 border-ink-700 bg-black text-white"
                >
                  <option value="all">All Crew</option>
                  {mockCrewMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </Select>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-48 border-ink-700 bg-black text-white"
                />
              </Stack>

              <Card className="border-2 border-ink-800 bg-ink-900/50 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-ink-900">
                      <TableHead className="sticky left-0 bg-ink-900">Crew Member</TableHead>
                      {dates.map(date => (
                        <TableHead key={date} className="text-center min-w-20">
                          <Stack gap={1}>
                            <Label size="xs">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</Label>
                            <Label>{new Date(date).getDate()}</Label>
                          </Stack>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCrewMembers.filter(m => selectedMember === 'all' || m.id === selectedMember).map(member => (
                      <TableRow key={member.id}>
                        <TableCell className="sticky left-0 bg-ink-900">
                          <Stack gap={1}>
                            <Body className="text-white">{member.name}</Body>
                            <Label size="xs" className="text-ink-500">{member.role}</Label>
                          </Stack>
                        </TableCell>
                        {dates.map(date => {
                          const slot = getAvailabilityForDate(date, member.id);
                          const statusColors: Record<string, string> = {
                            available: 'bg-green-900/50 border-green-700',
                            unavailable: 'bg-red-900/50 border-red-700',
                            tentative: 'bg-yellow-900/50 border-yellow-700',
                            booked: 'bg-blue-900/50 border-blue-700',
                          };
                          return (
                            <TableCell key={date} className="text-center">
                              <Card className={`p-2 border ${slot ? statusColors[slot.status] : 'border-ink-700'}`}>
                                <Label size="xs" className={slot?.status === 'available' ? 'text-green-400' : slot?.status === 'unavailable' ? 'text-red-400' : slot?.status === 'tentative' ? 'text-yellow-400' : slot?.status === 'booked' ? 'text-blue-400' : 'text-ink-500'}>
                                  {slot?.status?.charAt(0).toUpperCase() || '-'}
                                </Label>
                              </Card>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <Stack direction="horizontal" gap={4}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Card className="w-4 h-4 bg-green-500 rounded" />
                  <Label size="xs" className="text-ink-400">Available</Label>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Card className="w-4 h-4 bg-red-500 rounded" />
                  <Label size="xs" className="text-ink-400">Unavailable</Label>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Card className="w-4 h-4 bg-yellow-500 rounded" />
                  <Label size="xs" className="text-ink-400">Tentative</Label>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Card className="w-4 h-4 bg-blue-500 rounded" />
                  <Label size="xs" className="text-ink-400">Booked</Label>
                </Stack>
              </Stack>
            </Stack>
          )}

          {activeTab === 'list' && (
            <Stack gap={4}>
              <H3>Availability for {new Date(selectedDate).toLocaleDateString()}</H3>
              {mockCrewMembers.map(member => {
                const slot = getAvailabilityForDate(selectedDate, member.id);
                return (
                  <Card key={member.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{member.name}</Body>
                        <Label className="text-ink-400">{member.role} • {member.department}</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={4} className="items-center">
                        {slot ? getStatusBadge(slot.status) : <Badge variant="outline">Not Set</Badge>}
                        {slot?.calendar_source && (
                          <Label size="xs" className="text-ink-500">
                            {slot.calendar_source === 'google' ? '📅 Google' : '✏️ Manual'}
                          </Label>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          )}

          {activeTab === 'integrations' && (
            <Stack gap={6}>
              <H3>Calendar Integrations</H3>
              <Grid cols={3} gap={6}>
                {integrations.map(integration => (
                  <Card key={integration.id} className={`border-2 p-4 ${integration.is_connected ? 'border-green-800 bg-green-900/10' : 'border-ink-800 bg-ink-900/50'}`}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Body className="text-2xl">{getProviderIcon(integration.provider)}</Body>
                          <Body className="font-display text-white">{integration.name}</Body>
                        </Stack>
                        {integration.is_connected && (
                          <Badge className="bg-green-500 text-white">Connected</Badge>
                        )}
                      </Stack>

                      {integration.is_connected && integration.email && (
                        <Label className="text-ink-400">{integration.email}</Label>
                      )}

                      {integration.last_sync && (
                        <Label size="xs" className="text-ink-500">
                          Last synced: {new Date(integration.last_sync).toLocaleString()}
                        </Label>
                      )}

                      <Stack direction="horizontal" gap={2}>
                        {integration.is_connected ? (
                          <>
                            <Button variant="outline" size="sm">Sync Now</Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisconnectCalendar(integration.provider)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="solid"
                            size="sm"
                            onClick={() => handleConnectCalendar(integration.provider)}
                          >
                            Connect
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>

              <Card className="border-2 border-ink-800 bg-ink-900/50 p-4">
                <Stack gap={4}>
                  <H3>iCal Feed</H3>
                  <Body className="text-ink-300">
                    Subscribe to your availability calendar using this iCal feed URL:
                  </Body>
                  <Stack direction="horizontal" gap={2}>
                    <Input
                      value="https://app.compvss.com/api/calendar/ical/user-123.ics"
                      readOnly
                      className="flex-1 border-ink-700 bg-black text-white font-mono text-sm"
                    />
                    <Button variant="outline">Copy</Button>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          )}

          <Grid cols={4} gap={4}>
            <Button variant="outlineWhite" onClick={() => setShowSetAvailabilityModal(true)}>Set Availability</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/crew')}>Crew Directory</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/scheduling')}>Scheduling</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Calendar</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showSetAvailabilityModal} onClose={() => setShowSetAvailabilityModal(false)}>
        <ModalHeader><H3>Set Availability</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input
              type="date"
              value={newAvailability.date}
              onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
              className="border-ink-700 bg-black text-white"
            />
            <Select
              value={newAvailability.status}
              onChange={(e) => setNewAvailability({ ...newAvailability, status: e.target.value })}
              className="border-ink-700 bg-black text-white"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="tentative">Tentative</option>
            </Select>
            <Grid cols={2} gap={4}>
              <Input
                type="time"
                value={newAvailability.start_time}
                onChange={(e) => setNewAvailability({ ...newAvailability, start_time: e.target.value })}
                className="border-ink-700 bg-black text-white"
              />
              <Input
                type="time"
                value={newAvailability.end_time}
                onChange={(e) => setNewAvailability({ ...newAvailability, end_time: e.target.value })}
                className="border-ink-700 bg-black text-white"
              />
            </Grid>
            <Textarea
              placeholder="Notes (optional)..."
              value={newAvailability.notes}
              onChange={(e) => setNewAvailability({ ...newAvailability, notes: e.target.value })}
              rows={2}
              className="border-ink-700 bg-black text-white"
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSetAvailabilityModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={handleSetAvailability}>Save</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showIntegrationModal} onClose={() => setShowIntegrationModal(false)}>
        <ModalHeader><H3>Connect Calendar</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Body className="text-ink-300">
              Connect your calendar to automatically sync your availability.
            </Body>
            {integrations.filter(i => !i.is_connected).map(integration => (
              <Card
                key={integration.id}
                className="p-4 border border-ink-700 cursor-pointer hover:border-ink-500"
                onClick={() => handleConnectCalendar(integration.provider)}
              >
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Body className="text-2xl">{getProviderIcon(integration.provider)}</Body>
                  <Body className="text-white">{integration.name}</Body>
                </Stack>
              </Card>
            ))}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowIntegrationModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
