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
  H2,
  MainContent,
  Modal,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Trash2, User, Mail, Phone, MoreVertical, CheckCircle, XCircle, Clock } from 'lucide-react';
import { usePipelineDeal, useDeleteDeal, useMoveDeals } from '@/hooks/usePipeline';

const STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-ink-100 text-ink-800' },
  { id: 'qualified', name: 'Qualified', color: 'bg-info-100 text-info-800' },
  { id: 'proposal', name: 'Proposal', color: 'bg-warning-100 text-warning-800' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-violet-100 text-violet-800' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-success-100 text-success-800' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-error-100 text-error-800' },
];

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params?.id as string;

  const { data, isLoading, error } = usePipelineDeal(dealId);
  const deleteDeal = useDeleteDeal();
  const moveDeal = useMoveDeals();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStageMenu, setShowStageMenu] = useState(false);

  const deal = data?.deal;
  const activities = data?.activities || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStageInfo = (stageId: string) => {
    return STAGES.find(s => s.id === stageId) || STAGES[0];
  };

  const handleStageChange = async (newStage: string) => {
    setShowStageMenu(false);
    await moveDeal.mutateAsync({ dealId, stage: newStage });
  };

  const handleDelete = async () => {
    await deleteDeal.mutateAsync(dealId);
    router.push('/pipeline');
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Deal Details" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={3} gap={6}>
              <Box className="col-span-2"><Skeleton className="h-64" /></Box>
              <Skeleton className="h-64" />
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error || !deal) {
    return (
      <>
        <EnterprisePageHeader title="Deal Details" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Deal not found"
              description="The deal you're looking for doesn't exist or has been removed."
              action={{ label: 'Back to Pipeline', onClick: () => router.push('/pipeline') }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  const stageInfo = getStageInfo(deal.stage);

  return (
    <>
      <EnterprisePageHeader
        title={deal.name}
        subtitle={`${deal.deal_number} • Created ${formatDate(deal.created_at)}`}
      />
      <Box className="px-6 py-3 border-b border-border flex items-center justify-between">
        <Badge className={stageInfo.color}>{stageInfo.name}</Badge>
        <Stack direction="horizontal" gap={2}>
          <Box className="relative">
            <Button variant="outline" onClick={() => setShowStageMenu(!showStageMenu)}>
              Move Stage
              <MoreVertical className="h-4 w-4 ml-2" />
            </Button>
            {showStageMenu && (
              <Box className="absolute right-0 mt-2 w-48 bg-background border-2 border-border rounded-card shadow-lg z-10">
                {STAGES.map((stage) => (
                  <Button
                    key={stage.id}
                    variant="ghost"
                    onClick={() => handleStageChange(stage.id)}
                    disabled={stage.id === deal.stage}
                    className="w-full justify-start"
                  >
                    {stage.name}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
          <Link href={`/pipeline/deals/${dealId}/edit`}>
            <Button variant="outline">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </Stack>
      </Box>
      <MainContent padding="lg">
        <Container>
          <Grid cols={3} gap={6}>
            <Stack gap={6} className="col-span-2">
              <Card className="p-6">
                <H2 className="mb-4">Deal Value</H2>
                <Grid cols={3} gap={4}>
                  <Stack gap={1}>
                    <Body size="xs" className="text-muted-foreground">Value</Body>
                    <Body className="font-weight-bold">{formatCurrency(deal.value || 0)}</Body>
                  </Stack>
                  <Stack gap={1}>
                    <Body size="xs" className="text-muted-foreground">Probability</Body>
                    <Body className="font-weight-bold">{deal.probability || 0}%</Body>
                  </Stack>
                  <Stack gap={1}>
                    <Body size="xs" className="text-muted-foreground">Weighted Value</Body>
                    <Body className="font-weight-bold text-primary">
                      {formatCurrency((deal.value || 0) * (deal.probability || 0) / 100)}
                    </Body>
                  </Stack>
                </Grid>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">Contact Information</H2>
                <Stack gap={3}>
                  {deal.contact_name && (
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <Text>{deal.contact_name}</Text>
                    </Stack>
                  )}
                  {deal.contact_email && (
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <Link href={`mailto:${deal.contact_email}`} className="text-primary hover:underline">
                        <Text>{deal.contact_email}</Text>
                      </Link>
                    </Stack>
                  )}
                  {deal.contact_phone && (
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <Link href={`tel:${deal.contact_phone}`} className="text-primary hover:underline">
                        <Text>{deal.contact_phone}</Text>
                      </Link>
                    </Stack>
                  )}
                  {!deal.contact_name && !deal.contact_email && !deal.contact_phone && (
                    <Body size="sm" className="text-muted-foreground">No contact information</Body>
                  )}
                </Stack>
              </Card>

              {deal.notes && (
                <Card className="p-6">
                  <H2 className="mb-4">Notes</H2>
                  <Body className="whitespace-pre-wrap">{deal.notes}</Body>
                </Card>
              )}

              <Card className="p-6">
                <H2 className="mb-4">Activity History</H2>
                {activities.length === 0 ? (
                  <Body size="sm" className="text-muted-foreground">No activity yet</Body>
                ) : (
                  <Stack gap={4}>
                    {activities.map((activity: { id: string; activity_type: string; description: string; created_at: string }) => (
                      <Stack key={activity.id} direction="horizontal" gap={3} className="items-start">
                        <Box className="p-2 bg-muted rounded-avatar">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </Box>
                        <Stack gap={0}>
                          <Body size="sm">{activity.description}</Body>
                          <Body size="xs" className="text-muted-foreground">
                            {formatDate(activity.created_at)}
                          </Body>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Card>
            </Stack>

            <Stack gap={6}>
              <Card className="p-6">
                <H2 className="mb-4">Details</H2>
                <Stack gap={4}>
                  {deal.expected_close_date && (
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">Expected Close</Text>
                      <Text size="sm" className="font-weight-medium">{formatDate(deal.expected_close_date)}</Text>
                    </Stack>
                  )}
                  {deal.source && (
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">Source</Text>
                      <Text size="sm" className="font-weight-medium capitalize">{deal.source.replace('_', ' ')}</Text>
                    </Stack>
                  )}
                  {deal.assignee && (
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">Assigned To</Text>
                      <Text size="sm" className="font-weight-medium">{deal.assignee.full_name}</Text>
                    </Stack>
                  )}
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Last Updated</Text>
                    <Text size="sm" className="font-weight-medium">{formatDate(deal.updated_at)}</Text>
                  </Stack>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">Quick Actions</H2>
                <Stack gap={2}>
                  <Button
                    onClick={() => handleStageChange('closed_won')}
                    disabled={deal.stage === 'closed_won'}
                    className="w-full bg-success hover:bg-success/90"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Won
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStageChange('closed_lost')}
                    disabled={deal.stage === 'closed_lost'}
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark as Lost
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid>

          <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Deal">
            <Body size="sm" className="text-muted-foreground mb-4">
              Are you sure you want to delete &quot;{deal.name}&quot;? This action cannot be undone.
            </Body>
            <Stack direction="horizontal" gap={3} className="justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteDeal.isPending}>
                {deleteDeal.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </Stack>
          </Modal>
        </Container>
      </MainContent>
    </>
  );
}
