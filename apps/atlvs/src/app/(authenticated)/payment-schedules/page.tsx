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
  ProgressBar,
  Select,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Calendar, DollarSign, Clock, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-success/20 text-success' },
  pending: { label: 'Pending', color: 'bg-warning/20 text-warning' },
  completed: { label: 'Completed', color: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive' },
};

export default function PaymentSchedulesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = usePaymentSchedules();

  const allSchedules = data || [];
  const schedules = statusFilter
    ? allSchedules.filter((s) => s.status === statusFilter)
    : allSchedules;

  const filteredSchedules = searchQuery
    ? schedules.filter(
        (s) =>
          s.booking?.event_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : schedules;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgress = (schedule: { total_amount: number; amount_paid: number }) => {
    if (!schedule.total_amount) return 0;
    return Math.round((schedule.amount_paid / schedule.total_amount) * 100);
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Payment Schedules" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
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
        <EnterprisePageHeader title="Payment Schedules" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load payment schedules"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Payment Schedules"
        subtitle="Manage deposit and milestone payment schedules"
        primaryAction={{ label: 'Create Schedule', onClick: () => router.push('/payment-schedules/new') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              <Box className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by event or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Stack>
              <Link href="/payment-schedules/upcoming">
                <Button variant="outline" className="text-warning border-warning">
                  <Clock className="h-4 w-4 mr-1" /> Upcoming
                </Button>
              </Link>
              <Link href="/payment-schedules/overdue">
                <Button variant="outline" className="text-destructive border-destructive">
                  <AlertTriangle className="h-4 w-4 mr-1" /> Overdue
                </Button>
              </Link>
            </Stack>

            <Grid cols={4} gap={4}>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Total Schedules</Text>
                </Stack>
                <Body className="font-weight-bold">{schedules.length}</Body>
              </Card>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  <Text size="sm" className="text-muted-foreground">Total Expected</Text>
                </Stack>
                <Body className="font-weight-bold text-success">
                  {formatCurrency(schedules.reduce((sum, s) => sum + (s.total_amount || 0), 0))}
                </Body>
              </Card>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Total Collected</Text>
                </Stack>
                <Body className="font-weight-bold text-primary">
                  {formatCurrency(schedules.reduce((sum, s) => sum + (s.amount_paid || 0), 0))}
                </Body>
              </Card>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <Text size="sm" className="text-muted-foreground">Outstanding</Text>
                </Stack>
                <Body className="font-weight-bold text-warning">
                  {formatCurrency(schedules.reduce((sum, s) => sum + ((s.total_amount || 0) - (s.amount_paid || 0)), 0))}
                </Body>
              </Card>
            </Grid>

            {filteredSchedules.length === 0 ? (
              <EmptyState
                title="No payment schedules found"
                description={searchQuery ? 'Try adjusting your search' : 'Create your first payment schedule'}
                icon={<Calendar className="h-12 w-12" />}
                action={{ label: 'Create Schedule', onClick: () => router.push('/payment-schedules/new') }}
              />
            ) : (
              <Stack gap={4}>
                {filteredSchedules.map((schedule) => {
                  const statusConfig = STATUS_CONFIG[schedule.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const progress = getProgress(schedule);
                  const nextMilestone = schedule.milestones?.find((m) => m.status === 'pending');
                  const milestoneName = nextMilestone?.milestone_name;

                  return (
                    <Link key={schedule.id} href={`/payment-schedules/${schedule.id}`}>
                      <Card className="p-6 hover:border-primary transition-colors">
                        <Stack direction="horizontal" className="justify-between items-start mb-4">
                          <Box>
                            <Stack direction="horizontal" gap={3} className="items-center">
                              <H3>{schedule.booking?.event_name || 'Untitled Event'}</H3>
                              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                            </Stack>
                            <Body size="sm" className="text-muted-foreground mt-1">
                              {schedule.booking?.contact?.first_name ? `${schedule.booking.contact.first_name} ${schedule.booking.contact.last_name}` : 'No client'} - {schedule.booking?.event_date ? new Date(schedule.booking.event_date).toLocaleDateString() : 'No date'}
                            </Body>
                          </Box>
                          <Box className="text-right">
                            <Body className="font-weight-bold">{formatCurrency(schedule.total_amount)}</Body>
                            <Body size="xs" className="text-muted-foreground">{formatCurrency(schedule.amount_paid)} collected</Body>
                          </Box>
                        </Stack>

                        <Box className="mb-4">
                          <Stack direction="horizontal" className="justify-between mb-1">
                            <Text size="xs" className="text-muted-foreground">Payment Progress</Text>
                            <Text size="xs" className="font-weight-medium">{progress}%</Text>
                          </Stack>
                          <ProgressBar value={progress} max={100} className={progress >= 100 ? 'bg-success' : ''} />
                        </Box>

                        {nextMilestone && (
                          <Stack direction="horizontal" className="justify-between pt-4 border-t border-border">
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <Clock className="h-4 w-4 text-warning" />
                              <Text size="sm" className="text-muted-foreground">Next: {milestoneName}</Text>
                            </Stack>
                            <Box className="text-right">
                              <Text size="sm" className="font-weight-medium">{formatCurrency(nextMilestone.amount)}</Text>
                              <Text size="xs" className="text-muted-foreground ml-2">due {new Date(nextMilestone.due_date).toLocaleDateString()}</Text>
                            </Box>
                          </Stack>
                        )}
                      </Card>
                    </Link>
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
