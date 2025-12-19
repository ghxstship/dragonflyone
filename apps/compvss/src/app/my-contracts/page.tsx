'use client';

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
  FileText,
  Calendar,
  DollarSign,
  Download,
  Eye,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';

import {
  useMyContracts,
  type Contract,
} from '../../hooks/useMyContracts';

export default function MyContractsPage() {
  const { data: contracts = [], isLoading, error } = useMyContracts();

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <Stack gap={8} className="flex min-h-[60vh] items-center justify-center">
          <Stack gap={4} className="items-center">
            <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
            <Body>Loading contracts...</Body>
          </Stack>
        </Stack>
      </CompvssAppLayout>
    );
  }

  if (error) {
    return (
      <CompvssAppLayout>
        <Stack gap={8} className="p-6">
          <Card className="p-6 border-destructive bg-destructive/10">
            <Stack gap={4} className="items-center text-center">
              <Body className="text-destructive font-display">Failed to load contracts</Body>
              <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </Stack>
          </Card>
        </Stack>
      </CompvssAppLayout>
    );
  }

  const activeCount = contracts.filter(c => c.status === 'active').length;
  const pendingCount = contracts.filter(c => c.status === 'pending_signature').length;
  const totalActiveValue = contracts
    .filter(c => c.status === 'active')
    .reduce((acc, c) => acc + c.value, 0);

  const getStatusBadge = (status: Contract['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="info">Draft</Badge>;
      case 'pending_signature':
        return <Badge variant="warning">Pending Signature</Badge>;
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'expired':
        return <Badge variant="error">Expired</Badge>;
    }
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Vendor Portal"
          title="My Contracts"
          description="View and manage your contracts"
          colorScheme="on-dark"
        />

        <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Active Contracts"
            value={activeCount.toString()}
            icon={<CheckCircle size={20} />}
            inverted
          />
          <StatCard
            label="Pending Signature"
            value={pendingCount.toString()}
            icon={<Clock size={20} />}
            inverted
          />
          <StatCard
            label="Active Value"
            value={`$${totalActiveValue.toLocaleString()}`}
            icon={<DollarSign size={20} />}
            inverted
          />
        </Grid>

        <Stack gap={4}>
          {contracts.map(contract => (
            <Card key={contract.id} inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Stack gap={2}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <H3 className="text-white">{contract.production}</H3>
                        {getStatusBadge(contract.status)}
                      </Stack>
                      <Body className="text-on-dark-muted">{contract.client}</Body>
                    </Stack>
                    <Body className="text-on-dark-muted">{contract.id}</Body>
                  </Stack>

                  <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">Contract Type</Body>
                      <Body className="text-white">{contract.type}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">Start Date</Body>
                      <Stack direction="horizontal" gap={1} className="items-center">
                        <Calendar size={14} className="text-on-dark-muted" />
                        <Body className="text-white">
                          {new Date(contract.startDate).toLocaleDateString()}
                        </Body>
                      </Stack>
                    </Stack>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">End Date</Body>
                      <Stack direction="horizontal" gap={1} className="items-center">
                        <Calendar size={14} className="text-on-dark-muted" />
                        <Body className="text-white">
                          {new Date(contract.endDate).toLocaleDateString()}
                        </Body>
                      </Stack>
                    </Stack>
                    <Stack gap={1}>
                      <Body size="sm" className=" text-on-dark-muted">Contract Value</Body>
                      <Stack direction="horizontal" gap={1} className="items-center">
                        <DollarSign size={14} className="text-on-dark-muted" />
                        <Body className="text-white">${contract.value.toLocaleString()}</Body>
                      </Stack>
                    </Stack>
                  </Grid>

                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outline" size="sm">
                      <Eye size={14} className="mr-1" />
                      View Contract
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download size={14} className="mr-1" />
                      Download PDF
                    </Button>
                    {contract.status === 'pending_signature' && (
                      <Button variant="solid" size="sm">
                        <FileText size={14} className="mr-1" />
                        Sign Contract
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Stack>
      </Stack>
    </CompvssAppLayout>
  );
}
