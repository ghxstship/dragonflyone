'use client';

import { useState } from 'react';
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
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';

interface ScheduleItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  production: string;
  venue: string;
  department: string;
  role: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const mockSchedule: ScheduleItem[] = [
  {
    id: '1',
    date: '2024-12-05',
    startTime: '08:00',
    endTime: '16:00',
    production: 'Summer Music Festival 2024',
    venue: 'Central Park Amphitheater',
    department: 'Stage',
    role: 'Stage Manager',
    status: 'confirmed',
  },
  {
    id: '2',
    date: '2024-12-06',
    startTime: '10:00',
    endTime: '18:00',
    production: 'Summer Music Festival 2024',
    venue: 'Central Park Amphitheater',
    department: 'Stage',
    role: 'Stage Manager',
    status: 'confirmed',
  },
  {
    id: '3',
    date: '2024-12-07',
    startTime: '06:00',
    endTime: '14:00',
    production: 'Corporate Gala',
    venue: 'Grand Ballroom',
    department: 'Audio',
    role: 'A1',
    status: 'pending',
  },
  {
    id: '4',
    date: '2024-12-10',
    startTime: '12:00',
    endTime: '20:00',
    production: 'Tech Conference',
    venue: 'Convention Center',
    department: 'Video',
    role: 'LED Tech',
    status: 'confirmed',
  },
];

export default function MySchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const confirmedShifts = mockSchedule.filter(s => s.status === 'confirmed').length;
  const pendingShifts = mockSchedule.filter(s => s.status === 'pending').length;
  const totalHours = mockSchedule.reduce((acc, s) => {
    const start = parseInt(s.startTime.split(':')[0]);
    const end = parseInt(s.endTime.split(':')[0]);
    return acc + (end - start);
  }, 0);

  const getStatusBadge = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
    }
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Crew Portal"
          title="My Schedule"
          description="View your upcoming shifts and assignments"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4}>
          <StatCard
            label="This Week"
            value={`${confirmedShifts + pendingShifts}`}
                        icon={<Calendar size={20} />}
                        inverted
          />
          <StatCard
            label="Confirmed"
            value={confirmedShifts.toString()}
                        icon={<CheckCircle size={20} />}
                        inverted
          />
          <StatCard
            label="Pending"
            value={pendingShifts.toString()}
                        icon={<AlertCircle size={20} />}
                        inverted
          />
          <StatCard
            label="Total Hours"
            value={totalHours.toString()}
                        icon={<Clock size={20} />}
                        inverted
          />
        </Grid>

        <Card  inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">Week View</H3>
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Body className="text-white">
                    {currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Body>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </Stack>
              </Stack>

              <Stack gap={3}>
                {mockSchedule.map(item => (
                  <Stack
                    key={item.id}
                    direction="horizontal"
                    className="items-center justify-between rounded-card border-2 border-ink-700 p-4"
                  >
                    <Stack direction="horizontal" gap={4} className="items-center">
                      <Stack gap={0} className="min-w-[100px]">
                        <Body className="font-weight-bold text-white">
                          {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Body>
                        <Body className="text-body-sm text-on-dark-muted">
                          {item.startTime} - {item.endTime}
                        </Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="font-weight-bold text-white">{item.production}</Body>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <MapPin size={14} className="text-on-dark-muted" />
                          <Body className="text-body-sm text-on-dark-muted">{item.venue}</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={4} className="items-center">
                      <Stack gap={0} className="text-right">
                        <Body className="text-white">{item.department}</Body>
                        <Body className="text-body-sm text-on-dark-muted">{item.role}</Body>
                      </Stack>
                      {getStatusBadge(item.status)}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </CompvssAppLayout>
  );
}
