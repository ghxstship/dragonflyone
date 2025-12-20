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
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
} from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';

import {
  useMyCredentials,
  type Credential,
} from '../../../hooks/useMyCredentials';

export default function MyCredentialsPage() {
  const { data: credentials = [], isLoading, error } = useMyCredentials();

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <Stack gap={8} className="flex min-h-[60vh] items-center justify-center">
          <Stack gap={4} className="items-center">
            <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
            <Body>Loading credentials...</Body>
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
              <Body className="text-destructive font-display">Failed to load credentials</Body>
              <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </Stack>
          </Card>
        </Stack>
      </CompvssAppLayout>
    );
  }

  const activeCount = credentials.filter(c => c.status === 'active').length;
  const expiringCount = credentials.filter(c => c.status === 'expiring').length;
  const expiredCount = credentials.filter(c => c.status === 'expired').length;
  const pendingCount = credentials.filter(c => c.status === 'pending').length;

  const getStatusBadge = (status: Credential['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'expiring':
        return <Badge variant="warning">Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="error">Expired</Badge>;
      case 'pending':
        return <Badge variant="info">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: Credential['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={20} className="text-success" />;
      case 'expiring':
        return <AlertTriangle size={20} className="text-warning" />;
      case 'expired':
        return <AlertTriangle size={20} className="text-error" />;
      case 'pending':
        return <Clock size={20} className="text-info" />;
    }
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader
          kicker="Crew Portal"
          title="My Credentials"
          description="View and manage your certifications, licenses, and training records"
          colorScheme="on-dark"
        />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active"
            value={activeCount.toString()}
            icon={<CheckCircle size={20} />}
            inverted
          />
          <StatCard
            label="Expiring Soon"
            value={expiringCount.toString()}
            icon={<AlertTriangle size={20} />}
            inverted
          />
          <StatCard
            label="Expired"
            value={expiredCount.toString()}
            icon={<AlertTriangle size={20} />}
            inverted
          />
          <StatCard
            label="Pending"
            value={pendingCount.toString()}
            icon={<Clock size={20} />}
            inverted
          />
        </Grid>

        <Stack gap={4}>
          {credentials.map(credential => (
            <Card key={credential.id} inverted>
              <CardBody>
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <Stack className="flex h-12 w-12 items-center justify-center rounded-card bg-ink-800">
                      {getStatusIcon(credential.status)}
                    </Stack>
                    <Stack gap={1}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <H3 className="text-white">{credential.name}</H3>
                        {getStatusBadge(credential.status)}
                      </Stack>
                      <Stack direction="horizontal" gap={4}>
                        <Body className="text-on-dark-muted">
                          {credential.type} - {credential.issuer}
                        </Body>
                      </Stack>
                    </Stack>
                  </Stack>

                  <Stack direction="horizontal" gap={6} className="items-center">
                    <Stack gap={0} className="text-right">
                      <Body size="sm" className=" text-on-dark-muted">Issued</Body>
                      <Body className="text-white">
                        {new Date(credential.issueDate).toLocaleDateString()}
                      </Body>
                    </Stack>
                    <Stack gap={0} className="text-right">
                      <Body size="sm" className=" text-on-dark-muted">Expires</Body>
                      <Body className={credential.status === 'expired' ? 'text-error' : 'text-white'}>
                        {new Date(credential.expiryDate).toLocaleDateString()}
                      </Body>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      {credential.documentUrl && (
                        <Button variant="ghost" size="sm">
                          <Download size={16} />
                        </Button>
                      )}
                      {(credential.status === 'expired' || credential.status === 'expiring') && (
                        <Button variant="outline" size="sm">
                          <RefreshCw size={16} className="mr-1" />
                          Renew
                        </Button>
                      )}
                    </Stack>
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
