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

interface ClockEntry {
  id: string;
  type: 'clock_in' | 'break_start' | 'break_end' | 'clock_out';
  time: string;
  location?: string;
}

export default function ClockInPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [entries, setEntries] = useState<ClockEntry[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    const now = new Date();
    setClockedIn(true);
    setClockInTime(now);
    setEntries(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'clock_in',
        time: now.toISOString(),
        location: 'Main Venue',
      },
    ]);
  };

  const handleClockOut = () => {
    const now = new Date();
    setClockedIn(false);
    setOnBreak(false);
    setClockInTime(null);
    setEntries(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'clock_out',
        time: now.toISOString(),
        location: 'Main Venue',
      },
    ]);
  };

  const handleBreakStart = () => {
    const now = new Date();
    setOnBreak(true);
    setEntries(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'break_start',
        time: now.toISOString(),
      },
    ]);
  };

  const handleBreakEnd = () => {
    const now = new Date();
    setOnBreak(false);
    setEntries(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'break_end',
        time: now.toISOString(),
      },
    ]);
  };

  const getElapsedTime = () => {
    if (!clockInTime) return '00:00:00';
    const diff = currentTime.getTime() - clockInTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEntryLabel = (type: ClockEntry['type']) => {
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

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Crew Portal"
          title="Clock In/Out"
          description="Track your work hours with location verification"
          colorScheme="on-dark"
        />

        <Grid cols={2} gap={6}>
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
                          {entry.type === 'clock_in' && <LogIn size={16} className="text-success" />}
                          {entry.type === 'clock_out' && <LogOut size={16} className="text-error" />}
                          {entry.type === 'break_start' && <Coffee size={16} className="text-warning" />}
                          {entry.type === 'break_end' && <CheckCircle size={16} className="text-success" />}
                          <Body className="text-white">{getEntryLabel(entry.type)}</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={4} className="items-center">
                          {entry.location && (
                            <Stack direction="horizontal" gap={1} className="items-center">
                              <MapPin size={12} className="text-on-dark-muted" />
                              <Body className="text-body-sm text-on-dark-muted">{entry.location}</Body>
                            </Stack>
                          )}
                          <Body className="text-white">
                            {new Date(entry.time).toLocaleTimeString()}
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

        <Grid cols={3} gap={4}>
          <StatCard
            label="This Week"
            value="32.5"
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="This Pay Period"
            value="78.25"
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="Overtime"
            value="2.5"
            icon={<Clock size={20} />}
            inverted
          />
        </Grid>
      </Stack>
    </CompvssAppLayout>
  );
}
