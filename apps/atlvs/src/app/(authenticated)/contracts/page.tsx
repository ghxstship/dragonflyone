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
import { Search, FileText, Clock, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  pending_signatures: { label: 'Pending Signatures', color: 'bg-warning/20 text-warning' },
  partially_signed: { label: 'Partially Signed', color: 'bg-primary/20 text-primary' },
  active: { label: 'Active', color: 'bg-success/20 text-success' },
  completed: { label: 'Completed', color: 'bg-success/20 text-success' },
  expired: { label: 'Expired', color: 'bg-muted text-muted-foreground' },
  terminated: { label: 'Terminated', color: 'bg-destructive/20 text-destructive' },
  voided: { label: 'Voided', color: 'bg-destructive/20 text-destructive' },
};

const TYPE_CONFIG = {
  service: 'Service Agreement',
  product: 'Product Agreement',
  nda: 'NDA',
  employment: 'Employment',
  partnership: 'Partnership',
  licensing: 'Licensing',
};

export default function ContractsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data: contracts, isLoading, error } = useContracts();

  const filteredContracts = (contracts || []).filter((contract) => {
    const matchesSearch = !searchQuery || 
      contract.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || contract.status === statusFilter;
    const matchesType = !typeFilter || contract.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStats = () => {
    const all = contracts || [];
    return {
      total: all.length,
      active: all.filter((c) => c.status === 'active' || c.status === 'completed').length,
      pending: all.filter((c) => c.status === 'draft' || c.status === 'pending_signatures').length,
      expiring: all.filter((c) => {
        if (c.status !== 'active' || !c.end_date) return false;
        const daysUntil = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 30 && daysUntil > 0;
      }).length,
      totalValue: all.reduce((sum, c) => sum + (c.value || 0), 0),
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Contracts" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Grid cols={5} gap={4}>
                <Skeleton className="h-24" />
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
        <EnterprisePageHeader title="Contracts" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load contracts"
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
        title="Contracts"
        subtitle="Manage contracts and electronic signatures"
        primaryAction={{ label: 'New Contract', onClick: () => router.push('/contracts/new') }}
        secondaryActions={[
          { label: 'Clause Library', onClick: () => router.push('/contracts/clauses') }
        ]}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={5} gap={4}>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Total</Text>
                </Stack>
                <Body className="font-weight-bold">{stats.total}</Body>
              </Card>
              <Card className="p-4 border-success/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <Text size="sm" className="text-muted-foreground">Active</Text>
                </Stack>
                <Body className="font-weight-bold text-success">{stats.active}</Body>
              </Card>
              <Card className="p-4 border-warning/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Clock className="h-5 w-5 text-warning" />
                  <Text size="sm" className="text-muted-foreground">Pending</Text>
                </Stack>
                <Body className="font-weight-bold text-warning">{stats.pending}</Body>
              </Card>
              <Card className="p-4 border-destructive/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <Text size="sm" className="text-muted-foreground">Expiring</Text>
                </Stack>
                <Body className="font-weight-bold text-destructive">{stats.expiring}</Body>
              </Card>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Total Value</Text>
                </Stack>
                <Body className="font-weight-bold">{formatCurrency(stats.totalValue)}</Body>
              </Card>
            </Grid>

            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              <Box className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search contracts..."
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
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  {Object.entries(TYPE_CONFIG).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Stack>
            </Stack>

            {filteredContracts.length === 0 ? (
              <EmptyState
                title="No contracts found"
                description={searchQuery ? 'Try adjusting your search' : 'Create your first contract'}
                icon={<FileText className="h-12 w-12" />}
                action={{ label: 'New Contract', onClick: () => router.push('/contracts/new') }}
              />
            ) : (
              <Stack gap={4}>
                {filteredContracts.map((contract) => {
                  const statusConfig = STATUS_CONFIG[contract.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
                  const typeLabel = TYPE_CONFIG[contract.type as keyof typeof TYPE_CONFIG] || contract.type;
                  const isExpiring = contract.end_date && contract.status === 'active' &&
                    Math.ceil((new Date(contract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 30;

                  return (
                    <Link key={contract.id} href={`/contracts/${contract.id}`}>
                      <Card className="p-6 hover:border-primary transition-colors">
                        <Stack direction="horizontal" className="justify-between items-start">
                          <Box className="flex-1">
                            <Stack direction="horizontal" gap={3} className="items-center mb-2">
                              <H3>{contract.title}</H3>
                              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                              {isExpiring && (
                                <Badge className="bg-destructive/20 text-destructive">Expiring Soon</Badge>
                              )}
                            </Stack>
                            <Body size="sm" className="text-muted-foreground">
                              {typeLabel} • {contract.vendor?.name || 'No vendor'}
                            </Body>
                            <Body size="xs" className="text-muted-foreground mt-1">
                              {contract.start_date && `Started ${new Date(contract.start_date).toLocaleDateString()}`}
                              {contract.end_date && ` • Ends ${new Date(contract.end_date).toLocaleDateString()}`}
                            </Body>
                          </Box>
                          <Box className="text-right">
                            <Body className="font-weight-bold">
                              {formatCurrency(contract.value || 0)}
                            </Body>
                            {contract.auto_renew && (
                              <Body size="xs" className="text-success mt-1">Auto-renew enabled</Body>
                            )}
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
