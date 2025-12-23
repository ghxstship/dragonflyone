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
// Layout provided by route group

import {
  useMyHospitality,
  type HospitalityRequest,
} from '../../../hooks/useMyHospitality';

export default function MyHospitalityPage() {
  const { data: requests = [], isLoading, error } = useMyHospitality();
  const [showNewRequest, setShowNewRequest] = useState(false);

  if (isLoading) {
    return (
      <>
        <Stack gap={8} className="flex min-h-[60vh] items-center justify-center">
          <Stack gap={4} className="items-center">
            <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
            <Body>Loading hospitality requests...</Body>
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
              <Body className="text-destructive font-display">Failed to load hospitality requests</Body>
              <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </Stack>
          </Card>
        </Stack>
      </>
    );
  }

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
    <>
      <Stack gap={8}>
        <SectionHeader
          kicker="Artist Portal"
          title="Hospitality Requests"
          description="Manage your catering, transport, and accommodation requests"
          colorScheme="on-dark"
        />

        <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
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
                      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
                              <Body size="sm" className=" text-on-dark-muted">
                                {new Date(request.date).toLocaleDateString()} - {request.category}
                              </Body>
                            </Stack>
                          </Stack>
                          {getStatusBadge(request.status)}
                        </Stack>

                        <Body className="text-on-dark-muted">{request.description}</Body>

                        {request.notes && (
                          <Stack className="rounded-card bg-ink-800 p-3">
                            <Body size="sm" className=" text-on-dark-muted">
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
    </>
  );
}
