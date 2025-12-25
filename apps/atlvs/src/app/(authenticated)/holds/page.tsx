'use client';

import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H3,
  Input,
  MainContent,
  Select,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Filter, ArrowRight } from 'lucide-react';
import { useHolds, useReleaseHold, useConvertHold } from '@/hooks/useHolds';

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-success/20 text-success' },
  expired: { label: 'Expired', color: 'bg-destructive/20 text-destructive' },
  released: { label: 'Released', color: 'bg-muted text-muted-foreground' },
  converted: { label: 'Converted', color: 'bg-primary/20 text-primary' },
};

const PRIORITY_CONFIG = {
  first_right: { label: 'First Right', color: 'bg-warning text-warning-foreground' },
  standard: { label: 'Standard', color: 'bg-muted text-muted-foreground' },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
};

export default function HoldsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  const { data, isLoading, error } = useHolds({ 
    organization_id: 'current', 
    status: statusFilter || undefined 
  });
  const releaseMutation = useReleaseHold();
  const convertMutation = useConvertHold();

  const holds = data?.holds || [];

  const filteredHolds = searchQuery
    ? holds.filter(
        (h) =>
          h.space?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.contact?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.contact?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : holds;

  const getExpiryInfo = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return { text: 'Expired', isExpired: true, isExpiringSoon: false };
    } else if (diffHours < 24) {
      return { text: `${diffHours}h left`, isExpired: false, isExpiringSoon: true };
    } else {
      return { text: `${diffDays}d left`, isExpired: false, isExpiringSoon: diffDays <= 2 };
    }
  };

  const handleRelease = async (holdId: string) => {
    if (confirm('Release this hold? The space will become available for booking.')) {
      await releaseMutation.mutateAsync(holdId);
    }
  };

  const handleConvert = async (holdId: string) => {
    await convertMutation.mutateAsync({ id: holdId, input: {} });
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Space Holds" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Skeleton className="h-8 w-1/3" />
              <Grid cols={4} gap={4}>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </Grid>
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Space Holds" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load holds"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  const activeCount = holds.filter((h) => h.status === 'active').length;
  const expiringCount = holds.filter((h) => {
    if (h.status !== 'active') return false;
    const info = getExpiryInfo(h.expires_at);
    return info.isExpiringSoon;
  }).length;

  return (
    <>
      <EnterprisePageHeader
        title="Space Holds"
        subtitle="Manage temporary space reservations"
        primaryAction={{ label: 'New Hold', onClick: () => router.push('/holds/new') }}
      />
      <Box className="px-6 py-3 border-b border-border flex justify-end">
        {expiringCount > 0 && (
          <Link href="/holds/expiring">
            <Button variant="outline" size="sm" className="text-warning border-warning">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {expiringCount} Expiring
            </Button>
          </Link>
        )}
      </Box>
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={4} gap={4}>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Total Holds</Text>
                </Stack>
                <Body className="font-weight-bold">{holds.length}</Body>
              </Card>
              <Card className="p-4 border-success/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <Text size="sm" className="text-muted-foreground">Active</Text>
                </Stack>
                <Body className="font-weight-bold text-success">{activeCount}</Body>
              </Card>
              <Card className="p-4 border-warning/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Clock className="h-5 w-5 text-warning" />
                  <Text size="sm" className="text-muted-foreground">Expiring Soon</Text>
                </Stack>
                <Body className="font-weight-bold text-warning">{expiringCount}</Body>
              </Card>
              <Card className="p-4 border-primary/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <ArrowRight className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Converted</Text>
                </Stack>
                <Body className="font-weight-bold text-primary">
                  {holds.filter((h) => h.status === 'converted').length}
                </Body>
              </Card>
            </Grid>

            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              <Box className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by space or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Stack>
              <Link href="/availability">
                <Button variant="outline" size="sm">Check Availability</Button>
              </Link>
            </Stack>

            {filteredHolds.length === 0 && (
              <EmptyState
                title="No holds found"
                description={searchQuery ? 'Try adjusting your search' : 'Create a hold to reserve a space temporarily'}
                icon={<Calendar className="h-12 w-12" />}
                action={{ label: 'New Hold', onClick: () => router.push('/holds/new') }}
              />
            )}

            {filteredHolds.length > 0 && (
              <Stack gap={4}>
                {filteredHolds.map((hold) => {
                  const statusConfig = STATUS_CONFIG[hold.status];
                  const priorityConfig = PRIORITY_CONFIG[hold.priority];
                  const expiryInfo = getExpiryInfo(hold.expires_at);
                  const contactName = hold.contact
                    ? `${hold.contact.first_name} ${hold.contact.last_name}`
                    : hold.lead
                      ? `${hold.lead.first_name} ${hold.lead.last_name}`
                      : 'No contact';

                  return (
                    <Card
                      key={hold.id}
                      className={`p-6 ${
                        expiryInfo.isExpired ? 'border-destructive' :
                        expiryInfo.isExpiringSoon ? 'border-warning' : ''
                      }`}
                    >
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Box className="flex-1">
                          <Stack direction="horizontal" gap={3} className="items-center mb-2">
                            <H3>{hold.space?.name || 'Unknown Space'}</H3>
                            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                            <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
                            {hold.status === 'active' && (
                              <Badge className={
                                expiryInfo.isExpired ? 'bg-destructive text-destructive-foreground' :
                                expiryInfo.isExpiringSoon ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                              }>
                                {expiryInfo.text}
                              </Badge>
                            )}
                          </Stack>
                          <Body size="sm" className="text-muted-foreground">
                            {contactName} - {new Date(hold.hold_date).toLocaleDateString()}
                            {hold.start_time && ` - ${hold.start_time}`}
                            {hold.end_time && ` - ${hold.end_time}`}
                          </Body>
                          {hold.notes && (
                            <Body size="xs" className="text-muted-foreground mt-2">{hold.notes}</Body>
                          )}
                        </Box>
                        {hold.status === 'active' && (
                          <Stack direction="horizontal" gap={2}>
                            <Button
                              onClick={() => handleConvert(hold.id)}
                              disabled={convertMutation.isPending}
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Convert to Booking
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleRelease(hold.id)}
                              disabled={releaseMutation.isPending}
                              size="sm"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Release
                            </Button>
                          </Stack>
                        )}
                        {hold.status === 'converted' && hold.converted_to_booking_id && (
                          <Link href={`/bookings/${hold.converted_to_booking_id}`}>
                            <Button variant="outline" size="sm">
                              View Booking
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        )}
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
