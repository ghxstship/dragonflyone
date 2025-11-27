'use client';

import { useState } from 'react';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import { useRevenueRecognition } from '@/hooks/useRevenueRecognition';
import { Section, H1, H2, H3, Body, Label, Button, Card, CardHeader, CardBody, StatCard, Container, Alert, Stack, Grid, Badge, LoadingSpinner } from '@ghxstship/ui';

export default function RevenueRecognitionPage() {
  const {
    rules,
    schedule,
    loading,
    error,
    createRule,
    processRecognition,
    getSchedule,
    getUpcomingRecognitions,
    getAnalytics,
    refresh
  } = useRevenueRecognition();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const analytics = getAnalytics();
  const upcomingRecognitions = getUpcomingRecognitions();

  const handleProcessRecognition = async (scheduleId: string) => {
    try {
      setProcessing(true);
      await processRecognition(scheduleId);
      await refresh();
    } catch (err) {
      console.error('Failed to process recognition:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleViewSchedule = async (ruleId: string) => {
    setSelectedRule(ruleId);
    await getSchedule(ruleId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-ink-950 text-ink-50">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading revenue recognition data..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-ink-950 text-ink-50">
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          {/* Header */}
          <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b border-ink-800 pb-8">
            <Stack gap={2}>
              <H1>Revenue Recognition</H1>
              <Body className="text-ink-600">
                Manage revenue recognition rules and schedules
              </Body>
            </Stack>
            <Button variant="solid" onClick={() => setShowCreateForm(true)}>
              Create Rule
            </Button>
          </Stack>

        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Analytics Dashboard */}
        <Grid cols={4} gap={6}>
          <StatCard
            label="Total Revenue"
            value={formatCurrency(analytics.totalRevenue)}
            trend={analytics.recognitionRate > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            label="Recognized Revenue"
            value={formatCurrency(analytics.recognizedRevenue)}
            trendValue={`${analytics.recognitionRate.toFixed(1)}% of total`}
          />
          <StatCard
            label="Pending Revenue"
            value={formatCurrency(analytics.pendingRevenue)}
            trend="neutral"
          />
          <StatCard
            label="Deferred Revenue"
            value={formatCurrency(analytics.deferredRevenue)}
            trend="neutral"
          />
        </Grid>

        {/* Upcoming Recognitions */}
        {upcomingRecognitions.length > 0 && (
          <Card>
            <CardHeader>
              <H2>Upcoming Recognitions (Next 30 Days)</H2>
            </CardHeader>
            <CardBody>
              <Stack gap={4}>
                {upcomingRecognitions.map((entry) => (
                  <Stack 
                    key={entry.id}
                    direction="horizontal"
                    className="justify-between items-center p-4 border border-grey-200 rounded"
                  >
                    <Stack gap={1}>
                      <Label className="font-semibold">{entry.description}</Label>
                      <Body className="text-sm text-grey-500">
                        {formatDate(entry.recognition_date)}
                      </Body>
                    </Stack>
                    <Stack gap={2} className="items-end">
                      <Body className="font-semibold">{formatCurrency(entry.amount)}</Body>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleProcessRecognition(entry.id)}
                        disabled={processing}
                      >
                        {processing ? 'Processing...' : 'Recognize Now'}
                      </Button>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </CardBody>
          </Card>
        )}

        {/* Revenue Recognition Rules */}
        <Card>
          <CardHeader>
            <H2>Revenue Recognition Rules</H2>
          </CardHeader>
          <CardBody>
            {rules.length === 0 ? (
              <Stack gap={4} className="items-center py-12">
                <Body className="text-grey-500">No revenue recognition rules found</Body>
                <Button 
                  variant="solid" 
                  onClick={() => setShowCreateForm(true)}
                >
                  Create First Rule
                </Button>
              </Stack>
            ) : (
              <Stack gap={4}>
              {rules.map((rule) => (
                <Stack
                  key={rule.id}
                  className="p-6 border-2 border-grey-200 rounded-lg transition-colors hover:border-grey-400 cursor-pointer"
                  onClick={() => handleViewSchedule(rule.id)}
                  gap={4}
                >
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={2} className="flex-1">
                      <H3>
                        {rule.projects?.name || 'Project'}
                      </H3>
                      <Body className="text-grey-500">
                        {rule.projects?.client_name || 'Client'}
                      </Body>
                      
                      <Stack direction="horizontal" gap={6} className="flex-wrap mt-4">
                        <Stack gap={1}>
                          <Label className="text-xs text-grey-500">Type</Label>
                          <Body className="font-semibold capitalize">
                            {rule.revenue_type.replace('_', ' ')}
                          </Body>
                        </Stack>
                        <Stack gap={1}>
                          <Label className="text-xs text-grey-500">Total Amount</Label>
                          <Body className="font-semibold">
                            {formatCurrency(rule.total_amount)}
                          </Body>
                        </Stack>
                        <Stack gap={1}>
                          <Label className="text-xs text-grey-500">Start Date</Label>
                          <Body className="font-semibold">
                            {formatDate(rule.recognition_start_date)}
                          </Body>
                        </Stack>
                        {rule.recognition_end_date && (
                          <Stack gap={1}>
                            <Label className="text-xs text-grey-500">End Date</Label>
                            <Body className="font-semibold">
                              {formatDate(rule.recognition_end_date)}
                            </Body>
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                    
                    <Badge variant={rule.status === 'active' ? 'ghost' : 'outline'} size="sm">
                      {rule.status}
                    </Badge>
                  </Stack>

                  {/* Milestones for milestone-based rules */}
                  {rule.revenue_type === 'milestone' && rule.milestones && rule.milestones.length > 0 && (
                    <Stack gap={2} className="pt-4 border-t border-grey-200">
                      <Label className="text-sm font-semibold">
                        Milestones
                      </Label>
                      <Stack direction="horizontal" gap={3} className="flex-wrap">
                        {rule.milestones.map((milestone, idx) => (
                          <Badge
                            key={idx}
                            variant={milestone.status === 'completed' ? 'solid' : 'ghost'}
                            size="md"
                            className="px-4 py-2"
                          >
                            {milestone.name} ({milestone.percentage}%)
                          </Badge>
                        ))}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              ))}
            </Stack>
          )}
          </CardBody>
        </Card>

        {/* Schedule View Modal (simplified inline) */}
        {selectedRule && schedule.length > 0 && (
          <Card>
            <CardHeader>
              <Stack direction="horizontal" className="justify-between items-center">
                <H2>Recognition Schedule</H2>
                <Button variant="outline" size="sm" onClick={() => setSelectedRule(null)}>
                  Close
                </Button>
              </Stack>
            </CardHeader>
            <CardBody>
              <Stack gap={3}>
                {schedule
                  .filter(entry => entry.rule_id === selectedRule)
                  .sort((a, b) => new Date(a.recognition_date).getTime() - new Date(b.recognition_date).getTime())
                  .map((entry) => (
                    <Stack
                      key={entry.id}
                      direction="horizontal"
                      className={`justify-between items-center p-4 border rounded ${entry.status === 'recognized' ? 'bg-grey-100 border-grey-300' : 'bg-white border-grey-200'}`}
                    >
                      <Stack gap={1}>
                        <Body className="font-semibold">{entry.description}</Body>
                        <Label className="text-sm text-grey-500">
                          {formatDate(entry.recognition_date)}
                        </Label>
                      </Stack>
                      <Stack gap={2} className="items-end">
                        <Body className="font-bold">{formatCurrency(entry.amount)}</Body>
                        <Badge variant={entry.status === 'recognized' ? 'solid' : 'ghost'} size="sm">
                          {entry.status}
                        </Badge>
                      </Stack>
                    </Stack>
                  ))}
              </Stack>
            </CardBody>
          </Card>
        )}
        </Stack>
      </Container>
    </Section>
  );
}
