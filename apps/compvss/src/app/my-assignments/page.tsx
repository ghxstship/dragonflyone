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
  Briefcase,
  Check,
  X,
  Clock,
  Calendar,
  MapPin,
} from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';

interface Assignment {
  id: string;
  production: string;
  venue: string;
  dates: string;
  department: string;
  role: string;
  rate: number;
  status: 'pending' | 'accepted' | 'declined';
  deadline: string;
}

const mockAssignments: Assignment[] = [
  {
    id: '1',
    production: 'New Year\'s Eve Gala',
    venue: 'Grand Ballroom',
    dates: 'Dec 31, 2024 - Jan 1, 2025',
    department: 'Stage',
    role: 'Stage Manager',
    rate: 450,
    status: 'pending',
    deadline: '2024-12-20',
  },
  {
    id: '2',
    production: 'Winter Concert Series',
    venue: 'Symphony Hall',
    dates: 'Jan 5-7, 2025',
    department: 'Audio',
    role: 'A1',
    rate: 350,
    status: 'pending',
    deadline: '2024-12-25',
  },
  {
    id: '3',
    production: 'Corporate Awards',
    venue: 'Convention Center',
    dates: 'Jan 15, 2025',
    department: 'Video',
    role: 'LED Tech',
    rate: 300,
    status: 'accepted',
    deadline: '2024-12-15',
  },
  {
    id: '4',
    production: 'Trade Show',
    venue: 'Expo Center',
    dates: 'Jan 20-22, 2025',
    department: 'Lighting',
    role: 'LD',
    rate: 400,
    status: 'declined',
    deadline: '2024-12-10',
  },
];

export default function MyAssignmentsPage() {
  const [assignments, setAssignments] = useState(mockAssignments);

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const acceptedCount = assignments.filter(a => a.status === 'accepted').length;
  const declinedCount = assignments.filter(a => a.status === 'declined').length;

  const handleAccept = (id: string) => {
    setAssignments(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'accepted' as const } : a))
    );
  };

  const handleDecline = (id: string) => {
    setAssignments(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'declined' as const } : a))
    );
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
                      <Body className="text-body-sm text-on-dark-muted">Department</Body>
                      <Body className="text-white">{assignment.department}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-on-dark-muted">Role</Body>
                      <Body className="text-white">{assignment.role}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-on-dark-muted">Day Rate</Body>
                      <Body className="text-white">${assignment.rate}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-body-sm text-on-dark-muted">Response Deadline</Body>
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
