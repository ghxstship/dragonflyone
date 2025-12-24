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
  Skeleton,
} from '@ghxstship/ui';
import {
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useVendorContracts, type VendorContract } from '@ghxstship/config';
import { DEMO_VENDOR_CONTRACTS, type DemoVendorContract } from '../../../lib/demo-data';

export default function VendorPortalPage() {
  const { contracts: apiContracts, isLoading, error, refetch } = useVendorContracts();

  // Map API contracts to display format or fall back to demo data
  const contracts: DemoVendorContract[] = apiContracts.length > 0
    ? apiContracts.map((c: VendorContract) => ({
        id: c.id,
        vendor_name: c.vendor?.name || c.name,
        contract_type: (c.contract_type === 'master_service' ? 'master' : c.contract_type === 'nda' ? 'nda' : 'project') as 'master' | 'project' | 'retainer' | 'nda',
        status: (c.status === 'active' ? 'active' : c.status === 'pending' ? 'pending' : 'expired') as 'active' | 'pending' | 'expired',
        start_date: c.start_date,
        end_date: c.end_date,
        value: c.value || 0,
        auto_renew: c.auto_renew,
      }))
    : DEMO_VENDOR_CONTRACTS;

  const activeValue = contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0);
  const pendingValue = contracts.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.value, 0);
  const expiredValue = contracts.filter(c => c.status === 'expired').reduce((sum, c) => sum + c.value, 0);

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Vendor Portal" title="My Dashboard" description="Manage contracts, invoices, and payments" colorScheme="on-dark" />
          <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} inverted className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </Card>
            ))}
          </Grid>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  if (error) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Vendor Portal" title="My Dashboard" description="Manage contracts, invoices, and payments" colorScheme="on-dark" />
          <Card inverted className="p-8 text-center">
            <Stack gap={4} className="items-center">
              <AlertCircle size={48} className="text-error" />
              <H3 className="text-white">Failed to Load Contracts</H3>
              <Body className="text-grey-300">{error.message}</Body>
              <Button variant="solid" onClick={() => refetch()}>
                Try Again
              </Button>
            </Stack>
          </Card>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Vendor Portal" title="My Dashboard" description="Manage contracts, invoices, and payments" colorScheme="on-dark" />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active Contracts" value={contracts.filter(c => c.status === 'active').length.toString()} icon={<FileText size={20} />} inverted />
          <StatCard label="Active Value" value={`$${(activeValue / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Pending" value={`$${(pendingValue / 1000).toFixed(0)}K`} icon={<Clock size={20} />} inverted />
          <StatCard label="Expired" value={`$${(expiredValue / 1000).toFixed(0)}K`} icon={<CheckCircle size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">My Contracts</H3>
                <Stack gap={3}>
                  {contracts.map(contract => (
                    <Stack key={contract.id} direction="horizontal" className="items-center justify-between rounded border-2 border-ink-700 p-4">
                      <Stack gap={1}>
                        <Body className="font-weight-semibold text-white">{contract.vendor_name}</Body>
                        <Body size="sm" className=" text-on-dark-muted">{contract.contract_type}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Stack gap={0} className="text-right">
                          <Body className="font-weight-semibold text-white">${contract.value.toLocaleString()}</Body>
                          <Body size="sm" className=" text-on-dark-muted">Ends: {contract.end_date}</Body>
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
