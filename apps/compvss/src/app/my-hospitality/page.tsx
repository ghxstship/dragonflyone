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
  Textarea,
} from '@ghxstship/ui';
import {
  Coffee,
  Utensils,
  Car,
  Hotel,
  Plus,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';

interface HospitalityRequest {
  id: string;
  event: string;
  date: string;
  category: 'catering' | 'transport' | 'accommodation' | 'other';
  description: string;
  status: 'pending' | 'approved' | 'declined';
  notes?: string;
}

const mockRequests: HospitalityRequest[] = [
  {
    id: '1',
    event: 'Summer Music Festival',
    date: '2024-12-15',
    category: 'catering',
    description: 'Vegetarian meals for 6 band members, hot meals preferred',
    status: 'approved',
    notes: 'Confirmed with catering team',
  },
  {
    id: '2',
    event: 'Summer Music Festival',
    date: '2024-12-15',
    category: 'transport',
    description: 'Airport pickup for 6 people, arriving 2pm at JFK',
    status: 'pending',
  },
  {
    id: '3',
    event: 'New Year\'s Eve Gala',
    date: '2024-12-31',
    category: 'accommodation',
    description: '3 double rooms for Dec 30-Jan 1',
    status: 'approved',
    notes: 'Booked at Grand Hotel',
  },
];

export default function MyHospitalityPage() {
  const [requests] = useState(mockRequests);
  const [showNewRequest, setShowNewRequest] = useState(false);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  const getStatusBadge = (status: HospitalityRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'declined':
        return <Badge variant="error">Declined</Badge>;
    }
  };

  const getCategoryIcon = (category: HospitalityRequest['category']) => {
    switch (category) {
      case 'catering':
        return <Utensils size={20} className="text-white" />;
      case 'transport':
        return <Car size={20} className="text-white" />;
      case 'accommodation':
        return <Hotel size={20} className="text-white" />;
      case 'other':
        return <Coffee size={20} className="text-white" />;
    }
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Artist Portal"
          title="Hospitality Requests"
          description="Manage your catering, transport, and accommodation requests"
          colorScheme="on-dark"
        />

        <Grid cols={3} gap={4}>
          <StatCard
            label="Pending Requests"
            value={pendingCount.toString()}
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="Approved"
            value={approvedCount.toString()}
            icon={<CheckCircle size={20} />}
            inverted
          />
          <StatCard
            label="Total Requests"
            value={requests.length.toString()}
            icon={<Coffee size={20} />}
            inverted
          />
        </Grid>

        <Card inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Requests</H3>
                <Button variant="solid" onClick={() => setShowNewRequest(!showNewRequest)}>
                  <Plus size={16} className="mr-2" />
                  New Request
                </Button>
              </Stack>

              {showNewRequest && (
                <Card className="border-2 border-primary">
                  <CardBody>
                    <Stack gap={4}>
                      <H3 className="text-white">New Hospitality Request</H3>
                      <Grid cols={2} gap={4}>
                        <Stack gap={2}>
                          <Label>Event</Label>
                          <Input placeholder="Select event..." />
                        </Stack>
                        <Stack gap={2}>
                          <Label>Category</Label>
                          <Input placeholder="Select category..." />
                        </Stack>
                      </Grid>
                      <Stack gap={2}>
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe your request in detail..."
                          rows={4}
                        />
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="solid">Submit Request</Button>
                        <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  </CardBody>
                </Card>
              )}

              <Stack gap={4}>
                {requests.map(request => (
                  <Card key={request.id} className="border-2 border-ink-700">
                    <CardBody>
                      <Stack gap={3}>
                        <Stack direction="horizontal" className="items-start justify-between">
                          <Stack direction="horizontal" gap={3} className="items-center">
                            <Stack className="flex size-10 items-center justify-center rounded-card bg-ink-800">
                              {getCategoryIcon(request.category)}
                            </Stack>
                            <Stack gap={0}>
                              <Body className="text-white">{request.event}</Body>
                              <Body className="text-body-sm text-on-dark-muted">
                                {new Date(request.date).toLocaleDateString()} - {request.category}
                              </Body>
                            </Stack>
                          </Stack>
                          {getStatusBadge(request.status)}
                        </Stack>

                        <Body className="text-on-dark-muted">{request.description}</Body>

                        {request.notes && (
                          <Stack className="rounded-card bg-ink-800 p-3">
                            <Body className="text-body-sm text-on-dark-muted">
                              Response: {request.notes}
                            </Body>
                          </Stack>
                        )}
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </CompvssAppLayout>
  );
}
