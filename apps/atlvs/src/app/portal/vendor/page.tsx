'use client';

import { useState } from 'react';
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
  DollarSign,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Building2,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { DEMO_VENDOR_CONTRACTS, type DemoVendorContract } from '../../../lib/demo-data';

export default function VendorPortalPage() {
  const [contracts] = useState<DemoVendorContract[]>(DEMO_VENDOR_CONTRACTS);

  const activeValue = contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0);
  const pendingValue = contracts.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.value, 0);
  const completedValue = contracts.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.value, 0);

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Vendor Portal" title="My Dashboard" description="Manage contracts, invoices, and payments" colorScheme="on-dark" />

        <Grid cols={4} gap={4}>
          <StatCard label="Active Contracts" value={contracts.filter(c => c.status === 'active').length.toString()} icon={<FileText size={20} />} inverted />
          <StatCard label="Active Value" value={`$${(activeValue / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Pending" value={`$${(pendingValue / 1000).toFixed(0)}K`} icon={<Clock size={20} />} inverted />
          <StatCard label="Paid YTD" value={`$${(completedValue / 1000).toFixed(0)}K`} icon={<CheckCircle size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6}>
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">My Contracts</H3>
                <Stack gap={3}>
                  {contracts.map(contract => (
                    <Stack key={contract.id} direction="horizontal" className="items-center justify-between rounded border-2 border-ink-700 p-4">
                      <Stack gap={1}>
                        <Body className="font-weight-semibold text-white">{contract.production}</Body>
                        <Body size="sm" className=" text-on-dark-muted">{contract.service}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Stack gap={0} className="text-right">
                          <Body className="font-weight-semibold text-white">${contract.value.toLocaleString()}</Body>
                          <Body size="sm" className=" text-on-dark-muted">Due: {contract.dueDate}</Body>
                        </Stack>
                        <Badge variant={contract.status === 'active' ? 'success' : contract.status === 'pending' ? 'warning' : 'info'}>
                          {contract.status}
                        </Badge>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Stack gap={6}>
            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Company Documents</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Building2 size={16} />
                        <Body className="text-white">W-9 Form</Body>
                      </Stack>
                      <Badge variant="success">Current</Badge>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">Certificate of Insurance</Body>
                      </Stack>
                      <Badge variant="warning">Expires Soon</Badge>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">Business License</Body>
                      </Stack>
                      <Badge variant="success">Current</Badge>
                    </Stack>
                  </Stack>
                  <Button variant="outline" size="sm"><Upload size={14} className="mr-2" />Upload Document</Button>
                </Stack>
              </CardBody>
            </Card>

            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Invoices</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">INV-2024-089</Body>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Body className="text-white">$28,000</Body>
                        <Badge variant="success">Paid</Badge>
                      </Stack>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">INV-2024-102</Body>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Body className="text-white">$45,000</Body>
                        <Badge variant="warning">Pending</Badge>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Button variant="outline" size="sm"><Download size={14} className="mr-2" />Download All</Button>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </AtlvsAppLayout>
  );
}
