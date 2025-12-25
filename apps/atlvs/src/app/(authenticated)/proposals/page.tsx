'use client';

import {
  Badge,
  Body,
  Box,
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
import { Search, FileText, Eye, Send, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: FileText },
  sent: { label: 'Sent', color: 'bg-primary/20 text-primary', icon: Send },
  viewed: { label: 'Viewed', color: 'bg-warning/20 text-warning', icon: Eye },
  accepted: { label: 'Accepted', color: 'bg-success/20 text-success', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-destructive/20 text-destructive', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-muted text-muted-foreground', icon: Clock },
};

export default function ProposalsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useProposals({ status: statusFilter || undefined });

  const proposals = data?.proposals || [];

  const filteredProposals = searchQuery
    ? proposals.filter(
        (p: { title?: string; client_name?: string; proposal_number?: string }) =>
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.proposal_number?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : proposals;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStats = () => {
    const stats = { total: proposals.length, draft: 0, sent: 0, accepted: 0, declined: 0, totalValue: 0 };
    proposals.forEach((p: { status: string; total_amount?: number }) => {
      if (p.status === 'draft') stats.draft++;
      else if (p.status === 'sent' || p.status === 'viewed') stats.sent++;
      else if (p.status === 'accepted') stats.accepted++;
      else if (p.status === 'declined') stats.declined++;
      if (p.total_amount) stats.totalValue += p.total_amount;
    });
    return stats;
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Proposals" subtitle="Loading..." />
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
        <EnterprisePageHeader title="Proposals" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load proposals"
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
        title="Proposals"
        subtitle="Create and manage client proposals"
        primaryAction={{ label: 'New Proposal', onClick: () => router.push('/proposals/new') }}
        secondaryActions={[
          { label: 'Templates', onClick: () => router.push('/proposals/templates') }
        ]}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={4} gap={4}>
              <Card className="p-4">
                <Body size="xs" className="text-muted-foreground mb-1">Total Proposals</Body>
                <Body className="font-weight-bold">{stats.total}</Body>
              </Card>
              <Card className="p-4 border-muted">
                <Body size="xs" className="text-muted-foreground mb-1">Drafts</Body>
                <Body className="font-weight-bold text-muted-foreground">{stats.draft}</Body>
              </Card>
              <Card className="p-4 border-primary/50">
                <Body size="xs" className="text-muted-foreground mb-1">Sent/Pending</Body>
                <Body className="font-weight-bold text-primary">{stats.sent}</Body>
              </Card>
              <Card className="p-4 border-success/50">
                <Body size="xs" className="text-muted-foreground mb-1">Accepted</Body>
                <Body className="font-weight-bold text-success">{stats.accepted}</Body>
              </Card>
            </Grid>

            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              <Box className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search proposals..."
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
            </Stack>

            {filteredProposals.length === 0 ? (
              <EmptyState
                title="No proposals found"
                description={searchQuery ? 'Try adjusting your search' : 'Create your first proposal'}
                icon={<FileText className="h-12 w-12" />}
                action={{ label: 'New Proposal', onClick: () => router.push('/proposals/new') }}
              />
            ) : (
              <Stack gap={4}>
                {filteredProposals.map((proposal) => {
                  const statusConfig = STATUS_CONFIG[proposal.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
                  const StatusIcon = statusConfig.icon;
                  const isExpiringSoon = proposal.valid_until && 
                    new Date(proposal.valid_until) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                  return (
                    <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                      <Card className="p-6 hover:border-primary transition-colors">
                        <Stack direction="horizontal" className="justify-between items-start">
                          <Box className="flex-1">
                            <Stack direction="horizontal" gap={3} className="items-center mb-2">
                              <Text size="xs" className="text-muted-foreground font-mono">
                                {proposal.proposal_number}
                              </Text>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                              {isExpiringSoon && proposal.status !== 'accepted' && proposal.status !== 'declined' && (
                                <Badge className="bg-warning/20 text-warning">Expires Soon</Badge>
                              )}
                            </Stack>
                            <H3 className="mb-1">{proposal.name || 'Untitled Proposal'}</H3>
                            <Body size="sm" className="text-muted-foreground">
                              {proposal.contact ? `${proposal.contact.first_name} ${proposal.contact.last_name}` : 'No client'} 
                              {proposal.contact?.email && <Text size="xs" className="ml-2">({proposal.contact.email})</Text>}
                            </Body>
                          </Box>
                          <Box className="text-right">
                            <Body className="font-weight-bold">
                              {formatCurrency(proposal.total || 0)}
                            </Body>
                            <Body size="xs" className="text-muted-foreground mt-1">
                              {proposal.viewed_at ? (
                                <>Viewed {new Date(proposal.viewed_at).toLocaleDateString()}</>
                              ) : proposal.sent_at ? (
                                <>Sent {new Date(proposal.sent_at).toLocaleDateString()}</>
                              ) : (
                                <>Created {new Date(proposal.created_at).toLocaleDateString()}</>
                              )}
                            </Body>
                          </Box>
                        </Stack>
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
