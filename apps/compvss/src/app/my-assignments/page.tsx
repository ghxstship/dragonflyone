'use client';

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
  Check,
  X,
  Clock,
  Calendar,
  MapPin,
} from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';

import {
  useMyAssignments,
  useUpdateAssignmentStatus,
  type Assignment,
} from '../../hooks/useMyAssignments';

export default function MyAssignmentsPage() {
  const { data: assignments = [], isLoading, error } = useMyAssignments();
  const updateStatus = useUpdateAssignmentStatus();

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <Stack gap={8} className="flex min-h-[60vh] items-center justify-center">
          <Stack gap={4} className="items-center">
            <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
            <Body>Loading assignments...</Body>
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
              <Body className="text-destructive font-display">Failed to load assignments</Body>
              <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </Stack>
          </Card>
        </Stack>
      </CompvssAppLayout>
    );
  }

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const acceptedCount = assignments.filter(a => a.status === 'accepted').length;
  const declinedCount = assignments.filter(a => a.status === 'declined').length;

  const handleAccept = (id: string) => {
    updateStatus.mutate({ id, status: 'accepted' });
  };

  const handleDecline = (id: string) => {
    updateStatus.mutate({ id, status: 'declined' });
  };

  const getStatusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Response</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'declined':
        return <Badge variant="error">Declined</Badge>;
    }
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Crew Portal"
          title="My Assignments"
          description="Review and respond to assignment offers"
          colorScheme="on-dark"
        />

        <Grid cols={3} gap={4}>
          <StatCard
            label="Pending"
            value={pendingCount.toString()}
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="Accepted"
            value={acceptedCount.toString()}
            icon={<Check size={20} />}
            inverted
          />
          <StatCard
            label="Declined"
            value={declinedCount.toString()}
            icon={<X size={20} />}
            inverted
          />
        </Grid>

        <Stack gap={4}>
          {assignments.map(assignment => (
            <Card key={assignment.id} inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Stack gap={2}>
                      <H3 className="text-white">{assignment.production}</H3>
                      <Stack direction="horizontal" gap={4} className="items-center">
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <MapPin size={14} className="text-on-dark-muted" />
                          <Body className="text-on-dark-muted">{assignment.venue}</Body>
                        </Stack>
                        <Stack direction="horizontal" gap={1} className="items-center">
                          <Calendar size={14} className="text-on-dark-muted" />
                          <Body className="text-on-dark-muted">{assignment.dates}</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                    {getStatusBadge(assignment.status)}
                  </Stack>

                  <Grid cols={4} gap={4}>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">Department</Body>
                      <Body className="text-white">{assignment.department}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">Role</Body>
                      <Body className="text-white">{assignment.role}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">Day Rate</Body>
                      <Body className="text-white">${assignment.rate}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">Response Deadline</Body>
                      <Body className="text-white">
                        {new Date(assignment.deadline).toLocaleDateString()}
                      </Body>
                    </Stack>
                  </Grid>

                  {assignment.status === 'pending' && (
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="solid" onClick={() => handleAccept(assignment.id)}>
                        <Check size={16} className="mr-2" />
                        Accept Assignment
                      </Button>
                      <Button variant="outline" onClick={() => handleDecline(assignment.id)}>
                        <X size={16} className="mr-2" />
                        Decline
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Stack>
      </Stack>
    </CompvssAppLayout>
  );
}
