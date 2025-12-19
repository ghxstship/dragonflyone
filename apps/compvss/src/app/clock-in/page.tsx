'use client';

import { useState, useEffect } from 'react';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  H3,
  Spinner,
} from '@ghxstship/ui';
import {
  Clock,
  MapPin,
  LogIn,
  LogOut,
  Coffee,
  CheckCircle,
} from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';
import { useAuthContext } from '@ghxstship/config';
import {
  useClockEntries,
  useClockStatus,
  useClockIn,
  useClockOut,
  useStartBreak,
  useEndBreak,
  type ClockEntry,
} from '../../hooks/useClockIn';

export default function ClockInPage() {
  const { user } = useAuthContext();
  const userId = user?.id || '';
  
  const { data: entries = [], isLoading: entriesLoading } = useClockEntries(userId);
  const { data: status, isLoading: statusLoading } = useClockStatus(userId);
  
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();
  const startBreakMutation = useStartBreak();
  const endBreakMutation = useEndBreak();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clockedIn = status?.isClockedIn || false;
  const onBreak = status?.isOnBreak || false;
  const clockInTime = status?.clockInTime ? new Date(status.clockInTime) : null;

  const handleClockIn = async () => {
    if (!userId) return;
    await clockInMutation.mutateAsync({ userId, location: 'Main Venue' });
  };

  const handleClockOut = async () => {
    if (!userId) return;
    await clockOutMutation.mutateAsync({ userId, location: 'Main Venue' });
  };

  const handleBreakStart = async () => {
    if (!userId) return;
    await startBreakMutation.mutateAsync({ userId });
  };

  const handleBreakEnd = async () => {
    if (!userId) return;
    await endBreakMutation.mutateAsync({ userId });
  };
  
  const isLoading = entriesLoading || statusLoading;

  const getElapsedTime = () => {
    if (!clockInTime) return '00:00:00';
    const diff = currentTime.getTime() - clockInTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEntryLabel = (type: ClockEntry['entry_type']) => {
    switch (type) {
      case 'clock_in':
        return 'Clocked In';
      case 'break_start':
        return 'Break Started';
      case 'break_end':
        return 'Break Ended';
      case 'clock_out':
        return 'Clocked Out';
    }
  };

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <Stack className="min-h-[60vh] items-center justify-center">
          <Spinner variant="grey" size="lg" text="Loading time clock..." />
        </Stack>
      </CompvssAppLayout>
    );
  }

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Crew Portal"
          title="Clock In/Out"
          description="Track your work hours with location verification"
          colorScheme="on-dark"
        />

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
          <Card inverted>
            <CardBody>
              <Stack gap={6} className="items-center py-8">
                <Stack gap={2} className="items-center">
                  <Body className="text-on-dark-muted">Current Time</Body>
                  <H3 className="text-display-lg text-white">
                    {currentTime.toLocaleTimeString()}
                  </H3>
                  <Body className="text-on-dark-muted">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </Body>
                </Stack>

                {clockedIn && (
                  <Stack gap={2} className="items-center">
                    <Body className="text-on-dark-muted">Time Worked</Body>
                    <H3 className="text-display-md text-primary">
                      {getElapsedTime()}
                    </H3>
                  </Stack>
                )}

                <Stack direction="horizontal" gap={2} className="items-center">
                  <MapPin size={16} className="text-on-dark-muted" />
                  <Body className="text-on-dark-muted">Main Venue - Central Park</Body>
                </Stack>

                <Stack gap={2} className="items-center">
                  {!clockedIn ? (
                    <Button variant="solid" size="lg" onClick={handleClockIn}>
                      <LogIn size={20} className="mr-2" />
                      Clock In
                    </Button>
                  ) : (
                    <Stack direction="horizontal" gap={2}>
                      {!onBreak ? (
                        <Button variant="outline" onClick={handleBreakStart}>
                          <Coffee size={16} className="mr-2" />
                          Start Break
                        </Button>
                      ) : (
                        <Button variant="solid" onClick={handleBreakEnd}>
                          <CheckCircle size={16} className="mr-2" />
                          End Break
                        </Button>
                      )}
                      <Button variant="outline" onClick={handleClockOut}>
                        <LogOut size={16} className="mr-2" />
                        Clock Out
                      </Button>
                    </Stack>
                  )}
                </Stack>

                {clockedIn && (
                  <Badge variant={onBreak ? 'warning' : 'success'}>
                    {onBreak ? 'On Break' : 'Working'}
                  </Badge>
                )}
              </Stack>
            </CardBody>
          </Card>

          <Card inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">Today&apos;s Activity</H3>

                {entries.length === 0 ? (
                  <Stack className="items-center py-8">
                    <Clock size={48} className="text-ink-600" />
                    <Body className="text-on-dark-muted">No activity yet today</Body>
                  </Stack>
                ) : (
                  <Stack gap={3}>
                    {entries.map(entry => (
                      <Stack
                        key={entry.id}
                        direction="horizontal"
                        className="items-center justify-between border-b border-ink-700 pb-3"
                      >
                        <Stack direction="horizontal" gap={3} className="items-center">
                          {entry.entry_type === 'clock_in' && <LogIn size={16} className="text-success" />}
                          {entry.entry_type === 'clock_out' && <LogOut size={16} className="text-error" />}
                          {entry.entry_type === 'break_start' && <Coffee size={16} className="text-warning" />}
                          {entry.entry_type === 'break_end' && <CheckCircle size={16} className="text-success" />}
                          <Body className="text-white">{getEntryLabel(entry.entry_type)}</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={4} className="items-center">
                          {entry.location && (
                            <Stack direction="horizontal" gap={1} className="items-center">
                              <MapPin size={12} className="text-on-dark-muted" />
                              <Body size="sm" className=" text-on-dark-muted">{entry.location}</Body>
                            </Stack>
                          )}
                          <Body className="text-white">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </Body>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="This Week"
            value={status?.totalHoursWeek?.toFixed(1) || '0'}
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="This Pay Period"
            value={status?.totalHoursPayPeriod?.toFixed(1) || '0'}
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="Overtime"
            value={status?.overtimeHours?.toFixed(1) || '0'}
            icon={<Clock size={20} />}
            inverted
          />
        </Grid>
      </Stack>
    </CompvssAppLayout>
  );
}
