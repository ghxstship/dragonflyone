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
} from '@ghxstship/ui';
import {
  FileCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { log } from '@ghxstship/config';

interface Permit {
  id: string;
  type: string;
  issuingAuthority: string;
  permitNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'approved' | 'pending' | 'expired' | 'rejected';
  notes?: string;
}

const MOCK_PERMITS: Permit[] = [
  { id: '1', type: 'Special Event Permit', issuingAuthority: 'City of Los Angeles', permitNumber: 'SEP-2024-4521', issueDate: '2024-10-15', expiryDate: '2024-12-31', status: 'approved' },
  { id: '2', type: 'Fire Safety Permit', issuingAuthority: 'LA Fire Department', permitNumber: 'FSP-2024-892', issueDate: '2024-10-20', expiryDate: '2024-12-31', status: 'approved' },
  { id: '3', type: 'Noise Variance', issuingAuthority: 'City of Los Angeles', permitNumber: 'NV-2024-156', issueDate: '2024-10-25', expiryDate: '2024-12-31', status: 'pending', notes: 'Awaiting final approval' },
  { id: '4', type: 'Temporary Structure', issuingAuthority: 'Building & Safety', permitNumber: 'TS-2024-3341', issueDate: '2024-11-01', expiryDate: '2024-12-31', status: 'approved' },
];

export default function ProductionPermitsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [permits, setPermits] = useState<Permit[]>(MOCK_PERMITS);

  const fetchPermits = useCallback(async () => {
    if (!productionId) return;
    try {
      const response = await fetch(`/api/productions/${productionId}/permits`);
      if (response.ok) {
        const data = await response.json();
        if (data.permits && data.permits.length > 0) {
          setPermits(data.permits);
        }
      }
    } catch (error) {
      log.error('Failed to fetch permits:', error instanceof Error ? error : undefined);
    }
  }, [productionId]);

  useEffect(() => {
    fetchPermits();
  }, [fetchPermits]);

  const approvedCount = permits.filter(p => p.status === 'approved').length;
  const pendingCount = permits.filter(p => p.status === 'pending').length;

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Production" title="Permits & Licenses" description="Track required permits and approvals" colorScheme="on-dark" />
          <Button variant="solid"><Plus size={16} className="mr-2" />Add Permit</Button>
        </Stack>

        <Grid cols={4} gap={4}>
          <StatCard label="Total Permits" value={permits.length.toString()} icon={<FileCheck size={20} />} inverted />
          <StatCard label="Approved" value={approvedCount.toString()} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="Pending" value={pendingCount.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Compliance" value={`${Math.round((approvedCount / permits.length) * 100)}%`} icon={<CheckCircle size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6}>
          {permits.map(permit => (
            <Card key={permit.id} variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <H3 className="text-white">{permit.type}</H3>
                    <Badge variant={permit.status === 'approved' ? 'success' : permit.status === 'pending' ? 'warning' : 'error'}>
                      {permit.status}
                    </Badge>
                  </Stack>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">Authority</Body>
                      <Body className="text-white">{permit.issuingAuthority}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">Permit #</Body>
                      <Body className="font-weight-semibold text-white">{permit.permitNumber}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">Valid</Body>
                      <Body className="text-body-sm text-white">
                        <Calendar size={12} className="mr-1 inline" />
                        {permit.issueDate} - {permit.expiryDate}
                      </Body>
                    </Stack>
                    {permit.notes && (
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <AlertTriangle size={14} className="text-warning" />
                        <Body className="text-body-sm text-warning">{permit.notes}</Body>
                      </Stack>
                    )}
                  </Stack>
                  <Button variant="outline" size="sm">
                    <ExternalLink size={14} className="mr-2" />View Document
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Stack>
    </AtlvsAppLayout>
  );
}
