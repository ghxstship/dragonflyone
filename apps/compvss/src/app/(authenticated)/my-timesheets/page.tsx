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
  Input,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ghxstship/ui';
import {
  useMyTimesheets,
  type TimesheetEntry,
} from '../../../hooks/useMyTimesheets';
import {
  Clock,
  Calendar,
  DollarSign,
  Send,
} from 'lucide-react';
// Layout provided by route group



export default function MyTimesheetsPage() {
  const { data: timesheets = [], isLoading, error } = useMyTimesheets();
  const [selectedWeek] = useState('current');

  if (isLoading) {
    return (
      <>
        <Stack gap={8} className="flex min-h-[60vh] items-center justify-center">
          <Stack gap={4} className="items-center">
            <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
            <Body>Loading timesheets...</Body>
          </Stack>
        </Stack>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack gap={8} className="p-6">
          <Card className="p-6 border-destructive bg-destructive/10">
            <Stack gap={4} className="items-center text-center">
              <Body className="text-destructive font-display">Failed to load timesheets</Body>
              <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </Stack>
          </Card>
        </Stack>
      </>
    );
  }

  const totalHours = timesheets.reduce((acc, t) => acc + t.totalHours, 0);
  const totalEarnings = timesheets.reduce((acc, t) => acc + t.totalHours * t.rate, 0);
  const pendingCount = timesheets.filter(t => t.status === 'draft' || t.status === 'submitted').length;
  const approvedCount = timesheets.filter(t => t.status === 'approved').length;

  const getStatusBadge = (status: TimesheetEntry['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="info">Draft</Badge>;
      case 'submitted':
        return <Badge variant="warning">Submitted</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
    }
  };

  return (
    <>
      <Stack gap={8}>
        <SectionHeader
          kicker="Crew Portal"
          title="My Timesheets"
          description="Track your hours and submit timesheets for approval"
          colorScheme="on-dark"
                  />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Hours"
            value={totalHours.toString()}
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="Total Earnings"
            value={`$${totalEarnings.toLocaleString()}`}
            icon={<DollarSign size={20} />}
            inverted
          />
          <StatCard
            label="Pending"
            value={pendingCount.toString()}
            icon={<Send size={20} />}
            inverted
          />
          <StatCard
            label="Approved"
            value={approvedCount.toString()}
            icon={<Calendar size={20} />}
            inverted
          />
        </Grid>

        <Card inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">Timesheet Entries</H3>
                <Stack direction="horizontal" gap={2}>
                  <Label className="text-on-dark-muted">Week:</Label>
                  <Input
                    type="week"
                    value={selectedWeek}
                    className="w-48"
                  />
                </Stack>
              </Stack>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Production</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Break</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timesheets.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>{entry.production}</TableCell>
                      <TableCell>{entry.clockIn}</TableCell>
                      <TableCell>{entry.clockOut}</TableCell>
                      <TableCell>{entry.breakTime}m</TableCell>
                      <TableCell>{entry.totalHours}h</TableCell>
                      <TableCell>${entry.rate}/hr</TableCell>
                      <TableCell>${entry.totalHours * entry.rate}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        {entry.status === 'draft' && (
                          <Button variant="ghost" size="sm">
                            <Send size={14} className="mr-1" />
                            Submit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Stack direction="horizontal" className="items-center justify-between border-t-2 border-ink-700 pt-4">
                <Body className="text-on-dark-muted">
                  {timesheets.length} entries this week
                </Body>
                <Stack direction="horizontal" gap={4}>
                  <Body className="text-white">
                    Total: {totalHours} hours
                  </Body>
                  <Body className="text-white">
                    Earnings: ${totalEarnings.toLocaleString()}
                  </Body>
                </Stack>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </>
  );
}
