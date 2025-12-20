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
import { CompvssAppLayout } from '../../../components/app-layout';

import {
  useMySchedule,
  type ScheduleItem,
} from '../../../hooks/useMySchedule';

export default function MySchedulePage() {
  const { data: schedule = [], isLoading, error } = useMySchedule();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <Stack gap={8} className="flex min-h-[60vh] items-center justify-center">
          <Stack gap={4} className="items-center">
            <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
            <Body>Loading schedule...</Body>
          </Stack>
        </Stack>
      </CompvssAppLayout>
    );
  }

  if (error) {
    return (
      <CompvssAppLayout>
        <Stack gap={8} className="p-6">
          <Card className="p-6 border-destructive bg-destructive/10">
            <Stack gap={4} className="items-center text-center">
              <Body className="text-destructive font-display">Failed to load schedule</Body>
              <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </Stack>
          </Card>
        </Stack>
      </CompvssAppLayout>
    );
  }

  const confirmedShifts = schedule.filter(s => s.status === 'confirmed').length;
  const pendingShifts = schedule.filter(s => s.status === 'pending').length;
  const totalHours = schedule.reduce((acc, s) => {
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

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
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
                {schedule.map(item => (
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
                        <Body size="sm" className=" text-on-dark-muted">
                          {item.startTime} - {item.endTime}
                        </Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="font-weight-bold text-white">{item.production}</Body>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <MapPin size={14} className="text-on-dark-muted" />
                          <Body size="sm" className=" text-on-dark-muted">{item.venue}</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" gap={4} className="items-center">
                      <Stack gap={0} className="text-right">
                        <Body className="text-white">{item.department}</Body>
                        <Body size="sm" className=" text-on-dark-muted">{item.role}</Body>
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
