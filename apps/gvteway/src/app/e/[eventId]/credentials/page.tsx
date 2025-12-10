'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { log } from '@ghxstship/config';

interface Credential {
  id: string;
  name: string;
  role: string;
  type: 'all-access' | 'backstage' | 'vip' | 'media' | 'staff';
  status: 'active' | 'checked-in' | 'expired';
  issuedAt: string;
  lastScan?: string;
}

const MOCK_CREDENTIALS: Credential[] = [
  { id: 'CRED-001', name: 'John Smith', role: 'Production Manager', type: 'all-access', status: 'checked-in', issuedAt: '2024-11-15', lastScan: '18:30' },
  { id: 'CRED-002', name: 'Jane Doe', role: 'Artist Manager', type: 'backstage', status: 'active', issuedAt: '2024-11-15' },
  { id: 'CRED-003', name: 'Bob Wilson', role: 'Photographer', type: 'media', status: 'checked-in', issuedAt: '2024-11-16', lastScan: '17:45' },
  { id: 'CRED-004', name: 'Sarah Chen', role: 'VIP Guest', type: 'vip', status: 'active', issuedAt: '2024-11-16' },
  { id: 'CRED-005', name: 'Mike Johnson', role: 'Security', type: 'staff', status: 'checked-in', issuedAt: '2024-11-14', lastScan: '16:00' },
];

export default function EventCredentialsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [credentials, setCredentials] = useState<Credential[]>(MOCK_CREDENTIALS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCredentials = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/credentials`);
      if (response.ok) {
        const data = await response.json();
        if (data.credentials && data.credentials.length > 0) {
          setCredentials(data.credentials);
        }
      }
    } catch (error) {
      log.error('Failed to fetch credentials:', error instanceof Error ? error : undefined);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const activeCount = credentials.filter(c => c.status === 'active').length;
  const checkedInCount = credentials.filter(c => c.status === 'checked-in').length;

  const filteredCredentials = credentials.filter(c =>
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
                {filteredCredentials.map(cred => (
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
