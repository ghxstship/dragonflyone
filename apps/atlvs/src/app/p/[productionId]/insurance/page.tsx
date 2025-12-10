'use client';

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
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Plus,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useProductionInsuranceData } from '@/hooks/useProductionInsurance';

export default function ProductionInsurancePage() {
  const params = useParams();
  const productionId = params?.productionId as string;

  const {
    policies,
    totalCoverage,
    totalPremium,
    activeCount,
  } = useProductionInsuranceData(productionId);

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Production" title="Insurance" description="Manage production insurance policies" colorScheme="on-dark" />
          <Button variant="solid"><Plus size={16} className="mr-2" />Add Policy</Button>
        </Stack>

        <Grid cols={4} gap={4}>
          <StatCard label="Total Coverage" value={`$${(totalCoverage / 1000000).toFixed(1)}M`} icon={<Shield size={20} />} inverted />
          <StatCard label="Total Premium" value={`$${totalPremium.toLocaleString()}`} icon={<FileText size={20} />} inverted />
          <StatCard label="Active Policies" value={activeCount.toString()} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="Pending" value={policies.filter(p => p.status === 'pending').length.toString()} icon={<AlertTriangle size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6}>
          {policies.map(policy => (
            <Card key={policy.id} variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <H3 className="text-white">{policy.type}</H3>
                    <Badge variant={policy.status === 'active' ? 'success' : policy.status === 'pending' ? 'warning' : 'error'}>
                      {policy.status}
                    </Badge>
                  </Stack>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">Provider</Body>
                      <Body className="text-white">{policy.provider}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">Policy #</Body>
                      <Body className="text-white">{policy.policyNumber}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">Coverage</Body>
                      <Body className="font-weight-semibold text-white">${policy.coverage.toLocaleString()}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">Premium</Body>
                      <Body className="text-white">${policy.premium.toLocaleString()}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">Period</Body>
                      <Body className="text-body-sm text-white">
                        <Calendar size={12} className="mr-1 inline" />
                        {policy.startDate} - {policy.endDate}
                      </Body>
                    </Stack>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Stack>
    </AtlvsAppLayout>
  );
}
