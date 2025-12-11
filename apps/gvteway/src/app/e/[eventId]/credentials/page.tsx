'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
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
  Spinner,
  Input,
} from '@ghxstship/ui';
import {
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  User,
  Scan,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../../../components/app-layout';
import { useEventCredentialsData, type Credential } from '@/hooks/useEventOperations';

export default function EventCredentialsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [searchQuery, setSearchQuery] = useState('');

  const { credentials, isLoading: loading } = useEventCredentialsData(eventId);

  const activeCount = credentials.filter((c: Credential) => c.status === 'active').length;
  const checkedInCount = credentials.filter((c: Credential) => c.status === 'checked-in').length;

  const filteredCredentials = credentials.filter((c: Credential) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadge = (type: Credential['type']) => {
    const variants: Record<string, 'error' | 'warning' | 'info' | 'success' | 'solid'> = {
      'all-access': 'error', backstage: 'warning', vip: 'info', media: 'success', staff: 'solid'
    };
    return <Badge variant={variants[type]}>{type.replace('-', ' ').toUpperCase()}</Badge>;
  };

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Event" title="Credentials" description="Manage event credentials and access" colorScheme="on-dark" />

        <Grid cols={4} gap={4}>
          <StatCard label="Total Credentials" value={credentials.length.toString()} icon={<CreditCard size={20} />} inverted />
          <StatCard label="Active" value={activeCount.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Checked In" value={checkedInCount.toString()} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="Scan Rate" value={`${Math.round((checkedInCount / credentials.length) * 100)}%`} icon={<Scan size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">All Credentials</H3>
                <Stack direction="horizontal" gap={2}>
                  <Input placeholder="Search by name or role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <Button variant="outline"><Search size={16} /></Button>
                </Stack>
              </Stack>
              {loading ? (
                <Stack className="items-center py-12">
                  <Spinner variant="grey" size="lg" />
                </Stack>
              ) : (
              <Grid cols={2} gap={4}>
                {filteredCredentials.map((cred: Credential) => (
                  <Card key={cred.id} variant="elevated" inverted>
                    <CardBody>
                      <Stack gap={3}>
                        <Stack direction="horizontal" className="items-center justify-between">
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <User size={20} />
                            <H3 className="text-white">{cred.name}</H3>
                          </Stack>
                          {getTypeBadge(cred.type)}
                        </Stack>
                        <Stack gap={2}>
                          <Stack direction="horizontal" className="justify-between">
                            <Body className="text-on-dark-muted">Role</Body>
                            <Body className="text-white">{cred.role}</Body>
                          </Stack>
                          <Stack direction="horizontal" className="justify-between">
                            <Body className="text-on-dark-muted">ID</Body>
                            <Body className="font-weight-semibold text-white">{cred.id}</Body>
                          </Stack>
                          <Stack direction="horizontal" className="justify-between">
                            <Body className="text-on-dark-muted">Status</Body>
                            <Badge variant={cred.status === 'checked-in' ? 'success' : cred.status === 'active' ? 'info' : 'error'}>
                              {cred.status}
                            </Badge>
                          </Stack>
                          {cred.lastScan && (
                            <Stack direction="horizontal" className="justify-between">
                              <Body className="text-on-dark-muted">Last Scan</Body>
                              <Body className="text-white">{cred.lastScan}</Body>
                            </Stack>
                          )}
                        </Stack>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
              )}
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </GvtewayAppLayout>
  );
}
