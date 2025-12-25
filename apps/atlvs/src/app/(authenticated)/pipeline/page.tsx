'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, BarChart3, Settings, DollarSign, Users, TrendingUp, MoreVertical } from 'lucide-react';
import { usePipelineDeals, useMoveDeals } from '@/hooks/usePipeline';
import {
  Body,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H3,
  Label,
  MainContent,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

const STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-ink-100 border-ink-300' },
  { id: 'qualified', name: 'Qualified', color: 'bg-info-50 border-info-300' },
  { id: 'proposal', name: 'Proposal', color: 'bg-warning-50 border-warning-300' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-violet-50 border-violet-300' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-success-50 border-success-300' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-error-50 border-error-300' },
];

export default function PipelinePage() {
  const router = useRouter();
  const [showClosedStages, setShowClosedStages] = useState(false);
  const { data, isLoading, error } = usePipelineDeals();
  const moveDeal = useMoveDeals();

  const deals = data?.deals || [];
  const summary = data?.summary || { total_deals: 0, total_value: 0, weighted_value: 0 };

  const visibleStages = showClosedStages 
    ? STAGES 
    : STAGES.filter(s => !s.id.startsWith('closed_'));

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const getStageValue = (stageId: string) => {
    return getDealsByStage(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    if (dealId) {
      moveDeal.mutate({ dealId, stage: stageId });
    }
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Sales Pipeline" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={4} gap={4}>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Sales Pipeline" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load pipeline data"
              description="There was an error loading your sales pipeline."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <Box className="h-full flex flex-col">
      <EnterprisePageHeader
        title="Sales Pipeline"
        subtitle="Manage and track your deals through the sales process"
        primaryAction={{ label: 'New Deal', onClick: () => router.push('/pipeline/deals/new') }}
      />
      <Box className="px-6 py-4 border-b border-border">
        <Stack direction="horizontal" gap={3} className="mb-4 justify-end">
          <Link href="/pipeline/analytics">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href="/pipeline/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </Stack>

        <Grid cols={4} gap={4}>
          <Card className="p-4">
            <Stack direction="horizontal" gap={2} className="items-center mb-2">
              <Users className="h-5 w-5 text-primary" />
              <Text size="sm" className="text-muted-foreground">Total Deals</Text>
            </Stack>
            <Body className="font-weight-bold">{summary.total_deals}</Body>
          </Card>
          <Card className="p-4">
            <Stack direction="horizontal" gap={2} className="items-center mb-2">
              <DollarSign className="h-5 w-5 text-success" />
              <Text size="sm" className="text-muted-foreground">Pipeline Value</Text>
            </Stack>
            <Body className="font-weight-bold">{formatCurrency(summary.total_value)}</Body>
          </Card>
          <Card className="p-4">
            <Stack direction="horizontal" gap={2} className="items-center mb-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              <Text size="sm" className="text-muted-foreground">Weighted Value</Text>
            </Stack>
            <Body className="font-weight-bold">{formatCurrency(summary.weighted_value)}</Body>
          </Card>
          <Card className="p-4 flex items-center">
            <Label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={showClosedStages}
                onChange={(e) => setShowClosedStages(e.target.checked)}
              />
              <Text size="sm" className="text-muted-foreground">Show closed stages</Text>
            </Label>
          </Card>
        </Grid>
      </Box>

      <Box className="flex-1 overflow-x-auto p-6">
        <Stack direction="horizontal" gap={4} className="h-full min-w-max">
          {visibleStages.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const stageValue = getStageValue(stage.id);

            return (
              <Box
                key={stage.id}
                className={`w-80 flex-shrink-0 rounded-card border-2 ${stage.color} flex flex-col`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <Box className="p-4 border-b border-border/50">
                  <Stack direction="horizontal" className="justify-between mb-2">
                    <H3>{stage.name}</H3>
                    <Text size="xs" className="bg-background px-2 py-1 rounded-avatar">
                      {stageDeals.length}
                    </Text>
                  </Stack>
                  <Body size="sm" className="text-muted-foreground">
                    {formatCurrency(stageValue)}
                  </Body>
                </Box>

                <Box className="flex-1 overflow-y-auto p-3">
                  <Stack gap={3}>
                    {stageDeals.length === 0 ? (
                      <Box className="text-center py-8 text-muted-foreground">
                        <Text size="sm">No deals in this stage</Text>
                      </Box>
                    ) : (
                      stageDeals.map((deal) => (
                        <Card
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal.id)}
                          className="p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                        >
                          <Stack direction="horizontal" className="justify-between mb-2">
                            <Link
                              href={`/pipeline/deals/${deal.id}`}
                              className="font-weight-medium hover:text-primary"
                            >
                              <Text size="sm">{deal.name}</Text>
                            </Link>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </Stack>
                          {deal.client && (
                            <Body size="xs" className="text-muted-foreground mb-2">
                              {(deal.client as { name?: string }).name}
                            </Body>
                          )}
                          <Stack direction="horizontal" className="justify-between">
                            <Text size="sm" className="font-weight-semibold">
                              {formatCurrency(deal.value || 0)}
                            </Text>
                            <Text size="xs" className="text-muted-foreground">
                              {deal.probability}%
                            </Text>
                          </Stack>
                        </Card>
                      ))
                    )}
                  </Stack>
                </Box>

                <Box className="p-3 border-t border-border/50">
                  <Link
                    href={`/pipeline/deals/new?stage=${stage.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-button transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <Text size="sm">Add Deal</Text>
                  </Link>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}
